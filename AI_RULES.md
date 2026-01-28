# AI RULES — READ BEFORE MAKING ANY CHANGES

This repository is actively developed using AI-assisted tools.
To prevent architectural drift, ALL AI actions must follow these rules.

## 1. Canonical User Flows (DO NOT DUPLICATE)

There is exactly ONE canonical flow for each feature:

### Authentication
- /[locale]/sign-in
- /[locale]/sign-up
- Server-side auth via Supabase cookies
- Server actions must redirect to sign-in if unauthenticated

### Sites (MVP)
- List: /[locale]/sites
- Create: /[locale]/sites/new
- Edit: /[locale]/sites/[id]/edit
- Preview (public): /s/[slug]

Any legacy or alternative flows MUST redirect to these routes.
Do NOT create parallel editors, forms, or actions.

---

## 2. Forbidden Actions (NEVER DO THESE)

- ❌ Do NOT create new auth flows
- ❌ Do NOT pass auth tokens manually unless explicitly instructed
- ❌ Do NOT modify legacy builder code
- ❌ Do NOT introduce duplicate Create/Edit flows
- ❌ Do NOT refactor unrelated files
- ❌ Do NOT “improve architecture” without request

If unsure: STOP and ask.

---

## 3. Scope Control

- One feature or fix per response
- No speculative enhancements
- No “future-proofing”
- No abstraction without request

MVP first. Polish later.

---

## 4. Canonical Architecture

- Domain logic lives in `src/domain`
- UI calls server actions only
- Server actions enforce auth
- Draft → Publish uses snapshot copy

If a change violates this, it is incorrect.

---

## 5. If Something Is Unclear

STOP.
Ask one clear question.
Do not guess.
