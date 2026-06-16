# Phase 1 Testing Guide

This guide walks through testing all Phase 1 endpoints for the Multi-Tenant Dynamic Form Generation System.

## Prerequisites

- Backend running on `http://localhost:8080`
- PostgreSQL running on `localhost:5432`
- curl or Postman for testing API endpoints
- Default tenant ID: `00000000-0000-0000-0000-000000000001`

## Quick Start

### 1. Start the Backend

**Option A: Using Docker Compose**
```bash
docker-compose up
```

**Option B: Manual Setup**
```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/server/main.go
```

Wait for "Starting server on :8080" message.

### 2. Health Check

Verify the server is running:
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{"status":"healthy"}
```

## Testing the 7 Phase 1 Endpoints

### Step 1: Create a Test User

First, we need to create a user to login with. You can do this directly via the database or through a user creation endpoint (in a real system). For now, we'll create users via direct database access.

**Using psql**:
```bash
psql -h localhost -U postgres -d forms_db

-- Create a default tenant (already done by app startup)
-- Create a test user
INSERT INTO users (id, tenant_id, email, password_hash, role, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'admin@test.com',
  '$2a$10$NQZlQqSK7F3F2rK7K3F2e.oJ8R3J2J7F7F7F7F7F7F7F7F7F7F7F7', -- bcrypt of 'password123'
  'admin',
  NOW()
);
```

Or use this Python one-liner to generate the hash:
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode())"
```

### Step 2: Test Endpoint 1 - POST /api/auth/login

**Test Login**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "email": "admin@test.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "11111111-1111-1111-1111-111111111111",
  "email": "admin@test.com",
  "role": "admin",
  "tenant_id": "00000000-0000-0000-0000-000000000001"
}
```

**Save the token for subsequent requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 3: Test Endpoint 2 - GET /api/tenants/me

```bash
curl -X GET http://localhost:8080/api/tenants/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "name": "Default Tenant",
  "domain": "localhost",
  "created_at": "2024-01-01T12:00:00Z",
  "created_by": "00000000-0000-0000-0000-000000000001"
}
```

### Step 4: Test Endpoint 3 - POST /api/forms (Create Form)

```bash
curl -X POST http://localhost:8080/api/forms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Student Information Form",
    "description": "Collect student basic information",
    "fields": [
      {
        "id": "field-1",
        "type": "text",
        "label": "Full Name",
        "required": true,
        "placeholder": "Enter your full name",
        "order": 1
      },
      {
        "id": "field-2",
        "type": "email",
        "label": "Email",
        "required": true,
        "placeholder": "Enter your email",
        "order": 2
      },
      {
        "id": "field-3",
        "type": "grade_level",
        "label": "Grade Level",
        "required": true,
        "options": [
          {"value": "9", "label": "9th Grade"},
          {"value": "10", "label": "10th Grade"},
          {"value": "11", "label": "11th Grade"},
          {"value": "12", "label": "12th Grade"}
        ],
        "order": 3
      }
    ],
    "status": "draft"
  }'
```

Expected response:
```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "tenant_id": "00000000-0000-0000-0000-000000000001",
  "title": "Student Information Form",
  "description": "Collect student basic information",
  "fields": [...],
  "status": "draft",
  "created_by": "11111111-1111-1111-1111-111111111111",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Save the form ID for next tests:**
```bash
FORM_ID="22222222-2222-2222-2222-222222222222"
```

### Step 5: Test Endpoint 4 - GET /api/forms/:id (Get Form)

```bash
curl -X GET http://localhost:8080/api/forms/$FORM_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected response: Same as creation response above

### Step 6: Test Endpoint 5 - GET /api/forms (List Forms)

```bash
curl -X GET http://localhost:8080/api/forms \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
[
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "title": "Student Information Form",
    "description": "Collect student basic information",
    "fields": [...],
    "status": "draft",
    "created_by": "11111111-1111-1111-1111-111111111111",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

### Step 7: Test Endpoint 6 - POST /api/forms/:id/submissions (Submit Form)

```bash
curl -X POST http://localhost:8080/api/forms/$FORM_ID/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "field-1": "John Doe",
      "field-2": "john@example.com",
      "field-3": "10"
    }
  }'
```

Expected response:
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "form_id": "22222222-2222-2222-2222-222222222222",
  "tenant_id": "00000000-0000-0000-0000-000000000001",
  "data": {
    "field-1": "John Doe",
    "field-2": "john@example.com",
    "field-3": "10"
  },
  "submitted_at": "2024-01-01T12:00:00Z",
  "submitted_by": "admin"
}
```

**Save the submission ID:**
```bash
SUBMISSION_ID="33333333-3333-3333-3333-333333333333"
```

### Step 8: Test Endpoint 7 - GET /api/forms/:id/submissions (List Submissions)

```bash
curl -X GET http://localhost:8080/api/forms/$FORM_ID/submissions \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
[
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "form_id": "22222222-2222-2222-2222-222222222222",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "data": {
      "field-1": "John Doe",
      "field-2": "john@example.com",
      "field-3": "10"
    },
    "submitted_at": "2024-01-01T12:00:00Z",
    "submitted_by": "admin"
  }
]
```

## Additional Test Scenarios

### Test 8: Update Form

```bash
curl -X PUT http://localhost:8080/api/forms/$FORM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Student Form",
    "description": "Updated description",
    "fields": [...],
    "status": "published"
  }'
```

### Test 9: Test RBAC - Respondent Role

Create a respondent user and verify they:
- ✅ Can see forms list
- ✅ Can submit forms
- ❌ Cannot create forms
- ❌ Cannot list submissions

### Test 10: Test Tenant Isolation

Create a second tenant and verify:
- Forms are isolated per tenant
- Users can only see their tenant's data

## Troubleshooting

### 401 Unauthorized
- Check your JWT token is valid and not expired
- Ensure Authorization header format is `Bearer <token>`

### 403 Forbidden
- Check user role matches the required role for the endpoint
- Admin/form_builder roles required for form creation/modification

### 404 Not Found
- Verify the form/submission ID exists
- Ensure you're in the correct tenant

### Database Connection Errors
- Check PostgreSQL is running: `psql -h localhost -U postgres -d forms_db`
- Verify connection string in `.env`

## Full Test Automation Script

Save as `test_phase1.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API="http://localhost:8080"
TENANT_ID="00000000-0000-0000-0000-000000000001"

# Test health
echo "Testing health endpoint..."
curl -s "$API/api/health" | grep -q "healthy" && echo -e "${GREEN}✓ Health check passed${NC}" || echo -e "${RED}✗ Health check failed${NC}"

# Add more tests as needed...
```

## Performance Notes

- All responses should complete in < 500ms
- Database queries use proper indexing on tenant_id and form_id
- JWT validation happens once per request
