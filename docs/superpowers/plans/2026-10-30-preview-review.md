# Preview Review Implementation Plan

> **For agentic workers:** Use the approved scope continuously; independent notes and mascot domains may be delegated under dispatching-parallel-agents. Review the integrated change once before local commit.

**Goal:** Apply the user's annotated screenshots to the offline wireframe without publishing.
**Architecture:** Preserve the detached exporter and persistent shell. Refine existing controllers and use separate CSS files for the independently edited notes and mascot regions; integrate these in the exporter.
**Tech Stack:** Browser JS/CSS, existing Three.js/esbuild, TypeScript exporter, Playwright Chromium.
**Spec:** docs/superpowers/specs/2026-10-30-preview-review-design.md

## Global Constraints

- feat/members-wireframe only, commit + normal push after final verification (subsequently authorized by user); no PR/merge/deploy/force push.
- No src/, docs/design/, commercial copy/prices, auth, access or dependency changes.
- Local state only; no uploads, real PDF, network, secrets or IA integration.

## Review Focus

- Every sidebar item reachable in short windows with the scroll chrome hidden.
- Menus stay usable at viewport edges, by keyboard/touch and after card redraw.
- E-book references preserve locked/owned routing; untrusted note text stays inert.
- Mascot eye curvature is visibly distinct from the body, with no lighting gradients on the body; reduced-motion and offscreen cleanup remain real.
- Avatar selection, reward selection, navigation mode and Escape never overwrite one another.

### Task 1: Shell, layout and account

Files: scripts/offline-preview-nav.js, scripts/offline-preview-runtime.js, scripts/offline-preview-workspace.js, scripts/refine-preview-workspace.ts; create docs/preview/review.css and scripts/verify-preview-review.ts.

- [x] Write/run failing integration assertions for nonactive sidebar labels, no scroll overflow, removed header phrase, Edit/Close, three adornments, portrait cover ratio, clean tabs/story borders and AI copy placement.
- [x] Restore sidebar/drawer labels while preserving compact-only spring and group collapse. Widen sidebar and preserve hidden-scroll keyboard/wheel accessibility. Add scroll-state frosted header.
- [x] Refine cover geometry, story surfaces, tabs, AI title/copy placement, personalization spacing/toggle and reward selectors.
- [x] Verify desktop/mobile and short-window behavior; existing route and access fixtures remain unchanged.

### Task 2: Dynamic notes

Owner files: scripts/offline-preview-notes.js, docs/preview/notes-review.css, scripts/verify-notes-review.ts.

Interfaces retained: window.previewNotes.mount()/closeTransient(); existing .notes-board, .board-column[data-column], [data-note-editor], .product-card[data-product], .save-resource-button. Agent may create UI dynamically at mount; parent integrates stylesheet only. Use window.snapshots via existing global snapshots for demo product metadata; no real file reads/uploads.

- [x] Reproduce native select and always-visible edit/delete controls in a failing browser assertion.
- [x] Replace with styled dropdown and corner action menu, accessible labels/keyboard/focus/Escape/outside dismissal, anchor/clamp at viewport edges. Keep drag handle and delete/undo.
- [x] Add board context actions plus visible equivalent and local e-book reference chooser; preserve XSS protection and locked references.
- [x] Verify interactions and mobile containment using final HTML after integration.

### Task 3: Flat mascot with spherical gaze and dot trail

Owner files: scripts/mascot-volume.js, scripts/mascot-dotfield.js, docs/preview/mascot-review.css, scripts/verify-mascot-volume.ts. Existing createMascotVolume({host,button,path,kind,color,onState}) API and snapshot fields retained; extra gaze/eye position/material snapshots allowed in preview-runtime.d.ts (parent owns declaration changes).

The parent moves .ai-studio-copy outside .ai-studio; .character-studio-stage stays inside the mascot .ai-studio box. Agent mounts dotfield there via createMascotVolume and disposes with the mascot. No exporter edits by agent.

- [x] Assert flat material/color uniformity, actual projected eye-position change, existing FSM/reduced behavior and bounded trail presence/decay.
- [x] Keep existing geometry/assets but remove body shading using unlit material, apply damped spherical face pose to eyes, retain bounded interactions and cleanup.
- [x] Add bounded pointer-driven dotfield with reduced/offscreen/visibility cleanup.
- [x] Verify body/eyes across six shapes and actual pixel/pose state, not CSS-only assertion.

### Task 4: Integration and delivery

Parent integrates new CSS/modules into scripts/export-offline-wireframe.ts and updates verifiers affected by deliberately changed controls/label semantics. Keep updated README/acceptance limited to this prototype; do not update design system.

- [x] Regenerate self-contained HTML/ZIP; run all preview verifiers, lint, types, build and existing unit tests. Expected: zero failures, no external requests/JS errors; exact ZIP parity.
- [x] Capture desktop/mobile and inspect together, apply any necessary findings in one batch then confirm once.
- [x] Fresh independent integrated review; fix consequential findings with reproductions. No approval pause for already authorized reversible refinements.
- [x] Commit and push normally to existing feature branch after verification; deliver preview/captures and accurate GitHub status.

## Closing decisions and evidence

- Latest user authorization permits normal push to the existing feature branch after verification. No PR/main/deploy or force push.
- E-books are demo library references, not file uploads; prior no-integration boundary is preserved.
- Native sidebar labels now remain visible; active-label spring applies only to compact navigation.
- Very short windows scroll the entire sidebar so every target and the profile remain reachable. This trades a fixed footer only at short heights for usable full-size controls.
- One independent review found the short-height issue; regression observed RED before the single fix pass. Body/eye, notes and integration checks also observed RED→GREEN. Bounded desktop/mobile inspection plus one confirmation round.
- Repository selection update: selected area-de-membros checkout already exists; working feature checkout preserved. Removed Vovó Maria checkout retained because docs/superpowers/ has uncommitted files.

Final evidence: eight preview verifiers GREEN after final fix; build/lint/types and 7 unit tests GREEN; 34 captures generated and inspected in the bounded rounds; exact ZIP/HTML parity verified. src/, docs/design/ and dependencies unchanged against c5ea23b.
