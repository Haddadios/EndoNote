## Referral Template Enhancements Plan

### Goals
- Support multiple header blocks with selectable header layouts.
- Add footer image support (like header logo).
- Increase file upload button size/clarity for header/footer images.
- Apply bold styling to specific labels/segments in the letter.
- Keep docx output and on-screen preview aligned.

---

## Phase 1: Data Model Updates

### 1.1 Update Template Schema
- Add `headerBlocks` array with configurable blocks:
  - `id` (string)
  - `enabled` (boolean)
  - `text` (string)
  - `align` (`left` | `center` | `right`)
  - `logo` (optional image: `dataUrl`, `widthIn`, `heightIn`)
- Add `headerLayout` enum:
  - Example values: `single_column`, `logo_left_text_right`, `stacked_center`
- Add `footerImage` (optional image with `dataUrl`, `widthIn`, `heightIn`, `align`)
- Keep existing single `header` fields for migration, but mark as legacy.

### 1.2 Update Types
- `src/types/index.ts`:
  - Add `ReferralTemplateHeaderBlock`, `ReferralTemplateHeaderLayout`.
  - Add `footer.image` or `footerImage`.
- `src/utils/referralTemplate.ts`:
  - Extend default template to include `headerBlocks` and `headerLayout`.
  - Normalize legacy `header` into one header block on load.

---

## Phase 2: Template Builder UI

### 2.1 Header Blocks UI
- Replace the single header section with:
  - Layout selector dropdown (show preview labels).
  - List of header blocks:
    - Toggle enabled
    - Text area
    - Align select
    - Logo upload + size controls
    - Reorder buttons (up/down)
    - Add/Remove block

### 2.2 Footer Image
- Add upload UI for footer image with width/height inputs and alignment.

### 2.3 Larger Upload Buttons
- Replace tiny file inputs with a styled button:
  - Use `<label>` + hidden input pattern
  - Bigger size, clearer text: “Upload Header Logo”, “Upload Footer Image”, “Upload Signature”
  - Show “Replace” when image exists and “Remove” button

---

## Phase 3: Bold Styling Rules (No Global Styles Yet)

### 3.1 Define Bold Segments
- Apply bold to:
  - Patient Meta labels: `Patient Name`, `Patient Chart Number`, `Patient DOB`, `Date`
  - Intro paragraph patient name
  - `Tooth/Area`
  - `Consultation Date`
  - `Treatment Completion Date`
  - `Comments`

### 3.2 Apply Bold in Docx
- In `src/utils/referralDocx.ts`, build paragraphs using `TextRun[]` with `bold: true` on labels.
- Example:
  - `new TextRun({ text: "Patient Name: ", bold: true }), new TextRun({ text: value })`
- For intro paragraph, split on patient name and bold that substring.

### 3.3 Apply Bold in Preview
- Mirror bold styling in the HTML preview:
  - Wrap labels and patient name with `<strong>`.
  - Keep spacing consistent with docx output.

---

## Phase 4: Header Layouts

### 4.1 Layout Logic (Docx + Preview)
- Use `headerLayout` to render header blocks differently:
  - `single_column`: stacked blocks, full width.
  - `logo_left_text_right`: a two-column table or aligned runs.
  - `stacked_center`: centered blocks, logo above text.
- Ensure docx header uses `Table` when layout requires columns.

---

## Phase 5: Migration & Backward Compatibility

- When loading older template:
  - Convert `header` into one `headerBlocks[0]`.
  - Keep same alignment and logo settings.
- Ensure preview + docx still work with legacy templates.

---

## Checklist (What to Implement Next)
1. Update types & defaults for header blocks, layout, and footer image.
2. Update template normalization to migrate legacy header.
3. Build UI for header blocks + layout selector + footer image.
4. Update docx generator to render headers/footers with new schema.
5. Add bold styling rules in docx + preview.
6. Make upload buttons larger and more discoverable.

---

## Notes
- Global styles (font family/size) can be added later as a separate preference.
- If header layout choices grow, consider a small visual layout picker.
