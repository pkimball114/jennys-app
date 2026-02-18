# Style Port Plan: `legacy/jennys-app` -> current app

## File map

### Donor (`legacy/jennys-app`)
- `legacy/jennys-app/src/App.js`
  - Main page composition and layout structure (header, load button, card container, two-column form/preview, table section).
  - Round-level actions (`Load Previous Rounds`, JSON export + submit API).
- `legacy/jennys-app/src/InputForm.js`
  - Form UI and controls (URL, start/end, song title, artist, add/refresh actions).
  - Uses utility-driven time formatting/validation.
- `legacy/jennys-app/src/VideoTable.js`
  - Editable table UI (inline title/artist edits, reorder, preview, remove, copy URL).
- `legacy/jennys-app/src/YoutubePlayer.js`
  - Preview iframe with `start/end/autoplay`.
- `legacy/jennys-app/src/Utils.js`
  - Time conversion/format helpers and JSON download helper.
- `legacy/jennys-app/src/index.css`
  - Tailwind directives (`@tailwind base/components/utilities`) + base body/code defaults.
- `legacy/jennys-app/tailwind.config.js`
  - Tailwind content scan (`./src/**/*`), default theme.
- `legacy/jennys-app/postcss.config.js`
  - PostCSS plugins (`tailwindcss`, `autoprefixer`).
- `legacy/jennys-app/src/App.css`
  - Mostly CRA default styles + generic text input style; appears largely unused because `App.js` imports `index.css`, not `App.css`.

### Target (current app)
- `src/App.js`
  - Single-screen app with form + embedded player + table.
  - Round persistence (`localStorage`), round JSON export, MP3 render/download action.
- `src/YouTubePlayer.js`
  - Embedded YouTube iframe.
- `src/index.css`
  - Global base styles only (system font stack).
- `src/App.css`
  - Mostly CRA defaults; no Tailwind usage.
- `package.json` (repo root)
  - No Tailwind/PostCSS dependencies in target app.

## Findings

## 1) Donor styling system
- Primary styling approach: Tailwind utility classes directly in JSX (`App.js`, `InputForm.js`, `VideoTable.js`).
- Build setup: Tailwind + PostCSS configured in donor (`tailwind.config.js`, `postcss.config.js`, donor `package.json` devDependencies).
- Global styles: `legacy/jennys-app/src/index.css` contains Tailwind directives and base font smoothing + system font stack.
- CSS Modules: not used.
- Component library: no full UI kit; only `@heroicons/react` for icons.
- Design tokens/variables: no CSS custom properties/theme variable system.
- Fonts: default system stack only; no custom webfont integration.

## 2) Donor main page layout + styling ownership
- Top-level page frame and spacing/background:
  - `legacy/jennys-app/src/App.js` (`min-h-screen`, `bg-gray-100`, centered container/card).
- Header and top-right utility action:
  - `legacy/jennys-app/src/App.js` (`Jenny's Music Trivia Lab`, `Load Previous Rounds` button).
- Main content split layout:
  - `legacy/jennys-app/src/App.js` (`flex`, responsive `md:flex-row`).
  - Left: `InputForm`; Right: `YouTubePlayer` preview/placeholder.
- Table section styling and controls:
  - `legacy/jennys-app/src/VideoTable.js` (table header/body row styles, action button styles, hover states).
- Form control styling:
  - `legacy/jennys-app/src/InputForm.js` (Tailwind classes on labels/inputs/buttons).

## 3) Donor user-facing functionality not present in target
- File import flow:
  - `Load Previous Rounds` button + hidden file input to load round JSON from disk.
- Metadata fields per clip:
  - `songTitle` and `artist` inputs are collected and displayed/editable in table.
- Inline editing in table:
  - Editable title/artist cells (local table editing state).
- URL copy interaction:
  - Click URL to copy to clipboard with temporary `Copied!` feedback.
- Per-row preview action:
  - Explicit `Preview` button in table rows.
- Round submission endpoint:
  - `Submit for Processing` posts payload to AWS API after exporting JSON.
- Named round metadata:
  - `roundName` input used to name exported JSON.

Notes:
- Target already has functionality donor does not (localStorage persistence, MP3 render/download). Port should avoid regressing these.

## Minimal low-risk port plan (PR-sized steps)

1. **PR 1: Install and wire Tailwind in target without behavior changes**
   - Add `tailwindcss`, `postcss`, `autoprefixer` dev deps and config files at repo root.
   - Replace `src/index.css` content with Tailwind directives + existing base defaults.
   - Keep current JSX untouched; confirm app renders identically.

2. **PR 2: Introduce layout shell classes only**
   - Apply donor-like page container/card/header layout in `src/App.js` (no data/model changes).
   - Keep existing controls and handlers intact; only move markup wrappers and class names.
   - Validate mobile/desktop structure and no functional regressions.

3. **PR 3: Style existing controls/table using Tailwind utilities**
   - Convert current form buttons/inputs/table to Tailwind class styling.
   - Do not add new actions yet; purely visual parity and spacing/readability improvements.
   - Preserve all existing event handlers and button labels.

4. **PR 4: Add donor metadata fields (`songTitle`, `artist`) to target data model and table**
   - Extend clip creation form and `tableData` rows with optional metadata.
   - Display columns in table; keep existing export/render paths backward compatible.
   - Include migration fallback for old localStorage rows lacking new fields.

5. **PR 5: Add donor productivity controls (import JSON + copy URL + row preview button)**
   - Add `Load Previous Rounds` file import and merge/replace behavior.
   - Add URL copy with feedback and explicit row `Preview` action.
   - Keep existing `Generate MP3`, `Export round JSON`, and persistence flows.

6. **PR 6: Optional external submit integration behind feature flag/env**
   - Add `roundName` and `Submit for Processing` only if still needed.
   - Gate external endpoint URL with env var; no hard-coded remote URL.
   - Surface clear loading/error states; keep this isolated from local render endpoint.

