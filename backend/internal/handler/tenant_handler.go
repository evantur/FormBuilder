package handler

import (
	"fmt"
	"net/http"

	"github.com/evantur/Product_0/backend/internal/auth"
	"github.com/evantur/Product_0/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TenantHandler handles tenant endpoints
type TenantHandler struct {
	tenantService *service.TenantService
}

// NewTenantHandler creates a new TenantHandler
func NewTenantHandler(tenantService *service.TenantService) *TenantHandler {
	return &TenantHandler{tenantService: tenantService}
}

// TenantResponse represents a tenant response
type TenantResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Domain    string `json:"domain"`
	CreatedAt string `json:"created_at"`
	CreatedBy string `json:"created_by"`
}

// GetCurrentTenant returns the current user's tenant
func (h *TenantHandler) GetCurrentTenant(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	tenant, err := h.tenantService.GetTenant(tenantID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	createdBy := ""
	if tenant.CreatedBy != uuid.Nil {
		createdBy = tenant.CreatedBy.String()
	}

	c.JSON(http.StatusOK, TenantResponse{
		ID:        tenant.ID.String(),
		Name:      tenant.Name,
		Domain:    tenant.Domain,
		CreatedAt: tenant.CreatedAt.String(),
		CreatedBy: createdBy,
	})
}
