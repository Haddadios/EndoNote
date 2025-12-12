# EndoNote Feature Update Plan

## Overview
This plan outlines the implementation of multiple UI/UX improvements across the Subjective, Objective, and Plan tabs.

---

## Subjective Tab Changes

### 1. Add Age/Gender Section Above Vitals
- Add two new fields above the blood pressure/pulse/respiratory rate section:
  - `age`: TextInput for patient age
  - `gender`: Dropdown with options (Male, Female, Other, Prefer not to say)

### 2. Add Comment Section Under Medical History Alerts
- Add `medicalHistoryComments` TextInput (multiline) after the Medical History Alerts CheckboxGroup

### 3. Add "Other" Duration Option with Custom Input
- Add "Other" option to duration dropdown
- Show conditional TextInput when "Other" is selected for custom duration entry

### 4. Fix Chief Complaint Grammar ("presents with" vs "presenting for")
- Use "presenting for" when selections include: referred for RCT, referred for retreatment, continued treatment, recall appointment
- Use "presents with" for symptom-based complaints: pain, swelling, sensitivity, etc.

### 5. Add First Visit / Continuing Treatment Toggle
- Add prominent toggle switch at the very top of Subjective tab
- When "Continuing Treatment" is selected:
  - **Subjective tab:** Show only BP/Pulse/Respiration + comment box for changes since last visit
  - **Objective tab:** Replace entire section with a single comment box
  - **Chief complaint:** Auto-set to "continuation of treatment" in SOAP output

---

## Objective Tab Changes

### 6. Add Comment Boxes Under Vitality Tests and Clinical Findings
- Add comment TextInput after vitality test section (Cold/EPT/Heat)
- Add comment TextInput after clinical findings section

---

## Plan Tab Changes

### 7. Replace "Other" Treatment Option with Comment Box
- Remove "Other" from treatment options
- Add comment TextInput below the treatment options

### 8. Enlarge and Highlight Consent Toggle
- Increase checkbox size and add highlighted background for better visibility

### 9. Restructure Anesthesia Section
- Remove carpules dropdown
- Add number input box next to each anesthesia type (always visible)
- When user enters a number > 0, that anesthesia type is automatically selected
- Remove "Local infiltration" and add:
  - Buccal infiltration
  - Lingual/Palatal infiltration

### 10. Simplify Working Length Methods
- Remove "Tactile" and "Paper point" from working length method options

### 11. Restructure Working Length Measurements to Per-Canal
- Remove standalone "Measurements" TextInput
- Add to each per-canal prep section:
  - Working length input
  - Reference point text input
- Update "Copy from above" to also copy patency toggle status

### 12. Add Complications Comment Box
- Add comment TextInput below the Complications CheckboxGroup

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/forms/SubjectiveSection.tsx` | Age/gender, medical history comments, duration "other", visit type toggle |
| `src/components/forms/ObjectiveSection.tsx` | Vitality/clinical comments, conditional rendering |
| `src/components/forms/PlanSection.tsx` | Treatment comments, consent styling, anesthesia restructure, WL per-canal, complications comments |
| `src/data/subjective.ts` | Add "other" to painDurations |
| `src/data/materials.ts` | Modify anesthesia locations, remove WL methods |
| `src/data/procedures.ts` | Remove "other" from treatment options |
| `src/types/index.ts` | Add new fields to NoteData and CanalMAF interfaces |
| `src/context/NoteContext.tsx` | Add initial state for new fields |
| `src/utils/soapGenerator.ts` | Handle all new fields, grammar logic for chief complaint |
