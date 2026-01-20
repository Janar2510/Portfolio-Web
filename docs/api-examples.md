# API Request/Response Examples

This document provides detailed request/response examples for common API endpoints.

## Response Envelope

All API responses follow this structure:

```typescript
{
  data: T;           // The actual response data
  error: null;       // null on success
  meta?: {           // Optional metadata (pagination, etc.)
    pagination?: {
      cursor?: string;
      hasMore: boolean;
    };
    total?: number;
  };
}
```

On error:
```typescript
{
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

## Portfolio Module

### Create Portfolio Site

**POST** `/api/v1/portfolio/site`

**Request:**
```json
{
  "name": "My Portfolio",
  "subdomain": "john-doe",
  "templateId": "template-123"
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "My Portfolio",
    "subdomain": "john-doe",
    "custom_domain": null,
    "is_published": false,
    "seo_title": null,
    "seo_description": null,
    "favicon_url": null,
    "analytics_id": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "published_at": null
  },
  "error": null
}
```

### Create Page

**POST** `/api/v1/portfolio/pages`

**Request:**
```json
{
  "slug": "about",
  "title": "About Me",
  "is_homepage": false,
  "seo_title": "About John Doe - Portfolio",
  "seo_description": "Learn more about my background and experience"
}
```

**Response:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "site_id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "about",
    "title": "About Me",
    "is_homepage": false,
    "is_published": true,
    "sort_order": 1,
    "seo_title": "About John Doe - Portfolio",
    "seo_description": "Learn more about my background and experience",
    "created_at": "2024-01-15T10:35:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  },
  "error": null
}
```

## Project Management Module

### Create Task

**POST** `/api/v1/projects/:projectId/tasks`

**Request:**
```json
{
  "title": "Implement user authentication",
  "description": "Add login and registration functionality with OAuth support",
  "column_id": "550e8400-e29b-41d4-a716-446655440000",
  "due_date": "2024-02-15",
  "priority": "high",
  "assignee_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**
```json
{
  "data": {
    "id": "789e4567-e89b-12d3-a456-426614174001",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality with OAuth support",
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

### Move Task

**POST** `/api/v1/tasks/:id/move`

**Request:**
```json
{
  "column_id": "660e8400-e29b-41d4-a716-446655440001",
  "sort_order": 2
}
```

**Response:**
```json
{
  "data": {
    "id": "789e4567-e89b-12d3-a456-426614174001",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality",
    "column_id": "660e8400-e29b-41d4-a716-446655440001",
    "project_id": "456e7890-e89b-12d3-a456-426614174002",
    "sort_order": 2,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "error": null
}
```

### List Projects (Paginated)

**GET** `/api/v1/projects?status=active&limit=10&offset=0`

**Response:**
```json
{
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174002",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "status": "active",
      "color": "#3B82F6",
      "linked_contact_id": null,
      "linked_deal_id": null,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "pagination": {
      "hasMore": true
    }
  },
  "error": null
}
```

## CRM Module

### List Contacts with Filtering

**GET** `/api/v1/crm/contacts?tags=lead&lead_source=website&limit=20&cursor=xxx`

**Response:**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "company_id": "770e8400-e29b-41d4-a716-446655440000",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-0123",
      "job_title": "Marketing Director",
      "avatar_url": null,
      "social_links": {
        "linkedin": "https://linkedin.com/in/janesmith"
      },
      "address": null,
      "lead_source": "website",
      "tags": ["lead", "hot-lead"],
      "custom_fields": {},
      "last_contacted_at": "2024-01-10T08:00:00Z",
      "created_at": "2024-01-05T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "company_id": null,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": null,
      "job_title": "CEO",
      "avatar_url": null,
      "social_links": {},
      "address": null,
      "lead_source": "website",
      "tags": ["lead"],
      "custom_fields": {},
      "last_contacted_at": null,
      "created_at": "2024-01-08T14:20:00Z",
      "updated_at": "2024-01-08T14:20:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "cursor": "eyJpZCI6Ijk5MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTA4VDE0OjIwOjAwWiJ9",
    "has_more": true
  },
  "error": null
}
```

### Create Contact

**POST** `/api/v1/crm/contacts`

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1-555-0123",
  "job_title": "Marketing Director",
  "company_id": "770e8400-e29b-41d4-a716-446655440000",
  "lead_source": "referral",
  "tags": ["hot-lead", "enterprise"],
  "social_links": {
    "linkedin": "https://linkedin.com/in/janesmith",
    "twitter": "@janesmith"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "company_id": "770e8400-e29b-41d4-a716-446655440000",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-0123",
    "job_title": "Marketing Director",
    "avatar_url": null,
    "social_links": {
      "linkedin": "https://linkedin.com/in/janesmith",
      "twitter": "@janesmith"
    },
    "address": null,
    "lead_source": "referral",
    "tags": ["hot-lead", "enterprise"],
    "custom_fields": {},
    "last_contacted_at": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

### Create Deal

**POST** `/api/v1/crm/deals`

**Request:**
```json
{
  "contact_id": "880e8400-e29b-41d4-a716-446655440000",
  "company_id": "770e8400-e29b-41d4-a716-446655440000",
  "stage_id": "990e8400-e29b-41d4-a716-446655440000",
  "title": "Enterprise License Deal",
  "value": 50000,
  "currency": "EUR",
  "expected_close_date": "2024-03-01",
  "probability": 75,
  "notes": "Follow up next week with proposal"
}
```

**Response:**
```json
{
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "contact_id": "880e8400-e29b-41d4-a716-446655440000",
    "company_id": "770e8400-e29b-41d4-a716-446655440000",
    "stage_id": "990e8400-e29b-41d4-a716-446655440000",
    "title": "Enterprise License Deal",
    "value": 50000,
    "currency": "EUR",
    "expected_close_date": "2024-03-01",
    "actual_close_date": null,
    "probability": 75,
    "notes": "Follow up next week with proposal",
    "lost_reason": null,
    "sort_order": 0,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

## Email Module

### Connect Email Account (Outlook OAuth)

**POST** `/api/v1/email/accounts/connect/outlook`

**Request:**
```json
{
  "code": "oauth_code_from_microsoft",
  "state": "csrf_token"
}
```

**Response:**
```json
{
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "provider": "outlook",
    "email_address": "john.doe@outlook.com",
    "display_name": "John Doe",
    "credentials_encrypted": "encrypted_token_data",
    "is_active": true,
    "last_sync_at": null,
    "sync_state": {},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

### Send Email

**POST** `/api/v1/email/send`

**Request:**
```json
{
  "account_id": "bb0e8400-e29b-41d4-a716-446655440000",
  "to": ["jane.smith@example.com"],
  "cc": ["team@example.com"],
  "subject": "Follow-up: Enterprise License Proposal",
  "body_html": "<p>Hi Jane,</p><p>Following up on our conversation...</p>",
  "contact_id": "880e8400-e29b-41d4-a716-446655440000",
  "deal_id": "aa0e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440000",
    "account_id": "bb0e8400-e29b-41d4-a716-446655440000",
    "external_id": "msg-12345",
    "thread_id": "thread-67890",
    "contact_id": "880e8400-e29b-41d4-a716-446655440000",
    "deal_id": "aa0e8400-e29b-41d4-a716-446655440000",
    "direction": "outbound",
    "subject": "Follow-up: Enterprise License Proposal",
    "body_preview": "Hi Jane, Following up on our conversation...",
    "body_html": "<p>Hi Jane,</p><p>Following up on our conversation...</p>",
    "from_address": "john.doe@outlook.com",
    "to_addresses": ["jane.smith@example.com"],
    "cc_addresses": ["team@example.com"],
    "has_attachments": false,
    "sent_at": "2024-01-15T11:00:00Z",
    "received_at": null,
    "is_read": false,
    "created_at": "2024-01-15T11:00:00Z"
  },
  "error": null
}
```

## Analytics Module

### Track Event (Public Endpoint)

**POST** `/api/track`

**Request:**
```json
{
  "site_id": "550e8400-e29b-41d4-a716-446655440000",
  "page_id": "660e8400-e29b-41d4-a716-446655440001",
  "event_type": "pageview",
  "visitor_id": "visitor-abc123",
  "session_id": "session-xyz789",
  "referrer": "https://google.com",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer-sale",
  "country": "US",
  "device_type": "desktop",
  "browser": "Chrome",
  "metadata": {
    "page_title": "About Me"
  }
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "event_id": "dd0e8400-e29b-41d4-a716-446655440000"
  },
  "error": null
}
```

### Get Analytics Overview

**GET** `/api/v1/analytics/overview?siteId=550e8400-e29b-41d4-a716-446655440000&days=30`

**Response:**
```json
{
  "data": {
    "totalPageviews": 15234,
    "totalUniqueVisitors": 3421,
    "totalFormSubmissions": 89,
    "avgSessionDuration": 245,
    "bounceRate": 32.5
  },
  "error": null
}
```

## Error Examples

### Validation Error

**POST** `/api/v1/projects/:id/tasks`

**Request:**
```json
{
  "title": "",
  "column_id": "invalid-uuid"
}
```

**Response:**
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "title": "Title is required",
      "column_id": "Invalid UUID format"
    }
  }
}
```

### Unauthorized Error

**GET** `/api/v1/projects`

**Response (401):**
```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": null
  }
}
```

### Not Found Error

**GET** `/api/v1/projects/00000000-0000-0000-0000-000000000000`

**Response (404):**
```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found",
    "details": null
  }
}
```

### Rate Limit Error

**Response (429):**
```json
{
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```
