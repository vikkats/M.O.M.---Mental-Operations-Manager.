# Architecture Notes

## Current architecture

The first MVP is a dependency-free static web app.

```text
index.html → app.js → src/dose.js + src/seed.js
                   ↓
              localStorage
```

## Why static first

The repository was empty, so the first priority was to ship a functional, reviewable MVP quickly. Static architecture keeps the interaction model visible and deployable without framework setup.

Benefits:

- No install step
- No build pipeline required
- Easy GitHub Pages deployment
- Low maintenance
- Good for UX review and portfolio demonstration

Tradeoffs:

- No component system beyond template functions
- No routing
- No backend sync
- No account model
- Manual state management

## State management

State is stored in memory and persisted to `localStorage` under:

```js
mom-dose-and-go-v1
```

The state includes:

- `children`
- `medications`
- `logs`
- selected child/formula IDs
- active tab
- confirmation gate state

## Calculation logic

Pure calculation utilities live in `src/dose.js` so they can be tested separately.

Important functions:

- `calculateDose(child, medication)`
- `roundTo(value, precision)`
- `getNextEligibleTime(lastTakenISO, intervalHours)`
- `sortLogsNewestFirst(logs)`

## Testing

Current test coverage is intentionally small but focused on calculation correctness and sorting.

```bash
npm test
```

## Deployment

GitHub Pages workflow is included at:

```text
.github/workflows/pages.yml
```

The workflow uploads the static repository root and deploys it through GitHub Pages.

## Future React/Next architecture

Recommended when moving beyond the static MVP:

```text
src/
  app/
  components/
  features/
    children/
    medications/
    dose-and-go/
    history/
  lib/
    dose.ts
    storage.ts
    validation.ts
  data/
  styles/
```

Recommended stack:

- Vite + React + TypeScript for a portfolio SPA
- Next.js only if server rendering, auth, or API routes become necessary
- Zod for validation
- Zustand or React context for small app state
- IndexedDB for richer local-first storage
- Playwright for end-to-end flows
- axe-core for accessibility checks

## Backend decision point

Do not add a backend until at least one of these is required:

- Shared caregiver accounts
- Cross-device sync
- Push notifications
- Secure document storage
- Clinician-reviewed formula templates

## Privacy notes

The current MVP stores all information locally in the browser. A future cloud version must treat child profiles and medication history as sensitive personal data.
