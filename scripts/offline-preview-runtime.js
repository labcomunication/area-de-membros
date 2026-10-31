/* Embedded into the standalone HTML. No network, auth or persistence. */
const snapshots = JSON.parse(document.getElementById("snapshots").textContent);
const view = document.getElementById("offline-view");
const appearance = {
  mode: "light",
  accent: "wine",
  crown: false,
  avatar: "pistache",
  navMode: "sidebar",
};

function keyOf(url) {
  const parsed = new URL(url, "https://offline.invalid");
  const query = new URLSearchParams();
  for (const key of [
    "screen",
    "state",
    "product",
    "module",
    "post",
    "category",
  ]) {
    const value = parsed.searchParams.get(key);
    if (value && !(key === "state" && value === "normal"))
      query.set(key, value);
  }
  if (!query.has("screen")) query.set("screen", "home");
  query.sort();
  return query.toString();
}

function setBarHeight() {
  document.documentElement.style.setProperty(
    "--offline-bar-height",
    document.getElementById("offline-toolbar").offsetHeight + "px",
  );
}

function applyAppearance() {
  document.documentElement.dataset.previewMode = appearance.mode;
  document.documentElement.dataset.previewAccent = appearance.accent;
  window.previewWorkspace.applyNavigation();
  window.previewCharacters.paintProfileAvatars();
  view.querySelectorAll("button[data-mode]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.mode === appearance.mode),
    );
  });
  view.querySelectorAll("button[data-accent]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.accent === appearance.accent),
    );
  });
  view.querySelectorAll(".avatar").forEach((avatar) => {
    avatar.querySelector(".profile-crown")?.remove();
    if (appearance.crown) {
      const crown = document.createElement("span");
      crown.className = "profile-crown";
      crown.setAttribute("aria-hidden", "true");
      crown.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m3 7 5 4 4-7 4 7 5-4-2 12H5L3 7Z"/><path d="M6 22h12"/></svg>';
      avatar.append(crown);
    }
  });
  const crownButton = view.querySelector('[data-action="crown"]');
  if (crownButton) {
    crownButton.setAttribute("aria-pressed", String(appearance.crown));
    crownButton.textContent = appearance.crown
      ? "Ocultar coroa de exemplo"
      : "Ver coroa no perfil";
  }
}

function closeMenu() {
  const drawer = document.getElementById("more-navigation");
  if (!drawer) return;
  drawer.remove();
  const trigger = view.querySelector('button[aria-label="Mais opções"]');
  trigger?.setAttribute("aria-expanded", "false");
  trigger?.focus();
  window.previewNav.sync();
}

function render() {
  closeMenu();
  const savedShell = window.previewNav.captureShell();
  window.previewCharacters.disposeVolume();
  window.previewNotes.closeTransient();
  const requested = keyOf("/wireframes?" + location.hash.slice(1));
  const key = snapshots[requested] ? requested : "screen=home";
  view.innerHTML = snapshots[key];
  view.dataset.previewKey = key;
  window.previewNav.restoreShell(savedShell);
  window.previewNav.sync();
  window.previewCharacters.restoreNavigationGroups();
  view.querySelectorAll('a[href^="/wireframes"]').forEach((link) => {
    link.setAttribute("href", "#" + keyOf(link.getAttribute("href")));
  });
  const select = document.getElementById("screen-select");
  select.value = [...select.options].some((option) => option.value === key)
    ? key
    : "";
  applyAppearance();
  window.previewWorkspace.mount();
  window.previewNav.sync();
  setBarHeight();
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.getElementById("screen-select").addEventListener("change", (event) => {
  location.hash = event.target.value;
});
window.addEventListener("hashchange", render);
window.addEventListener("resize", setBarHeight);
document.addEventListener("submit", (event) => event.preventDefault());
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const picker = document.getElementById("avatar-picker-panel");
  if (picker && !picker.hidden)
    return window.previewCharacters.closeAvatarPicker();
  const options = document.getElementById("appearance-options");
  if (options && !options.hidden) {
    options.hidden = true;
    const trigger = view.querySelector('[data-action="appearance"]');
    trigger?.setAttribute("aria-expanded", "false");
    trigger?.focus();
  } else closeMenu();
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button?.disabled) return;
  if (button?.dataset.action === "avatar-picker") {
    const picker = document.getElementById("avatar-picker-panel");
    picker.hidden = !picker.hidden;
    button.setAttribute("aria-expanded", String(!picker.hidden));
    if (!picker.hidden) picker.querySelector('[aria-pressed="true"]')?.focus();
    return;
  }
  if (button?.dataset.action === "close-avatar-picker")
    return window.previewCharacters.closeAvatarPicker();
  if (button?.dataset.avatarChoice) {
    appearance.avatar = button.dataset.avatarChoice;
    characterState.step = 0;
    characterState.mood = "idle";
    characterState.clicks = [];
    clearTimeout(characterState.resetTimer);
    applyAppearance();
    const selected = characterStyles.find(
      (style) => style.id === appearance.avatar,
    );
    document.getElementById("avatar-choice-status").textContent =
      selected.name + " selecionado. Sua escolha vale apenas para esta prévia.";
    return;
  }
  if (button?.dataset.action === "play-character")
    return window.previewCharacters.playCharacter(event);
  if (button?.dataset.action === "appearance") {
    const options = document.getElementById("appearance-options");
    options.hidden = !options.hidden;
    button.setAttribute("aria-expanded", String(!options.hidden));
    if (!options.hidden) options.querySelector("button")?.focus();
    return;
  }
  if (button?.dataset.mode || button?.dataset.accent) {
    if (["light", "dark"].includes(button.dataset.mode))
      appearance.mode = button.dataset.mode;
    if (["olive", "wine", "beige"].includes(button.dataset.accent))
      appearance.accent = button.dataset.accent;
    applyAppearance();
    document.getElementById("appearance-status").textContent =
      "Preferência aplicada apenas nesta prévia; não é salva na conta.";
    return;
  }
  if (button?.dataset.action === "crown") {
    appearance.crown = !appearance.crown;
    applyAppearance();
    return;
  }
  if (button?.getAttribute("aria-label") === "Mais opções") {
    if (document.getElementById("more-navigation")) return closeMenu();
    const drawer = document.createElement("div");
    drawer.className = "drawer";
    drawer.id = "more-navigation";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "Mais opções");
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Fechar";
    close.setAttribute("aria-label", "Fechar opções");
    close.className = "button outline";
    drawer.append(close);
    const nav = view.querySelector(".sidebar nav")?.cloneNode(true);
    if (nav) {
      nav.setAttribute("aria-label", "Mais opções");
      drawer.append(nav);
    }
    view.append(drawer);
    button.setAttribute("aria-expanded", "true");
    window.previewNav.sync();
    close.focus();
    return;
  }
  if (button?.getAttribute("aria-label") === "Fechar opções")
    return closeMenu();
  const link = event.target.closest("a");
  if (link?.getAttribute("href") === "#main") {
    event.preventDefault();
    const main = document.getElementById("main");
    main?.setAttribute("tabindex", "-1");
    main?.focus();
    main?.scrollIntoView();
  } else if (link?.getAttribute("href")?.startsWith("#screen=")) {
    closeMenu();
  } else if (link?.getAttribute("href")?.startsWith("/")) {
    event.preventDefault();
    location.hash = "screen=home";
  }
});
render();
