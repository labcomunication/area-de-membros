import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium, type Page } from "@playwright/test";

const html = await readFile(
  process.env.PREVIEW_HTML ?? "docs/preview/wireframe.html",
  "utf8",
);
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
async function focused(page: Page, selector: string) {
  assert.equal(
    await page
      .locator(selector)
      .evaluate((element) => element === document.activeElement),
    true,
    `Focus should return to ${selector}`,
  );
}
async function contained(page: Page) {
  const box = await page.locator(".notes-composer").boundingBox();
  const viewport = page.viewportSize()!;
  assert.ok(
    box &&
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width + 1 &&
      box.y + box.height <= viewport.height + 1,
    "The floating editor must remain inside the viewport",
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
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
  const newNote = page.getByRole("button", {
    name: "Nova anotação",
    exact: true,
  });
  await newNote.click();
  assert.equal(
    await page.locator("dialog[open] [data-note-editor]").count(),
    1,
    "Creating a note must open the existing form in a floating modal dialog",
  );
  const dialog = page.getByRole("dialog", {
    name: "Uma ideia de cada vez",
    exact: true,
  });
  assert.equal(
    await dialog.isVisible(),
    true,
    "The composer needs an accessible name",
  );
  assert.equal(
    await dialog
      .locator('input[type="date"], input[type="datetime-local"]')
      .count(),
    0,
  );
  assert.equal(
    await page.locator(".notes-content > .notes-composer").count(),
    1,
  );
  await focused(page, "#note-title");
  await page.keyboard.press("Shift+Tab");
  await focused(page, '[data-action="cancel-note"]');
  await page.keyboard.press("Tab");
  await focused(page, "#note-title");
  await page
    .getByLabel("Título da anotação", { exact: true })
    .fill("Descartar esta ideia");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  assert.equal(await page.locator(".notes-composer").count(), 0);
  assert.equal(await page.locator(".note-card").count(), 3);
  await focused(page, '[data-action="new-note"]');

  await page
    .getByRole("button", { name: "Adicionar em Em andamento", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Escrever nota", exact: true })
    .click();
  await focused(page, "#note-body");
  await page
    .getByLabel("Título da anotação", { exact: true })
    .fill("Planejar o próximo material");
  await page
    .getByLabel("Texto da anotação", { exact: true })
    .fill("Texto em memória.");
  await page
    .getByRole("button", { name: "Salvar anotação", exact: true })
    .click();
  const saved = page
    .locator('[data-column="working"] .note-card')
    .filter({ hasText: "Planejar o próximo material" });
  assert.equal(
    await saved.count(),
    1,
    "The dialog must save to the selected board column",
  );
  assert.equal(
    await saved
      .locator('[data-action="note-actions"]')
      .evaluate((button) => button === document.activeElement),
    true,
  );
  await saved.locator('[data-action="note-actions"]').click();
  await page
    .getByRole("menuitem", { name: "Editar anotação", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Título da anotação", { exact: true }).inputValue(),
    "Planejar o próximo material",
  );
  await page
    .getByLabel("Título da anotação", { exact: true })
    .fill("Mudança cancelada");
  await page.keyboard.press("Escape");
  assert.equal(await saved.count(), 1);
  assert.equal(
    await saved
      .locator('[data-action="note-actions"]')
      .evaluate((button) => button === document.activeElement),
    true,
  );

  await newNote.click();
  // Native cancel and native close must release state just like the Cancel button.
  await dialog.evaluate((element) =>
    element.dispatchEvent(new Event("cancel", { cancelable: true })),
  );
  assert.equal(await page.locator(".notes-composer").count(), 0);
  await focused(page, '[data-action="new-note"]');
  await newNote.click();
  await dialog.evaluate((element) => (element as HTMLDialogElement).close());
  await page.waitForFunction(() => !document.querySelector(".notes-composer"));
  await focused(page, '[data-action="new-note"]');
  await newNote.click();
  await page.mouse.click(4, 4);
  assert.equal(
    await page.locator(".notes-composer").count(),
    0,
    "A deliberate backdrop click dismisses the composer",
  );
  await focused(page, '[data-action="new-note"]');

  await page
    .getByRole("button", { name: "Adicionar ao quadro", exact: true })
    .click();
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  assert.equal(
    await page.locator(".notes-popover").count(),
    1,
    "A queued resize from before the menu opened must not dismiss the new menu",
  );
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.waitForFunction(() => !document.querySelector(".notes-popover"));

  // A composer Escape must not also dismiss the shell's navigation drawer.
  await page
    .locator('.bottom-nav button[aria-controls="more-navigation"]')
    .evaluate((button) => (button as HTMLButtonElement).click());
  await newNote.evaluate((button) => (button as HTMLButtonElement).click());
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#more-navigation").count(), 1);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#more-navigation").count(), 0);
  await newNote.click();
  await go(page, "home");
  assert.equal(
    await page.locator(".notes-composer, dialog[open]").count(),
    0,
    "Route replacement must release the editor and its modal focus trap",
  );
  await go(page, "notes");
  assert.equal(
    await page.locator(".note-card").count(),
    4,
    "Navigation preserves committed notes only",
  );

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 640 });
    await newNote.click();
    await contained(page);
    const targets = await dialog
      .locator("input, textarea, button")
      .evaluateAll((controls) =>
        controls.map((control) => control.getBoundingClientRect().height),
      );
    assert.ok(
      targets.every((height) => height >= 44),
      "Composer controls must offer at least 44px touch targets",
    );
    const colors = await dialog.evaluate((element) => {
      const input = element.querySelector("input")!;
      return [
        getComputedStyle(element).backgroundColor,
        getComputedStyle(input).backgroundColor,
      ];
    });
    assert.notEqual(
      colors[0],
      colors[1],
      "Grey fields must be distinguishable from the dialog surface",
    );
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 320, height: 360 });
  await newNote.click();
  await contained(page);
  assert.equal(
    await dialog.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
    true,
    "A short viewport must scroll the editor content",
  );
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await focused(page, '[data-action="new-note"]');
  const touch = await browser.newPage({
    viewport: { width: 390, height: 640 },
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
    .getByRole("button", { name: "Adicionar em Guardados", exact: true })
    .tap();
  await touch
    .getByRole("menuitem", { name: "Adicionar nota", exact: true })
    .tap();
  await focused(touch, "#note-title");
  await contained(touch);
  await touch.getByRole("button", { name: "Cancelar", exact: true }).tap();
  await focused(touch, '[data-column="saved"] [data-action="board-actions"]');
  await touch.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  console.log(
    "Notes composer passed: native accessible modal, column/body focus, save/cancel/native dismissal, focus wrap/restoration, shell Escape isolation, route cleanup, touch/dark and four viewport sizes. Zero JS errors/network requests.",
  );
} finally {
  await browser.close();
}
