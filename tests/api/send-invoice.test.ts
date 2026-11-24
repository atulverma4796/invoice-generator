import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { escapeHtml } from "@/lib/api-security";
import { BAD_ORIGINS, GOOD_ORIGINS, XSS_PAYLOADS, freshIp, makeReq } from "./helpers";

const mail = vi.hoisted(() => ({ sendMail: vi.fn(), createTransport: vi.fn() }));
vi.mock("nodemailer", () => ({
  default: { createTransport: mail.createTransport },
  createTransport: mail.createTransport,
}));

import { POST } from "@/app/api/send-invoice/route";

const PDF = Buffer.from("%PDF-1.4 test").toString("base64");
const valid = (over: Record<string, unknown> = {}) => ({
  to: "client@example.com",
  senderName: "Acme Ltd",
  senderEmail: "owner@acme.com",
  invoiceNumber: "INV-001",
  pdfBase64: PDF,
  ...over,
});
type MailArgs = {
  from: string; to: string; replyTo?: string; subject: string; text: string; html: string;
  attachments: { filename: string; content: string; encoding: string; contentType: string }[];
};
const lastMail = (): MailArgs => mail.sendMail.mock.calls.at(-1)![0];
const post = (json: unknown, opts: Parameters<typeof makeReq>[1] = {}) =>
  POST(makeReq("/api/send-invoice", { json, ...opts }));

beforeEach(() => {
  process.env.GMAIL_USER = "bot@gmail.test";
  process.env.GMAIL_APP_PASSWORD = "pw";
  mail.sendMail.mockReset().mockResolvedValue({ messageId: "x" });
  mail.createTransport.mockReset().mockImplementation(() => ({ sendMail: mail.sendMail }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.useRealTimers());

describe("POST /api/send-invoice — happy path", () => {
  it("sends one email and returns 200 {success:true}", async () => {
    const res = await post(valid());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mail.sendMail).toHaveBeenCalledTimes(1);
    const m = lastMail();
    expect(m.to).toBe("client@example.com");
    expect(m.replyTo).toBe("owner@acme.com");
    expect(m.from).toBe(`"Acme Ltd" <bot@gmail.test>`);
    expect(m.subject).toBe("Invoice INV-001 from Acme Ltd");
    expect(m.attachments).toHaveLength(1);
    expect(m.attachments[0]).toMatchObject({ filename: "INV-001.pdf", content: PDF, encoding: "base64", contentType: "application/pdf" });
  });

  it("uses Gmail credentials from env, never from the request", async () => {
    await post(valid({ auth: { user: "x", pass: "y" }, service: "smtp.evil" }));
    expect(mail.createTransport).toHaveBeenCalledWith({ service: "gmail", auth: { user: "bot@gmail.test", pass: "pw" } });
  });

  it("defaults sender name / invoice number and omits replyTo when absent", async () => {
    await post(valid({ senderName: "", senderEmail: undefined, invoiceNumber: "   " }));
    const m = lastMail();
    expect(m.subject).toBe("Invoice Invoice from InvoiceGen");
    expect(m.replyTo).toBeUndefined();
    expect(m.attachments[0].filename).toBe("Invoice.pdf");
  });

  it("trims whitespace around the recipient", async () => {
    await post(valid({ to: "  client@example.com \n" }));
    expect(lastMail().to).toBe("client@example.com");
  });

  it.each([
    "o'brien@example.ie",
    "first.last+tag@sub.example.co.uk",
    "UPPER@EXAMPLE.COM",
    "user@xn--bcher-kva.example",
  ])("accepts valid single recipient %s", async (to) => {
    const res = await post(valid({ to }));
    expect(res.status).toBe(200);
  });

  it("ignores non-string field types (coerces to empty → defaults / 400)", async () => {
    expect((await post(valid({ to: ["a@b.com", "c@d.com"] }))).status).toBe(400);
    expect((await post(valid({ to: { toString: "a@b.com" } }))).status).toBe(400);
    expect((await post(valid({ pdfBase64: 12345 }))).status).toBe(400);
    const res = await post(valid({ senderName: 42, invoiceNumber: { a: 1 } }));
    expect(res.status).toBe(200);
    expect(lastMail().subject).toBe("Invoice Invoice from InvoiceGen");
  });
});

describe("origin allowlist", () => {
  it.each(GOOD_ORIGINS)("allows %s", async (origin) => {
    expect((await post(valid(), { origin })).status).toBe(200);
  });

  it.each(BAD_ORIGINS)("403 for spoofed origin %s", async (origin) => {
    const res = await post(valid(), { origin });
    expect(res.status).toBe(403);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("403 when Origin and Referer are both missing", async () => {
    expect((await post(valid(), { origin: null })).status).toBe(403);
  });

  it("allows same-site Referer when Origin is missing", async () => {
    expect((await post(valid(), { origin: null, referer: "https://freeinvoicegen.org/" })).status).toBe(200);
  });

  it("403 when foreign Origin carries an allowed Referer", async () => {
    const res = await post(valid(), { origin: "https://evil.com", referer: "https://freeinvoicegen.org/" });
    expect(res.status).toBe(403);
  });
});

describe("rate limiting (5 burst, 3/min)", () => {
  it("5 requests pass, 6th is 429 with Retry-After, other IPs unaffected", async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) expect((await post(valid(), { ip })).status).toBe(200);
    const res = await post(valid(), { ip });
    expect(res.status).toBe(429);
    const ra = Number(res.headers.get("Retry-After"));
    expect(Number.isInteger(ra)).toBe(true);
    expect(ra).toBeGreaterThan(0);
    expect(ra).toBeLessThanOrEqual(20);
    expect(mail.sendMail).toHaveBeenCalledTimes(5);
    expect((await post(valid())).status).toBe(200);
  });

  it("refills: after ~20s one more request is allowed", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    const ip = freshIp();
    for (let i = 0; i < 5; i++) await post(valid(), { ip });
    expect((await post(valid(), { ip })).status).toBe(429);
    vi.setSystemTime(new Date("2026-03-01T00:00:21Z"));
    expect((await post(valid(), { ip })).status).toBe(200);
    expect((await post(valid(), { ip })).status).toBe(429);
  });

  it("rejected-origin requests do not consume the bucket", async () => {
    const ip = freshIp();
    for (let i = 0; i < 10; i++) await post(valid(), { ip, origin: "https://evil.com" });
    expect((await post(valid(), { ip })).status).toBe(200);
  });
});

describe("payload validation", () => {
  it("413 when Content-Length exceeds 8 MB (before parsing)", async () => {
    const res = await post(valid(), { headers: { "content-length": String(8 * 1024 * 1024 + 1) } });
    expect(res.status).toBe(413);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("413 when decoded PDF exceeds 5 MB", async () => {
    const big = Buffer.alloc(5 * 1024 * 1024 + 1, 1).toString("base64");
    const res = await post(valid({ pdfBase64: big }));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "PDF too large" });
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("accepts a PDF of exactly 5 MB", async () => {
    const edge = Buffer.alloc(5 * 1024 * 1024, 1).toString("base64");
    expect((await post(valid({ pdfBase64: edge }))).status).toBe(200);
  });

  it.each(["{", "not json", "", "[1,2", "{'single':'quotes'}"])("400 on invalid JSON %j", async (raw) => {
    const res = await POST(makeReq("/api/send-invoice", { raw }));
    expect(res.status).toBe(400);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it.each([null, "a string", 123, [], true])("400 (not 500) on non-object JSON %j", async (json) => {
    const res = await POST(makeReq("/api/send-invoice", { raw: JSON.stringify(json) }));
    expect(res.status).toBe(400);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("400 when recipient missing", async () => {
    const res = await post(valid({ to: undefined }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Recipient email is required" });
  });

  it("400 when PDF missing", async () => {
    const res = await post(valid({ pdfBase64: "" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "PDF data is required" });
  });

  it.each([
    "a@b.com,c@d.com",
    "a@b.com, c@d.com",
    "a@b.com;c@d.com",
    "a@b.com\nc@d.com",
    "a@b.com\r\nBcc: victim@x.com",
    "<a@b.com>",
    "Name <a@b.com>",
    "\"x\"@b.com",
    "a@b.com (comment)",
    "a@b.com>,<c@d.com",
    "plainaddress",
    "@no-local.com",
    "no-at.example.com",
    "a@b",
    "a@@b.com",
    "a@b.com@c.com",
    "a b@c.com",
    `${"x".repeat(250)}@b.com`,
  ])("400 for invalid / multi recipient %j", async (to) => {
    const res = await post(valid({ to }));
    expect(res.status).toBe(400);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it.each([
    "a@b.com,c@d.com",
    "a@b.com;c@d.com",
    "a@b.com\r\nBcc: v@x.com",
    "Name <a@b.com>",
    "not-an-email",
  ])("400 for invalid reply-to %j", async (senderEmail) => {
    const res = await post(valid({ senderEmail }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Reply-to email is invalid" });
  });
});

describe("header injection", () => {
  it.each([
    "Acme\r\nBcc: victim@x.com",
    "Acme\nSubject: hacked",
    "Acme\rX-Evil: 1",
    "Acme\u2028Bcc: x@y.com",
  ])("strips CR/LF from senderName %j in From and Subject", async (senderName) => {
    expect((await post(valid({ senderName }))).status).toBe(200);
    const m = lastMail();
    expect(m.subject).not.toMatch(/[\r\n\u2028]/);
    expect(m.from).not.toMatch(/[\r\n\u2028]/);
  });

  it("strips CR/LF from invoiceNumber in Subject and filename", async () => {
    await post(valid({ invoiceNumber: "INV\r\nBcc: v@x.com" }));
    const m = lastMail();
    expect(m.subject).not.toMatch(/[\r\n]/);
    expect(m.attachments[0].filename).not.toMatch(/[\r\n]/);
  });

  it("removes quotes and backslashes from the From display name", async () => {
    await post(valid({ senderName: `Evil" <attacker@x.com> "\\` }));
    const from = lastMail().from;
    expect(from.endsWith("<bot@gmail.test>")).toBe(true);
    expect(from.slice(1, from.lastIndexOf('"'))).not.toMatch(/["\\]/);
  });
});

describe("HTML escaping + truncation", () => {
  it.each(XSS_PAYLOADS)("escapes senderName %j in the HTML body", async (payload) => {
    await post(valid({ senderName: payload }));
    const { html } = lastMail();
    expect(html).toContain(escapeHtml(payload.slice(0, 80)));
    expect(html).not.toContain(payload);
  });

  it.each(XSS_PAYLOADS)("escapes invoiceNumber %j in the HTML body", async (payload) => {
    await post(valid({ invoiceNumber: payload }));
    const { html } = lastMail();
    expect(html).toContain(escapeHtml(payload.slice(0, 60)));
    expect(html).not.toContain(payload);
  });

  it("never lets a <script> tag through anywhere in the html", async () => {
    await post(valid({ senderName: "<script>a()</script>", invoiceNumber: "<script>b()</script>" }));
    expect(lastMail().html).not.toMatch(/<script/i);
  });

  it("caps senderName at 80 chars and invoiceNumber at 60", async () => {
    await post(valid({ senderName: "N".repeat(500), invoiceNumber: "9".repeat(500) }));
    const m = lastMail();
    expect(m.subject).toBe(`Invoice ${"9".repeat(60)} from ${"N".repeat(80)}`);
    expect(m.attachments[0].filename).toBe(`${"9".repeat(60)}.pdf`);
  });

  it("does not split escape sequences when truncating (escape after slice)", async () => {
    await post(valid({ senderName: "x".repeat(79) + "&abc" }));
    expect(lastMail().html).toContain("x".repeat(79) + "&amp;");
  });

  it("keeps non-Latin names intact", async () => {
    await post(valid({ senderName: "राम ट्रेडर्स 株式会社", invoiceNumber: "फ़-१" }));
    const m = lastMail();
    expect(m.subject).toBe("Invoice फ़-१ from राम ट्रेडर्स 株式会社");
    expect(m.html).toContain("राम ट्रेडर्स 株式会社");
  });
});

describe("attachment filename sanitising", () => {
  it.each([
    ["../../etc/passwd", /^[^/\\]+\.pdf$/],
    ["..\\..\\win.ini", /^[^/\\]+\.pdf$/],
    ["INV:001*?<>|", /^INV_001_____\.pdf$/],
    [".htaccess", /^htaccess\.pdf$/],
  ])("%j -> safe name", async (invoiceNumber, re) => {
    await post(valid({ invoiceNumber }));
    const f = lastMail().attachments[0].filename;
    expect(f).toMatch(re);
    expect(f).not.toContain("..");
  });
});

describe("failures", () => {
  it("sendMail rejection → 500 with a generic message (no error leak)", async () => {
    mail.sendMail.mockRejectedValueOnce(new Error("535-5.7.8 Username and Password not accepted bot@gmail.test pw"));
    const res = await post(valid());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Failed to send email" });
    expect(JSON.stringify(body)).not.toMatch(/535|Password|gmail/i);
  });

  it("does not echo request data in error responses", async () => {
    const res = await post(valid({ to: "<script>@x" }));
    expect(JSON.stringify(await res.json())).not.toContain("<script>");
  });
});
