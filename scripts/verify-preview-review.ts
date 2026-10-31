import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const failures: string[] = [],
  errors: string[] = [],
  requests: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => requests.push(r.url()));
const check = (ok: boolean, message: string) => {
  if (!ok) failures.push(message);
};
async function go(screen: string) {
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
  await page.route("**/*", (r) => r.abort());
  await page.setContent(await readFile("docs/preview/wireframe.html", "utf8"));
  await page.locator(".home-zone-a").waitFor();
  check(
    await page
      .locator('.sidebar [data-nav-active="false"] .nav-live-label')
      .evaluateAll((es) =>
        es.every(
          (e) =>
            e.clientWidth > 20 && Number(getComputedStyle(e).opacity) > 0.99,
        ),
      ),
    "Inactive sidebar labels must remain visible",
  );
  check(
    (await page.locator(".sidebar").boundingBox())!.width >= 260,
    "Sidebar modestly widened",
  );
  check(
    !(await page
      .locator(".desktop-topbar")
      .innerText()
      .then((t) => t.includes("Aprender faz parte de você."))),
    "Header phrase removed",
  );
  check(
    await page
      .locator(".story-item")
      .evaluateAll((es) =>
        es.every(
          (e) =>
            getComputedStyle(e).borderBottomWidth === "0px" &&
            getComputedStyle(e).boxShadow === "none",
        ),
      ),
    "No decorative block/border under story rows",
  );
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  await page.waitForFunction(
    () => document.documentElement.dataset.previewScrolled === "true",
  );
  check(
    await page
      .locator(".desktop-topbar")
      .evaluate((e) => getComputedStyle(e).backdropFilter.includes("blur")),
    "Scrolled header has frosted backdrop",
  );
  await go("offers");
  check(
    await page
      .locator(".offer-card .asset-placeholder.cover")
      .evaluateAll((es) =>
        es.every((e) => {
          const b = e.getBoundingClientRect();
          return Math.abs(b.width / b.height - 0.75) < 0.02;
        }),
      ),
    "Offer covers retain 3:4 portrait ratio",
  );
  await go("product");
  check(
    await page
      .locator(".tabs button")
      .evaluateAll((es) =>
        es.every(
          (e) => getComputedStyle(e).backgroundColor === "rgba(0, 0, 0, 0)",
        ),
      ),
    "Product tabs have no background fill",
  );
  await go("account");
  const edit = page.locator('[data-action="appearance"]');
  await edit.click();
  check(
    (await edit.textContent()) === "Fechar",
    "Open appearance toggle says Fechar",
  );
  check(
    await edit.evaluate(
      (e) =>
        getComputedStyle(e).backgroundColor !== "rgba(0, 0, 0, 0)" &&
        getComputedStyle(e).backgroundColor !== "rgb(255, 255, 255)",
    ),
    "Open appearance toggle uses selected accent",
  );
  await page.keyboard.press("Escape");
  check(
    (await edit.textContent()) === "Editar" &&
      (await edit.getAttribute("aria-expanded")) === "false",
    "Escape restores Editar and closed state",
  );
  check(
    (await page.locator("[data-reward-choice]").count()) === 3,
    "Three selectable profile adornments",
  );
  check(
    !(await page
      .locator(".rewards-section")
      .innerText()
      .then(
        (t) =>
          t.includes("Experimente uma coroa") ||
          t.includes("Nenhuma conquista foi concedida"),
      )),
    "Requested crown helper texts removed",
  );
  if (await page.locator('[data-reward-choice="medal"]').count()) {
    await page.locator('[data-reward-choice="medal"]').click();
    check(
      (await page.locator('.avatar.large [data-reward="medal"]').count()) === 1,
      "Selected medal appears on profile",
    );
    await go("home");
    check(
      (await page
        .locator('.desktop-topbar .avatar [data-reward="medal"]')
        .count()) === 1,
      "Adornment survives route changes",
    );
  }
  await go("ai");
  check(
    (await page.locator(".ai-studio .ai-studio-copy").count()) === 0,
    "Supporting AI copy sits outside mascot box",
  );
  check(
    await page
      .locator(".ai-studio-copy h1")
      .evaluate(
        (e) =>
          !e.querySelector("br") &&
          e.clientHeight <= parseFloat(getComputedStyle(e).lineHeight) * 1.1,
      ),
    "AI title fits one line on desktop",
  );
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 700 });
    for (const screen of ["home", "offers", "account", "ai"]) {
      await go(screen);
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `No document overflow ${screen} ${width}`,
      );
    }
  }
  await page.setViewportSize({ width: 1440, height: 600 });
  await go("home");
  check(
    await page
      .locator(".sidebar nav")
      .evaluate((e) => e.scrollWidth <= e.clientWidth),
    "Sidebar has no horizontal content overflow",
  );
  const last = page.locator(".sidebar nav a").last();
  await last.focus();
  check(
    await last.evaluate((e) => {
      const b = e.getBoundingClientRect(),
        p = e.closest("nav")!.getBoundingClientRect();
      return b.top >= p.top - 1 && b.bottom <= p.bottom + 1;
    }),
    "Last nav item reachable by focus in short window",
  );
  for (const [width, height] of [
    [1024, 320],
    [1440, 360],
  ]) {
    await page.setViewportSize({ width, height });
    await go("home");
    for (const link of await page
      .locator(".sidebar nav a, .sidebar-bottom a")
      .all()) {
      await link.focus();
      check(
        await link.evaluate((el) => {
          const target = el.getBoundingClientRect(),
            shell = el.closest(".sidebar")!.getBoundingClientRect();
          if (!(
            target.top >= shell.top &&
            target.bottom <= shell.bottom &&
            target.top >= 0 &&
            target.bottom <= innerHeight
          ))
            return false;
          for (
            let ancestor = el.parentElement;
            ancestor && ancestor !== document.body;
            ancestor = ancestor.parentElement
          ) {
            if (
              ["auto", "scroll", "hidden", "clip"].includes(
                getComputedStyle(ancestor).overflowY,
              )
            ) {
              const top =
                ancestor.getBoundingClientRect().top + ancestor.clientTop;
              if (
                target.top < top - 1 ||
                target.bottom > top + ancestor.clientHeight + 1
              )
                return false;
            }
          }
          return true;
        }),
        `Whole sidebar target reachable by focus at ${width}x${height}: ${(await link.getAttribute("aria-label")) || (await link.innerText())}`,
      );
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  assert.deepEqual(failures, []);
  console.log(
    "Preview review passed: sidebar visibility/reachability, cover ratio, clean story/tabs, frosted header, Edit/Close, selectable rewards, AI copy/title and responsive containment. Zero errors/network.",
  );
} finally {
  await browser.close();
}
