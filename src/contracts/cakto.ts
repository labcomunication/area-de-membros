/** Provisional contract: reconcile with Alisson's ADR-001 and actual payload
 * before wiring. This is NOT signature validation or an active integration. */
export interface PurchaseApprovedPayload {
  event: "purchase_approved";
  data: {
    id: string;
    customer: { id: string; email: string };
    offer: { id: string };
  };
}
// TODO: raw-body signature verification, idempotency on data.id, atomic grants,
// and handling of refunds/revocations require a separate backend implementation.
