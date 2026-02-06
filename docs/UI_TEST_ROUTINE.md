# 15-minute Manual UI Test Routine (timer-based)

Goal: in 15 minutes you can confidently say “release-ready UI” or pinpoint what’s broken.

### Minute 0–2: Baseline sanity
- **Open**: `/en/sign-in`
- **Check**: input backgrounds, text contrast, focus ring visible, button looks primary.
- **Resize to mobile width**: confirm layout doesn’t explode.

### Minute 2–5: App shell stability
- **Open**: `/en/dashboard`
- **Check**:
  - Sidebar fixed and does not overlap content
  - TopNav visible and aligned
  - Page padding feels consistent (not cramped, not huge)
  - Toggle mobile: hamburger opens drawer; drawer closes; content still accessible.

### Minute 5–7: Sites list + empty state
- **Open**: `/en/sites`
- **Check**:
  - PageHeader present (title/subtitle/actions)
  - EmptyState if no sites; CTA button uses primary style
  - Table/cards align to grid; spacing consistent

### Minute 7–9: Create site form quality
- **Open**: `/en/sites/new`
- **Check**:
  - Form fields styled (no white fields)
  - Radio/template cards have clear hover/selected state
  - Error messages readable; spacing between fields consistent

### Minute 9–12: Editor usability
- **Open**: `/en/sites/[id]/edit`
- **Check**:
  - Sticky action bar (Save/Preview) is visible and not covering fields
  - Sections are visually grouped (cards/panels)
  - Labels/inputs align; no random huge gaps
  - Sidebar still doesn’t overlay the editor

### Minute 12–14: Preview + Publish polish
- **Open**: `/en/sites/[id]/preview`
- **Check**:
  - Preview canvas looks like a site (browser frame ok)
  - Draft/Published badge clear
  - Publish/Unpublish buttons clearly distinct
  - Public URL shown when published

### Minute 14–15: Public page consistency
- **Open**: `/s/[slug]`
- **Check**:
  - Typography matches brand
  - Spacing looks intentional
  - Colors match palette tokens
  - No dev artifacts, no missing styles

## Pass/Fail rule
**FAIL** if any of these happen:
- white inputs on dark
- sidebar covers content
- inconsistent button styles
- unreadable text
- random spacing chaos

**PASS** only if all routes look like the same product.
