/** New menu/character review layer. Never imported by the actual application. */
export function decoratePreviewCharacters(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const root = document.querySelector<HTMLElement>(".app-shell");
  if (!root) return html;
  const nav = root.querySelector<HTMLElement>(".sidebar nav")!;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a")];
  const icons: Record<string, string> = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    products:
      '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bonus:
      '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>',
    ai: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    offers:
      '<path d="M3 4h8l10 10-7 7L3 10V4Z"/><circle cx="7.5" cy="7.5" r="1"/>',
    account:
      '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    support:
      '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01"/>',
  };
  const labels: Record<string, string> = {
    home: "Início",
    products: "Meus Produtos",
    bonus: "Bônus",
    ai: "Estúdio IA",
    offers: "Ofertas Especiais",
    account: "Minha conta",
    support: "Ajuda e suporte",
  };
  const groups = [
    { id: "learn", title: "Aprender", screens: ["home", "products", "bonus"] },
    { id: "explore", title: "Explorar", screens: ["ai", "offers"] },
    { id: "personal", title: "Pessoal", screens: ["account", "support"] },
  ];
  nav.replaceChildren();
  for (const group of groups) {
    const details = document.createElement("details");
    details.className = "nav-group";
    details.dataset.navGroup = group.id;
    details.open = true;
    const summary = document.createElement("summary");
    summary.innerHTML = `<span>${group.title}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>`;
    const items = document.createElement("div");
    items.className = "nav-group-items";
    for (const screen of group.screens) {
      const link = links.find(
        (link) =>
          new URL(
            link.getAttribute("href")!,
            "https://offline.invalid",
          ).searchParams.get("screen") === screen,
      );
      if (!link) continue;
      link.dataset.navTarget = screen;
      link.innerHTML = `<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[screen]}</svg></span><span class="nav-item-title">${labels[screen]}</span>${screen === "ai" ? '<small class="nav-soon">Em breve</small>' : ""}`;
      items.append(link);
    }
    details.append(summary, items);
    nav.append(details);
  }
  root.querySelector(".sidebar > .nav-label")?.remove();
  const footer = root.querySelector(".sidebar-bottom")!;
  footer.querySelector("p")?.remove();
  const profile = document.createElement("a");
  profile.className = "sidebar-profile";
  profile.href = "/wireframes?screen=account";
  profile.innerHTML =
    '<span class="avatar" aria-hidden="true">A</span><span>Seu perfil<small>Escolher personagem</small></span><span aria-hidden="true">↗</span>';
  footer.prepend(profile);
  const identity = root.querySelector(".account-identity");
  if (identity) {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "button outline avatar-picker-trigger";
    trigger.dataset.action = "avatar-picker";
    trigger.setAttribute("aria-controls", "avatar-picker-panel");
    trigger.setAttribute("aria-expanded", "false");
    trigger.textContent = "Escolher personagem";
    identity.after(trigger);
    const picker = document.createElement("section");
    picker.id = "avatar-picker-panel";
    picker.className = "avatar-picker-panel";
    picker.hidden = true;
    picker.setAttribute("aria-labelledby", "avatar-picker-title");
    picker.innerHTML =
      '<div class="settings-heading"><div><span class="eyebrow">UM ROSTO PARA SEU ESPAÇO</span><h2 id="avatar-picker-title">Escolha seu personagem</h2></div><button class="button outline" type="button" data-action="close-avatar-picker">Concluir</button></div><p>Sua escolha aparece no perfil e no Estúdio IA. Os olhos acompanham seu cursor.</p><div class="avatar-choice-grid" role="group" aria-label="Personagens disponíveis"></div><p class="microcopy" role="status" id="avatar-choice-status">Escolha de demonstração · apenas enquanto esta prévia estiver aberta.</p>';
    root.querySelector(".account-overview")!.after(picker);
  }
  const stage = root.querySelector(".ai-orb-stage");
  if (stage) {
    stage.className = "character-studio-stage";
    stage.innerHTML =
      '<span class="character-state" data-character-state>Curioso</span><button type="button" class="character-play" data-action="play-character" aria-label="Brincar com personagem" aria-describedby="character-instructions"><span data-character-stage></span></button><p id="character-instructions"><span class="pointer-hint">Mova o cursor. Clique para mudar a cor.</span><span class="touch-hint">Toque para mudar a cor e a expressão.</span><span class="sr-only">Enter ou Espaço também funcionam. Quatro cliques rápidos mostram uma expressão brava de brincadeira.</span></p><small class="character-status" role="status" data-character-status>Uma companhia para suas ideias.</small>';
  }
  return root.outerHTML;
}
