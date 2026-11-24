import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import { generateQuotationPDF } from "@/lib/generateQuotationPDF";
import { computeQuotationTotals } from "@/components/QuotationForm";
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
import { quotation, minimalQuotation, quoteItems, LONG_TEXT } from "./helpers/fixtures";

beforeEach(() => {
  stubFontFetch();
});

describe("computeQuotationTotals", () => {
  it("tax on the discounted base", () => {
    // 2×1500 + 2000 = 5000; −10% = 4500; +18% = 810 → 5310
    expect(computeQuotationTotals(quotation())).toEqual({ subtotal: 5000, discount: 500, tax: 810, total: 5310 });
  });
  it("0% tax and 0% discount", () => {
    expect(computeQuotationTotals(quotation({ taxRate: 0, discountRate: 0 }))).toEqual({ subtotal: 5000, discount: 0, tax: 0, total: 5000 });
  });
  it("rounds to cents at every step (no 0.1+0.2 drift)", () => {
    const t = computeQuotationTotals(quotation({ lineItems: [{ id: "a", description: "x", quantity: 3, rate: 0.1 }], taxRate: 0, discountRate: 0 }));
    expect(t.subtotal).toBe(0.3);
    const h = computeQuotationTotals(quotation({ lineItems: [{ id: "a", description: "x", quantity: 1, rate: 1.005 }], taxRate: 0, discountRate: 0 }));
    expect(Number.isInteger(Math.round(h.total * 100))).toBe(true);
  });
  it("NaN-safe for blank rows", () => {
    const t = computeQuotationTotals(quotation({ lineItems: [{ id: "a", description: "", quantity: 0, rate: 0 }] }));
    expect(t.total).toBe(0);
  });
});

describe("generateQuotationPDF", () => {
  it("minimal data → valid 1-page PDF with placeholders", async () => {
    const doc = await generateQuotationPDF(minimalQuotation());
    expectValidPdf(doc);
    expect(doc.getNumberOfPages()).toBe(1);
    expect(allText(doc)).toContain("QUOTATION");
    expectAllTextOnPage(doc);
  });

  it("full data → totals rows match computeQuotationTotals", async () => {
    const data = quotation();
    const doc = await generateQuotationPDF(data);
    expectValidPdf(doc);
    expect(valueForLabel(doc, "Subtotal")).toBe("Rs. 5,000.00");
    expect(valueForLabel(doc, "Discount (10%)")).toBe("-Rs. 500.00");
    expect(valueForLabel(doc, "GST (18%)")).toBe("Rs. 810.00");
    expect(valueForLabel(doc, "Estimated Total")).toBe("Rs. 5,310.00");
    expect(allText(doc)).toContain("Tax ID: 29ABCDE1234F1Z5");
    expectAllTextOnPage(doc);
  });

  it("0% tax → no tax row; 0% discount → no discount row", async () => {
    const doc = await generateQuotationPDF(quotation({ taxRate: 0, discountRate: 0 }));
    expect(allText(doc)).not.toMatch(/GST|Discount/);
    expect(valueForLabel(doc, "Estimated Total")).toBe("Rs. 5,000.00");
  });

  it("every form currency renders with its symbol and grouped amounts", async () => {
    const symbols: Record<string, string> = { INR: "Rs. ", USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$", AED: "AED", SGD: "S$" };
    for (const [code, sym] of Object.entries(symbols)) {
      const doc = await generateQuotationPDF(quotation({ currency: code, lineItems: [{ id: "a", description: "x", quantity: 1, rate: 1234567.891 }], taxRate: 0, discountRate: 0 }));
      expect(valueForLabel(doc, "Estimated Total"), code).toBe(`${sym}1,234,567.89`);
    }
  });

  for (const n of [40, 120]) {
    it(`${n} line items → multi-page, table header on every page, totals on-page`, async () => {
      const data = quotation({ lineItems: quoteItems(n) });
      const doc = await generateQuotationPDF(data);
      expect(doc.getNumberOfPages()).toBeGreaterThan(1);
      const rowPages = [...new Set(logOf(doc).texts.filter((t) => /^Line \d+$/.test(t.text)).map((t) => t.page))];
      const headPages = pagesWithText(doc, "DESCRIPTION");
      expect(headPages).toEqual(rowPages);
      expect(logOf(doc).texts.filter((t) => /^Line \d+$/.test(t.text))).toHaveLength(n);
      const total = logOf(doc).texts.find((t) => t.text === "Estimated Total")!;
      expect(total.y).toBeLessThan(A4.h - 15);
      expect(moneyValue(valueForLabel(doc, "Estimated Total"))).toBeCloseTo(computeQuotationTotals(data).total, 2);
      expectAllTextOnPage(doc);
    });
  }

  it("very long notes and terms continue across pages without running off", async () => {
    const doc = await generateQuotationPDF(quotation({ notes: LONG_TEXT, terms: LONG_TEXT }));
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
  });

  it("long multi-line descriptions wrap and still page-break cleanly", async () => {
    const li = Array.from({ length: 30 }, (_, i) => ({ id: `${i}`, description: LONG_TEXT.slice(0, 400), quantity: 1, rate: 10 }));
    const doc = await generateQuotationPDF(quotation({ lineItems: li }));
    expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
  });

  it("long names/addresses stay inside their column", async () => {
    const long = "Consolidated International Trading and Manufacturing Company of Greater Southern Regions Limited";
    const doc = await generateQuotationPDF(quotation({ senderName: long, clientName: long, senderAddress: long, clientAddress: long, senderEmail: "x".repeat(70) + "@example.com" }));
    expectAllTextOnPage(doc);
    const mid = A4.w / 2;
    for (const t of logOf(doc).texts.filter((t) => t.page === 1 && t.y > 45 && t.y < 100 && !t.align)) {
      const [l, r] = extent(t);
      if (l < mid) expect(r, t.text).toBeLessThan(mid + 4);
    }
  });

  for (const [script, name] of Object.entries(NAMES)) {
    it(`${script} text does not crash`, async () => {
      const doc = await generateQuotationPDF(quotation({ senderName: name, clientName: name, lineItems: [{ id: "a", description: name, quantity: 1, rate: 5 }], notes: name }));
      expectValidPdf(doc);
      expect(allText(doc)).toContain(name);
    });
  }

  it("skips fully blank rows but keeps zero-priced described rows", async () => {
    const doc = await generateQuotationPDF(
      quotation({ lineItems: [{ id: "a", description: "", quantity: 0, rate: 0 }, { id: "b", description: "Free survey", quantity: 1, rate: 0 }] }),
    );
    expect(allText(doc)).toContain("Free survey");
    expect(logOf(doc).texts.filter((t) => t.text === "—")).toHaveLength(0);
  });
});
