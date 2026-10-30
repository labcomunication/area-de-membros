import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { screens } from "../src/config/members";
import { refineOfflinePreview } from "./refine-offline-preview";
import { enhanceOfflinePreview } from "./enhance-offline-preview";
import { decoratePreviewCharacters } from "./decorate-preview-characters";
const base = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";
function keyOf(url: string) {
  const parsed = new URL(url, "https://offline.invalid");
  const clean = new URLSearchParams();
  for (const key of [
    "screen",
    "state",
    "product",
    "module",
    "post",
    "category",
  ]) {
    const value = parsed.searchParams.get(key);
    if (value && !(key === "state" && value === "normal"))
      clean.set(key, value);
  }
  if (!clean.has("screen")) clean.set("screen", "home");
  clean.sort();
  return clean.toString();
}
const queue = screens.map(([screen]) => keyOf("/wireframes?screen=" + screen));
for (const state of ["empty", "loading", "error", "pending", "expired"])
  queue.push(keyOf("/wireframes?screen=products&state=" + state));
const snapshots: Record<string, string> = {};
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  for (let cursor = 0; cursor < queue.length; cursor++) {
    if (cursor >= 80)
      throw Error("Offline export exceeded expected screen count.");
    const key = queue[cursor];
    if (snapshots[key]) continue;
    const response = await page.goto(base + "/wireframes?" + key, {
      waitUntil: "domcontentloaded",
    });
    if (response?.status() !== 200)
      throw Error("Run npm run dev before exporting the offline preview.");
    await page.locator("h1").first().waitFor({ state: "visible" });
    const captured = await page.evaluate(() => {
      const root =
        document.querySelector(".app-shell") ??
        document.querySelector(".gallery-access");
      if (!root) throw Error("Wireframe content missing");
      const copy = root.cloneNode(true) as HTMLElement;
      copy
        .querySelectorAll("script,style,link,nextjs-portal")
        .forEach((el) => el.remove());
      copy.querySelectorAll("button,input,textarea").forEach((el) => {
        if (el.getAttribute("aria-label") === "Mais opções") return;
        (el as HTMLButtonElement).disabled = true;
        el.setAttribute(
          "title",
          "Prévia offline: formulários, filtros e integrações estão inativos.",
        );
      });
      const links = [
        ...copy.querySelectorAll<HTMLAnchorElement>('a[href^="/wireframes"]'),
      ].map((a) => a.getAttribute("href")!);
      return { content: copy.outerHTML, links };
    });
    for (const url of captured.links) {
      const target = keyOf(url);
      if (!snapshots[target] && !queue.includes(target)) queue.push(target);
    }
    const refined = await page.evaluate(refineOfflinePreview, captured.content);
    snapshots[key] = await page.evaluate(enhanceOfflinePreview, {
      html: refined,
      key,
    });
  }
  snapshots["screen=ai"] = await page.evaluate(enhanceOfflinePreview, {
    html: snapshots["screen=home"],
    key: "screen=ai",
  });
  for (const [key, html] of Object.entries(snapshots)) {
    snapshots[key] = await page.evaluate(decoratePreviewCharacters, html);
  }
} finally {
  await browser.close();
}
await mkdir("docs/preview", { recursive: true });
const css =
  (await readFile("src/app/globals.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/shell.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/characters.css", "utf8"));
const data = JSON.stringify(snapshots).replace(/</g, "\\u003c");
const options =
  screens
    .map(
      ([screen, label]) => `<option value="screen=${screen}">${label}</option>`,
    )
    .join("") +
  '<option value="screen=ai">Estúdio IA · Em breve</option>' +
  ["empty", "loading", "error", "pending", "expired"]
    .map(
      (state) =>
        `<option value="screen=products&state=${state}">Produtos · ${state}</option>`,
    )
    .join("");
const runtime =
  (await readFile("scripts/offline-preview-characters.js", "utf8")) +
  "\n" +
  (await readFile("scripts/offline-preview-runtime.js", "utf8"));
const html = `<!doctype html><html lang="pt-BR" data-scroll-behavior="smooth"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wireframe navegável — prévia offline</title><style>${css}</style></head><body><div id="offline-toolbar" class="gallery-toolbar"><strong>Wireframe navegável<span>Prévia offline · dados fictícios · perfil Essencial</span></strong><span class="offline-caption">Navegação e rolagem disponíveis. Formulários, filtros e integrações inativos.</span><label>Tela<select id="screen-select">${options}</select></label></div><div id="offline-view"></div><script type="application/json" id="snapshots">${data}</script><script>${runtime}</script></body></html>`;
await writeFile("docs/preview/wireframe.html", html);
await writeFile(
  "docs/preview/README.md",
  `# Prévia navegável sem instalação\n\nBaixe **wireframe.zip**, extraia e abra **wireframe.html** no Chrome ou Edge. Não requer Node, servidor ou conexão depois do download.\n\nContém ${Object.keys(snapshots).length} telas/variantes a partir das fixtures e uma tela futura de Estúdio IA. A barra superior permite escolher telas e estados. Home em três zonas, cards brancos sobre gradiente e menu claro com grupos recolhíveis Aprender, Explorar e Pessoal, ícones coerentes e item ativo em cápsula branca. Navegação mobile: Início · Meus Produtos · Mais.\n\nNesta revisão: imagens editoriais contidas, hover somente na imagem, badges arredondados, preços explicitamente fictícios, capa bloqueada com cadeado, banner de catálogo/ofertas e Minha conta com mapa de atividade e conquistas ilustrativos. Em Personalização → Editar, experimente claro/escuro, detalhes oliva/vinho/bege e coroa de exemplo. Preferências apenas em memória; recarregar restaura os padrões. Estúdio IA tem um personagem vetorial interativo no lugar da esfera. Em Minha conta → Escolher personagem, escolha entre 15 opções para o perfil e a IA. Olhos ovais alongados e inclinados seguem o cursor; clique/toque muda a cor e mostra um sorriso; quatro cliques rápidos mostram uma expressão brava por 1,8 segundo. Movimento reduzido mantém os olhos centralizados. A geração de PDFs continua futura.\n\nÉ uma demonstração visual do perfil Essencial: formulários, filtros, login, compras, geração de PDFs e downloads de materiais estão inativos. Mapa/conquistas não representam acessos, vendas ou conclusões reais. Sem coleta, API, cookies ou persistência. Não substitui a aplicação React, que permanece intacta.\n\nFontes: scripts/refine-offline-preview.ts, scripts/enhance-offline-preview.ts, scripts/offline-preview-runtime.js, scripts/decorate-preview-characters.ts, scripts/offline-preview-characters.js, docs/preview/shell.css e docs/preview/characters.css, embutidos no HTML. Para regenerar: npm run dev e npm run preview:offline. Capturas: npm run screenshots -- --offline-review (ou --offline-home para somente Home). Verificar: npx tsx scripts/verify-offline-preview.ts e npx tsx scripts/verify-preview-characters.ts. Veja iteration-characters.md e acceptance.md. Design system aguardando aprovação do wireframe; docs/design/ permanece intacto.\n\nNenhum publish, push, PR, merge ou deploy faz parte desta revisão.\n`,
);
console.log(
  `Offline HTML exported: ${Object.keys(snapshots).length} screen variants; ${Buffer.byteLength(html)} bytes.`,
);
