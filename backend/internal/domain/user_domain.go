package domain

import (
	"time"

	"github.com/google/uuid"
)

// User represents a system user
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	TenantID     uuid.UUID `gorm:"type:uuid;not null;index"`
	Email        string    `gorm:"type:varchar(255);not null"`
	PasswordHash string    `gorm:"type:varchar(255);not null"`
	Role         string    `gorm:"type:varchar(50);not null"` // 'admin', 'form_builder', 'respondent'
	CreatedAt    time.Time `gorm:"autoCreateTime"`

	// Relations
	Tenant *Tenant `gorm:"foreignKey:TenantID"`

	// Composite unique index on tenant_id and email
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}

// UserRole constants
const (
	RoleAdmin       = "admin"
	RoleFormBuilder = "form_builder"
	RoleRespondent  = "respondent"
)
