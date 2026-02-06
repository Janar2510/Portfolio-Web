# Design System Documentation Index

**All AI agents MUST read these documents before touching UI code.**

---

## 🎯 Start Here

### [VISUAL_NORTH_STAR.md](./VISUAL_NORTH_STAR.md)
**The single sentence that defines Supale's design philosophy.**

> Supale should feel like a calm, premium control room — dark, focused, confident — where nothing shouts, everything aligns, and every interaction feels intentional.

**Read this first. Everything else flows from this.**

---

## 🔒 Design Guards (Read Before Coding)

### [DESIGN_GUARD.md](./DESIGN_GUARD.md)
**Strict rules AI must follow when editing UI.**

Core principles:
- No visual noise
- Hierarchy > decoration
- Spacing is the design
- Components are sacred
- If unsure, do nothing

**Read before every UI change.**

---

## ✅ Quality Checks (Run Before Shipping)

### [AUTOMATED_DESIGN_CHECKLIST.md](./AUTOMATED_DESIGN_CHECKLIST.md)
**Tickable checklist for AI to verify design quality.**

Covers:
- Layout & Structure
- Color Discipline
- Typography
- Components
- Motion
- Emotional Test

**All boxes must check before shipping.**

### [MANUAL_UI_TEST.md](./MANUAL_UI_TEST.md)
**15-minute manual testing protocol for humans.**

Tests:
- First impression
- Navigation sanity
- Form reality check
- Contrast & fatigue
- Kill the ego test

**Run before production deploy.**

---

## 📊 Technical Reference

### [AI_DESIGN_REVIEW.md](./AI_DESIGN_REVIEW.md)
**Comprehensive design review checklist with evidence requirements.**

Detailed checklist covering:
- Design system integrity
- Typography & spacing
- Layout & navigation
- Forms & accessibility
- Motion & performance
- Product consistency
- Build & runtime safety

**Use for thorough audits and PR reviews.**

---

## 🔧 Current State & Fixes

### [DESIGN_DIAGNOSIS.md](./DESIGN_DIAGNOSIS.md)
**Why the current design feels "off" and how to fix it.**

Identifies:
- Too many containers
- Overuse of soft borders
- Inputs that look like placeholders
- Sidebar heavier than content
- Glow/blur used as filler

**Fix order (DO NOT SKIP)**:
1. Flatten backgrounds
2. Reduce containers by 30-40%
3. Strengthen spacing groups
4. Lower chrome contrast
5. Increase content contrast

---

## 📋 Legacy Documents

### [DESIGN_GUARD_PROMPT.txt](./DESIGN_GUARD_PROMPT.txt)
**Original design guard prompt (superseded by DESIGN_GUARD.md).**

Kept for reference. Use `DESIGN_GUARD.md` instead.

### [UI_TEST_ROUTINE.md](./UI_TEST_ROUTINE.md)
**Original UI test routine (superseded by MANUAL_UI_TEST.md).**

Kept for reference. Use `MANUAL_UI_TEST.md` instead.

---

## 🎓 Reading Order for New AI Agents

1. **VISUAL_NORTH_STAR.md** - Understand the philosophy (2 min)
2. **DESIGN_GUARD.md** - Learn the rules (5 min)
3. **AUTOMATED_DESIGN_CHECKLIST.md** - Know the checks (3 min)
4. **DESIGN_DIAGNOSIS.md** - Understand current issues (5 min)

**Total: 15 minutes to full context.**

---

## 🚨 Emergency Reference

**If you're about to ship and unsure:**

1. Run `AUTOMATED_DESIGN_CHECKLIST.md`
2. If any box fails → STOP
3. Read `DESIGN_GUARD.md` for the rule you broke
4. Fix it
5. Run checklist again

**Do not ship with failing checks.**

---

## Remember

> Hierarchy > decoration  
> Spacing is the design  
> Calm beats clever  
> Boring is premium

**Your job is to remove, not to add.**
