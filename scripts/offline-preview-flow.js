/* In-memory idea planning only. Local references never leave this document. */
(() => {
  const WIDTH = 1120,
    HEIGHT = 760;
  const model = {
    nextId: 1,
    nodes: [
      { id: "idea-example", kind: "idea", text: "Colorir PDF", x: 56, y: 132 },
      { id: "assistant", kind: "assistant", x: 430, y: 132 },
      { id: "pdf", kind: "pdf", x: 810, y: 132 },
    ],
    edges: [
      { from: "idea-example", to: "assistant" },
      { from: "assistant", to: "pdf" },
    ],
  };
  let root = null,
    lifetime = null,
    pending = null,
    gesture = null,
    ignoreClickUntil = 0,
    ignoredControl = null;
  let selectionVersion = 0,
    activeDecode = null,
    pendingUrl = null;
  const nodeById = (id) => model.nodes.find((node) => node.id === id);
  const label = (node) =>
    node.kind === "idea"
      ? "Ideia: " + (node.text.trim().slice(0, 45) || "sem texto")
      : node.kind === "image"
        ? "Referência: " + node.name
        : node.kind === "assistant"
          ? "IA"
          : "PDF";
  function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function button(text, attr, value) {
    const item = el("button", "flow-button", text);
    item.type = "button";
    if (attr) item.dataset[attr] = value ?? "";
    return item;
  }
  function status(message) {
    const live = root?.querySelector(".flow-status");
    if (live) live.textContent = message;
  }
  function cancelDecode() {
    selectionVersion += 1;
    if (activeDecode) {
      activeDecode.onload = null;
      activeDecode.onerror = null;
      activeDecode.src = "";
      activeDecode = null;
    }
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    pendingUrl = null;
  }
  function refreshAvatars() {
    root?.querySelectorAll("[data-flow-avatar]").forEach((host) => {
      // This provider returns only trusted static internal avatar geometry.
      host.innerHTML =
        window.previewCharacters?.getAvatarMarkup?.(
          host.dataset.flowAvatar === "assistant" ? "lavanda" : undefined,
        ) || "";
    });
  }
  function makePort(node, direction) {
    const kind =
      node.kind === "assistant"
        ? "da IA"
        : node.kind === "pdf"
          ? "do PDF"
          : node.kind === "image"
            ? "de referência"
            : "de ideia";
    const port = button("", "port", direction);
    port.className = "flow-port flow-port-" + direction;
    port.dataset.node = node.id;
    if (direction === "out") port.setAttribute("aria-pressed", "false");
    port.setAttribute(
      "aria-label",
      (direction === "out" ? "Saída " : "Entrada ") + kind,
    );
    port.title =
      direction === "out"
        ? "Conectar: arraste ou clique e escolha uma entrada"
        : "Entrada: selecione uma saída e conecte aqui";
    return port;
  }
  function renderNode(node) {
    const card = el("article", "flow-node");
    card.dataset.nodeId = node.id;
    card.dataset.kind = node.kind;
    card.style.left = node.x + "px";
    card.style.top = node.y + "px";
    const head = el("div", "flow-node-head");
    const kind =
      node.kind === "idea"
        ? "ideia"
        : node.kind === "image"
          ? "referência"
          : node.kind === "assistant"
            ? "IA"
            : "PDF";
    const handle = button("", "move", node.id);
    handle.className = "flow-move";
    handle.setAttribute(
      "aria-label",
      "Mover " + kind + ". Use as setas; Shift move mais.",
    );
    handle.title = "Arraste para mover ou use as setas do teclado";
    const grip = el("span", "flow-grip", "⠿");
    grip.setAttribute("aria-hidden", "true");
    handle.append(
      grip,
      el(
        "span",
        "",
        node.kind === "idea"
          ? "Sua ideia"
          : node.kind === "image"
            ? "Referência"
            : node.kind === "assistant"
              ? "Assistente IA"
              : "Seu próximo PDF",
      ),
    );
    head.append(handle);
    if (node.kind === "idea" || node.kind === "image") {
      const remove = button("×", "deleteNode", node.id);
      remove.className = "flow-delete";
      remove.setAttribute("aria-label", "Excluir " + kind);
      head.append(remove);
    }
    card.append(head);
    if (node.kind === "idea") {
      const owner = el("span", "avatar flow-person-avatar");
      owner.dataset.flowAvatar = "person";
      owner.setAttribute("aria-hidden", "true");
      const text = el("textarea", "flow-idea-text");
      text.setAttribute("aria-label", "Texto da ideia");
      text.maxLength = 2000;
      text.placeholder = "O que você quer criar?";
      text.value = node.text;
      text.dataset.editNode = node.id;
      card.append(
        owner,
        text,
        el("small", "flow-node-caption", "Texto editável"),
      );
    } else if (node.kind === "image") {
      const img = el("img", "flow-reference");
      img.src = node.url;
      img.alt = "Referência local: " + node.name;
      card.append(
        img,
        el("p", "flow-file-name", node.name),
        el("small", "flow-node-caption", "Só neste dispositivo · sem upload"),
      );
    } else if (node.kind === "assistant") {
      const avatar = el("span", "flow-assistant-avatar");
      avatar.dataset.flowAvatar = "assistant";
      avatar.setAttribute("aria-hidden", "true");
      card.append(
        avatar,
        el("strong", "flow-node-title", "Uma ideia ganha forma"),
        el("p", "flow-node-copy", "Conecte suas ideias e referências aqui."),
      );
    } else {
      const icon = el("span", "flow-pdf-icon", "PDF");
      icon.setAttribute("aria-hidden", "true");
      const generate = button("Gerar PDF · em breve");
      generate.disabled = true;
      generate.className += " flow-generate";
      card.append(
        icon,
        el("p", "flow-node-copy", "A geração será integrada depois."),
        generate,
      );
    }
    if (node.kind === "assistant" || node.kind === "pdf")
      card.append(makePort(node, "in"));
    if (node.kind !== "pdf") card.append(makePort(node, "out"));
    return card;
  }
  function positionOf(id, direction) {
    const card = [...root.querySelectorAll(".flow-node")].find(
      (item) => item.dataset.nodeId === id,
    );
    const node = nodeById(id);
    return node && card
      ? {
          x: node.x + (direction === "out" ? card.offsetWidth : 0),
          y: node.y + card.offsetHeight / 2,
        }
      : null;
  }
  function curve(a, b) {
    const distance = Math.max(65, Math.abs(b.x - a.x) / 2);
    return `M ${a.x} ${a.y} C ${a.x + distance} ${a.y}, ${b.x - distance} ${b.y}, ${b.x} ${b.y}`;
  }
  function drawEdges(preview) {
    if (!root) return;
    const svg = root.querySelector(".flow-edges");
    svg.replaceChildren();
    for (const edge of model.edges) {
      const a = positionOf(edge.from, "out"),
        b = positionOf(edge.to, "in");
      if (!a || !b) continue;
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", curve(a, b));
      path.dataset.from = edge.from;
      path.dataset.to = edge.to;
      svg.append(path);
    }
    if (preview && pending) {
      const a = positionOf(pending, "out");
      if (a) {
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("d", curve(a, preview));
        path.classList.add("flow-edge-preview");
        svg.append(path);
      }
    }
  }
  function renderConnections() {
    if (!root) return;
    root.querySelector(".flow-connections summary").textContent =
      "Conexões · " + model.edges.length;
    const source = root.querySelector("[name=flow-source]"),
      target = root.querySelector("[name=flow-target]");
    const selectedSource = source.value,
      selectedTarget = target.value;
    source.replaceChildren();
    target.replaceChildren();
    for (const node of model.nodes) {
      if (node.kind !== "pdf") source.append(new Option(label(node), node.id));
      if (node.kind === "assistant" || node.kind === "pdf")
        target.append(new Option(label(node), node.id));
    }
    if ([...source.options].some((option) => option.value === selectedSource))
      source.value = selectedSource;
    if ([...target.options].some((option) => option.value === selectedTarget))
      target.value = selectedTarget;
    const list = root.querySelector(".flow-edge-list");
    list.replaceChildren();
    for (const edge of model.edges) {
      const row = el("li");
      row.append(
        el(
          "span",
          "",
          label(nodeById(edge.from)) + " → " + label(nodeById(edge.to)),
        ),
      );
      const remove = button("Remover", "removeEdge", "");
      remove.dataset.edgeFrom = edge.from;
      remove.dataset.edgeTo = edge.to;
      remove.setAttribute(
        "aria-label",
        "Remover conexão de " +
          label(nodeById(edge.from)) +
          " para " +
          label(nodeById(edge.to)),
      );
      row.append(remove);
      list.append(row);
    }
    if (!model.edges.length)
      list.append(
        el(
          "li",
          "flow-empty",
          "Nenhuma conexão. Escolha a origem e o destino acima.",
        ),
      );
  }
  function renderNodes(focusId) {
    if (!root) return;
    const layer = root.querySelector(".flow-node-layer");
    layer.replaceChildren(...model.nodes.map(renderNode));
    refreshAvatars();
    renderConnections();
    drawEdges();
    if (focusId) {
      const card = [...layer.children].find(
        (item) => item.dataset.nodeId === focusId,
      );
      card
        ?.querySelector("textarea, [data-move]")
        ?.focus({ preventScroll: true });
      card?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  function connect(from, to) {
    const source = nodeById(from),
      target = nodeById(to);
    clearPending();
    if (!source || !target) return;
    if (from === to) return status("Um nó não pode se conectar a ele mesmo.");
    if (model.edges.some((edge) => edge.from === from && edge.to === to))
      return status("Essa conexão já existe.");
    if (
      !(
        (source.kind === "idea" || source.kind === "image") &&
        target.kind === "assistant"
      ) &&
      !(source.kind === "assistant" && target.kind === "pdf")
    )
      return status("Conecte uma ideia ou referência à IA, e a IA ao PDF.");
    model.edges.push({ from, to });
    renderConnections();
    drawEdges();
    status("Conexão criada: " + label(source) + " → " + label(target) + ".");
  }
  function clearPending() {
    pending = null;
    root
      ?.querySelectorAll("[data-port=out]")
      .forEach((port) => port.setAttribute("aria-pressed", "false"));
    drawEdges();
  }
  function chooseOutput(id) {
    if (pending === id) {
      clearPending();
      status("Conexão cancelada.");
      return;
    }
    pending = id;
    root
      .querySelectorAll("[data-port=out]")
      .forEach((port) =>
        port.setAttribute("aria-pressed", String(port.dataset.node === id)),
      );
    status(
      "Escolha uma entrada para conectar. Escape cancela. Você também pode usar o painel Conexões.",
    );
  }
  function addNode(node) {
    model.nodes.push(node);
    renderNodes(node.id);
  }
  function newPosition() {
    const count = model.nodes.filter(
      (node) => node.kind === "idea" || node.kind === "image",
    ).length;
    const index = Math.max(0, count - 1);
    return {
      x: 56 + (index % 3) * 290,
      y: Math.min(484, 370 + Math.floor(index / 3) * 30),
    };
  }
  function cancelGesture() {
    const current = gesture;
    gesture = null;
    if (current?.handle.hasPointerCapture(current.id))
      current.handle.releasePointerCapture(current.id);
    clearPending();
  }
  function pickImage(file) {
    cancelDecode();
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
      return status("Escolha uma imagem PNG, JPEG ou WebP.");
    if (file.size > 5 * 1024 * 1024)
      return status("A imagem precisa ter no máximo 5 MB.");
    const version = selectionVersion;
    const image = new Image();
    const url = URL.createObjectURL(file);
    activeDecode = image;
    pendingUrl = url;
    status("Lendo referência local…");
    image.onload = () => {
      if (version !== selectionVersion) return;
      activeDecode = null;
      pendingUrl = null;
      image.onload = null;
      image.onerror = null;
      if (!image.naturalWidth || !image.naturalHeight) {
        URL.revokeObjectURL(url);
        status("Não foi possível decodificar a imagem. Escolha outro arquivo.");
        return;
      }
      addNode({
        id: "reference-" + model.nextId++,
        kind: "image",
        name: file.name.slice(0, 200),
        url,
        ...newPosition(),
      });
      status(
        "Referência adicionada só nesta página. Nenhum arquivo foi enviado.",
      );
    };
    image.onerror = () => {
      if (version !== selectionVersion) return;
      activeDecode = null;
      pendingUrl = null;
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(url);
      status("Não foi possível decodificar a imagem. Escolha outro arquivo.");
    };
    image.src = url;
  }
  function moveNode(node, x, y) {
    const card = [...root.querySelectorAll(".flow-node")].find(
      (item) => item.dataset.nodeId === node.id,
    );
    node.x = Math.round(
      Math.max(22, Math.min(WIDTH - card.offsetWidth - 22, x)),
    );
    node.y = Math.round(
      Math.max(22, Math.min(HEIGHT - card.offsetHeight - 22, y)),
    );
    card.style.left = node.x + "px";
    card.style.top = node.y + "px";
    drawEdges();
  }
  function mount() {
    dispose();
    root = document.querySelector("[data-flow-root]");
    if (!root) return;
    lifetime = new AbortController();
    const options = { signal: lifetime.signal };
    root.innerHTML = `<div class="flow-heading"><div><p class="flow-eyebrow">ESTÚDIO DE IDEIAS</p><h2>Comece com uma ideia</h2><p>Organize o que você imagina. Conecte os pontos.</p></div><span class="flow-local-label">Só nesta página</span></div><div class="flow-toolbar"><button type="button" class="flow-button flow-primary" data-new-idea>＋ Nova ideia</button><button type="button" class="flow-button" data-add-image>＋ Imagem local</button><input type="file" accept="image/png,image/jpeg,image/webp" class="flow-file-input" aria-label="Adicionar referência local"><span>PNG, JPEG ou WebP · até 5 MB</span></div><p class="flow-help" id="flow-help">Arraste pelo título ou use as setas com o título em foco. Conecte pelas bolinhas ou pelo painel Conexões. Deslize a área para explorar.</p><div class="flow-viewport" tabindex="0" role="region" aria-label="Quadro de ideias, área navegável" aria-describedby="flow-help"><div class="flow-canvas"><svg class="flow-edges" width="1120" height="760" aria-hidden="true"></svg><div class="flow-node-layer"></div></div></div><details class="flow-connections"><summary>Conexões</summary><form class="flow-connect-form"><label>Origem da conexão<select name="flow-source" aria-label="Origem da conexão"></select></label><span aria-hidden="true">→</span><label>Destino da conexão<select name="flow-target" aria-label="Destino da conexão"></select></label><button type="submit" class="flow-button">Criar conexão</button></form><ul class="flow-edge-list"></ul></details><p class="flow-status" role="status" aria-live="polite">Seu quadro é temporário: fica ao navegar e é descartado ao recarregar. A geração de PDF estará disponível no futuro.</p>`;
    root
      .querySelector("[data-new-idea]")
      .setAttribute("aria-label", "Nova ideia");
    root
      .querySelector("[data-add-image]")
      .setAttribute("aria-label", "Imagem local");
    root.addEventListener(
      "click",
      (event) => {
        const control = event.target.closest("button");
        if (
          !control ||
          control.disabled ||
          (control === ignoredControl &&
            event.detail > 0 &&
            Date.now() < ignoreClickUntil)
        )
          return;
        if (control.hasAttribute("data-new-idea")) {
          const id = "idea-" + model.nextId++;
          addNode({ id, kind: "idea", text: "", ...newPosition() });
          status("Ideia criada. Escreva seu texto no novo nó.");
        } else if (control.hasAttribute("data-add-image"))
          root.querySelector("input[type=file]").click();
        else if (control.hasAttribute("data-delete-node")) {
          const id = control.dataset.deleteNode,
            node = nodeById(id);
          if (!node || !["idea", "image"].includes(node.kind)) return;
          if (node.url) URL.revokeObjectURL(node.url);
          model.nodes = model.nodes.filter((item) => item.id !== id);
          model.edges = model.edges.filter(
            (edge) => edge.from !== id && edge.to !== id,
          );
          clearPending();
          renderNodes();
          root.querySelector("[data-new-idea]").focus();
          status("Nó e suas conexões removidos.");
        } else if (control.hasAttribute("data-remove-edge")) {
          model.edges = model.edges.filter(
            (edge) =>
              !(
                edge.from === control.dataset.edgeFrom &&
                edge.to === control.dataset.edgeTo
              ),
          );
          renderConnections();
          drawEdges();
          root.querySelector(".flow-connections summary").focus();
          status("Conexão removida.");
        } else if (control.dataset.port === "out")
          chooseOutput(control.dataset.node);
        else if (control.dataset.port === "in") {
          if (pending) connect(pending, control.dataset.node);
          else
            status("Selecione primeiro uma saída, ou use o painel Conexões.");
        }
      },
      options,
    );
    root.addEventListener(
      "input",
      (event) => {
        const node = nodeById(event.target.dataset.editNode);
        if (node) node.text = event.target.value;
      },
      options,
    );
    root.addEventListener(
      "change",
      (event) => {
        if (event.target.matches("input[type=file]")) {
          pickImage(event.target.files?.[0]);
          event.target.value = "";
        }
        if (event.target.dataset.editNode) renderConnections();
      },
      options,
    );
    root.addEventListener(
      "submit",
      (event) => {
        if (!event.target.matches(".flow-connect-form")) return;
        event.preventDefault();
        connect(
          root.querySelector("[name=flow-source]").value,
          root.querySelector("[name=flow-target]").value,
        );
      },
      options,
    );
    root.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          clearPending();
          status("Conexão cancelada.");
        }
        const node = nodeById(event.target.dataset.move);
        if (
          !node ||
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
            event.key,
          )
        )
          return;
        event.preventDefault();
        const step = event.shiftKey ? 48 : 16;
        moveNode(
          node,
          node.x +
            (event.key === "ArrowRight"
              ? step
              : event.key === "ArrowLeft"
                ? -step
                : 0),
          node.y +
            (event.key === "ArrowDown"
              ? step
              : event.key === "ArrowUp"
                ? -step
                : 0),
        );
        event.target.scrollIntoView({ block: "nearest", inline: "nearest" });
      },
      options,
    );
    root.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0) return;
        const handle = event.target.closest("[data-move], [data-port=out]");
        if (!handle) return;
        const node = nodeById(handle.dataset.move || handle.dataset.node);
        gesture = {
          id: event.pointerId,
          kind: handle.hasAttribute("data-move") ? "move" : "edge",
          node,
          startX: event.clientX,
          startY: event.clientY,
          x: node.x,
          y: node.y,
          moved: false,
          handle,
        };
        handle.setPointerCapture(event.pointerId);
        handle.focus({ preventScroll: true });
      },
      options,
    );
    window.addEventListener(
      "pointermove",
      (event) => {
        if (!gesture || event.pointerId !== gesture.id) return;
        if (event.buttons === 0) {
          cancelGesture();
          return;
        }
        const dx = event.clientX - gesture.startX,
          dy = event.clientY - gesture.startY;
        if (Math.abs(dx) + Math.abs(dy) > 4) gesture.moved = true;
        if (!gesture.moved) return;
        if (gesture.kind === "move")
          moveNode(gesture.node, gesture.x + dx, gesture.y + dy);
        else {
          pending = gesture.node.id;
          const bounds = root
            .querySelector(".flow-canvas")
            .getBoundingClientRect();
          drawEdges({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
          });
        }
      },
      options,
    );
    window.addEventListener(
      "pointerup",
      (event) => {
        if (!gesture || event.pointerId !== gesture.id) return;
        const current = gesture;
        gesture = null;
        if (current.handle.hasPointerCapture(event.pointerId))
          current.handle.releasePointerCapture(event.pointerId);
        if (!current.moved) return;
        ignoreClickUntil = Date.now() + 150;
        ignoredControl = current.handle;
        if (current.kind === "edge") {
          const target = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest("[data-port=in]");
          if (target && root.contains(target))
            connect(current.node.id, target.dataset.node);
          else {
            clearPending();
            status(
              "Conexão cancelada. Solte sobre uma entrada ou use o painel Conexões.",
            );
          }
        }
      },
      options,
    );
    window.addEventListener(
      "pointercancel",
      (event) => {
        if (gesture && event.pointerId === gesture.id) cancelGesture();
      },
      options,
    );
    root.addEventListener(
      "lostpointercapture",
      (event) => {
        if (gesture && event.pointerId === gesture.id) cancelGesture();
      },
      options,
    );
    window.addEventListener("blur", cancelGesture, options);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) cancelGesture();
      },
      options,
    );
    renderNodes();
  }
  function dispose() {
    lifetime?.abort();
    lifetime = null;
    cancelGesture();
    cancelDecode();
    gesture = null;
    pending = null;
    ignoredControl = null;
    ignoreClickUntil = 0;
    root?.replaceChildren();
    root = null;
  }
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    cancelDecode();
    for (const node of model.nodes) if (node.url) URL.revokeObjectURL(node.url);
  });
  window.previewFlow = { mount, dispose, refreshAvatars };
})();
