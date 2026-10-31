import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  for (const file of ["style-guide", "design-system"]) {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 1000 },
    });
    await page.setContent(
      await readFile(resolve(`docs/design/${file}.html`), "utf8"),
      { waitUntil: "load" },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: `docs/design/${file}.pdf`,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log(
      `${file}.pdf exported; ${await page.locator(".sheet").count()} sections.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
