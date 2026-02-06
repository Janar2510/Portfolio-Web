# Automated AI Design Review Checklist

**Use this before every PR or AI-generated change.**

---

## A. Layout & Structure

- [ ] Max width applied (1200–1360px)
- [ ] Content aligned left (no random centering)
- [ ] Sidebar + content never overlap
- [ ] Clear vertical rhythm (no stacked noise)

---

## B. Color Discipline

- [ ] Background is neutral (not gradient-heavy)
- [ ] Only ONE primary accent per screen
- [ ] No glow unless interactive focus/hover
- [ ] No hardcoded colors outside tokens

---

## C. Typography

- [ ] One clear H1 per page
- [ ] Headings descend logically (H1 → H2 → body)
- [ ] Body text readable without zoom
- [ ] Labels quieter than values

---

## D. Components

- [ ] Uses shared Button / Input / Card
- [ ] No inline styles
- [ ] No custom shadows
- [ ] Radius consistent across components

---

## E. Motion

- [ ] Motion supports understanding (not decoration)
- [ ] No animation longer than 400ms
- [ ] `prefers-reduced-motion` respected

---

## F. Emotional Test (MOST IMPORTANT)

- [ ] Feels **calm**
- [ ] Feels **premium**
- [ ] Feels **intentional**
- [ ] Feels **boring in a good way**

---

## Result

**If any box fails → do not ship.**

---

## Quick Self-Test

1. Hide all gradients, glow, and animations
2. Does the UI still work?
3. If not → effects were masking bad layout

**Fix layout first. Add effects never (unless explicitly requested).**
