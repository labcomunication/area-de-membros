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
  await page.evaluate((s) => {
    location.hash = "screen=" + s;
  }, screen);
  await page.waitForFunction(
    (s) =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=" + s,
    screen,
  );
}
try {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("request", (r) => requests.push(r.url()));
  await p.route("**/*", (r) => r.abort());
  await p.setContent(html);
  await p.locator(".home-zone-a").waitFor();
  assert.equal(
    await p.evaluate(() =>
      Object.hasOwn(
        JSON.parse(document.getElementById("snapshots")!.textContent!),
        "screen=notes",
      ),
    ),
    true,
    "Offline notes screen is required",
  );
  await go(p, "offers");
  assert.equal(await p.locator(".offer-card").count(), 5);
  const bottoms = await p
    .locator(".offer-footer")
    .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().bottom));
  assert.ok(
    Math.max(...bottoms) - Math.min(...bottoms) < 1,
    "Offer footers must align",
  );
  await p
    .getByRole("button", { name: "Próximas ofertas", exact: true })
    .click();
  await p.waitForFunction(
    () => document.querySelector(".offer-track")!.scrollLeft > 10,
  );
  const toggle = p.locator(".offer-description-toggle").last();
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"), "true");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"), "false");
  await go(p, "account");
  await p.getByRole("button", { name: "Editar", exact: true }).click();
  await p.getByRole("button", { name: "Ícones no topo", exact: true }).click();
  assert.equal(await p.locator(".sidebar").isVisible(), false);
  await go(p, "home");
  const top = p.locator(".desktop-topbar");
  const before = (await top.boundingBox())!.y;
  await p.evaluate(() => window.scrollTo({ top: 1000, behavior: "instant" }));
  assert.ok(
    Math.abs((await top.boundingBox())!.y - before) < 1,
    "Compact topbar must stay fixed on scroll",
  );
  await p
    .getByRole("button", { name: "Mostrar menu lateral", exact: true })
    .click();
  assert.equal(await p.locator(".sidebar").isVisible(), true);
  await go(p, "notes");
  await p.getByRole("button", { name: "Nova anotação", exact: true }).click();
  const title = "<img src=x onerror=alert(1)>";
  await p.getByLabel("Título da anotação", { exact: true }).fill(title);
  await p
    .getByLabel("Texto da anotação", { exact: true })
    .fill("Uma ideia local, sem API.");
  await p.getByRole("button", { name: "Salvar anotação", exact: true }).click();
  let card = p.locator(".note-card").filter({ hasText: title });
  assert.equal(await card.count(), 1);
  assert.equal(await card.locator("img").count(), 0);
  await card.locator("select").selectOption("working");
  assert.equal(
    await p
      .locator('[data-column="working"] .note-card')
      .filter({ hasText: title })
      .count(),
    1,
  );
  card = p.locator(".note-card").filter({ hasText: title });
  await card
    .getByRole("button", { name: "Arrastar anotação", exact: true })
    .dragTo(p.locator('[data-column="saved"]'));
  assert.equal(
    await p
      .locator('[data-column="saved"] .note-card')
      .filter({ hasText: title })
      .count(),
    1,
  );
  await card
    .getByRole("button", { name: "Editar anotação", exact: true })
    .click();
  await p
    .getByLabel("Texto da anotação", { exact: true })
    .fill("Texto revisado.");
  await p.getByRole("button", { name: "Salvar anotação", exact: true }).click();
  assert.equal(
    await card.getByText("Texto revisado.", { exact: true }).count(),
    1,
  );
  await card
    .getByRole("button", { name: "Excluir anotação", exact: true })
    .click();
  assert.equal(
    await p.locator(".note-card").filter({ hasText: title }).count(),
    0,
  );
  await p.getByRole("button", { name: "Desfazer", exact: true }).click();
  assert.equal(
    await p.locator(".note-card").filter({ hasText: title }).count(),
    1,
  );
  await go(p, "bonus");
  await p.locator(".is-locked").click({ button: "right" });
  await p
    .getByRole("menuitem", { name: "Guardar nas anotações", exact: true })
    .click();
  await go(p, "notes");
  assert.equal(
    await p.locator('.note-card a[href*="screen=locked"]').count(),
    1,
  );
  await go(p, "ai");
  assert.equal(
    await p
      .locator(".ai-studio-copy")
      .evaluate((el) => getComputedStyle(el).textAlign),
    "center",
  );
  assert.equal(await p.locator(".character-state").textContent(), "Adam");
  assert.equal(
    await p
      .locator(".character-status")
      .evaluate((el) => getComputedStyle(el).position),
    "absolute",
  );
  const player = p.locator(".character-play");
  await player.scrollIntoViewIfNeeded();
  const box = (await player.boundingBox())!;
  const palette = await player
    .locator(".character")
    .getAttribute("data-palette");
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 30, {
    steps: 8,
  });
  await p.waitForFunction(
    () =>
      Math.abs(window.previewCharacters.volumeSnapshot().position[0]) > 0.01,
  );
  await p.mouse.up();
  assert.equal(
    await player.locator(".character").getAttribute("data-palette"),
    palette,
    "Dragging must not trigger a color click",
  );
  await p.waitForFunction(
    () =>
      Math.abs(window.previewCharacters.volumeSnapshot().position[0]) < 0.001 &&
      Math.abs(window.previewCharacters.volumeSnapshot().position[1]) < 0.001,
    undefined,
    { timeout: 4000 },
  );
  for (const width of [1440, 768, 390, 320]) {
    await p.setViewportSize({ width, height: 900 });
    for (const screen of ["home", "offers", "account", "notes", "ai"]) {
      await go(p, screen);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow ${screen} at ${width}`,
      );
    }
  }
  await go(p, "account");
  await p.getByRole("button", { name: "Editar", exact: true }).click();
  await p.getByRole("button", { name: "Ícones no topo", exact: true }).click();
  assert.equal(await p.locator(".mobile-compact-nav").isVisible(), true);
  assert.equal(await p.locator(".bottom-nav").isVisible(), false);
  await p
    .locator('.mobile-compact-nav [data-action="restore-navigation"]')
    .click();
  assert.equal(await p.locator(".bottom-nav").isVisible(), true);
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  console.log(
    "Workspace verification passed: offers/footer/expansion/carousel, sticky compact navigation/restoration, safe notes CRUD/drag/undo/bookmarks, centered soft mascot and responsive layouts. Zero JS errors/network requests.",
  );
} finally {
  await browser.close();
}
