/** Presentation-only changes to the exported document; never runs in the app. */
export function refineOfflinePreview(html: string) {
  // Work on an isolated document so React can hydrate the source unchanged.
  const document = new DOMParser().parseFromString(html, "text/html");
  const root = document.querySelector<HTMLElement>(".app-shell");
  if (!root) return html;

  root.querySelector(".access-tag")?.remove();
  const mobileWordmark = root.querySelector(".mobile-header .wordmark");
  if (mobileWordmark) {
    const name = document.createElement("span");
    name.innerHTML =
      'Seu espaço<span class="wordmark-sub">ÁREA DE MEMBROS</span>';
    mobileWordmark.lastChild?.replaceWith(name);
  }
  root.querySelectorAll<HTMLAnchorElement>(".bottom-nav a").forEach((link) => {
    const screen = new URL(
      link.getAttribute("href")!,
      "https://offline.invalid",
    ).searchParams.get("screen");
    if (screen !== "home" && screen !== "products") link.remove();
  });
  const extraActive = root.querySelector(
    '.sidebar nav a[aria-current]:not([href*="screen=home"]):not([href*="screen=products"])',
  );
  if (extraActive)
    root
      .querySelector(".bottom-nav button")
      ?.setAttribute("aria-current", "page");

  root.querySelectorAll<HTMLElement>(".product-card").forEach((card) => {
    const cover = card.querySelector("a.cover-link");
    if (cover) {
      const visual = document.createElement("div");
      visual.className = "cover-link";
      visual.append(...cover.childNodes);
      cover.replaceWith(visual);
    }
    card.querySelector(".material-button")?.remove();
    const cta = card.querySelector<HTMLAnchorElement>("a.button");
    if (card.querySelector(".lock-label")) cta?.remove();
    else if (cta) cta.textContent = "Ver materiais";
  });

  const main = root.querySelector<HTMLElement>(".main-content");
  const next = main?.querySelector<HTMLElement>(":scope > .learning-next");
  if (!main || !next) return root.outerHTML;
  main.classList.add("home-content");
  const greeting = main.querySelector(":scope > .greeting")!;
  const library = next.nextElementSibling!;
  const editorial = [...main.querySelectorAll(":scope > .section-block")].find(
    (section) =>
      section.querySelector("h2")?.textContent === "Últimas publicações",
  )!;
  const offers = main.querySelector(".offers-grid")!.closest("section")!;
  const newsletter = main.querySelector(".newsletter")!;
  const nextProduct = new URL(
    next.querySelector<HTMLAnchorElement>("a.button")!.getAttribute("href")!,
    "https://offline.invalid",
  ).searchParams.get("product");
  library.querySelectorAll<HTMLElement>(".product-card").forEach((card) => {
    if (card.dataset.product === nextProduct) card.remove();
  });
  // A real grid rather than a second carousel competing with the next step.
  library.querySelector(".product-grid")?.classList.remove("carousel");
  const zoneA = document.createElement("section");
  zoneA.className = "home-zone home-zone-a";
  zoneA.setAttribute("aria-label", "Seu aprendizado");
  zoneA.append(greeting, next, library);
  editorial.className = "home-zone home-zone-b";
  editorial.setAttribute("aria-label", "Últimas publicações");
  offers.className = "home-zone home-zone-c";
  offers.setAttribute("aria-label", "Ofertas especiais");
  // Newsletter is a quiet, inactive strip, without another hero or duplicate CTA.
  newsletter.className = "newsletter newsletter-strip";
  newsletter.innerHTML =
    "<strong>Novidades por aqui</strong><small>Inscrições em breve. Nenhum dado é coletado nesta prévia.</small>";
  main.replaceChildren(zoneA, editorial, offers, newsletter);
  return root.outerHTML;
}
