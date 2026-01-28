# Architecture: Domain-First

## Overview
This project follows a domain-driven design (DDD) approach to manage complexity across Builder, Renderer, CRM, Projects, and Deploy domains.

## Directory Structure
- `/app`: Next.js App Router routes.
- `/src/domain`: Core business logic, entities, and services.
- `/src/lib`: Shared infrastructure (Supabase, Auth, i18n).
- `/packages/shared`: Shared types and utilities across potential multiple apps.
- `/infra`: Database migrations and infrastructure scripts.

## Domains
### Builder
Handles portfolio creation, template selection, and editor state.
### Renderer
Handles the public-facing rendering of portfolios.
### CRM
Manages persons, organizations, deals, and activities.
### Projects
Manages work projects and deliverables.
### Deploy
Handles domain verification and releases.
