import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createDefaultInvoice,
  initializeInvoiceDates,
  getTermsForWatermark,
  getTermsPresetsForWatermark,
} from "@/lib/defaultInvoice";
import { TEMPLATES } from "@/lib/templates";

afterEach(() => vi.useRealTimers());

describe("createDefaultInvoice", () => {
  it("is deterministic (no Date/UUID → no hydration mismatch)", () => {
    expect(createDefaultInvoice()).toEqual(createDefaultInvoice());
  });

  it("returns a fresh object each call (no shared mutable state)", () => {
    const a = createDefaultInvoice();
    const b = createDefaultInvoice();
    a.lineItems.push({ id: "x", description: "", quantity: 1, rate: 0, amount: 0 });
    a.paymentInfo.bankName = "Mutated";
    a.customStyle.primaryColor = "#000";
    expect(b.lineItems).toHaveLength(1);
    expect(b.paymentInfo.bankName).toBe("");
    expect(b.customStyle.primaryColor).toBe("#2563eb");
  });

  it("has sensible defaults", () => {
    const d = createDefaultInvoice();
    expect(d.currency).toBe("USD");
    expect(d.language).toBe("en");
    expect(d.taxRate).toBe(0);
    expect(d.taxLabel).toBe("Tax");
    expect(d.discountRate).toBe(0);
    expect(d.shippingFee).toBe(0);
    expect(d.invoiceNumber).toBe("INV-000001");
    expect(d.invoiceDate).toBe("");
    expect(d.lineItems).toEqual([{ id: "default-item-1", description: "", quantity: 1, rate: 0, amount: 0 }]);
    expect(TEMPLATES[d.template]).toBeDefined();
    expect(d.customStyle.primaryColor).toBe(TEMPLATES[d.template].primaryColor);
  });
});

describe("initializeInvoiceDates", () => {
  it("sets today and +30 days as ISO dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    const d = initializeInvoiceDates(createDefaultInvoice());
    expect(d.invoiceDate).toBe("2026-03-15");
    expect(d.dueDate).toBe("2026-04-14");
    expect(d.invoiceNumber).toMatch(/^INV-\d{6}$/);
  });

  it("rolls over month/year boundaries and leap days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2028-02-10T12:00:00Z"));
    expect(initializeInvoiceDates(createDefaultInvoice()).dueDate).toBe("2028-03-11"); // 2028 leap year
    vi.setSystemTime(new Date("2026-12-15T12:00:00Z"));
    expect(initializeInvoiceDates(createDefaultInvoice()).dueDate).toBe("2027-01-14");
  });

  it("replaces only the placeholder line-item id", () => {
    const base = createDefaultInvoice();
    base.lineItems.push({ id: "keep-me", description: "x", quantity: 1, rate: 5, amount: 5 });
    const d = initializeInvoiceDates(base);
    expect(d.lineItems[0].id).not.toBe("default-item-1");
    expect(d.lineItems[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(d.lineItems[1].id).toBe("keep-me");
  });

  it("does not mutate its input", () => {
    const base = createDefaultInvoice();
    initializeInvoiceDates(base);
    expect(base).toEqual(createDefaultInvoice());
  });
});

describe("watermark terms", () => {
  const WATERMARKS = ["", "PAID", "DRAFT", "CONFIDENTIAL", "COPY", "VOID", "SAMPLE"];

  it.each(WATERMARKS)("'%s' has default terms that appear among its presets", (w) => {
    const terms = getTermsForWatermark(w);
    expect(terms.length).toBeGreaterThan(20);
    expect(getTermsPresetsForWatermark(w).map((p) => p.value)).toContain(terms);
  });

  it.each(WATERMARKS)("'%s' presets have unique non-empty labels/values", (w) => {
    const presets = getTermsPresetsForWatermark(w);
    expect(presets.length).toBeGreaterThanOrEqual(4);
    expect(new Set(presets.map((p) => p.label)).size).toBe(presets.length);
    expect(new Set(presets.map((p) => p.value)).size).toBe(presets.length);
  });

  it("custom/unknown watermark falls back to standard terms", () => {
    expect(getTermsForWatermark("URGENT")).toBe(getTermsForWatermark(""));
    expect(getTermsPresetsForWatermark("URGENT")).toBe(getTermsPresetsForWatermark(""));
  });

  it("PAID/VOID terms say no payment is due", () => {
    expect(getTermsForWatermark("PAID")).toMatch(/paid in full/i);
    expect(getTermsForWatermark("VOID")).toMatch(/no payment is due/i);
  });
});
