# Safety and Validation Notes

## Status

Dose & Go is a **portfolio/demo MVP**, not a medical device and not a clinical tool.

It must not be marketed as a tool that recommends, validates, or prescribes medication. It only calculates values from caregiver-entered formulas.

## Safety boundary

The app should repeat this boundary consistently:

> M.O.M. does not recommend medicine or treatment. It calculates only from formulas you enter and verify from a clinician, pharmacist, prescription, or official label.

## Why this matters

Child medication workflows are high-risk. Even a beautiful UI can become unsafe if it implies authority it does not have. The product must avoid:

- Pre-filled real medication dosages
- Treatment recommendations
- “Safe to give” claims
- Automated substitutions
- AI-generated medical instructions
- Vague source labels
- Hidden formula assumptions

## MVP mitigations already included

| Risk | Mitigation |
|---|---|
| User thinks app recommends medication | No real drug database; repeated safety copy |
| User logs without checking formula | Required formula-source confirmation |
| User uses stale weight | Required current-weight confirmation |
| User cannot reconstruct dose later | History stores weight and formula snapshot |
| User double-doses accidentally | History timeline and interval hint |
| Sensitive data stored externally | Local-only storage, no backend |

## Validation checklist before public release

### Product safety

- [ ] Review all copy with a pediatric clinician or pharmacist
- [ ] Remove/rename demo medication examples if they look too realistic
- [ ] Add formula source timestamp
- [ ] Add last-weight-updated timestamp
- [ ] Add explicit “call doctor/poison control/emergency services” guidance for overdose concern
- [ ] Add locale-specific emergency guidance only after legal review

### UX validation

- [ ] Test with 5–8 caregivers using a clickable prototype
- [ ] Observe whether users understand the safety boundary
- [ ] Test wrong-child/wrong-formula prevention
- [ ] Test history readability after profile edits
- [ ] Test empty states and destructive actions

### Technical validation

- [ ] Add persistent backup/export flow
- [ ] Add data import after JSON export
- [ ] Add offline service worker if using as PWA
- [ ] Add browser compatibility checks
- [ ] Add automated accessibility checks

### Legal/regulatory review

- [ ] Determine whether future versions could be considered medical software in target markets
- [ ] Review EU MDR and FDA SaMD implications if adding medication databases or recommendations
- [ ] Review privacy obligations if cloud sync or accounts are added
- [ ] Create terms/privacy pages before public user data collection

## Recommended future safety features

1. **Formula source timestamp**  
   Require “verified on” date for each formula.

2. **Weight timestamp**  
   Show when child weight was last updated.

3. **Formula lock**  
   Let users lock formulas after verification and require extra confirmation to edit.

4. **Caregiver handoff**  
   Shared log should show who logged each dose.

5. **Doctor export**  
   Read-only PDF summary of logs, symptoms, and questions.

6. **Emergency copy**  
   Clear “this is not emergency guidance” and instructions to seek local urgent care in overdose or severe symptom situations.

## Hard rule for future AI layer

AI may summarize caregiver-entered logs and help prepare questions, but it should not generate treatment instructions, dosage recommendations, or medication substitutions without a validated clinical safety system.
