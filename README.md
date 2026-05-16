# Afyametrix MVP Scaffold

Sprint 0 scaffold for:
- API service with auth skeleton and RBAC middleware
- PWA shell with offline bootstrap
- Database schema baseline (PostgreSQL SQL migration)
- Shared types package

## Structure

- `apps/api`: Express + TypeScript backend
- `apps/web`: Vite + React PWA shell
- `packages/shared`: Shared role/type definitions
- `infra/db/migrations`: SQL migration baseline

## Quick Start

1. Install dependencies:
```bash
npm install
```
2. Run API:
```bash
npm run dev:api
```
3. Run Web:
```bash
npm run dev:web
```

## Environment

Copy `apps/api/.env.example` to `apps/api/.env` and set values.
