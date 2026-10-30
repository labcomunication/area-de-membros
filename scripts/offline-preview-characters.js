/* Original vector characters for the wireframe; no assets or services loaded. */
const characterStyles = [
  {
    id: "pistache",
    name: "Pistache",
    colors: ["#ffe6b2", "#b4dcb2", "#ef8c76"],
    hair: 0,
  },
  {
    id: "pescego",
    name: "Pêssego",
    colors: ["#fff0e9", "#ffc8be", "#ed9182"],
    hair: 1,
  },
  {
    id: "lavanda",
    name: "Lavanda",
    colors: ["#d4e8ff", "#b4a0ed", "#83d6c3"],
    hair: 2,
  },
  {
    id: "brisa",
    name: "Brisa",
    colors: ["#e7fcff", "#8fdaed", "#72b5ec"],
    hair: 3,
  },
  {
    id: "amora",
    name: "Amora",
    colors: ["#e2deff", "#b2a3ef", "#7bd6e0"],
    hair: 4,
  },
  {
    id: "coral",
    name: "Coral",
    colors: ["#f5dde5", "#ed8f79", "#a1c3e0"],
    hair: 2,
  },
  {
    id: "iris",
    name: "Íris",
    colors: ["#dce9ff", "#9f9bea", "#86d3e0"],
    hair: 4,
  },
  {
    id: "kiwi",
    name: "Kiwi",
    colors: ["#e1edb9", "#a9d79d", "#71ceb5"],
    hair: 0,
  },
  {
    id: "laguna",
    name: "Laguna",
    colors: ["#d1effd", "#9acadd", "#64c8d0"],
    hair: 3,
  },
  {
    id: "menta",
    name: "Menta",
    colors: ["#d6f7ee", "#88d5cb", "#69c4a7"],
    hair: 1,
  },
  {
    id: "sol",
    name: "Sol",
    colors: ["#fff5c7", "#f4ce70", "#c5e2c7"],
    hair: 2,
  },
  {
    id: "aurora",
    name: "Aurora",
    colors: ["#f9edb5", "#e9d685", "#bda8e5"],
    hair: 1,
  },
  {
    id: "mel",
    name: "Mel",
    colors: ["#fff4ce", "#f4cc82", "#f2af88"],
    hair: 0,
  },
  {
    id: "rosa",
    name: "Rosa",
    colors: ["#ffe3ef", "#f6b5db", "#de8ecb"],
    hair: 3,
  },
  {
    id: "orquidea",
    name: "Orquídea",
    colors: ["#f6d8fa", "#dfa9ef", "#c693df"],
    hair: 4,
  },
];
const hairPaths = [
  "M18 9c3 11 10 11 13 0 0 13 12 15 16 0",
  "M29 3c9 13 20 18 31 6M37 5c8 6 17 8 25 3",
  "M36 0c5 10 12 17 22 20L51 4c6 10 12 16 18 17",
  "M16 15c7 3 14-1 17-10 0 12 9 16 14 4",
  "M31 6c-2 14 12 14 13 1 0 16 13 16 14 1 0 12 10 11 11 0",
];
const characterState = {
  step: 0,
  mood: "curious",
  clicks: [],
  resetTimer: null,
};
const navigationState = {};
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let gazeFrame = null;
let gazePoint = null;

function characterMarkup(id, paletteId = id, mood = "curious") {
  const character =
    characterStyles.find((style) => style.id === id) || characterStyles[0];
  const palette =
    characterStyles.find((style) => style.id === paletteId) || character;
  return `<span class="character" data-character="${character.id}" data-mood="${mood}" data-palette="${palette.id}" aria-hidden="true" style="--character-a:${palette.colors[0]};--character-b:${palette.colors[1]};--character-c:${palette.colors[2]}"><svg viewBox="0 0 100 100" fill="none"><path class="character-hair" d="${hairPaths[character.hair]}"/><g class="character-gaze"><g class="character-eyes"><ellipse cx="42" cy="48" rx="2.9" ry="5.8" transform="rotate(-20 42 48)"/><ellipse cx="55" cy="45.5" rx="2.9" ry="6.4" transform="rotate(-20 55 45.5)"/></g><path class="character-brows" d="m36 36 10 4m5-3 9-4"/></g><path class="character-mouth-neutral" d="M44 60q5 6 11 0"/><path class="character-mouth-happy" d="M42 58q7 16 15 0Z"/><path class="character-tongue" d="M47 65q4-5 7 0"/><path class="character-mouth-angry" d="M43 64q6-7 13 0"/></svg></span>`;
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
  const index = characterStyles.findIndex(
    (style) => style.id === appearance.avatar,
  );
  const palette =
    characterStyles[(index + characterState.step) % characterStyles.length];
  host.innerHTML = characterMarkup(
    appearance.avatar,
    palette.id,
    characterState.mood,
  );
  const labels = {
    curious: "Curioso",
    happy: "Feliz",
    angry: "Bravo de brincadeira",
  };
  view.querySelector("[data-character-state]").textContent =
    labels[characterState.mood];
  const messages = {
    curious: "Uma companhia para suas ideias.",
    happy: "Gostei! Uma nova cor para suas ideias.",
    angry: "Ei, devagar! Uma pausa e já volto ao normal.",
  };
  view.querySelector("[data-character-status]").textContent =
    messages[characterState.mood];
}

function playCharacter() {
  const now = performance.now();
  characterState.clicks = characterState.clicks.filter(
    (time) => now - time < 1200,
  );
  characterState.clicks.push(now);
  characterState.step = (characterState.step + 1) % characterStyles.length;
  characterState.mood = characterState.clicks.length >= 4 ? "angry" : "happy";
  clearTimeout(characterState.resetTimer);
  paintCharacterStage();
  characterState.resetTimer = setTimeout(() => {
    characterState.mood = "curious";
    characterState.clicks = [];
    paintCharacterStage();
  }, 1800);
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

function resetCharacterEyes() {
  gazePoint = null;
  if (gazeFrame !== null) cancelAnimationFrame(gazeFrame);
  gazeFrame = null;
  view.querySelectorAll(".character").forEach((character) => {
    character.style.removeProperty("--look-x");
    character.style.removeProperty("--look-y");
  });
}
document.addEventListener(
  "pointermove",
  (event) => {
    if (motionPreference.matches || event.pointerType === "touch") return;
    gazePoint = { x: event.clientX, y: event.clientY };
    if (gazeFrame !== null) return;
    gazeFrame = requestAnimationFrame(() => {
      gazeFrame = null;
      if (!gazePoint) return;
      view.querySelectorAll(".character").forEach((character) => {
        const bounds = character.getBoundingClientRect();
        if (!bounds.width || bounds.bottom < 0 || bounds.top > innerHeight)
          return;
        const divisor = Math.max(160, bounds.width * 1.2);
        const x = Math.max(
          -1,
          Math.min(1, (gazePoint.x - bounds.x - bounds.width / 2) / divisor),
        );
        const y = Math.max(
          -1,
          Math.min(1, (gazePoint.y - bounds.y - bounds.height / 2) / divisor),
        );
        character.style.setProperty("--look-x", (x * 3).toFixed(2) + "px");
        character.style.setProperty("--look-y", (y * 2.2).toFixed(2) + "px");
      });
    });
  },
  { passive: true },
);
document.addEventListener("pointerout", (event) => {
  if (!event.relatedTarget) resetCharacterEyes();
});
window.addEventListener("blur", resetCharacterEyes);
motionPreference.addEventListener("change", resetCharacterEyes);
window.previewCharacters = {
  paintProfileAvatars,
  playCharacter,
  closeAvatarPicker,
  restoreNavigationGroups,
};
