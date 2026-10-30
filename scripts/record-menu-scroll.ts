import { chromium } from "@playwright/test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
const baseURL = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
await mkdir("docs/scroll-demos", { recursive: true });
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["mobile", 390, 844],
  ] as const) {
    const frames = await mkdtemp(join(tmpdir(), "members-scroll-"));
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    try {
      const response = await page.goto(`${baseURL}/wireframes?screen=home`);
      if (response?.status() !== 200)
        throw Error("Start the development gallery before recording.");
      await page.addStyleTag({
        content: "nextjs-portal{display:none!important}",
      });
      await page.locator(".learning-next").waitFor();
      const nav = page.locator(name === "desktop" ? ".sidebar" : ".bottom-nav");
      const before = await nav.boundingBox();
      let index = 0;
      // Every frame is captured from the running app. Playback is normalized to 12fps.
      for (const y of [
        ...Array(5).fill(0),
        ...Array.from({ length: 40 }, (_, i) => (i + 1) * 40),
        ...Array(5).fill(1600),
      ]) {
        await page.evaluate(
          (top) => window.scrollTo({ top, behavior: "instant" }),
          y,
        );
        await page.screenshot({
          path: join(frames, `frame-${String(index++).padStart(3, "0")}.png`),
        });
      }
      const after = await nav.boundingBox();
      if (!before || !after || Math.abs(after.y - before.y) > 1)
        throw Error("Navigation moved during scroll.");
      await page.screenshot({ path: `docs/scroll-demos/${name}-scrolled.png` });
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({ path: `docs/scroll-demos/${name}-start.png` });
      await run(process.env.FFMPEG_PATH ?? "ffmpeg", [
        "-hide_banner",
        "-loglevel",
        "error",
        "-framerate",
        "12",
        "-i",
        join(frames, "frame-%03d.png"),
        "-c:v",
        "libvpx-vp9",
        "-b:v",
        "0",
        "-crf",
        "36",
        "-pix_fmt",
        "yuv420p",
        "-y",
        `docs/scroll-demos/${name}-menu-fixed.webm`,
      ]);
    } finally {
      await page.close();
      await rm(frames, { recursive: true, force: true });
    }
  }
  await writeFile(
    "docs/scroll-demos/README.md",
    `# Menu fixo — demonstrações do protótipo\n\nA página rola 1600px; a posição do menu é conferida antes/depois. Cada quadro foi capturado no app local real; a sequência é reproduzida a 12fps com FFmpeg do sistema, não é uma captura em tempo real. Não houve deploy.\n\n- [Desktop — vídeo](desktop-menu-fixed.webm) · [início](desktop-start.png) · [após rolagem](desktop-scrolled.png)\n- [Mobile 390px — vídeo](mobile-menu-fixed.webm) · [início](mobile-start.png) · [após rolagem](mobile-scrolled.png)\n\nReproduzir: mantenha npm run dev e execute npm run demo:scroll. Requer Chromium e FFmpeg no sistema (ou CHROMIUM_PATH / FFMPEG_PATH). O FFmpeg de vídeo do Playwright não pôde ser baixado pela política de rede; nenhum controle de verificação foi desativado.\n`,
  );
  console.log(
    "Two scroll demos and four viewport captures generated; menu positions verified.",
  );
} finally {
  await browser.close();
}
