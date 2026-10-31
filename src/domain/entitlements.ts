export interface AccessProfile {
  id: string;
  productIds: string[];
}
/** Fail closed: only own offer mappings and declared profiles grant access. */
export function resolveEntitlements(
  offerIds: readonly string[],
  offerProfiles: Readonly<Record<string, string>>,
  profiles: readonly AccessProfile[],
): string[] {
  const ids = new Set<string>();
  for (const offer of offerIds) {
    if (!Object.hasOwn(offerProfiles, offer)) continue;
    const profile = profiles.find((p) => p.id === offerProfiles[offer]);
    for (const id of profile?.productIds ?? []) ids.add(id);
  }
  return [...ids];
}
export function canAccessProduct(
  productId: string,
  entitlementIds: readonly string[],
): boolean {
  return entitlementIds.includes(productId);
}
