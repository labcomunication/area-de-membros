import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { screens } from "../src/config/members";
import { refineOfflinePreview } from "./refine-offline-preview";
import { enhanceOfflinePreview } from "./enhance-offline-preview";
import { decoratePreviewCharacters } from "./decorate-preview-characters";
import { refinePreviewWorkspace } from "./refine-preview-workspace";
import { build } from "esbuild";
import { refinePreviewStudio } from "./refine-preview-studio";
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
  snapshots["screen=notes"] = snapshots["screen=home"];
  for (const [key, html] of Object.entries(snapshots)) {
    snapshots[key] = await page.evaluate(refinePreviewWorkspace, { html, key });
    snapshots[key] = await page.evaluate(refinePreviewStudio, {
      html: snapshots[key],
      key,
    });
  }
} finally {
  await browser.close();
}
await mkdir("docs/preview", { recursive: true });
const fontData = (
  await readFile("docs/preview/assets/noto-sans-latin.woff2")
).toString("base64");
const fontLicense = await readFile(
  "docs/preview/assets/OFL-Noto-Sans.txt",
  "utf8",
);
const fontCss =
  '@font-face{font-family:"Noto Sans";font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,' +
  fontData +
  ') format("woff2");}';
const css =
  fontCss +
  "\n" +
  (await readFile("src/app/globals.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/shell.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/characters.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/workspace.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/motion.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/live-motion.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/review.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/notes-review.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/mascot-review.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/ailo-characters.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/flow.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/notes-composer.css", "utf8")) +
  "\n" +
  (await readFile("docs/preview/studio-refinement.css", "utf8"));
const data = JSON.stringify(snapshots).replace(/</g, "\\u003c");
const options =
  screens
    .map(
      ([screen, label]) => `<option value="screen=${screen}">${label}</option>`,
    )
    .join("") +
  '<option value="screen=ai">Estúdio IA · Em breve</option>' +
  '<option value="screen=notes">Minhas anotações</option>' +
  ["empty", "loading", "error", "pending", "expired"]
    .map(
      (state) =>
        `<option value="screen=products&state=${state}">Produtos · ${state}</option>`,
    )
    .join("");
const bundledVolume = await build({
  entryPoints: ["scripts/mascot-volume.js"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "inline",
});
const threeLicense = await readFile("node_modules/three/LICENSE", "utf8");
await writeFile("docs/preview/THREE-LICENSE.txt", threeLicense);
const volumeCode = (
  "/* Three.js license:\n" +
  threeLicense +
  "\n*/\n" +
  // Shader template indentation is insignificant; normalize it in the artifact.
  bundledVolume.outputFiles[0].text.replace(/^[ \t]+|[ \t]+$/gm, "")
).replace(/<\/script/gi, "<\\/script");
const runtime =
  volumeCode +
  "\n" +
  (await readFile("scripts/offline-preview-characters.js", "utf8")) +
  "\n" +
  (await readFile("scripts/offline-preview-notes.js", "utf8")) +
  "\n" +
  (await readFile("scripts/offline-preview-workspace.js", "utf8")) +
  "\n" +
  (await readFile("scripts/offline-preview-nav.js", "utf8")) +
  "\n" +
  (await readFile("scripts/offline-preview-flow.js", "utf8")) +
  "\n" +
  (await readFile("scripts/offline-preview-runtime.js", "utf8"));
const html = `<!doctype html><html lang="pt-BR" data-scroll-behavior="smooth"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wireframe navegável — prévia offline</title><!-- Noto Sans license: ${fontLicense.replace(/[ \t]+$/gm, "").replace(/--/g, "—")} --><style>${css}</style></head><body><div id="offline-toolbar" class="gallery-toolbar"><strong>Wireframe navegável<span>Prévia offline · dados fictícios · perfil Essencial</span></strong><span class="offline-caption">Prévia local · acesso, compras e IA sem integração.</span><label>Tela<select id="screen-select">${options}</select></label></div><div id="offline-view"></div><script type="application/json" id="snapshots">${data}</script><script>${runtime}</script></body></html>`;
await writeFile("docs/preview/wireframe.html", html);
await writeFile(
  "docs/preview/README.md",
  `# Prévia navegável sem instalação

Baixe **wireframe.zip**, extraia e abra **wireframe.html** no Chrome ou Edge. Não requer Node, servidor ou conexão depois do download. WebGL permite a interação 3D; navegadores sem WebGL preservam o personagem estático.

Contém ${Object.keys(snapshots).length} telas/variantes de demonstração. Use o seletor superior ou os menus para navegar. A aplicação React mantém sua versão anterior: esta revisão é exclusiva da prévia HTML.

## Experimente

- **Estúdio IA:** personagem centralizado, fundo pontilhado cinza com destaque/rastro suave perto do ponteiro e apoio fora do box. Quinze opções de nome/cor compartilham a nova silhueta arredondada com face separada, inspirada na referência Ailo, sem marcas comerciais. Corpo e face foscos, com olhos claros que acompanham a curvatura de uma esfera virtual com amortecimento. Hover/foco expande com mola sem deslocar o layout; um clique fecha os olhos por 300ms; três cliques em 500ms ativam nervosismo por 1s. Arraste levemente e solte para retornar. Não há troca de cor no clique. Movimento reduzido mantém pose estática e permite expressão discreta.
- **Mapa de ideias:** abaixo do personagem e antes do título, crie, escreva, mova e conecte ideias e imagens locais ao nó da IA e à saída de PDF. Arraste pelos títulos ou use as setas; conecte pelas bolinhas ou pelo painel Conexões. Aceita PNG/JPEG/WebP de até 5 MB, sem upload. O quadro sobrevive à navegação, mas é descartado ao recarregar. Gerar PDF continua desativado.
- **Visual:** Noto Sans em toda a interface, incorporada ao HTML sob OFL. Superfícies claras sem contornos decorativos, separadas por tons de cinza; cantos contínuos quando suportados pelo navegador, com arredondamento convencional como alternativa.
- **Menu:** todos os nomes permanecem visíveis no menu lateral, um pouco mais largo e sem barras de rolagem visíveis. Em janelas muito baixas, a sidebar inteira pode rolar para manter itens e perfil acessíveis. Na navegação compacta, somente o nome ativo entra e sai com mola; ícones permanecem visíveis. A barra fixa ganha efeito fosco ao rolar. Em Minha conta → Personalização → Editar, escolha Ícones no topo. O menu superior fica centralizado no desktop e fixo ao rolar; no mobile substitui a barra inferior por uma faixa rolável. O controle de restauração traz o menu padrão de volta. Movimento reduzido troca os nomes imediatamente.
- **Minhas anotações:** criar e editar em janela branca flutuante, com campos cinza e ações simples; excluir/desfazer e mover texto entre três colunas. Arraste pelo puxador no desktop ou use menus próprios por teclado/toque. Editar/excluir ficam no menu do canto. O botão Adicionar ao quadro e o botão direito oferecem notas escritas e referências de e-books da biblioteca demonstrativa; não fazem upload nem entregam arquivos. Referências bloqueadas continuam bloqueadas.
- **Recomendações e ofertas:** em Você também pode gostar, a capa ocupa o fundo do card e o painel branco aparece sobreposto na parte inferior. As capas continuam sendo placeholders até o recebimento das imagens reais. A página Ofertas mantém capas retrato 3:4 à esquerda, rodapés alinhados, descrição expansível e carrossel manual. Os dois conceitos adicionais não são ofertas cadastradas. Todos os preços são fictícios e os botões de compra permanecem inativos.
- **Minha conta:** claro/escuro, detalhes oliva/vinho/bege, quinze personagens, atividade e conquistas ilustrativas. Editar muda para Fechar e recebe o acento enquanto o painel está aberto. Escolha entre coroa, medalha e estrela para pré-visualizar no avatar. Tudo permanece apenas na memória; recarregar restaura os padrões.

Login, compras, downloads, filtros de conteúdo, geração de PDFs e conexão de IA continuam inativos. O formulário de anotações funciona apenas nesta demonstração local. Sem coleta, requisições externas, API keys, cookies ou persistência. Não altera acesso ou entitlement.

## Regeneração e verificação

Com o servidor local iniciado por npm run dev, execute npm run preview:offline. O exportador incorpora Noto Sans e sua licença OFL, Three.js e a licença MIT no HTML, sem CDN; a licença também está em THREE-LICENSE.txt. Three e esbuild são dependências de desenvolvimento usadas somente nesta exportação.

Verificações: npx tsx scripts/verify-offline-preview.ts; npx tsx scripts/verify-preview-characters.ts; npx tsx scripts/verify-preview-workspace.ts; npx tsx scripts/verify-review-regressions.ts; npx tsx scripts/verify-mascot-volume.ts; npx tsx scripts/verify-nav-labels.ts; npx tsx scripts/verify-preview-review.ts; npx tsx scripts/verify-notes-review.ts. Capturas: npm run screenshots -- --offline-review. Também execute verify-ailo-characters.ts, verify-preview-flow.ts, verify-flow-regressions.ts, verify-notes-composer.ts e verify-studio-refinement.ts com npx tsx scripts/<arquivo>. Veja acceptance.md e ../../design-qa.md.

Design system aguardando aprovação do wireframe; docs/design/ permanece intacto. Envio normal à branch de trabalho autorizado pelo usuário após os testes. Nenhum PR, merge, publicação de site ou deploy faz parte desta revisão.
`,
);
console.log(
  `Offline HTML exported: ${Object.keys(snapshots).length} screen variants; ${Buffer.byteLength(html)} bytes.`,
);
