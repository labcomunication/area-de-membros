import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { screens } from "../src/config/members";
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
    snapshots[key] = captured.content;
  }
} finally {
  await browser.close();
}
await mkdir("docs/preview", { recursive: true });
const css = await readFile("src/app/globals.css", "utf8");
const data = JSON.stringify(snapshots).replace(/</g, "\\u003c");
const options =
  screens
    .map(
      ([screen, label]) => `<option value="screen=${screen}">${label}</option>`,
    )
    .join("") +
  ["empty", "loading", "error", "pending", "expired"]
    .map(
      (state) =>
        `<option value="screen=products&state=${state}">Produtos · ${state}</option>`,
    )
    .join("");
const runtime = String.raw`
const snapshots=JSON.parse(document.getElementById('snapshots').textContent);
const view=document.getElementById('offline-view');
function keyOf(url){const parsed=new URL(url,'https://offline.invalid');const q=new URLSearchParams();for(const k of ['screen','state','product','module','post','category']){const v=parsed.searchParams.get(k);if(v&&!(k==='state'&&v==='normal'))q.set(k,v);}if(!q.has('screen'))q.set('screen','home');q.sort();return q.toString();}
function closeMenu(){document.getElementById('more-navigation')?.remove();const trigger=view.querySelector('button[aria-label="Mais opções"]');trigger?.setAttribute('aria-expanded','false');trigger?.focus();}
function render(){const key=keyOf('/wireframes?'+location.hash.slice(1));view.innerHTML=snapshots[key]||snapshots['screen=home'];document.querySelectorAll('#offline-view a[href^="/wireframes"]').forEach(a=>a.setAttribute('href','#'+keyOf(a.getAttribute('href'))));const select=document.getElementById('screen-select');select.value=[...select.options].some(o=>o.value===key)?key:'';document.documentElement.style.setProperty('--offline-bar-height',document.getElementById('offline-toolbar').offsetHeight+'px');window.scrollTo({top:0,behavior:'instant'});}
document.getElementById('screen-select').addEventListener('change',event=>{location.hash=event.target.value;});
window.addEventListener('hashchange',render);window.addEventListener('resize',()=>document.documentElement.style.setProperty('--offline-bar-height',document.getElementById('offline-toolbar').offsetHeight+'px'));
document.addEventListener('submit',event=>event.preventDefault());
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
document.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.getAttribute('aria-label')==='Mais opções'){if(document.getElementById('more-navigation'))return closeMenu();const drawer=document.createElement('div');drawer.className='drawer';drawer.id='more-navigation';const close=document.createElement('button');close.type='button';close.textContent='Fechar';close.setAttribute('aria-label','Fechar opções');close.className='button outline';drawer.append(close);const nav=view.querySelector('.sidebar nav')?.cloneNode(true);if(nav)drawer.append(nav);view.append(drawer);button.setAttribute('aria-expanded','true');return;}if(button?.getAttribute('aria-label')==='Fechar opções')return closeMenu();const link=event.target.closest('a');if(link&&link.getAttribute('href')?.startsWith('/')){event.preventDefault();location.hash='screen=home';}});
render();
`;
const html = `<!doctype html><html lang="pt-BR" data-scroll-behavior="smooth"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wireframe navegável — prévia offline</title><style>${css}\nbody .sidebar{top:var(--offline-bar-height,65px)}.offline-caption{font-size:11px;max-width:580px}#screen-select{max-width:240px}</style></head><body><div id="offline-toolbar" class="gallery-toolbar"><strong>Wireframe navegável<span>Prévia offline · dados fictícios · perfil Essencial</span></strong><span class="offline-caption">Navegação e rolagem disponíveis. Formulários, filtros e integrações inativos.</span><label>Tela<select id="screen-select">${options}</select></label></div><div id="offline-view"></div><script type="application/json" id="snapshots">${data}</script><script>${runtime}</script></body></html>`;
await writeFile("docs/preview/wireframe.html", html);
await writeFile(
  "docs/preview/README.md",
  `# Prévia navegável sem instalação\n\nBaixe **wireframe.html** e abra o arquivo no Chrome ou Edge. Não requer Node, servidor ou conexão depois do download.\n\nContém ${Object.keys(snapshots).length} telas/variantes capturadas do wireframe real, com menu e links entre telas. A barra superior permite escolher telas e estados. Menu fixo e carrosséis funcionam no navegador.\n\nÉ uma prévia estática navegável do perfil Essencial: formulários, filtros, abas, login, compras e downloads de materiais estão inativos. Não substitui o projeto React nem simula autenticação. A paleta final continua separada nos documentos de design.\n\nGerar novamente: inicie npm run dev e execute npm run preview:offline. Nenhum deploy foi realizado.\n`,
);
console.log(
  `Offline HTML exported: ${Object.keys(snapshots).length} screen variants; ${Buffer.byteLength(html)} bytes.`,
);
