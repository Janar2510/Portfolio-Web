# AI Development Rules

## Core Principles

1. **Follow Architecture**: Always refer to `/docs/architecture.md` and `/docs/api-contracts.md` before making changes
2. **Minimal Diffs**: Prefer surgical, focused changes over large refactors
3. **Type Safety**: Use TypeScript everywhere - no `any` types without explicit justification
4. **API Stability**: Never break public APIs without explicit instruction
5. **One Feature Per Response**: Focus on a single feature or fix per interaction
6. **Design System**: Preserve existing styles, animations, and component patterns

## CSS & Styling Rules

- **ALWAYS** use CSS custom properties (never hardcoded colors)
- **ALWAYS** apply gradient border animation to main cards
- **ALWAYS** use the spacing system (`--space-*` variables)
- **ALWAYS** maintain horizontal alignment with `--card-gap`
- **ALWAYS** follow the component patterns established in the codebase

## Workflow

1. Analyze the request
2. List files to be changed
3. Explain approach briefly
4. Apply diffs
5. Update changelog.md and DeploymentChecklist.md when adding important features

## Forbidden Actions

- Large refactors without approval
- Editing multiple unrelated files simultaneously
- Guessing architecture - ask if unclear
- Breaking changes to public APIs
- Hardcoded values instead of design tokens

## When Requirements Are Unclear

Ask one concise clarification question rather than making assumptions.
