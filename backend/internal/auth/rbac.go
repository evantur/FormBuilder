package auth

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

// RequireRole returns a middleware that checks if the user has the required role
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, err := RoleContext(c)
		if err != nil {
			c.JSON(401, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Check if user's role is in allowed roles
		hasRole := false
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(403, gin.H{"error": fmt.Sprintf("user role '%s' is not allowed for this resource", role)})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAnyRole returns a middleware that checks if the user has any of the allowed roles
func RequireAnyRole(allowedRoles ...string) gin.HandlerFunc {
	return RequireRole(allowedRoles...)
}
