package repository

import (
	"product0/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRepository handles user data operations
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new UserRepository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id uuid.UUID) (*domain.User, error) {
	var user domain.User
	if err := r.db.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail retrieves a user by email within a tenant
func (r *UserRepository) GetByEmail(tenantID uuid.UUID, email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.First(&user, "tenant_id = ? AND email = ?", tenantID, email).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByTenant retrieves all users for a tenant
func (r *UserRepository) GetByTenant(tenantID uuid.UUID) ([]domain.User, error) {
	var users []domain.User
	if err := r.db.Where("tenant_id = ?", tenantID).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// Update updates a user
func (r *UserRepository) Update(user *domain.User) error {
	return r.db.Save(user).Error
}

// Delete deletes a user
func (r *UserRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.User{}, "id = ?", id).Error
}
