import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, type Page } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
async function go(page: Page, screen: string) {
  await page.evaluate((value) => {
    location.hash = "screen=" + value;
  }, screen);
  await page.waitForFunction(
    (value) =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=" + value,
    screen,
  );
}
try {
  for (const audience of ["dev", "usuario"]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors: string[] = [],
      network: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) network.push(request.url());
    });
    await page.route("**/*", (route) => route.abort());
    await page.setContent(
      await readFile(`docs/preview/wireframe.${audience}.html`, "utf8"),
    );
    await go(page, "account");
    assert.equal(
      await page
        .locator(".reward-symbol")
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      "rgb(238, 228, 233)",
      "Wine details must use a wine tint, never the fixed blue",
    );
    assert.equal(
      await page.locator("#offline-toolbar").count(),
      audience === "dev" ? 1 : 0,
    );
    await page.getByRole("button", { name: "Editar", exact: true }).click();
    for (const mode of ["Claro", "Escuro"]) {
      await page.getByRole("button", { name: mode, exact: true }).click();
      const colors = new Set<string>();
      for (const accent of ["Vinho", "Oliva", "Bege"]) {
        await page.getByRole("button", { name: accent, exact: true }).click();
        const surfaces = await page
          .locator(
            '.reward-symbol,.reward-options button[aria-pressed="true"],.compact-nav-track a[aria-current]',
          )
          .evaluateAll((elements) =>
            elements.map((el) => getComputedStyle(el).backgroundColor),
          );
        assert.equal(
          new Set(surfaces).size,
          1,
          `${audience}/${mode}/${accent}: details and active navigation share the selected tint`,
        );
        assert.notEqual(surfaces[0], "rgb(208, 216, 239)");
        colors.add(surfaces[0]);
      }
      assert.equal(
        colors.size,
        3,
        "Each accent changes the whole selected surface",
      );
    }
    await page.getByRole("button", { name: "Claro", exact: true }).click();
    await page
      .getByRole("button", { name: "Escolher personagem", exact: true })
      .click();
    await page.locator('[data-avatar-choice="lavanda"]').click();
    assert.equal(
      await page
        .locator('[data-avatar-choice="lavanda"]')
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.keyboard.press("Escape");
    await go(page, "notes");
    await page
      .getByRole("button", { name: "Nova anotação", exact: true })
      .click();
    await page.getByLabel("Título da anotação").fill("Minha nota pessoal");
    await page
      .getByLabel("Texto da anotação")
      .fill("Edição disponível para o usuário.");
    await page
      .getByRole("button", { name: "Salvar anotação", exact: true })
      .click();
    assert.equal(
      await page
        .locator(".note-card")
        .filter({ hasText: "Minha nota pessoal" })
        .count(),
      1,
    );
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const screen of ["home", "account", "notes", "ai"]) {
        await go(page, screen);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `${audience}/${screen}/${width}: no page overflow`,
        );
        assert.equal(
          await page.locator(".ai-flow-studio").count(),
          audience === "dev" && screen === "ai" ? 1 : 0,
        );
      }
      assert.equal(
        await page.evaluate(
          () =>
            getComputedStyle(document.documentElement)
              .getPropertyValue("--offline-bar-height")
              .trim() === "0px",
        ),
        audience === "usuario",
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('.sidebar a[href="#screen=account"]').first().click();
    await page.waitForFunction(
      () =>
        document.getElementById("offline-view")?.dataset.previewKey ===
        "screen=account",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(network, []);
    await page.close();
  }
  const dev = await browser.newPage({ reducedMotion: "reduce" });
  const devHtml = await readFile("docs/preview/wireframe.dev.html", "utf8");
  await dev.route("http://127.0.0.1:8788/preview", (route) =>
    route.fulfill({ contentType: "text/html", body: devHtml }),
  );
  await dev.goto("http://127.0.0.1:8788/preview");
  await dev.getByText("Configurações Dev", { exact: true }).click();
  const popupPromise = dev.waitForEvent("popup");
  await dev
    .getByRole("button", { name: "Abrir visão do usuário", exact: true })
    .click();
  const user = await popupPromise;
  user.setDefaultTimeout(4000);
  const popupErrors: string[] = [];
  user.on("pageerror", (error) => popupErrors.push(error.message));
  await user.locator(".home-zone").first().waitFor();
  assert.equal(await user.locator("#offline-toolbar").count(), 0);
  await go(user, "notes");
  await user
    .getByRole("button", { name: "Nova anotação", exact: true })
    .click();
  await user
    .getByLabel("Título da anotação")
    .fill("Nota preservada ao reativar");
  await user.getByLabel("Texto da anotação").fill("Meu conteúdo pessoal.");
  await user
    .getByRole("button", { name: "Salvar anotação", exact: true })
    .click();
  await user
    .getByRole("button", { name: "Nova anotação", exact: true })
    .click();
  await dev.locator('[data-dev-feature="notes"]').uncheck();
  await user.waitForFunction(
    () =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=home",
  );
  assert.equal(await user.locator("dialog[open]").count(), 0);
  assert.equal(
    await user
      .locator('a[href*="screen=notes"],[data-action="save-product"]')
      .count(),
    0,
  );
  await user.evaluate(() => {
    location.hash = "screen=notes";
  });
  await user.waitForTimeout(100);
  assert.equal(
    await user.locator("#offline-view").getAttribute("data-preview-key"),
    "screen=home",
  );
  await go(dev, "notes");
  assert.equal(
    await dev
      .getByRole("button", { name: "Nova anotação", exact: true })
      .isVisible(),
    true,
    "Dev retains full preview controls even when notes are disabled for users",
  );
  await dev.locator('[data-dev-feature="notes"]').check();
  await user.waitForFunction(
    () =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=notes",
  );
  assert.equal(
    await user
      .locator(".note-card")
      .filter({ hasText: "Nota preservada ao reativar" })
      .count(),
    1,
  );
  assert.equal(
    await user
      .getByRole("button", { name: "Nova anotação", exact: true })
      .isVisible(),
    true,
  );
  await dev.locator('[data-dev-feature="notes"]').uncheck();
  await user.waitForFunction(
    () =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=home",
  );
  const downloadPromise = dev.waitForEvent("download");
  await dev
    .getByRole("button", { name: "Baixar versão do usuário", exact: true })
    .click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "wireframe.usuario.html");
  const directory = await mkdtemp(join(tmpdir(), "members-preview-"));
  try {
    const path = join(directory, download.suggestedFilename());
    await download.saveAs(path);
    // This managed Chromium blocks file:// navigation. Load the exact saved
    // bytes into two fresh pages to verify an independent reopening instead.
    for (let attempt = 0; attempt < 2; attempt++) {
      const saved = await browser.newPage({ reducedMotion: "reduce" });
      await saved.setContent(await readFile(path, "utf8"));
      await saved.locator(".home-zone").first().waitFor();
      await saved.evaluate(() => {
        location.hash = "screen=notes";
      });
      await saved.waitForTimeout(100);
      assert.equal(
        await saved
          .locator('a[href*="screen=notes"],.ai-flow-studio,#offline-toolbar')
          .count(),
        0,
      );
      assert.equal(
        await saved.locator("#offline-view").getAttribute("data-preview-key"),
        "screen=home",
        "Downloaded configuration is retained when reopened without the Dev window",
      );
      await saved.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
  assert.deepEqual(popupErrors, []);
  await user.close();
  await dev.close();
  console.log(
    "Dev/user previews passed: developer controls separated; user notes, avatar, themes and navigation retained; all accent surfaces match in light/dark; four widths; zero JS errors/network.",
  );
} finally {
  await browser.close();
}
