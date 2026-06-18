package database

import (
	"fmt"
	"log"

	"product0/internal/domain"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Config holds database configuration
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// NewDB initializes a new database connection
func NewDB(config Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
		return nil, err
	}

	return db, nil
}

// RunMigrations runs all database migrations
func RunMigrations(db *gorm.DB) error {
	// Auto migrate domain models
	if err := db.AutoMigrate(
		&domain.Tenant{},
		&domain.User{},
		&domain.Form{},
		&domain.Submission{},
	); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create unique constraint for (tenant_id, email) in users table
	if err := db.Exec("ALTER TABLE users ADD CONSTRAINT unique_tenant_email UNIQUE (tenant_id, email)").Error; err != nil {
		// Ignore error if constraint already exists
		log.Println("Note: unique_tenant_email constraint may already exist")
	}

	return nil
}
