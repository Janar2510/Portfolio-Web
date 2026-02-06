# AI Rules for Supale Development

## Visual North Star

**Supale should feel like a calm, premium control room — dark, focused, confident — where nothing shouts, everything aligns, and every interaction feels intentional.**

If any screen feels noisy, over-glowy, blurry without purpose, misaligned, or "AI-decorated" — **it is wrong**, even if tokens are correct.

---

## Design System Rules

### 1. Single Source of Truth
- All colors come from `src/styles/brand-tokens.css`
- All semantic mappings in `app/globals.css`
- **NO** hardcoded hex, rgb, or hsl values in components

### 2. Token Usage
- Use semantic tokens: `bg-background`, `text-foreground`, `border-border`
- Use brand tokens for accents: `bg-primary`, `text-primary`
- **NEVER** use `bg-white`, `text-black`, or arbitrary colors

### 3. Component Discipline
- Use existing components from `src/components/ui/*`
- **NO** inline styles
- **NO** "just for this page" overrides
- If a component doesn't exist, create it properly

### 4. Spacing System
- Use 8px base: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- **NO** arbitrary values like `p-[13px]`
- Within groups: tight (8-16px)
- Between groups: loose (32-48px)

### 5. Typography Hierarchy
- One H1 per page
- Logical descent: H1 → H2 → H3 → body
- Labels quieter than values
- **NO** random font weight mixing

### 6. Motion Discipline
- Animations ≤ 400ms
- Subtle offsets (4-12px)
- **MUST** respect `prefers-reduced-motion`
- Motion supports understanding, not decoration

---

## Forbidden Patterns

❌ Glassmorphism (unless explicitly approved)  
❌ Animated gradients  
❌ Multiple accent colors per screen  
❌ Centered layouts in admin tools  
❌ White inputs on dark backgrounds  
❌ Custom shadows outside design system  
❌ Glow effects for decoration  

---

## Before Touching UI

**MUST READ**:
1. [`docs/VISUAL_NORTH_STAR.md`](./VISUAL_NORTH_STAR.md)
2. [`docs/DESIGN_GUARD.md`](./DESIGN_GUARD.md)
3. [`docs/AUTOMATED_DESIGN_CHECKLIST.md`](./AUTOMATED_DESIGN_CHECKLIST.md)

**MUST RUN**:
- Automated Design Checklist (all boxes must check)
- 15-Minute Manual UI Test (if shipping to production)

---

## Definition of Done

A UI change is done only if:

✅ Looks calm  
✅ Feels intentional  
✅ Could survive 3 years without redesign  
✅ All checklist items pass  
✅ No hardcoded colors  
✅ Uses existing components  

---

## When in Doubt

**STOP. ASK. DO NOT GUESS.**

Better to ask than to:
- Break the design system
- Add visual noise
- Create technical debt
- Ship something that needs immediate redesign

---

## Remember

> Hierarchy > decoration  
> Spacing is the design  
> Calm beats clever  
> Boring is premium

**Your job is to remove, not to add.**
