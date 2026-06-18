package main

import (
	"fmt"
	"log"

	"product0/internal/auth"
	"product0/internal/config"
	"product0/internal/database"
	"product0/internal/handler"
	"product0/internal/repository"
	"product0/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.Server.Mode)

	// Initialize database
	dbConfig := database.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.Name,
		SSLMode:  cfg.Database.SSLMode,
	}

	db, err := database.NewDB(dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("✓ Database migrations completed successfully")

	// Initialize repositories
	tenantRepo := repository.NewTenantRepository(db)
	userRepo := repository.NewUserRepository(db)
	formRepo := repository.NewFormRepository(db)
	submissionRepo := repository.NewSubmissionRepository(db)

	// Initialize services
	tenantSvc := service.NewTenantService(tenantRepo)
	userSvc := service.NewUserService(userRepo)
	formSvc := service.NewFormService(formRepo)
	submissionSvc := service.NewSubmissionService(submissionRepo)

	// Initialize JWT token manager
	tokenMgr := auth.NewTokenManager(cfg.JWT.Secret, cfg.JWT.ExpiryHours)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userSvc, tokenMgr, tenantSvc)
	tenantHandler := handler.NewTenantHandler(tenantSvc)
	formHandler := handler.NewFormHandler(formSvc)
	submissionHandler := handler.NewSubmissionHandler(submissionSvc)

	// Initialize Gin router
	router := gin.Default()

	// Add CORS middleware
	router.Use(corsMiddleware())

	// Health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// Public endpoints (no auth required)
	publicAPI := router.Group("/api")
	{
		publicAPI.POST("/auth/login", authHandler.Login)
	}

	// Protected endpoints (auth required)
	protectedAPI := router.Group("/api")
	protectedAPI.Use(auth.JWTMiddleware(tokenMgr))
	{
		// Tenant endpoints
		protectedAPI.GET("/tenants/me", tenantHandler.GetCurrentTenant)

		// Form endpoints
		protectedAPI.POST("/forms", auth.RequireAnyRole("admin", "form_builder"), formHandler.CreateForm)
		protectedAPI.GET("/forms", formHandler.ListForms)
		protectedAPI.GET("/forms/:id", formHandler.GetForm)
		protectedAPI.PUT("/forms/:id", auth.RequireAnyRole("admin", "form_builder"), formHandler.UpdateForm)
		protectedAPI.DELETE("/forms/:id", auth.RequireAnyRole("admin", "form_builder"), formHandler.DeleteForm)

		// Submission endpoints
		protectedAPI.POST("/forms/:id/submissions", submissionHandler.CreateSubmission)
		protectedAPI.GET("/forms/:id/submissions", auth.RequireAnyRole("admin", "form_builder"), submissionHandler.ListSubmissions)
		protectedAPI.GET("/forms/:id/submissions/:submissionId", auth.RequireAnyRole("admin", "form_builder"), submissionHandler.GetSubmission)
		protectedAPI.DELETE("/forms/:id/submissions/:submissionId", auth.RequireAnyRole("admin", "form_builder"), submissionHandler.DeleteSubmission)
	}

	// Create default tenant if it doesn't exist
	defaultTenantID, err := uuid.Parse(cfg.Tenant.DefaultID)
	if err != nil {
		log.Fatalf("Invalid default tenant ID: %v", err)
	}

	if _, err := tenantSvc.GetTenant(defaultTenantID); err != nil {
		tenant, err := tenantSvc.CreateTenant("Default Tenant", "localhost", defaultTenantID)
		if err != nil {
			log.Fatalf("Failed to create default tenant: %v", err)
		}
		log.Printf("✓ Created default tenant: %v", tenant.ID)
	}

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Starting server on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// corsMiddleware adds CORS headers to responses
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
