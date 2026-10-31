/** Latest selected component references, applied only to the offline prototype. */
export function refinePreviewStudio({
  html,
  key,
}: {
  html: string;
  key: string;
}) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const root = document.querySelector<HTMLElement>(".app-shell");
  if (!root) return html;
  for (const carousel of root.querySelectorAll<HTMLElement>(
    ".offer-carousel",
  )) {
    const section = carousel.closest("section");
    if (
      !section
        ?.querySelector("h2")
        ?.textContent?.includes("Você também pode gostar")
    )
      continue;
    carousel.classList.add("recommendation-carousel");
    carousel
      .querySelector(".offer-track")
      ?.classList.add("recommendation-track");
    for (const card of carousel.querySelectorAll(".offer-card")) {
      card.classList.add("recommendation-card");
      card
        .querySelector(".offer-cover-frame")
        ?.classList.add("recommendation-media");
      card.querySelector(".offer-body")?.classList.add("recommendation-sheet");
    }
  }
  if (new URLSearchParams(key).get("screen") === "ai") {
    const graph = document.createElement("section");
    graph.className = "ai-flow-studio";
    graph.setAttribute("aria-label", "Mapa de ideias");
    graph.innerHTML = "<div data-flow-root></div>";
    root.querySelector(".ai-studio")?.after(graph);
  }
  return root.outerHTML;
}
