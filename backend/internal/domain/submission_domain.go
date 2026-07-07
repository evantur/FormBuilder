package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Submission represents a user's form submission
type Submission struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey"`
	FormID     uuid.UUID      `gorm:"type:uuid;not null;index"`
	TenantID   uuid.UUID      `gorm:"type:uuid;not null;index"`
	Data       datatypes.JSON `gorm:"type:jsonb;not null"` // Key-value pairs: field_id -> answer
	SubmittedAt time.Time     `gorm:"autoCreateTime"`
	SubmittedBy string        `gorm:"type:varchar(255)"`   // Email or identifier of submitter

	// Relations
	Form   *Form   `gorm:"foreignKey:FormID"`
	Tenant *Tenant `gorm:"foreignKey:TenantID"`
}

// TableName specifies the table name for Submission
func (Submission) TableName() string {
	return "submissions"
}
