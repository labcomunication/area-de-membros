import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const failures: string[] = [];
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.setContent(await readFile("docs/preview/wireframe.html", "utf8"));
  await page.evaluate(() => {
    location.hash = "screen=ai";
  });
  await page.locator(".flow-canvas").waitFor();
  const graph = page.locator("[data-flow-root]");
  await graph
    .getByRole("button", { name: "Excluir ideia", exact: true })
    .click();
  await graph.getByRole("button", { name: "Nova ideia", exact: true }).click();
  const replacement = graph.locator('.flow-node[data-kind="idea"]').last();
  if (
    !(await replacement.evaluate(
      (e) =>
        e.getBoundingClientRect().left >=
        e.closest(".flow-canvas")!.getBoundingClientRect().left,
    ))
  )
    failures.push(
      "Replacement idea created outside left edge after clearing all ideas",
    );
  await page.setViewportSize({ width: 1440, height: 1000 });
  const handle = graph.locator('[data-node-id="assistant"] [data-move]');
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 40,
    box.y + box.height / 2 + 20,
    { steps: 4 },
  );
  const x = await graph
    .locator('[data-node-id="assistant"]')
    .evaluate((e) => (e as HTMLElement).style.left);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.evaluate(
    ({ x, y }) =>
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 1,
          clientX: x,
          clientY: y,
          buttons: 0,
          bubbles: true,
        }),
      ),
    { x: box.x + box.width / 2 + 160, y: box.y + box.height / 2 + 80 },
  );
  if (
    (await graph
      .locator('[data-node-id="assistant"]')
      .evaluate((e) => (e as HTMLElement).style.left)) !== x
  )
    failures.push("Drag survives window blur and moves with no button pressed");
  await page.mouse.up();
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  console.log(
    "Flow review regressions passed: first replacement remains reachable; interrupted drag stops after window blur.",
  );
} finally {
  await browser.close();
}
