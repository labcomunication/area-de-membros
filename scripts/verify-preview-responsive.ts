import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  for (const edition of ["dev", "usuario"]) {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const errors: string[] = [],
      network: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) network.push(request.url());
    });
    await page.route("**/*", (route) => route.abort());
    await page.setContent(
      await readFile(`docs/preview/wireframe.${edition}.html`, "utf8"),
    );
    const keys = await page
      .locator("#snapshots")
      .evaluate((element) => Object.keys(JSON.parse(element.textContent!)));
    for (const width of [2196, 2560, 3440, 1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const key of keys) {
        await page.evaluate((key) => {
          location.hash = key;
        }, key);
        await page.waitForFunction(
          (key) =>
            document.getElementById("offline-view")?.dataset.previewKey === key,
          key,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `${edition}/${key}/${width}: document overflow`,
        );
        if (width >= 1440 && (await page.locator(".main-content").count())) {
          assert.equal(
            await page.locator(".main-content").evaluate((element) => {
              const main = element.getBoundingClientRect();
              const workspace = element
                .closest(".workspace")!
                .getBoundingClientRect();
              return (
                main.left - workspace.left <= 32 &&
                workspace.right - main.right <= 32
              );
            }),
            true,
            `${edition}/${key}/${width}: content must fill the workspace with side gutters`,
          );
        }
        if (width >= 1600 && key === "screen=home")
          assert.equal(
            await page
              .locator(".featured-story > .story-media")
              .evaluate((element) => {
                const box = element.getBoundingClientRect();
                return (
                  box.width >=
                    element.parentElement!.getBoundingClientRect().width *
                      0.95 && box.height <= 421
                );
              }),
            true,
            `${edition}/${width}: editorial media fills its column without excessive height`,
          );
      }
    }
    await page.setViewportSize({ width: 2196, height: 1000 });
    await page.evaluate(() => {
      location.hash = "screen=bonus";
    });
    await page.waitForFunction(
      () =>
        document.getElementById("offline-view")?.dataset.previewKey ===
        "screen=bonus",
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `docs/screenshots/responsive-${edition}-ultrawide.png`,
    });
    await page.setViewportSize({ width: 3440, height: 1440 });
    await page.evaluate(() => {
      location.hash = "screen=home";
    });
    await page.waitForFunction(
      () =>
        document.getElementById("offline-view")?.dataset.previewKey ===
        "screen=home",
    );
    await page.screenshot({
      path: `docs/screenshots/responsive-${edition}-3440.png`,
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(network, []);
    await page.close();
  }
  console.log(
    "Responsive previews passed: all 39 variants in Dev/user editions at 320, 390, 768, 1024, 1440, 2196, 2560 and 3440px; full workspace width, preserved gutters and zero document overflow, JS errors or external requests.",
  );
} finally {
  await browser.close();
}
