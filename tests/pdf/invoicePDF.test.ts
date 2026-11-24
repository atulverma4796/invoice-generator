import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import { generateInvoicePDF } from "@/lib/generatePDF";
import { getStaticSampleInvoice } from "@/lib/sampleInvoice";
import { TEMPLATES } from "@/lib/templates";
import { LANGUAGES, getPdfLabels } from "@/lib/languages";
import { CURRENCIES } from "@/lib/defaultInvoice";
import { calculateSubtotal, calculateDiscount, calculateTax, calculateTotal } from "@/lib/calculations";
import { logOf } from "./helpers/jspdfSpy";
import { currencyFractionDigits } from "@/lib/pdfHelpers";
import {
  stubFontFetch,
  allText,
  textsMatching,
  valueForLabel,
  expectAllTextOnPage,
  expectValidPdf,
  extent,
  contrast,
  moneyValue,
  sameColor,
  NAMES,
  lorem,
  A4,
} from "./helpers/env";
import { backgroundAt, pagesWithText } from "./helpers/layout";
import {
  minimalInvoice,
  fullInvoice,
  items,
  TEMPLATE_IDS,
  PNG_1PX,
  PNG_8x4,
  JPEG_8x4,
  SVG_LOGO,
  LONG_TEXT,
} from "./helpers/fixtures";
import type { InvoiceData } from "@/types/invoice";

beforeEach(() => {
  stubFontFetch();
});

const L = getPdfLabels("en");

async function gen(data: InvoiceData, qr?: string) {
  return generateInvoicePDF(data, qr);
}

function expectedTotals(d: InvoiceData) {
  const subtotal = calculateSubtotal(d.lineItems);
  const discount = calculateDiscount(subtotal, d.discountRate);
  const tax = calculateTax(subtotal, d.taxRate, discount);
  const total = calculateTotal(subtotal, tax, discount) + (d.shippingFee || 0);
  return { subtotal, discount, tax, total };
}

describe("generateInvoicePDF — every template × data shape", () => {
  for (const template of TEMPLATE_IDS) {
    it(`${template}: minimal data renders a valid single-page PDF`, async () => {
      const doc = await gen(minimalInvoice({ template }));
      expectValidPdf(doc);
      expect(doc.getNumberOfPages()).toBe(1);
      expect(allText(doc)).toContain(L.invoice);
      expect(allText(doc)).toContain("Your Business Name"); // placeholder for empty sender
      expectAllTextOnPage(doc);
    });

    it(`${template}: full data (logo, QR, signature, payment, watermark) renders`, async () => {
      const doc = await gen(fullInvoice({ template }), PNG_1PX);
      expectValidPdf(doc);
      const text = allText(doc);
      for (const s of ["Studio Mercer & Co.", "Northwind Trading Co.", "#INV-001245", "PO: PO-7821", "PENDING", "Scan to Pay", "Bank: Wells Fargo"]) {
        expect(text).toContain(s);
      }
      // logo + QR + signature all embedded
      expect(logOf(doc).images.length).toBe(3);
      expectAllTextOnPage(doc);
    });
  }

  it("the gallery sample invoice (SVG signature + QR text) renders for every template", async () => {
    for (const template of TEMPLATE_IDS) {
      const doc = await gen(getStaticSampleInvoice({ template }));
      expectValidPdf(doc);
    }
  });
});

describe("header colours — text must be readable on every template header", () => {
  for (const template of TEMPLATE_IDS) {
    it(`${template}: title, number and sender details contrast ≥ 3:1 with the header`, async () => {
      const doc = await gen(fullInvoice({ template, status: "none" }));
      const headerTexts = logOf(doc).texts.filter((t) => t.page === 1 && t.y < 42 && !t.angle);
      expect(headerTexts.map((t) => t.text)).toEqual(
        expect.arrayContaining([L.invoice, "#INV-001245", "Studio Mercer & Co.", "hello@studiomercer.com"]),
      );
      const headerBg = TEMPLATES[template].headerBg.toLowerCase();
      for (const t of headerTexts) {
        expect(sameColor(backgroundAt(doc, t), headerBg), `${t.text} bg ${backgroundAt(doc, t)}`).toBe(true);
        expect(
          contrast(t.color, headerBg),
          `${template}: "${t.text}" ${t.color} on ${headerBg}`,
        ).toBeGreaterThanOrEqual(3);
      }
    });

    it(`${template}: items-table header text is readable on its fill`, async () => {
      const doc = await gen(fullInvoice({ template }));
      const head = logOf(doc).texts.find((t) => t.text === L.description)!;
      expect(head).toBeDefined();
      const bg = backgroundAt(doc, head);
      expect(sameColor(bg, TEMPLATES[template].primaryColor.toLowerCase()), bg).toBe(true);
      expect(contrast(head.color, bg), `${template}: ${head.color} on ${bg}`).toBeGreaterThanOrEqual(3);
    });
  }

  it("Pastel and Mono headers are no longer white-on-light (regression)", async () => {
    for (const template of ["pastel", "monochrome", "minimal"] as const) {
      const doc = await gen(fullInvoice({ template }));
      const title = logOf(doc).texts.find((t) => t.text === L.invoice)!;
      expect(title.color).not.toBe("#ffffff");
    }
  });
});

describe("totals", () => {
  it("tax is charged on the discounted base; shipping added after tax", async () => {
    const data = minimalInvoice({
      lineItems: [
        { id: "a", description: "A", quantity: 2, rate: 250, amount: 500 },
        { id: "b", description: "B", quantity: 1, rate: 500, amount: 500 },
      ],
      taxRate: 18,
      taxLabel: "GST",
      discountRate: 10,
      shippingFee: 50,
    });
    const doc = await gen(data);
    expect(valueForLabel(doc, L.subtotal)).toBe("$ 1,000.00");
    expect(valueForLabel(doc, `${L.discount} (10%)`)).toBe("-$ 100.00");
    expect(valueForLabel(doc, "GST (18%)")).toBe("$ 162.00"); // 18% of 900, not of 1000
    expect(valueForLabel(doc, L.shipping)).toBe("$ 50.00");
    expect(valueForLabel(doc, L.total.toUpperCase())).toBe("$ 1,112.00");
  });

  it("0% tax, 0% discount and no shipping → no tax/discount/shipping rows", async () => {
    const data = minimalInvoice({ lineItems: items(2, { rate: 100, qty: 1 }), taxLabel: "VAT" });
    const doc = await gen(data);
    const text = allText(doc);
    expect(text).not.toMatch(/VAT|\(0%\)/);
    expect(text).not.toContain(L.discount);
    expect(text).not.toContain(L.shipping);
    expect(valueForLabel(doc, L.total.toUpperCase())).toBe("$ 200.00");
  });

  it("empty tax label falls back to 'Tax'", async () => {
    const doc = await gen(minimalInvoice({ lineItems: items(1, { rate: 100, qty: 1 }), taxRate: 5, taxLabel: "" }));
    expect(valueForLabel(doc, "Tax (5%)")).toBe("$ 5.00");
  });

  it("100% discount → zero tax and zero total", async () => {
    const doc = await gen(minimalInvoice({ lineItems: items(1, { rate: 80, qty: 1 }), taxRate: 20, discountRate: 100 }));
    expect(valueForLabel(doc, L.total.toUpperCase())).toBe("$ 0.00");
    expect(valueForLabel(doc, "Tax (20%)")).toBe("$ 0.00");
  });

  it("fractional cents round consistently (0.1 + 0.2 style inputs)", async () => {
    const li = [
      { id: "a", description: "x", quantity: 3, rate: 0.1, amount: 0.3 },
      { id: "b", description: "y", quantity: 1, rate: 0.2, amount: 0.2 },
    ];
    const doc = await gen(minimalInvoice({ lineItems: li, taxRate: 7.5 }));
    const e = expectedTotals(minimalInvoice({ lineItems: li, taxRate: 7.5 }));
    expect(moneyValue(valueForLabel(doc, L.total.toUpperCase()))).toBeCloseTo(e.total, 2);
    expect(valueForLabel(doc, L.subtotal)).toBe("$ 0.50");
  });

  it("late-fee notice only when a late fee is set", async () => {
    const a = await gen(minimalInvoice({ lateFeeRate: 2 }));
    expect(allText(a)).toContain("Late fee: 2% per month");
    const b = await gen(minimalInvoice({ lateFeeRate: 0 }));
    expect(allText(b)).not.toContain("Late fee");
  });
});

describe("money formatting", () => {
  const big = [{ id: "a", description: "Big", quantity: 1, rate: 1234567.5, amount: 1234567.5 }];

  it("thousands separators for 2-decimal currencies", async () => {
    const doc = await gen(minimalInvoice({ lineItems: big, currency: "USD" }));
    expect(valueForLabel(doc, L.total.toUpperCase())).toBe("$ 1,234,567.50");
  });

  it("JPY / KRW have no decimals", async () => {
    const jpy = await gen(minimalInvoice({ lineItems: big, currency: "JPY" }));
    expect(valueForLabel(jpy, L.total.toUpperCase())).toBe("¥ 1,234,568");
    const krw = await gen(minimalInvoice({ lineItems: big, currency: "KRW" }));
    expect(valueForLabel(krw, L.total.toUpperCase())).toBe("W 1,234,568");
    expect(allText(krw)).not.toMatch(/\d\.\d\d/);
  });

  it("INR uses the PDF-safe 'Rs.' prefix", async () => {
    const doc = await gen(minimalInvoice({ lineItems: big, currency: "INR" }));
    expect(valueForLabel(doc, L.total.toUpperCase())).toBe("Rs. 1,234,567.50");
  });

  it("every supported currency produces a PDF whose total parses back to the computed figure", async () => {
    const data = (currency: string) =>
      minimalInvoice({ lineItems: items(3), currency, taxRate: 12.5, discountRate: 3, shippingFee: 9.99 });
    for (const { code } of CURRENCIES) {
      const d = data(code);
      const doc = await gen(d);
      const shown = moneyValue(valueForLabel(doc, L.total.toUpperCase()));
      const decimals = currencyFractionDigits(code);
      expect(shown, code).toBeCloseTo(Number(expectedTotals(d).total.toFixed(decimals)), decimals);
      if (decimals === 0) expect(valueForLabel(doc, L.total.toUpperCase()), code).not.toMatch(/\d\.\d/);
    }
  });
});

describe("many line items (multi-page)", () => {
  for (const n of [1, 40, 120]) {
    it(`${n} items: header repeats on every page, totals on-page and correct`, async () => {
      const data = fullInvoice({ lineItems: items(n), terms: "", notes: "" });
      const doc = await gen(data, PNG_1PX);
      const pages = doc.getNumberOfPages();
      if (n >= 40) expect(pages).toBeGreaterThan(1);
      else expect(pages).toBe(1);

      // Column header on every page that has table rows.
      const rowPages = [...new Set(logOf(doc).texts.filter((t) => /^Item \d+/.test(t.text)).map((t) => t.page))];
      const headPages = pagesWithText(doc, L.description);
      for (const p of rowPages) expect(headPages).toContain(p);
      // every row drawn exactly once
      expect(textsMatching(doc, /^Item \d+ /).length).toBe(n);

      const totalLabel = logOf(doc).texts.find((t) => t.text === L.total.toUpperCase())!;
      expect(totalLabel.y).toBeLessThan(A4.h - 10);
      expect(moneyValue(valueForLabel(doc, L.total.toUpperCase()))).toBeCloseTo(expectedTotals(data).total, 2);
      expectAllTextOnPage(doc);
    });
  }

  it("totals block never splits from its own rows (all totals rows on the same page)", async () => {
    for (const n of [18, 19, 20, 21, 22, 23, 24, 25, 26]) {
      const doc = await gen(fullInvoice({ lineItems: items(n), terms: "", notes: "" }));
      const lbls = [L.subtotal, "Tax (10%)", `${L.discount} (5%)`, L.shipping, L.total.toUpperCase()];
      const pages = lbls.map((l) => logOf(doc).texts.find((t) => t.text === l)!.page);
      expect(new Set(pages).size, `n=${n}`).toBe(1);
      expectAllTextOnPage(doc);
    }
  });

  it("very long item descriptions wrap inside the table", async () => {
    const doc = await gen(minimalInvoice({ lineItems: items(5, { desc: () => lorem(80) }) }));
    expectAllTextOnPage(doc);
  });
});

describe("long text: notes / terms / names / addresses", () => {
  it("very long terms and notes wrap and continue onto new pages", async () => {
    const doc = await gen(fullInvoice({ terms: LONG_TEXT + " " + LONG_TEXT, notes: LONG_TEXT }));
    expect(doc.getNumberOfPages()).toBeGreaterThan(2);
    expectAllTextOnPage(doc, { bottom: A4.h - 10 });
    // nothing in the terms block is a single giant multi-line call
    for (const t of logOf(doc).texts) expect(t.lines.length).toBeLessThan(60);
  });

  it("long sender/client names and addresses wrap within their columns (no overlap)", async () => {
    const longName = "International Consolidated Holdings & Subsidiaries Worldwide Limited Liability Partnership";
    const longAddr = "Building 42, Very Long Industrial Estate Road Name That Goes On And On, Near The Old Railway Station, District Something";
    const doc = await gen(
      fullInvoice({ senderName: longName, clientName: longName, senderAddress: longAddr, clientAddress: longAddr + "\n" + longAddr }),
    );
    expectAllTextOnPage(doc);
    const body = logOf(doc).texts.filter((t) => t.page === 1 && t.y > 45 && t.y < 88 && !t.align);
    const fromCol = body.filter((t) => t.x < 80);
    const billCol = body.filter((t) => t.x >= 80);
    expect(fromCol.length).toBeGreaterThan(3);
    expect(billCol.length).toBeGreaterThan(3);
    for (const t of fromCol) expect(extent(t)[1], t.text).toBeLessThanOrEqual(80);
    // Bill To must stay clear of the right-aligned date column
    const dateTexts = logOf(doc).texts.filter((t) => t.page === 1 && t.align === "right" && t.y > 45 && t.y < 75);
    const dateLeft = Math.min(...dateTexts.map((t) => extent(t)[0]));
    for (const t of billCol) expect(extent(t)[1], t.text).toBeLessThan(dateLeft);
  });

  it("long sender name in the header wraps and never collides with the title", async () => {
    const doc = await gen(fullInvoice({ senderName: "A".repeat(10) + " " + "Extraordinarily Long Business Name Pvt Ltd ".repeat(4), status: "none" }));
    const title = logOf(doc).texts.find((t) => t.text === L.invoice)!;
    const titleRight = extent(title)[1];
    const right = logOf(doc).texts.filter((t) => t.page === 1 && t.y < 42 && t.align === "right");
    expect(right.length).toBeGreaterThan(1);
    for (const t of right) {
      expect(extent(t)[0], t.text).toBeGreaterThan(titleRight);
      expect(t.y).toBeLessThanOrEqual(41);
    }
  });
});

describe("client tax ID", () => {
  it("shows the client's GSTIN with the country label (INR)", async () => {
    const doc = await gen(fullInvoice({ currency: "INR", clientTaxId: "29ABCDE1234F1Z5" }));
    expect(allText(doc)).toContain("GSTIN: 29ABCDE1234F1Z5");
  });

  it("uses VAT / TRN / generic labels per currency", async () => {
    const gbp = await gen(fullInvoice({ currency: "GBP", clientTaxId: "GB123456789" }));
    expect(allText(gbp)).toContain("VAT Number: GB123456789");
    const aed = await gen(fullInvoice({ currency: "AED", clientTaxId: "100123456700003" }));
    expect(allText(aed)).toContain("TRN: 100123456700003");
    const usd = await gen(fullInvoice({ currency: "USD", clientTaxId: "12-3456789" }));
    expect(allText(usd)).toContain("Tax ID: 12-3456789");
  });

  it("is omitted when empty or whitespace", async () => {
    const doc = await gen(fullInvoice({ currency: "INR", clientTaxId: "   " }));
    expect(allText(doc)).not.toContain("GSTIN");
  });
});

describe("images (logo / signature / QR)", () => {
  it("PNG logo embedded as PNG, JPEG logo embedded as JPEG", async () => {
    const png = await gen(minimalInvoice({ logo: PNG_1PX }));
    expect(logOf(png).images.map((i) => i.format)).toEqual(["PNG"]);
    const jpg = await gen(minimalInvoice({ logo: JPEG_8x4 }));
    expect(logOf(jpg).images.map((i) => i.format)).toEqual(["JPEG"]);
  });

  it("logo keeps its aspect ratio inside the 20mm box", async () => {
    const doc = await gen(minimalInvoice({ logo: PNG_8x4 }));
    const img = logOf(doc).images[0];
    expect(img.w).toBeCloseTo(20, 5);
    expect(img.h).toBeCloseTo(10, 5);
    // title moves right of the logo
    const title = logOf(doc).texts.find((t) => t.text === L.invoice)!;
    expect(title.x).toBeGreaterThan(img.x + img.w);
  });

  it("SVG logo/signature: skipped without a canvas (server/tests), PDF still generated", async () => {
    // Decision: jsPDF cannot embed SVG. In the browser it is rasterised to
    // PNG via canvas (pdfHelpers.rasterizeSvgDataUrl); without a canvas it
    // is left out rather than crashing or being mis-labelled as PNG.
    const doc = await gen(minimalInvoice({ logo: SVG_LOGO, signature: SVG_LOGO }));
    expectValidPdf(doc);
    expect(logOf(doc).images).toHaveLength(0);
    const title = logOf(doc).texts.find((t) => t.text === L.invoice)!;
    expect(title.x).toBe(15); // no gap reserved for a missing logo
  });

  it("corrupt / non-image data URLs never crash generation", async () => {
    for (const bad of ["data:image/png;base64,AAAA", "not-a-data-url", "data:text/plain;base64,aGVsbG8="]) {
      const doc = await gen(minimalInvoice({ logo: bad, signature: bad }), bad);
      expectValidPdf(doc);
    }
  });
});

describe("watermark & status", () => {
  it("watermark is drawn once on every page", async () => {
    const doc = await gen(fullInvoice({ lineItems: items(60), watermark: "DRAFT" }));
    const pages = doc.getNumberOfPages();
    expect(pages).toBeGreaterThan(1);
    expect(pagesWithText(doc, "DRAFT")).toEqual(Array.from({ length: pages }, (_, i) => i + 1));
  });

  it("status badge text per status, none → no badge", async () => {
    for (const s of ["draft", "pending", "paid", "overdue", "custom-status"]) {
      const doc = await gen(minimalInvoice({ status: s }));
      expect(allText(doc)).toContain(s.toUpperCase());
    }
    const none = await gen(minimalInvoice({ status: "none" }));
    expect(allText(none)).not.toMatch(/DRAFT|PENDING|PAID|OVERDUE/);
  });
});

describe("languages & scripts", () => {
  it("every UI language produces a PDF with its translated labels", async () => {
    for (const { code } of LANGUAGES) {
      const labels = getPdfLabels(code);
      const doc = await gen(fullInvoice({ language: code }));
      expectValidPdf(doc);
      expect(allText(doc), code).toContain(labels.invoice);
    }
  });

  for (const [script, name] of Object.entries(NAMES)) {
    it(`${script} names/addresses/items do not crash`, async () => {
      const doc = await gen(
        fullInvoice({
          senderName: name,
          clientName: name,
          clientAddress: `${name}\n${name}`,
          notes: name,
          lineItems: items(3, { desc: () => name }),
        }),
      );
      expectValidPdf(doc);
      expect(allText(doc)).toContain(name);
    });
  }

  for (const script of ["latin", "cyrillic", "greek"] as const) {
    it(`${script} text is drawn in NotoSans and every glyph exists in the embedded font`, async () => {
      const name = NAMES[script];
      const doc = await gen(fullInvoice({ clientName: name }));
      const t = logOf(doc).texts.find((x) => x.text === name)!;
      expect(t.font).toBe("NotoSans");
      doc.setFont("NotoSans", t.fontStyle);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const codeMap = (doc.getFont() as any).metadata.cmap.unicode.codeMap as Record<number, number>;
      for (const ch of name.replace(/\s/g, "")) {
        expect(codeMap[ch.codePointAt(0)!], `missing glyph "${ch}"`).toBeGreaterThan(0);
      }
    });
  }

  it.skip("KNOWN LIMITATION: Hindi / Arabic / Chinese glyphs are not in the bundled NotoSans (Latin+Greek+Cyrillic only)", () => {
    // pdfFont.ts ships only NotoSans Regular/Bold/Italic (~600KB each script
    // subset would be needed for Devanagari, Arabic and CJK, and Arabic also
    // needs shaping/RTL which jsPDF does not do). These names generate a PDF
    // without crashing (tested above) but render as blank/tofu glyphs.
    // Product decision: add NotoSansDevanagari / NotoSansArabic / NotoSansSC
    // to /public/fonts and FONT_SOURCES when demand justifies the payload.
  });
});
