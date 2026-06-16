package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Tenant represents a school district or organization
type Tenant struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name      string    `gorm:"type:varchar(255);not null"`
	Domain    string    `gorm:"type:varchar(255);uniqueIndex"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `gorm:"type:uuid"`

	// Relations
	Users       []User       `gorm:"foreignKey:TenantID"`
	Forms       []Form       `gorm:"foreignKey:TenantID"`
	Submissions []Submission `gorm:"foreignKey:TenantID"`
}

// TableName specifies the table name for Tenant
func (Tenant) TableName() string {
	return "tenants"
}
