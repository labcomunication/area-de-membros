import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { screens, states } from "../src/config/members";
const baseURL = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const index = [
  "# Wireframes — índice de capturas",
  "",
  "Capturas de fixtures locais; não representam autenticação ou conteúdo final.",
  "",
  "| Tela | Estado | Desktop 1440px | Mobile 390px |",
  "|---|---|---|---|",
];
await mkdir("docs/screenshots", { recursive: true });
try {
  // Every principal screen, plus each non-normal state on a representative page.
  const cases = [
    ...screens.map(([screen]) => ({ screen, state: "normal" })),
    ...states
      .filter((state) => state !== "normal")
      .map((state) => ({ screen: "products", state })),
  ];
  for (const item of cases) {
    const links = [];
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
      const response = await page.goto(
        `${baseURL}/wireframes?screen=${item.screen}&state=${item.state}`,
      );
      if (response?.status() !== 200)
        throw Error(
          "Gallery requires npm run dev; production gallery must stay 404.",
        );
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      // Captures must not include Next's devtools button.
      await page.addStyleTag({
        content: "nextjs-portal { display:none !important; }",
      });
      const file = `${item.screen}-${item.state}-${device}.png`;
      await page.screenshot({
        path: `docs/screenshots/${file}`,
        fullPage: true,
      });
      if (errors.length) throw Error(errors.join("\n"));
      links.push(`[${device}](${file})`);
      await page.close();
    }
    index.push(
      `| ${item.screen} | ${item.state} | ${links[0]} | ${links[1]} |`,
    );
  }
  await writeFile("docs/screenshots/README.md", index.join("\n") + "\n");
  console.log(`${cases.length * 2} screenshots captured.`);
} finally {
  await browser.close();
}
