import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import { generatePurchaseOrderPDF } from "@/lib/generatePurchaseOrderPDF";
import { computePurchaseOrderTotals } from "@/components/PurchaseOrderForm";
import { logOf } from "./helpers/jspdfSpy";
import {
  stubFontFetch,
  allText,
  valueForLabel,
  expectAllTextOnPage,
  expectValidPdf,
  extent,
  moneyValue,
  NAMES,
  A4,
  FOOTER_RE,
} from "./helpers/env";
import { pagesWithText } from "./helpers/layout";
import { purchaseOrder, minimalPurchaseOrder, quoteItems, LONG_TEXT } from "./helpers/fixtures";

beforeEach(() => {
  stubFontFetch();
});

describe("computePurchaseOrderTotals", () => {
  it("discount → tax on discounted base → untaxed shipping", () => {
    // 500×0.35 + 500×0.05 = 200; −5% = 190; +8% = 15.2; +40 → 245.2
    expect(computePurchaseOrderTotals(purchaseOrder())).toEqual({ subtotal: 200, discount: 10, tax: 15.2, shipping: 40, total: 245.2 });
  });
  it("no tax/discount/shipping", () => {
    expect(computePurchaseOrderTotals(purchaseOrder({ taxRate: 0, discountRate: 0, shippingFee: 0 })).total).toBe(200);
  });
  it("shipping only (empty items)", () => {
    expect(computePurchaseOrderTotals(purchaseOrder({ lineItems: [], shippingFee: 12.5 })).total).toBe(12.5);
  });
});

describe("generatePurchaseOrderPDF", () => {
  it("minimal data → valid 1-page PDF, signatory line present", async () => {
    const doc = await generatePurchaseOrderPDF(minimalPurchaseOrder());
    expectValidPdf(doc);
    expect(doc.getNumberOfPages()).toBe(1);
    expect(allText(doc)).toContain("PURCHASE ORDER");
    expect(allText(doc)).toContain("Authorized Signatory");
    expect(allText(doc)).not.toContain("SHIP TO");
    expectAllTextOnPage(doc);
  });

  it("full data → totals rows and ship-to", async () => {
    const doc = await generatePurchaseOrderPDF(purchaseOrder());
    expect(valueForLabel(doc, "Subtotal")).toBe("$200.00");
    expect(valueForLabel(doc, "Discount (5%)")).toBe("-$10.00");
    expect(valueForLabel(doc, "Sales Tax (8%)")).toBe("$15.20");
    expect(valueForLabel(doc, "Shipping")).toBe("$40.00");
    expect(valueForLabel(doc, "PO Total")).toBe("$245.20");
    expect(allText(doc)).toContain("SHIP TO");
    expect(allText(doc)).toContain("Warehouse 7, Dock B, Reno NV");
    expectAllTextOnPage(doc);
  });

  it("0% tax / no shipping → rows omitted", async () => {
    const doc = await generatePurchaseOrderPDF(purchaseOrder({ taxRate: 0, discountRate: 0, shippingFee: 0 }));
    expect(allText(doc)).not.toMatch(/Sales Tax|Discount|Shipping/);
  });

  it("INR uses Rs. prefix with grouping", async () => {
    const doc = await generatePurchaseOrderPDF(purchaseOrder({ currency: "INR", lineItems: [{ id: "a", description: "x", quantity: 10, rate: 123456.78 }], taxRate: 0, discountRate: 0, shippingFee: 0 }));
    expect(valueForLabel(doc, "PO Total")).toBe("Rs. 1,234,567.80");
  });

  for (const n of [40, 120]) {
    it(`${n} items → header repeats, totals + signature on-page`, async () => {
      const data = purchaseOrder({ lineItems: quoteItems(n) });
      const doc = await generatePurchaseOrderPDF(data);
      expect(doc.getNumberOfPages()).toBeGreaterThan(1);
      const rowPages = [...new Set(logOf(doc).texts.filter((t) => /^Line \d+$/.test(t.text)).map((t) => t.page))];
      expect(pagesWithText(doc, "DESCRIPTION")).toEqual(rowPages);
      expect(moneyValue(valueForLabel(doc, "PO Total"))).toBeCloseTo(computePurchaseOrderTotals(data).total, 2);
      expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
    });
  }

  it("long notes/terms/ship-to continue across pages", async () => {
    const doc = await generatePurchaseOrderPDF(purchaseOrder({ notes: LONG_TEXT, terms: LONG_TEXT, shipToAddress: LONG_TEXT.slice(0, 600) }));
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
  });

  it("long buyer/vendor names and addresses stay in their columns", async () => {
    const long = "Very Long Buyer Organisation Name International Holdings Private Limited Company Group";
    const doc = await generatePurchaseOrderPDF(purchaseOrder({ buyerName: long, vendorName: long, buyerAddress: long, vendorAddress: long }));
    expectAllTextOnPage(doc);
    const mid = A4.w / 2;
    for (const t of logOf(doc).texts.filter((t) => t.page === 1 && t.y > 45 && t.y < 100 && !t.align)) {
      const [l, r] = extent(t);
      if (l < mid) expect(r, t.text).toBeLessThan(mid + 4);
    }
  });

  for (const [script, name] of Object.entries(NAMES)) {
    it(`${script} text does not crash`, async () => {
      const doc = await generatePurchaseOrderPDF(purchaseOrder({ buyerName: name, vendorName: name, shipToAddress: name, lineItems: [{ id: "a", description: name, quantity: 1, rate: 1 }] }));
      expectValidPdf(doc);
      expect(allText(doc)).toContain(name);
    });
  }
});
