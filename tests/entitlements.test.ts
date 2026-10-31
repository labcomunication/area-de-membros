import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveEntitlements,
  canAccessProduct,
} from "../src/domain/entitlements";
const mapping = { "offer-a": "basic", "offer-b": "extra", broken: "missing" };
const profiles = [
  { id: "basic", productIds: ["a", "b"] },
  { id: "extra", productIds: ["b", "c"] },
];
test("combines purchases and deduplicates products", () => {
  assert.deepEqual(
    resolveEntitlements(["offer-a", "offer-b", "offer-a"], mapping, profiles),
    ["a", "b", "c"],
  );
});
test("unknown, inherited keys and missing profiles grant nothing", () => {
  assert.deepEqual(
    resolveEntitlements(
      ["unknown", "broken", "toString", "__proto__"],
      mapping,
      profiles,
    ),
    [],
  );
});
test("access requires an exact owned product id", () => {
  assert.equal(canAccessProduct("a", ["a"]), true);
  for (const id of ["ab", "../a", "", "toString"])
    assert.equal(canAccessProduct(id, ["a"]), false);
});
