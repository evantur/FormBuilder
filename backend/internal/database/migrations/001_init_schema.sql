-- Migration 001: Initial schema setup
-- Creates base tables for the system

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE UNIQUE INDEX idx_users_tenant_email ON users(tenant_id, email);

CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forms_tenant_id ON forms(tenant_id);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES forms(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    data JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    submitted_by VARCHAR(255)
);

CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submissions_tenant_id ON submissions(tenant_id);
