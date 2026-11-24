import { describe, it, expect, vi, afterEach } from "vitest";
import {
  base64ByteSize,
  checkRateLimit,
  escapeHtml,
  isAllowedOrigin,
  sanitizeFilename,
  toHeaderSafe,
} from "@/lib/api-security";
import { BAD_ORIGINS, GOOD_ORIGINS, freshIp } from "./helpers";

const req = (h: Record<string, string>) => new Request("https://freeinvoicegen.org/api/x", { method: "POST", headers: h });

afterEach(() => {
  vi.useRealTimers();
});

describe("escapeHtml", () => {
  it.each([
    ["<script>", "&lt;script&gt;"],
    [`"q"`, "&quot;q&quot;"],
    ["'a'", "&#39;a&#39;"],
    ["a & b", "a &amp; b"],
    ["&lt;", "&amp;lt;"], // double-escape is intentional: input is raw text
    ["plain", "plain"],
    ["", ""],
    ["हिन्दी 日本語 émoji 🎉", "हिन्दी 日本語 émoji 🎉"],
  ])("%j -> %j", (input, out) => {
    expect(escapeHtml(input)).toBe(out);
  });

  it("handles null/undefined/numbers/objects", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(0)).toBe("0");
    expect(escapeHtml(12.5)).toBe("12.5");
    expect(escapeHtml({ toString: () => "<x>" })).toBe("&lt;x&gt;");
  });

  it("output never contains raw < > \" '", () => {
    const nasty = `<a href="x" onclick='y'>&</a>`.repeat(50);
    expect(escapeHtml(nasty)).not.toMatch(/[<>"']/);
  });
});

describe("toHeaderSafe", () => {
  it.each([
    ["Acme\r\nBcc: victim@x.com", "Acme Bcc: victim@x.com"],
    ["Acme\nX", "Acme X"],
    ["A\tB", "A B"],
    ["A\u0000B", "A B"],
    ["A\u2028B\u2029C", "A B C"],
    ["  spaced   out  ", "spaced out"],
    ["normal", "normal"],
  ])("%j -> %j", (input, out) => {
    expect(toHeaderSafe(input)).toBe(out);
  });
  it("null/undefined -> empty", () => {
    expect(toHeaderSafe(null)).toBe("");
    expect(toHeaderSafe(undefined)).toBe("");
  });
});

describe("sanitizeFilename", () => {
  it.each([
    ["INV-001", "INV-001.pdf"],
    ["../../etc/passwd", "____etc_passwd.pdf"],
    ["..\\..\\config", "____config.pdf"],
    ["a/b\\c:d*e?f\"g<h>i|j", "a_b_c_d_e_f_g_h_i_j.pdf"],
    ["...hidden", "_.hidden.pdf"],
    ["", "invoice.pdf"],
    ["   ", "invoice.pdf"],
    ["inv\r\n001", "inv__001.pdf"],
    ["100%", "100_.pdf"],
  ])("%j -> %j", (input, out) => {
    expect(sanitizeFilename(input, "pdf")).toBe(out);
  });

  it("never yields a path separator, '..' or control char", () => {
    const evil = ["../x", "..\\x", "a/../../b", "\u0000\u001f", "./.././", "....//....//"];
    for (const e of evil) {
      const f = sanitizeFilename(e, "pdf");
      expect(f).not.toMatch(/[/\\\x00-\x1F]/);
      expect(f.replace(/\.pdf$/, "")).not.toContain("..");
      expect(f.startsWith(".")).toBe(false);
    }
  });

  it("accepts ext with or without dot", () => {
    expect(sanitizeFilename("a", ".pdf")).toBe("a.pdf");
    expect(sanitizeFilename("a", "pdf")).toBe("a.pdf");
  });

  it("caps base length (default 100) but keeps extension", () => {
    const f = sanitizeFilename("x".repeat(500), "pdf");
    expect(f).toBe("x".repeat(100) + ".pdf");
    expect(sanitizeFilename("abcdef", "pdf", 3)).toBe("abc.pdf");
  });

  it("keeps unicode invoice numbers", () => {
    expect(sanitizeFilename("फ़ैक्टुरा-१", "pdf")).toBe("फ़ैक्टुरा-१.pdf");
  });
});

describe("isAllowedOrigin", () => {
  it.each(GOOD_ORIGINS)("allows Origin %s", (o) => {
    expect(isAllowedOrigin(req({ origin: o }))).toBe(true);
  });

  it.each(BAD_ORIGINS)("rejects spoofed Origin %s", (o) => {
    expect(isAllowedOrigin(req({ origin: o }))).toBe(false);
  });

  it("rejects when neither Origin nor Referer present", () => {
    expect(isAllowedOrigin(req({}))).toBe(false);
  });

  it("falls back to Referer when Origin is absent", () => {
    expect(isAllowedOrigin(req({ referer: "https://freeinvoicegen.org/quotation?x=1" }))).toBe(true);
    expect(isAllowedOrigin(req({ referer: "https://freeinvoicegen.org.evil.com/" }))).toBe(false);
  });

  it("a foreign Origin is NOT rescued by an allowed Referer", () => {
    expect(
      isAllowedOrigin(req({ origin: "https://evil.com", referer: "https://freeinvoicegen.org/" })),
    ).toBe(false);
  });

  it("is case-insensitive on host (URL normalises) and ignores port/path", () => {
    expect(isAllowedOrigin(req({ origin: "https://FreeInvoiceGen.ORG" }))).toBe(true);
    expect(isAllowedOrigin(req({ origin: "https://freeinvoicegen.org:8443" }))).toBe(true);
  });

  it("honours a custom allowlist", () => {
    expect(isAllowedOrigin(req({ origin: "https://a.test" }), ["a.test"])).toBe(true);
    expect(isAllowedOrigin(req({ origin: "https://freeinvoicegen.org" }), ["a.test"])).toBe(false);
  });
});

describe("checkRateLimit (token bucket)", () => {
  const cfg = { capacity: 3, refillPerMinute: 1 };

  it("allows a burst of `capacity` then rejects with a positive Retry-After", () => {
    const ip = freshIp();
    for (let i = 0; i < 3; i++) expect(checkRateLimit(req({ "x-forwarded-for": ip }), "t1", cfg).ok).toBe(true);
    const r = checkRateLimit(req({ "x-forwarded-for": ip }), "t1", cfg);
    expect(r.ok).toBe(false);
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
    expect(r.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("refills over time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const ip = freshIp();
    for (let i = 0; i < 3; i++) checkRateLimit(req({ "x-forwarded-for": ip }), "t2", cfg);
    expect(checkRateLimit(req({ "x-forwarded-for": ip }), "t2", cfg).ok).toBe(false);
    vi.setSystemTime(new Date("2026-01-01T00:00:30Z"));
    expect(checkRateLimit(req({ "x-forwarded-for": ip }), "t2", cfg).ok).toBe(false);
    vi.setSystemTime(new Date("2026-01-01T00:01:01Z"));
    expect(checkRateLimit(req({ "x-forwarded-for": ip }), "t2", cfg).ok).toBe(true);
    expect(checkRateLimit(req({ "x-forwarded-for": ip }), "t2", cfg).ok).toBe(false);
  });

  it("never refills above capacity after a long idle", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const ip = freshIp();
    checkRateLimit(req({ "x-forwarded-for": ip }), "t3", cfg);
    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
    let ok = 0;
    for (let i = 0; i < 10; i++) if (checkRateLimit(req({ "x-forwarded-for": ip }), "t3", cfg).ok) ok++;
    expect(ok).toBe(3);
  });

  it("buckets are per-IP and per-scope", () => {
    const a = freshIp();
    const b = freshIp();
    for (let i = 0; i < 3; i++) checkRateLimit(req({ "x-forwarded-for": a }), "t4", cfg);
    expect(checkRateLimit(req({ "x-forwarded-for": a }), "t4", cfg).ok).toBe(false);
    expect(checkRateLimit(req({ "x-forwarded-for": b }), "t4", cfg).ok).toBe(true);
    expect(checkRateLimit(req({ "x-forwarded-for": a }), "t4-other", cfg).ok).toBe(true);
  });

  it("uses the leftmost X-Forwarded-For entry", () => {
    const client = freshIp();
    for (let i = 0; i < 3; i++) {
      checkRateLimit(req({ "x-forwarded-for": `${client}, 1.1.1.${i}` }), "t5", cfg);
    }
    expect(checkRateLimit(req({ "x-forwarded-for": `${client}, 9.9.9.9` }), "t5", cfg).ok).toBe(false);
  });

  it("falls back to x-real-ip, then a shared 'unknown' bucket", () => {
    const ip = freshIp();
    for (let i = 0; i < 3; i++) checkRateLimit(req({ "x-real-ip": ip }), "t6", cfg);
    expect(checkRateLimit(req({ "x-real-ip": ip }), "t6", cfg).ok).toBe(false);
    for (let i = 0; i < 3; i++) checkRateLimit(req({}), "t7", cfg);
    expect(checkRateLimit(req({}), "t7", cfg).ok).toBe(false);
  });

  it("default config is 5 burst", () => {
    const ip = freshIp();
    let ok = 0;
    for (let i = 0; i < 8; i++) if (checkRateLimit(req({ "x-forwarded-for": ip }), "t8").ok) ok++;
    expect(ok).toBe(5);
  });
});

describe("base64ByteSize", () => {
  it.each([
    ["", 0],
    ["QQ==", 1],
    ["QUI=", 2],
    ["QUJD", 3],
    ["QUJDRA==", 4],
  ])("%j -> %d bytes", (b64, n) => {
    expect(base64ByteSize(b64)).toBe(n);
  });

  it("matches Buffer decoding for random payloads", () => {
    for (const len of [1, 2, 3, 10, 1023, 4096, 100_001]) {
      const b64 = Buffer.alloc(len, 7).toString("base64");
      expect(base64ByteSize(b64)).toBe(len);
    }
  });
});
