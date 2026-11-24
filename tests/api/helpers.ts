import { NextRequest } from "next/server";

let ipCounter = 0;
/** A fresh client IP per call so module-level rate-limit buckets never bleed between tests. */
export function freshIp(): string {
  ipCounter += 1;
  return `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter & 255}`;
}

export interface ReqOpts {
  origin?: string | null;
  referer?: string | null;
  ip?: string;
  headers?: Record<string, string>;
  /** raw string body; overrides json */
  raw?: string;
  json?: unknown;
  url?: string;
}

export function makeReq(path: string, opts: ReqOpts = {}): NextRequest {
  const headers = new Headers({ "content-type": "application/json" });
  const origin = opts.origin === undefined ? "https://freeinvoicegen.org" : opts.origin;
  if (origin !== null) headers.set("origin", origin);
  if (opts.referer) headers.set("referer", opts.referer);
  headers.set("x-forwarded-for", opts.ip ?? freshIp());
  for (const [k, v] of Object.entries(opts.headers ?? {})) headers.set(k, v);
  const body = opts.raw !== undefined ? opts.raw : JSON.stringify(opts.json ?? {});
  return new NextRequest(opts.url ?? `https://freeinvoicegen.org${path}`, {
    method: "POST",
    headers,
    body,
  });
}

/** Spoofed / lookalike origins that MUST be rejected. */
export const BAD_ORIGINS = [
  "https://freeinvoicegen.org.evil.com",
  "https://evil-freeinvoicegen.org",
  "https://freeinvoicegen.org@evil.com",
  "https://evil.com/freeinvoicegen.org",
  "https://evil.com?x=freeinvoicegen.org",
  "https://freeinvoicegen.com",
  "https://xfreeinvoicegen.org",
  "https://sub.freeinvoicegen.org.attacker.net",
  "null",
  "not a url",
  "javascript:alert(1)",
  "file:///etc/passwd",
];

export const GOOD_ORIGINS = [
  "https://freeinvoicegen.org",
  "https://www.freeinvoicegen.org",
  "http://localhost:3000",
];

export const XSS_PAYLOADS = [
  `<script>alert("x")</script>`,
  `"><img src=x onerror=alert(1)>`,
  `' OR '1'='1`,
  `Tom & Jerry <b>bold</b>`,
  `</div></td><a href="https://phish.example">click</a>`,
];
