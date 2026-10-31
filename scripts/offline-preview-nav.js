/* One persistent DOM shell. Nav springs share math, never mascot state. */
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const labelStates = new Map(),
  groupMotions = new Map();
let labelFrame = null,
  labelTime = 0;
let activeNavId = null;
const shellSelectors = [
  ".sidebar",
  ".mobile-header",
  ".bottom-nav",
  ".desktop-topbar",
  ".mobile-compact-nav",
];
function navId(control) {
  if (control.matches('button[aria-label="Mais opções"]')) return "more";
  if (control.dataset.navTarget) return control.dataset.navTarget;
  const href = control.getAttribute("href") || "";
  return new URLSearchParams(
    href.startsWith("#")
      ? href.slice(1)
      : new URL(href, "https://offline.invalid").search,
  ).get("screen");
}
function currentNavId() {
  const screen = new URLSearchParams(view.dataset.previewKey).get("screen");
  if (["product", "module", "locked"].includes(screen)) return "products";
  if (["article", "category"].includes(screen)) return "home";
  return screen;
}
function paintNavLabel(state) {
  const progress = Math.max(0, Math.min(1.025, state.value));
  state.label.style.width = (state.width * progress).toFixed(3) + "px";
  state.label.style.transform = `perspective(240px) scale(${0.92 + Math.min(1.02, progress) * 0.08}) rotateX(${(1 - Math.min(1, progress)) * 10}deg)`;
  state.label.style.opacity = String(Math.min(1, progress));
  state.control.style.setProperty(
    "--label-progress",
    String(Math.min(1, progress)),
  );
  state.control.dataset.labelProgress = progress.toFixed(3);
  state.label.setAttribute("aria-hidden", String(state.target === 0));
}
function queueNavFrame() {
  if (labelFrame === null && !document.hidden)
    labelFrame = requestAnimationFrame(stepNavLabels);
}
function stepNavLabels(time) {
  labelFrame = null;
  const dt = Math.min(0.032, labelTime ? (time - labelTime) / 1000 : 0.016);
  labelTime = time;
  let moving = false;
  for (const [control, state] of labelStates) {
    if (!control.isConnected) {
      labelStates.delete(control);
      continue;
    }
    const next = window.previewMotion.springStep(
      state.value,
      state.velocity,
      state.target,
      dt,
      state.target
        ? window.previewMotion.springConfig
        : { stiffness: 260, damping: 28 },
    );
    state.value = next.value;
    state.velocity = next.velocity;
    moving ||= !next.done;
    paintNavLabel(state);
  }
  for (const [group, state] of groupMotions) {
    if (!group.isConnected) {
      groupMotions.delete(group);
      continue;
    }
    const next = window.previewMotion.springStep(
      state.value,
      state.velocity,
      state.target,
      dt,
    );
    state.value = next.value;
    state.velocity = next.velocity;
    moving ||= !next.done;
    state.content.style.height = Math.max(0, state.height * state.value) + "px";
    if (next.done) {
      groupMotions.delete(group);
      group.open = Boolean(state.target);
      state.content.style.removeProperty("height");
      state.content.style.removeProperty("overflow");
    }
  }
  if (moving) queueNavFrame();
  else labelTime = 0;
}
function normalizeNav(control) {
  if (labelStates.has(control)) return labelStates.get(control);
  let label = control.querySelector(
    ".nav-item-title, .nav-live-label, .sr-only",
  );
  if (!label) {
    const icon = control.querySelector("span");
    const text = [...control.childNodes]
      .filter((node) => node !== icon)
      .map((node) => node.textContent)
      .join("")
      .trim();
    [...control.childNodes]
      .filter((node) => node !== icon)
      .forEach((node) => node.remove());
    label = document.createElement("span");
    label.textContent = text;
    control.append(label);
    if (icon) {
      icon.dataset.navIcon = "true";
      const id = navId(control);
      const svg = view.querySelector(
        `.sidebar [data-nav-target="${id}"] .nav-icon svg`,
      );
      if (svg) icon.replaceChildren(svg.cloneNode(true));
      else if (id === "more")
        icon.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14"/></svg>';
    }
  }
  label.classList.remove("sr-only");
  label.classList.add("nav-live-label");
  const name = label.textContent.trim();
  if (control.tagName === "A") control.setAttribute("aria-label", name);
  control.title = control.getAttribute("aria-label") || name;
  const width = Math.ceil(label.scrollWidth || name.length * 7.5);
  const state = {
    control,
    label,
    width,
    value: 0,
    velocity: 0,
    target: 0,
  };
  labelStates.set(control, state);
  return state;
}
function syncNavLabels() {
  const id = currentNavId();
  activeNavId = id;
  const bottomId = ["home", "products"].includes(id) ? id : "more";
  const moreOpen =
    view
      .querySelector('.bottom-nav button[aria-label="Mais opções"]')
      ?.getAttribute("aria-expanded") === "true";
  const controls = view.querySelectorAll(
    ".sidebar nav a, .drawer nav a, .compact-nav-track a, .bottom-nav a, .bottom-nav button",
  );
  controls.forEach((control) => {
    const controlId = navId(control),
      bottom = Boolean(control.closest(".bottom-nav"));
    const selected =
      controlId === (bottom ? (moreOpen ? "more" : bottomId) : id);
    if (selected && !(controlId === "more" && moreOpen && bottomId !== "more"))
      control.setAttribute("aria-current", "page");
    else control.removeAttribute("aria-current");
    control.dataset.navActive = String(selected);
    const state = normalizeNav(control);
    if (control.getBoundingClientRect().width > 0) {
      const previousWidth = state.label.style.width;
      state.label.style.width = "auto";
      state.width = Math.ceil(state.label.scrollWidth);
      state.label.style.width = previousWidth;
    }
    const group = control.closest("details");
    const closed =
      group?.open === false || groupMotions.get(group)?.target === 0;
    state.target = selected && !closed ? 1 : 0;
    if (motionPreference.matches) {
      state.value = state.target;
      state.velocity = 0;
      paintNavLabel(state);
    }
  });
  if (!motionPreference.matches) queueNavFrame();
}
function captureShell() {
  return shellSelectors.map((selector) => ({
    selector,
    node: view.querySelector(selector),
  }));
}
function restoreShell(saved) {
  for (const { selector, node } of saved) {
    const fresh = view.querySelector(selector);
    if (node && fresh) fresh.replaceWith(node);
  }
}
document.addEventListener(
  "click",
  (event) => {
    const summary = event.target.closest(".nav-group > summary");
    if (!summary || !summary.closest(".sidebar, .drawer")) return;
    const group = summary.parentElement,
      content = group.querySelector(".nav-group-items");
    if (motionPreference.matches) return;
    event.preventDefault();
    const old = groupMotions.get(group);
    const opening = old ? !old.target : !group.open;
    if (!group.open) group.open = true;
    content.style.removeProperty("height");
    const height = content.scrollHeight;
    content.style.overflow = "hidden";
    const state = {
      content,
      height,
      target: opening ? 1 : 0,
      value: old?.value ?? (opening ? 0 : 1),
      velocity: old?.velocity ?? 0,
    };
    groupMotions.set(group, state);
    content.style.height = Math.max(0, height * state.value) + "px";
    for (const control of group.querySelectorAll("a")) {
      const label = normalizeNav(control);
      label.target = opening && control.dataset.navActive === "true" ? 1 : 0;
    }
    queueNavFrame();
  },
  true,
);
document.addEventListener("click", () => queueMicrotask(syncNavLabels));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") queueMicrotask(syncNavLabels);
});
document.addEventListener(
  "toggle",
  (event) => {
    if (
      event.target.matches?.(".nav-group") &&
      event.target.isConnected &&
      !groupMotions.has(event.target)
    )
      syncNavLabels();
  },
  true,
);
motionPreference.addEventListener("change", () => {
  for (const [group, state] of groupMotions) {
    group.open = Boolean(state.target);
    state.content.style.removeProperty("height");
    state.content.style.removeProperty("overflow");
  }
  groupMotions.clear();
  syncNavLabels();
});
window.addEventListener("resize", syncNavLabels);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncNavLabels();
});
window.previewNav = {
  captureShell,
  restoreShell,
  sync: syncNavLabels,
  get activeId() {
    return activeNavId;
  },
};
