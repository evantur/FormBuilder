package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
	Database struct {
		Host     string
		Port     string
		User     string
		Password string
		Name     string
		SSLMode  string
	}

	Server struct {
		Port string
		Mode string
	}

	JWT struct {
		Secret       string
		ExpiryHours  int
	}

	Tenant struct {
		DefaultID string
	}
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file
	godotenv.Load()

	cfg := &Config{}

	// Database config
	cfg.Database.Host = getEnv("DB_HOST", "localhost")
	cfg.Database.Port = getEnv("DB_PORT", "5432")
	cfg.Database.User = getEnv("DB_USER", "postgres")
	cfg.Database.Password = getEnv("DB_PASSWORD", "postgres")
	cfg.Database.Name = getEnv("DB_NAME", "forms_db")
	cfg.Database.SSLMode = getEnv("DB_SSLMODE", "disable")

	// Server config
	cfg.Server.Port = getEnv("PORT", "8080")
	cfg.Server.Mode = getEnv("GIN_MODE", "debug")

	// JWT config
	cfg.JWT.Secret = getEnv("JWT_SECRET", "your-secret-key-change-this-in-production")
	expiryHours, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRY_HOURS: %w", err)
	}
	cfg.JWT.ExpiryHours = expiryHours

	// Tenant config
	cfg.Tenant.DefaultID = getEnv("DEFAULT_TENANT_ID", "00000000-0000-0000-0000-000000000001")

	return cfg, nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
