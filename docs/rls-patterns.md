# Row-Level Security (RLS) Policy Patterns

This document outlines the standard RLS policy patterns used across all database tables in the application.

## Standard Patterns

### 1. User-Owned Tables (Standard Pattern)

For tables where each row belongs to a specific user (identified by `user_id`):

```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "Users can view own rows"
  ON public.table_name FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own rows
CREATE POLICY "Users can create own rows"
  ON public.table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own rows
CREATE POLICY "Users can update own rows"
  ON public.table_name FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own rows
CREATE POLICY "Users can delete own rows"
  ON public.table_name FOR DELETE
  USING (auth.uid() = user_id);
```

**Examples:** `projects`, `contacts`, `companies`, `deals`, `email_accounts`, `email_templates`, `ab_experiments`

### 2. Portfolio Sites (Public Read for Published)

For portfolio sites that need to be publicly accessible when published:

```sql
-- Anyone can view published sites, users can view their own (for SSG rendering)
CREATE POLICY "Anyone can view published portfolio sites"
  ON public.portfolio_sites FOR SELECT
  USING (is_published = TRUE OR auth.uid() = user_id);
```

**Rationale:** Published sites need to be accessible for SSG rendering, but users can always see their own sites regardless of publication status.

### 3. Analytics Events (Anonymous Insert, Owner Read)

For analytics events that need to be trackable by anonymous visitors:

```sql
-- Anyone can insert events (for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (TRUE);

-- Users can view events for their own sites
CREATE POLICY "Users can view own site analytics"
  ON public.analytics_events FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM public.portfolio_sites WHERE user_id = auth.uid()
    )
  );
```

**Rationale:** Anonymous visitors need to be able to track events, but only site owners can view the analytics data.

### 4. Nested Resources (Via Parent Table)

For tables that belong to a parent table (e.g., tasks belong to projects):

```sql
-- Users can view rows that belong to their parent resources
CREATE POLICY "Users can view own parent resources"
  ON public.child_table FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_table
      WHERE parent_table.id = child_table.parent_id
      AND parent_table.user_id = auth.uid()
    )
  );
```

**Examples:** `portfolio_pages`, `portfolio_blocks`, `tasks`, `subtasks`, `task_comments`, `ab_variants`

### 5. Public Read for Published Content

For content that should be publicly readable when published:

```sql
-- Public can view published content
CREATE POLICY "Public can view published content"
  ON public.content_table FOR SELECT
  USING (
    is_published = TRUE
    AND EXISTS (
      SELECT 1 FROM public.parent_table
      WHERE parent_table.id = content_table.parent_id
      AND parent_table.is_published = TRUE
    )
  );
```

**Examples:** `portfolio_pages`, `portfolio_blocks`, `portfolio_styles`

## Policy Naming Convention

Policies should follow this naming pattern:
- `"Users can [action] own [resource]"` - For user-owned resources
- `"Anyone can [action] [resource]"` - For public access
- `"Public can [action] [resource]"` - For public access to published content
- `"Users can [action] own [parent] [resource]"` - For nested resources

## Best Practices

1. **Always enable RLS** on all tables containing user data
2. **Use consistent patterns** across similar table types
3. **Combine conditions** when possible (e.g., `is_published = TRUE OR auth.uid() = user_id`)
4. **Test policies** with both authenticated and anonymous users
5. **Document exceptions** to standard patterns
6. **Use EXISTS subqueries** for nested resource checks for better performance

## Security Considerations

- Never allow anonymous users to read sensitive data
- Always validate ownership in UPDATE and DELETE policies
- Use `WITH CHECK` for INSERT policies to prevent data injection
- Consider rate limiting for anonymous INSERT operations (handled at application level)
