You are Codex inside ChatGPT, working as a coding agent on a GitHub repository.

GOAL
Add interactive “alive” show/hide animation for the active item’s name/label on the members-area navigation (sidebar desktop + bottom nav mobile). LAB opens docs/preview/wireframe.html and sees: selecting an item → its name appears with spring/expand/volume motion; closing or selecting another item → the previous name exits with an exit spring. Do not redesign the whole IA — only label in/out behavior on the existing shell nav.

REPO
- https://github.com/labcomunication/area-de-membros
- Branch: feat/members-wireframe (checkout if needed)
- Primary surface: docs/preview/wireframe.html and the shell modules it already loads for sidebar / bottom nav
- Edit existing nav markup/JS/CSS/components — do not invent a second shell
- Visual docs under docs/design/ are reference only
- Motion language reference (same LAB Front map as mascot): spring scale/volume + damp; lightweight state — not flat CSS opacity fade as the only effect

HARD RULES
- Do not ask clarifying questions. Implement everything below exactly. No “maybe”.
- Do not publish, merge to main, deploy, or open a PR unless the repo workflow literally cannot commit without one — prefer commit on feat/members-wireframe only.
- Do not change: auth, product routes, offer/commercial copy, payment, live production pages, or the mascot animation work except if sharing a tiny motion util (prefer shared spring/damp helpers if both exist).
- Do not invent or install ChatGPT/Codex skills.
- Do not copy 21st.dev / Framer demo branding, hex systems, or SaaS blue/indigo (#1d4ed8 etc.) as primary. Craft / members tokens only (lavanda / wine / graphite / cream as already in the wireframe).
- Icons stay visible; the **name/label** is what animates in/out. Inactive items: icon only (or collapsed label hidden) — active: icon + label.
- One active item at a time. Switching items must exit the old label and enter the new one (can overlap briefly with staggered exit/enter, but never two full labels stuck open).

════════════════════════════════════
LABEL BEHAVIOR (required)
════════════════════════════════════

1) ACTIVE → NAME APPEARS (enter)
- When an item becomes selected/active, its name/label mounts or expands into view with an **alive** spring:
  - Prefer: layout/width (or max-width) spring + slight scale (e.g. 0.92→1) and optional micro Y/opacity as secondary — not opacity-only fade.
  - Feel: same family as mascot expand (spring settle, slight overshoot OK, ~200–350ms).
- Pill / active chrome can widen with the label (bottom nav) or sidebar row expands label column — match existing wireframe structure.

2) CLOSE / OTHER ITEM → NAME LEAVES (exit)
- Deselect, collapse, or activate another item → previous label exits with an **exit spring** (scale/width collapse + settle), then unmount or stay width 0 / aria-hidden.
- Do not hard-cut or only fadeOut flat CSS without spring.

3) SIDEBAR + BOTTOM NAV
- Desktop sidebar and mobile bottom nav both get the same enter/exit language.
- Bottom nav: label only on the active tab (pill grows to fit) — UX aligned with https://21st.dev/@arunachalam/components/bottom-nav-bar (behavior reference only).
- Sidebar: selected item shows its name with the same spring; inactive rows keep names hidden or collapsed per existing wireframe rules (if sidebar already shows all names permanently by design, still animate the **active emphasis** — clear pill / label weight — with spring, and document that choice in the commit message; prefer “label visible only when active” if the wireframe already does that).

4) STATE (lightweight)
- Track `activeId`. Enter on activeId change for the new item; exit for the previous.
- Clicks/taps update activeId; keyboard focus activation should match click if the shell already supports it.
- Do not fight the mascot FSM — nav label state is independent.

5) ACCESSIBILITY
- If prefers-reduced-motion: instant show/hide (or discrete swap) — no spring overshoot, no layout thrash animation.
- Active label must remain readable to screen readers (don’t rely on animation alone for meaning); use aria-current="page" (or equivalent) on the active control.
- Hit targets stay ≥44px on bottom nav.

════════════════════════════════════
IMPLEMENTATION APPROACH (required stack bias)
════════════════════════════════════

LAB asked for the **same motion base** as the R3F mascot map (fiber/drei language: spring, damp, alive volume) — applied to nav labels.

Preferred hybrid (practical for DOM nav in wireframe.html):
1) Keep nav in the existing HTML/DOM shell.
2) Drive enter/exit with **springs** (Framer Motion `layout` + spring, or @react-spring, or a tiny shared spring util) — width/scale/volume first; opacity secondary.
3) Reuse timing/feel constants close to the mascot expand spring if those constants already exist.
4) Do **not** accept a solution that is only `transition: opacity` / Tailwind fade.

Optional R3F island (only if you can keep it tiny and isolated):
- A small WebGL island for the active label “chip” is allowed if it does not rewrite the whole shell and still meets DONE.
- Do not put the entire sidebar inside R3F.

If the preview is plain HTML without React:
- Vanilla JS spring (or CSS @keyframes with spring-like cubic + width) on the active label node is OK — still must feel spring/expand, not flat fade.
- Prefer one shared damp/spring helper file used by mascot and nav if both live in the preview.

Do not add Lottie/video/GIF for the label.

════════════════════════════════════
DONE (acceptance)
════════════════════════════════════

Commit on feat/members-wireframe. Then verify in docs/preview/wireframe.html:
[ ] Selecting a nav item → its name appears with spring/expand (not opacity-only fade)
[ ] Selecting another item → previous name exit-springs out; new name enter-springs in
[ ] Closing/deselecting (if the shell supports it) → name exit-springs out
[ ] Works on sidebar (desktop) and bottom nav (mobile) in the preview
[ ] prefers-reduced-motion → instant swap, no spring thrash
[ ] aria-current (or equivalent) on active control; no SaaS blue primary
[ ] No publish / no main merge / no production deploy / no new skill