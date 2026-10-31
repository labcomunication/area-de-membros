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
async function contained(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize()!;
  assert.ok(
    box &&
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width + 1 &&
      box.y + box.height <= viewport.height + 1,
    `${selector} must stay in the viewport`,
  );
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.route("**/*", (route) => route.abort());
  await page.setContent(html);
  await go(page, "notes");
  assert.equal(
    await page.locator(".note-card select").count(),
    0,
    "Notes must use the styled keyboard menu instead of a native select",
  );
  assert.equal(
    await page
      .locator(
        '.note-card [data-action="edit-note"], .note-card [data-action="delete-note"]',
      )
      .count(),
    0,
    "Editing and deleting belong in the corner menu",
  );
  const first = page.locator('[data-note-id="note-1"]');
  const move = first.getByRole("button", { name: /^Mover anotação/ });
  await move.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await move.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator('[data-column="saved"] [data-note-id="note-1"]').count(),
    1,
  );
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("data-action"),
    ),
    "move-note-menu",
    "A redraw must focus the new move control",
  );
  await first.getByRole("button", { name: /^Ações da anotação/ }).click();
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("data-action"),
    ),
    "note-actions",
  );
  await first.getByRole("button", { name: /^Ações da anotação/ }).click();
  await page
    .getByRole("menuitem", { name: "Editar anotação", exact: true })
    .click();
  await page
    .getByLabel("Texto da anotação", { exact: true })
    .fill("Texto revisado.");
  await page
    .getByRole("button", { name: "Salvar anotação", exact: true })
    .click();
  assert.equal(
    await first.getByText("Texto revisado.", { exact: true }).count(),
    1,
  );
  await first.getByRole("button", { name: /^Ações da anotação/ }).click();
  await page
    .getByRole("menuitem", { name: "Excluir anotação", exact: true })
    .click();
  assert.equal(await first.count(), 0);
  await page.getByRole("button", { name: "Desfazer", exact: true }).click();
  assert.equal(await first.count(), 1);
  await first
    .getByRole("button", { name: "Arrastar anotação", exact: true })
    .dragTo(page.locator('[data-column="working"]'));
  assert.equal(
    await page
      .locator('[data-column="working"] [data-note-id="note-1"]')
      .count(),
    1,
  );
  await page
    .locator('[data-column="saved"]')
    .click({ button: "right", position: { x: 10, y: 10 } });
  assert.equal(await page.getByRole("menuitem").count(), 3);
  await page
    .getByRole("menuitem", { name: "Adicionar nota", exact: true })
    .click();
  const unsafe = '<img src=x onerror="window.notesXss=true">';
  await page.getByLabel("Título da anotação", { exact: true }).fill(unsafe);
  await page
    .getByLabel("Texto da anotação", { exact: true })
    .fill("<script>window.notesXss=true</script>");
  await page
    .getByRole("button", { name: "Salvar anotação", exact: true })
    .click();
  const safeCard = page
    .locator('[data-column="saved"] .note-card')
    .filter({ hasText: unsafe });
  assert.equal(
    await safeCard.count(),
    1,
    "Context actions must preserve the target column",
  );
  assert.equal(await safeCard.locator("img, script").count(), 0);
  await page
    .getByRole("button", { name: "Adicionar ao quadro", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Escrever nota", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => document.activeElement?.getAttribute("name")),
    "body",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Adicionar em Guardados", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Adicionar e-book", exact: true })
    .click();
  const picker = page.getByRole("dialog", {
    name: "Adicionar e-book",
    exact: true,
  });
  assert.equal(await picker.isVisible(), true);
  assert.equal(
    await picker.locator('input[type="file"], a[download]').count(),
    0,
  );
  for (let step = 0; step < 7; step++) {
    await page.keyboard.press("Tab");
    assert.equal(
      await picker.evaluate((dialog) =>
        dialog.contains(document.activeElement),
      ),
      true,
      "The e-book picker must contain keyboard focus",
    );
  }
  await picker
    .getByRole("button", { name: /Adicionar referência.*Checklist da cozinha/ })
    .click();
  const locked = page.locator('.note-card a[href*="screen=locked"]');
  assert.equal(await locked.count(), 1);
  await locked.click();
  await page.waitForFunction(() =>
    document
      .getElementById("offline-view")
      ?.dataset.previewKey?.includes("screen=locked"),
  );
  assert.equal(
    await page.locator(".download-button:not([disabled])").count(),
    0,
  );
  await go(page, "bonus");
  const lockedBookmark = page.locator(".is-locked .save-resource-button");
  await lockedBookmark.focus();
  await page.keyboard.press("Shift+F10");
  await page.keyboard.press("Escape");
  assert.equal(
    await lockedBookmark.evaluate(
      (button) => button === document.activeElement,
    ),
    true,
  );
  await lockedBookmark.click({ button: "right" });
  await page
    .getByRole("menuitem", { name: "Guardar nas anotações", exact: true })
    .click();
  await go(page, "notes");
  assert.equal(
    await page.locator('.note-card a[href*="product=checklist"]').count(),
    1,
    "Saving a reference twice must not duplicate or unlock it",
  );
  await go(page, "products");
  await page.locator(".save-resource-button").first().click();
  await go(page, "notes");
  assert.equal(
    await page
      .locator(
        '.note-card a[href*="product=doces-base"][href*="screen=product"]',
      )
      .count(),
    1,
    "Product bookmarking must remain intact",
  );
  await page
    .getByRole("button", { name: "Adicionar ao quadro", exact: true })
    .click();
  await page.locator(".notes-heading h1").click();
  assert.equal(await page.locator(".notes-popover").count(), 0);
  await page
    .getByRole("button", { name: "Adicionar ao quadro", exact: true })
    .click();
  await go(page, "home");
  assert.equal(
    await page.locator(".notes-popover, .notes-resource-picker").count(),
    0,
    "Navigation must dispose transient notes UI",
  );
  await go(page, "notes");
  await page
    .getByRole("button", { name: "Adicionar ao quadro", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Adicionar e-book", exact: true })
    .click();
  await go(page, "home");
  assert.equal(
    await page.locator(".notes-resource-picker").count(),
    0,
    "Navigation must remove the modal and release its focus trap",
  );
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 640 });
    await go(page, "notes");
    await page.locator(".notes-board").evaluate((board) =>
      board.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: innerWidth - 1,
          clientY: innerHeight - 1,
        }),
      ),
    );
    await contained(page, ".notes-popover");
    await page.keyboard.press("Home");
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent),
      "Adicionar nota",
    );
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Adicionar ao quadro", exact: true })
      .click();
    await page
      .getByRole("menuitem", { name: "Adicionar e-book", exact: true })
      .click();
    await contained(page, ".notes-resource-picker");
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("data-action"),
      ),
      "board-actions",
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
  }
  await go(page, "notes");
  await page.locator('[data-column="ideas"]').focus();
  await page.keyboard.press("Shift+F10");
  assert.equal(
    await page
      .getByRole("menu", { name: "Adicionar em Ideias", exact: true })
      .isVisible(),
    true,
  );
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(".notes-popover").count(), 0);
  const touch = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  touch.on("pageerror", (error) => errors.push(error.message));
  touch.on("request", (request) => requests.push(request.url()));
  await touch.route("**/*", (route) => route.abort());
  await touch.setContent(html);
  await go(touch, "notes");
  await touch.evaluate(() => {
    document.documentElement.dataset.previewMode = "dark";
  });
  await touch
    .getByRole("button", { name: "Adicionar ao quadro", exact: true })
    .tap();
  await touch
    .getByRole("menuitem", { name: "Adicionar e-book", exact: true })
    .tap();
  await contained(touch, ".notes-resource-picker");
  await touch
    .getByRole("dialog")
    .getByRole("button", { name: "Fechar", exact: true })
    .tap();
  await touch.locator('[data-note-id="note-1"] .note-move-trigger').tap();
  await contained(touch, ".notes-popover");
  await touch
    .getByRole("menuitemradio", { name: "Em andamento", exact: true })
    .tap();
  assert.equal(
    await touch
      .locator('[data-column="working"] [data-note-id="note-1"]')
      .count(),
    1,
  );
  await touch.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  console.log(
    "Notes review passed: styled menus, keyboard/focus/dismissal, CRUD/XSS/drag/undo, column context actions, demo e-book references, locked routing, bookmarks and viewport containment. Zero JS errors/network requests.",
  );
} finally {
  await browser.close();
}
