package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/evantur/Product_0/backend/internal/auth"
	"github.com/evantur/Product_0/backend/internal/domain"
	"github.com/evantur/Product_0/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// FormHandler handles form endpoints
type FormHandler struct {
	formService *service.FormService
}

// NewFormHandler creates a new FormHandler
func NewFormHandler(formService *service.FormService) *FormHandler {
	return &FormHandler{formService: formService}
}

// FormRequest represents a create/update form request
type FormRequest struct {
	Title       string                 `json:"title" binding:"required"`
	Description string                 `json:"description"`
	Fields      []domain.FormField     `json:"fields" binding:"required"`
	Status      string                 `json:"status"`
}

// FormResponse represents a form response
type FormResponse struct {
	ID          string                 `json:"id"`
	TenantID    string                 `json:"tenant_id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Fields      []domain.FormField     `json:"fields"`
	Status      string                 `json:"status"`
	CreatedBy   string                 `json:"created_by"`
	CreatedAt   string                 `json:"created_at"`
	UpdatedAt   string                 `json:"updated_at"`
}

// CreateForm creates a new form
func (h *FormHandler) CreateForm(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	userID, err := auth.UserContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var req FormRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	form, err := h.formService.CreateForm(tenantID, userID, req.Title, req.Description, req.Fields)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Unmarshal fields from JSON
	var fields []domain.FormField
	if err := json.Unmarshal(form.Fields, &fields); err != nil {
		fields = []domain.FormField{}
	}

	c.JSON(http.StatusCreated, FormResponse{
		ID:          form.ID.String(),
		TenantID:    form.TenantID.String(),
		Title:       form.Title,
		Description: form.Description,
		Fields:      fields,
		Status:      form.Status,
		CreatedBy:   form.CreatedBy.String(),
		CreatedAt:   form.CreatedAt.String(),
		UpdatedAt:   form.UpdatedAt.String(),
	})
}

// GetForm retrieves a form by ID
func (h *FormHandler) GetForm(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	formID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid form_id"})
		return
	}

	form, err := h.formService.GetForm(tenantID, formID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Unmarshal fields from JSON
	var fields []domain.FormField
	if err := json.Unmarshal(form.Fields, &fields); err != nil {
		fields = []domain.FormField{}
	}

	c.JSON(http.StatusOK, FormResponse{
		ID:          form.ID.String(),
		TenantID:    form.TenantID.String(),
		Title:       form.Title,
		Description: form.Description,
		Fields:      fields,
		Status:      form.Status,
		CreatedBy:   form.CreatedBy.String(),
		CreatedAt:   form.CreatedAt.String(),
		UpdatedAt:   form.UpdatedAt.String(),
	})
}

// ListForms lists all forms for the current tenant
func (h *FormHandler) ListForms(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	forms, err := h.formService.ListForms(tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var responses []FormResponse
	for _, form := range forms {
		var fields []domain.FormField
		if err := json.Unmarshal(form.Fields, &fields); err != nil {
			fields = []domain.FormField{}
		}

		responses = append(responses, FormResponse{
			ID:          form.ID.String(),
			TenantID:    form.TenantID.String(),
			Title:       form.Title,
			Description: form.Description,
			Fields:      fields,
			Status:      form.Status,
			CreatedBy:   form.CreatedBy.String(),
			CreatedAt:   form.CreatedAt.String(),
			UpdatedAt:   form.UpdatedAt.String(),
		})
	}

	c.JSON(http.StatusOK, responses)
}

// UpdateForm updates a form
func (h *FormHandler) UpdateForm(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	formID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid form_id"})
		return
	}

	var req FormRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	form, err := h.formService.UpdateForm(tenantID, formID, req.Title, req.Description, req.Status, req.Fields)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Unmarshal fields from JSON
	var fields []domain.FormField
	if err := json.Unmarshal(form.Fields, &fields); err != nil {
		fields = []domain.FormField{}
	}

	c.JSON(http.StatusOK, FormResponse{
		ID:          form.ID.String(),
		TenantID:    form.TenantID.String(),
		Title:       form.Title,
		Description: form.Description,
		Fields:      fields,
		Status:      form.Status,
		CreatedBy:   form.CreatedBy.String(),
		CreatedAt:   form.CreatedAt.String(),
		UpdatedAt:   form.UpdatedAt.String(),
	})
}

// DeleteForm deletes a form
func (h *FormHandler) DeleteForm(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	formID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid form_id"})
		return
	}

	if err := h.formService.DeleteForm(tenantID, formID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
