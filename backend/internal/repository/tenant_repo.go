package repository

import (
	domainpkg "product0/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TenantRepository handles tenant data operations
type TenantRepository struct {
	db *gorm.DB
}

// NewTenantRepository creates a new TenantRepository
func NewTenantRepository(db *gorm.DB) *TenantRepository {
	return &TenantRepository{db: db}
}

// Create creates a new tenant
func (r *TenantRepository) Create(tenant *domainpkg.Tenant) error {
	return r.db.Create(tenant).Error
}

// GetByID retrieves a tenant by ID
func (r *TenantRepository) GetByID(id uuid.UUID) (*domainpkg.Tenant, error) {
	var tenant domainpkg.Tenant
	if err := r.db.First(&tenant, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

// GetByDomain retrieves a tenant by domain
func (r *TenantRepository) GetByDomain(domain string) (*domainpkg.Tenant, error) {
	var tenant domainpkg.Tenant
	if err := r.db.First(&tenant, "domain = ?", domain).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

// Update updates a tenant
func (r *TenantRepository) Update(tenant *domainpkg.Tenant) error {
	return r.db.Save(tenant).Error
}

// List retrieves all tenants
func (r *TenantRepository) List() ([]domainpkg.Tenant, error) {
	var tenants []domainpkg.Tenant
	if err := r.db.Find(&tenants).Error; err != nil {
		return nil, err
	}
	return tenants, nil
}

// Delete deletes a tenant
func (r *TenantRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domainpkg.Tenant{}, "id = ?", id).Error
}
