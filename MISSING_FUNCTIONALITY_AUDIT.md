# Missing Functionality Audit

**Date:** 2025-01-21  
**Status:** Comprehensive audit of non-functional features, broken routes, and missing implementations

## Summary

This document catalogs all non-functional features, broken navigation routes, missing API endpoints, and incomplete implementations found in the codebase.

---

## 🔴 Critical Issues (Blocking Core Functionality)

### 1. Missing Portfolio Settings Route
**Location:** `apps/web/components/portfolio/PortfolioSiteView.tsx:111`  
**Issue:** Button navigates to `/${locale}/portfolio/settings` but route doesn't exist  
**Impact:** Settings button is non-functional  
**Fix Required:** Create `/apps/web/app/[locale]/(admin)/portfolio/settings/page.tsx`

### 2. Missing Form Submissions API Route
**Location:** `apps/web/components/portfolio/forms/FormSubmissionsManager.tsx:45`  
**Issue:** Component fetches from `/api/portfolio/forms/submissions` but route doesn't exist  
**Impact:** Form submissions cannot be viewed/managed  
**Fix Required:** Create `/apps/web/app/api/portfolio/forms/submissions/route.ts`

### 3. Portfolio Site Creation Authentication Issue
**Location:** `apps/web/app/api/portfolio/site/route.ts`  
**Issue:** Authentication not working properly (recently fixed but needs verification)  
**Impact:** Users cannot create portfolio sites  
**Status:** Recently fixed - needs testing

---

## 🟡 High Priority (Core Features Incomplete)

### 4. Domain Verification Not Implemented
**Location:** `apps/web/components/portfolio/domain/DomainSettings.tsx:61-65`  
**Issue:** Domain verification is a placeholder  
```typescript
// TODO: Implement actual domain verification
const verified = true; // Placeholder
```
**Impact:** Custom domain verification doesn't work  
**Fix Required:** Implement actual DNS verification logic

### 5. Form Block Submission Not Implemented
**Location:** `apps/web/components/portfolio/blocks/FormBlock.tsx:42`  
**Issue:** Form submission handler is TODO  
```typescript
// TODO: Implement form submission
```
**Impact:** Contact forms on portfolio sites don't work  
**Fix Required:** Implement form submission handler and API endpoint

### 6. Projects Block Not Fetching Data
**Location:** `apps/web/components/portfolio/blocks/ProjectsBlock.tsx:28`  
**Issue:** Projects are not fetched from database  
```typescript
// TODO: Fetch actual projects from database
```
**Impact:** Projects block shows no data  
**Fix Required:** Implement project fetching logic

### 7. Email Sending Placeholder
**Location:** `apps/web/app/api/email/send-imap/route.ts:52-53`  
**Issue:** Email sending is placeholder  
```typescript
// Placeholder: return success for now
// TODO: Implement actual SMTP email sending
```
**Impact:** Cannot send emails via IMAP  
**Fix Required:** Implement SMTP email sending

### 8. Email Sync Placeholder
**Location:** `apps/web/app/api/email/sync-imap/route.ts:42-43`  
**Issue:** Email sync is placeholder  
```typescript
// Placeholder: return empty array for now
// TODO: Implement actual IMAP email sync
```
**Impact:** Cannot sync emails from IMAP accounts  
**Fix Required:** Implement IMAP email synchronization

### 9. Email Connection Test Placeholder
**Location:** `apps/web/app/api/email/test-imap/route.ts:63-64`  
**Issue:** IMAP connection test is placeholder  
```typescript
// Placeholder: return success for now
// TODO: Implement actual IMAP connection test
```
**Impact:** Cannot test IMAP credentials  
**Fix Required:** Implement IMAP connection testing

### 10. Email Sending from Contact Page
**Location:** `apps/web/app/[locale]/(admin)/crm/contacts/[id]/emails/page.tsx:119`  
**Issue:** Email sending not implemented  
```typescript
// TODO: Implement actual email sending via provider
```
**Impact:** Cannot send emails from contact detail page  
**Fix Required:** Implement email sending functionality

---

## 🟠 Medium Priority (UI/UX Issues)

### 11. Settings Panel - General Tab Placeholder
**Location:** `apps/web/components/portfolio/editor/panels/SettingsPanel.tsx:53`  
**Issue:** General settings show "coming soon"  
**Impact:** General site settings unavailable  
**Fix Required:** Implement general settings form

### 12. Page Settings Panel Placeholder
**Location:** `apps/web/components/portfolio/editor/panels/PageSettingsPanel.tsx:14`  
**Issue:** Shows "Page settings coming soon"  
**Impact:** Cannot edit page-level settings  
**Fix Required:** Implement page settings panel

### 13. Block Settings - Content Editing Limited
**Location:** `apps/web/components/portfolio/editor/panels/BlockSettingsPanel.tsx:151`  
**Issue:** Many block types show "Content editing coming soon"  
**Impact:** Limited content editing for most block types  
**Fix Required:** Implement content editing for all block types

### 14. Block Settings - Settings Tab Limited
**Location:** `apps/web/components/portfolio/editor/panels/BlockSettingsPanel.tsx:244`  
**Issue:** Many block types show "Settings coming soon"  
**Impact:** Limited settings for most block types  
**Fix Required:** Implement settings for all block types

### 15. Add Block Implementation Missing
**Location:** `apps/web/components/portfolio/editor/EditorCanvas.tsx:157`  
**Issue:** Comment says "TODO: Implement add block"  
**Impact:** Adding blocks may not work properly  
**Fix Required:** Verify and fix add block functionality

### 16. Blocks Panel - Add Block TODO
**Location:** `apps/web/components/portfolio/editor/panels/BlocksPanel.tsx:55`  
**Issue:** Comment says "TODO: Implement add block"  
**Impact:** Add block from sidebar may not work  
**Fix Required:** Implement add block functionality

### 17. Media Library - Multiple Selection TODO
**Location:** `apps/web/components/portfolio/media/MediaLibrary.tsx:227`  
**Issue:** Multiple selection handling is TODO  
```typescript
// TODO: Handle multiple selection
```
**Impact:** Multiple media selection may not work  
**Fix Required:** Implement multiple selection handling

### 18. Colors Panel - Dark Mode Toggle TODO
**Location:** `apps/web/components/portfolio/editor/panels/ColorsPanel.tsx:387`  
**Issue:** Dark mode toggle is TODO  
```typescript
// TODO: Toggle dark mode
```
**Impact:** Cannot toggle dark mode preview  
**Fix Required:** Implement dark mode toggle

### 19. Company Detail View Missing
**Location:** `apps/web/app/[locale]/(admin)/crm/companies/page.tsx:225`  
**Issue:** Shows "Company detail view coming soon"  
**Impact:** Cannot view company details  
**Fix Required:** Implement company detail page/component

---

## 🟢 Low Priority (Nice to Have)

### 20. Subdomain Availability Check TODO
**Location:** `apps/web/components/onboarding/steps/CustomizeStep.tsx:55`  
**Issue:** Subdomain availability check is TODO  
**Impact:** Cannot validate if subdomain is available  
**Fix Required:** Implement subdomain availability API check

### 21. Avatar Upload TODO
**Location:** `apps/web/components/onboarding/steps/ProfileStep.tsx:48`  
**Issue:** Avatar upload to Supabase Storage is TODO  
```typescript
// TODO: Upload to Supabase Storage and get public URL
```
**Impact:** Avatar uploads don't work  
**Fix Required:** Implement Supabase Storage upload

### 22. Content Saving TODO
**Location:** `apps/web/components/onboarding/steps/ContentStep.tsx:22`  
**Issue:** Content saving to portfolio blocks is TODO  
```typescript
// TODO: Save content to portfolio blocks
```
**Impact:** Onboarding content not saved  
**Fix Required:** Implement content saving to portfolio

### 23. Locale Context TODO
**Location:** `apps/web/components/onboarding/steps/TourStep.tsx:18`  
**Issue:** Locale hardcoded instead of from context  
```typescript
const locale = 'et'; // TODO: Get from context
```
**Impact:** Tour step always uses Estonian  
**Fix Required:** Get locale from context/params

---

## 📋 Missing API Routes (Per api-contracts.md)

### Portfolio Module
- ✅ `/api/portfolio/site` - EXISTS
- ✅ `/api/portfolio/site/publish` - EXISTS
- ❌ `/api/portfolio/site/unpublish` - MISSING
- ✅ `/api/portfolio/pages` - EXISTS
- ✅ `/api/portfolio/pages/:id` - EXISTS
- ❌ `/api/portfolio/pages/reorder` - MISSING
- ✅ `/api/portfolio/pages/:id/blocks` - EXISTS
- ✅ `/api/portfolio/pages/:id/blocks/reorder` - EXISTS
- ✅ `/api/portfolio/blocks/:id` - EXISTS
- ✅ `/api/portfolio/styles` - EXISTS
- ✅ `/api/portfolio/templates` - EXISTS
- ✅ `/api/portfolio/templates/:id` - EXISTS
- ✅ `/api/portfolio/templates/:id/apply` - EXISTS
- ❌ `/api/portfolio/forms/submissions` - MISSING (Critical)
- ❌ `/api/portfolio/media` - MISSING (if needed)
- ❌ `/api/portfolio/projects` - MISSING (if needed for portfolio)

### CRM Module
- ❌ `/api/crm/contacts` - MISSING (using direct Supabase calls)
- ❌ `/api/crm/companies` - MISSING (using direct Supabase calls)
- ❌ `/api/crm/pipeline` - MISSING (using direct Supabase calls)
- ❌ `/api/crm/deals` - MISSING (using direct Supabase calls)
- ❌ `/api/crm/activities` - MISSING (using direct Supabase calls)
- ❌ `/api/crm/follow-ups` - MISSING (using direct Supabase calls)

### Projects Module
- ❌ `/api/projects` - MISSING (using direct Supabase calls)
- ❌ `/api/projects/:id` - MISSING
- ❌ `/api/projects/:id/columns` - MISSING
- ❌ `/api/projects/:id/tasks` - MISSING
- ❌ `/api/tasks/:id` - MISSING
- ❌ `/api/tasks/:id/move` - MISSING
- ✅ `/api/projects/ical` - EXISTS

### Email Module
- ❌ `/api/email/accounts` - MISSING
- ❌ `/api/email/accounts/connect/outlook` - MISSING (OAuth exists but may need wrapper)
- ❌ `/api/email/accounts/connect/apple` - MISSING (connect-apple exists but may need wrapper)
- ❌ `/api/email/threads` - MISSING
- ❌ `/api/email/send` - MISSING
- ❌ `/api/email/templates` - MISSING
- ✅ `/api/email/sync-imap` - EXISTS (placeholder)
- ✅ `/api/email/send-imap` - EXISTS (placeholder)
- ✅ `/api/email/test-imap` - EXISTS (placeholder)

### Analytics Module
- ✅ `/api/analytics/track` - EXISTS
- ❌ `/api/analytics/overview` - MISSING
- ❌ `/api/analytics/pageviews` - MISSING
- ❌ `/api/analytics/visitors` - MISSING
- ❌ `/api/analytics/referrers` - MISSING
- ❌ `/api/analytics/pages` - MISSING
- ❌ `/api/analytics/experiments` - MISSING
- ❌ `/api/analytics/crm/overview` - MISSING
- ❌ `/api/analytics/crm/pipeline` - MISSING
- ❌ `/api/analytics/crm/conversion` - MISSING

---

## 🔗 Broken Navigation Routes

### Missing Routes
1. `/[locale]/portfolio/settings` - Referenced in PortfolioSiteView but doesn't exist
2. `/[locale]/crm/companies/:id` - Company detail view missing
3. `/[locale]/portfolio/editor` - May need redirect or default page handling

### Routes That May Need Verification
- All portfolio editor routes (`/portfolio/editor/[pageId]`)
- All CRM detail routes
- All project detail routes

---

## 🎯 Action Items by Priority

### Immediate (Critical)
1. ✅ Fix portfolio site creation authentication (DONE)
2. Create `/api/portfolio/forms/submissions` route
3. Create `/[locale]/portfolio/settings` page
4. Fix domain verification implementation

### High Priority (This Week)
5. Implement form block submission
6. Implement projects block data fetching
7. Implement email sending (SMTP)
8. Implement email sync (IMAP)
9. Complete block settings panels
10. Complete page settings panel

### Medium Priority (Next Sprint)
11. Implement missing API routes for CRM
12. Implement missing API routes for Projects
13. Implement missing API routes for Email
14. Implement missing API routes for Analytics
15. Complete company detail view
16. Implement media library multiple selection

### Low Priority (Backlog)
17. Subdomain availability check
18. Avatar upload to Supabase Storage
19. Onboarding content saving
20. Dark mode toggle in editor
21. Locale context fixes

---

## 📊 Statistics

- **Critical Issues:** 3
- **High Priority:** 7
- **Medium Priority:** 9
- **Low Priority:** 4
- **Missing API Routes:** ~30+
- **Total Issues:** 23+ code issues + 30+ missing routes

---

## Notes

- Many features use direct Supabase calls instead of API routes. This works but doesn't follow the architecture pattern.
- Some TODO comments may be outdated - verify before implementing.
- API contracts document shows `/api/v1/` prefix but current routes use `/api/` - need to decide on versioning strategy.
