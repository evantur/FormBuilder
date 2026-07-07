package repository

import (
	"product0/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FormRepository handles form data operations
type FormRepository struct {
	db *gorm.DB
}

// NewFormRepository creates a new FormRepository
func NewFormRepository(db *gorm.DB) *FormRepository {
	return &FormRepository{db: db}
}

// Create creates a new form
func (r *FormRepository) Create(form *domain.Form) error {
	return r.db.Create(form).Error
}

// GetByID retrieves a form by ID with tenant scoping
func (r *FormRepository) GetByID(tenantID, formID uuid.UUID) (*domain.Form, error) {
	var form domain.Form
	if err := r.db.First(&form, "id = ? AND tenant_id = ?", formID, tenantID).Error; err != nil {
		return nil, err
	}
	return &form, nil
}

// ListByTenant retrieves all non-archived forms for a tenant
func (r *FormRepository) ListByTenant(tenantID uuid.UUID) ([]domain.Form, error) {
	var forms []domain.Form
	if err := r.db.Where("tenant_id = ? AND is_archived = ?", tenantID, false).Find(&forms).Error; err != nil {
		return nil, err
	}
	return forms, nil
}

// ListArchivedByTenant retrieves all archived forms for a tenant
func (r *FormRepository) ListArchivedByTenant(tenantID uuid.UUID) ([]domain.Form, error) {
	var forms []domain.Form
	if err := r.db.Where("tenant_id = ? AND is_archived = ?", tenantID, true).Find(&forms).Error; err != nil {
		return nil, err
	}
	return forms, nil
}

// ListPublishedByTenant retrieves all published, non-archived forms for a tenant
func (r *FormRepository) ListPublishedByTenant(tenantID uuid.UUID) ([]domain.Form, error) {
	var forms []domain.Form
	if err := r.db.Where("tenant_id = ? AND status = ? AND is_archived = ?", tenantID, domain.FormStatusPublished, false).Find(&forms).Error; err != nil {
		return nil, err
	}
	return forms, nil
}

// Update updates a form
func (r *FormRepository) Update(form *domain.Form) error {
	return r.db.Save(form).Error
}

// Delete deletes a form with tenant scoping
func (r *FormRepository) Delete(tenantID, formID uuid.UUID) error {
	return r.db.Delete(&domain.Form{}, "id = ? AND tenant_id = ?", formID, tenantID).Error
}

// CascadeDelete deletes all submissions for a form then the form itself,
// wrapped in a single transaction so either both succeed or neither does.
func (r *FormRepository) CascadeDelete(tenantID, formID uuid.UUID, submissionRepo *SubmissionRepository) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := submissionRepo.DeleteByForm(tx, tenantID, formID); err != nil {
			return err
		}
		return tx.Delete(&domain.Form{}, "id = ? AND tenant_id = ?", formID, tenantID).Error
	})
}