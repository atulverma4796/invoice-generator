// Shared security primitives for the public API routes that send email.
//
// Why this exists: every public route that touches nodemailer is a
// potential spam relay. Without origin checks + rate limits + size caps
// + HTML escaping, an attacker can POST arbitrary `to`, `replyTo`,
// `senderName`, and `pdfBase64` fields and turn our Gmail account into
// a phishing/spam mule. Google suspends accounts for that, with no
// appeal path.
//
// Designed to be transport-agnostic — these utilities take a
// `Request`/`NextRequest` and return verdicts, without coupling to a
// particular response shape.

// ---- HTML escaping ---------------------------------------------------

/**
 * Escape user-supplied string for safe interpolation into an email HTML
 * body or subject. Email clients render HTML, so unescaped angle brackets
 * or quotes from `senderName`/`invoiceNumber` could inject arbitrary
 * markup, scripts (some clients), or styling into the message.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---- Filename sanitization -------------------------------------------

/**
 * Strip path separators, control characters, and shell-meaningful
 * punctuation from a user-supplied filename. Without this, an
 * `invoiceNumber` of "../../etc/passwd" or "..\\..\\config" would land
 * verbatim as the attachment filename, which some mail clients then
 * use unsafely on save.
 *
 * We also cap length to avoid breaking the MIME header.
 */
export function sanitizeFilename(
  raw: string,
  ext: string,
  maxLength = 100,
): string {
  const cleaned = String(raw)
    .replace(/[/\\?%*:|"<>\x00-\x1F\x7F]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\.+/, "")
    .trim();
  const base = (cleaned || "invoice").slice(0, maxLength);
  return ext.startsWith(".") ? `${base}${ext}` : `${base}.${ext}`;
}

// ---- Origin / Referer check ------------------------------------------

const DEFAULT_ALLOWED_HOSTS = [
  "freeinvoicegen.org",
  "www.freeinvoicegen.org",
  "localhost",
];

/**
 * Verify the request was initiated from a page we serve. Browsers
 * always send `Origin` on cross-origin POSTs and same-origin POSTs from
 * scripts; if neither `Origin` nor `Referer` matches our allowlist,
 * reject. Note this is NOT a security boundary on its own (curl can
 * forge headers), but combined with rate-limiting it stops the trivial
 * spam-relay automation.
 */
export function isAllowedOrigin(
  request: Request,
  allowedHosts: string[] = DEFAULT_ALLOWED_HOSTS,
): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const isHostAllowed = (urlString: string | null): boolean => {
    if (!urlString) return false;
    try {
      const u = new URL(urlString);
      return allowedHosts.includes(u.hostname);
    } catch {
      return false;
    }
  };
  if (isHostAllowed(origin)) return true;
  if (isHostAllowed(referer)) return true;
  return false;
}

// ---- Rate limiting ---------------------------------------------------

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

const buckets = new Map<string, Bucket>();
let lastSweepMs = 0;

function sweep(staleMs: number) {
  const now = Date.now();
  if (now - lastSweepMs < 60_000) return;
  lastSweepMs = now;
  for (const [k, b] of buckets) {
    if (now - b.lastRefillMs > staleMs) buckets.delete(k);
  }
}

/**
 * Extract a stable client identifier from request headers. On Vercel
 * `x-forwarded-for` is set by the edge and clients cannot forge it
 * (Vercel overwrites attacker-supplied values). On other hosts we also
 * accept `x-real-ip`. Falls back to `"unknown"` so a header strip
 * still gets rate-limited to one shared bucket rather than infinite.
 */
function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // Take the leftmost address only — that's the originating client
    // per the X-Forwarded-For convention.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export interface RateLimitConfig {
  capacity: number; // burst
  refillPerMinute: number; // sustained rate
}

/**
 * Token-bucket rate limit per (scope, IP). Defaults are tuned for
 * email-sending endpoints — generous enough that a human resending a
 * bounce never hits it, tight enough that a script can't relay through
 * us at meaningful volume.
 */
export function checkRateLimit(
  request: Request,
  scope: string,
  config: RateLimitConfig = { capacity: 5, refillPerMinute: 3 },
): RateLimitResult {
  sweep(15 * 60_000);
  const ip = getClientIp(request);
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const refillPerMs = config.refillPerMinute / 60_000;
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: config.capacity, lastRefillMs: now };
    buckets.set(key, bucket);
  } else {
    const elapsed = now - bucket.lastRefillMs;
    bucket.tokens = Math.min(
      config.capacity,
      bucket.tokens + elapsed * refillPerMs,
    );
    bucket.lastRefillMs = now;
  }
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { ok: true, retryAfterSeconds: 0 };
  }
  const deficit = 1 - bucket.tokens;
  const retryAfterMs = Math.ceil(deficit / refillPerMs);
  return { ok: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
}

// ---- Body size cap ---------------------------------------------------

/**
 * Approximate decoded size of a base64 string in bytes. Base64 encodes
 * 3 raw bytes per 4 characters; pad-aware sizing keeps the check tight.
 */
export function base64ByteSize(b64: string): number {
  if (!b64) return 0;
  const padCount = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padCount;
}
