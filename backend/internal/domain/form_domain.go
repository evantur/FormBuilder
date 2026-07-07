package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Form represents a form template
type Form struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index"`
	Title       string         `gorm:"type:varchar(255);not null"`
	Description string         `gorm:"type:text"`
	Fields      datatypes.JSON `gorm:"type:jsonb;not null"`
	Status      string         `gorm:"type:varchar(50);default:draft"` // 'draft', 'published'
	IsArchived  bool           `gorm:"type:boolean;default:false;index"`
	CreatedBy   uuid.UUID      `gorm:"type:uuid;not null"`
	CreatedAt   time.Time      `gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime"`

	// Relations
	Tenant      *Tenant      `gorm:"foreignKey:TenantID"`
	Creator     *User        `gorm:"foreignKey:CreatedBy"`
	Submissions []Submission `gorm:"foreignKey:FormID"`
}

// TableName specifies the table name for Form
func (Form) TableName() string {
	return "forms"
}

// FormStatus constants
const (
	FormStatusDraft     = "draft"
	FormStatusPublished = "published"
)

// FormField represents a single field in a form
type FormField struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"`
	Label       string                 `json:"label"`
	Required    bool                   `json:"required"`
	Placeholder string                 `json:"placeholder"`
	Options     []map[string]string    `json:"options"`
	Order       int                    `json:"order"`
	Validation  map[string]interface{} `json:"validation"`
}