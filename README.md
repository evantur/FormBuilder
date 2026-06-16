# Plan: Multi-Tenant Dynamic Form Generation System (School Districts)

## TL;DR
Build a two-tier full-stack system: Go/Gin backend with PostgreSQL (shared schema + optional tenant isolation), React/TypeScript frontend with form builder UI, and JWT-based RBAC. Start with single-district deployment, support data exports (JSON + PDF), and design for later multi-database scaling. Project uses monorepo structure with separate `/backend` and `/frontend` folders.

## Project Structure