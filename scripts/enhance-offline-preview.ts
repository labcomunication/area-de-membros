/** Second presentation pass; operates only on detached offline snapshots. */
export function enhanceOfflinePreview({
  html,
  key,
}: {
  html: string;
  key: string;
}) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const root = document.querySelector<HTMLElement>(".app-shell");
  if (!root) return html;
  const screen = new URLSearchParams(key).get("screen");
  const main = root.querySelector<HTMLElement>(".main-content")!;
  const svgLock =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>';
  const orb =
    '<div class="ai-orb" aria-hidden="true"><span class="ai-orb-core"></span><span class="ai-orbit ai-orbit-one"></span><span class="ai-orbit ai-orbit-two"></span><span class="ai-orb-spark"></span></div>';
  if (!root.querySelector("[data-future-ai]")) {
    const link = document.createElement("a");
    link.href = "/wireframes?screen=ai";
    link.dataset.futureAi = "true";
    link.innerHTML =
      '<span aria-hidden="true">✧</span><span class="nav-item-title">Estúdio IA<small>Em breve</small></span>';
    const nav = root.querySelector(".sidebar nav")!;
    nav.querySelector('a[href*="screen=bonus"]')?.after(link);
  }

  root.querySelectorAll<HTMLElement>(".offer-card").forEach((card) => {
    const prices: Record<string, string> = {
      precificacao: "29,90",
      decoracao: "39,90",
      checklist: "19,90",
    };
    const price = card.querySelector(".price");
    if (price)
      price.innerHTML = `<span>R$ ${prices[card.dataset.product ?? ""] ?? "29,90"}</span>`;
    const caption = price?.nextElementSibling;
    if (caption) caption.textContent = "Valor fictício · apenas visualização";
  });
  root
    .querySelectorAll(".featured-story, .story-item, .editorial-card")
    .forEach((card) => {
      const image = card.querySelector(":scope > .asset-placeholder");
      if (!image) return;
      const frame = document.createElement("div");
      frame.className = "story-media";
      image.replaceWith(frame);
      frame.append(image);
    });
  root.querySelectorAll(".product-card").forEach((card) => {
    if (!card.querySelector(".lock-label")) return;
    const cover = card.querySelector(".cover-link")!;
    cover.classList.add("locked-cover");
    cover.setAttribute("role", "img");
    cover.setAttribute("aria-label", "Capa de conteúdo bloqueado");
    cover.innerHTML = `<span class="cover-lock">${svgLock}</span>`;
    card.classList.add("is-locked");
  });
  if (
    ["products", "bonus", "offers"].includes(screen ?? "") &&
    !new URLSearchParams(key).has("state")
  ) {
    const banner = document.createElement("aside");
    banner.className = "preview-banner";
    banner.setAttribute("aria-label", "Banner ilustrativo");
    banner.innerHTML =
      '<div><span class="eyebrow">UM ESPAÇO PARA SUAS DESCOBERTAS</span><h2>Aprender, criar e ir além.</h2><p>Conteúdos para acompanhar cada etapa da sua jornada.</p><small>Banner ilustrativo · imagem final pendente</small></div><div class="banner-art" aria-hidden="true"><span>m.</span></div>';
    main.prepend(banner);
  }
  if (screen === "account") {
    const panel = main.querySelector(".account-panel")!;
    const overview = document.createElement("div");
    overview.className = "account-overview";
    panel.replaceWith(overview);
    overview.append(panel);
    const activity = document.createElement("section");
    activity.className = "activity-panel";
    activity.setAttribute("aria-labelledby", "activity-title");
    const cells = Array.from({ length: 91 }, (_, i) => {
      const level = (i * 17 + Math.floor(i / 7)) % 9;
      return `<span class="activity-cell level-${level > 4 ? 0 : level}" aria-hidden="true"></span>`;
    }).join("");
    activity.innerHTML = `<span class="eyebrow">SUA CONSTÂNCIA</span><h2 id="activity-title">Um dia de cada vez</h2><p>Um espaço para acompanhar seus dias de aprendizado.</p><div class="activity-months" aria-hidden="true"><span>Mês 1</span><span>Mês 2</span><span>Mês 3</span></div><div class="activity-map" role="img" aria-label="Exemplo ilustrativo de atividade em 91 dias. Não representa acessos reais.">${cells}</div><div class="activity-legend"><small>Menos</small>${[0, 1, 2, 3, 4].map((n) => `<span class="activity-cell level-${n}" aria-hidden="true"></span>`).join("")}<small>Mais</small></div><small class="demo-note">Dados ilustrativos · sem monitoramento de acessos</small>`;
    overview.append(activity);
    const personalization = document.createElement("section");
    personalization.className = "personalization-card";
    personalization.innerHTML =
      '<div class="settings-heading"><div><span class="eyebrow">DO SEU JEITO</span><h2>Personalização</h2></div><button class="button outline" type="button" data-action="appearance" aria-controls="appearance-options" aria-expanded="false">Editar</button></div><p>Claro e escuro mudam a aparência geral. As cores destacam apenas o menu e pequenos detalhes.</p><div id="appearance-options" hidden><fieldset><legend>Aparência geral</legend><div class="appearance-choices"><button type="button" class="theme-choice" data-mode="light" aria-pressed="true"><span class="theme-dot light-dot" aria-hidden="true"></span>Claro</button><button type="button" class="theme-choice" data-mode="dark" aria-pressed="false"><span class="theme-dot dark-dot" aria-hidden="true"></span>Escuro</button></div></fieldset><fieldset><legend>Cor dos detalhes</legend><div class="appearance-choices"><button type="button" class="accent-choice" data-accent="olive" aria-pressed="false"><span class="theme-dot olive-dot" aria-hidden="true"></span>Oliva</button><button type="button" class="accent-choice" data-accent="wine" aria-pressed="true"><span class="theme-dot wine-dot" aria-hidden="true"></span>Vinho</button><button type="button" class="accent-choice" data-accent="beige" aria-pressed="false"><span class="theme-dot beige-dot" aria-hidden="true"></span>Bege</button></div></fieldset><p class="microcopy" role="status" id="appearance-status">Preferências apenas nesta prévia; não são salvas na conta.</p></div>';
    overview.after(personalization);
    const rewards = document.createElement("section");
    rewards.className = "rewards-section";
    rewards.innerHTML =
      '<div class="settings-heading"><div><span class="eyebrow">CONQUISTAS · DEMONSTRAÇÃO</span><h2>Cada passo merece um marco</h2></div><span class="pill">Ideias para o futuro</span></div><p>Exemplos de reconhecimento por constância, aprendizado e evolução. Critérios e validação serão definidos pelo produto.</p><div class="rewards-grid"><article class="reward-card"><span class="reward-symbol" aria-hidden="true">✧</span><h3>Ritmo constante</h3><p>Exemplo: reservar 7 dias para aprender.</p><small>Constância · critério ilustrativo</small></article><article class="reward-card"><span class="reward-symbol" aria-hidden="true">◇</span><h3>Mãos à obra</h3><p>Exemplo: concluir 3 materiais da biblioteca.</p><small>Aprendizado · critério ilustrativo</small></article><article class="reward-card"><span class="reward-symbol" aria-hidden="true">♕</span><h3>Primeiras vendas</h3><p>Uma ideia de reconhecimento para sua evolução.</p><small>Futuro · depende de dados e validação</small></article></div><div class="crown-preview"><p>Experimente uma coroa discreta no seu avatar.</p><button type="button" class="button outline" data-action="crown" aria-pressed="false">Ver coroa no perfil</button></div><small class="demo-note">Nenhuma conquista foi concedida. Esta é uma demonstração visual.</small>';
    personalization.after(rewards);
  }
  if (screen === "ai") {
    main.className = "main-content ai-content";
    main.innerHTML = `<div class="future-notice"><span class="pill">Em breve</span><p>Recurso futuro · geração de PDFs indisponível nesta prévia.</p></div><section class="ai-studio"><div class="ai-orb-stage">${orb}<span class="orb-caption">IDEIAS EM MOVIMENTO</span></div><div class="ai-studio-copy"><span class="eyebrow">SEU FUTURO ESTÚDIO CRIATIVO</span><h1>Da sua ideia<br>ao seu próximo PDF.</h1><p>Futuramente, você poderá organizar ideias e preparar seus PDFs por aqui, com a ajuda da inteligência artificial.</p><button type="button" class="button" disabled>Geração de PDFs · Em breve</button><small>Sem envio de arquivos, prompts ou dados pessoais.</small></div></section><section class="ai-steps" aria-label="Possibilidades futuras"><article><span>01</span><h2>Traga sua ideia</h2><p>Uma receita, um tema ou algo que você quer ensinar.</p></article><article><span>02</span><h2>Organize com apoio</h2><p>Uma estrutura para revisar e desenvolver com sua voz.</p></article><article><span>03</span><h2>Prepare seu material</h2><p>Um PDF para conferir, ajustar e compartilhar no futuro.</p></article></section>`;
    root
      .querySelectorAll(
        ".sidebar nav a[aria-current], .bottom-nav a[aria-current]",
      )
      .forEach((a) => a.removeAttribute("aria-current"));
    root
      .querySelector("[data-future-ai]")
      ?.setAttribute("aria-current", "page");
    root
      .querySelector(".bottom-nav button")
      ?.setAttribute("aria-current", "page");
  }
  return root.outerHTML;
}
