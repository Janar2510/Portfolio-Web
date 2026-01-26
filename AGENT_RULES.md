# Agent Development Rules

> **MANDATORY**: All AI agents MUST read and follow these rules before generating ANY code.

---

## 🚨 Critical Rules

### Rule 1: Complete Before Proceeding

**Every module, feature, or component MUST be 100% functional before starting the next one.**

Checklist before moving to next feature:
- [ ] All CRUD operations working
- [ ] All API routes implemented and tested
- [ ] All UI components rendering correctly
- [ ] All translations added (EN + ET)
- [ ] Dark/Light mode tested
- [ ] Responsive design verified

### Rule 2: Design System Compliance

**ALWAYS use design tokens from `/DESIGN_SYSTEM.md`**

```tsx
// ✅ CORRECT
<div className="bg-card text-foreground border-border">

// ❌ WRONG
<div style={{ backgroundColor: '#121526', color: '#F8FAFC' }}>
```

Required:
- Use CSS custom properties for ALL colors
- Use spacing tokens (`space-*`)
- Use typography tokens (`text-*`, `font-*`)
- Apply dark/light mode support

### Rule 3: Translation Requirement

**Every user-facing string MUST be translated.**

```tsx
// ✅ CORRECT
const t = useTranslations('module.section');
<h1>{t('title')}</h1>

// ❌ WRONG
<h1>Welcome to Dashboard</h1>
```

Required:
- Add keys to `/messages/en.json`
- Add keys to `/messages/et.json`
- Use `useTranslations()` hook

### Rule 4: Component Pattern

All new components MUST:
- Be TypeScript with proper type definitions
- Support both locales (EN/ET)
- Follow existing component structure
- Include proper accessibility (ARIA)
- Have proper hover/focus states

### Rule 5: API Route Pattern

All API routes MUST:
- Use auth middleware
- Return `{ data, error }` envelope
- Validate input with Zod schemas
- Use service layer (not direct DB calls)
- Handle errors gracefully

```typescript
// Standard API response format
return NextResponse.json({
  data: result,
  error: null
});

// Error format
return NextResponse.json({
  data: null,
  error: { code: 'ERROR_CODE', message: 'Human readable message' }
}, { status: 400 });
```

---

## 📋 Implementation Order

Agents MUST follow this exact order:

```
1. Fix Critical Issues (from MISSING_FUNCTIONALITY_AUDIT.md)
2. Complete Portfolio Module (100%)
3. Complete CRM Module (100%)
4. Complete Projects Module (100%)
5. Complete Email Module (100%)
6. Complete Analytics Module (100%)
7. i18n Audit + Missing Translations
8. Payment Integration
9. End-to-End Testing
10. Documentation Update
```

---

## 🔧 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `page.tsx` | `app/[locale]/(admin)/portfolio/page.tsx` |
| API Routes | `route.ts` | `app/api/portfolio/site/route.ts` |
| Components | PascalCase | `PortfolioSiteView.tsx` |
| Hooks | camelCase with `use` prefix | `usePortfolioSite.ts` |
| Services | PascalCase + Service | `PortfolioService.ts` |
| Types | PascalCase | `PortfolioTypes.ts` |

---

## 🎨 Styling Rules

1. **ALWAYS** use Tailwind CSS classes
2. **ALWAYS** use CSS custom properties (never hardcode colors)
3. **ALWAYS** use the spacing system
4. **ALWAYS** maintain horizontal alignment
5. **ALWAYS** test dark/light mode

---

## 🚫 Forbidden Actions

- Large refactors without explicit approval
- Editing multiple unrelated files simultaneously
- Guessing architecture - ask if unclear
- Breaking changes to public APIs
- Hardcoded values instead of design tokens
- Skipping translations
- Moving to next module before current is 100% complete

---

## 📖 Reference Documents

Before starting any work, read:

1. `/DESIGN_SYSTEM.md` - Visual standards
2. `/docs/architecture.md` - System architecture
3. `/docs/api-contracts.md` - API specifications
4. `/docs/ai-rules.md` - Development rules
5. `/MISSING_FUNCTIONALITY_AUDIT.md` - Known issues

---

## ✅ Pre-Commit Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] All translations added
- [ ] Dark/Light mode works
- [ ] Responsive design works
- [ ] No hardcoded colors or values
