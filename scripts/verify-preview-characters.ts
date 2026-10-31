import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium, type Page } from "@playwright/test";
const html = await readFile("docs/preview/wireframe.html", "utf8");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const errors: string[] = [],
  requests: string[] = [];
async function load(page: Page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.route("**/*", (route) => route.abort());
  await page.setContent(html);
  await page.locator(".home-zone-a").waitFor();
}
async function go(page: Page, screen: string) {
  await page.evaluate((screen) => {
    location.hash = "screen=" + screen;
  }, screen);
  await page.waitForFunction(
    (screen) =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=" + screen,
    screen,
  );
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  await load(page);
  assert.equal(await page.locator(".sidebar .nav-group").count(), 3);
  const explore = page.locator('.sidebar [data-nav-group="explore"]');
  await explore.locator("summary").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () =>
      !document.querySelector<HTMLDetailsElement>(
        '.sidebar [data-nav-group="explore"]',
      )!.open,
  );
  assert.equal(
    await explore.locator('[data-nav-target="ai"]').isVisible(),
    false,
  );
  await go(page, "products");
  assert.equal(
    await page
      .locator('.sidebar [data-nav-group="explore"]')
      .getAttribute("open"),
    null,
  );
  await go(page, "ai");
  assert.equal(
    await page.locator('.sidebar [data-nav-target="ai"]').isVisible(),
    true,
  );
  assert.equal(
    await page
      .locator('.sidebar [data-nav-target="ai"]')
      .getAttribute("aria-current"),
    "page",
  );

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await go(page, "account");
    await page.locator('[data-action="avatar-picker"]').click();
    assert.equal(await page.locator(".avatar-choice").count(), 15);
    assert.equal(await page.locator("#avatar-picker-panel").isVisible(), true);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Avatar picker overflow at ${width}`,
    );
    const targets = await page
      .locator(".avatar-choice")
      .evaluateAll((buttons) =>
        buttons.every((button) => {
          const rect = button.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44;
        }),
      );
    assert.equal(targets, true);
    await page.getByRole("button", { name: "Rosa", exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "Rosa", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      await page
        .locator(".account-identity .character")
        .getAttribute("data-character"),
      "rosa",
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#avatar-picker-panel").isVisible(), false);
    assert.equal(
      await page
        .locator('[data-action="avatar-picker"]')
        .evaluate((el) => document.activeElement === el),
      true,
    );
    await go(page, "ai");
    assert.equal(
      await page
        .locator(".character-play .character")
        .getAttribute("data-character"),
      "rosa",
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const player = page.getByRole("button", {
    name: "Brincar com personagem",
    exact: true,
  });
  await player.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await player.focus();
  await page.keyboard.press("Space");
  await page.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "happy",
  );
  assert.equal(
    await page
      .locator(".character-play .character")
      .getAttribute("data-character"),
    "rosa",
  );
  await go(page, "account");
  await page.locator('[data-action="avatar-picker"]').click();
  await page.getByRole("button", { name: "Maya", exact: true }).focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page
      .locator(".account-identity .character")
      .getAttribute("data-character"),
    "menta",
  );
  await page.getByRole("button", { name: "Concluir", exact: true }).click();

  const touch = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await load(touch);
  await go(touch, "ai");
  assert.equal(
    await touch
      .locator("#character-instructions")
      .evaluate((el) => getComputedStyle(el).position),
    "absolute",
  );
  await touch.locator(".character-play").tap();
  await touch.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "happy",
  );
  assert.equal(
    await touch
      .getByRole("button", { name: "Geração de PDFs · Em breve", exact: true })
      .isDisabled(),
    true,
  );
  await touch.getByRole("button", { name: "Mais opções", exact: true }).tap();
  assert.equal(await touch.locator(".drawer .nav-group").count(), 3);
  await touch.locator('.drawer [data-nav-target="account"]').tap();
  await touch.locator(".account-overview").waitFor();
  assert.equal(await touch.locator(".drawer").count(), 0);
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  console.log(
    "Character/menu verification passed: grouped navigation, 15 choices at 4 widths, profile/AI selection, keyboard and touch happy feedback, drawer and reduced motion. Zero JS errors or network requests.",
  );
} finally {
  await browser.close();
}
