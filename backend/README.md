# Multi-Tenant Form Generation System - Backend API

This is the backend API for the Multi-Tenant Dynamic Form Generation System built with Go, Gin, and PostgreSQL.

## Quick Start

### Prerequisites
- Go 1.21+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository** and navigate to the backend folder:
```bash
cd backend
```

2. **Install dependencies**:
```bash
go mod download
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

4. **Start PostgreSQL** (using Docker):
```bash
docker run --name forms_postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=forms_db -p 5432:5432 -d postgres:15-alpine
```

Or use docker-compose from the root:
```bash
docker-compose up postgres
```

5. **Run the server**:
```bash
go run ./cmd/server/main.go
```

The API will be available at `http://localhost:8080`.

### Using Docker Compose

Start both PostgreSQL and the backend:
```bash
docker-compose up
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)

### Tenants
- `GET /api/tenants/me` - Get current user's tenant (requires auth)

### Forms
- `POST /api/forms` - Create a new form (requires auth, admin/form_builder role)
- `GET /api/forms` - List all forms for the tenant (requires auth)
- `GET /api/forms/:id` - Get a specific form (requires auth)
- `PUT /api/forms/:id` - Update a form (requires auth, admin/form_builder role)
- `DELETE /api/forms/:id` - Delete a form (requires auth, admin/form_builder role)

### Submissions
- `POST /api/forms/:id/submissions` - Submit a form response (requires auth)
- `GET /api/forms/:id/submissions` - List all submissions for a form (requires auth, admin/form_builder role)
- `GET /api/forms/:id/submissions/:submissionId` - Get a specific submission (requires auth, admin/form_builder role)
- `DELETE /api/forms/:id/submissions/:submissionId` - Delete a submission (requires auth, admin/form_builder role)
- `GET /api/forms/:id/my-submission` - Get submissions related to the current user

## Health Check
- `GET /api/health` - Health check endpoint (no auth required)

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
├── internal/
│   ├── auth/                 # Authentication & RBAC
│   │   ├── middleware.go
│   │   ├── token.go
│   │   └── rbac.go
│   ├── config/               # Configuration
│   │   └── config.go
│   ├── database/             # Database setup & migrations
│   │   ├── db.go
│   │   └── migrations/
│   ├── domain/               # Business entities
│   │   ├── form.go
│   │   ├── submission.go
│   │   ├── tenant.go
│   │   └── user.go
│   ├── handler/              # HTTP handlers
│   │   ├── auth_handler.go
│   │   ├── form_handler.go
│   │   ├── submission_handler.go
│   │   └── tenant_handler.go
│   ├── repository/           # Data access layer
│   │   ├── form_repo.go
│   │   ├── submission_repo.go
│   │   ├── tenant_repo.go
│   │   └── user_repo.go
│   └── service/              # Business logic
│       ├── form_service.go
│       ├── submission_service.go
│       ├── tenant_service.go
│       └── user_service.go
├── go.mod
├── go.sum
├── .env.example
├── Dockerfile
└── README.md
```

## Development

### Running Tests
```bash
go test ./...
```

### Building for Production
```bash
go build -o server ./cmd/server
```

## Troubleshooting

### Database Connection Issues
Ensure PostgreSQL is running and accessible. Check the connection string in your `.env` file.

### Port Already in Use
If port 8080 is already in use, change the `PORT` environment variable to a different port.

### Database Migration Errors
The migrations run automatically on startup. If there are errors, check the database logs and ensure the schema is not corrupted.
