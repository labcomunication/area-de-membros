/* Plain-text, in-memory notes and bookmarks. Reloading discards every edit. */
const noteColumns = {
  ideas: "Ideias",
  working: "Em andamento",
  saved: "Guardados",
};
const notesState = {
  serial: 3,
  editing: null,
  editorColumn: "ideas",
  editorOrigin: null,
  editor: null,
  deleted: null,
  menu: null,
  picker: null,
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
    const button = noteButton("Desfazer", "undo-note");
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
function noteButton(label, action, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  button.className = className;
  return button;
}
function menuTrigger(button) {
  button.setAttribute("aria-haspopup", "menu");
  button.setAttribute("aria-expanded", "false");
  return button;
}
function notesFocusOrigin(trigger) {
  return {
    trigger,
    noteId: trigger?.closest(".note-card")?.dataset.noteId,
    action: trigger?.dataset.action,
    column: trigger?.closest(".board-column")?.dataset.column,
  };
}
function restoreNotesFocus(origin) {
  // Cards are recreated after every mutation: resolve the current control first.
  const card =
    origin?.noteId && view.querySelector(`[data-note-id="${origin.noteId}"]`);
  const target =
    card?.querySelector(`[data-action="${origin.action}"]`) ||
    (origin?.trigger?.isConnected ? origin.trigger : null) ||
    (origin?.column &&
      view.querySelector(
        `[data-column="${origin.column}"] [data-action="board-actions"]`,
      )) ||
    view.querySelector('[data-action="board-actions"]') ||
    view.querySelector('[data-action="new-note"]');
  target?.focus({ preventScroll: true });
}
function enhanceNotesBoard(board) {
  board.tabIndex = 0;
  if (!view.querySelector(".notes-add-button")) {
    const add = menuTrigger(
      noteButton(
        "Adicionar ao quadro",
        "board-actions",
        "button outline notes-add-button",
      ),
    );
    view.querySelector(".notes-heading")?.append(add);
  }
  for (const [column, label] of Object.entries(noteColumns)) {
    const section = board.querySelector(`[data-column="${column}"]`);
    section.tabIndex = 0;
    if (section.querySelector('[data-action="board-actions"]')) continue;
    const add = menuTrigger(
      noteButton("+", "board-actions", "notes-column-add"),
    );
    add.setAttribute("aria-label", "Adicionar em " + label);
    add.title = "Adicionar em " + label;
    section.querySelector("h2").append(add);
  }
}
function drawNotes() {
  closeNotesMenu();
  const board = view.querySelector(".notes-board");
  if (!board) return;
  enhanceNotesBoard(board);
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
      const handle = noteButton("", "drag-note", "note-drag-handle");
      handle.draggable = true;
      handle.setAttribute("aria-label", "Arrastar anotação");
      handle.title = "Arrastar anotação";
      handle.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>';
      const actions = menuTrigger(
        noteButton("···", "note-actions", "note-actions-trigger"),
      );
      actions.setAttribute("aria-label", "Ações da anotação " + note.title);
      actions.title = "Ações da anotação";
      const heading = document.createElement("h3");
      heading.textContent = note.title;
      const body = document.createElement("p");
      body.textContent = note.text;
      card.append(handle, actions, heading, body);
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
      const move = menuTrigger(
        noteButton(
          "Mover para: " + label,
          "move-note-menu",
          "note-move-trigger",
        ),
      );
      move.setAttribute(
        "aria-label",
        "Mover anotação " + note.title + ": " + label,
      );
      const chevron = document.createElement("span");
      chevron.setAttribute("aria-hidden", "true");
      chevron.textContent = "⌄";
      move.append(chevron);
      tools.append(move);
      card.append(tools);
      list.append(card);
    }
    section.setAttribute(
      "aria-label",
      label + ": " + notes.length + " anotações",
    );
  }
}
function openNoteEditor(
  id = null,
  column = "ideas",
  origin = null,
  write = false,
) {
  const form = view.querySelector("[data-note-editor]");
  if (!form) return;
  closeNotesMenu();
  closeNotesPicker();
  // Keep the existing, labelled form and its delegated actions. Only its
  // temporary container changes; closing returns it to the notes screen.
  if (notesState.editor) closeNoteEditor(false);
  const dialog = document.createElement("dialog");
  dialog.className = "notes-composer";
  const heading = form.querySelector("h2");
  heading.id = "notes-composer-title";
  dialog.setAttribute("aria-labelledby", heading.id);
  dialog.setAttribute("aria-modal", "true");
  form.replaceWith(dialog);
  dialog.append(form);
  notesState.editing = id;
  notesState.editorColumn = Object.hasOwn(noteColumns, column)
    ? column
    : "ideas";
  notesState.editorOrigin = origin;
  const note = notesState.notes.find((item) => item.id === id);
  form.elements.title.value = note?.title || "";
  form.elements.body.value = note?.text || "";
  form.hidden = false;
  notesState.editor = { element: dialog, form };
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (notesState.editor?.element === dialog) closeNoteEditor();
  });
  dialog.addEventListener("close", () => {
    if (notesState.editor?.element === dialog) closeNoteEditor();
  });
  let backdropPointer = false;
  function outside(event) {
    const bounds = dialog.getBoundingClientRect();
    return (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    );
  }
  dialog.addEventListener("pointerdown", (event) => {
    backdropPointer = outside(event);
  });
  dialog.addEventListener("click", (event) => {
    if (backdropPointer && outside(event)) closeNoteEditor();
    backdropPointer = false;
  });
  dialog.showModal();
  (write ? form.elements.body : form.elements.title).focus({
    preventScroll: true,
  });
}
function closeNoteEditor(restoreFocus = true) {
  const editor = notesState.editor;
  if (!editor) return false;
  const { element: dialog, form } = editor;
  const origin = notesState.editorOrigin;
  // Clear state before native close fires so every dismissal runs once.
  notesState.editor = null;
  form.hidden = true;
  notesState.editing = null;
  notesState.editorOrigin = null;
  if (dialog.open) dialog.close();
  dialog.replaceWith(form);
  if (restoreFocus) restoreNotesFocus(origin);
  return true;
}
function resourceFromCard(card) {
  return {
    productId: card.dataset.product,
    title: card.querySelector("h3").textContent,
    locked: card.classList.contains("is-locked"),
  };
}
function demoNoteResources() {
  const resources = new Map();
  for (const key of ["screen=products", "screen=bonus"]) {
    const template = document.createElement("template");
    template.innerHTML = snapshots[key] || "";
    for (const card of template.content.querySelectorAll(
      ".product-card[data-product]",
    )) {
      const resource = resourceFromCard(card);
      const previous = resources.get(resource.productId);
      // A reference never overrides a lock seen in the library snapshot.
      resources.set(resource.productId, {
        ...resource,
        locked: resource.locked || Boolean(previous?.locked),
      });
    }
  }
  return [...resources.values()];
}
function saveResource(resource, column = "saved") {
  if (!resource) return;
  if (notesState.notes.some((note) => note.productId === resource.productId))
    return notesToast("Essa referência já está guardada.");
  notesState.notes.push({
    id: "note-" + ++notesState.serial,
    text: "Referência guardada da sua biblioteca. O acesso ao conteúdo depende dos seus produtos.",
    column: Object.hasOwn(noteColumns, column) ? column : "saved",
    ...resource,
  });
  drawNotes();
  notesToast("Referência guardada nesta prévia.");
}
function closeNotesMenu(restoreFocus = false) {
  const menu = notesState.menu;
  if (!menu) return false;
  notesState.menu = null;
  menu.element.remove();
  menu.origin?.trigger?.setAttribute("aria-expanded", "false");
  menu.origin?.trigger?.removeAttribute("aria-controls");
  if (restoreFocus) restoreNotesFocus(menu.origin);
  return true;
}
function openNotesMenu({
  trigger,
  label,
  items,
  x,
  y,
  className = "",
  selected = 0,
}) {
  closeNotesMenu();
  const element = document.createElement("div");
  element.className = "notes-popover " + className;
  element.id = "notes-active-menu";
  element.setAttribute("role", "menu");
  element.setAttribute("aria-label", label);
  const origin = notesFocusOrigin(trigger);
  for (const item of items) {
    const button = noteButton(item.label, item.action);
    button.setAttribute(
      "role",
      item.checked === undefined ? "menuitem" : "menuitemradio",
    );
    if (item.checked !== undefined)
      button.setAttribute("aria-checked", String(item.checked));
    button.tabIndex = -1;
    for (const [key, value] of Object.entries(item.data || {}))
      button.dataset[key] = value;
    element.append(button);
  }
  const scrollParents = [];
  for (
    let parent = trigger?.parentElement;
    parent;
    parent = parent.parentElement
  )
    scrollParents.push({
      element: parent,
      x: parent.scrollLeft,
      y: parent.scrollTop,
    });
  notesState.menu = {
    element,
    origin,
    scrollParents,
    x: scrollX,
    y: scrollY,
    width: innerWidth,
    height: innerHeight,
  };
  trigger?.setAttribute("aria-expanded", "true");
  trigger?.setAttribute("aria-controls", element.id);
  document.body.append(element);
  const anchor = trigger?.getBoundingClientRect();
  const bounds = element.getBoundingClientRect();
  const left = x ?? anchor?.left ?? 8;
  let top = y ?? anchor?.bottom ?? 8;
  if (y === undefined && top + bounds.height > innerHeight - 8 && anchor)
    top = anchor.top - bounds.height;
  element.style.left =
    Math.max(8, Math.min(left, innerWidth - bounds.width - 8)) + "px";
  element.style.top =
    Math.max(8, Math.min(top, innerHeight - bounds.height - 8)) + "px";
  element.querySelectorAll("button")[selected]?.focus({ preventScroll: true });
}
function openBoardMenu(trigger, column = "ideas", x, y) {
  const targetColumn = Object.hasOwn(noteColumns, column) ? column : "ideas";
  openNotesMenu({
    trigger,
    x,
    y,
    label: "Adicionar em " + noteColumns[targetColumn],
    items: [
      {
        label: "Adicionar nota",
        action: "board-new-note",
        data: { column: targetColumn },
      },
      {
        label: "Adicionar e-book",
        action: "board-ebook",
        data: { column: targetColumn },
      },
      {
        label: "Escrever nota",
        action: "board-write-note",
        data: { column: targetColumn },
      },
    ],
  });
}
function openResourceMenu(card, x, y) {
  const resource = resourceFromCard(card);
  openNotesMenu({
    trigger: card.querySelector(".save-resource-button"),
    x,
    y,
    label: "Opções do material",
    className: "resource-context-menu",
    items: [
      {
        label: "Guardar nas anotações",
        action: "save-context-resource",
        data: {
          productId: resource.productId,
          title: resource.title,
          locked: String(resource.locked),
        },
      },
    ],
  });
}
function closeNotesPicker(restoreFocus = false) {
  const picker = notesState.picker;
  if (!picker) return false;
  notesState.picker = null;
  picker.element.close();
  picker.element.remove();
  if (restoreFocus) restoreNotesFocus(picker.origin);
  return true;
}
function openNotesPicker(column, origin) {
  closeNotesPicker();
  const dialog = document.createElement("dialog");
  dialog.className = "notes-resource-picker";
  dialog.setAttribute("aria-labelledby", "notes-resource-title");
  dialog.setAttribute("aria-describedby", "notes-resource-description");
  const heading = document.createElement("h2");
  heading.id = "notes-resource-title";
  heading.textContent = "Adicionar e-book";
  const close = noteButton(
    "Fechar",
    "close-notes-picker",
    "notes-picker-close",
  );
  const description = document.createElement("p");
  description.id = "notes-resource-description";
  description.textContent =
    "Escolha uma referência da biblioteca de demonstração. Nenhum arquivo é adicionado e o acesso aos materiais continua o mesmo.";
  const list = document.createElement("div");
  list.className = "notes-resource-options";
  for (const resource of demoNoteResources()) {
    const button = noteButton(
      "",
      "pick-note-resource",
      "notes-resource-option",
    );
    button.dataset.productId = resource.productId;
    button.setAttribute(
      "aria-label",
      "Adicionar referência · " +
        resource.title +
        (resource.locked ? " · acesso bloqueado" : ""),
    );
    const title = document.createElement("span");
    title.textContent = resource.title;
    const status = document.createElement("small");
    status.textContent = resource.locked
      ? "Referência · acesso bloqueado"
      : "Referência da sua biblioteca";
    button.append(title, status);
    list.append(button);
  }
  dialog.append(close, heading, description, list);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeNotesPicker(true);
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      closeNotesPicker(true);
  });
  notesState.picker = { element: dialog, origin, column };
  document.body.append(dialog);
  dialog.showModal();
  close.focus();
}
function closeNotesTransient(restoreFocus = false) {
  const menuClosed = closeNotesMenu(restoreFocus);
  const pickerClosed = closeNotesPicker(restoreFocus);
  const editorClosed = closeNoteEditor(restoreFocus);
  return editorClosed || pickerClosed || menuClosed;
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
  let note = notesState.notes.find((item) => item.id === notesState.editing);
  if (note) {
    note.title = title;
    note.text = text;
  } else {
    note = {
      id: "note-" + ++notesState.serial,
      title,
      text,
      column: notesState.editorColumn,
    };
    notesState.notes.push(note);
  }
  closeNoteEditor(false);
  drawNotes();
  restoreNotesFocus({ noteId: note.id, action: "note-actions" });
  notesToast("Anotação salva apenas nesta prévia.");
});
document.addEventListener(
  "pointerdown",
  (event) => {
    const menu = notesState.menu;
    if (
      menu &&
      !menu.element.contains(event.target) &&
      !menu.origin.trigger?.contains(event.target)
    )
      closeNotesMenu();
  },
  true,
);
document.addEventListener("focusin", (event) => {
  const menu = notesState.menu;
  if (
    menu &&
    !menu.element.contains(event.target) &&
    !menu.origin.trigger?.contains(event.target)
  )
    closeNotesMenu();
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  const id =
    button.closest(".note-card")?.dataset.noteId || button.dataset.noteId;
  if (["board-actions", "note-actions", "move-note-menu"].includes(action)) {
    if (notesState.menu?.origin.trigger === button) {
      closeNotesMenu(true);
      return;
    }
    if (action === "board-actions")
      return openBoardMenu(
        button,
        button.closest(".board-column")?.dataset.column,
      );
    const note = notesState.notes.find((item) => item.id === id);
    if (!note) return;
    if (action === "move-note-menu")
      openNotesMenu({
        trigger: button,
        label: "Mover anotação",
        selected: Object.keys(noteColumns).indexOf(note.column),
        items: Object.entries(noteColumns).map(([column, label]) => ({
          label,
          action: "move-note",
          checked: note.column === column,
          data: { column, noteId: id },
        })),
      });
    else
      openNotesMenu({
        trigger: button,
        label: "Ações da anotação",
        items: [
          {
            label: "Editar anotação",
            action: "edit-note",
            data: { noteId: id },
          },
          {
            label: "Excluir anotação",
            action: "delete-note",
            data: { noteId: id },
          },
        ],
      });
    return;
  }
  const origin = notesState.menu?.origin;
  if (button.closest(".notes-popover")) closeNotesMenu();
  if (action === "new-note")
    openNoteEditor(null, "ideas", notesFocusOrigin(button));
  else if (action === "cancel-note") closeNoteEditor();
  else if (action === "edit-note") openNoteEditor(id, "ideas", origin);
  else if (action === "board-new-note" || action === "board-write-note")
    openNoteEditor(
      null,
      button.dataset.column,
      origin,
      action === "board-write-note",
    );
  else if (action === "board-ebook")
    openNotesPicker(button.dataset.column, origin);
  else if (action === "close-notes-picker") closeNotesPicker(true);
  else if (action === "pick-note-resource") {
    const picker = notesState.picker;
    const resource = demoNoteResources().find(
      (item) => item.productId === button.dataset.productId,
    );
    closeNotesPicker();
    saveResource(resource, picker?.column);
    restoreNotesFocus(picker?.origin);
  } else if (
    action === "move-note" &&
    Object.hasOwn(noteColumns, button.dataset.column)
  ) {
    const note = notesState.notes.find((item) => item.id === id);
    if (!note) return;
    note.column = button.dataset.column;
    drawNotes();
    restoreNotesFocus({ noteId: id, action: "move-note-menu" });
  } else if (action === "delete-note") {
    notesState.deleted = notesState.notes.find((note) => note.id === id);
    notesState.notes = notesState.notes.filter((note) => note.id !== id);
    drawNotes();
    restoreNotesFocus(origin);
    notesToast("Anotação excluída desta prévia.", true);
  } else if (action === "undo-note" && notesState.deleted) {
    const restoredId = notesState.deleted.id;
    notesState.notes.push(notesState.deleted);
    notesState.deleted = null;
    drawNotes();
    document.querySelector(".preview-toast")?.remove();
    restoreNotesFocus({ noteId: restoredId, action: "note-actions" });
  } else if (action === "save-product")
    saveResource(resourceFromCard(button.closest(".product-card")));
  else if (action === "save-context-resource") {
    saveResource({
      productId: button.dataset.productId,
      title: button.dataset.title,
      locked: button.dataset.locked === "true",
    });
    restoreNotesFocus(origin);
  }
});
document.addEventListener("contextmenu", (event) => {
  const card = event.target.closest(".product-card[data-product]");
  const board = event.target.closest(".notes-board");
  if (!card && !board) return;
  event.preventDefault();
  if (card) openResourceMenu(card, event.clientX, event.clientY);
  else {
    const column = event.target.closest(".board-column");
    const trigger =
      column?.querySelector('[data-action="board-actions"]') ||
      view.querySelector(".notes-add-button");
    openBoardMenu(
      trigger,
      column?.dataset.column,
      event.clientX,
      event.clientY,
    );
  }
});
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape" && closeNotesTransient(true)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const modal = notesState.editor?.element || notesState.picker?.element;
    if (event.key === "Tab" && modal) {
      const controls = [
        ...modal.querySelectorAll(
          "input:not([disabled]), textarea:not([disabled]), button:not([disabled])",
        ),
      ];
      const first = controls[0],
        last = controls.at(-1);
      if (
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
        return;
      }
    }
    const menu = notesState.menu;
    if (menu && menu.element.contains(event.target)) {
      const items = [...menu.element.querySelectorAll("button")];
      const index = items.indexOf(document.activeElement);
      let next;
      if (event.key === "ArrowDown") next = (index + 1) % items.length;
      if (event.key === "ArrowUp")
        next = (index - 1 + items.length) % items.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = items.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        items[next].focus({ preventScroll: true });
        return;
      }
      if (event.key === "Tab") {
        closeNotesMenu(true);
        return;
      }
      if (
        event.key.length === 1 &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.key !== " "
      ) {
        const nextItem = [
          ...items.slice(index + 1),
          ...items.slice(0, index + 1),
        ].find((item) =>
          item.textContent
            .toLocaleLowerCase()
            .startsWith(event.key.toLocaleLowerCase()),
        );
        if (nextItem) {
          event.preventDefault();
          nextItem.focus();
        }
      }
    }
    const trigger = event.target.closest('[aria-haspopup="menu"][data-action]');
    if (
      trigger &&
      ["board-actions", "move-note-menu", "note-actions"].includes(
        trigger.dataset.action,
      ) &&
      ["ArrowDown", "ArrowUp"].includes(event.key)
    ) {
      event.preventDefault();
      if (!notesState.menu || notesState.menu.origin.trigger !== trigger)
        trigger.click();
      if (event.key === "ArrowUp")
        notesState.menu?.element.querySelector("button:last-child")?.focus();
      return;
    }
    if (
      event.key === "ContextMenu" ||
      (event.shiftKey && event.key === "F10")
    ) {
      const card = event.target.closest(".product-card[data-product]");
      const board = event.target.closest(".notes-board");
      if (!card && !board) return;
      event.preventDefault();
      if (card) {
        const bounds = card.getBoundingClientRect();
        openResourceMenu(card, bounds.left + 16, bounds.top + 16);
      } else {
        const column = event.target.closest(".board-column");
        openBoardMenu(event.target, column?.dataset.column);
      }
    }
  },
  true,
);
document.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".note-card");
  if (!card) return;
  // Native controls and reference links keep their own pointer behavior.
  if (event.target.closest("a, button:not(.note-drag-handle)")) {
    event.preventDefault();
    return;
  }
  closeNotesMenu();
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
  if (note && Object.hasOwn(noteColumns, column.dataset.column)) {
    event.preventDefault();
    note.column = column.dataset.column;
    drawNotes();
    restoreNotesFocus({ noteId: id, action: "move-note-menu" });
  }
});
document.addEventListener("dragend", () =>
  view
    .querySelectorAll(".is-dragging")
    .forEach((card) => card.classList.remove("is-dragging")),
);
// A menu anchored to old coordinates must not survive scrolling or resizing.
window.addEventListener(
  "scroll",
  (event) => {
    const menu = notesState.menu;
    if (!menu || menu.element.contains(event.target)) return;
    // Opening a menu can follow a scroll whose event is still queued. Dismiss
    // only when its recorded anchor position has actually changed since open.
    if (
      menu.x !== scrollX ||
      menu.y !== scrollY ||
      menu.scrollParents.some(
        ({ element, x, y }) =>
          element.scrollLeft !== x || element.scrollTop !== y,
      )
    )
      closeNotesMenu();
  },
  { passive: true, capture: true },
);
window.addEventListener("resize", () => {
  const menu = notesState.menu;
  // A resize event may still be queued when a fresh menu opens, just as a
  // scroll event can be. Dismiss only if its viewport has changed since open.
  if (menu && (menu.width !== innerWidth || menu.height !== innerHeight))
    closeNotesMenu();
});
window.previewNotes = { mount: drawNotes, closeTransient: closeNotesTransient };
