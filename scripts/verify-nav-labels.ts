import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium, type Page } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
const errors: string[] = [],
  requests: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => requests.push(r.url()));
async function settled(selector: string, value: number) {
  await page.waitForFunction(
    ({ selector, value }) =>
      Math.abs(
        Number(
          document.querySelector<HTMLElement>(selector)?.dataset.labelProgress,
        ) - value,
      ) < 0.002,
    { selector, value },
  );
}
async function go(p: Page, screen: string) {
  await p.evaluate((s) => {
    location.hash = "screen=" + s;
  }, screen);
  await p.waitForFunction(
    (s) =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=" + s,
    screen,
  );
}
try {
  await page.route("**/*", (r) => r.abort());
  await page.setContent(await readFile("docs/preview/wireframe.html", "utf8"));
  await page.locator(".home-zone-a").waitFor();
  await page.locator('[data-action="compact-navigation"]').click();
  const home = '.compact-nav [data-nav-target="home"]',
    products = '.compact-nav [data-nav-target="products"]';
  await settled(home, 1);
  const old = await page.locator(home).elementHandle();
  assert.ok(old);
  await page.locator(products).click();
  await page.waitForFunction(
    () =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=products",
  );
  assert.equal(
    await old.evaluate((el) => el.isConnected),
    true,
    "Existing shell nodes must persist for exit animation",
  );
  await page.waitForFunction(
    ({ home, products }) => {
      const a = Number(
          document.querySelector<HTMLElement>(home)!.dataset.labelProgress,
        ),
        b = Number(
          document.querySelector<HTMLElement>(products)!.dataset.labelProgress,
        );
      return a > 0 && a < 0.99 && b > 0 && b < 0.99;
    },
    { home, products },
  );
  const width = await page
    .locator(products + " .nav-live-label")
    .evaluate((el) => el.getBoundingClientRect().width);
  assert.ok(width > 0, "Label animation must change width, not opacity alone");
  await settled(home, 0);
  await settled(products, 1);
  assert.equal(
    await page.locator(products).getAttribute("aria-current"),
    "page",
  );
  assert.equal(
    await page.locator(home + " .nav-live-label").getAttribute("aria-hidden"),
    "true",
  );
  await page
    .getByRole("button", { name: "Mostrar menu lateral", exact: true })
    .click();
  const sidebarProducts = '.sidebar [data-nav-target="products"]';
  assert.equal(
    await page
      .locator('.sidebar [data-nav-active="false"] .nav-live-label')
      .evaluateAll((es) =>
        es.every(
          (e) => e.clientWidth > 0 && Number(getComputedStyle(e).opacity) === 1,
        ),
      ),
    true,
  );
  const group = page.locator('.sidebar [data-nav-group="learn"]');
  await group.locator("summary").click();
  await settled(sidebarProducts, 0);
  await page.waitForFunction(
    () =>
      !document.querySelector<HTMLDetailsElement>(
        '.sidebar [data-nav-group="learn"]',
      )!.open,
  );
  await group.locator("summary").click();
  await settled(sidebarProducts, 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await go(page, "home");
  const bottomHome = '.bottom-nav a[href="#screen=home"]',
    bottomProducts = '.bottom-nav a[href="#screen=products"]';
  await settled(bottomHome, 1);
  await page.locator(bottomProducts).focus();
  await page.keyboard.press("Enter");
  await settled(bottomHome, 0);
  await settled(bottomProducts, 1);
  assert.equal(
    await page
      .locator(bottomProducts + " .nav-live-label")
      .evaluate((el) => el.clientWidth >= el.scrollWidth - 1),
    true,
    "Selected tab name must not be clipped after a viewport change",
  );
  assert.equal(
    await page.locator('.bottom-nav [data-nav-active="true"]').count(),
    1,
  );
  const targets = await page
    .locator(".bottom-nav a,.bottom-nav button")
    .evaluateAll((es) =>
      es.every((e) => {
        const b = e.getBoundingClientRect();
        return b.width >= 44 && b.height >= 44;
      }),
    );
  assert.equal(targets, true);
  await page.getByRole("button", { name: "Mais opções", exact: true }).click();
  await settled('.bottom-nav button[aria-label="Mais opções"]', 1);
  await page.keyboard.press("Escape");
  await settled('.bottom-nav button[aria-label="Mais opções"]', 0);
  await settled(bottomProducts, 1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator(bottomHome).click();
  await page.waitForFunction(
    () =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=home",
  );
  assert.equal(
    await page.locator(bottomHome).getAttribute("data-label-progress"),
    "1.000",
  );
  assert.equal(
    await page.locator(bottomProducts).getAttribute("data-label-progress"),
    "0.000",
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await go(page, "account");
    if (!(await page.locator("#appearance-options").isVisible()))
      await page.getByRole("button", { name: "Editar", exact: true }).click();
    await page
      .getByRole("button", { name: "Ícones no topo", exact: true })
      .click();
    assert.equal(
      await page
        .locator(".mobile-compact-nav a[aria-current] .nav-live-label")
        .evaluate((el) => {
          const label = el.getBoundingClientRect(),
            link = el.parentElement!.getBoundingClientRect();
          return label.left >= link.left && label.right <= link.right + 1;
        }),
      true,
      "Compact active label must stay inside its own link without overlapping the next icon",
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page
      .locator('.mobile-compact-nav [data-action="restore-navigation"]')
      .click();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  console.log(
    "Nav-label verification passed: persistent shell, width/scale enter and exit, group collapse, mobile tabs and More, keyboard, 44px targets, instant reduced-motion swap and compact containment.",
  );
} finally {
  await browser.close();
}
