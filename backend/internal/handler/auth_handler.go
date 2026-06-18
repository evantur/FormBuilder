package handler

import (
	"net/http"

	"product0/internal/auth"
	"product0/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	userService *service.UserService
	tokenMgr    *auth.TokenManager
	tenantSvc   *service.TenantService
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(userService *service.UserService, tokenMgr *auth.TokenManager, tenantSvc *service.TenantService) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		tokenMgr:    tokenMgr,
		tenantSvc:   tenantSvc,
	}
}

// LoginRequest represents a login request
type LoginRequest struct {
	TenantID string `json:"tenant_id"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginResponse represents a login response
type LoginResponse struct {
	Token    string `json:"token"`
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	TenantID string `json:"tenant_id"`
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenantIDStr := req.TenantID
	if tenantIDStr == "" {
		tenantIDStr = "00000000-0000-0000-0000-000000000001" // Default tenant ID for now
	}

	// Parse tenant ID
	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant_id"})
		return
	}

	// Authenticate user
	user, err := h.userService.AuthenticateUser(tenantID, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Generate JWT token
	token, err := h.tokenMgr.GenerateToken(user.ID, user.TenantID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:    token,
		UserID:   user.ID.String(),
		Email:    user.Email,
		Role:     user.Role,
		TenantID: user.TenantID.String(),
	})
}
