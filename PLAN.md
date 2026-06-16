# Plan: Multi-Tenant Dynamic Form Generation System (School Districts)

## TL;DR
Build a two-tier full-stack system: Go/Gin backend with PostgreSQL (shared schema + optional tenant isolation), React/TypeScript frontend with form builder UI, and JWT-based RBAC. Start with single-district deployment, support data exports (JSON + PDF), and design for later multi-database scaling. Project uses monorepo structure with separate `/backend` and `/frontend` folders.

## Project Structure

```
Product_0/
├── backend/                      # Go/Gin application
│   ├── cmd/
│   │   └── server/
│   │       └── main.go          # Entry point
│   ├── internal/
│   │   ├── auth/                # JWT, RBAC middleware
│   │   │   ├── middleware.go
│   │   │   ├── token.go
│   │   │   └── rbac.go
│   │   ├── domain/              # Core business logic
│   │   │   ├── form.go          # Form entity
│   │   │   ├── submission.go    # Form submission entity
│   │   │   ├── tenant.go        # Tenant entity
│   │   │   └── user.go          # User entity
│   │   ├── repository/          # Data access layer
│   │   │   ├── form_repo.go
│   │   │   ├── submission_repo.go
│   │   │   ├── tenant_repo.go
│   │   │   └── user_repo.go
│   │   ├── service/             # Business logic layer
│   │   │   ├── form_service.go
│   │   │   ├── submission_service.go
│   │   │   └── tenant_service.go
│   │   ├── handler/             # HTTP handlers
│   │   │   ├── form_handler.go
│   │   │   ├── submission_handler.go
│   │   │   ├── auth_handler.go
│   │   │   └── tenant_handler.go
│   │   ├── database/            # DB setup, migrations
│   │   │   ├── migrations/
│   │   │   │   ├── 001_init_schema.sql
│   │   │   │   ├── 002_add_forms_table.sql
│   │   │   │   └── 003_add_submissions_table.sql
│   │   │   └── db.go
│   │   └── config/              # Configuration
│   │       └── config.go
│   ├── go.mod
│   ├── go.sum
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                     # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormBuilder/     # Drag-and-drop form builder
│   │   │   │   ├── FormBuilder.tsx
│   │   │   │   ├── FormCanvas.tsx
│   │   │   │   └── FieldPalette.tsx
│   │   │   ├── FormRenderer/    # Render forms for end users
│   │   │   │   └── FormRenderer.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── Common/
│   │   │       ├── Modal.tsx
│   │   │       └── Loading.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FormsList.tsx
│   │   │   ├── FormEditor.tsx
│   │   │   ├── FormSubmissions.tsx
│   │   │   └── NotFound.tsx
│   │   ├── services/
│   │   │   ├── api.ts           # API client
│   │   │   ├── auth.service.ts
│   │   │   └── form.service.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useForms.ts
│   │   │   └── useForm.ts
│   │   ├── types/
│   │   │   ├── form.ts
│   │   │   ├── submission.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   └── export.ts        # PDF/JSON export utilities
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml           # Local dev environment
├── .env.example                 # Environment template
├── .gitignore
└── README.md
```

## Implementation Phases

### Phase 1: Foundation (Backend DB + API scaffold)
1. **Backend setup**
   - Initialize Go module, install Gin + dependencies (GORM for ORM, JWT middleware)
   - Set up PostgreSQL connection with GORM
   - Create database migrations (tenants, users, forms, submissions, form_fields tables)
   - Implement tenant isolation middleware (pass `tenant_id` from JWT context)

2. **Core domain models** (in `internal/domain/`)
   - `Tenant` (id, name, domain, created_at)
   - `User` (id, tenant_id, email, password_hash, role, created_at)
   - `Form` (id, tenant_id, title, description, fields JSON, status, created_at, updated_at)
   - `FormField` (id, form_id, field_type, label, required, options JSON, order)
   - `Submission` (id, form_id, tenant_id, data JSON, submitted_at)

3. **Database layer** (in `internal/repository/`)
   - Implement GORM repositories for each entity
   - Add tenant scoping to all queries (WHERE tenant_id = ?)

4. **Authentication** (in `internal/auth/`)
   - JWT token generation/validation
   - RBAC middleware (admin, form_builder, respondent roles)
   - Tenant context middleware

5. **API endpoints** (basic CRUD, Phase 1)
   - `POST /api/auth/login` (login, return JWT)
   - `GET /api/tenants/me` (get current tenant)
   - `GET /api/forms` (list forms for tenant)
   - `GET /api/forms/:id` (get form detail)
   - `POST /api/forms` (create form) — admin/builder only
   - `POST /api/forms/:id/submissions` (submit form)
   - `GET /api/forms/:id/submissions` (list submissions) — admin/builder only

**Deliverables**: Running Go API on `localhost:8080`, PostgreSQL DB populated with schema, 7 core endpoints working.

### Phase 2: Frontend foundation + Form rendering
1. **Frontend setup**
   - Initialize React app (Vite or Create React App with TypeScript)
   - Install TailwindCSS, axios, React Router, React Hook Form
   - Set up TypeScript types for API models

2. **Authentication UI**
   - Login page
   - JWT token storage (localStorage/sessionStorage)
   - Protected route wrapper
   - AuthContext for global auth state

3. **Form rendering** (read-only, fill-and-submit)
   - `FormRenderer` component that takes form JSON and renders fields dynamically
   - Input validation based on field config
   - Submit handler (POST to `/api/forms/:id/submissions`)

4. **Basic pages**
   - Dashboard (logged-in user landing page)
   - Forms list (public forms to fill)
   - Submission success page

**Deliverables**: Frontend running on `localhost:3000`, can login, view form list, fill and submit forms.

### Phase 3: Form builder UI
1. **Form builder components**
   - `FieldPalette` (drag-source: text, select, checkbox, radio, file upload, etc.)
   - `FormCanvas` (drop zone for building forms)
   - Form field editor (configure label, required, options, validation)
   - Form properties editor (title, description)

2. **Form builder page**
   - Create new form workflow
   - Edit existing form workflow
   - Save form to backend (`PUT /api/forms/:id`)
   - Form versioning UI (optional: track draft vs. published)

3. **Submissions viewer**
   - Table view of submissions
   - Filter/search submissions
   - Export submissions (JSON, CSV, or basic PDF)
   - Single submission detail view

**Deliverables**: Can create, edit, publish forms; view and export submissions.

### Phase 4: Advanced features & polish
1. **Export functionality**
   - PDF export of form submissions (use `jspdf` + `html2canvas` or similar)
   - CSV export of bulk submissions

2. **Tenant management** (admin panel)
   - Create tenants
   - Manage users within tenant
   - Role assignments

3. **Form versioning** (optional)
   - Track form changes
   - Publish/unpublish forms
   - Deprecate old forms

4. **Testing & documentation**
   - Unit tests (backend: Go `testing` package; frontend: Jest)
   - Integration tests
   - API documentation (Swagger/OpenAPI)

**Deliverables**: Production-ready system with full CRUD, exports, and multi-user support.

## Database Schema (PostgreSQL)

**Tenants**
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);
```

**Users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'form_builder', 'respondent'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);
```

**Forms**
```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL, -- Array of field definitions
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published'
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**FormFields** (denormalized in forms.fields JSONB, but can be normalized if needed)
```json
{
  "id": "field-1",
  "type": "text",
  "label": "Full Name",
  "required": true,
  "placeholder": "Enter your full name",
  "order": 1
}
```

**Submissions**
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  data JSONB NOT NULL, -- Key-value pairs of field_id -> answer
  submitted_at TIMESTAMP DEFAULT NOW(),
  submitted_by VARCHAR(255) -- Email or anon if public
);
```

## Key Architectural Decisions

1. **Shared schema (initially)**: All tenants share one PostgreSQL DB with tenant_id isolation. Easier ops, cost-effective for single district.
   - **Migration path**: When scaling to multiple districts, can migrate large tenants to separate RDS instances using tenant_id as routing key.

2. **JSONB for form fields**: Flexible schema allows any form configuration without schema migrations.
   - Submission data stored as JSONB key-value pairs for fast querying.

3. **JWT + role-based access**: Simple, stateless auth. Extend with SAML/OAuth later if districts integrate SSO.

4. **Separation of concerns**: Repository → Service → Handler layers allow easy testing and future refactoring.

5. **Frontend hooks + context**: Centralize auth state and form data fetching for consistency.

## Critical Files to Create (In Order)

**Backend**:
- `backend/cmd/server/main.go` — Entry point, Gin router setup
- `backend/internal/database/migrations/001_init_schema.sql` — Initial schema
- `backend/internal/domain/form.go`, `submission.go`, `tenant.go`, `user.go`
- `backend/internal/auth/middleware.go`, `token.go`
- `backend/internal/handler/form_handler.go`, `submission_handler.go`
- `backend/internal/service/form_service.go`

**Frontend**:
- `frontend/src/types/form.ts` — TypeScript models
- `frontend/src/services/api.ts` — Axios wrapper with tenant context
- `frontend/src/components/FormRenderer/FormRenderer.tsx` — Render forms
- `frontend/src/components/FormBuilder/FormBuilder.tsx` — Build forms
- `frontend/src/context/AuthContext.tsx` — Global auth state
- `frontend/src/pages/FormEditor.tsx` — Form CRUD page

**Infrastructure**:
- `docker-compose.yml` — Local dev (Postgres + Redis optional)
- `.env.example` — Template for env vars

## Verification Steps

1. **Phase 1 (Backend API)**:
   - ✅ `docker-compose up` starts Postgres
   - ✅ `go run ./cmd/server/main.go` starts server on `:8080`
   - ✅ `POST /api/auth/login` returns JWT
   - ✅ `GET /api/forms` (with auth header) lists forms
   - ✅ Database contains correct schema

2. **Phase 2 (Frontend + Rendering)**:
   - ✅ `npm run dev` starts React on `:3000`
   - ✅ Login page works, stores JWT
   - ✅ Can navigate to forms list
   - ✅ Can fill a sample form and submit it
   - ✅ Submission appears in database

3. **Phase 3 (Form Builder)**:
   - ✅ Create new form via UI (drag fields, set labels)
   - ✅ Save form to backend
   - ✅ Form appears in forms list
   - ✅ Can view submissions in table

4. **Phase 4 (Polish)**:
   - ✅ Export submissions as JSON/CSV/PDF
   - ✅ Multi-user access respects tenant boundaries
   - ✅ Role-based UI (builders see builder tools, respondents see only forms)

## Decisions & Assumptions

- **Start monorepo**: Backend and frontend in single repo for easier deployment and dependency management. Can split later if needed.
- **PostgreSQL**: Structured relational DB with JSONB support for flexible forms.
- **Gin over other Go frameworks**: Lightweight, fast, minimal setup, great for APIs.
- **React Hooks + Context**: No Redux yet; keep state management simple initially. Upgrade when needed.
- **Localhost dev first**: Use `docker-compose` for local Postgres; add deployment (Docker, K8s) in Phase 4.
- **No real-time**: Straightforward submissions mean no WebSocket/gRPC overhead.
- **Single district initially**: All users in one tenant; admin creates users manually or via invite.

## Final Decisions

✅ **Form field types**: Text, Email, Number, Select, Multi-select, Checkbox, Radio, File Upload, Textarea, Date, **Student ID** (alphanumeric with validation), **Grade Level** (predefined dropdown).

✅ **File upload storage**: Local filesystem (`/uploads/{tenant_id}/{form_id}/` directory). Migration to S3/MinIO can happen post-launch without code changes (abstract to interface).

✅ **Form access control**: All forms private to tenant — no public shareable links. All respondents must be associated with a tenant and authenticated.

