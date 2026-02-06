# design-system-implementation-plan

# Goal: Redesign Whole App & Landing Page
Implement the new "Supale" Motion-Driven Design System (Monochrome + Blue Accent) across the entire application and landing page.

## User Review Required
> [!IMPORTANT]
> This is a major visual overhaul.
> - **Primary Color**: Changing to `#18181B` (Zinc-900).
> - **CTA Color**: Changing to `#2563EB` (Blue-600).
> - **Fonts**: Switching to `Archivo` (Headings) and `Space Grotesk` (Body).
> - **Radius**: Standardizing on `0.5rem` (8px).

## Proposed Changes

### 1. Foundation (Config & Assets)
#### [MODIFY] [tailwind.config.ts](file:///Users/janarkuusk/Portfolio-Web/tailwind.config.ts)
- Update color palette (primary, secondary, accent, background, text).
- Update typography font families.
- Update border radius and other tokens.

#### [MODIFY] [app/globals.css](file:///Users/janarkuusk/Portfolio-Web/app/globals.css)
- Update CSS variables to match the new Design System tokens.
- Import new Google Fonts (Archivo & Space Grotesk).

#### [MODIFY] [app/[locale]/layout.tsx](file:///Users/janarkuusk/Portfolio-Web/app/[locale]/layout.tsx)
- Apply the new font classes to the body/root element.

### 2. Components (Global)
#### [MODIFY] [src/components/ui/button.tsx](file:///Users/janarkuusk/Portfolio-Web/src/components/ui/button.tsx)
- Update button variants to match "Motion-Driven" style (hover states, padding, radius).

#### [MODIFY] [src/components/ui/card.tsx](file:///Users/janarkuusk/Portfolio-Web/src/components/ui/card.tsx)
- Update card styling (shadows, hover effects).

### 3. Landing Page
#### [MODIFY] [src/components/landing/HeroSection.tsx](file:///Users/janarkuusk/Portfolio-Web/src/components/landing) (and others)
- Apply new typography and spacing.
- Implement scroll animations (entrance effects).

### 4. App Layout
#### [MODIFY] [src/components/layout/Sidebar.tsx](file:///Users/janarkuusk/Portfolio-Web/src/components/layout/Sidebar.tsx)
- Update sidebar styling to match the new monochrome aesthetic.

## Verification Plan
### Automated Tests
- `npm run dev` to verify build and visual regression.

### Manual Verification
- Check Landing Page: Typography, Colors, Animations.
- Check Dashboard/App: Sidebar, Buttons, Cards.
- Verify Light/Dark mode contrast (though Design System focuses on specific look, we ensure a11y).
