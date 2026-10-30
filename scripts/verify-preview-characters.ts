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
  const box = (await player.boundingBox())!;
  await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2);
  await page.waitForFunction(
    () =>
      parseFloat(
        (
          document.querySelector(".character-play .character") as HTMLElement
        ).style.getPropertyValue("--look-x"),
      ) > 0,
  );
  await page.mouse.move(box.x - 100, box.y + box.height / 2);
  await page.waitForFunction(
    () =>
      parseFloat(
        (
          document.querySelector(".character-play .character") as HTMLElement
        ).style.getPropertyValue("--look-x"),
      ) < 0,
  );
  await page.evaluate(() =>
    document.dispatchEvent(
      new PointerEvent("pointerout", { relatedTarget: null }),
    ),
  );
  assert.equal(
    await page
      .locator(".character-play .character")
      .evaluate((el) => (el as HTMLElement).style.getPropertyValue("--look-x")),
    "",
  );
  const paletteBefore = await page
    .locator(".character-play .character")
    .getAttribute("data-palette");
  const headingBefore = await page.locator(".ai-studio h1").boundingBox();
  await player.click();
  assert.equal(
    await page.locator(".character-play .character").getAttribute("data-mood"),
    "happy",
  );
  assert.notEqual(
    await page
      .locator(".character-play .character")
      .getAttribute("data-palette"),
    paletteBefore,
  );
  await page.keyboard.press("Enter");
  await player.click();
  await player.click();
  assert.equal(
    await page.locator(".character-play .character").getAttribute("data-mood"),
    "angry",
  );
  assert.equal(
    await page
      .locator(".character-play .character-brows")
      .evaluate((el) => getComputedStyle(el).display),
    "block",
  );
  assert.deepEqual(
    await page.locator(".ai-studio h1").boundingBox(),
    headingBefore,
  );
  await page.waitForFunction(
    () =>
      document
        .querySelector(".character-play .character")
        ?.getAttribute("data-mood") === "curious",
    undefined,
    { timeout: 3000 },
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2);
  assert.equal(
    await page
      .locator(".character-play .character-gaze")
      .evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  await player.focus();
  await page.keyboard.press("Space");
  assert.equal(
    await page.locator(".character-play .character").getAttribute("data-mood"),
    "happy",
  );
  await go(page, "account");
  await page.locator('[data-action="avatar-picker"]').click();
  await page.getByRole("button", { name: "Menta", exact: true }).focus();
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
  assert.equal(await touch.locator(".touch-hint").isVisible(), true);
  await touch.locator(".character-play").tap();
  assert.equal(
    await touch.locator(".character-play .character").getAttribute("data-mood"),
    "happy",
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
    "Character/menu verification passed: grouped navigation, 15 choices at 4 widths, profile/AI selection, gaze/reset, happy/color/rapid-click angry/recovery, keyboard, touch and reduced motion. Zero JS errors or network requests.",
  );
} finally {
  await browser.close();
}
