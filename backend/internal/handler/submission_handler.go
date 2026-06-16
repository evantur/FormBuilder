package handler

import (
	"encoding/json"
	"net/http"

	"github.com/evantur/Product_0/backend/internal/auth"
	"github.com/evantur/Product_0/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SubmissionHandler handles submission endpoints
type SubmissionHandler struct {
	submissionService *service.SubmissionService
}

// NewSubmissionHandler creates a new SubmissionHandler
func NewSubmissionHandler(submissionService *service.SubmissionService) *SubmissionHandler {
	return &SubmissionHandler{submissionService: submissionService}
}

// SubmissionRequest represents a create submission request
type SubmissionRequest struct {
	Data map[string]interface{} `json:"data" binding:"required"`
}

// SubmissionResponse represents a submission response
type SubmissionResponse struct {
	ID          string                 `json:"id"`
	FormID      string                 `json:"form_id"`
	TenantID    string                 `json:"tenant_id"`
	Data        map[string]interface{} `json:"data"`
	SubmittedAt string                 `json:"submitted_at"`
	SubmittedBy string                 `json:"submitted_by"`
}

// CreateSubmission creates a new form submission
func (h *SubmissionHandler) CreateSubmission(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	userEmail, err := auth.RoleContext(c) // Get user context for email
	if err != nil {
		userEmail = "anonymous"
	}

	formID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid form_id"})
		return
	}

	var req SubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	submission, err := h.submissionService.CreateSubmission(tenantID, formID, req.Data, userEmail)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Unmarshal submission data
	var data map[string]interface{}
	if err := json.Unmarshal(submission.Data, &data); err != nil {
		data = make(map[string]interface{})
	}

	c.JSON(http.StatusCreated, SubmissionResponse{
		ID:          submission.ID.String(),
		FormID:      submission.FormID.String(),
		TenantID:    submission.TenantID.String(),
		Data:        data,
		SubmittedAt: submission.SubmittedAt.String(),
		SubmittedBy: submission.SubmittedBy,
	})
}

// ListSubmissions lists all submissions for a form
func (h *SubmissionHandler) ListSubmissions(c *gin.Context) {
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

	submissions, err := h.submissionService.ListSubmissionsByForm(tenantID, formID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var responses []SubmissionResponse
	for _, submission := range submissions {
		var data map[string]interface{}
		if err := json.Unmarshal(submission.Data, &data); err != nil {
			data = make(map[string]interface{})
		}

		responses = append(responses, SubmissionResponse{
			ID:          submission.ID.String(),
			FormID:      submission.FormID.String(),
			TenantID:    submission.TenantID.String(),
			Data:        data,
			SubmittedAt: submission.SubmittedAt.String(),
			SubmittedBy: submission.SubmittedBy,
		})
	}

	c.JSON(http.StatusOK, responses)
}

// GetSubmission retrieves a single submission
func (h *SubmissionHandler) GetSubmission(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	submissionID, err := uuid.Parse(c.Param("submissionId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid submission_id"})
		return
	}

	submission, err := h.submissionService.GetSubmission(tenantID, submissionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Unmarshal submission data
	var data map[string]interface{}
	if err := json.Unmarshal(submission.Data, &data); err != nil {
		data = make(map[string]interface{})
	}

	c.JSON(http.StatusOK, SubmissionResponse{
		ID:          submission.ID.String(),
		FormID:      submission.FormID.String(),
		TenantID:    submission.TenantID.String(),
		Data:        data,
		SubmittedAt: submission.SubmittedAt.String(),
		SubmittedBy: submission.SubmittedBy,
	})
}

// DeleteSubmission deletes a submission
func (h *SubmissionHandler) DeleteSubmission(c *gin.Context) {
	tenantID, err := auth.TenantContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	submissionID, err := uuid.Parse(c.Param("submissionId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid submission_id"})
		return
	}

	if err := h.submissionService.DeleteSubmission(tenantID, submissionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
