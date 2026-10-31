import assert from "node:assert/strict";
import test from "node:test";
import { getMemberProduct } from "../src/server/member-content";
import type { Product } from "../src/config/members";
const product: Product = {
  id: "a",
  title: "A",
  description: "A",
  kind: "principal",
  cover: { slot: "cover", url: null },
  modules: [
    {
      id: "m",
      title: "Module",
      type: "pdf",
      asset: { slot: "pdf", url: "https://example.test/private.pdf" },
    },
  ],
};
test("server product selection withholds all modules from a member without entitlement", () => {
  const result = getMemberProduct([product], "a", ["b"]);
  assert.equal(result.kind, "locked");
  if (result.kind !== "locked") throw Error("Expected denied product");
  assert.equal("modules" in result.product, false);
  assert.equal(JSON.stringify(result).includes("private.pdf"), false);
});
test("server product selection grants only an exact owned ID and rejects missing IDs", () => {
  assert.deepEqual(getMemberProduct([product], "../a", ["a"]), {
    kind: "missing",
  });
  const result = getMemberProduct([product], "a", ["a"]);
  assert.equal(result.kind, "granted");
  if (result.kind === "granted")
    assert.equal(
      result.product.modules[0].asset.url,
      "https://example.test/private.pdf",
    );
});
