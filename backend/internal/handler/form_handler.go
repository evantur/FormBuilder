package handler

import (
	"encoding/json"
	"net/http"

	"product0/internal/auth"
	"product0/internal/domain"
	"product0/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// FormHandler handles form endpoints
type FormHandler struct {
	formService       *service.FormService
	submissionService *service.SubmissionService
}

// NewFormHandler creates a new FormHandler
func NewFormHandler(formService *service.FormService, submissionService *service.SubmissionService) *FormHandler {
	return &FormHandler{
		formService:       formService,
		submissionService: submissionService,
	}
}

// FormRequest represents a create/update form request
type FormRequest struct {
	Title       string             `json:"title" binding:"required"`
	Description string             `json:"description"`
	Fields      []domain.FormField `json:"fields" binding:"required"`
	Status      string             `json:"status"`
}

// FormResponse represents a form response
type FormResponse struct {
	ID              string             `json:"id"`
	TenantID        string             `json:"tenant_id"`
	Title           string             `json:"title"`
	Description     string             `json:"description"`
	Fields          []domain.FormField `json:"fields"`
	Status          string             `json:"status"`
	IsArchived      bool               `json:"is_archived"`
	CreatedBy       string             `json:"created_by"`
	CreatedAt       string             `json:"created_at"`
	UpdatedAt       string             `json:"updated_at"`
	SubmissionCount int64              `json:"submission_count"`
}

func formToResponse(form *domain.Form, count int64) FormResponse {
	var fields []domain.FormField
	if err := json.Unmarshal(form.Fields, &fields); err != nil {
		fields = []domain.FormField{}
	}
	return FormResponse{
		ID:              form.ID.String(),
		TenantID:        form.TenantID.String(),
		Title:           form.Title,
		Description:     form.Description,
		Fields:          fields,
		Status:          form.Status,
		IsArchived:      form.IsArchived,
		CreatedBy:       form.CreatedBy.String(),
		CreatedAt:       form.CreatedAt.String(),
		UpdatedAt:       form.UpdatedAt.String(),
		SubmissionCount: count,
	}
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

	c.JSON(http.StatusCreated, formToResponse(form, 0))
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

	count, _ := h.submissionService.CountSubmissionsByForm(tenantID, formID)
	c.JSON(http.StatusOK, formToResponse(form, count))
}

// ListForms lists all non-archived forms for the current tenant
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

	responses := make([]FormResponse, 0, len(forms))
	for _, form := range forms {
		count, _ := h.submissionService.CountSubmissionsByForm(tenantID, form.ID)
		responses = append(responses, formToResponse(&form, count))
	}
	c.JSON(http.StatusOK, responses)
}

// ListArchivedForms lists all archived forms for the current tenant
func (h *FormHandler) ListArchivedForms(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	forms, err := h.formService.ListArchivedForms(tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	responses := make([]FormResponse, 0, len(forms))
	for _, form := range forms {
		count, _ := h.submissionService.CountSubmissionsByForm(tenantID, form.ID)
		responses = append(responses, formToResponse(&form, count))
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

	// Check archived
	existing, err := h.formService.GetForm(tenantID, formID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	if existing.IsArchived {
		c.JSON(http.StatusConflict, gin.H{"error": "this form is archived and cannot be edited"})
		return
	}

	// Check submissions
	count, err := h.submissionService.CountSubmissionsByForm(tenantID, formID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check submissions"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "this form has submissions and can no longer be edited"})
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

	c.JSON(http.StatusOK, formToResponse(form, 0))
}

// ArchiveForm archives a form
func (h *FormHandler) ArchiveForm(c *gin.Context) {
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

	form, err := h.formService.ArchiveForm(tenantID, formID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	count, _ := h.submissionService.CountSubmissionsByForm(tenantID, formID)
	c.JSON(http.StatusOK, formToResponse(form, count))
}

// UnarchiveForm restores an archived form
func (h *FormHandler) UnarchiveForm(c *gin.Context) {
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

	form, err := h.formService.UnarchiveForm(tenantID, formID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	count, _ := h.submissionService.CountSubmissionsByForm(tenantID, formID)
	c.JSON(http.StatusOK, formToResponse(form, count))
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

	// // Block deletion if archived
	// existing, err := h.formService.GetForm(tenantID, formID)
	// if err != nil {
	// 	c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	// 	return
	// }
	// if existing.IsArchived {
	// 	c.JSON(http.StatusConflict, gin.H{"error": "unarchive this form before deleting it"})
	// 	return
	// }

	// Block deletion if has submissions
	count, err := h.submissionService.CountSubmissionsByForm(tenantID, formID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check submissions"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "this form has submissions and cannot be deleted"})
		return
	}

	if err := h.formService.DeleteForm(tenantID, formID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
