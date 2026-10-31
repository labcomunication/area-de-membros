import assert from "node:assert/strict";
import test from "node:test";
import { readVerifiedSession } from "../src/server/session";
import { POST as magic } from "../src/app/api/auth/magic-link/route";
import { POST as webhook } from "../src/app/api/webhooks/cakto/route";
test("session adapter denies access before real auth exists", async () => {
  assert.equal(await readVerifiedSession(), null);
});
test("both integration stubs refuse operation without external calls", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw Error("External calls forbidden");
  };
  try {
    for (const handler of [magic, webhook]) {
      const result = await handler();
      assert.equal(result.status, 501);
      assert.deepEqual(await result.json(), { error: "not_implemented" });
      assert.equal(result.headers.get("set-cookie"), null);
    }
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
  }
});
