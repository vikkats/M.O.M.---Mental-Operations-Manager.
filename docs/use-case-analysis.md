# Use-Case Analysis — Dose & Go MVP

## System boundary

Dose & Go is the first module of M.O.M. It supports local child profiles, formula storage, calculation, confirmation, and history logging. It does not validate medical correctness, recommend medications, or synchronize across devices.

## Actors

| Actor | Description | Primary need |
|---|---|---|
| Primary caregiver | Parent or guardian managing child medicine | Calculate and log safely under pressure |
| Secondary caregiver | Partner, grandparent, babysitter | Check what was already logged |
| Product reviewer | Recruiter, design lead, portfolio visitor | Understand the UX thinking and shipped MVP |
| Future clinician validator | Medical expert reviewing safety model | Identify risk controls and unsafe assumptions |

## Use case 1 — Add child profile

**Goal:** Create a child profile used by the calculator.

**Preconditions:** App is open.  
**Trigger:** User opens Profiles and submits the child form.

### Main success scenario

1. User enters child name.
2. User enters weight in kg.
3. User optionally enters date of birth, color, and notes.
4. System validates positive weight.
5. System saves child profile locally.
6. System selects the child for Dose & Go.

### Exceptions

- Missing name → show validation message.
- Invalid weight → block save and request positive weight.
- Existing profile edited → update profile without changing old logs.

### Acceptance criteria

- Profile appears in list immediately.
- Selected state is visible.
- Calculator uses the selected profile.

## Use case 2 — Add medication/formula

**Goal:** Store a caregiver-verified formula for later calculation.

**Preconditions:** User has a formula from a trusted external source.  
**Trigger:** User opens Meds and submits formula form.

### Main success scenario

1. User enters medication/formula label.
2. User enters dose-per-kg value.
3. User enters dose unit.
4. User optionally enters concentration and interval.
5. User enters required source/safety note.
6. System validates positive formula value.
7. System saves formula locally.
8. System selects formula for Dose & Go.

### Exceptions

- Missing source note → block save.
- Invalid dose-per-kg → block save.
- Missing concentration → still allow dose calculation, but hide volume estimate.

### Acceptance criteria

- Formula cards visibly warn users to verify before use.
- Calculator displays formula line.
- Source note remains visible on medication card and confirmation gate.

## Use case 3 — Calculate and log dose

**Goal:** Log a medication event with a clear calculation snapshot.

**Preconditions:** At least one child and one formula exist.  
**Trigger:** User opens Dose & Go.

### Main success scenario

1. User selects child.
2. User selects formula.
3. System calculates dose.
4. System shows formula line.
5. System shows optional volume estimate.
6. User confirms child weight is current.
7. User confirms formula source is verified.
8. User confirms app is not medical advice.
9. User optionally adds note.
10. User logs dose.
11. System creates local history entry.
12. Confirmation gate resets.

### Exceptions

- Missing child/formula → calculator shows empty-state guidance.
- Invalid formula or weight → calculator blocks log.
- Confirmation unchecked → log button remains disabled.

### Acceptance criteria

- Log cannot be created without all confirmations.
- Log captures child name, medication name, weight, formula, dose, volume, timestamp, and note.
- History is sorted newest-first.

## Use case 4 — Review history

**Goal:** Answer “what was given and when?”

**Preconditions:** At least one log exists.  
**Trigger:** User opens History.

### Main success scenario

1. User views all logs sorted newest-first.
2. User filters by child when needed.
3. User copies a single log summary.
4. User exports JSON for backup or review.

### Exceptions

- No logs → empty state explains next step.
- Clipboard unavailable → app displays summary in toast instead.

### Acceptance criteria

- User can determine child, medication, amount, and timestamp at a glance.
- Export contains full local state and `exportedAt` timestamp.

## Use case 5 — Delete profile/formula/log

**Goal:** Remove outdated local data while preserving history snapshots.

**Preconditions:** Item exists.  
**Trigger:** User clicks delete.

### Main success scenario

1. System asks for confirmation.
2. User confirms.
3. System removes selected object.
4. If the active object was removed, system selects the next available object.
5. Existing logs remain readable because snapshots were stored at log time.

### Acceptance criteria

- Destructive actions are confirmed.
- Removing current profile/formula does not crash calculator.
- Existing logs do not become blank.

## Risk analysis

| Risk | Severity | MVP mitigation |
|---|---:|---|
| User treats demo formula as medical instruction | High | Demo wording, no real drug database, source note required, confirmation gate |
| Wrong child selected | High | Selected profile visible, child name shown near calculation/log |
| Old weight used | High | Weight confirmation required before logging |
| Double dosing | High | History visible, last log/interval hint |
| Local data lost | Medium | JSON export and local-only copy |
| Shared caregiver mismatch | Medium | Roadmap item for authenticated shared history |

## Open questions for future validation

- Should a child weight update require a timestamp?
- Should formulas expire or require periodic reconfirmation?
- Should history show “last dose of this medication” more prominently?
- What language best prevents overtrust without causing panic?
- Which flows require clinician/legal review before public release?
