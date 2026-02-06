# AI Design Review Checklist (Supale)

**Purpose:** Every time the AI edits UI, it must run this checklist and report PASS/FAIL with evidence.
**Scope:** components, layouts, pages, globals.css, tailwind config, tokens, shadcn UI.

## A. Design System Integrity (must be all PASS)
- [ ] **Single token system**: No competing palettes (e.g. `zen-*` vs `brand-*`).  
  Evidence: list all palette variable families in `globals.css` + `brand-tokens.css`.
- [ ] **No hardcoded colors** in UI files (hex/rgb/hsl literals) except in token files.  
  Evidence: `rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|hsl\\(" src app` output summary.
- [ ] **Semantic classes used**: backgrounds/text/border/ring use `bg-background`, `text-foreground`, `border-border`, `ring-ring`, `bg-card`, `bg-muted`.  
  Evidence: show 3–5 representative components.

## B. Typography & Spacing (must be all PASS)
- [ ] **Type scale respected**: H1/H2/H3/body/small are distinct and consistent.  
  Evidence: list type styles used in `PageHeader` and one form page.
- [ ] **8px spacing rhythm**: padding/margins use consistent steps (8/12/16/24/32/48/64).  
  Evidence: show key container paddings in AppShell + 2 pages.
- [ ] **Radius consistency**: UI uses `rounded-xl` or `rounded-2xl` consistently.  
  Evidence: list radius usage in Button/Input/Card.

## C. Layout & Navigation (must be all PASS)
- [ ] **Sidebar never overlaps content** on desktop.  
  Evidence: explain CSS layout approach (grid/flex) + which component controls it.
- [ ] **Mobile uses drawer/sheet**, not permanent overlay.  
  Evidence: name the component (e.g. `MobileDrawerNav`) and trigger.
- [ ] **TopNav stable**: title/breadcrumb left, actions right.  
  Evidence: show TopNav JSX structure.

## D. Forms & Accessibility (must be all PASS)
- [ ] **No white inputs on dark theme**.  
  Evidence: confirm Input styles reference semantic tokens.
- [ ] **Visible focus rings**.  
  Evidence: `focus-visible:ring-ring` present on inputs/buttons.
- [ ] **Label + error + help text standardized**.  
  Evidence: show FormField usage in one page.

## E. Motion & Performance (must be all PASS)
- [ ] **Subtle motion only** (160–240ms, small offsets).  
  Evidence: list motion variants or transition durations.
- [ ] **prefers-reduced-motion respected** where motion exists.  
  Evidence: show code path or CSS.

## F. Product Consistency (must be all PASS)
- [ ] **Landing + app share tokens and typography**.  
  Evidence: confirm landing uses same semantic classes.
- [ ] **One primary CTA style** reused everywhere.  
  Evidence: point to Button variant.

## G. Build & Runtime Safety (must be all PASS)
- [ ] `npm run type-check` passes.
- [ ] No new routes introduced accidentally.
- [ ] No changes to domain/services in UI-only changes.

---

## REQUIRED AI OUTPUT FORMAT (every UI PR)
1. **Checklist summary:** PASS/FAIL count  
2. **Failures:** bullet list with file + line references  
3. **Evidence:** grep summaries + 2–3 code snippets  
4. **Screens verified:** list of routes manually checked (desktop + mobile)
