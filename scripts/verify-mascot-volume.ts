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
  // Read the rendered canvas: a lit material produces many opaque body colors,
  // while the intended matte silhouette has one color apart from antialiasing.
  const bodyPixels = async () =>
    p.locator(".mascot-volume-canvas").evaluate((node) => {
      const source = node as HTMLCanvasElement;
      const canvas = document.createElement("canvas");
      canvas.width = source.width;
      canvas.height = source.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(source, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const colors = new Map<string, number>();
      let solid = 0,
        white = 0;
      let eyeX = 0,
        eyeY = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 255) continue;
        if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245) {
          white++;
          eyeX += (i / 4) % canvas.width;
          eyeY += Math.floor(i / 4 / canvas.width);
        } else {
          solid++;
          const color = `${data[i]},${data[i + 1]},${data[i + 2]}`;
          colors.set(color, (colors.get(color) || 0) + 1);
        }
      }
      return {
        solid,
        white,
        uniform: Math.max(0, ...colors.values()) / solid,
        eyeCenter: [eyeX / white / canvas.width, eyeY / white / canvas.height],
      };
    });
  const firstPixels = await bodyPixels();
  const playerForGaze = p.locator(".character-play");
  const initialBox = (await playerForGaze.boundingBox())!;
  await p.mouse.move(initialBox.x - 60, initialBox.y + initialBox.height / 2);
  await p.waitForTimeout(650);
  const leftPixels = await bodyPixels();
  const leftPose = await snapshot();
  await p.mouse.move(
    initialBox.x + initialBox.width + 60,
    initialBox.y + initialBox.height / 2,
  );
  await p.waitForTimeout(650);
  const rightPixels = await bodyPixels();
  const rightPose = await snapshot();
  const dotfield = p.locator(".mascot-dotfield");
  const hasDotfield = (await dotfield.count()) === 1;
  const dotInk = () =>
    dotfield.evaluate((node) => {
      const canvas = node as HTMLCanvasElement;
      const data = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let ink = 0;
      for (let i = 3; i < data.length; i += 4) ink += data[i];
      return ink;
    });
  let trailBrightens = false,
    trailDecays = false;
  if (hasDotfield) {
    await p.mouse.move(0, 0);
    await p.waitForTimeout(1100);
    const baseline = await dotInk();
    const studioBox = (await p.locator(".ai-studio").boundingBox())!;
    await p.mouse.move(studioBox.x + 48, studioBox.y + 48);
    await p.waitForTimeout(70);
    const bright = await dotInk();
    await p.mouse.move(0, 0);
    await p.waitForTimeout(1150);
    const faded = await dotInk();
    trailBrightens = bright > baseline * 1.02;
    trailDecays = Math.abs(faded - baseline) < baseline * 0.01;
  }
  const reviewChecks = {
    uniformBodyPixels: firstPixels.uniform > 0.98,
    anchoredBodyPose:
      leftPose.bodyAngle.slice(0, 2).every((angle) => angle === 0) &&
      rightPose.bodyAngle.slice(0, 2).every((angle) => angle === 0),
    visibleSphericalGaze:
      rightPixels.eyeCenter[0] - leftPixels.eyeCenter[0] > 0.085,
    projectedEyeRoots: Boolean(
      leftPose.eyePositions &&
      rightPose.eyePositions &&
      rightPose.eyePositions[0][0] - leftPose.eyePositions[0][0] > 0.2 &&
      Math.abs(rightPose.eyePositions[0][2] - leftPose.eyePositions[0][2]) >
        0.04,
    ),
    dotfieldPresent: hasDotfield,
    trailBrightens,
    trailDecays,
  };
  console.log("Mascot rendered review checks:", reviewChecks);
  for (const [name, passed] of Object.entries(reviewChecks))
    assert.ok(passed, name);
  assert.equal(initial.bodyMaterial, "MeshBasicMaterial");
  assert.equal((await snapshot()).dotfield?.active, false);
  const quietFrames = (await snapshot()).dotfield?.renderedFrames;
  await p.waitForTimeout(160);
  assert.equal(
    (await snapshot()).dotfield?.renderedFrames,
    quietFrames,
    "Dotfield must stop rendering after its trail fades",
  );
  assert.equal(initial.renderer, "three-webgl");
  assert.ok(initial.depth > 0.5);
  assert.equal(initial.state, "idle");
  const player = p.getByRole("button", {
    name: "Brincar com personagem",
    exact: true,
  });
  await player.scrollIntoViewIfNeeded();
  const box = (await player.boundingBox())!;
  const heading = await p.locator(".ai-studio-copy h1").boundingBox();
  await player.hover();
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().scale > 1.02,
  );
  assert.deepEqual(
    await p.locator(".ai-studio-copy h1").boundingBox(),
    heading,
  );
  const before = (await snapshot()).eyeQuaternion;
  await p.mouse.move(box.x + box.width + 120, box.y + box.height / 2);
  await p.waitForFunction(
    (before) =>
      JSON.stringify(
        window.previewCharacters.volumeSnapshot().eyeQuaternion,
      ) !== JSON.stringify(before),
    before,
  );
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().gaze[0] > 0,
  );
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
  // A captured real pointer drag stays bounded and must suppress its click.
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width + 300, box.y - 150, { steps: 6 });
  await p.waitForTimeout(220);
  const dragged = await snapshot();
  assert.ok(Math.abs(dragged.position[0]) <= 0.071);
  assert.ok(Math.abs(dragged.position[1]) <= 0.061);
  await p.mouse.up();
  await p.waitForTimeout(180);
  assert.equal(
    (await snapshot()).state,
    "idle",
    "Dragging must not trigger happy",
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.mouse.move(0, 0);
  await p.mouse.move(box.x + box.width + 120, box.y);
  const reduced = await snapshot();
  assert.equal(reduced.scale, 1);
  assert.equal(reduced.motionActive, false);
  assert.equal(reduced.dotfield?.active, false);
  assert.equal(reduced.dotfield?.peak, 0);
  const reducedInk = await dotInk();
  const q = reduced.eyeQuaternion;
  await player.hover();
  assert.deepEqual((await snapshot()).eyeQuaternion, q);
  assert.equal((await snapshot()).scale, 1);
  assert.equal(
    await dotInk(),
    reducedInk,
    "Reduced motion keeps the dotfield static",
  );
  await player.press("Enter");
  await p.waitForFunction(
    () => window.previewCharacters.volumeSnapshot().state === "happy",
  );
  assert.equal((await snapshot()).motionActive, false);
  await p.evaluate(() => {
    location.hash = "screen=home";
  });
  await p.locator(".home-zone-a").waitFor();
  assert.equal(await p.locator(".mascot-volume-canvas").count(), 0);
  assert.equal(await p.locator(".mascot-dotfield").count(), 0);
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
    assert.ok(
      (await bodyPixels()).uniform > 0.98,
      `${name} body remains flat and uniform`,
    );
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
    "Mascot verification passed: six flat body silhouettes, spherical eye-root and rendered gaze movement, finite radial dot trail, hover spring, happy/nervous timing, bounded drag, reduced motion and disposal. Zero JS errors/network requests.",
  );
} finally {
  await b.close();
}
