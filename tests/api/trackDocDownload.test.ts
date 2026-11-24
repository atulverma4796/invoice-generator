import { describe, it, expect, vi, afterEach } from "vitest";
import { trackDocDownload, type DocType } from "@/lib/trackDocDownload";

afterEach(() => {
  vi.unstubAllGlobals();
});

function setupBrowser(ua: string, opts: { beacon?: boolean } = {}) {
  const sendBeacon = vi.fn(() => true);
  vi.stubGlobal("window", {
    navigator: { userAgent: ua, platform: "Win32", language: "en-IN" },
    screen: { width: 1920, height: 1080 },
    location: { href: "https://freeinvoicegen.org/quotation" },
  });
  vi.stubGlobal("document", { referrer: "https://www.google.com/" });
  vi.stubGlobal("navigator", opts.beacon === false ? {} : { sendBeacon });
  const fetchMock = vi.fn(() => Promise.resolve(new Response("{}")));
  vi.stubGlobal("fetch", fetchMock);
  return { sendBeacon, fetchMock };
}

async function beaconPayload(sendBeacon: ReturnType<typeof vi.fn>) {
  expect(sendBeacon).toHaveBeenCalledTimes(1);
  const [url, blob] = sendBeacon.mock.calls[0] as unknown as [string, Blob];
  expect(url).toBe("/api/t");
  expect(blob.type).toBe("application/json");
  return JSON.parse(await blob.text());
}

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

describe("trackDocDownload", () => {
  it.each<DocType>(["quotation", "purchase-order", "delivery-note", "salary-slip", "rent-receipt"])(
    "sends a beacon for %s with docType + action=download",
    async (docType) => {
      const { sendBeacon } = setupBrowser(CHROME);
      trackDocDownload(docType, { currency: "INR", total: 500, lineItemCount: 2 });
      const p = await beaconPayload(sendBeacon);
      expect(p.docType).toBe(docType);
      expect(p.action).toBe("download");
      expect(p.signals).toMatchObject({ currency: "INR", lineItemCount: 2, totalBucket: "100-1k" });
    },
  );

  it.each([
    [undefined, "0"], [0, "0"], [-5, "0"], [NaN, "0"], [Infinity, "0"],
    [0.01, "<100"], [99.99, "<100"], [100, "100-1k"], [999, "100-1k"], [1000, "1k-10k"],
    [9999, "1k-10k"], [10000, "10k-100k"], [99999, "10k-100k"], [100000, "100k+"], [1e12, "100k+"],
  ])("total %s → bucket %s (exact amount never sent)", async (total, bucket) => {
    const { sendBeacon } = setupBrowser(CHROME);
    trackDocDownload("quotation", { total: total as number | undefined });
    const p = await beaconPayload(sendBeacon);
    expect(p.signals.totalBucket).toBe(bucket);
    if (typeof total === "number" && Number.isFinite(total) && total > 0) {
      expect(JSON.stringify(p)).not.toContain(`:${total}`);
    }
  });

  it.each([
    [CHROME, "Chrome", "Windows"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605 Version/17 Safari/605", "Safari", "macOS"],
    ["Mozilla/5.0 (Windows NT 10.0) Chrome/126 Safari/537 Edg/126", "Edge", "Windows"],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko Firefox/128.0", "Firefox", "Linux"],
    ["Mozilla/5.0 (Linux; Android 14) Chrome/126 Mobile Safari/537", "Chrome", "Android"],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17 Mobile Safari/604", "Safari", "iOS"],
    ["Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Version/17 Safari/604", "Safari", "iOS"],
    ["SomethingElse/1.0", "Unknown", "Unknown"],
  ])("UA %s → %s / %s", async (ua, browser, os) => {
    const { sendBeacon } = setupBrowser(ua);
    trackDocDownload("salary-slip");
    const p = await beaconPayload(sendBeacon);
    expect(p.device.browser).toBe(browser);
    expect(p.device.os).toBe(os);
  });

  it("only forwards boolean flags, no PII fields", async () => {
    const { sendBeacon } = setupBrowser(CHROME);
    trackDocDownload("rent-receipt", { currency: "INR", total: 15000, flags: { hasLogo: true, hasSignature: false } });
    const p = await beaconPayload(sendBeacon);
    expect(p.signals.hasLogo).toBe(true);
    expect(p.signals.hasSignature).toBe(false);
    const keys = JSON.stringify(Object.keys(p.signals)).toLowerCase();
    for (const pii of ["name", "email", "address", "phone", "pan", "gstin", "description", "notes"]) {
      expect(keys).not.toContain(pii);
    }
  });

  it("falls back to fetch keepalive when sendBeacon is unavailable", async () => {
    const { fetchMock } = setupBrowser(CHROME, { beacon: false });
    trackDocDownload("delivery-note");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/t");
    expect(init).toMatchObject({ method: "POST", keepalive: true });
    expect(JSON.parse(init.body as string).docType).toBe("delivery-note");
  });

  it("never throws, even if sendBeacon throws or fetch rejects", () => {
    vi.stubGlobal("navigator", { sendBeacon: () => { throw new Error("boom"); } });
    expect(() => trackDocDownload("quotation")).not.toThrow();
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    expect(() => trackDocDownload("quotation")).not.toThrow();
  });

  it("works server-side (no window) with 'unknown' device info", () => {
    vi.stubGlobal("navigator", {});
    const fetchMock = vi.fn(() => Promise.resolve(new Response("{}")));
    vi.stubGlobal("fetch", fetchMock);
    trackDocDownload("quotation");
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.device.browser).toBe("unknown");
  });

  it("payload stays well under /api/t's 12 KB cap even with a huge UA", async () => {
    const { sendBeacon } = setupBrowser("X".repeat(5000));
    trackDocDownload("quotation", { flags: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`hasF${i}`, true])) });
    const [, blob] = sendBeacon.mock.calls[0] as unknown as [string, Blob];
    expect(blob.size).toBeLessThan(12_288);
  });
});
