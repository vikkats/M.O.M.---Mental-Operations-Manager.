# Codex Build Brief — Future React/TypeScript Upgrade

Use this brief when upgrading the current static MVP into a component-based app.

## Current repo status

The repository contains a dependency-free static MVP. Preserve product behavior and safety copy while converting the implementation.

## Goal

Create a maintainable React + TypeScript version of Dose & Go with equivalent functionality and stronger testability.

## Stack recommendation

- Vite
- React
- TypeScript
- CSS modules or plain CSS variables
- Vitest
- Testing Library
- Playwright
- Zod for form validation

## Required behavior parity

- Add/edit/delete child profiles
- Add/edit/delete medication formulas
- Select child/formula
- Calculate dose from weight × formula
- Show optional volume estimate
- Require three confirmations before log
- Create history snapshot
- Filter history by child
- Copy log summary
- Export JSON
- Reset demo data
- Preserve safety boundary copy

## Suggested file structure

```text
src/
  main.tsx
  App.tsx
  features/
    dashboard/
    dose-and-go/
    profiles/
    medications/
    history/
    case-study/
  components/
    Button.tsx
    Card.tsx
    Field.tsx
    Tabs.tsx
    Toast.tsx
    ConfirmationGate.tsx
  lib/
    dose.ts
    storage.ts
    ids.ts
    date.ts
  data/
    seed.ts
  styles/
    tokens.css
    global.css
```

## Tests to add

### Unit

- Dose calculation
- Volume calculation
- Invalid formula states
- Interval next-time calculation
- Log snapshot creation

### Integration

- Saving a child selects it
- Saving a formula selects it
- Log button disabled until confirmations complete
- Deleting profile keeps history readable

### E2E

- Full happy path: add child → add formula → calculate → confirm → log → history
- Export JSON creates file
- Reset demo data restores seed

## Safety constraints

Do not introduce:

- Real medication database
- AI-generated medical advice
- Dosage recommendations
- “Safe to give” claims
- Hidden default formulas

## Definition of done

- `npm run build` passes
- unit + integration tests pass
- e2e happy path passes
- README updated
- safety copy preserved
- GitHub Pages or Vercel deploy works
