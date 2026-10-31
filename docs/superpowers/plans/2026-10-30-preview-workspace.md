# Preview Workspace Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Preserve the user's approved scope and no-publish restriction.

**Goal:** Refine the offline wireframe with consistent offers, compact navigation, a local notes board and soft interactive shape mascots.

**Architecture:** Add one detached-DOM export pass and two browser-only controllers, keeping `src/` untouched. State remains in memory. A self-contained Three.js island wraps the current SVG silhouette with rounded geometry; shared bounded spring math also drives DOM navigation labels.

**Tech Stack:** Existing TypeScript exporter, browser JavaScript/CSS, Playwright Chromium.

**Spec:** `docs/preview/iteration-workspace.md`, updated with the supplied flat-shape mascot reference.

## Global Constraints

- Work on `feat/members-wireframe`; commit locally, no push, PR, merge or deploy.
- No real auth, entitlements, purchase, API-key field, AI calls, file upload or persistence.
- Do not modify `src/` or `docs/design/`. Only Three.js/esbuild development dependencies are added for the explicitly requested offline animation.
- Preserve owned-product Home order, grayscale/brand-neutral shell and clear access/buy distinction.
- Honor reduced motion, keyboard and 390px mobile; retain 320px and 768px checks.

## Review Focus

- Long descriptions must not misalign offer footers; expansion is explicit.
- Compact navigation must remain usable while scrolling and always offer restoration.
- Note text must render as plain text, never HTML; saving a reference must not grant access.
- Dragging a mascot must not also trigger a click or become an unbounded animation.
- Pointer cancellation, reduced motion and touch must restore a usable neutral state.

### Task 1: Exported structure

**Files:** Create `scripts/refine-preview-workspace.ts`; modify `scripts/export-offline-wireframe.ts`; add `docs/preview/workspace.css`.

**Interface:** `refinePreviewWorkspace({html,key}: {html:string;key:string}): string` consumes decorated snapshots and produces navigation controls, uniform offers, an AI composition and the notes template.

- [x] Add verification for missing compact navigation and notes; run it against the old HTML to establish failure.
- [x] Add notes above account in the existing navigation, cloned compact topbar links, navigation preferences and a restoration control.
- [x] Restructure offers into full-height side cover, description and bottom footer. Add two clearly illustrative concept cards to demonstrate five-card scrolling.
- [x] Add `screen=notes` to the offline export only; produce the board editor/columns and inert future helper.

### Task 2: Interaction controllers

**Files:** Create `scripts/offline-preview-workspace.js`, `scripts/offline-preview-notes.js`; modify `scripts/offline-preview-runtime.js`.

**Interfaces:** `window.previewWorkspace.mount()/applyNavigation()/measure()` handle navigation/carousels; `window.previewNotes.mount()/closeTransient()` handle local note state and resource bookmarks.

- [x] Implement reversible sidebar/top-icon mode in memory; keep the top navigation sticky on desktop/mobile.
- [x] Implement scroll arrows, truncated-description toggles and aligned footer layout.
- [x] Implement plain-text add/edit/delete/undo, column selection, desktop drag/drop and resource bookmark/context menu with touch/keyboard alternative.
- [x] Verify note markup stays inert and locked references retain locked preview routing.

### Task 3: Mascot material and motion

**Files:** Modify `scripts/offline-preview-characters.js`; add `docs/preview/motion.css`.

- [x] Replace shaded hair portraits with fifteen flat-color variants of six supplied shape families; keep current IDs but use personal names.
- [x] Keep the existing mascot mount and appearance. Add true rounded geometry with white lookAt eyes, happy/nervous state machine and parallel hover/focus spring; preserve colors.
- [x] Add pointer-captured gentle stretch, damped return and drag/click separation. Reduce spatial motion when requested.
- [x] Center the mascot/name; place copy below and steps in a separate region. Remove visible instructions and emotional-state labels.

### Task 4: Verification and delivery

**Files:** `scripts/verify-preview-workspace.ts`, existing preview verifiers and screenshot script; README/acceptance/iteration documents.

- [x] Verify sticky compact mode/restoration, five-card scroll, long-description expansion, uniform footers, notes CRUD/drag/bookmarks/inert text and mascot drag/recovery.
- [x] Run all offline verifiers, lint/types and ZIP integrity check.
- [x] Inspect desktop/mobile together, fix findings as one batch, then confirm once.
- [x] Regenerate HTML, ZIP and screenshots; record source/plugin availability honestly; commit locally.

### Added scope: active navigation labels

- [x] Read supplied navigation motion brief in full; preserve existing DOM shell across routes.
- [x] Animate old/new active label width and scale with shared spring math; icons remain visible and targets accessible.
- [x] Center compact desktop navigation, handle More/group collapse and instant reduced-motion swaps.
- [x] Verify font-weight changes do not clip selected labels, keyboard operation and mobile containment.

Final evidence and any review limitations are recorded in docs/preview/acceptance.md and docs/reviews/2026-10-30-workspace-review.md.
