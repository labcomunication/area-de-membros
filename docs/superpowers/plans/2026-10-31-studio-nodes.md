# Studio Nodes Implementation Plan

> Execute the approved screenshot scope continuously. Independent mascot, node editor and notes composer tasks may run in parallel under dispatching-parallel-agents; parent integrates and reviews once.

**Goal:** New mascot family, visual idea graph and screenshot-led refinements in the offline prototype.
**Architecture:** Retain detached HTML exporter and persistent shell. Three owns the mascot; standalone DOM/SVG controller owns graph state. Native dialog owns note composition; new scoped CSS owns this iteration's surfaces/typography.
**Tech Stack:** Existing JS/CSS, Three/esbuild, TypeScript exporter and Playwright, no new dependencies.
**Spec:** docs/superpowers/specs/2026-10-31-studio-nodes-design.md

## Constraints and review focus

No src/, docs/design/, auth, prices or real integration changes. Normal feature-branch push authorized; no PR/main/deploy. Keep runtime fully offline with local state only. Check local image decode/races/URL cleanup, keyboard alternatives to drag/ports, stale graph on navigation, native dialog focus after menu actions, and unlit mascot reference shape/eye separation. Preserve dark theme and 320/390px containment.

### Task 1 — Mascot family
Owner: scripts/offline-preview-characters.js, scripts/mascot-volume.js, new docs/preview/ailo-characters.css, new scripts/verify-ailo-characters.ts; adapt scripts/verify-mascot-volume.ts assertions only where latest appearance supersedes old six-shape expectations.
Interface: retain previewCharacters API and add getAvatarMarkup(id?:string):string (safe internal avatar markup, default appearance.avatar) for nodes. Retain snapshot() fields; add family if useful. Own no exporter/runtime/type declarations.
- [x] Observe failing reference-family checks against baseline HTML.
- [x] Replace old silhouettes with rounded body, inset face and circular curved-base eyes; preserve fifteen IDs/names/colors and interactions.
- [x] Verify profile/AI identity, real rendered gaze/FSM/reduced behavior, fallback and disposal after parent export.

### Task 2 — Interactive idea graph
Owner: new scripts/offline-preview-flow.js, docs/preview/flow.css, scripts/verify-preview-flow.ts.
Consumes .ai-flow-studio > [data-flow-root] inserted by parent; global appearance/snapshots and previewCharacters.getAvatarMarkup. Interface: window.previewFlow.mount()/dispose()/refreshAvatars(); dispose removes DOM/listeners but preserves in-memory graph. Parent calls mount after applyAppearance and dispose before route replacement; refreshAvatars on appearance changes.
- [x] Failing checks for absent graph and local editing/connection flow.
- [x] Create/edit/move/delete idea nodes; fixed IA/PDF nodes and user avatar; curved connections via pointer and accessible menu path, removal and duplicate/self guards.
- [x] Local image picker/preview, 5MB/type/decode validation, cleanup and no network. Responsive internal viewport with touch/keyboard support.
- [x] Tests: whole creation→connection→edit→delete flow, image/error, safe text, navigation/state/cleanup and zero network; generation remains inoperative.

### Task 3 — Notes composer
Owner: scripts/offline-preview-notes.js, new docs/preview/notes-composer.css, scripts/verify-notes-composer.ts. Existing notes DOM and APIs retained; no parent/exporter changes.
- [x] RED for absence of floating accessible dialog.
- [x] Move/reuse existing form in dialog with grey fields/dark action per screenshot. Correct save/cancel/Escape/focus restoration, scroll, touch and route cleanup. Preserve previous board/menu/picker behavior.
- [x] Verify composer + existing notes verifier on integrated artifact.

### Task 4 — Parent surfaces, recommendations and integration
Owner: new scripts/refine-preview-studio.ts and docs/preview/studio-refinement.css; modify exporter, workspace/runtime calls and preview-runtime.d.ts if needed; own screenshots/doc updates and scripts/verify-studio-refinement.ts.
- [x] RED for missing font, bordered surfaces, old tiny recommendation cover and graph placement.
- [x] Fetch licensed Noto Sans WOFF2/OFL and inline font/license in export. Apply continuous corners and borderless layered neutral surfaces, with dark-mode/focus preservation.
- [x] Recommendations only in “Você também pode gostar”: large cover background + lower overlay panel, same copy/disabled buy/access status; keep manual carousel.
- [x] Insert graph below mascot/before copy; inline all new CSS/JS and lifecycle hooks. Regenerate once agents are ready.
- [x] Run all verifiers + lint/types/build/unit tests, inspect desktop/mobile together, get independent review, fix consequential findings in one pass and confirm once.
- [x] Regenerate standalone HTML/ZIP/captures, record true plugin limits and prepare verified feature branch for normal commit/push. Remote HEAD equality is checked separately in the task output after push.

## Verification record

All thirteen preview verifiers passed, plus lint, typecheck, build and seven unit tests. Independent review produced two P2 graph fixes with RED→GREEN evidence. Visual inspection found remaining decorative reward/avatar borders; the user then identified missing inner spacing on the graph panel. Both were corrected and the six affected verifiers repeated successfully. Graph gutters are now asserted at 1440/768/390/320px. ZIP equality, embedded font/license and source/style parity passed. See design-qa.md, docs/preview/acceptance.md and docs/reviews/2026-10-31-studio-nodes-review.md.
