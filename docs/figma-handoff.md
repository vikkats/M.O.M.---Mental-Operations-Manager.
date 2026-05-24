# Figma Handoff — M.O.M. / Dose & Go

This document defines the Figma version to create from the functional MVP. It is written as a designer handoff so the visual file, portfolio screenshots, and app implementation stay aligned.

## Recommended Figma file name

**M.O.M. — Mental Operations Manager / Dose & Go MVP**

## File pages

1. **00 Cover**  
   Hero cover, title, one-liner, device mockups.

2. **01 Product Strategy**  
   Problem statement, audience, MVP focus, safety boundary.

3. **02 User Flows**  
   Dose & Go flow, add child, add formula, log dose, review history.

4. **03 Wireframes**  
   Low-fidelity mobile flow before visual polish.

5. **04 Design System**  
   Colors, typography, spacing, buttons, cards, forms, badges, confirmation modules.

6. **05 Final Mobile Screens**  
   Primary app screens in 390 × 844 frames.

7. **06 Desktop Responsive**  
   Desktop dashboard and case-study layout.

8. **07 Prototype Notes**  
   Interaction details, safety gate behavior, empty/error states.

9. **08 Behance Export**  
   Large stitched presentation frames ready for Behance upload.

## Frame sizes

| Surface | Size | Purpose |
|---|---:|---|
| Mobile base | 390 × 844 | Main app prototype |
| Mobile small | 360 × 800 | Responsive stress test |
| Desktop | 1440 × 1024 | Portfolio hero + dashboard |
| Behance frame | 1400 × variable | Case-study sections |

## Screen inventory

| ID | Screen | Priority | Notes |
|---|---|---:|---|
| S01 | Command Center | P0 | Product overview, selected child/formula, module map |
| S02 | Dose & Go Calculator | P0 | Child/formula selectors, dose output, confirmation gate |
| S03 | Child Profiles | P0 | Profile list, add/edit form |
| S04 | Medication Formula Library | P0 | Formula cards, source note, add/edit form |
| S05 | History Timeline | P0 | Logs, filter, export, delete |
| S06 | Empty States | P0 | No child, no med, no logs |
| S07 | Confirmation States | P0 | Disabled log, enabled log, logged toast |
| S08 | Case Study In-App | P1 | UX rationale and design tokens |
| S09 | Future Modules | P1 | Fever log, appointments, emergency card, family ops |

## Design direction

**Tone:** Warm command center, not cold hospital software.  
**Feel:** Soft, calm, grounded, explicit.  
**Core metaphor:** An external brain for caregiving under pressure.

## Visual tokens

| Token | Value | Use |
|---|---|---|
| Ink | `#2B211E` | Primary text, main CTA |
| Muted | `#71625D` | Secondary text |
| Soft Clay | `#F7EFE9` | Background |
| Cream | `#FFF9F5` | Card surface |
| Line | `#EADBD3` | Borders/dividers |
| Coral | `#D97059` | Critical path accent |
| Warm Brown | `#8F5D4A` | Secondary accent |
| Sage | `#8CA58B` | Secondary profile color |
| Lavender | `#A58FB5` | Module accent |
| Blue Gray | `#89A7B1` | Alternate module accent |
| Danger | `#A43838` | Destructive actions |
| Success | `#34775B` | Confirmation state |

## Component list

### Navigation

- Pill tab navigation
- Active tab state
- Horizontal scroll on mobile

### Cards

- Hero card
- Phone preview card
- Child profile card
- Medication formula card
- History log card
- Future module card
- Notice/safety card

### Forms

- Text input
- Number input
- Date input
- Color input
- Textarea
- Select
- Validation hint

### Buttons

- Primary pill button
- Ghost pill button
- Text button
- Danger button
- Disabled state

### Safety components

- Confirmation gate container
- Confirmation checklist item
- Warning badge
- Safety notice
- Formula source note

### Feedback

- Toast message
- Empty state
- Selected state ring
- Disabled log state

## Mobile flow prototype

1. Command Center → tap **Open Dose & Go**
2. Dose & Go → select child
3. Dose & Go → select formula
4. Confirmation gate → check all three items
5. Log dose → toast appears
6. History → new log shown at top
7. Copy summary → toast feedback

## Key screen copy

### Product one-liner

Caregiver chaos, externalized.

### Safety statement

M.O.M. does not recommend medicine or treatment. It calculates only from formulas you enter and verify from a clinician, pharmacist, prescription, or official label.

### Confirmation labels

- The child weight is current.
- The formula source is verified.
- I understand this is not medical advice.

### Empty history

No logs match this filter. Create a dose log from Dose & Go to see it here.

## Behance case-study layout

1. Cover: app name + tagline + phone mockups
2. Context: mental load, child medication, fragmented memory
3. Problem: high-pressure caregiver moments
4. MVP decision: why Dose & Go first
5. User flow: child → formula → confirm → log → review
6. Wireframes: simple grayscale flow
7. Final UI: 5 primary screens
8. Design system: colors, cards, confirmation gate
9. Safety boundary: no recommendations, verified formulas only
10. Outcome: functional MVP + next steps

## Developer handoff notes

- Use `figma/tokens.json` as the canonical token seed.
- Keep the confirmation gate visually attached to calculation output.
- Use child/profile color for recognition, but never rely on color alone.
- Preserve formula snapshot language in history.
- Keep destructive actions visually quiet but confirmed.
