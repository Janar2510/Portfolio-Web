# API Contracts

## Authentication

### POST `/api/auth/login`
Authenticate user and return session.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  session: Session;
  user: User;
}
```

## Portfolio API

### GET `/api/portfolio/sites`
Get all portfolio sites for authenticated user.

**Response:**
```typescript
{
  sites: PortfolioSite[];
}
```

### POST `/api/portfolio/sites`
Create a new portfolio site.

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
  site: PortfolioSite;
}
```

### GET `/api/portfolio/sites/[id]`
Get portfolio site by ID.

**Response:**
```typescript
{
  site: PortfolioSite;
}
```

### PUT `/api/portfolio/sites/[id]`
Update portfolio site.

**Request:**
```typescript
{
  name?: string;
  content?: BlockSchema;
  settings?: SiteSettings;
}
```

**Response:**
```typescript
{
  site: PortfolioSite;
}
```

## Projects API

### GET `/api/projects`
Get all projects for authenticated user.

**Query Parameters:**
- `status?: string`
- `limit?: number`
- `offset?: number`

**Response:**
```typescript
{
  projects: Project[];
  total: number;
}
```

### POST `/api/projects`
Create a new project.

**Request:**
```typescript
{
  name: string;
  description?: string;
  status: ProjectStatus;
}
```

**Response:**
```typescript
{
  project: Project;
}
```

## CRM API

### GET `/api/crm/contacts`
Get all contacts for authenticated user.

**Response:**
```typescript
{
  contacts: Contact[];
}
```

### POST `/api/crm/contacts`
Create a new contact.

**Request:**
```typescript
{
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}
```

**Response:**
```typescript
{
  contact: Contact;
}
```

### GET `/api/crm/deals`
Get all deals for authenticated user.

**Response:**
```typescript
{
  deals: Deal[];
}
```

## Email API

### GET `/api/email/accounts`
Get connected email accounts.

**Response:**
```typescript
{
  accounts: EmailAccount[];
}
```

### POST `/api/email/accounts`
Connect a new email account.

**Request:**
```typescript
{
  provider: 'outlook' | 'apple';
  credentials: OAuthCredentials;
}
```

**Response:**
```typescript
{
  account: EmailAccount;
}
```

### GET `/api/email/messages`
Get email messages.

**Query Parameters:**
- `accountId: string`
- `limit?: number`
- `offset?: number`

**Response:**
```typescript
{
  messages: EmailMessage[];
  total: number;
}
```

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
