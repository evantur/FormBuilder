# Multi-Tenant Dynamic Form Generation System

## Project Overview

A full-stack system for creating, managing, and submitting dynamic forms. Designed for school districts with:
- Backend: Go/Gin API with PostgreSQL
- Frontend: React/TypeScript
- Multi-tenant support with JWT-based RBAC
- Form exports (JSON, PDF, CSV)

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose

### Quick Start with Docker

1. **Start the entire stack**:
```bash
docker-compose up
```

This will start:
- PostgreSQL on port 5432
- Go backend on port 8080

### Manual Setup

#### Backend
```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/server/main.go
```

Backend will run on `http://localhost:8080`

#### Frontend (Phase 2)
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Architecture

### Backend Structure
- **Domain Layer**: Core business entities (Tenant, User, Form, Submission)
- **Repository Layer**: Data access with tenant isolation
- **Service Layer**: Business logic and validation
- **Handler Layer**: HTTP request handling
- **Auth Layer**: JWT tokens and role-based access control

### Key Features (Phase 1)
✅ User authentication with JWT tokens
✅ Tenant isolation at the database level
✅ Form CRUD operations
✅ Form submission tracking
✅ Role-based access control (admin, form_builder, respondent)
✅ PostgreSQL with JSONB for flexible form schemas

## API Endpoints (Phase 1)

### Authentication
- `POST /api/auth/login` - Login and get JWT token

### Tenants
- `GET /api/tenants/me` - Get current tenant info

### Forms
- `POST /api/forms` - Create form (admin/form_builder only)
- `GET /api/forms` - List forms for tenant
- `GET /api/forms/:id` - Get form details
- `PUT /api/forms/:id` - Update form (admin/form_builder only)
- `DELETE /api/forms/:id` - Delete form (admin/form_builder only)

### Submissions
- `POST /api/forms/:id/submissions` - Submit form response
- `GET /api/forms/:id/submissions` - List submissions (admin/form_builder only)
- `GET /api/forms/:id/submissions/:submissionId` - Get submission details
- `DELETE /api/forms/:id/submissions/:submissionId` - Delete submission

## Environment Variables

Create a `.env` file in the root directory or each service folder:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=forms_db
DB_SSLMODE=disable

# Server
PORT=8080
GIN_MODE=debug

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY_HOURS=24

# Default Tenant
DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001
```

## Project Phases

### Phase 1: Foundation ✅ (Current)
- Backend API scaffold with Gin
- PostgreSQL database setup
- Core domain models
- Authentication & RBAC
- Basic CRUD endpoints

### Phase 2: Frontend Foundation (Coming)
- React + TypeScript setup
- Form renderer component
- Login and authentication UI
- Form submission interface

### Phase 3: Form Builder UI (Coming)
- Drag-and-drop form builder
- Form field management
- Form versioning
- Submission viewer with exports

### Phase 4: Advanced Features (Coming)
- PDF export
- CSV export
- Admin panel for user management
- Multi-database scaling support

## Development

### Stopping the Stack
```bash
docker-compose down
```

### Rebuilding Containers
```bash
docker-compose build
docker-compose up
```

### Viewing Logs
```bash
docker-compose logs backend
docker-compose logs postgres
```

## Contributing

1. Follow the existing project structure
2. Write tests for new features
3. Ensure code follows Go conventions
4. Document your changes

## License

MIT