import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const failures: string[] = [],
  errors: string[] = [],
  requests: string[] = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("request", (r) => requests.push(r.url()));
const check = (ok: boolean, msg: string) => {
  if (!ok) failures.push(msg);
};
async function go(screen: string) {
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
  await p.route("**/*", (r) => r.abort());
  await p.setContent(await readFile("docs/preview/wireframe.html", "utf8"));
  await p.locator(".home-zone-a").waitFor();
  await p.evaluate(() => document.fonts.ready);
  check(
    await p.evaluate(
      () =>
        [...document.fonts].some(
          (face) =>
            face.family.includes("Noto Sans") && face.status === "loaded",
        ) &&
        document.fonts.check('16px "Noto Sans"') &&
        getComputedStyle(document.body).fontFamily.includes("Noto Sans"),
    ),
    "Real offline Noto Sans loaded and used",
  );
  await go("account");
  check(
    await p
      .locator(
        ".account-panel,.activity-panel,.personalization-card,.reward-card,.avatar-picker-panel",
      )
      .evaluateAll((es) =>
        es.every((e) => getComputedStyle(e).borderTopWidth === "0px"),
      ),
    "Decorative account box borders removed",
  );
  check(
    await p
      .locator(".account-panel")
      .evaluate((e) => parseFloat(getComputedStyle(e).borderRadius) >= 20),
    "Soft consistent box corners",
  );
  await go("bonus");
  const cards = p.locator(".recommendation-card");
  check(
    (await cards.count()) === 5,
    "Recommendation cards use selected overlay design",
  );
  if (await cards.count()) {
    check(
      await cards.evaluateAll((es) =>
        es.every((e) => {
          const card = e.getBoundingClientRect(),
            image = e
              .querySelector(".recommendation-media")!
              .getBoundingClientRect(),
            sheet = e
              .querySelector(".recommendation-sheet")!
              .getBoundingClientRect();
          return (
            image.width >= card.width * 0.95 &&
            image.height >= card.height * 0.7 &&
            sheet.top > card.top + 100 &&
            sheet.bottom <= card.bottom + 1
          );
        }),
      ),
      "Covers fill card behind lower inset information sheet",
    );
    check(
      (await cards.locator("button.buy:enabled").count()) === 0,
      "New overlay never enables checkout",
    );
  }
  await go("ai");
  check(
    (await p.locator(".ai-flow-studio").count()) === 1,
    "Dedicated idea graph between mascot and headline",
  );
  if (await p.locator(".ai-flow-studio").count())
    check(
      await p.locator(".ai-flow-studio").evaluate((el) => {
        const stage = document.querySelector(".ai-studio")!,
          copy = document.querySelector(".ai-studio-copy")!;
        return (
          Boolean(
            stage.compareDocumentPosition(el) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ) &&
          Boolean(
            el.compareDocumentPosition(copy) & Node.DOCUMENT_POSITION_FOLLOWING,
          )
        );
      }),
      "Graph follows mascot and precedes headline",
    );
  check(
    await p
      .locator(".ai-studio-copy h1")
      .evaluate((e) => getComputedStyle(e).fontFamily.includes("Noto Sans")),
    "Studio heading also uses Noto Sans",
  );
  for (const width of [1440, 768, 390, 320]) {
    await p.setViewportSize({ width, height: 900 });
    for (const screen of ["home", "bonus", "account", "notes", "ai"]) {
      await go(screen);
      if (screen === "ai")
        check(
          await p.locator(".ai-flow-studio").evaluate((section) => {
            const box = section.getBoundingClientRect();
            const selectors = [
              ".flow-heading",
              ".flow-toolbar",
              ".flow-help",
              ".flow-viewport",
              ".flow-connections",
              ".flow-status",
            ];
            return selectors.every((selector) => {
              const child = section.querySelector(selector);
              if (!child) return false;
              const bounds = child.getBoundingClientRect();
              return (
                bounds.left >= box.left + 15 && bounds.right <= box.right - 15
              );
            });
          }),
          `Idea section preserves both side gutters ${width}`,
        );
      check(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `No document overflow ${screen}/${width}`,
      );
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  assert.deepEqual(failures, []);
  console.log(
    "Studio refinement passed: offline font, borderless surfaces/corners, large-cover overlay recommendations, inert checkout, node placement and responsive layouts. Zero JS errors/network.",
  );
} finally {
  await b.close();
}
