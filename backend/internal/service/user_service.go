package service

import (
	"fmt"

	"github.com/evantur/Product_0/backend/internal/domain"
	"github.com/evantur/Product_0/backend/internal/repository"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UserService handles user business logic
type UserService struct {
	userRepo *repository.UserRepository
}

// NewUserService creates a new UserService
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

// CreateUser creates a new user with hashed password
func (s *UserService) CreateUser(tenantID uuid.UUID, email, password, role string) (*domain.User, error) {
	if email == "" {
		return nil, fmt.Errorf("email is required")
	}

	if password == "" {
		return nil, fmt.Errorf("password is required")
	}

	if role == "" {
		role = domain.RoleRespondent
	}

	// Check if user already exists
	existingUser, _ := s.userRepo.GetByEmail(tenantID, email)
	if existingUser != nil {
		return nil, fmt.Errorf("user with this email already exists in the tenant")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &domain.User{
		ID:           uuid.New(),
		TenantID:     tenantID,
		Email:        email,
		PasswordHash: string(hashedPassword),
		Role:         role,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// AuthenticateUser authenticates a user by email and password
func (s *UserService) AuthenticateUser(tenantID uuid.UUID, email, password string) (*domain.User, error) {
	user, err := s.userRepo.GetByEmail(tenantID, email)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid password")
	}

	return user, nil
}

// GetUser retrieves a user by ID
func (s *UserService) GetUser(id uuid.UUID) (*domain.User, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return user, nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(user *domain.User) (*domain.User, error) {
	if err := s.userRepo.Update(user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}
	return user, nil
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(id uuid.UUID) error {
	if err := s.userRepo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}
