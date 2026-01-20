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
- [ ] Verify RLS policies are enabled
- [ ] Set up database backups
- [ ] Test database connection

### Build & Test
- [ ] Run type checking: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Test all API endpoints
- [ ] Verify i18n translations are complete

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
