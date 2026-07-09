# Form Builder Frontend

React + TypeScript frontend for the multi-tenant dynamic form generation system.

## Setup

```bash
npm install
npm run dev
```

The app will run on `http://localhost:3000` and proxy API requests to `http://localhost:8080/api`.

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000
```

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Architecture

### Type System (`src/types/`)
- `form.ts` - Form and FormField types
- `submission.ts` - Form submission types
- `user.ts` - User, Tenant, and Auth types
- `api.ts` - API response and error types

### Services (`src/services/`)
- `api.ts` - Axios client with JWT interceptors
- `auth.service.ts` - Authentication logic
- `form.service.ts` - Form CRUD operations

### Context & Hooks (`src/context/` & `src/hooks/`)
- `AuthContext.tsx` - Global authentication state
- `useForms.ts` - Custom hooks for forms

### Components (`src/components/`)
- `Auth/` - Login and ProtectedRoute
- `FormRenderer/` - Dynamic form rendering
- `Layout/` - Common layout components
- `Common/` - Reusable UI components

### Pages (`src/pages/`)
- `Dashboard.tsx` - Main landing page
- `FormBuilder.tsx` - Form creation page
- `FormsList.tsx` - List of available forms
- `FormFill.tsx` - Fill and submit a form
- `Submissions.tsx` - Submissions page
- `NotFound.tsx` - 404 page

## Project Structure

Detailed layout of the frontend directory and important files:

```
frontend/
├── Dockerfile
├── package.json
├── public/
│   ├── index.html
│   └── (static assets)
├── src/
│   ├── main.tsx             # Vite entry - mounts the app
│   ├── App.tsx              # Top-level app/routes
│   ├── index.css
│   ├── components/          # Reusable UI components
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── Common/
│   │   │   └── Logo.tsx
│   │   └── FormRenderer/
│   │       └── FormRenderer.tsx
│   ├── context/
│   │   └── AuthContext.tsx  # Global auth state/provider
│   ├── hooks/
│   │   ├── index.ts
│   │   └── useForms.ts      # Form-related hooks
│   ├── pages/               # Route-mounted pages
│   │   ├── Dashboard.tsx
│   │   ├── FormsList.tsx
│   │   ├── FormBuilder.tsx
│   │   ├── FormFill.tsx
│   │   ├── Submissions.tsx
│   │   └── NotFound.tsx
│   ├── services/            # API clients and business services
│   │   ├── api.ts           # Axios client with interceptors
│   │   ├── auth.service.ts
│   │   └── form.service.ts
│   ├── styles/
│   │   └── shared.css
│   ├── types/               # TypeScript types/interfaces
│   │   ├── api.ts
│   │   ├── form.ts
│   │   ├── submission.ts
│   │   └── user.ts
│   └── utils/               # Small utilities/helpers
└── README.md
```

This mirrors the backend's separation of concerns and keeps UI code organized by feature.

## Key Features

- ✅ React setup with TypeScript and Vite
- ✅ Authentication UI (Login page)
- ✅ Protected routes
- ✅ Dynamic form rendering component
- ✅ Basic pages (Dashboard, Forms List)
- ✅ Form submission functionality
- ✅ JWT token management
- ✅ Form builder UI with drag-and-drop
- ✅ Edit existing forms
- ✅ View form submissions in table format
- ✅ Export submissions (JSON, CSV, PDF)

