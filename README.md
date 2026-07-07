# Multi-Tenant Dynamic Form Generation System

## Project Overview

A full-stack system for creating, managing, and submitting dynamic forms. Designed for school districts with:
- Backend: Go/Gin API with PostgreSQL
- Frontend: React/TypeScript
- Multi-tenant support with JWT-based RBAC
- Form exports (JSON, PDF, CSV) *(in progress)*

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose

### Quick Start with Docker

1. **Start the entire stack**:
```bash
docker-compose up --build
```

This will start:
- PostgreSQL on port 5432
- Go backend on port 8080
- React frontend on port 3000

2. **Seed test users** (in a separate terminal, once the stack is running):
```bash
./scripts/seed_test_users.sh
```

The app is then accessible at `http://localhost:3000`.

---

### Manual Setup

#### Backend
```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/server/main.go
```

Backend will run on `http://localhost:8080`.

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`.

---

## Test Users

The seed script creates two test accounts for local development, both with the password **`password123`**:

| Email | Role | Capabilities |
|---|---|---|
| `admin@localhost` | admin | Create, edit, archive, and force-delete forms; view all submissions |
| `respondent@localhost` | respondent | View published forms and submit responses (one per form) |

### Running the seed script

The script connects to the database using the same defaults as `docker-compose.yml`. Run it after the stack is up:

```bash
./scripts/seed_test_users.sh
```

It is safe to run multiple times — users are only inserted if they do not already exist.

**Custom connection options** (if running the backend outside Docker):

```bash
./scripts/seed_test_users.sh \
  --host localhost \
  --port 5432 \
  --user postgres \
  --password postgres \
  --db forms_db
```

**Running against the Docker Postgres container directly** (no local `psql` required):

```bash
docker exec -i forms_postgres psql -U postgres -d forms_db < scripts/seed_test_users.sh
```

Or exec into the container first:

```bash
docker exec -it forms_postgres bash
# then inside the container:
psql -U postgres -d forms_db
```

> **Note:** The script requires `psql` to be installed locally when run outside Docker. On macOS: `brew install libpq && brew link libpq --force`. On Ubuntu/Debian: `sudo apt install postgresql-client`.

---

## Architecture

### Backend Structure
- **Domain Layer**: Core business entities (Tenant, User, Form, Submission)
- **Repository Layer**: Data access with tenant isolation
- **Service Layer**: Business logic and validation
- **Handler Layer**: HTTP request handling
- **Auth Layer**: JWT tokens and role-based access control

### Key Features
✅ User authentication with JWT tokens  
✅ Tenant isolation at the database level  
✅ Drag-and-drop form builder  
✅ Form submission tracking with one-submission-per-user enforcement  
✅ Role-based access control (admin, form_builder, respondent)  
✅ Form locking — forms with submissions cannot be edited  
✅ Form archiving  
✅ Admin cascade delete  
✅ PostgreSQL with JSONB for flexible form schemas  

---

## API Endpoints

### Health
- `GET /api/health` — Health check

### Authentication
- `POST /api/auth/login` — Login and receive JWT token

### Tenants
- `GET /api/tenants/me` — Get current tenant info

### Forms
- `POST /api/forms` — Create form *(admin, form_builder)*
- `GET /api/forms` — List active (non-archived) forms
- `GET /api/forms/archived` — List archived forms *(admin, form_builder)*
- `GET /api/forms/:id` — Get form details
- `PUT /api/forms/:id` — Update form *(admin, form_builder; blocked once submissions exist)*
- `DELETE /api/forms/:id` — Delete form *(admin, form_builder; blocked once submissions exist)*
- `PUT /api/forms/:id/archive` — Archive form *(admin, form_builder)*
- `PUT /api/forms/:id/unarchive` — Unarchive form *(admin, form_builder)*
- `DELETE /api/forms/:id/cascade` — Force delete form and all submissions *(admin only)*

### Submissions
- `POST /api/forms/:id/submissions` — Submit a form response *(one per user)*
- `GET /api/forms/:id/submissions` — List all submissions *(admin, form_builder)*
- `GET /api/forms/:id/submissions/:submissionId` — Get a single submission *(admin, form_builder)*
- `DELETE /api/forms/:id/submissions/:submissionId` — Delete a submission *(admin, form_builder)*
- `GET /api/forms/:id/my-submission` — Get the current user's own submission

---

## Environment Variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

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

---

## Project Phases

### Phase 1: Foundation ✅
- Backend API scaffold with Gin
- PostgreSQL database setup
- Core domain models
- Authentication & RBAC
- Basic CRUD endpoints

### Phase 2: Frontend Foundation ✅
- React + TypeScript setup
- Form renderer component
- Login and authentication UI
- Form submission interface

### Phase 3: Form Builder UI ✅
- Drag-and-drop form builder
- Form field management
- Submission viewer
- One-submission-per-user enforcement
- Form locking, archiving, and cascade delete

### Phase 4: Advanced Features (Coming)
- PDF export
- CSV export
- Admin panel for user management
- Multi-database scaling support

---

## Development

### Stopping the stack
```bash
docker-compose down
```

### Rebuilding containers after code changes
```bash
docker-compose up --build
```

### Viewing logs
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

---

## Contributing

1. Follow the existing project structure
2. Write tests for new features
3. Ensure code follows Go conventions
4. Document your changes

## License

MIT