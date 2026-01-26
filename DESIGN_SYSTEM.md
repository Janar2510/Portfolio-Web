# Portfolio-Web Design System

> **Version:** 2.0 (Cyber-Zen Theme)  
> **Last Updated:** 2026-01-26

---

## 🎨 Color System

### Core Palette

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--zen-dark` | `230 45% 4%` | `#06070B` | Background |
| `--zen-indigo` | `231 40% 12%` | `#121526` | Cards, surfaces |
| `--zen-teal` | `174 100% 45%` | `#00E5BC` | Primary accent |
| `--zen-violet` | `265 100% 70%` | `#B066FF` | Secondary accent |
| `--zen-white` | `210 20% 98%` | `#F8FAFC` | Text, foreground |

### Semantic Colors

```css
/* Semantic mapping */
--background: var(--zen-dark);
--foreground: var(--zen-white);
--card: var(--zen-indigo);
--primary: var(--zen-teal);
--secondary: var(--zen-violet);
--muted: hsl(231 20% 20%);
--muted-foreground: hsl(215 20% 65%);
--border: hsl(231 30% 20%);
```

### Status Colors

| Status | Color | Usage |
|--------|-------|-------|
| Success | `#10B981` | Confirmations, completed |
| Warning | `#F59E0B` | Alerts, pending |
| Error | `#EF4444` | Errors, destructive |
| Info | `#3B82F6` | Information |

### Module Accent Colors

| Module | Color | Token |
|--------|-------|-------|
| Portfolio | `#00E5BC` | `--module-portfolio` |
| Projects | `#8B5CF6` | `--module-projects` |
| CRM | `#F59E0B` | `--module-crm` |
| Analytics | `#3B82F6` | `--module-analytics` |
| Email | `#EC4899` | `--module-email` |

---

## 📝 Typography

### Font Stack

```css
--font-sans: 'General Sans', -apple-system, sans-serif;
--font-display: 'Clash Display', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale (Major Third - 1.25 ratio)

| Size | Token | Value | Usage |
|------|-------|-------|-------|
| xs | `--text-xs` | 12px | Captions, labels |
| sm | `--text-sm` | 14px | Secondary text |
| base | `--text-base` | 16px | Body text |
| lg | `--text-lg` | 18px | Large body |
| xl | `--text-xl` | 20px | Subheadings |
| 2xl | `--text-2xl` | 24px | Section headings |
| 3xl | `--text-3xl` | 30px | Page headings |
| 4xl | `--text-4xl` | 36px | Hero headings |
| 5xl | `--text-5xl` | 48px | Display |
| 6xl | `--text-6xl` | 60px | Large display |

### Font Weights

| Weight | Token | Value |
|--------|-------|-------|
| Light | `--font-light` | 300 |
| Normal | `--font-normal` | 400 |
| Medium | `--font-medium` | 500 |
| Semibold | `--font-semibold` | 600 |
| Bold | `--font-bold` | 700 |

---

## 📐 Spacing System

Base unit: **4px**

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-0` | 0 | 0px |
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |
| `--space-24` | 6rem | 96px |

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Sharp corners |
| `--radius-sm` | 0.25rem | Inputs, badges |
| `--radius` | 0.75rem | Default cards |
| `--radius-lg` | 1rem | Large cards |
| `--radius-xl` | 1.5rem | Hero sections |
| `--radius-2xl` | 2rem | Feature cards |
| `--radius-full` | 9999px | Avatars, pills |

---

## 🌓 Dark/Light Mode

### Implementation

```tsx
// ThemeProvider handles mode switching
// All colors use CSS variables that update based on theme

// Light mode overrides (in globals.css)
.light {
  --background: hsl(210 20% 98%);
  --foreground: hsl(230 45% 4%);
  --card: hsl(0 0% 100%);
  --muted: hsl(210 20% 95%);
}
```

### Rules
1. ALWAYS use CSS variables, never hardcoded colors
2. Test both modes for every component
3. Use `dark:` Tailwind prefix for mode-specific styles

---

## 🎭 Animations

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hovers, toggles |
| `--duration-normal` | 300ms | Transitions |
| `--duration-slow` | 500ms | Page transitions |

### Easing Functions

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Standard Animations

```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale in */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

---

## 🧩 Component Patterns

### Button Variants

| Variant | Class | Usage |
|---------|-------|-------|
| Default | `bg-primary text-primary-foreground` | Primary actions |
| Secondary | `bg-secondary text-secondary-foreground` | Secondary actions |
| Outline | `border border-input bg-transparent` | Tertiary actions |
| Ghost | `hover:bg-accent` | Navigation, icons |
| Destructive | `bg-destructive text-white` | Delete, danger |

### Card Pattern

```tsx
<div className="bg-card rounded-lg border border-border p-6 shadow-lg">
  {/* Card content */}
</div>
```

### Input Pattern

```tsx
<input className="
  flex h-10 w-full rounded-md border border-input 
  bg-background px-3 py-2 text-sm 
  placeholder:text-muted-foreground 
  focus:outline-none focus:ring-2 focus:ring-primary
" />
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## ✅ Checklist for New Components

- [ ] Uses CSS variables for all colors
- [ ] Supports dark and light mode
- [ ] Uses spacing tokens (`--space-*`)
- [ ] Uses typography tokens
- [ ] Follows border-radius conventions
- [ ] Has proper hover/focus states
- [ ] Is responsive (mobile-first)
- [ ] Has proper accessibility (ARIA labels, focus rings)
- [ ] All text uses `useTranslations()` hook
