# M.O.M. — Mental Operations Manager

M.O.M. is a caregiver operations app concept. The current repository ships the first functional MVP module: **Dose & Go**, a browser-based prototype for child profiles, caregiver-entered formula calculation, confirmation, and local medication history logging.

> **Important:** This is a portfolio/demo MVP. It does not provide medical advice, medication recommendations, or treatment instructions. Dose & Go only calculates from formulas entered by the caregiver, which must be verified from a clinician, pharmacist, prescription, or official medication label.

## Live MVP scope

- Child profiles with weight, date of birth, color, and notes
- Medication/formula library with dose-per-kg, optional concentration, interval notes, and source/safety notes
- Dose calculator using `child weight × verified formula`
- Safety confirmation gate before logging
- Local history timeline with formula snapshots
- JSON export for local records
- Built-in UX case study section for portfolio review
- No account, no backend, no external dependencies

## Why the MVP starts with Dose & Go

The larger M.O.M. concept is a mental-load operating system for parents and caregivers. Dose & Go was chosen first because it is small enough to ship, emotionally meaningful, and easy to evaluate:

- Can a caregiver find the correct child profile quickly?
- Can the app prevent ambiguous dose logging?
- Can the history answer “did we already give this?” without making the user think too hard?
- Can a sensitive flow feel warm without becoming careless?

## Run locally

This project is static HTML/CSS/JS. No install step is required.

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
├── app.js
├── src/
│   ├── dose.js
│   └── seed.js
├── tests/
│   └── dose.test.mjs
├── docs/
│   ├── architecture.md
│   ├── codex-build-brief.md
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

The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`. Once pushed to `main`, enable GitHub Pages with **Source: GitHub Actions** in the repository settings.

## Portfolio positioning

Recommended case-study title:

**M.O.M. — Designing a caregiver command center for high-pressure medication moments**

Recommended one-liner:

**A functional UX/product MVP that turns child medication logging from a fragile memory task into a verified, local, reviewable flow.**

## Current status

Version `0.1.0` is the first static MVP seed. It is intentionally local-first and dependency-free so the interaction model can be reviewed before committing to a larger React/native build.
