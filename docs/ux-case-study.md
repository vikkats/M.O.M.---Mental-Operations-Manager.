# UX Case Study Draft — M.O.M. / Dose & Go

## Working title

**M.O.M. — Designing a caregiver command center for high-pressure medication moments**

## One-liner

A functional MVP that turns child medication logging from a fragile memory task into a verified, local, reviewable flow.

## Overview

M.O.M. began as a broader “mental operations manager” for parents and caregivers: a warm, practical system for reducing household and child-care cognitive load. For the first functional MVP, I narrowed the scope to Dose & Go — a focused child medication calculation and logging flow.

The goal was not to create a medical advice tool. The goal was to design a safer interaction pattern around caregiver-entered, externally verified information.

## The problem

Caregivers often manage medicine while tired, interrupted, worried, or multitasking. In those moments, the dangerous part is not only calculation. It is uncertainty.

Common questions:

- Which child profile am I using?
- Is this weight current?
- What formula did this dose come from?
- Did I already give this medication?
- When was the last logged dose?
- Can another caregiver understand the record later?

## The audience

Primary users are parents and caregivers managing one or more children. Secondary users include partners, grandparents, babysitters, or anyone who may need to check a recent care history.

## Product decision

The original concept could expand into many modules: appointments, fever tracking, documents, family tasks, school forms, and emergency information. I chose Dose & Go first because it had the clearest MVP boundary:

- The user task is specific.
- The flow can be prototyped and tested quickly.
- The stakes force better UX decisions.
- The output is portfolio-ready as both product thinking and implementation.

## MVP scope

Dose & Go includes:

- Child profiles
- Formula library
- Dose calculation
- Confirmation gate
- Local history
- JSON export
- Built-in case study documentation

Out of scope:

- Medication recommendations
- Real drug database
- AI medical advice
- Cloud sync
- Shared accounts
- Push reminders

## User flow

```text
Open app
  ↓
Select child profile
  ↓
Select medication/formula
  ↓
Review calculated dose
  ↓
Confirm weight + formula source + safety boundary
  ↓
Log dose
  ↓
Review history later
```

## Key UX choices

### 1. Explicit selection instead of hidden defaults

The selected child and selected medication are always visible. This reduces the chance of logging against the wrong profile.

### 2. Formula snapshot in history

Past logs store child name, medication name, weight, dose-per-kg, final dose, volume estimate, and time. If a profile changes later, the old log remains understandable.

### 3. Confirmation gate before logging

The MVP requires the caregiver to confirm:

- Current child weight
- Verified formula source
- Understanding that the tool is not medical advice

This is a deliberate friction point.

### 4. Warm visual system

The visual direction avoids cold clinical styling. The product is serious, but it still needs to feel like an app a parent could open during a hard day without feeling judged.

### 5. Local-first build

A static app keeps the first version focused on validating the interaction model. No account, no backend, no privacy ambiguity.

## Visual design

The UI uses:

- Soft clay background
- Cream cards
- Dark ink text
- Coral critical path accent
- Rounded cards and pill controls
- Visible selected states
- Gentle warning and success badges

The result is meant to feel like a calm command center rather than a medical dashboard.

## Accessibility considerations

- Semantic forms and labels
- Keyboard-focus states
- Buttons use text labels, not icon-only controls
- Color is supported by copy and badges
- High contrast between ink text and light surfaces
- Confirmation gate uses native checkboxes

## Safety boundary

The app does not provide medical recommendations. It only calculates from formulas entered by the caregiver. All formula use must be verified externally.

This distinction is repeated in:

- README
- App safety notice
- Formula source note
- Confirmation gate
- Product documentation

## Outcome

The first MVP is a functional static web app with:

- Working profile/formula creation
- Dose calculation utilities
- Confirmation-gated logging
- Local storage
- History filter/export
- Unit tests for calculation logic
- GitHub Pages deployment workflow
- Portfolio documentation and Figma handoff plan

## Future improvements

- PWA offline cache
- Fever/symptom log
- Shared caregiver mode
- Doctor-visit PDF export
- Clinician-reviewed formula templates
- Regulatory/safety review before public health use
- AI doctor-question summary after validation

## Behance closing paragraph

M.O.M. is a product exploration into parental mental load, but Dose & Go is where the idea becomes tangible. By narrowing the scope to one sensitive, repeatable task, I could design not only screens, but safeguards, state logic, edge cases, and a working prototype that shows how the full product could grow.
