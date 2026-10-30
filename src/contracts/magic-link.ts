export interface MagicLinkRequest {
  email: string;
}
export interface MagicLinkTokenClaims {
  subject: string;
  expiresAt: number;
  nonce: string;
}
// TODO: neutral responses, rate limits, provider, hashed one-use tokens and TTL.
// No token generation, mail delivery, cookie issuance or external calls here.
