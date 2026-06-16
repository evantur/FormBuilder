package auth

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	// ContextTenantID key for storing tenant ID in context
	ContextTenantID = "tenant_id"
	// ContextUserID key for storing user ID in context
	ContextUserID = "user_id"
	// ContextEmail key for storing email in context
	ContextEmail = "email"
	// ContextRole key for storing role in context
	ContextRole = "role"
)

// JWTMiddleware returns a Gin middleware that validates JWT tokens
func JWTMiddleware(tm *TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>" format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(401, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := tm.ValidateToken(tokenString)
		if err != nil {
			c.JSON(401, gin.H{"error": fmt.Sprintf("invalid token: %v", err)})
			c.Abort()
			return
		}

		// Store claims in context
		c.Set(ContextTenantID, claims.TenantID)
		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextEmail, claims.Email)
		c.Set(ContextRole, claims.Role)

		c.Next()
	}
}

// TenantContext extracts tenant ID from request context
func TenantContext(c *gin.Context) (uuid.UUID, error) {
	tenantID, exists := c.Get(ContextTenantID)
	if !exists {
		return uuid.UUID{}, fmt.Errorf("tenant_id not found in context")
	}

	id, ok := tenantID.(uuid.UUID)
	if !ok {
		return uuid.UUID{}, fmt.Errorf("invalid tenant_id type")
	}

	return id, nil
}

// UserContext extracts user ID from request context
func UserContext(c *gin.Context) (uuid.UUID, error) {
	userID, exists := c.Get(ContextUserID)
	if !exists {
		return uuid.UUID{}, fmt.Errorf("user_id not found in context")
	}

	id, ok := userID.(uuid.UUID)
	if !ok {
		return uuid.UUID{}, fmt.Errorf("invalid user_id type")
	}

	return id, nil
}

// RoleContext extracts role from request context
func RoleContext(c *gin.Context) (string, error) {
	role, exists := c.Get(ContextRole)
	if !exists {
		return "", fmt.Errorf("role not found in context")
	}

	roleStr, ok := role.(string)
	if !ok {
		return "", fmt.Errorf("invalid role type")
	}

	return roleStr, nil
}
