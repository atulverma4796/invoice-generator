import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { escapeHtml } from "@/lib/api-security";
import { BAD_ORIGINS, GOOD_ORIGINS, XSS_PAYLOADS, freshIp, makeReq } from "./helpers";

const mail = vi.hoisted(() => ({ sendMail: vi.fn(), createTransport: vi.fn() }));
vi.mock("nodemailer", () => ({
  default: { createTransport: mail.createTransport },
  createTransport: mail.createTransport,
}));

import { POST } from "@/app/api/feedback/route";

type MailArgs = { from: string; to: string; subject: string; text: string; html: string; replyTo?: string; bcc?: unknown };
const lastMail = (): MailArgs => mail.sendMail.mock.calls.at(-1)![0];
const valid = (over: Record<string, unknown> = {}) => ({ name: "Priya", type: "Bug", message: "PDF button broken", ...over });
const post = (json: unknown, opts: Parameters<typeof makeReq>[1] = {}) => POST(makeReq("/api/feedback", { json, ...opts }));

beforeEach(() => {
  process.env.GMAIL_USER = "bot@gmail.test";
  process.env.GMAIL_APP_PASSWORD = "pw";
  mail.sendMail.mockReset().mockResolvedValue({});
  mail.createTransport.mockReset().mockImplementation(() => ({ sendMail: mail.sendMail }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.useRealTimers());

describe("POST /api/feedback — happy path", () => {
  it("relays to the owner inbox only, 200 {success:true}", async () => {
    const res = await post(valid());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    const m = lastMail();
    expect(m.to).toBe("bot@gmail.test");
    expect(m.from).toBe(`"InvoiceGen Feedback" <bot@gmail.test>`);
    expect(m.subject).toBe("[InvoiceGen Bug] from Priya");
    expect(m.text).toBe("Type: Bug\nName: Priya\n\nPDF button broken");
  });

  it("recipient cannot be overridden by the request", async () => {
    await post(valid({ to: "victim@x.com", bcc: "v2@x.com", replyTo: "x@y.com", from: "ceo@bank.com" }));
    const m = lastMail();
    expect(m.to).toBe("bot@gmail.test");
    expect(m.bcc).toBeUndefined();
    expect(m.replyTo).toBeUndefined();
    expect(m.from).toContain("bot@gmail.test");
  });

  it("defaults name to Anonymous", async () => {
    for (const name of [undefined, "", "   ", 42, null, ["x"]]) {
      await post(valid({ name }));
      expect(lastMail().subject).toBe("[InvoiceGen Bug] from Anonymous");
    }
  });

  it("preserves multi-line messages in body (newlines allowed in body, not headers)", async () => {
    await post(valid({ message: "line1\nline2\r\nline3" }));
    expect(lastMail().text).toContain("line1\nline2\r\nline3");
  });
});

describe("type enum", () => {
  it.each(["Feedback", "Bug", "Feature", "Question", "Other"])("accepts %s", async (type) => {
    await post(valid({ type }));
    expect(lastMail().subject).toBe(`[InvoiceGen ${type}] from Priya`);
  });

  it.each(["bug", "BUG", "Spam", "<script>", "Bug\r\nBcc: x@y.com", "", 1, null, ["Bug"], "Feedback ", " Other"])(
    "unknown/odd type %j falls back to Feedback unless exact after trim",
    async (type) => {
      await post(valid({ type }));
      const trimmed = typeof type === "string" ? type.trim() : "";
      const expected = ["Feedback", "Bug", "Feature", "Question", "Other"].includes(trimmed) ? trimmed : "Feedback";
      expect(lastMail().subject).toBe(`[InvoiceGen ${expected}] from Priya`);
    },
  );
});

describe("origin allowlist", () => {
  it.each(GOOD_ORIGINS)("allows %s", async (origin) => {
    expect((await post(valid(), { origin })).status).toBe(200);
  });
  it.each(BAD_ORIGINS)("403 for %s", async (origin) => {
    expect((await post(valid(), { origin })).status).toBe(403);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });
  it("403 with no Origin/Referer", async () => {
    expect((await post(valid(), { origin: null })).status).toBe(403);
  });
});

describe("rate limiting (3 burst, 1/min)", () => {
  it("3 pass then 429 with Retry-After ≈ 60s", async () => {
    const ip = freshIp();
    for (let i = 0; i < 3; i++) expect((await post(valid(), { ip })).status).toBe(200);
    const res = await post(valid(), { ip });
    expect(res.status).toBe(429);
    const ra = Number(res.headers.get("Retry-After"));
    expect(ra).toBeGreaterThan(0);
    expect(ra).toBeLessThanOrEqual(60);
    expect(mail.sendMail).toHaveBeenCalledTimes(3);
  });

  it("refills after 60s", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    const ip = freshIp();
    for (let i = 0; i < 3; i++) await post(valid(), { ip });
    expect((await post(valid(), { ip })).status).toBe(429);
    vi.setSystemTime(new Date("2026-03-01T00:01:00Z"));
    expect((await post(valid(), { ip })).status).toBe(200);
  });

  it("feedback and send-invoice buckets are independent scopes", async () => {
    const { checkRateLimit } = await import("@/lib/api-security");
    const ip = freshIp();
    for (let i = 0; i < 3; i++) await post(valid(), { ip });
    const r = checkRateLimit(new Request("https://x", { headers: { "x-forwarded-for": ip } }), "send-invoice");
    expect(r.ok).toBe(true);
  });
});

describe("payload validation", () => {
  it("413 when Content-Length > 64 KB", async () => {
    const res = await post(valid(), { headers: { "content-length": String(64 * 1024 + 1) } });
    expect(res.status).toBe(413);
  });

  it("accepts Content-Length exactly 64 KB", async () => {
    const res = await post(valid(), { headers: { "content-length": String(64 * 1024) } });
    // header lies about size; body is small — but the cap must not reject it
    expect(res.status).not.toBe(413);
  });

  it.each(["{", "", "nope", "{\"message\":"])("400 on invalid JSON %j", async (raw) => {
    expect((await POST(makeReq("/api/feedback", { raw }))).status).toBe(400);
  });

  it.each([null, 5, "str", [], false])("400 (not 500) on non-object JSON %j", async (v) => {
    expect((await POST(makeReq("/api/feedback", { raw: JSON.stringify(v) }))).status).toBe(400);
  });

  it.each([undefined, "", "   \n\t ", 123, { a: 1 }, ["msg"]])("400 when message is %j", async (message) => {
    const res = await post(valid({ message }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Message is required" });
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("truncates name to 80 and message to 5000 chars", async () => {
    await post(valid({ name: "n".repeat(1000), message: "m".repeat(20000) }));
    const m = lastMail();
    expect(m.subject).toBe(`[InvoiceGen Bug] from ${"n".repeat(80)}`);
    expect(m.text.endsWith("m".repeat(5000))).toBe(true);
    expect(m.text).not.toContain("m".repeat(5001));
  });
});

describe("escaping + header injection", () => {
  it.each(XSS_PAYLOADS)("escapes name %j", async (p) => {
    await post(valid({ name: p }));
    expect(lastMail().html).toContain(escapeHtml(p));
    expect(lastMail().html).not.toContain(p);
  });

  it.each(XSS_PAYLOADS)("escapes message %j", async (p) => {
    await post(valid({ message: p }));
    expect(lastMail().html).toContain(escapeHtml(p));
    expect(lastMail().html).not.toContain(p);
  });

  it.each(["Eve\r\nBcc: victim@x.com", "Eve\nSubject: x", "Eve\u2028X"])("subject has no CR/LF for name %j", async (name) => {
    await post(valid({ name }));
    expect(lastMail().subject).not.toMatch(/[\r\n\u2028]/);
  });
});

describe("failures", () => {
  it("sendMail rejection → 500 generic, no leak", async () => {
    mail.sendMail.mockRejectedValueOnce(new Error("Invalid login: 534 bot@gmail.test"));
    const res = await post(valid());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Failed to send email" });
  });
});
