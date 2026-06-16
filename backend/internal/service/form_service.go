package service

import (
	"encoding/json"
	"fmt"

	"product0/internal/domain"
	"product0/internal/repository"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// FormService handles form business logic
type FormService struct {
	repo *repository.FormRepository
}

// NewFormService creates a new FormService
func NewFormService(repo *repository.FormRepository) *FormService {
	return &FormService{repo: repo}
}

// CreateForm creates a new form
func (s *FormService) CreateForm(tenantID, userID uuid.UUID, title, description string, fields []domain.FormField) (*domain.Form, error) {
	if title == "" {
		return nil, fmt.Errorf("form title is required")
	}

	// Convert fields to JSON
	fieldsJSON, err := convertFieldsToJSON(fields)
	if err != nil {
		return nil, fmt.Errorf("failed to convert fields to JSON: %w", err)
	}

	form := &domain.Form{
		ID:          uuid.New(),
		TenantID:    tenantID,
		Title:       title,
		Description: description,
		Fields:      fieldsJSON,
		Status:      domain.FormStatusDraft,
		CreatedBy:   userID,
	}

	if err := s.repo.Create(form); err != nil {
		return nil, fmt.Errorf("failed to create form: %w", err)
	}

	return form, nil
}

// GetForm retrieves a form by ID
func (s *FormService) GetForm(tenantID, formID uuid.UUID) (*domain.Form, error) {
	form, err := s.repo.GetByID(tenantID, formID)
	if err != nil {
		return nil, fmt.Errorf("form not found: %w", err)
	}
	return form, nil
}

// ListForms lists all forms for a tenant
func (s *FormService) ListForms(tenantID uuid.UUID) ([]domain.Form, error) {
	forms, err := s.repo.ListByTenant(tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list forms: %w", err)
	}
	return forms, nil
}

// ListPublishedForms lists all published forms for a tenant
func (s *FormService) ListPublishedForms(tenantID uuid.UUID) ([]domain.Form, error) {
	forms, err := s.repo.ListPublishedByTenant(tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list published forms: %w", err)
	}
	return forms, nil
}

// UpdateForm updates a form
func (s *FormService) UpdateForm(tenantID, formID uuid.UUID, title, description string, status string, fields []domain.FormField) (*domain.Form, error) {
	form, err := s.repo.GetByID(tenantID, formID)
	if err != nil {
		return nil, fmt.Errorf("form not found: %w", err)
	}

	if title != "" {
		form.Title = title
	}

	if description != "" {
		form.Description = description
	}

	if status != "" && (status == domain.FormStatusDraft || status == domain.FormStatusPublished) {
		form.Status = status
	}

	if len(fields) > 0 {
		fieldsJSON, err := convertFieldsToJSON(fields)
		if err != nil {
			return nil, fmt.Errorf("failed to convert fields to JSON: %w", err)
		}
		form.Fields = fieldsJSON
	}

	if err := s.repo.Update(form); err != nil {
		return nil, fmt.Errorf("failed to update form: %w", err)
	}

	return form, nil
}

// PublishForm publishes a form
func (s *FormService) PublishForm(tenantID, formID uuid.UUID) (*domain.Form, error) {
	form, err := s.repo.GetByID(tenantID, formID)
	if err != nil {
		return nil, fmt.Errorf("form not found: %w", err)
	}

	form.Status = domain.FormStatusPublished

	if err := s.repo.Update(form); err != nil {
		return nil, fmt.Errorf("failed to publish form: %w", err)
	}

	return form, nil
}

// DeleteForm deletes a form
func (s *FormService) DeleteForm(tenantID, formID uuid.UUID) error {
	if err := s.repo.Delete(tenantID, formID); err != nil {
		return fmt.Errorf("failed to delete form: %w", err)
	}
	return nil
}

// Helper function to convert FormField slice to JSON
func convertFieldsToJSON(fields []domain.FormField) (datatypes.JSON, error) {
	// For now, we'll marshal the fields as-is
	// In a production system, you might want additional validation here
	if len(fields) == 0 {
		return datatypes.JSON("[]"), nil
	}

	// Marshal fields to JSON
	data, err := json.Marshal(fields)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal fields: %w", err)
	}

	return datatypes.JSON(data), nil
}
