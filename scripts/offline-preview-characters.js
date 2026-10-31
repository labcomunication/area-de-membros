/* Procedural vector family for the offline prototype; no remote assets. */
const characterStyles = [
  { id: "pistache", name: "Adam", color: "#171717", shape: "rounded-screen" },
  { id: "pescego", name: "Cherry", color: "#f97508", shape: "rounded-screen" },
  { id: "lavanda", name: "Maria", color: "#838383", shape: "rounded-screen" },
  { id: "brisa", name: "Theo", color: "#2585ed", shape: "rounded-screen" },
  { id: "amora", name: "Luna", color: "#00b974", shape: "rounded-screen" },
  { id: "coral", name: "Cora", color: "#91653b", shape: "rounded-screen" },
  { id: "iris", name: "Nina", color: "#855c99", shape: "rounded-screen" },
  { id: "kiwi", name: "Bento", color: "#7d8b49", shape: "rounded-screen" },
  { id: "laguna", name: "Noa", color: "#467c95", shape: "rounded-screen" },
  { id: "menta", name: "Maya", color: "#3a987f", shape: "rounded-screen" },
  { id: "sol", name: "Sol", color: "#c58a28", shape: "rounded-screen" },
  { id: "aurora", name: "Aurora", color: "#a16477", shape: "rounded-screen" },
  { id: "mel", name: "Mel", color: "#a57343", shape: "rounded-screen" },
  { id: "rosa", name: "Rosa", color: "#ba6389", shape: "rounded-screen" },
  { id: "orquidea", name: "Flora", color: "#6c6594", shape: "rounded-screen" },
];
const characterShapes = {
  "rounded-screen":
    "M50 5C73 5 87 23 93 47C99 72 96 88 77 93C63 98 37 98 23 93C4 88 1 72 7 47C13 23 27 5 50 5Z",
};
const characterScreen =
  "M50 17C69 17 79 28 82 46C87 66 82 79 70 83C58 87 42 87 30 83C18 79 13 66 18 46C21 28 31 17 50 17Z";
const characterEye = "M-6 6.8A9 9 0 1 1 6 6.8Q0 6.1-6 6.8Z";
function characterFaceColor(color) {
  if (color === "#171717") return "#383838";
  return (
    "#" +
    color
      .slice(1)
      .match(/../g)
      .map((value) =>
        Math.round(parseInt(value, 16) * 0.47)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
const characterState = {
  step: 0,
  mood: "idle",
  clicks: [],
  resetTimer: null,
  suppressClickUntil: 0,
};
const navigationState = {};
let activeVolume = null,
  volumeHost = null,
  volumeAppearance = "";

function characterMarkup(id, paletteId = id, mood = "idle") {
  const character =
    characterStyles.find((style) => style.id === id) || characterStyles[0];
  const palette =
    characterStyles.find((style) => style.id === paletteId) || character;
  const safeMood = ["idle", "happy", "nervous"].includes(mood) ? mood : "idle";
  return `<span class="character" data-character="${character.id}" data-family="rounded-screen" data-shape="${character.shape}" data-mood="${safeMood}" data-palette="${palette.id}" aria-hidden="true" style="--character-fill:${palette.color};--character-screen:${characterFaceColor(palette.color)}"><svg viewBox="0 0 100 100" fill="none"><path class="character-body" d="${characterShapes[character.shape]}"/><path class="character-screen" d="${characterScreen}"/><g class="character-gaze"><g class="character-eyes"><path d="${characterEye}" transform="translate(36 49)"/><path d="${characterEye}" transform="translate(64 49)"/></g><g class="character-happy-eyes"><path d="M28 49Q36 40 44 49M56 49Q64 40 72 49"/></g><path class="character-brows" d="M27 35Q36 31 44 35M56 35Q64 31 73 35"/></g></svg></span>`;
}

function paintProfileAvatars() {
  view.querySelectorAll(".avatar").forEach((avatar) => {
    avatar.innerHTML = characterMarkup(appearance.avatar);
    if (
      avatar.tagName === "SPAN" &&
      avatar.getAttribute("aria-hidden") !== "true"
    ) {
      avatar.setAttribute("role", "img");
      const selected = characterStyles.find(
        (style) => style.id === appearance.avatar,
      );
      avatar.setAttribute(
        "aria-label",
        "Personagem do perfil: " + selected.name,
      );
    }
  });
  const grid = view.querySelector(".avatar-choice-grid");
  if (grid && !grid.children.length) {
    for (const style of characterStyles) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "avatar-choice";
      button.dataset.avatarChoice = style.id;
      button.innerHTML =
        characterMarkup(style.id) +
        `<span>${style.name}</span><span class="avatar-selected-mark" aria-hidden="true">✓</span>`;
      grid.append(button);
    }
  }
  view.querySelectorAll("[data-avatar-choice]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.avatarChoice === appearance.avatar),
    );
  });
  paintCharacterStage();
}

function paintCharacterStage() {
  const host = view.querySelector("[data-character-stage]");
  if (!host) return;
  const character =
    characterStyles.find((style) => style.id === appearance.avatar) ||
    characterStyles[0];
  let face = host.querySelector(".character");
  if (!face || face.dataset.character !== character.id) {
    const canvas = host.querySelector("canvas");
    host.innerHTML = characterMarkup(character.id, character.id, "idle");
    if (canvas) host.append(canvas);
    face = host.querySelector(".character");
  }
  view.querySelector("[data-character-state]").textContent = character.name;
  if (volumeHost !== host) {
    disposeVolume();
    volumeHost = host;
    activeVolume = window.createMascotVolume({
      host,
      button: host.closest(".character-play"),
      path: characterShapes[character.shape],
      kind: character.shape,
      color: character.color,
      screenPath: characterScreen,
      eyePath: characterEye,
      faceColor: characterFaceColor(character.color),
      onState(state) {
        characterState.mood = state;
        const fallback = host.querySelector(".character");
        if (fallback) fallback.dataset.mood = state;
        const states = {
          idle: "pronto",
          happy: "sorrindo",
          nervous: "agitado por um instante",
        };
        view
          .querySelector("[data-character-status]")
          ?.replaceChildren(
            document.createTextNode(
              character.name + ": " + states[state] + ".",
            ),
          );
      },
    });
    volumeAppearance = character.id;
    if (!activeVolume)
      view.querySelector("[data-character-status]").textContent =
        "Animação 3D indisponível neste navegador. Personagem estático preservado.";
  } else if (activeVolume && volumeAppearance !== character.id) {
    activeVolume.setAppearance(
      characterShapes[character.shape],
      character.shape,
      character.color,
      characterFaceColor(character.color),
    );
    volumeAppearance = character.id;
  }
}
function playCharacter(event) {
  activeVolume?.click(event);
}
function disposeVolume() {
  activeVolume?.dispose();
  activeVolume = null;
  volumeHost = null;
  volumeAppearance = "";
}
function volumeSnapshot() {
  return (
    activeVolume?.snapshot() || {
      renderer: "unmounted",
      state: "idle",
      scale: 1,
      squint: 1,
      depth: 0,
      gaze: [0, 0, 0],
      eyeQuaternion: [0, 0, 0, 1],
      bodyAngle: [0, 0, 0],
      renderedFrames: 0,
      motionActive: false,
      position: [0, 0, 0],
    }
  );
}

function closeAvatarPicker() {
  const picker = document.getElementById("avatar-picker-panel");
  if (!picker || picker.hidden) return;
  picker.hidden = true;
  const trigger = view.querySelector('[data-action="avatar-picker"]');
  trigger?.setAttribute("aria-expanded", "false");
  trigger?.focus();
}

function restoreNavigationGroups() {
  view.querySelectorAll(".sidebar details[data-nav-group]").forEach((group) => {
    const active = Boolean(group.querySelector("[aria-current]"));
    group.open = active || navigationState[group.dataset.navGroup] !== false;
  });
}
document.addEventListener(
  "toggle",
  (event) => {
    const group = event.target;
    if (
      group.matches?.(".sidebar details[data-nav-group]") &&
      view.contains(group)
    )
      navigationState[group.dataset.navGroup] = group.open;
  },
  true,
);

window.previewCharacters = {
  paintProfileAvatars,
  getAvatarMarkup(id = appearance.avatar) {
    return characterMarkup(id);
  },
  playCharacter,
  closeAvatarPicker,
  restoreNavigationGroups,
  disposeVolume,
  volumeSnapshot,
};
