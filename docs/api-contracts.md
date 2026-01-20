# API Contracts

## API Design Principles

- **RESTful** for CRUD operations, with some RPC-style endpoints for complex operations
- **Consistent response envelope**: `{ data, error, meta }`
- **Pagination**: Cursor-based for lists
- **Versioning**: URL prefix `/api/v1/` (future-proofing)

## Request/Response Format

All successful responses follow this format:
```typescript
{
  data: T;
  meta?: {
    pagination?: {
      cursor?: string;
      hasMore: boolean;
    };
    total?: number;
  };
}
```

All error responses follow this format:
```typescript
{
  error: {
    code: string;
    message: string;
    details?: unknown;
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Authentication

### POST `/api/v1/auth/register`
Extended registration with profile setup.

**Request:**
```typescript
{
  email: string;
  password: string;
  display_name?: string;
  locale?: 'en' | 'et';
}
```

**Response:**
```typescript
{
  data: {
    session: Session;
    user: User;
    profile: Profile;
  }
}
```

### POST `/api/v1/auth/onboarding`
Complete onboarding steps.

**Request:**
```typescript
{
  display_name?: string;
  locale?: 'en' | 'et';
  timezone?: string;
}
```

**Response:**
```typescript
{
  data: {
    profile: Profile;
    settings: UserSettings;
  }
}
```

### GET `/api/v1/auth/me`
Get current user profile + settings.

**Response:**
```typescript
{
  data: {
    user: User;
    profile: Profile;
    settings: UserSettings;
  }
}
```

### PATCH `/api/v1/auth/me`
Update profile.

**Request:**
```typescript
{
  display_name?: string;
  avatar_url?: string;
  locale?: 'en' | 'et';
  timezone?: string;
  onboarding_completed?: boolean;
}
```

**Response:**
```typescript
{
  data: Profile;
}
```

### PATCH `/api/v1/auth/settings`
Update settings (locale, notifications, etc.).

**Request:**
```typescript
{
  email_notifications?: boolean;
  portfolio_subdomain?: string;
  custom_domain?: string;
  plan_tier?: 'free' | 'pro' | 'business';
  settings_json?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  data: UserSettings;
}
```

## Portfolio Module

### Sites

#### GET `/api/v1/portfolio/site`
Get user's site (one site per user for MVP).

**Response:**
```typescript
{
  data: PortfolioSite;
}
```

#### POST `/api/v1/portfolio/site`
Create site.

**Request:**
```typescript
{
  name: string;
  subdomain: string;
  templateId?: string;
}
```

**Response:**
```typescript
{
  data: PortfolioSite;
}
```

#### PATCH `/api/v1/portfolio/site`
Update site settings.

**Request:**
```typescript
{
  name?: string;
  subdomain?: string;
  custom_domain?: string;
  seo_title?: string;
  seo_description?: string;
  favicon_url?: string;
  analytics_id?: string;
}
```

**Response:**
```typescript
{
  data: PortfolioSite;
}
```

#### POST `/api/v1/portfolio/site/publish`
Publish site.

**Response:**
```typescript
{
  data: PortfolioSite;
}
```

#### POST `/api/v1/portfolio/site/unpublish`
Unpublish site.

**Response:**
```typescript
{
  data: PortfolioSite;
}
```

### Pages

#### GET `/api/v1/portfolio/pages`
List pages.

**Response:**
```typescript
{
  data: PortfolioPage[];
}
```

#### POST `/api/v1/portfolio/pages`
Create page.

**Request:**
```typescript
{
  slug: string;
  title: string;
  is_homepage?: boolean;
  seo_title?: string;
  seo_description?: string;
}
```

**Response:**
```typescript
{
  data: PortfolioPage;
}
```

#### GET `/api/v1/portfolio/pages/:id`
Get page with blocks.

**Response:**
```typescript
{
  data: {
    page: PortfolioPage;
    blocks: PortfolioBlock[];
  }
}
```

#### PATCH `/api/v1/portfolio/pages/:id`
Update page.

**Request:**
```typescript
{
  slug?: string;
  title?: string;
  is_homepage?: boolean;
  is_published?: boolean;
  sort_order?: number;
  seo_title?: string;
  seo_description?: string;
}
```

**Response:**
```typescript
{
  data: PortfolioPage;
}
```

#### DELETE `/api/v1/portfolio/pages/:id`
Delete page.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### PATCH `/api/v1/portfolio/pages/reorder`
Reorder pages.

**Request:**
```typescript
{
  pageIds: string[];
}
```

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Blocks

#### POST `/api/v1/portfolio/pages/:id/blocks`
Add block to page.

**Request:**
```typescript
{
  block_type: string;
  content: Record<string, unknown>;
  settings?: Record<string, unknown>;
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: PortfolioBlock;
}
```

#### PATCH `/api/v1/portfolio/blocks/:id`
Update block content.

**Request:**
```typescript
{
  block_type?: string;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: PortfolioBlock;
}
```

#### DELETE `/api/v1/portfolio/blocks/:id`
Delete block.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### PATCH `/api/v1/portfolio/pages/:id/blocks/reorder`
Reorder blocks.

**Request:**
```typescript
{
  blockIds: string[];
}
```

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Styles

#### GET `/api/v1/portfolio/styles`
Get site styles.

**Response:**
```typescript
{
  data: PortfolioStyle;
}
```

#### PATCH `/api/v1/portfolio/styles`
Update styles.

**Request:**
```typescript
{
  color_palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    scale?: string;
  };
  spacing_scale?: string;
  custom_css?: string;
}
```

**Response:**
```typescript
{
  data: PortfolioStyle;
}
```

### Templates

#### GET `/api/v1/portfolio/templates`
List available templates.

**Query Parameters:**
- `category?: string`

**Response:**
```typescript
{
  data: PortfolioTemplate[];
}
```

#### POST `/api/v1/portfolio/templates/:id/apply`
Apply template to site.

**Response:**
```typescript
{
  data: {
    site: PortfolioSite;
    pages: PortfolioPage[];
  }
}
```

## Project Management Module

### Projects

#### GET `/api/v1/projects`
List projects.

**Query Parameters:**
- `status?: 'active' | 'archived' | 'completed'`
- `limit?: number`
- `offset?: number`

**Response:**
```typescript
{
  data: Project[];
  meta: {
    total: number;
  }
}
```

#### POST `/api/v1/projects`
Create project.

**Request:**
```typescript
{
  name: string;
  description?: string;
  status?: 'active' | 'archived' | 'completed';
  color?: string;
  linked_contact_id?: string;
  linked_deal_id?: string;
}
```

**Response:**
```typescript
{
  data: Project;
}
```

#### GET `/api/v1/projects/:id`
Get project with columns.

**Response:**
```typescript
{
  data: {
    project: Project;
    columns: ProjectColumn[];
  }
}
```

#### PATCH `/api/v1/projects/:id`
Update project.

**Request:**
```typescript
{
  name?: string;
  description?: string;
  status?: 'active' | 'archived' | 'completed';
  color?: string;
  linked_contact_id?: string;
  linked_deal_id?: string;
}
```

**Response:**
```typescript
{
  data: Project;
}
```

#### DELETE `/api/v1/projects/:id`
Archive/delete project.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Columns

#### POST `/api/v1/projects/:id/columns`
Add column.

**Request:**
```typescript
{
  name: string;
  sort_order?: number;
  color?: string;
  is_done_column?: boolean;
}
```

**Response:**
```typescript
{
  data: ProjectColumn;
}
```

#### PATCH `/api/v1/projects/:id/columns/:colId`
Update column.

**Request:**
```typescript
{
  name?: string;
  sort_order?: number;
  color?: string;
  is_done_column?: boolean;
}
```

**Response:**
```typescript
{
  data: ProjectColumn;
}
```

#### DELETE `/api/v1/projects/:id/columns/:colId`
Delete column.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### PATCH `/api/v1/projects/:id/columns/reorder`
Reorder columns.

**Request:**
```typescript
{
  columnIds: string[];
}
```

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Tasks

#### GET `/api/v1/projects/:id/tasks`
List tasks (optionally filtered).

**Query Parameters:**
- `columnId?: string`
- `assigneeId?: string`
- `priority?: 'low' | 'medium' | 'high' | 'urgent'`

**Response:**
```typescript
{
  data: Task[];
}
```

#### POST `/api/v1/projects/:id/tasks`
Create task.

**Request:**
```typescript
{
  title: string;           // Required
  description?: string;
  column_id: string;       // Required - which column
  due_date?: string;       // ISO date
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
}
```

**Response:**
```typescript
{
  data: {
    id: string;
    title: string;
    description: string | null;
    column_id: string;
    project_id: string;
    due_date: string | null;
    due_time: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent' | null;
    assignee_id: string | null;
    sort_order: number;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
  error: null;
}
```

**Example Request:**
```json
{
  "title": "Implement user authentication",
  "description": "Add login and registration functionality",
  "column_id": "550e8400-e29b-41d4-a716-446655440000",
  "due_date": "2024-02-15",
  "priority": "high",
  "assignee_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Example Response:**
```json
{
  "data": {
    "id": "789e4567-e89b-12d3-a456-426614174001",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality",
    "column_id": "550e8400-e29b-41d4-a716-446655440000",
    "project_id": "456e7890-e89b-12d3-a456-426614174002",
    "due_date": "2024-02-15",
    "due_time": null,
    "priority": "high",
    "assignee_id": "123e4567-e89b-12d3-a456-426614174000",
    "sort_order": 0,
    "completed_at": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

#### GET `/api/v1/tasks/:id`
Get task details.

**Response:**
```typescript
{
  data: {
    task: Task;
    subtasks: Subtask[];
    comments: TaskComment[];
    attachments: TaskAttachment[];
  }
}
```

#### PATCH `/api/v1/tasks/:id`
Update task.

**Request:**
```typescript
{
  column_id?: string;
  title?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  due_time?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: Task;
}
```

#### DELETE `/api/v1/tasks/:id`
Delete task.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### POST `/api/v1/tasks/:id/move`
Move task to column/position.

**Request:**
```typescript
{
  column_id: string;
  sort_order: number;
}
```

**Response:**
```typescript
{
  data: Task;
}
```

#### PATCH `/api/v1/tasks/batch-move`
Batch move tasks.

**Request:**
```typescript
{
  taskIds: string[];
  column_id: string;
  sort_orders: number[];
}
```

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Subtasks

#### POST `/api/v1/tasks/:id/subtasks`
Add subtask.

**Request:**
```typescript
{
  title: string;
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: Subtask;
}
```

#### PATCH `/api/v1/subtasks/:id`
Update subtask.

**Request:**
```typescript
{
  title?: string;
  is_completed?: boolean;
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: Subtask;
}
```

#### DELETE `/api/v1/subtasks/:id`
Delete subtask.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Comments

#### GET `/api/v1/tasks/:id/comments`
List comments.

**Response:**
```typescript
{
  data: TaskComment[];
}
```

#### POST `/api/v1/tasks/:id/comments`
Add comment.

**Request:**
```typescript
{
  content: string;
}
```

**Response:**
```typescript
{
  data: TaskComment;
}
```

#### PATCH `/api/v1/comments/:id`
Edit comment.

**Request:**
```typescript
{
  content: string;
}
```

**Response:**
```typescript
{
  data: TaskComment;
}
```

#### DELETE `/api/v1/comments/:id`
Delete comment.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Attachments

#### POST `/api/v1/tasks/:id/attachments`
Upload attachment.

**Request:** `multipart/form-data`
- `file`: File

**Response:**
```typescript
{
  data: TaskAttachment;
}
```

#### DELETE `/api/v1/attachments/:id`
Delete attachment.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### GET `/api/v1/attachments/:id/download`
Get download URL.

**Response:**
```typescript
{
  data: {
    url: string;
    expiresAt: string;
  }
}
```

### Calendar View

#### GET `/api/v1/projects/calendar`
Get tasks in calendar format.

**Query Parameters:**
- `startDate: string`
- `endDate: string`
- `projectId?: string`

**Response:**
```typescript
{
  data: {
    tasks: Array<{
      task: Task;
      date: string;
    }>;
  }
}
```

#### GET `/api/v1/projects/calendar.ics`
iCal feed.

**Query Parameters:**
- `projectId?: string`

**Response:** `text/calendar` format

## CRM Module

### Contacts

#### GET `/api/v1/crm/contacts`
List contacts (with filters, pagination).

**Query Parameters:**
- `companyId?: string`
- `tags?: string` (comma-separated or multiple query params)
- `lead_source?: string`
- `search?: string` (searches first_name, last_name, email)
- `limit?: number` (default: 20, max: 100)
- `cursor?: string` (for pagination)

**Response:**
```typescript
{
  data: Contact[];
  meta: {
    total: number;
    cursor: string | null;
    has_more: boolean;
  };
  error: null;
}
```

**Example:**
```
GET /api/v1/crm/contacts?tags=lead&lead_source=website&limit=20&cursor=xxx
```

#### POST `/api/v1/crm/contacts`
Create contact.

**Request:**
```typescript
{
  company_id?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  avatar_url?: string;
  social_links?: Record<string, string>;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  };
  lead_source?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  data: Contact;
}
```

#### GET `/api/v1/crm/contacts/:id`
Get contact with timeline.

**Response:**
```typescript
{
  data: {
    contact: Contact;
    activities: CRMActivity[];
    deals: Deal[];
    emails: Email[];
  }
}
```

#### PATCH `/api/v1/crm/contacts/:id`
Update contact.

**Request:**
```typescript
{
  company_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  avatar_url?: string;
  social_links?: Record<string, string>;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  };
  lead_source?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  data: Contact;
}
```

#### DELETE `/api/v1/crm/contacts/:id`
Delete contact.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### POST `/api/v1/crm/contacts/import`
Bulk import contacts.

**Request:** `multipart/form-data`
- `file`: CSV file

**Response:**
```typescript
{
  data: {
    imported: number;
    errors: Array<{ row: number; error: string }>;
  }
}
```

#### GET `/api/v1/crm/contacts/export`
Export contacts (CSV).

**Query Parameters:**
- `format?: 'csv' | 'json'`

**Response:** CSV file or JSON array

### Companies

#### GET `/api/v1/crm/companies`
List companies.

**Response:**
```typescript
{
  data: Company[];
}
```

#### POST `/api/v1/crm/companies`
Create company.

**Request:**
```typescript
{
  name: string;
  website?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  address?: {
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  };
  notes?: string;
  custom_fields?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  data: Company;
}
```

#### GET `/api/v1/crm/companies/:id`
Get company with contacts.

**Response:**
```typescript
{
  data: {
    company: Company;
    contacts: Contact[];
  }
}
```

#### PATCH `/api/v1/crm/companies/:id`
Update company.

**Request:**
```typescript
{
  name?: string;
  website?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  address?: {
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  };
  notes?: string;
  custom_fields?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  data: Company;
}
```

#### DELETE `/api/v1/crm/companies/:id`
Delete company.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Pipeline & Deals

#### GET `/api/v1/crm/pipeline`
Get pipeline stages with deals.

**Response:**
```typescript
{
  data: Array<{
    stage: PipelineStage;
    deals: Deal[];
  }>;
}
```

#### POST `/api/v1/crm/pipeline/stages`
Create stage.

**Request:**
```typescript
{
  name: string;
  sort_order?: number;
  color?: string;
  probability?: number;
  is_won?: boolean;
  is_lost?: boolean;
}
```

**Response:**
```typescript
{
  data: PipelineStage;
}
```

#### PATCH `/api/v1/crm/pipeline/stages/:id`
Update stage.

**Request:**
```typescript
{
  name?: string;
  sort_order?: number;
  color?: string;
  probability?: number;
  is_won?: boolean;
  is_lost?: boolean;
}
```

**Response:**
```typescript
{
  data: PipelineStage;
}
```

#### DELETE `/api/v1/crm/pipeline/stages/:id`
Delete stage.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### PATCH `/api/v1/crm/pipeline/stages/reorder`
Reorder stages.

**Request:**
```typescript
{
  stageIds: string[];
}
```

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### GET `/api/v1/crm/deals`
List deals (with filters).

**Query Parameters:**
- `stageId?: string`
- `contactId?: string`
- `companyId?: string`
- `status?: string`

**Response:**
```typescript
{
  data: Deal[];
}
```

#### POST `/api/v1/crm/deals`
Create deal.

**Request:**
```typescript
{
  contact_id?: string;
  company_id?: string;
  stage_id: string;
  title: string;
  value?: number;
  currency?: string;
  expected_close_date?: string;
  probability?: number;
  notes?: string;
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: Deal;
}
```

#### GET `/api/v1/crm/deals/:id`
Get deal details.

**Response:**
```typescript
{
  data: {
    deal: Deal;
    activities: CRMActivity[];
    emails: Email[];
  }
}
```

#### PATCH `/api/v1/crm/deals/:id`
Update deal.

**Request:**
```typescript
{
  contact_id?: string;
  company_id?: string;
  stage_id?: string;
  title?: string;
  value?: number;
  currency?: string;
  expected_close_date?: string;
  actual_close_date?: string;
  probability?: number;
  notes?: string;
  lost_reason?: string;
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: Deal;
}
```

#### DELETE `/api/v1/crm/deals/:id`
Delete deal.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### POST `/api/v1/crm/deals/:id/move`
Move deal to stage.

**Request:**
```typescript
{
  stage_id: string;
  sort_order?: number;
}
```

**Response:**
```typescript
{
  data: Deal;
}
```

### Activities

#### GET `/api/v1/crm/activities`
List activities.

**Query Parameters:**
- `contactId?: string`
- `dealId?: string`
- `activityType?: 'email' | 'call' | 'meeting' | 'note' | 'task'`
- `limit?: number`
- `offset?: number`

**Response:**
```typescript
{
  data: CRMActivity[];
  meta: {
    total: number;
  }
}
```

#### POST `/api/v1/crm/activities`
Log activity.

**Request:**
```typescript
{
  contact_id?: string;
  deal_id?: string;
  activity_type: 'email' | 'call' | 'meeting' | 'note' | 'task';
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  is_completed?: boolean;
  due_date?: string;
}
```

**Response:**
```typescript
{
  data: CRMActivity;
}
```

#### PATCH `/api/v1/crm/activities/:id`
Update activity.

**Request:**
```typescript
{
  activity_type?: 'email' | 'call' | 'meeting' | 'note' | 'task';
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  is_completed?: boolean;
  due_date?: string;
}
```

**Response:**
```typescript
{
  data: CRMActivity;
}
```

#### DELETE `/api/v1/crm/activities/:id`
Delete activity.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

### Follow-ups

#### GET `/api/v1/crm/follow-ups`
List follow-ups.

**Query Parameters:**
- `contactId?: string`
- `dealId?: string`
- `isCompleted?: boolean`

**Response:**
```typescript
{
  data: FollowUp[];
}
```

#### POST `/api/v1/crm/follow-ups`
Create follow-up.

**Request:**
```typescript
{
  contact_id?: string;
  deal_id?: string;
  title: string;
  due_date: string;
}
```

**Response:**
```typescript
{
  data: FollowUp;
}
```

#### PATCH `/api/v1/crm/follow-ups/:id`
Update follow-up.

**Request:**
```typescript
{
  title?: string;
  due_date?: string;
  is_completed?: boolean;
}
```

**Response:**
```typescript
{
  data: FollowUp;
}
```

#### POST `/api/v1/crm/follow-ups/:id/complete`
Mark complete.

**Response:**
```typescript
{
  data: FollowUp;
}
```

## Email Module

### Accounts

#### GET `/api/v1/email/accounts`
List connected accounts.

**Response:**
```typescript
{
  data: EmailAccount[];
}
```

#### POST `/api/v1/email/accounts/connect/outlook`
OAuth flow for Outlook.

**Request:**
```typescript
{
  code: string;
  state: string;
}
```

**Response:**
```typescript
{
  data: EmailAccount;
}
```

#### POST `/api/v1/email/accounts/connect/apple`
IMAP setup for Apple.

**Request:**
```typescript
{
  email_address: string;
  password: string;
  imap_server: string;
  imap_port: number;
}
```

**Response:**
```typescript
{
  data: EmailAccount;
}
```

#### DELETE `/api/v1/email/accounts/:id`
Disconnect account.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

#### POST `/api/v1/email/accounts/:id/sync`
Trigger manual sync.

**Response:**
```typescript
{
  data: {
    success: boolean;
    synced: number;
  }
}
```

### Emails

#### GET `/api/v1/email/threads`
List email threads.

**Query Parameters:**
- `accountId?: string`
- `contactId?: string`
- `dealId?: string`
- `limit?: number`
- `offset?: number`

**Response:**
```typescript
{
  data: Array<{
    thread_id: string;
    subject: string;
    last_message: Email;
    unread_count: number;
  }>;
  meta: {
    total: number;
  }
}
```

#### GET `/api/v1/email/threads/:threadId`
Get thread messages.

**Response:**
```typescript
{
  data: Email[];
}
```

#### POST `/api/v1/email/send`
Send email.

**Request:**
```typescript
{
  account_id: string;
  to: string[];
  cc?: string[];
  subject: string;
  body_html: string;
  contact_id?: string;
  deal_id?: string;
}
```

**Response:**
```typescript
{
  data: Email;
}
```

#### GET `/api/v1/email/contact/:contactId`
Get emails for contact.

**Response:**
```typescript
{
  data: Email[];
}
```

### Templates

#### GET `/api/v1/email/templates`
List templates.

**Query Parameters:**
- `category?: string`
- `search?: string`

**Response:**
```typescript
{
  data: EmailTemplate[];
}
```

#### POST `/api/v1/email/templates`
Create template.

**Request:**
```typescript
{
  name: string;
  subject: string;
  body_html: string;
  variables?: string[];
  category?: string;
}
```

**Response:**
```typescript
{
  data: EmailTemplate;
}
```

#### PATCH `/api/v1/email/templates/:id`
Update template.

**Request:**
```typescript
{
  name?: string;
  subject?: string;
  body_html?: string;
  variables?: string[];
  category?: string;
}
```

**Response:**
```typescript
{
  data: EmailTemplate;
}
```

#### DELETE `/api/v1/email/templates/:id`
Delete template.

**Response:**
```typescript
{
  data: { success: boolean };
}
```

## Analytics Module

### Portfolio Analytics

#### GET `/api/v1/analytics/overview`
Dashboard overview stats.

**Query Parameters:**
- `siteId: string`
- `days?: number` (default: 30)

**Response:**
```typescript
{
  data: {
    totalPageviews: number;
    totalUniqueVisitors: number;
    totalFormSubmissions: number;
    avgSessionDuration: number | null;
    bounceRate: number | null;
  }
}
```

#### GET `/api/v1/analytics/pageviews`
Pageview time series.

**Query Parameters:**
- `siteId: string`
- `startDate: string`
- `endDate: string`
- `granularity?: 'day' | 'week' | 'month'`

**Response:**
```typescript
{
  data: Array<{
    date: string;
    pageviews: number;
  }>;
}
```

#### GET `/api/v1/analytics/visitors`
Visitor analytics.

**Query Parameters:**
- `siteId: string`
- `startDate: string`
- `endDate: string`

**Response:**
```typescript
{
  data: {
    unique: number;
    returning: number;
    new: number;
  }
}
```

#### GET `/api/v1/analytics/referrers`
Referrer breakdown.

**Query Parameters:**
- `siteId: string`
- `startDate: string`
- `endDate: string`

**Response:**
```typescript
{
  data: Array<{
    referrer: string;
    count: number;
  }>;
}
```

#### GET `/api/v1/analytics/pages`
Per-page stats.

**Query Parameters:**
- `siteId: string`
- `startDate: string`
- `endDate: string`

**Response:**
```typescript
{
  data: Array<{
    page_id: string;
    page_title: string;
    pageviews: number;
    unique_visitors: number;
  }>;
}
```

### A/B Testing

#### GET `/api/v1/analytics/experiments`
List experiments.

**Query Parameters:**
- `siteId: string`

**Response:**
```typescript
{
  data: ABExperiment[];
}
```

#### POST `/api/v1/analytics/experiments`
Create experiment.

**Request:**
```typescript
{
  site_id: string;
  name: string;
  description?: string;
  target_type: 'page' | 'block' | 'style';
  target_id?: string;
  traffic_split?: number;
  goal_type?: 'pageview' | 'click' | 'form_submit';
  goal_target?: string;
}
```

**Response:**
```typescript
{
  data: ABExperiment;
}
```

#### GET `/api/v1/analytics/experiments/:id`
Get experiment results.

**Response:**
```typescript
{
  data: {
    experiment: ABExperiment;
    variants: Array<{
      variant: ABVariant;
      conversionRate: number;
    }>;
    totalVisitors: number;
    totalConversions: number;
  }
}
```

#### PATCH `/api/v1/analytics/experiments/:id`
Update experiment.

**Request:**
```typescript
{
  name?: string;
  description?: string;
  status?: 'draft' | 'running' | 'paused' | 'completed';
  traffic_split?: number;
  goal_type?: 'pageview' | 'click' | 'form_submit';
  goal_target?: string;
}
```

**Response:**
```typescript
{
  data: ABExperiment;
}
```

#### POST `/api/v1/analytics/experiments/:id/start`
Start experiment.

**Response:**
```typescript
{
  data: ABExperiment;
}
```

#### POST `/api/v1/analytics/experiments/:id/stop`
Stop experiment.

**Response:**
```typescript
{
  data: ABExperiment;
}
```

### Tracking (Public Endpoint)

#### POST `/api/track`
Record analytics event (no auth required).

**Request:**
```typescript
{
  site_id: string;
  page_id?: string;
  event_type: 'pageview' | 'click' | 'form_submit';
  visitor_id?: string;
  session_id?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  country?: string;
  device_type?: string;
  browser?: string;
  metadata?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  data: {
    success: boolean;
    event_id: string;
  }
}
```

### CRM Analytics

#### GET `/api/v1/analytics/crm/overview`
CRM dashboard stats.

**Response:**
```typescript
{
  data: {
    totalContacts: number;
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    lostDeals: number;
  }
}
```

#### GET `/api/v1/analytics/crm/pipeline`
Pipeline analytics.

**Response:**
```typescript
{
  data: Array<{
    stage: PipelineStage;
    dealCount: number;
    totalValue: number;
    avgDealSize: number;
  }>;
}
```

#### GET `/api/v1/analytics/crm/conversion`
Conversion rates.

**Query Parameters:**
- `startDate?: string`
- `endDate?: string`

**Response:**
```typescript
{
  data: {
    leadToContact: number;
    contactToDeal: number;
    dealToWon: number;
    overallConversion: number;
  }
}
```

## Realtime Subscriptions

The API supports real-time updates via Supabase Realtime. See [Realtime Subscriptions Documentation](./realtime-subscriptions.md) for detailed examples.

**Available Channels:**
- `tasks` - Task changes per project
- `deals` - Deal/pipeline changes
- `crm_activities` - Activity timeline updates per contact/deal
- `emails` - New synced emails

**Example:**
```typescript
supabase
  .channel('tasks')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
    (payload) => handleTaskChange(payload)
  )
  .subscribe();
```

## Request/Response Examples

For detailed request/response examples with JSON payloads, see [API Examples](./api-examples.md).

## Error Responses

All endpoints return errors in the following format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: unknown;
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
