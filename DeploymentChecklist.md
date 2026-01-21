# Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Set up production Supabase project
- [ ] Configure environment variables
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] Database connection strings
  - [ ] Email provider credentials (OAuth)
  - [ ] Analytics keys

### Database
- [ ] Run all migrations
  - [ ] Verify onboarding tables created (onboarding_progress, onboarding_events, tooltip_dismissals, feature_checklist)
  - [ ] Verify auto-create triggers for onboarding records
  - [ ] **IMPORTANT: Run CRM upgrade migration (20240109000000_upgrade_crm_to_pipedrive_style.sql)**
  - [ ] Execute data migration functions:
    - [ ] `migrate_companies_to_organizations()`
    - [ ] `migrate_contacts_to_persons()`
    - [ ] `create_default_pipeline_from_stages()`
    - [ ] `migrate_deals_to_crm_deals()`
  - [ ] Verify all new CRM tables created (crm_organizations, crm_persons, crm_pipelines, crm_deals, crm_products, crm_leads, crm_labels, crm_notes, crm_files, crm_filters, crm_goals, crm_workflows, etc.)
  - [ ] Verify data migration completed successfully
- [ ] Verify RLS policies are enabled
- [ ] Set up database backups
- [ ] Test database connection

### Build & Test
- [ ] Run type checking: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Test all API endpoints
- [ ] Test Kanban board drag-and-drop functionality
- [ ] Test task creation and editing
- [ ] Test subtasks and comments
- [ ] Test portfolio analytics dashboard
- [ ] Test CRM analytics dashboard
- [ ] Verify analytics data aggregation
- [ ] Verify i18n translations are complete
- [ ] Verify design system CSS variables are properly loaded
- [ ] Test dark mode across all components
- [ ] Verify component utility classes (buttons, inputs, cards, tables, modals)
- [ ] Test responsive breakpoints and layout system
- [ ] Verify Kanban board styles and drag states
- [ ] Test Portfolio editor block styles and toolbar
- [ ] Verify module-specific styles (CRM pipeline, analytics dashboard)
- [ ] Test shadow and animation utilities
- [ ] Verify icon sizes and accessibility features

### Security
- [ ] Review RLS policies
- [ ] Verify rate limiting is configured
- [ ] Check API authentication middleware
- [ ] Review environment variable security

## Deployment

### Infrastructure
- [ ] Deploy Supabase project
- [ ] Deploy Next.js application (Vercel/Platform)
- [ ] Configure custom domains
- [ ] Set up CDN if applicable

### Post-Deployment
- [ ] Verify production URLs are accessible
- [ ] Test authentication flow
- [ ] Test portfolio site rendering
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts

## Rollback Plan
- [ ] Document rollback procedure
- [ ] Keep previous deployment artifacts
- [ ] Test rollback process
