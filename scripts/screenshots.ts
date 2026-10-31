import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { screens, states } from "../src/config/members";
const baseURL = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";
const offlineHome = process.argv.includes("--offline-home");
const offlineReview = process.argv.includes("--offline-review");
const offline = offlineHome || offlineReview;
const offlineHtml = offline
  ? await readFile("docs/preview/wireframe.html", "utf8")
  : undefined;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const index = [
  offline
    ? "# Capturas — prévia HTML refinada"
    : "# Wireframes — índice de capturas",
  "",
  offline
    ? "Capturas de docs/preview/wireframe.html; dados fictícios e integrações inativas. A galeria React mantém seu layout anterior. Regenerar: npm run screenshots -- --offline-review (ou --offline-home para somente Home). Temas e conquistas são demonstrações."
    : "Capturas de fixtures locais; não representam autenticação ou conteúdo final. Para a revisão visual independente do HTML offline, veja as [capturas atualizadas da Home](README-preview.md). As imagens abaixo representam a galeria React.",
  "",
  "| Tela | Estado | Desktop 1440px | Mobile 390px |",
  "|---|---|---|---|",
];
await mkdir("docs/screenshots", { recursive: true });
try {
  // Every principal screen, plus each non-normal state on a representative page.
  const cases = offline
    ? (offlineReview
        ? ["home", "products", "bonus", "offers", "account", "ai", "notes"]
        : ["home"]
      ).map((screen) => ({ screen, state: "normal" }))
    : [
        ...screens.map(([screen]) => ({ screen, state: "normal" })),
        ...states
          .filter((state) => state !== "normal")
          .map((state) => ({ screen: "products", state })),
      ];
  let captureCount = 0;
  for (const item of cases) {
    const links = [];
    const darkLinks = [];
    const avatarLinks = [];
    const happyLinks = [];
    const nervousLinks = [];
    const compactLinks = [],
      scrollLinks = [],
      editorLinks = [];
    for (const [device, width, height] of [
      ["desktop", 1440, 1000],
      ["mobile", 390, 844],
    ] as const) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      if (offlineHtml) {
        await page.route("**/*", (route) => route.abort());
        await page.setContent(offlineHtml);
        await page.evaluate((screen) => {
          location.hash = "screen=" + screen;
        }, item.screen);
        await page.waitForFunction(
          (screen) =>
            document.getElementById("offline-view")?.dataset.previewKey ===
            "screen=" + screen,
          item.screen,
        );
      } else {
        const response = await page.goto(
          `${baseURL}/wireframes?screen=${item.screen}&state=${item.state}`,
        );
        if (response?.status() !== 200)
          throw Error(
            "Gallery requires npm run dev; production gallery must stay 404.",
          );
      }
      await page.locator("h1").waitFor();
      if (offlineReview && item.screen === "ai") {
        await page.waitForFunction(
          () => window.previewCharacters.volumeSnapshot()?.renderedFrames > 0,
        );
      }
      await page.evaluate(() => document.fonts.ready);
      // Captures must not include Next's devtools button.
      await page.addStyleTag({
        content: "nextjs-portal { display:none !important; }",
      });
      const file = offline
        ? `${item.screen}-refined-${device}.png`
        : `${item.screen}-${item.state}-${device}.png`;
      await page.screenshot({
        path: `docs/screenshots/${file}`,
        fullPage: true,
      });
      captureCount++;
      if (offlineReview && item.screen === "ai" && device === "desktop") {
        await page
          .locator(".character-play")
          .screenshot({ path: "docs/screenshots/mascot-eyes.png" });
        captureCount++;
      }
      if (errors.length) throw Error(errors.join("\n"));
      links.push(`[${device}](${file})`);
      if (offlineReview && item.screen === "account") {
        await page.locator('[data-action="avatar-picker"]').click();
        await page.getByRole("button", { name: "Maria", exact: true }).click();
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.screenshot({
          path: `docs/screenshots/account-avatars-${device}.png`,
          fullPage: true,
        });
        captureCount++;
        avatarLinks.push(`[${device}](account-avatars-${device}.png)`);
        await page
          .getByRole("button", { name: "Concluir", exact: true })
          .click();
        await page.getByRole("button", { name: "Editar", exact: true }).click();
        await page.getByRole("button", { name: "Escuro", exact: true }).click();
        await page
          .getByRole("button", { name: "Ver coroa no perfil", exact: true })
          .click();
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.screenshot({
          path: `docs/screenshots/account-dark-${device}.png`,
          fullPage: true,
        });
        captureCount++;
        darkLinks.push(`[${device}](account-dark-${device}.png)`);
      }
      if (offlineReview && item.screen === "ai") {
        const player = page.getByRole("button", {
          name: "Brincar com personagem",
          exact: true,
        });
        await player.click();
        await page.waitForFunction(
          () => window.previewCharacters.volumeSnapshot().state === "happy",
        );
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.screenshot({
          path: `docs/screenshots/ai-happy-${device}.png`,
          fullPage: true,
        });
        captureCount++;
        happyLinks.push(`[${device}](ai-happy-${device}.png)`);
        await page.waitForFunction(
          () => window.previewCharacters.volumeSnapshot().state === "idle",
        );
        const playerBox = (await player.boundingBox())!;
        await page.mouse.click(
          playerBox.x + playerBox.width / 2,
          playerBox.y + playerBox.height / 2,
          { clickCount: 3, delay: 10 },
        );
        await page.waitForFunction(
          () => window.previewCharacters.volumeSnapshot().state === "nervous",
        );
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.screenshot({
          path: `docs/screenshots/ai-nervous-${device}.png`,
          fullPage: true,
        });
        captureCount++;
        nervousLinks.push(`[${device}](ai-nervous-${device}.png)`);
      }
      if (offlineReview && item.screen === "home") {
        await page.evaluate(() => {
          location.hash = "screen=account";
        });
        await page.locator(".personalization-card").waitFor();
        await page.getByRole("button", { name: "Editar", exact: true }).click();
        await page
          .getByRole("button", { name: "Ícones no topo", exact: true })
          .click();
        await page.evaluate(() => {
          location.hash = "screen=home";
        });
        await page.locator(".home-zone-a").waitFor();
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.screenshot({
          path: `docs/screenshots/home-compact-${device}.png`,
          fullPage: true,
        });
        captureCount++;
        compactLinks.push(`[${device}](home-compact-${device}.png)`);
        await page.evaluate(() =>
          window.scrollTo({ top: 900, behavior: "instant" }),
        );
        await page.screenshot({
          path: `docs/screenshots/home-compact-scrolled-${device}.png`,
        });
        captureCount++;
        scrollLinks.push(`[${device}](home-compact-scrolled-${device}.png)`);
      }
      if (offlineReview && item.screen === "notes") {
        await page
          .getByRole("button", { name: "Nova anotação", exact: true })
          .click();
        await page
          .getByLabel("Título da anotação", { exact: true })
          .fill("Minha próxima ideia");
        await page
          .getByLabel("Texto da anotação", { exact: true })
          .fill("Separar combinações para testar no fim de semana.");
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.screenshot({
          path: `docs/screenshots/notes-editor-${device}.png`,
          fullPage: true,
        });
        captureCount++;
        editorLinks.push(`[${device}](notes-editor-${device}.png)`);
      }
      if (errors.length) throw Error(errors.join("\n"));
      await page.close();
    }
    index.push(
      `| ${item.screen} | ${item.state} | ${links[0]} | ${links[1]} |`,
    );
    if (darkLinks.length)
      index.push(
        `| account | escuro · opções abertas · coroa de exemplo | ${darkLinks[0]} | ${darkLinks[1]} |`,
      );
    if (avatarLinks.length)
      index.push(
        `| account | seleção de personagens | ${avatarLinks[0]} | ${avatarLinks[1]} |`,
      );
    if (happyLinks.length)
      index.push(
        `| ai | feliz · olhos fechados | ${happyLinks[0]} | ${happyLinks[1]} |`,
      );
    if (nervousLinks.length)
      index.push(
        `| ai | nervoso · pose estática com movimento reduzido | ${nervousLinks[0]} | ${nervousLinks[1]} |`,
      );
    if (compactLinks.length)
      index.push(
        `| home | ícones fixos no topo | ${compactLinks[0]} | ${compactLinks[1]} |`,
      );
    if (scrollLinks.length)
      index.push(
        `| home | ícones no topo · página rolada | ${scrollLinks[0]} | ${scrollLinks[1]} |`,
      );
    if (editorLinks.length)
      index.push(
        `| notes | editor local de anotação | ${editorLinks[0]} | ${editorLinks[1]} |`,
      );
  }
  if (offlineReview)
    index.push("", "[Detalhe do mascote em volume 3D](mascot-eyes.png)");
  await writeFile(
    offline
      ? "docs/screenshots/README-preview.md"
      : "docs/screenshots/README.md",
    index.join("\n") + "\n",
  );
  console.log(`${captureCount} screenshots captured.`);
} finally {
  await browser.close();
}
