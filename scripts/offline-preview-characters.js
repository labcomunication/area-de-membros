/* Original vector characters for the wireframe; no assets or services loaded. */
const characterStyles = [
  { id: "pistache", name: "Adam", color: "#171717", shape: "orb" },
  { id: "pescego", name: "Cherry", color: "#f97508", shape: "flower" },
  { id: "lavanda", name: "Maria", color: "#838383", shape: "drop" },
  { id: "brisa", name: "Theo", color: "#2585ed", shape: "triangle" },
  { id: "amora", name: "Luna", color: "#00b974", shape: "oval" },
  { id: "coral", name: "Cora", color: "#91653b", shape: "clover" },
  { id: "iris", name: "Nina", color: "#855c99", shape: "flower" },
  { id: "kiwi", name: "Bento", color: "#7d8b49", shape: "drop" },
  { id: "laguna", name: "Noa", color: "#467c95", shape: "oval" },
  { id: "menta", name: "Maya", color: "#3a987f", shape: "clover" },
  { id: "sol", name: "Sol", color: "#c58a28", shape: "orb" },
  { id: "aurora", name: "Aurora", color: "#a16477", shape: "triangle" },
  { id: "mel", name: "Mel", color: "#a57343", shape: "drop" },
  { id: "rosa", name: "Rosa", color: "#ba6389", shape: "flower" },
  { id: "orquidea", name: "Flora", color: "#6c6594", shape: "clover" },
];
const characterShapes = {
  orb: "M50 5a45 45 0 1 1 0 90a45 45 0 0 1 0-90Z",
  drop: "M50 5C61-1 69 20 82 36C108 73 83 96 50 96C19 96 0 73 10 45C17 28 35 11 50 5Z",
  triangle: "M39 14Q50-4 61 14L94 75Q105 94 83 94H17Q-5 94 6 75Z",
  flower:
    "M50 12C66 0 86 11 83 29C102 32 104 52 89 64C99 81 81 99 64 89C52 104 30 98 28 81C10 88 0 66 13 52C0 35 18 16 34 22C37 16 43 13 50 12Z",
  oval: "M36 16H64C106 16 106 84 64 84H36C-6 84-6 16 36 16Z",
  clover:
    "M50 5C70 0 84 12 80 30C100 35 102 56 87 67C92 85 75 100 57 90C42 104 22 94 23 77C3 74 0 54 15 41C7 22 28 9 42 17Z",
};
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
  return `<span class="character" data-character="${character.id}" data-shape="${character.shape}" data-mood="${mood}" data-palette="${palette.id}" aria-hidden="true" style="--character-fill:${palette.color}"><svg viewBox="0 0 100 100" fill="none"><path class="character-body" d="${characterShapes[character.shape]}"/><g class="character-gaze"><g class="character-eyes"><ellipse cx="41" cy="44" rx="4.4" ry="8.6" transform="rotate(-15 41 44)"/><ellipse cx="59" cy="42" rx="4.4" ry="9" transform="rotate(-15 59 42)"/></g><path class="character-brows" d="m33 28 13 5m7-3 12-4"/></g><path class="character-mouth-neutral" d="M44 63q6 4 12 0"/><path class="character-mouth-happy" d="M41 61q9 17 18 0Z"/><path class="character-tongue" d="M47 69q4-5 8 0"/><path class="character-mouth-angry" d="M43 65q7-7 14 0"/></svg></span>`;
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
  playCharacter,
  closeAvatarPicker,
  restoreNavigationGroups,
  disposeVolume,
  volumeSnapshot,
};
