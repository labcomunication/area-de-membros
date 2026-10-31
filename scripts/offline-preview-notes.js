/* Plain-text, in-memory notes and bookmarks. Reloading discards every edit. */
const noteColumns = {
  ideas: "Ideias",
  working: "Em andamento",
  saved: "Guardados",
};
const notesState = {
  serial: 3,
  editing: null,
  deleted: null,
  menuResource: null,
  menuScroll: null,
  menuTrigger: null,
  toastTimer: null,
  notes: [
    {
      id: "note-1",
      title: "Uma ideia para experimentar",
      text: "Use este cartão como exemplo. Suas notas ficam somente nesta prévia.",
      column: "ideas",
    },
    {
      id: "note-2",
      title: "Meu próximo passo",
      text: "Reserve um momento para explorar seus materiais e anotar o que quer testar.",
      column: "working",
    },
    {
      id: "note-3",
      title: "Referências por perto",
      text: "Guarde um produto ou bônus pelo botão de marcador ou pelo menu de contexto.",
      column: "saved",
    },
  ],
};
function notesToast(message, undo = false) {
  document.querySelector(".preview-toast")?.remove();
  clearTimeout(notesState.toastTimer);
  const toast = document.createElement("div");
  toast.className = "preview-toast";
  toast.setAttribute("role", "status");
  const label = document.createElement("span");
  label.textContent = message;
  toast.append(label);
  if (undo) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "undo-note";
    button.textContent = "Desfazer";
    toast.append(button);
  } else {
    const link = document.createElement("a");
    link.href = "#screen=notes";
    link.textContent = "Ver anotações";
    toast.append(link);
  }
  document.body.append(toast);
  notesState.toastTimer = setTimeout(() => toast.remove(), 5000);
}
function drawNotes() {
  const board = view.querySelector(".notes-board");
  if (!board) return;
  for (const [column, label] of Object.entries(noteColumns)) {
    const section = board.querySelector(`[data-column="${column}"]`);
    const list = section.querySelector("[data-note-list]");
    list.replaceChildren();
    const notes = notesState.notes.filter((note) => note.column === column);
    section.querySelector("[data-column-count]").textContent = String(
      notes.length,
    );
    if (!notes.length) {
      const empty = document.createElement("p");
      empty.className = "note-empty";
      empty.textContent = "Arraste um cartão para cá ou use Mover para.";
      list.append(empty);
    }
    for (const note of notes) {
      const card = document.createElement("article");
      card.className = "note-card";
      card.dataset.noteId = note.id;
      card.draggable = true;
      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "note-drag-handle";
      handle.draggable = true;
      handle.setAttribute("aria-label", "Arrastar anotação");
      handle.title = "Arrastar anotação";
      handle.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>';
      const heading = document.createElement("h3");
      heading.textContent = note.title;
      const body = document.createElement("p");
      body.textContent = note.text;
      card.append(handle, heading, body);
      if (note.productId) {
        const link = document.createElement("a");
        link.className = "note-resource-link";
        link.textContent = note.locked
          ? "Ver referência · acesso bloqueado"
          : "Ver material";
        link.href =
          "#product=" +
          encodeURIComponent(note.productId) +
          "&screen=" +
          (note.locked ? "locked" : "product");
        card.append(link);
      }
      const tools = document.createElement("div");
      tools.className = "note-tools";
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Mover anotação " + note.title);
      select.title = "Mover para";
      for (const [id, name] of Object.entries(noteColumns)) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = "Mover para: " + name;
        select.append(option);
      }
      select.value = column;
      tools.append(select);
      for (const [action, name, text] of [
        ["edit-note", "Editar anotação", "Editar"],
        ["delete-note", "Excluir anotação", "Excluir"],
      ]) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.action = action;
        button.setAttribute("aria-label", name);
        button.textContent = text;
        tools.append(button);
      }
      card.append(tools);
      list.append(card);
    }
    section.setAttribute(
      "aria-label",
      label + ": " + notes.length + " anotações",
    );
  }
}
function openNoteEditor(id = null) {
  const form = view.querySelector("[data-note-editor]");
  if (!form) return;
  notesState.editing = id;
  const note = notesState.notes.find((item) => item.id === id);
  form.elements.title.value = note?.title || "";
  form.elements.body.value = note?.text || "";
  form.hidden = false;
  form.elements.title.focus();
}
function closeNoteEditor() {
  const form = view.querySelector("[data-note-editor]");
  if (!form || form.hidden) return false;
  form.hidden = true;
  notesState.editing = null;
  view.querySelector('[data-action="new-note"]')?.focus();
  return true;
}
function resourceFromCard(card) {
  return {
    productId: card.dataset.product,
    title: card.querySelector("h3").textContent,
    locked: card.classList.contains("is-locked"),
  };
}
function saveResource(resource) {
  if (!resource) return;
  if (notesState.notes.some((note) => note.productId === resource.productId))
    return notesToast("Essa referência já está guardada.");
  notesState.notes.push({
    id: "note-" + ++notesState.serial,
    title: resource.title,
    text: "Referência guardada da sua biblioteca. O acesso ao conteúdo depende dos seus produtos.",
    column: "saved",
    ...resource,
  });
  notesToast("Referência guardada nesta prévia.");
}
function closeResourceMenu(restoreFocus = false) {
  const menu = document.querySelector(".resource-context-menu");
  if (!menu) return false;
  menu.remove();
  notesState.menuResource = null;
  notesState.menuScroll = null;
  if (restoreFocus === true)
    notesState.menuTrigger?.focus({ preventScroll: true });
  notesState.menuTrigger = null;
  return true;
}
function openResourceMenu(card, x, y) {
  closeResourceMenu();
  notesState.menuResource = resourceFromCard(card);
  notesState.menuTrigger = card.querySelector(".save-resource-button");
  notesState.menuScroll = { x: scrollX, y: scrollY };
  const menu = document.createElement("div");
  menu.className = "resource-context-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Opções do material");
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("role", "menuitem");
  button.dataset.action = "save-context-resource";
  button.textContent = "Guardar nas anotações";
  menu.append(button);
  menu.style.left = Math.max(8, Math.min(x, innerWidth - 260)) + "px";
  menu.style.top = Math.max(8, Math.min(y, innerHeight - 72)) + "px";
  document.body.append(menu);
  button.focus();
}
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!form.matches("[data-note-editor]")) return;
  event.preventDefault();
  const title = form.elements.title.value.trim().slice(0, 80),
    text = form.elements.body.value.trim().slice(0, 1000);
  if (!title) {
    form.elements.title.focus();
    return;
  }
  const note = notesState.notes.find((item) => item.id === notesState.editing);
  if (note) {
    note.title = title;
    note.text = text;
  } else
    notesState.notes.push({
      id: "note-" + ++notesState.serial,
      title,
      text,
      column: "ideas",
    });
  form.hidden = true;
  notesState.editing = null;
  drawNotes();
  notesToast("Anotação salva apenas nesta prévia.");
});
document.addEventListener("change", (event) => {
  const select = event.target.closest(".note-card select");
  if (!select || !Object.hasOwn(noteColumns, select.value)) return;
  const id = select.closest(".note-card").dataset.noteId;
  const note = notesState.notes.find((item) => item.id === id);
  if (note) note.column = select.value;
  drawNotes();
  view.querySelector(`[data-note-id="${id}"] select`)?.focus();
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!event.target.closest(".resource-context-menu")) closeResourceMenu();
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  const id = button.closest(".note-card")?.dataset.noteId;
  if (action === "new-note") openNoteEditor();
  else if (action === "cancel-note") closeNoteEditor();
  else if (action === "edit-note") openNoteEditor(id);
  else if (action === "delete-note") {
    notesState.deleted = notesState.notes.find((note) => note.id === id);
    notesState.notes = notesState.notes.filter((note) => note.id !== id);
    drawNotes();
    notesToast("Anotação excluída desta prévia.", true);
  } else if (action === "undo-note" && notesState.deleted) {
    notesState.notes.push(notesState.deleted);
    notesState.deleted = null;
    drawNotes();
    document.querySelector(".preview-toast")?.remove();
  } else if (action === "save-product")
    saveResource(resourceFromCard(button.closest(".product-card")));
  else if (action === "save-context-resource") {
    const resource = notesState.menuResource;
    closeResourceMenu();
    saveResource(resource);
  }
});
document.addEventListener("contextmenu", (event) => {
  const card = event.target.closest(".product-card[data-product]");
  if (!card) return;
  event.preventDefault();
  openResourceMenu(card, event.clientX, event.clientY);
});
document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      (closeResourceMenu(true) || closeNoteEditor())
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (
      event.key === "ContextMenu" ||
      (event.shiftKey && event.key === "F10")
    ) {
      const card = event.target.closest(".product-card[data-product]");
      if (!card) return;
      event.preventDefault();
      const bounds = card.getBoundingClientRect();
      openResourceMenu(card, bounds.left + 16, bounds.top + 16);
    }
  },
  true,
);
document.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".note-card");
  if (!card) return;
  event.dataTransfer.setData("application/x-members-note", card.dataset.noteId);
  event.dataTransfer.effectAllowed = "move";
  card.classList.add("is-dragging");
});
document.addEventListener("dragover", (event) => {
  const column = event.target.closest(".board-column");
  if (
    column &&
    event.dataTransfer.types.includes("application/x-members-note")
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
});
document.addEventListener("drop", (event) => {
  const column = event.target.closest(".board-column");
  if (!column) return;
  const id = event.dataTransfer.getData("application/x-members-note");
  const note = notesState.notes.find((item) => item.id === id);
  if (note) {
    event.preventDefault();
    note.column = column.dataset.column;
    drawNotes();
  }
});
document.addEventListener("dragend", () =>
  view
    .querySelectorAll(".is-dragging")
    .forEach((card) => card.classList.remove("is-dragging")),
);
window.addEventListener(
  "scroll",
  () => {
    const origin = notesState.menuScroll;
    if (origin && (origin.x !== scrollX || origin.y !== scrollY))
      closeResourceMenu();
  },
  { passive: true },
);
window.previewNotes = { mount: drawNotes, closeTransient: closeResourceMenu };
