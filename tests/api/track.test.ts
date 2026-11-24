import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { freshIp, makeReq } from "./helpers";

const mail = vi.hoisted(() => ({ sendMail: vi.fn(), createTransport: vi.fn() }));
vi.mock("nodemailer", () => ({
  default: { createTransport: mail.createTransport },
  createTransport: mail.createTransport,
}));

import { POST } from "@/app/api/t/route";

const HUMAN_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
type MailArgs = { from: string; to: string; subject: string; html: string };
const lastMail = (): MailArgs => mail.sendMail.mock.calls.at(-1)![0];
const valid = (over: Record<string, unknown> = {}) => ({
  action: "download",
  docType: "invoice",
  device: { browser: "Chrome", os: "Windows", userAgent: HUMAN_UA },
  signals: { template: "modern", language: "en", currency: "USD", totalBucket: "100-1k", lineItemCount: 3, taxRate: 18, discountRate: 0, hasLogo: true },
  ...over,
});
const post = (json: unknown, opts: Parameters<typeof makeReq>[1] = {}) => POST(makeReq("/api/t", { json, ...opts }));

beforeEach(() => {
  process.env.GMAIL_USER = "bot@gmail.test";
  process.env.GMAIL_APP_PASSWORD = "pw";
  mail.sendMail.mockReset().mockResolvedValue({});
  mail.createTransport.mockReset().mockImplementation(() => ({ sendMail: mail.sendMail }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.useRealTimers());

describe("POST /api/t — happy path", () => {
  it("emails the owner a labelled analytics event", async () => {
    const res = await post(valid(), { headers: { "x-vercel-ip-country": "in" } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    const m = lastMail();
    expect(m.to).toBe("bot@gmail.test");
    expect(m.subject).toBe("[Invoice] IN · Chrome on Windows · 100-1k USD");
    expect(m.html).toContain("Downloaded Invoice");
    expect(m.html).toContain("18% / 0%");
  });

  it.each([
    ["quotation", "Quotation", "[Quotation]"],
    ["purchase-order", "Purchase Order", "[PO]"],
    ["delivery-note", "Delivery Note", "[Delivery Note]"],
    ["salary-slip", "Salary Slip", "[Salary Slip]"],
    ["rent-receipt", "Rent Receipt", "[Rent Receipt]"],
    ["unknown-doc", "Invoice", "[Invoice]"],
    [123, "Invoice", "[Invoice]"],
    ["__proto__", "Invoice", "[Invoice]"],
    ["constructor", "Invoice", "[Invoice]"],
  ])("docType %j → %s", async (docType, name, tag) => {
    expect((await post(valid({ docType }))).status).toBe(200);
    expect(lastMail().subject.startsWith(tag)).toBe(true);
    expect(lastMail().html).toContain(`Downloaded ${name}`);
  });

  it("action=email uses the Email label; anything else is download", async () => {
    await post(valid({ action: "email" }));
    expect(lastMail().subject.startsWith("[Email · Invoice]")).toBe(true);
    await post(valid({ action: "<b>hack</b>" }));
    expect(lastMail().html).toContain("Downloaded Invoice");
  });

  it.each([["", "??"], ["XYZ", "??"], ["<b>", "??"], ["us", "US"]])("country header %j → %s", async (c, out) => {
    await post(valid(), { headers: { "x-vercel-ip-country": c } });
    expect(lastMail().subject).toContain(` ${out} · `);
  });

  it("clamps lineItemCount and ignores non-finite numbers", async () => {
    await post(valid({ signals: { lineItemCount: 1e9, taxRate: "18<script>", discountRate: Infinity } }));
    const html = lastMail().html;
    expect(html).toContain(">999<");
    expect(html).toContain("0% / 0%");
    expect(html).not.toContain("<script>");
  });
});

describe("same-origin check", () => {
  it.each([
    "https://freeinvoicegen.org.evil.com",
    "https://evil.com",
    "http://freeinvoicegen.org", // scheme mismatch
    "https://www.freeinvoicegen.org", // different origin than request URL
    "null",
    "garbage",
  ])("403 for Origin %s", async (origin) => {
    expect((await post(valid(), { origin })).status).toBe(403);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("403 when Origin missing (Referer is not accepted)", async () => {
    expect((await post(valid(), { origin: null, referer: "https://freeinvoicegen.org/" })).status).toBe(403);
  });

  it("matches against the request's own origin (works on preview hosts)", async () => {
    const res = await POST(makeReq("/api/t", { json: valid(), url: "https://preview-123.vercel.app/api/t", origin: "https://preview-123.vercel.app" }));
    expect(res.status).toBe(200);
  });
});

describe("bot suppression", () => {
  it.each([
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "HeadlessChrome/120.0",
    "curl/8.4.0",
    "Wget/1.21",
    "python-httpclient",
    "Mozilla/5.0 Playwright",
    "puppeteer",
    "Selenium",
    "AhrefsBot spider",
    "SomeCrawler/1.0",
    "PhantomJS",
  ])("suppresses UA %j without sending email", async (userAgent) => {
    const res = await post(valid({ device: { userAgent } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, suppressed: "bot" });
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("falls back to the request User-Agent header when payload omits it", async () => {
    const res = await post(valid({ device: {} }), { headers: { "user-agent": "Googlebot" } });
    expect(await res.json()).toEqual({ success: true, suppressed: "bot" });
  });

  it("human UA is not suppressed", async () => {
    await post(valid());
    expect(mail.sendMail).toHaveBeenCalledTimes(1);
  });
});

describe("rate limit (12/min fixed window)", () => {
  it("12 pass, 13th 429, resets after window", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    const ip = freshIp();
    for (let i = 0; i < 12; i++) expect((await post(valid(), { ip })).status).toBe(200);
    expect((await post(valid(), { ip })).status).toBe(429);
    vi.setSystemTime(new Date("2026-03-01T00:01:00.001Z"));
    expect((await post(valid(), { ip })).status).toBe(200);
  });

  it("other IPs unaffected", async () => {
    const ip = freshIp();
    for (let i = 0; i < 13; i++) await post(valid(), { ip });
    expect((await post(valid())).status).toBe(200);
  });
});

describe("payload validation", () => {
  it("413 when Content-Length > 12 KB", async () => {
    expect((await post(valid(), { headers: { "content-length": "12289" } })).status).toBe(413);
  });

  it.each([null, [], "s", 1])("400 for non-object JSON %j", async (v) => {
    expect((await POST(makeReq("/api/t", { raw: JSON.stringify(v) }))).status).toBe(400);
  });

  it.each(["{", "", "nope"])("400 for invalid JSON %j", async (raw) => {
    const res = await POST(makeReq("/api/t", { raw }));
    expect(res.status).toBe(400);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("tolerates device/signals of the wrong type", async () => {
    const res = await post({ device: "x", signals: [1, 2] }, { headers: { "user-agent": HUMAN_UA } });
    expect(res.status).toBe(200);
    expect(lastMail().subject).toContain("Unknown on Unknown");
  });
});

describe("escaping + header injection", () => {
  it.each(["browser", "os"])("escapes device.%s in HTML", async (k) => {
    await post(valid({ device: { browser: "Chrome", os: "Win", userAgent: HUMAN_UA, [k]: `<img src=x onerror=alert(1)>` } }));
    expect(lastMail().html).not.toContain("<img src=x");
  });

  it.each(["template", "language", "currency", "totalBucket"])("escapes signals.%s in HTML", async (k) => {
    await post(valid({ signals: { [k]: `"><script>x</script>` } }));
    expect(lastMail().html).not.toContain("<script>");
  });

  it("subject has no CR/LF even when browser/os/currency carry newlines", async () => {
    await post(valid({
      device: { browser: "Chr\r\nBcc: v@x.com", os: "Win\nX", userAgent: HUMAN_UA },
      signals: { currency: "US\rD", totalBucket: "1\n2" },
    }));
    expect(lastMail().subject).not.toMatch(/[\r\n]/);
  });

  it("caps field lengths", async () => {
    await post(valid({ device: { browser: "b".repeat(500), os: "o".repeat(500), userAgent: HUMAN_UA } }));
    const s = lastMail().subject;
    expect(s).toContain("b".repeat(40));
    expect(s).not.toContain("b".repeat(41));
  });
});

describe("failures", () => {
  it("sendMail failure → no throw, generic {success:false}, no leak", async () => {
    mail.sendMail.mockRejectedValueOnce(new Error("Daily user sending limit exceeded bot@gmail.test"));
    const res = await post(valid());
    const body = await res.json();
    expect(body).toEqual({ success: false });
    expect(JSON.stringify(body)).not.toMatch(/limit|gmail/i);
  });
});
