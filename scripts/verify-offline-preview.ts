import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium, type Page } from "@playwright/test";

const html = await readFile("docs/preview/wireframe.html", "utf8");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const errors: string[] = [];
const requests: string[] = [];
async function go(page: Page, key: string) {
  await page.evaluate((key) => {
    location.hash = key;
  }, key);
  await page.waitForFunction(
    (key) =>
      document.getElementById("offline-view")?.dataset.previewKey === key,
    key,
  );
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.route("**/*", (route) => route.abort());
  await page.setContent(html);
  await page.locator(".home-zone-a").waitFor();
  const keys = await page.evaluate(() =>
    Object.keys(JSON.parse(document.getElementById("snapshots")!.textContent!)),
  );
  assert.ok(keys.includes("screen=ai"));

  // The image can move inside a clip; neither text nor its card may move.
  await page.locator(".featured-story").scrollIntoViewIfNeeded();
  const headline = page.locator(".featured-story h3");
  const titleBefore = await headline.boundingBox();
  const cardBefore = await page.locator(".featured-story").boundingBox();
  await page.locator(".featured-story").hover();
  await page.waitForFunction(() => {
    const image = document.querySelector(".featured-story .asset-placeholder")!;
    return new DOMMatrix(getComputedStyle(image).transform).a > 1.01;
  });
  assert.deepEqual(await headline.boundingBox(), titleBefore);
  assert.deepEqual(
    await page.locator(".featured-story").boundingBox(),
    cardBefore,
  );
  assert.equal(
    await page
      .locator(".featured-story .story-media")
      .evaluate((el) => getComputedStyle(el).overflow),
    "hidden",
  );
  const rowsContained = await page.locator(".story-item").evaluateAll((rows) =>
    rows.every((row) => {
      const card = row.getBoundingClientRect();
      return [...row.children].every((child) => {
        const box = child.getBoundingClientRect();
        return box.left >= card.left - 1 && box.right <= card.right + 1;
      });
    }),
  );
  assert.equal(rowsContained, true);

  for (const [width, height] of [
    [1440, 1000],
    [768, 700],
    [390, 844],
    [320, 700],
  ]) {
    await page.setViewportSize({ width, height });
    for (const key of keys) {
      await go(page, key);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow at ${width}: ${key}`,
      );
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go(page, "screen=account");
  assert.equal(await page.locator(".activity-map .activity-cell").count(), 91);
  assert.equal(await page.locator("#appearance-options").isVisible(), false);
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  assert.equal(await page.locator("#appearance-options").isVisible(), true);
  const bodyLight = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await page.getByRole("button", { name: "Escuro", exact: true }).click();
  assert.notEqual(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    bodyLight,
  );
  await page
    .getByRole("button", { name: "Ver coroa no perfil", exact: true })
    .click();
  assert.equal(
    await page.locator(".account-identity .profile-crown").count(),
    1,
  );
  for (const accent of ["Oliva", "Vinho", "Bege"]) {
    await page.getByRole("button", { name: accent, exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: accent, exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    for (const screen of [
      "home",
      "products",
      "bonus",
      "offers",
      "account",
      "ai",
    ]) {
      await go(page, "screen=" + screen);
      assert.equal(
        await page.locator("html").getAttribute("data-preview-mode"),
        "dark",
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
    }
    await go(page, "screen=account");
    await page.getByRole("button", { name: "Editar", exact: true }).click();
  }
  await page.getByRole("button", { name: "Claro", exact: true }).click();
  await page.getByRole("button", { name: "Oliva", exact: true }).click();
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    bodyLight,
  );
  assert.equal(
    await page
      .locator(".sidebar nav a[aria-current] .nav-icon")
      .evaluate((el) => getComputedStyle(el).color),
    "rgb(104, 113, 61)",
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#appearance-options").isVisible(), false);
  assert.equal(
    await page
      .getByRole("button", { name: "Editar", exact: true })
      .evaluate((el) => document.activeElement === el),
    true,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mais opções", exact: true }).click();
  await page.locator(".drawer [data-future-ai]").click();
  await page.locator(".ai-studio").waitFor();
  assert.equal(await page.locator(".drawer").count(), 0);
  assert.equal(
    await page
      .getByRole("button", { name: "Geração de PDFs · Em breve", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(await page.locator(".ai-orb").count(), 0);
  assert.equal(await page.locator(".character-play").isEnabled(), true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".character-play .character-gaze")
      .evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  await go(page, "screen=bonus");
  assert.equal(await page.locator(".locked-cover svg").count(), 1);
  assert.equal(await page.locator(".is-locked .asset-placeholder").count(), 0);
  await go(page, "screen=offers");
  assert.equal(await page.locator(".preview-banner").count(), 1);
  assert.equal(
    await page.locator(".offer-card .price").first().textContent(),
    "R$ 29,90",
  );
  assert.equal(await page.locator(".offer-footer button:enabled").count(), 0);
  assert.equal(
    await page
      .locator(".offer-card")
      .first()
      .getByText("Valor fictício · apenas visualização")
      .count(),
    1,
  );
  await go(page, "screen=home");
  assert.equal(await page.locator(".welcome-hero").count(), 0);
  assert.equal(await page.locator(".home-zone-a .product-card").count(), 2);
  await page.locator(".learning-next a").click();
  await page.locator(".product-header").waitFor();
  await page.locator("a.module-row").first().click();
  await page.locator(".viewer-placeholder").waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  console.log(
    `Offline verification passed: ${keys.length} variants at 4 widths; stable text on hover, themes/accents, crown, keyboard, future AI, locked bonus and inert offers. Zero JavaScript errors or network requests.`,
  );
} finally {
  await browser.close();
}
