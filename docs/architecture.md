# Architecture Documentation

## System Overview

This is a multi-tenant portfolio, project management, and CRM platform built with Next.js and Supabase.

## Architecture Layers

### 1. Client Layer
- **Public Sites** (SSG/ISR): Portfolio websites for end users
- **Admin App** (CSR/SSR): Management interface for authenticated users
- **Mobile PWA** (Future): Progressive Web App for mobile access

### 2. API Layer
- Next.js API Routes with:
  - Auth middleware
  - Rate limiting
  - Request validation

### 3. Service Layer
- **Portfolio Service**: Manages portfolio sites, templates, and content
- **Project Service**: Project management and task tracking
- **CRM Service**: Contact and deal management
- **Email Service**: Email integration and synchronization

All services use Supabase Client with Row Level Security (RLS) enforcement.

### 4. Data Layer
- **Supabase** providing:
  - PostgreSQL database with RLS
  - Authentication (GoTrue)
  - Storage (S3-compatible)
  - Realtime subscriptions
  - Edge Functions (Deno)
  - Analytics (Logflare)

### 5. External Services
- Microsoft Graph API (email)
- Apple IMAP (email)
- Analytics (GA4/own)

## Core Design Principles

1. **Multi-tenant by default**: All data scoped to `user_id` with RLS
2. **Module isolation**: Each feature domain is self-contained
3. **Event-driven where beneficial**: Activity logging, real-time updates
4. **Progressive enhancement**: Start simple, add complexity as needed
5. **Bilingual from day one**: i18n baked into component structure

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering Strategy | Hybrid (SSG for public, SSR/CSR for admin) | Portfolio pages need SEO; admin needs real-time |
| State Management | React Query + Zustand | Server state vs. client state separation |
| Drag-Drop | dnd-kit | Modern, accessible, tree-shakeable |
| Page Builder | Block-based JSON schema | Flexible, versionable, renderable SSG |
| Email Integration | OAuth + IMAP abstraction layer | Provider-agnostic interface |
| i18n | next-intl | Next.js native, RSC compatible |

## Directory Structure

```
/
├── apps/
│   └── web/                          # Next.js application
│       ├── app/
│       │   ├── [locale]/             # i18n routing
│       │   │   ├── (auth)/           # Auth routes
│       │   │   ├── (admin)/          # Protected admin routes
│       │   │   └── layout.tsx
│       │   ├── api/                  # API routes
│       │   └── sites/                # Dynamic portfolio rendering
│       ├── components/               # React components
│       ├── lib/                      # Utilities and services
│       ├── hooks/                    # React hooks
│       ├── stores/                   # Zustand stores
│       └── messages/                 # i18n translations
│
├── packages/
│   ├── database/                     # Supabase schema & migrations
│   ├── email-templates/              # React Email templates
│   └── shared/                       # Shared utilities, types, constants
│
├── supabase/
│   ├── functions/                    # Edge Functions
│   └── config.toml
│
└── docs/                             # Documentation
```

## Data Flow

1. Client requests → Next.js API Routes
2. API Routes → Service Layer
3. Service Layer → Supabase Client (with RLS)
4. Supabase → PostgreSQL/Storage/Auth
5. Responses flow back through the same layers

## Security

- Row Level Security (RLS) enforced at database level
- Auth middleware on all protected routes
- Rate limiting on API endpoints
- Request validation using Zod schemas
