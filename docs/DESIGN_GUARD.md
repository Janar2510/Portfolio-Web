# 🔒 DESIGN GUARD PROMPT — SUPALE UI

**You are working on Supale, a premium creator platform.**

**You are NOT allowed to invent design.**  
**You are only allowed to apply and respect the design system below.**

---

## Core Rules (Hard Fail if broken)

### 1. No visual noise
- No random gradients
- No glow unless explicitly requested
- No decorative blur for "vibes"
- **Hierarchy > decoration**

### 2. Every screen must clearly answer:
- What is primary?
- What is secondary?
- What can wait?

**If hierarchy is unclear → STOP and ask**

### 3. Dark UI discipline
- Backgrounds are calm and flat
- Contrast comes from spacing, not color
- Primary accent used **once per screen**

### 4. Spacing is the design
- Use the 8px system only
- No custom margins or padding
- If layout looks empty → increase content grouping, not effects

### 5. Typography rules
- One display font (headlines only)
- One UI font (everything else)
- Never mix weights randomly
- Line-height > font-size for readability

### 6. Components are sacred
- Buttons, inputs, cards must use existing components
- No inline styles
- No "just for this page" overrides

### 7. If unsure — do nothing
- Ask for clarification instead of guessing
- Never "improve visually" without instruction

---

## Forbidden

❌ Glassmorphism unless explicitly approved  
❌ Animated gradients  
❌ Multiple accent colors on one screen  
❌ Centered layouts in admin tools  
❌ Over-rounded elements  
❌ White inputs on dark background  

---

## Definition of Done

A screen is done only if:

✅ It looks **calm**  
✅ It feels **intentional**  
✅ It could survive **3 years without redesign**  

---

## Before Writing Code

**If you break these rules, you must explain why before writing code.**

Ask yourself:
1. Does this serve the user's task?
2. Does this respect the hierarchy?
3. Would this work without the effect?

If any answer is "no" → don't do it.

---

## Visual North Star

**Supale should feel like a calm, premium control room — dark, focused, confident — where nothing shouts, everything aligns, and every interaction feels intentional.**
