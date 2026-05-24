# M.O.M. Product Build Pack

## Product name

**M.O.M. — Mental Operations Manager**

## Product thesis

Parents and caregivers do not only need reminders. They need a calm external brain for moments where fatigue, urgency, and responsibility collide. M.O.M. turns scattered caregiver tasks into structured, checkable flows.

## MVP module

**Dose & Go**

A focused medication-support flow for child profiles, caregiver-entered formulas, dose calculation, confirmation, and local history logging.

## Positioning

M.O.M. is not a medical recommendation engine. It is a caregiver operations layer. The app should reduce ambiguity around what was entered, calculated, confirmed, and logged.

## Primary user

A parent/caregiver managing one or more children while juggling household tasks, school logistics, appointments, symptoms, and medicine schedules.

## Primary problem

Medication moments often happen when the caregiver is tired, interrupted, or worried. The most dangerous UX problem is not visual complexity; it is ambiguity:

- Which child is this for?
- What weight was used?
- What formula was used?
- Did someone already give this?
- When was the last dose?
- Where did this instruction come from?

## MVP goal

Enable a caregiver to complete this task after setup:

> Select child → select verified formula → review calculated dose → confirm safety checks → log dose → later verify history.

## Non-goals for MVP

- No medication recommendations
- No real drug database
- No AI medical advice
- No treatment suggestions
- No cloud sync
- No account/authentication
- No push notifications yet
- No pediatric dosage validation yet

## Product principles

1. **Friction belongs before risk, not after it.**  
   The confirmation gate is intentional. Sensitive tasks should not be one-tap by default.

2. **Every log needs a snapshot.**  
   History stores child name, weight, formula, medication name, amount, and timestamp so later edits do not corrupt past context.

3. **Warm does not mean casual.**  
   The UI should feel supportive, but the interaction model must remain explicit and careful.

4. **Local-first before cloud complexity.**  
   The MVP proves value without accounts, backends, or sync risk.

5. **The app never pretends to be the doctor.**  
   It calculates only from caregiver-entered, externally verified formulas.

## P0 requirements

### Child profiles

- Add child name
- Add weight in kg
- Optional date of birth
- Optional notes
- Select profile for calculator
- Edit/delete profiles

### Medication/formula library

- Add medication/formula label
- Add dose-per-kg value
- Add dose unit
- Optional concentration for volume estimate
- Optional minimum interval hours
- Required source/safety note
- Select formula for calculator
- Edit/delete formulas

### Calculator

- Calculate dose as `weightKg × dosePerKg`
- Show formula line clearly
- Show optional volume estimate when concentration exists
- Show last-log-based next eligible time when interval exists
- Disable logging until confirmations are complete

### Confirmation gate

Required confirmations:

- Child weight is current
- Formula source is verified
- User understands the MVP is not medical advice

### History

- Create local log
- Store formula snapshot
- Filter by child
- Delete individual logs
- Clear all logs
- Export JSON

## P1 requirements

- Fever/symptom logging
- Medication schedule reminders
- Multiple caregivers with shared history
- Emergency profile card
- PDF export for doctor visits
- PWA offline caching

## P2 requirements

- Clinician-reviewed medication template system
- Barcode/label scan capture
- AI summary for doctor-prep notes
- Family handoff board
- School/appointment document vault

## Data model

### Child

```json
{
  "id": "child-demo-mia",
  "name": "Mia",
  "weightKg": 18.4,
  "dateOfBirth": "2021-06-12",
  "color": "#D97059",
  "notes": "Optional caregiver notes"
}
```

### Medication/formula

```json
{
  "id": "med-demo-a",
  "name": "Demo fever syrup",
  "dosePerKg": 0.4,
  "doseUnit": "units",
  "concentration": 2,
  "volumeUnit": "ml",
  "minIntervalHours": 6,
  "sourceNote": "Verified source note",
  "color": "#D97059"
}
```

### Dose log

```json
{
  "id": "log-demo-1",
  "childId": "child-demo-mia",
  "childName": "Mia",
  "medicationId": "med-demo-a",
  "medicationName": "Demo fever syrup",
  "totalDose": 7.36,
  "doseUnit": "units",
  "volume": 3.68,
  "volumeUnit": "ml",
  "weightKg": 18.4,
  "dosePerKg": 0.4,
  "takenAt": "2026-01-01T10:00:00.000Z",
  "note": "Optional note"
}
```

## Core flow

1. User opens M.O.M.
2. User sees current child/formula state on the command center.
3. User opens Dose & Go.
4. User selects child.
5. User selects medication formula.
6. System calculates dose and optional volume.
7. User confirms weight, formula source, and safety understanding.
8. User logs dose.
9. System writes local history entry with a snapshot.
10. User can filter/export history.

## Acceptance criteria

- A new visitor can understand the purpose within 10 seconds.
- The demo can be used without setup, but all demo formulas are clearly labeled as demo-only.
- The calculator never logs without the confirmation gate.
- Deleting a child or medication does not erase past logs.
- A history log contains enough context to understand what was calculated later.
- The product docs explain the safety boundary clearly.

## Edge cases

- No child profile exists
- No formula exists
- Weight is zero, negative, or invalid
- Formula value is zero, negative, or invalid
- Concentration is missing
- User deletes active child/formula
- User changes profile weight after a log
- User wants to export before clearing history
- User opens app on another device and expects history
- User misunderstands demo formula as real medical guidance

## Safety copy

Recommended persistent line:

> M.O.M. does not recommend medicine or treatment. It calculates only from formulas you enter and verify from a clinician, pharmacist, prescription, or official label.

Recommended confirmation language:

> I understand this calculator does not replace medical guidance.

## Success metrics for MVP testing

- Time to complete log after setup
- Number of taps/clicks to select child/formula
- User confidence in whether a dose was already logged
- User understanding of formula source requirement
- Error rate from wrong child or wrong formula selection
- Accessibility pass for labels, keyboard, contrast, and focus states

## Build decision

The first repo version is static and dependency-free. This keeps the product focused on UX proof and makes GitHub Pages deployment easy. A later React/Next version can be built after the flow is validated.
