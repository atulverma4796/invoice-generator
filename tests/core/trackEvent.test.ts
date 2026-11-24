import { describe, it, expect, vi, afterEach } from "vitest";
import { trackInvoiceEvent } from "@/lib/trackEvent";
import { getStaticSampleInvoice } from "@/lib/sampleInvoice";
import { createDefaultInvoice } from "@/lib/defaultInvoice";
import type { InvoiceData } from "@/types/invoice";

afterEach(() => vi.unstubAllGlobals());

async function capture(action: "download" | "email", data: InvoiceData, extra?: { recipientEmail?: string }) {
  const sendBeacon = vi.fn<(url: string, body: Blob) => boolean>(() => true);
  vi.stubGlobal("navigator", { sendBeacon, userAgent: "test", language: "en" });
  trackInvoiceEvent(action, data, extra);
  expect(sendBeacon).toHaveBeenCalledTimes(1);
  const [url, blob] = sendBeacon.mock.calls[0];
  expect(url).toBe("/api/t");
  expect(blob.type).toBe("application/json");
  return { raw: await blob.text(), json: JSON.parse(await blob.text()) };
}

const withTotal = (unit: number, over: Partial<InvoiceData> = {}): InvoiceData => ({
  ...createDefaultInvoice(),
  lineItems: [{ id: "a", description: "x", quantity: 1, rate: unit, amount: unit }],
  ...over,
});

describe("trackInvoiceEvent signals", () => {
  it("sends feature flags for the static sample", async () => {
    const { json } = await capture("download", getStaticSampleInvoice());
    expect(json.action).toBe("download");
    expect(json.signals).toMatchObject({
      template: "modern",
      language: "en",
      currency: "USD",
      lineItemCount: 3,
      totalBucket: "1k-10k",
      taxRate: 8.25,
      discountRate: 5,
      hasLogo: false,
      hasSignature: true,
      hasQrCode: true,
      hasNotes: true,
      hasTerms: true,
      hasWatermark: true,
      hasPaymentInfo: true,
      hasShipping: false,
      hasLateFee: true,
      hasPoNumber: true,
      hasDueDate: true,
      status: "pending",
    });
  });

  it("never transmits PII or invoice content", async () => {
    const data = getStaticSampleInvoice();
    const { raw } = await capture("email", data, { recipientEmail: "secret@client.com" });
    for (const s of [
      "secret@client.com", data.senderName, data.clientName, data.senderEmail, data.clientEmail,
      data.invoiceNumber, data.lineItems[0].description, data.paymentInfo.routingNumber,
      data.qrCodeData, data.senderTaxId, "4900", "5148",
    ]) {
      expect(raw).not.toContain(s);
    }
  });

  it.each([
    [0, "0"],
    [0.01, "<100"],
    [99.99, "<100"],
    [100, "100-1k"],
    [999.99, "100-1k"],
    [1000, "1k-10k"],
    [9999.99, "1k-10k"],
    [10000, "10k-100k"],
    [99999.99, "10k-100k"],
    [100000, "100k+"],
    [1e12, "100k+"],
  ])("total %s → bucket %s", async (total, bucket) => {
    const { json } = await capture("download", withTotal(total));
    expect(json.signals.totalBucket).toBe(bucket);
  });

  it("bucket uses discounted, taxed total plus shipping", async () => {
    // 90 - 10% = 81, +10% tax = 89.1, +15 shipping = 104.1 → 100-1k
    const { json } = await capture("download", withTotal(90, { discountRate: 10, taxRate: 10, shippingFee: 15 }));
    expect(json.signals.totalBucket).toBe("100-1k");
    expect(json.signals.hasShipping).toBe(true);
  });

  it("negative / NaN totals fall in the 0 bucket", async () => {
    expect((await capture("download", withTotal(-500))).json.signals.totalBucket).toBe("0");
    expect((await capture("download", withTotal(NaN))).json.signals.totalBucket).toBe("0");
  });

  it("counts only meaningful line items", async () => {
    const data = withTotal(10, {
      lineItems: [
        { id: "1", description: "Real", quantity: 1, rate: 10, amount: 10 },
        { id: "2", description: "  ", quantity: 1, rate: 0, amount: 0 },
        { id: "3", description: "", quantity: 2, rate: 5, amount: 10 },
      ],
    });
    expect((await capture("download", data)).json.signals.lineItemCount).toBe(2);
  });

  it("whitespace-only notes/terms/watermark/PO count as absent", async () => {
    const { json } = await capture("download", withTotal(10, { notes: "  ", terms: "\n", watermark: " ", poNumber: " ", dueDate: "", lateFeeRate: 0 }));
    expect(json.signals).toMatchObject({
      hasNotes: false, hasTerms: false, hasWatermark: false, hasPoNumber: false, hasDueDate: false, hasLateFee: false, hasPaymentInfo: false,
    });
  });

  it("never throws, even with malformed data", () => {
    vi.stubGlobal("navigator", { sendBeacon: () => { throw new Error("blocked"); } });
    expect(() => trackInvoiceEvent("download", getStaticSampleInvoice())).not.toThrow();
    expect(() => trackInvoiceEvent("download", {} as InvoiceData)).not.toThrow();
  });

  it("falls back to fetch keepalive when sendBeacon is unavailable", async () => {
    vi.stubGlobal("navigator", {});
    const fetchMock = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", fetchMock);
    trackInvoiceEvent("download", getStaticSampleInvoice());
    expect(fetchMock).toHaveBeenCalledWith("/api/t", expect.objectContaining({ method: "POST", keepalive: true }));
  });
});
