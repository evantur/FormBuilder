package service

import (
	"fmt"

	domainpkg "product0/internal/domain"
	"product0/internal/repository"

	"github.com/google/uuid"
)

// TenantService handles tenant business logic
type TenantService struct {
	repo *repository.TenantRepository
}

// NewTenantService creates a new TenantService
func NewTenantService(repo *repository.TenantRepository) *TenantService {
	return &TenantService{repo: repo}
}

// CreateTenant creates a new tenant
func (s *TenantService) CreateTenant(name, domain string, createdBy uuid.UUID) (*domainpkg.Tenant, error) {
	if name == "" {
		return nil, fmt.Errorf("tenant name is required")
	}

	tenant := &domainpkg.Tenant{
		ID:        uuid.New(),
		Name:      name,
		Domain:    domain,
		CreatedBy: createdBy,
	}

	if err := s.repo.Create(tenant); err != nil {
		return nil, fmt.Errorf("failed to create tenant: %w", err)
	}

	return tenant, nil
}

// GetTenant retrieves a tenant by ID
func (s *TenantService) GetTenant(id uuid.UUID) (*domainpkg.Tenant, error) {
	tenant, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}
	return tenant, nil
}

// GetTenantByDomain retrieves a tenant by domain
func (s *TenantService) GetTenantByDomain(domain string) (*domainpkg.Tenant, error) {
	tenant, err := s.repo.GetByDomain(domain)
	if err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}
	return tenant, nil
}

// ListTenants lists all tenants
func (s *TenantService) ListTenants() ([]domainpkg.Tenant, error) {
	tenants, err := s.repo.List()
	if err != nil {
		return nil, fmt.Errorf("failed to list tenants: %w", err)
	}
	return tenants, nil
}

// UpdateTenant updates a tenant
func (s *TenantService) UpdateTenant(tenant *domainpkg.Tenant) (*domainpkg.Tenant, error) {
	if err := s.repo.Update(tenant); err != nil {
		return nil, fmt.Errorf("failed to update tenant: %w", err)
	}
	return tenant, nil
}

// DeleteTenant deletes a tenant
func (s *TenantService) DeleteTenant(id uuid.UUID) error {
	if err := s.repo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete tenant: %w", err)
	}
	return nil
}
