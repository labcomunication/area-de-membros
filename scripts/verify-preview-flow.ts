import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium, type Page } from "@playwright/test";

const html = await readFile(
  process.env.PREVIEW_HTML ?? "docs/preview/wireframe.html",
  "utf8",
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
async function go(page: Page, screen: string) {
  await page.evaluate((screen) => {
    location.hash = "screen=" + screen;
  }, screen);
  await page.waitForFunction(
    (screen) =>
      document.getElementById("offline-view")?.dataset.previewKey ===
      "screen=" + screen,
    screen,
  );
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors: string[] = [],
    network: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) network.push(request.url());
  });
  await page.route("**/*", (route) => route.abort());
  await page.setContent(html);
  await go(page, "ai");
  assert.equal(
    await page.locator("[data-flow-root] .flow-canvas").count(),
    1,
    "AI screen must contain the interactive idea graph",
  );
  const root = page.locator("[data-flow-root]");
  assert.equal(await root.locator(".flow-node").count(), 3);
  assert.equal(
    await root
      .getByRole("button", { name: "Gerar PDF · em breve", exact: true })
      .isDisabled(),
    true,
  );
  await root.getByRole("button", { name: "Nova ideia", exact: true }).click();
  const created = root.locator('.flow-node[data-kind="idea"]').last();
  const id = await created.getAttribute("data-node-id");
  const unsafe = '<img src=x onerror="window.flowXss=true">';
  await created.getByRole("textbox").fill(unsafe);
  await created.getByRole("textbox").blur();
  assert.equal(await created.getByRole("textbox").inputValue(), unsafe);
  assert.equal(await created.locator("img").count(), 0);
  const move = created.getByRole("button", { name: /^Mover ideia/ });
  const before = await created.evaluate((el) =>
    parseFloat((el as HTMLElement).style.left),
  );
  await move.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await created.evaluate((el) => parseFloat((el as HTMLElement).style.left)),
    before + 16,
  );
  await root.locator(".flow-connections summary").click();
  await root.getByLabel("Origem da conexão", { exact: true }).selectOption(id!);
  await root
    .getByLabel("Destino da conexão", { exact: true })
    .selectOption("assistant");
  await root
    .getByRole("button", { name: "Criar conexão", exact: true })
    .click();
  assert.equal(
    await root.locator(`path[data-from="${id}"][data-to="assistant"]`).count(),
    1,
  );
  await root
    .getByRole("button", { name: "Criar conexão", exact: true })
    .click();
  assert.equal(
    await root.locator(`path[data-from="${id}"][data-to="assistant"]`).count(),
    1,
    "Duplicate connections must be rejected",
  );
  await root
    .getByLabel("Origem da conexão", { exact: true })
    .selectOption("assistant");
  await root
    .getByLabel("Destino da conexão", { exact: true })
    .selectOption("assistant");
  await root
    .getByRole("button", { name: "Criar conexão", exact: true })
    .click();
  assert.equal(
    await root
      .locator('path[data-from="assistant"][data-to="assistant"]')
      .count(),
    0,
  );
  await root.locator(`[data-edge-from="${id}"]`).click();
  assert.equal(await root.locator(`path[data-from="${id}"]`).count(), 0);
  const output = created.getByRole("button", { name: /^Saída de ideia/ });
  const input = root.getByRole("button", {
    name: "Entrada da IA",
    exact: true,
  });
  await output.scrollIntoViewIfNeeded();
  await output.focus();
  await page.keyboard.press("Enter");
  await input.focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await root.locator(`path[data-from="${id}"]`).count(),
    1,
    "Keyboard ports must create real edges",
  );
  await go(page, "home");
  await go(page, "ai");
  assert.equal(
    await root.locator(`[data-node-id="${id}"] textarea`).inputValue(),
    unsafe,
    "Route navigation must retain local state",
  );
  await root
    .locator(`[data-node-id="${id}"]`)
    .getByRole("button", { name: "Excluir ideia", exact: true })
    .click();
  assert.equal(
    await root.locator(`path[data-from="${id}"]`).count(),
    0,
    "Deleting a node must remove its edges",
  );
  await root.locator(".flow-connections summary").click();
  await root.locator('[data-edge-from="idea-example"]').click();
  const example = root.locator('[data-node-id="idea-example"]');
  const examplePort = example.locator('[data-port="out"]');
  await examplePort.scrollIntoViewIfNeeded();
  const origin = (await examplePort.boundingBox())!;
  const destination = (await input.boundingBox())!;
  await page.mouse.move(
    origin.x + origin.width / 2,
    origin.y + origin.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    destination.x + destination.width / 2,
    destination.y + destination.height / 2,
    { steps: 10 },
  );
  assert.equal(await root.locator(".flow-edge-preview").count(), 1);
  await page.mouse.up();
  assert.equal(
    await root
      .locator('path[data-from="idea-example"][data-to="assistant"]')
      .count(),
    1,
    "Dragging between ports creates a connection",
  );
  await page.mouse.move(
    origin.x + origin.width / 2,
    origin.y + origin.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    destination.x + destination.width / 2,
    destination.y + destination.height / 2,
    { steps: 5 },
  );
  await page.mouse.up();
  assert.equal(
    await root
      .locator('path[data-from="idea-example"][data-to="assistant"]')
      .count(),
    1,
  );
  assert.equal(
    await root.locator(".flow-edge-preview").count(),
    0,
    "Rejected duplicate drag must clear its temporary connection",
  );
  const handle = example.locator("[data-move]");
  await handle.scrollIntoViewIfNeeded();
  const handleBox = (await handle.boundingBox())!;
  const originalX = await example.evaluate((el) =>
    parseFloat((el as HTMLElement).style.left),
  );
  await page.mouse.move(handleBox.x + 50, handleBox.y + 20);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + 80, handleBox.y + 40, { steps: 5 });
  await page.mouse.up();
  assert.equal(
    await example.evaluate((el) => parseFloat((el as HTMLElement).style.left)),
    originalX + 30,
    "Pointer drag moves nodes",
  );
  const imageInput = root.locator('input[type="file"]');
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN3sAAAAASUVORK5CYII=",
    "base64",
  );
  await imageInput.setInputFiles({
    name: "reference.png",
    mimeType: "image/png",
    buffer: png,
  });
  await root.locator('.flow-node[data-kind="image"] img').waitFor();
  assert.equal(
    await root
      .locator('.flow-node[data-kind="image"] img')
      .evaluate((el) => (el as HTMLImageElement).naturalWidth > 0),
    true,
  );
  const blobUrl = await root
    .locator('.flow-node[data-kind="image"] img')
    .getAttribute("src");
  await go(page, "home");
  await go(page, "ai");
  assert.equal(
    await root.locator('.flow-node[data-kind="image"] img').getAttribute("src"),
    blobUrl,
  );
  await root
    .getByRole("button", { name: "Excluir referência", exact: true })
    .click();
  const revoked = await page.evaluate(async (url) => {
    try {
      await fetch(url!);
      return false;
    } catch {
      return true;
    }
  }, blobUrl);
  assert.equal(revoked, true, "Removing an image must revoke its object URL");
  await imageInput.setInputFiles({
    name: "bad.png",
    mimeType: "image/png",
    buffer: Buffer.from("invalid image"),
  });
  await page.waitForFunction(() =>
    document
      .querySelector(".flow-status")
      ?.textContent?.includes("decodificar"),
  );
  assert.equal(await root.locator('.flow-node[data-kind="image"]').count(), 0);
  const supersededUrl = await page.evaluate(
    (bytes) => {
      const input = document.querySelector<HTMLInputElement>(
        '[data-flow-root] input[type="file"]',
      )!;
      const original = URL.createObjectURL.bind(URL);
      const created: string[] = [];
      URL.createObjectURL = (object) => {
        const url = original(object);
        created.push(url);
        return url;
      };
      try {
        const good = new DataTransfer();
        good.items.add(
          new File([new Uint8Array(bytes)], "old.png", { type: "image/png" }),
        );
        input.files = good.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        const bad = new DataTransfer();
        bad.items.add(new File(["invalid"], "new.png", { type: "image/png" }));
        input.files = bad.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } finally {
        URL.createObjectURL = original;
      }
      return created[0];
    },
    [...png],
  );
  await page.waitForFunction(() =>
    document
      .querySelector(".flow-status")
      ?.textContent?.includes("decodificar"),
  );
  assert.equal(
    await root.locator('.flow-node[data-kind="image"]').count(),
    0,
    "An old image decode must not overwrite a newer selection",
  );
  assert.equal(
    await page.evaluate(async (url) => {
      try {
        await fetch(url);
        return false;
      } catch {
        return true;
      }
    }, supersededUrl),
    true,
    "A superseded image URL must be revoked",
  );
  await imageInput.setInputFiles({
    name: "vector.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await page.waitForFunction(() =>
    document
      .querySelector(".flow-status")
      ?.textContent?.includes("PNG, JPEG ou WebP"),
  );
  await imageInput.setInputFiles({
    name: "large.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await page.waitForFunction(() =>
    document.querySelector(".flow-status")?.textContent?.includes("5 MB"),
  );
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `No whole-page overflow at ${width}px`,
    );
    const box = await root.locator(".flow-viewport").boundingBox();
    assert.ok(box && box.width <= width && box.width > 100);
  }
  await imageInput.setInputFiles({
    name: "unload.png",
    mimeType: "image/png",
    buffer: png,
  });
  await root.locator('.flow-node[data-kind="image"] img').waitFor();
  const unloadUrl = await root
    .locator('.flow-node[data-kind="image"] img')
    .getAttribute("src");
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent("pagehide", { persisted: false }),
    ),
  );
  assert.equal(
    await page.evaluate(async (url) => {
      try {
        await fetch(url!);
        return false;
      } catch {
        return true;
      }
    }, unloadUrl),
    true,
    "Leaving the document must revoke image URLs",
  );
  const touch = await browser.newPage({
    viewport: { width: 390, height: 900 },
    hasTouch: true,
  });
  touch.on("pageerror", (error) => errors.push(error.message));
  touch.on("request", (request) => {
    if (/^https?:/.test(request.url())) network.push(request.url());
  });
  await touch.route("**/*", (route) => route.abort());
  await touch.setContent(html);
  await go(touch, "ai");
  const touchRoot = touch.locator("[data-flow-root]");
  await touchRoot
    .getByRole("button", { name: "Nova ideia", exact: true })
    .tap();
  assert.equal(
    await touchRoot.locator('.flow-node[data-kind="idea"]').count(),
    2,
  );
  const touchIdea = touchRoot.locator('[data-node-id="idea-example"]');
  const touchHandle = touchIdea.locator("[data-move]");
  await touchHandle.scrollIntoViewIfNeeded();
  const touchBox = (await touchHandle.boundingBox())!;
  const touchX = await touchIdea.evaluate((el) =>
    parseFloat((el as HTMLElement).style.left),
  );
  const cdp = await touch.context().newCDPSession(touch);
  const point = {
    x: Math.round(touchBox.x + 45),
    y: Math.round(touchBox.y + 21),
  };
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: point.x + 30, y: point.y + 25 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  assert.equal(
    await touchIdea.evaluate((el) =>
      parseFloat((el as HTMLElement).style.left),
    ),
    touchX + 30,
    "Touch drag moves a node without moving the whole page",
  );
  await touch.close();
  assert.deepEqual(network, [], "Graph must make no network requests");
  assert.deepEqual(errors, []);
  console.log(
    "Interactive idea graph: CRUD, ports, keyboard, safe text, local images, state and responsive containment passed.",
  );
} finally {
  await browser.close();
}
