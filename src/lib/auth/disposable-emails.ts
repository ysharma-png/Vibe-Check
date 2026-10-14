/**
 * Disposable & Temporary Email Domain Blocklist
 * Blocks signups using temporary disposable inboxes to prevent bot fraud,
 * sybil attacks on brief postings, and rating manipulation.
 */

export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set<string>([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamailblock.com",
  "10minutemail.com",
  "10minutemail.net",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "sharklasers.com",
  "getairmail.com",
  "dispostable.com",
  "trashmail.com",
  "trashmail.net",
  "mytemp.email",
  "burnermail.io",
  "nada.ltd",
  "fakemailgenerator.com",
  "mohmal.com",
  "inboxkitten.com",
  "crazymailing.com",
  "dropmail.me",
]);

/**
 * Checks if an email address belongs to a known disposable email provider.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.trim().split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
