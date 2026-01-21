# API Implementation Guide

This document tracks the API routes that need to be implemented based on the API contracts specification.

## Current Status

### ✅ Existing API Routes
- `/api/analytics/track` - Analytics event tracking
- `/api/email/*` - Email integration routes (OAuth, sync, etc.)
- `/api/projects/ical` - iCal feed generation
- `/api/revalidate` - ISR revalidation

### 📋 Routes to Implement

#### Authentication
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/callback`
- [ ] `GET /api/auth/me`
- [ ] `PATCH /api/auth/me`
- [ ] `PATCH /api/auth/settings`

#### Portfolio
- [ ] `GET /api/portfolio/site`
- [ ] `POST /api/portfolio/site`
- [ ] `PATCH /api/portfolio/site`
- [ ] `POST /api/portfolio/site/publish`
- [ ] `POST /api/portfolio/site/unpublish`
- [ ] `GET /api/portfolio/pages`
- [ ] `POST /api/portfolio/pages`
- [ ] `GET /api/portfolio/pages/:id`
- [ ] `PATCH /api/portfolio/pages/:id`
- [ ] `DELETE /api/portfolio/pages/:id`
- [ ] `PATCH /api/portfolio/pages/reorder`
- [ ] `POST /api/portfolio/pages/:id/blocks`
- [ ] `PATCH /api/portfolio/blocks/:id`
- [ ] `DELETE /api/portfolio/blocks/:id`
- [ ] `PATCH /api/portfolio/pages/:id/blocks/reorder`
- [ ] `GET /api/portfolio/styles`
- [ ] `PATCH /api/portfolio/styles`
- [ ] `GET /api/portfolio/templates`
- [ ] `POST /api/portfolio/templates/:id/apply`

#### Projects
- [ ] `GET /api/projects`
- [ ] `POST /api/projects`
- [ ] `GET /api/projects/:id`
- [ ] `PATCH /api/projects/:id`
- [ ] `DELETE /api/projects/:id`
- [ ] `POST /api/projects/:id/columns`
- [ ] `PATCH /api/projects/:id/columns/:colId`
- [ ] `DELETE /api/projects/:id/columns/:colId`
- [ ] `PATCH /api/projects/:id/columns/reorder`
- [ ] `GET /api/projects/:id/tasks`
- [ ] `POST /api/projects/:id/tasks`
- [ ] `GET /api/tasks/:id`
- [ ] `PATCH /api/tasks/:id`
- [ ] `DELETE /api/tasks/:id`
- [ ] `POST /api/tasks/:id/move`
- [ ] `PATCH /api/tasks/batch-move`
- [ ] `POST /api/tasks/:id/subtasks`
- [ ] `PATCH /api/subtasks/:id`
- [ ] `DELETE /api/subtasks/:id`
- [ ] `GET /api/tasks/:id/comments`
- [ ] `POST /api/tasks/:id/comments`
- [ ] `PATCH /api/comments/:id`
- [ ] `DELETE /api/comments/:id`
- [ ] `POST /api/tasks/:id/attachments`
- [ ] `DELETE /api/attachments/:id`
- [ ] `GET /api/attachments/:id/download`
- [ ] `GET /api/projects/calendar`
- ✅ `GET /api/projects/calendar.ics` (exists as `/api/projects/ical`)

#### CRM
- [ ] `GET /api/crm/contacts`
- [ ] `POST /api/crm/contacts`
- [ ] `GET /api/crm/contacts/:id`
- [ ] `PATCH /api/crm/contacts/:id`
- [ ] `DELETE /api/crm/contacts/:id`
- [ ] `POST /api/crm/contacts/import`
- [ ] `GET /api/crm/contacts/export`
- [ ] `GET /api/crm/companies`
- [ ] `POST /api/crm/companies`
- [ ] `GET /api/crm/companies/:id`
- [ ] `PATCH /api/crm/companies/:id`
- [ ] `DELETE /api/crm/companies/:id`
- [ ] `GET /api/crm/pipeline`
- [ ] `POST /api/crm/pipeline/stages`
- [ ] `PATCH /api/crm/pipeline/stages/:id`
- [ ] `DELETE /api/crm/pipeline/stages/:id`
- [ ] `PATCH /api/crm/pipeline/stages/reorder`
- [ ] `GET /api/crm/deals`
- [ ] `POST /api/crm/deals`
- [ ] `GET /api/crm/deals/:id`
- [ ] `PATCH /api/crm/deals/:id`
- [ ] `DELETE /api/crm/deals/:id`
- [ ] `POST /api/crm/deals/:id/move`
- [ ] `GET /api/crm/activities`
- [ ] `POST /api/crm/activities`
- [ ] `PATCH /api/crm/activities/:id`
- [ ] `DELETE /api/crm/activities/:id`
- [ ] `GET /api/crm/follow-ups`
- [ ] `POST /api/crm/follow-ups`
- [ ] `PATCH /api/crm/follow-ups/:id`
- [ ] `POST /api/crm/follow-ups/:id/complete`

#### Email
- [ ] `GET /api/email/accounts`
- ✅ `POST /api/email/accounts/connect/outlook` (exists as `/api/email/oauth/microsoft`)
- ✅ `POST /api/email/accounts/connect/apple` (exists as `/api/email/connect-apple`)
- [ ] `DELETE /api/email/accounts/:id`
- ✅ `POST /api/email/accounts/:id/sync` (exists as `/api/email/sync`)
- [ ] `GET /api/email/threads`
- [ ] `GET /api/email/threads/:threadId`
- [ ] `POST /api/email/send`
- [ ] `GET /api/email/contact/:contactId`
- [ ] `GET /api/email/templates`
- [ ] `POST /api/email/templates`
- [ ] `PATCH /api/email/templates/:id`
- [ ] `DELETE /api/email/templates/:id`

#### Analytics
- ✅ `POST /api/track` (exists as `/api/analytics/track`)
- [ ] `GET /api/analytics/overview`
- [ ] `GET /api/analytics/pageviews`
- [ ] `GET /api/analytics/visitors`
- [ ] `GET /api/analytics/referrers`
- [ ] `GET /api/analytics/pages`
- [ ] `GET /api/analytics/experiments`
- [ ] `POST /api/analytics/experiments`
- [ ] `GET /api/analytics/experiments/:id`
- [ ] `PATCH /api/analytics/experiments/:id`
- [ ] `POST /api/analytics/experiments/:id/start`
- [ ] `POST /api/analytics/experiments/:id/stop`
- [ ] `GET /api/analytics/crm/overview`
- [ ] `GET /api/analytics/crm/pipeline`
- [ ] `GET /api/analytics/crm/conversion`

## API Response Format

All API responses should follow this structure:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: {
    total?: number;
    cursor?: string | null;
    has_more?: boolean;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## Implementation Notes

1. All routes should use the service layer (not direct Supabase calls)
2. All routes should include authentication middleware
3. All routes should validate input with Zod schemas
4. All routes should return the standard API response envelope
5. Error handling should be consistent across all routes
