import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());
import { stubFontFetch, expectValidPdf } from "./helpers/env";

// pdfFont memoises at module level, so each test gets a fresh module graph.
beforeEach(() => {
  vi.resetModules();
});

async function load() {
  const font = await import("@/lib/pdfFont");
  const { default: jsPDF } = await import("jspdf");
  const { generateInvoicePDF } = await import("@/lib/generatePDF");
  const { minimalInvoice } = await import("./helpers/fixtures");
  // The spy registry is per module instance — re-import it after resetModules.
  const { logOf } = await import("./helpers/jspdfSpy");
  const { allText } = await import("./helpers/env");
  return { ...font, jsPDF, generateInvoicePDF, minimalInvoice, logOf, allText };
}

describe("applyUnicodeFont", () => {
  it("registers NotoSans normal/bold/italic and makes it the current font", async () => {
    stubFontFetch();
    const { applyUnicodeFont, PDF_FONT_FAMILY, jsPDF } = await load();
    const doc = new jsPDF();
    expect(await applyUnicodeFont(doc)).toBe(true);
    expect(doc.getFont().fontName).toBe(PDF_FONT_FAMILY);
    const list = doc.getFontList()[PDF_FONT_FAMILY];
    expect(list).toEqual(expect.arrayContaining(["normal", "bold", "italic"]));
  });

  it("fetches each TTF once per page-load (memoised across documents)", async () => {
    const fetchMock = stubFontFetch();
    const { applyUnicodeFont, jsPDF } = await load();
    await applyUnicodeFont(new jsPDF());
    await applyUnicodeFont(new jsPDF());
    await applyUnicodeFont(new jsPDF());
    expect(fetchMock).toHaveBeenCalledTimes(3); // 3 files, once each
    expect(fetchMock.mock.calls.map((c) => c[0]).sort()).toEqual([
      "/fonts/NotoSans-Bold.ttf",
      "/fonts/NotoSans-Italic.ttf",
      "/fonts/NotoSans-Regular.ttf",
    ]);
  });

  it("falls back to helvetica (returns false) when the font cannot be fetched — PDF still generated", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 404 })));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { applyUnicodeFont, jsPDF, generateInvoicePDF, minimalInvoice, logOf, allText } = await load();
    expect(await applyUnicodeFont(new jsPDF())).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
    const doc = await generateInvoicePDF(minimalInvoice({ senderName: "Acme" }));
    expectValidPdf(doc);
    expect(allText(doc)).toContain("Acme");
    expect(logOf(doc).texts.every((t) => t.font === "helvetica")).toBe(true);
  });

  it("network rejection (offline) is non-fatal too", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { generateInvoicePDF, minimalInvoice } = await load();
    const doc = await generateInvoicePDF(minimalInvoice());
    expectValidPdf(doc);
  });

  it("every generator uses NotoSans for all text when the font loads", async () => {
    stubFontFetch();
    const { logOf } = await load();
    const { generateQuotationPDF } = await import("@/lib/generateQuotationPDF");
    const { generatePurchaseOrderPDF } = await import("@/lib/generatePurchaseOrderPDF");
    const { generateDeliveryNotePDF } = await import("@/lib/generateDeliveryNotePDF");
    const { generateSalarySlipPDF } = await import("@/lib/generateSalarySlipPDF");
    const { generateRentReceiptPDF } = await import("@/lib/generateRentReceiptPDF");
    const { generateInvoicePDF } = await import("@/lib/generatePDF");
    const f = await import("./helpers/fixtures");
    const docs = [
      await generateInvoicePDF(f.fullInvoice()),
      await generateQuotationPDF(f.quotation()),
      await generatePurchaseOrderPDF(f.purchaseOrder()),
      await generateDeliveryNotePDF(f.deliveryNote()),
      await generateSalarySlipPDF(f.salarySlip()),
      await generateRentReceiptPDF({ data: f.rentReceipt(), groups: [["2025-04"]] }),
    ];
    for (const d of docs) {
      const fonts = new Set(logOf(d).texts.map((t) => t.font));
      expect([...fonts]).toEqual(["NotoSans"]);
    }
  });
});
