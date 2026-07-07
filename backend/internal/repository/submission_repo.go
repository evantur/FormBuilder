package repository

import (
	"product0/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SubmissionRepository handles submission data operations
type SubmissionRepository struct {
	db *gorm.DB
}

// NewSubmissionRepository creates a new SubmissionRepository
func NewSubmissionRepository(db *gorm.DB) *SubmissionRepository {
	return &SubmissionRepository{db: db}
}

// Create creates a new submission
func (r *SubmissionRepository) Create(submission *domain.Submission) error {
	return r.db.Create(submission).Error
}

// GetByFormAndUser retrieves a submission by form ID and user
func (r *SubmissionRepository) GetByFormAndUser(tenantID, formID uuid.UUID, submittedBy string) (*domain.Submission, error) {
	var submission domain.Submission
	if err := r.db.Where("tenant_id = ? AND form_id = ? AND submitted_by = ?", tenantID, formID, submittedBy).First(&submission).Error; err != nil {
		return nil, err
	}
	return &submission, nil
}

// GetByID retrieves a submission by ID with tenant scoping
func (r *SubmissionRepository) GetByID(tenantID, submissionID uuid.UUID) (*domain.Submission, error) {
	var submission domain.Submission
	if err := r.db.First(&submission, "id = ? AND tenant_id = ?", submissionID, tenantID).Error; err != nil {
		return nil, err
	}
	return &submission, nil
}

// ListByForm retrieves all submissions for a form with tenant scoping
func (r *SubmissionRepository) ListByForm(tenantID, formID uuid.UUID) ([]domain.Submission, error) {
	var submissions []domain.Submission
	if err := r.db.Where("tenant_id = ? AND form_id = ?", tenantID, formID).Order("submitted_at DESC").Find(&submissions).Error; err != nil {
		return nil, err
	}
	return submissions, nil
}

// ListByTenant retrieves all submissions for a tenant
func (r *SubmissionRepository) ListByTenant(tenantID uuid.UUID) ([]domain.Submission, error) {
	var submissions []domain.Submission
	if err := r.db.Where("tenant_id = ?", tenantID).Order("submitted_at DESC").Find(&submissions).Error; err != nil {
		return nil, err
	}
	return submissions, nil
}

// Delete deletes a submission with tenant scoping
func (r *SubmissionRepository) Delete(tenantID, submissionID uuid.UUID) error {
	return r.db.Delete(&domain.Submission{}, "id = ? AND tenant_id = ?", submissionID, tenantID).Error
}

// DeleteByForm deletes all submissions for a form within a tenant.
// Intended for use inside a transaction for cascade deletes.
func (r *SubmissionRepository) DeleteByForm(tx *gorm.DB, tenantID, formID uuid.UUID) error {
	return tx.Delete(&domain.Submission{}, "tenant_id = ? AND form_id = ?", tenantID, formID).Error
}

// CountByForm counts submissions for a form
func (r *SubmissionRepository) CountByForm(tenantID, formID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.Model(&domain.Submission{}).Where("tenant_id = ? AND form_id = ?", tenantID, formID).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}