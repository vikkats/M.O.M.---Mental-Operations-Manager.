# M.O.M. — Mental Operations Manager

**M.O.M. (Mental Operations Manager)** is a local-first caregiver operations app concept designed for parents managing children, health routines, appointments, emergency information, and daily household tasks under real-life cognitive load.

The project started as a focused **Dose & Go** medication-logging MVP and has evolved into a broader parent-operations prototype with multiple functional modules.

> **Important:** This is a portfolio/demo prototype. It does not provide medical advice, diagnosis, medication recommendations, treatment instructions, or emergency guidance. Health-related modules are designed as structured record-keeping and handoff tools only. Any real medical decision must be verified with a clinician, pharmacist, prescription, official label, or emergency service.

## Live product concept

M.O.M. is built around a simple product idea:

> Parents do not only need reminders. They need an externalized command center for the moments when stress, illness, logistics, and decision fatigue collide.

The app is intentionally warm, mobile-first, and local-first. It focuses on reducing mental load without pretending to replace professional, clinical, legal, or school guidance.

## Functional modules

### 1. Dose & Go

A verified-dose logging flow for child medication routines.

- Child profiles with weight, date of birth, color, and notes
- Medication/formula library
- Dose calculation using `child weight × caregiver-entered verified formula`
- Optional concentration and volume estimate
- Minimum interval display based on recent local logs
- Safety confirmation gate before logging
- Local medication history timeline
- Copyable log summaries
- JSON export

### 2. Fever Log

A symptom and temperature timeline for illness episodes.

- Child-specific fever entries
- Temperature, unit, and measurement method
- Symptom checklist
- Fluids, appetite, energy/mood, and notes
- Filterable fever timeline
- Copy single fever entry
- Copy doctor-ready fever summary

### 3. Appointments

A prep board for doctor visits, school deadlines, paperwork, and family admin.

- Child-specific or family-wide appointments
- Appointment/deadline type
- Date/time, location, provider/contact
- Questions and agenda
- Documents/forms to bring
- Follow-up actions
- Statuses: planned, prep needed, done
- Copyable prep briefs
- Copyable schedule summaries
- Recent health-context bridge from Dose & Go and Fever Log

### 4. Emergency Card

A wallet-style emergency handoff module.

- One emergency card per child
- Allergies and reactions
- Medical conditions / important notes
- Current medications / routine notes
- Pediatrician/doctor details
- Preferred hospital/clinic
- Insurance information
- Emergency contacts
- Access / handoff notes
- Copy single emergency card
- Copy all filtered cards
- Print view

### 5. Family Ops

A lightweight daily handoff board for household and child-related tasks.

- Child-specific or family-wide tasks
- Category, owner, status, priority, due date
- Checklist items
- Notes and blockers
- Filters by child/scope, status, and owner
- Mark today / done / reopen
- Copy task summary
- Copy full family handoff

### Planned: AI Prep Layer

The next roadmap layer is an AI-assisted summarization module that can turn structured logs into:

- doctor-ready summaries
- partner/caregiver handoff notes
- weekly family operations recaps
- appointment prep drafts

This layer is intentionally left for later because the structured data foundation needs to be reliable before adding AI interpretation.

## Why this project matters

M.O.M. is not just a UI exercise. It demonstrates the ability to move from real-world problem framing into product logic, UX structure, functional implementation, and portfolio-ready documentation.

The product problem is grounded in caregiver reality:

- medication routines happen under stress and fatigue
- illness timelines are difficult to remember accurately
- appointments require scattered context from multiple places
- emergency details need to be accessible quickly
- family tasks often live in one parent’s head

M.O.M. turns these fragile memory tasks into structured, local, reviewable flows.

## Product and UX decisions

- **Local-first:** no account, no backend, no external database
- **Mobile-first:** designed for fast use during high-pressure caregiver moments
- **Safety-conscious:** health flows record data but do not recommend decisions
- **Modular:** each feature can stand alone while contributing to the larger command-center concept
- **Portfolio-readable:** product rationale, use cases, design handoff, and roadmap are documented in `/docs`

## Tech stack

- HTML
- CSS
- JavaScript ES modules
- LocalStorage persistence
- GitHub Pages deployment
- GitHub Actions workflow
- Dependency-light static architecture

The project intentionally avoids a heavier framework in this phase so the core interaction model can be reviewed quickly and transparently.

## Run locally

This project is static HTML/CSS/JS.

```bash
npm run dev
```

Then open:

```text
http://localhost:4173
```

## Test the calculation utilities

```bash
npm test
```

Run syntax checks and tests:

```bash
npm run check
```

## Project structure

```text
.
├── index.html
├── styles.css
├── tabs-scroll-fix.css
├── app.js
├── hotfix-profile-edit.js
├── fever-module.js
├── appointments-module.js
├── emergency-card-module.js
├── family-ops-module.js
├── src/
│   ├── dose.js
│   └── seed.js
├── tests/
│   └── dose.test.mjs
├── docs/
│   ├── architecture.md
│   ├── appointments-module.md
│   ├── codex-build-brief.md
│   ├── emergency-card-module.md
│   ├── family-ops-module.md
│   ├── figma-handoff.md
│   ├── product-build-pack.md
│   ├── roadmap.md
│   ├── safety-and-validation.md
│   ├── use-case-analysis.md
│   └── ux-case-study.md
├── figma/
│   ├── screen-inventory.csv
│   └── tokens.json
└── .github/workflows/pages.yml
```

## GitHub Pages deployment

The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`.

To deploy:

1. Push changes to `main`.
2. In repository settings, enable GitHub Pages.
3. Set Pages source to **GitHub Actions**.
4. Wait for the deployment workflow to complete.

## Portfolio positioning

Recommended case-study title:

**M.O.M. — Designing a parent operations system for medication, illness, appointments, emergencies, and daily handoffs**

Recommended one-liner:

**A functional UX/product prototype that turns caregiver mental load into structured, local-first workflows across health routines, family logistics, emergency information, and daily operations.**

## Current status

The prototype now includes five functional modules:

- Dose & Go
- Fever Log
- Appointments
- Emergency Card
- Family Ops

The remaining roadmap layer is the AI Prep Layer, which should summarize existing structured data rather than replace caregiver judgment or professional guidance.
