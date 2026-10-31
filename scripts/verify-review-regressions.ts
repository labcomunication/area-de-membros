import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const failures: string[] = [];
try {
  await p.setContent(await readFile("docs/preview/wireframe.html", "utf8"));
  await p.evaluate(() => {
    location.hash = "screen=offers";
  });
  await p.locator(".offer-track").waitFor();
  const bottoms = await p
    .locator(".offer-footer")
    .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().bottom));
  if (Math.max(...bottoms) - Math.min(...bottoms) > 1)
    failures.push("Mobile offer footer alignment");
  const toggle = p.locator(".offer-description-toggle").last();
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  const description = toggle.locator("..").locator("p");
  if (await description.evaluate((e) => e.clientHeight < e.scrollHeight - 1))
    failures.push("Expanded description remains visually clamped");
  await p.evaluate(() => {
    location.hash = "screen=account";
  });
  await p.locator(".personalization-card").waitFor();
  await p.getByRole("button", { name: "Editar", exact: true }).click();
  await p.getByRole("button", { name: "Ícones no topo", exact: true }).click();
  for (const width of [390, 320]) {
    await p.setViewportSize({ width, height: 844 });
    if (
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    )
      failures.push("Compact navigation horizontal overflow at " + width);
  }
  assert.deepEqual(failures, []);
  console.log(
    "Review regressions passed: real expanded content, mobile footer alignment, compact width containment.",
  );
} finally {
  await b.close();
}
