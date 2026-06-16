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

// ListByTenant retrieves all forms for a tenant
func (r *FormRepository) ListByTenant(tenantID uuid.UUID) ([]domain.Form, error) {
	var forms []domain.Form
	if err := r.db.Where("tenant_id = ?", tenantID).Find(&forms).Error; err != nil {
		return nil, err
	}
	return forms, nil
}

// ListPublishedByTenant retrieves all published forms for a tenant
func (r *FormRepository) ListPublishedByTenant(tenantID uuid.UUID) ([]domain.Form, error) {
	var forms []domain.Form
	if err := r.db.Where("tenant_id = ? AND status = ?", tenantID, domain.FormStatusPublished).Find(&forms).Error; err != nil {
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
