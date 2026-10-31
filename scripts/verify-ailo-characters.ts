import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const html = await readFile("docs/preview/wireframe.html", "utf8");
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors: string[] = [],
    requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.route("**/*", (route) => route.abort());
  await page.setContent(html);
  await page.evaluate(() => {
    location.hash = "screen=account";
  });
  await page.locator('[data-action="avatar-picker"]').click();
  assert.equal(
    await page.locator(".avatar-choice .character-screen").count(),
    15,
    "Every retained profile choice needs the new inset screen",
  );
  assert.deepEqual(
    await page
      .locator(
        ".avatar-choice > span:not(.character):not(.avatar-selected-mark)",
      )
      .allTextContents(),
    [
      "Adam",
      "Cherry",
      "Maria",
      "Theo",
      "Luna",
      "Cora",
      "Nina",
      "Bento",
      "Noa",
      "Maya",
      "Sol",
      "Aurora",
      "Mel",
      "Rosa",
      "Flora",
    ],
  );
  assert.equal(
    new Set(
      await page
        .locator(".avatar-choice .character-body")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("d"))),
    ).size,
    1,
    "All avatars belong to the selected reference family",
  );
  await page.getByRole("button", { name: "Theo", exact: true }).click();
  const markup = await page.evaluate(() => {
    const api = window.previewCharacters as typeof window.previewCharacters & {
      getAvatarMarkup(id?: string): string;
    };
    return {
      selected: api.getAvatarMarkup(),
      fallback: api.getAvatarMarkup("<img src=x onerror=alert(1)>"),
    };
  });
  assert.match(markup.selected, /data-character="brisa"/);
  assert.match(markup.fallback, /data-character="pistache"/);
  assert.doesNotMatch(markup.fallback, /onerror|<img/);
  await page.evaluate(() => {
    location.hash = "screen=ai";
  });
  await page.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().renderedFrames > 0,
  );
  const pixels = await page
    .locator(".mascot-volume-canvas")
    .evaluate((node) => {
      const source = node as HTMLCanvasElement,
        canvas = document.createElement("canvas");
      canvas.width = source.width;
      canvas.height = source.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(source, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height),
        colors = new Map<string, number>();
      let minX = canvas.width,
        maxX = 0,
        minY = canvas.height,
        maxY = 0;
      for (let y = 0; y < canvas.height; y++)
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (data[i + 3] !== 255) continue;
          if (
            data[i] > 245 &&
            data[i + 1] > 245 &&
            data[i + 2] > 245 &&
            x < canvas.width / 2
          ) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          } else if (!(
            data[i] > 245 &&
            data[i + 1] > 245 &&
            data[i + 2] > 245
          )) {
            const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
            colors.set(key, (colors.get(key) || 0) + 1);
          }
        }
      return {
        eyeRatio: (maxX - minX) / (maxY - minY),
        colors: [...colors.values()].sort((a, b) => b - a),
      };
    });
  assert.ok(
    pixels.eyeRatio > 0.95 && pixels.eyeRatio < 1.35,
    "Rendered default eyes are circular with a slightly curved base",
  );
  assert.ok(
    pixels.colors[1] > 1000,
    "Rendered screen is visibly distinct from the body",
  );
  const snapshot = await page.evaluate(
    () =>
      window.previewCharacters.volumeSnapshot() as ReturnType<
        typeof window.previewCharacters.volumeSnapshot
      > & { family: string; faceMaterial: string },
  );
  assert.equal(snapshot.family, "rounded-screen");
  assert.equal(snapshot.faceMaterial, "MeshBasicMaterial");
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  const fallback = await browser.newPage();
  await fallback.evaluate(() => {
    HTMLCanvasElement.prototype.getContext = function () {
      return null;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await fallback.setContent(html);
  await fallback.evaluate(() => {
    location.hash = "screen=ai";
  });
  await fallback
    .locator('[data-character-stage][data-volume="fallback"]')
    .waitFor();
  assert.equal(
    await fallback.locator(".character-play .character-screen").isVisible(),
    true,
  );
  console.log(
    "Reference family verified: 15 retained names, inset screens, round curved-base rendered eyes, safe avatar markup, unlit body/screen and static WebGL fallback; no requests/errors.",
  );
} finally {
  await browser.close();
}
