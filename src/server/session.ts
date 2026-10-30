export interface MemberSession {
  memberId: string;
  email: string;
  productIds: string[];
}
/** TODO Tech: verify signed, expiring session server-side before returning a member.
 * Never trust an arbitrary cookie. Future cookie: httpOnly, SameSite=Lax,
 * Secure in production. Magic links must be short-lived and single-use.
 * This adapter intentionally grants no access until real auth is implemented.
 */
export async function readVerifiedSession(): Promise<MemberSession | null> {
  return null;
}
