import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
const errors: string[] = [],
  requests: string[] = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("request", (r) => requests.push(r.url()));
try {
  await p.route("**/*", (r) => r.abort());
  await p.setContent(await readFile("docs/preview/wireframe.html", "utf8"));
  await p.evaluate(() => {
    location.hash = "screen=ai";
  });
  await p.locator(".character-play").waitFor();
  assert.equal(
    await p.locator(".mascot-volume-canvas").count(),
    1,
    "Existing mascot mount must contain a real 3D canvas",
  );
  await p.waitForFunction(
    () =>
      document
        .querySelector("[data-character-stage]")
        ?.getAttribute("data-volume") === "ready",
  );
  const snapshot = () =>
    p.evaluate(() => window.previewCharacters.volumeSnapshot());
  const initial = await snapshot();
  assert.equal(initial.renderer, "three-webgl");
  assert.ok(initial.depth > 0.5);
  assert.equal(initial.state, "idle");
  const player = p.getByRole("button", {
    name: "Brincar com personagem",
    exact: true,
  });
  await player.scrollIntoViewIfNeeded();
  const box = (await player.boundingBox())!;
  const heading = await p.locator(".ai-studio h1").boundingBox();
  await player.hover();
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().scale > 1.02,
  );
  assert.deepEqual(await p.locator(".ai-studio h1").boundingBox(), heading);
  const before = (await snapshot()).eyeQuaternion;
  await p.mouse.move(box.x + box.width + 120, box.y + box.height / 2);
  await p.waitForFunction(
    (before) =>
      JSON.stringify(
        window.previewCharacters.volumeSnapshot().eyeQuaternion,
      ) !== JSON.stringify(before),
    before,
  );
  assert.ok((await snapshot()).gaze[0] > 0);
  await player.click();
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "happy",
    undefined,
    { timeout: 700 },
  );
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().squint < 0.2,
    undefined,
    { timeout: 500 },
  );
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "idle",
    undefined,
    { timeout: 800 },
  );
  // Send real rapid input without actionability frame waits between clicks.
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2, {
    clickCount: 3,
    delay: 15,
  });
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "nervous",
    undefined,
    { timeout: 700 },
  );
  assert.ok((await snapshot()).motionActive);
  const nervousPosition = (await snapshot()).position;
  await p.waitForFunction(
    (before) =>
      JSON.stringify(window.previewCharacters.volumeSnapshot().position) !==
      JSON.stringify(before),
    nervousPosition,
  );
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "idle",
    undefined,
    { timeout: 1700 },
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.mouse.move(0, 0);
  await p.mouse.move(box.x + box.width + 120, box.y);
  const reduced = await snapshot();
  assert.equal(reduced.scale, 1);
  assert.equal(reduced.motionActive, false);
  const q = reduced.eyeQuaternion;
  await player.hover();
  assert.deepEqual((await snapshot()).eyeQuaternion, q);
  assert.equal((await snapshot()).scale, 1);
  await player.click();
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "happy",
  );
  assert.equal((await snapshot()).motionActive, false);
  await p.evaluate(() => {
    location.hash = "screen=home";
  });
  await p.locator(".home-zone-a").waitFor();
  assert.equal(await p.locator(".mascot-volume-canvas").count(), 0);
  for (const name of ["Cherry", "Maria", "Theo", "Luna", "Cora"]) {
    await p.evaluate(() => {
      location.hash = "screen=account";
    });
    await p.locator('[data-action="avatar-picker"]').click();
    await p.getByRole("button", { name, exact: true }).click();
    await p.evaluate(() => {
      location.hash = "screen=ai";
    });
    await p.locator(".character-play").waitFor();
    await p.waitForFunction(
      () => window.previewCharacters.volumeSnapshot().renderedFrames > 0,
    );
    assert.equal((await snapshot()).renderer, "three-webgl");
    const pixels = await p
      .locator(".mascot-volume-canvas")
      .evaluate((canvas) => {
        const source = canvas as HTMLCanvasElement;
        const copy = document.createElement("canvas");
        copy.width = source.width;
        copy.height = source.height;
        const context = copy.getContext("2d")!;
        context.drawImage(source, 0, 0);
        const data = context.getImageData(0, 0, copy.width, copy.height).data;
        let solid = 0,
          white = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 200) solid++;
          if (
            data[i] > 245 &&
            data[i + 1] > 245 &&
            data[i + 2] > 245 &&
            data[i + 3] > 200
          )
            white++;
        }
        return { solid, white };
      });
    await p
      .locator(".mascot-volume-canvas")
      .screenshot({ path: "/tmp/mascot-" + name + ".png" });
    assert.ok(
      pixels.solid > 1000 && pixels.white > 50,
      `${name} must render its body and white eyes`,
    );
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  console.log(
    "3D mascot verification passed: all six shape families render body/eyes; real Three volume, lookAt tracking, hover spring, happy squint, rapid nervous/timeout, reduced motion and disposal. Zero JS errors/network requests.",
  );
} finally {
  await b.close();
}
