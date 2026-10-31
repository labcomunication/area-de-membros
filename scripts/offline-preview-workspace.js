/* Navigation and offers are local presentation controls, never application state. */
function measureWorkspace() {
  const mobileHeader = view.querySelector(".mobile-header");
  document.documentElement.style.setProperty(
    "--mobile-header-height",
    (mobileHeader?.getBoundingClientRect().height || 64) + "px",
  );
  view.querySelectorAll(".offer-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".offer-track");
    carousel.querySelector('[data-carousel-direction="-1"]').disabled =
      track.scrollLeft < 2;
    carousel.querySelector('[data-carousel-direction="1"]').disabled =
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  });
}
function applyWorkspaceNavigation() {
  document.documentElement.dataset.navMode = appearance.navMode;
  view
    .querySelectorAll("[data-nav-mode]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.navMode === appearance.navMode),
      ),
    );
  requestAnimationFrame(measureWorkspace);
}
function mountWorkspace() {
  window.previewNotes.mount();
  measureWorkspace();
  requestAnimationFrame(measureWorkspace);
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  if (
    button.dataset.action === "compact-navigation" ||
    button.dataset.action === "restore-navigation" ||
    button.dataset.navMode
  ) {
    appearance.navMode =
      button.dataset.navMode ||
      (button.dataset.action === "compact-navigation" ? "compact" : "sidebar");
    applyWorkspaceNavigation();
    closeMenu();
    return;
  }
  if (button.dataset.carouselDirection) {
    const track = document.getElementById(button.getAttribute("aria-controls"));
    const width = track
      .querySelector(".offer-card")
      .getBoundingClientRect().width;
    track.scrollBy({
      left: Number(button.dataset.carouselDirection) * (width + 24),
      behavior: motionPreference.matches ? "instant" : "smooth",
    });
    return;
  }
  if (button.dataset.action === "offer-description") {
    const expanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(expanded));
    button.parentElement.dataset.expanded = String(expanded);
    button.querySelector("span").textContent = expanded
      ? "Recolher descrição"
      : "Ver descrição";
  }
});
document.addEventListener(
  "scroll",
  (event) => {
    if (event.target.matches?.(".offer-track")) measureWorkspace();
  },
  true,
);
window.addEventListener("resize", measureWorkspace);
window.previewWorkspace = {
  mount: mountWorkspace,
  applyNavigation: applyWorkspaceNavigation,
  measure: measureWorkspace,
};
