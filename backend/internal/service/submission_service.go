package service

import (
	"encoding/json"
	"fmt"

	"github.com/evantur/Product_0/backend/internal/domain"
	"github.com/evantur/Product_0/backend/internal/repository"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// SubmissionService handles submission business logic
type SubmissionService struct {
	repo *repository.SubmissionRepository
}

// NewSubmissionService creates a new SubmissionService
func NewSubmissionService(repo *repository.SubmissionRepository) *SubmissionService {
	return &SubmissionService{repo: repo}
}

// CreateSubmission creates a new form submission
func (s *SubmissionService) CreateSubmission(tenantID, formID uuid.UUID, data map[string]interface{}, submittedBy string) (*domain.Submission, error) {
	if tenantID == uuid.Nil {
		return nil, fmt.Errorf("tenant ID is required")
	}

	if formID == uuid.Nil {
		return nil, fmt.Errorf("form ID is required")
	}

	// Convert data map to JSON
	dataJSON, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal submission data: %w", err)
	}

	submission := &domain.Submission{
		ID:          uuid.New(),
		FormID:      formID,
		TenantID:    tenantID,
		Data:        datatypes.JSON(dataJSON),
		SubmittedBy: submittedBy,
	}

	if err := s.repo.Create(submission); err != nil {
		return nil, fmt.Errorf("failed to create submission: %w", err)
	}

	return submission, nil
}

// GetSubmission retrieves a submission by ID
func (s *SubmissionService) GetSubmission(tenantID, submissionID uuid.UUID) (*domain.Submission, error) {
	submission, err := s.repo.GetByID(tenantID, submissionID)
	if err != nil {
		return nil, fmt.Errorf("submission not found: %w", err)
	}
	return submission, nil
}

// ListSubmissionsByForm lists all submissions for a form
func (s *SubmissionService) ListSubmissionsByForm(tenantID, formID uuid.UUID) ([]domain.Submission, error) {
	submissions, err := s.repo.ListByForm(tenantID, formID)
	if err != nil {
		return nil, fmt.Errorf("failed to list submissions: %w", err)
	}
	return submissions, nil
}

// ListSubmissionsByTenant lists all submissions for a tenant
func (s *SubmissionService) ListSubmissionsByTenant(tenantID uuid.UUID) ([]domain.Submission, error) {
	submissions, err := s.repo.ListByTenant(tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list submissions: %w", err)
	}
	return submissions, nil
}

// DeleteSubmission deletes a submission
func (s *SubmissionService) DeleteSubmission(tenantID, submissionID uuid.UUID) error {
	if err := s.repo.Delete(tenantID, submissionID); err != nil {
		return fmt.Errorf("failed to delete submission: %w", err)
	}
	return nil
}

// GetSubmissionCount returns the count of submissions for a form
func (s *SubmissionService) GetSubmissionCount(tenantID, formID uuid.UUID) (int64, error) {
	count, err := s.repo.CountByForm(tenantID, formID)
	if err != nil {
		return 0, fmt.Errorf("failed to get submission count: %w", err)
	}
	return count, nil
}
