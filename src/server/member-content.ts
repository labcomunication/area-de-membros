import type { Product } from "../config/members";
import { canAccessProduct } from "../domain/entitlements";
type MemberProduct =
  | { kind: "missing" }
  | { kind: "locked"; product: Omit<Product, "modules"> }
  | { kind: "granted"; product: Product };
/** Server data selection: never return module assets without ownership. */
export function getMemberProduct(
  catalog: readonly Product[],
  id: string,
  entitlements: readonly string[],
): MemberProduct {
  const product = catalog.find((item) => item.id === id);
  if (!product) return { kind: "missing" };
  if (!canAccessProduct(id, entitlements))
    return {
      kind: "locked",
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        kind: product.kind,
        cover: product.cover,
      },
    };
  return { kind: "granted", product };
}
