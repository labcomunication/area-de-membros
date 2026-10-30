/** TODO: implement PurchaseApprovedPayload after Tech review. No parsing,
 * logging, signature claims, external registration, DB writes or access grants. */
export async function POST() {
  return Response.json(
    { error: "not_implemented" },
    { status: 501, headers: { "Cache-Control": "no-store" } },
  );
}
