/** Detached markup pass for this iteration; no production routes are added. */
export function refinePreviewWorkspace({
  html,
  key,
}: {
  html: string;
  key: string;
}) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const root = document.querySelector<HTMLElement>(".app-shell");
  if (!root) return html;
  const main = root.querySelector<HTMLElement>(".main-content")!;
  const screen = new URLSearchParams(key).get("screen");
  const panelIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16m6-10-2 2 2 2"/></svg>';
  const arrow =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  const noteLink = document.createElement("a");
  noteLink.href = "/wireframes?screen=notes";
  noteLink.dataset.navTarget = "notes";
  noteLink.innerHTML =
    '<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l6-6V5a2 2 0 0 0-2-2h-5Z"/><path d="M14 21v-7h7M7 8h10M7 12h4"/></svg></span><span class="nav-item-title">Minhas anotações</span>';
  root
    .querySelector('.sidebar [data-nav-group="personal"] .nav-group-items')!
    .prepend(noteLink);

  if (screen === "notes") {
    main.className = "main-content notes-content";
    main.innerHTML =
      '<header class="notes-heading"><div><h1>Minhas anotações</h1><p>Um lugar para guardar ideias e organizar seus próximos passos.</p></div><button class="button" type="button" data-action="new-note">Nova anotação</button></header><form class="note-editor" data-note-editor hidden><h2>Uma ideia de cada vez</h2><label for="note-title">Título da anotação</label><input id="note-title" name="title" maxlength="80" required autocomplete="off"><label for="note-body">Texto da anotação</label><textarea id="note-body" name="body" maxlength="1000" rows="4"></textarea><div class="note-editor-actions"><button class="button" type="submit">Salvar anotação</button><button class="button outline" type="button" data-action="cancel-note">Cancelar</button></div></form><div class="notes-board" aria-label="Quadro de anotações"><section class="board-column" data-column="ideas" aria-label="Ideias"><h2>Ideias <span data-column-count></span></h2><div data-note-list></div></section><section class="board-column" data-column="working" aria-label="Em andamento"><h2>Em andamento <span data-column-count></span></h2><div data-note-list></div></section><section class="board-column" data-column="saved" aria-label="Guardados"><h2>Guardados <span data-column-count></span></h2><div data-note-list></div></section></div><div class="notes-footer"><p class="microcopy">Anotações de demonstração, apenas nesta prévia. Recarregar descarta as alterações. Arraste os cartões ou use “Mover para”.</p><aside class="notes-helper"><span class="avatar" aria-hidden="true">A</span><div><h2>Uma ajuda para suas ideias</h2><p>Seu personagem poderá ajudar a organizar materiais e anotações em uma próxima etapa.</p><button class="button outline" type="button" disabled>Assistência IA · Em breve</button><details class="future-connection"><summary>Conectar minha IA no futuro</summary><p>A configuração de um provedor será desenhada depois. Nenhuma chave é solicitada ou enviada nesta prévia.</p></details></div></aside></div>';
    root
      .querySelectorAll(
        ".sidebar nav [aria-current], .bottom-nav a[aria-current]",
      )
      .forEach((el) => el.removeAttribute("aria-current"));
    noteLink.setAttribute("aria-current", "page");
    root
      .querySelector(".bottom-nav button")
      ?.setAttribute("aria-current", "page");
  }
  const brand = root.querySelector(".sidebar > .wordmark")!;
  const brandRow = document.createElement("div");
  brandRow.className = "sidebar-brand-row";
  brand.replaceWith(brandRow);
  brandRow.append(brand);
  const collapse = document.createElement("button");
  collapse.type = "button";
  collapse.className = "icon-button sidebar-collapse";
  collapse.dataset.action = "compact-navigation";
  collapse.setAttribute("aria-label", "Usar ícones no topo");
  collapse.title = "Usar ícones no topo";
  collapse.innerHTML = panelIcon;
  brandRow.append(collapse);
  for (const mobile of [false, true]) {
    const nav = document.createElement("nav");
    nav.className = mobile ? "mobile-compact-nav" : "compact-nav";
    nav.setAttribute(
      "aria-label",
      mobile ? "Navegação compacta mobile" : "Navegação no topo",
    );
    const track = document.createElement("div");
    track.className = "compact-nav-track";
    for (const original of root.querySelectorAll<HTMLAnchorElement>(
      ".sidebar nav a",
    )) {
      const link = original.cloneNode(true) as HTMLAnchorElement;
      const title = link.querySelector(".nav-item-title")!.textContent!;
      link.title = title;
      link.setAttribute("aria-label", title);
      link.querySelector(".nav-soon")?.remove();
      link.querySelector(".nav-item-title")!.className = "sr-only";
      track.append(link);
    }
    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "icon-button";
    restore.dataset.action = "restore-navigation";
    restore.setAttribute(
      "aria-label",
      mobile ? "Restaurar navegação padrão" : "Mostrar menu lateral",
    );
    restore.title = restore.getAttribute("aria-label")!;
    restore.innerHTML = panelIcon;
    nav.append(restore, track);
    if (mobile) root.querySelector(".mobile-header")!.after(nav);
    else root.querySelector(".desktop-topbar > span")!.after(nav);
  }
  const options = root.querySelector("#appearance-options");
  if (options) {
    const field = document.createElement("fieldset");
    field.innerHTML =
      '<legend>Navegação</legend><div class="appearance-choices"><button type="button" class="theme-choice" data-nav-mode="sidebar" aria-pressed="true">Menu lateral</button><button type="button" class="theme-choice" data-nav-mode="compact" aria-pressed="false">Ícones no topo</button></div><p class="microcopy">No celular, a navegação padrão fica embaixo. Você sempre pode restaurar o menu pelo primeiro ícone.</p>';
    options.append(field);
  }
  root
    .querySelectorAll<HTMLElement>(".product-card[data-product]")
    .forEach((card) => {
      const save = document.createElement("button");
      save.type = "button";
      save.className = "save-resource-button icon-button";
      save.dataset.action = "save-product";
      save.setAttribute(
        "aria-label",
        `Guardar ${card.querySelector("h3")!.textContent} nas anotações`,
      );
      save.title = "Guardar nas anotações";
      save.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4V4Z"/></svg>';
      card.append(save);
    });
  root.querySelectorAll<HTMLElement>(".offers-grid").forEach((grid, index) => {
    const concepts = [
      {
        id: "concept-combinacoes",
        title: "Caderno de combinações",
        description:
          "Uma proposta de coleção para registrar combinações, testar ideias e reunir referências para suas próximas criações. Conteúdo ilustrativo para demonstrar o comportamento de descrições mais longas no card.",
        price: "24,90",
      },
      {
        id: "concept-planejamento",
        title: "Planejamento criativo",
        description:
          "Uma proposta de material para organizar a rotina de produção, reunir suas anotações e preparar cada etapa com mais clareza. Este exemplo existe apenas para explorar o carrossel com cinco opções; não corresponde a uma oferta cadastrada.",
        price: "34,90",
      },
    ];
    for (const concept of concepts) {
      const card = document.createElement("article");
      card.className = "offer-card";
      card.dataset.product = concept.id;
      card.dataset.concept = "true";
      card.innerHTML = `<div class="asset-placeholder cover" role="img" aria-label="Espaço reservado para capa ilustrativa"><span>Capa em preparação</span></div><div><span class="offer-badge">Apenas para membros</span><h3>${concept.title}</h3><p>${concept.description}</p><p class="price"><span>R$ ${concept.price}</span></p><p class="microcopy">Valor fictício · apenas visualização</p><button class="button buy" disabled>Quero agora</button><p class="microcopy">Conceito · oferta não cadastrada</p></div>`;
      grid.append(card);
    }
    for (const [cardIndex, card] of [
      ...grid.querySelectorAll<HTMLElement>(".offer-card"),
    ].entries()) {
      const body = card.children[1] as HTMLElement;
      body.className = "offer-body";
      const description = body.querySelector<HTMLElement>(
        "p:not(.price):not(.microcopy)",
      )!;
      const descriptionWrap = document.createElement("div");
      descriptionWrap.className = "offer-description";
      description.replaceWith(descriptionWrap);
      description.id = `offer-description-${index}-${cardIndex}`;
      descriptionWrap.append(description);
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "offer-description-toggle";
      toggle.dataset.action = "offer-description";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", description.id);
      toggle.innerHTML = "<span>Ver descrição</span>" + arrow;
      descriptionWrap.append(toggle);
      const footer = document.createElement("div");
      footer.className = "offer-footer";
      let next = descriptionWrap.nextElementSibling;
      while (next) {
        const sibling = next.nextElementSibling;
        footer.append(next);
        next = sibling;
      }
      body.append(footer);
    }
    const carousel = document.createElement("div");
    carousel.className = "offer-carousel";
    grid.replaceWith(carousel);
    grid.classList.add("offer-track");
    grid.id = `offer-track-${index}`;
    grid.setAttribute("aria-label", "Coleções e propostas ilustrativas");
    const controls = document.createElement("div");
    controls.className = "offer-carousel-controls";
    controls.innerHTML = `<span>Coleções para explorar <small>Valores de demonstração</small></span><div><button type="button" class="icon-button" data-carousel-direction="-1" aria-controls="${grid.id}" aria-label="Ofertas anteriores">${arrow}</button><button type="button" class="icon-button" data-carousel-direction="1" aria-controls="${grid.id}" aria-label="Próximas ofertas">${arrow}</button></div>`;
    carousel.append(controls, grid);
  });
  if (screen === "ai") {
    root.querySelector(".ai-studio-copy .eyebrow")?.remove();
    const stage = root.querySelector(".character-studio-stage")!;
    stage.innerHTML =
      '<span class="character-state" data-character-state>Adam</span><button type="button" class="character-play" data-action="play-character" aria-label="Brincar com personagem" aria-describedby="character-instructions"><span data-character-stage></span></button><span id="character-instructions" class="sr-only">Arraste suavemente, clique ou toque no personagem. Enter e Espaço também mudam sua cor e expressão.</span><span class="character-status sr-only" role="status" data-character-status></span>';
    root.querySelectorAll(".ai-steps article").forEach((step, i) => {
      const symbol = step.querySelector("span")!;
      symbol.className = "ai-step-symbol";
      symbol.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${['<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2 2m8.8 8.8 2 2M5.6 18.4l2-2m8.8-8.8 2-2"/><circle cx="12" cy="12" r="4"/>', '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h4"/>', '<path d="M5 3h9l5 5v13H5V3Z"/><path d="M14 3v6h5M8 14h8M8 18h5"/>'][i]}</svg>`;
    });
  }
  return root.outerHTML;
}
