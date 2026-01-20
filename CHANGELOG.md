# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure and architecture
- Monorepo setup with Turbo
- Next.js 14 application scaffold with App Router
- TypeScript configuration across all packages
- i18n implementation with next-intl (English and Estonian)
- Supabase client setup (browser, server, middleware)
- Service layer structure (Portfolio, Projects, CRM, Email)
- Shared packages (@portfolio/shared, @portfolio/database)
- Documentation (architecture.md, api-contracts.md, ai-rules.md)
- Directory structure for apps, packages, and Supabase functions
- Tailwind CSS with custom properties and gradient border animations
- Basic routing structure with locale support
- Protected admin routes with authentication
- Dashboard page with gradient border cards
- Environment variable templates
- Database migration for profiles and user_settings tables
- RLS policies for multi-tenant security
- Automatic profile creation trigger on user signup
- Profile service for managing user profiles and settings
- Portfolio module database migration (sites, pages, blocks, styles, templates)
- Comprehensive RLS policies for portfolio module (public read access for published content)
- Portfolio service with full CRUD operations for sites, pages, blocks, and styles
- Template system with apply functionality
- Block reordering support
- Project management module database migration (projects, columns, tasks, subtasks, comments, attachments)
- RLS policies for project management module
- Project service with full CRUD operations for projects, columns, tasks, subtasks, comments, and attachments
- Kanban board support with column and task reordering
- Automatic task completion when moved to done column
- Default column creation on project creation
- CRM module database migration (companies, contacts, pipeline stages, deals, activities, follow-ups)
- RLS policies for CRM module
- CRM service with full CRUD operations for all CRM entities
- Pipeline management with customizable stages
- Activity timeline tracking
- Follow-up reminder system
- Automatic contact last_contacted_at updates
- Automatic deal close date when moved to won stage
- Email integration module database migration (accounts, emails, templates)
- RLS policies for email module
- Email service with full CRUD operations for accounts, emails, and templates
- Email account management with encrypted credentials
- Email synchronization support with sync state tracking
- Email thread/conversation grouping
- Email linking to contacts and deals
- Automatic CRM activity creation from emails
- Email template system with variable substitution
- Analytics and A/B testing module database migration (events, experiments, variants, daily rollups)
- RLS policies for analytics module (public can insert events for published sites)
- Analytics service with event tracking and A/B testing support
- Event tracking with UTM parameters, device, browser, and country data
- A/B experiment management with variant tracking
- Automatic conversion tracking for A/B tests
- Daily analytics aggregation support
- Site analytics summary with key metrics
- Standardized RLS policy patterns across all migrations
- Updated portfolio_sites policy to combine public/owner access in single policy
- Updated analytics_events policy to allow anonymous inserts (WITH CHECK TRUE)
- Created RLS patterns documentation for consistency
- Added high-priority database indexes for common queries
- Optimized combined indexes for analytics_events, emails, and portfolio_blocks
- Comprehensive API contracts documentation with all endpoints
- API versioning with `/api/v1/` prefix
- Consistent response envelope format across all endpoints
- Detailed API request/response examples document
- JSON examples for common endpoints (tasks, contacts, deals, emails, analytics)
- Error response examples with different error scenarios
- Realtime subscriptions documentation with Supabase Realtime examples
- Reusable React hook for managing realtime subscriptions (useRealtimeSubscription)
- Channel examples for tasks, deals, CRM activities, and emails
- Best practices and performance considerations for realtime
- Prettier configuration for code formatting
- ESLint integration with Prettier
- Shadcn UI setup with components.json
- Tailwind CSS configuration with Shadcn UI theme
- Button component from Shadcn UI
- EditorConfig for consistent code style
- Setup documentation and development guides
- MCP server setup for Supabase integration
- MCP configuration files and setup script
- Documentation for Supabase MCP server (hosted and self-hosted options)
- Supabase project configuration (pcltfprbgwqmymmveloj)
- Setup scripts for Supabase project initialization
- Migration verification script
- Quick start guide with step-by-step instructions
- Auth provider configuration documentation
- Supabase project initialized and configured
- All migrations applied successfully
