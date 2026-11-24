// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());
vi.mock("@/components/QRCodeSection", () => ({
  generateQRDataURL: vi.fn(async () => "data:image/png;base64,iVBORw0KGgo="),
  default: () => null,
}));

import { render, screen, cleanup, within } from "@testing-library/react";
import InvoicePreview from "@/components/InvoicePreview";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import { generateInvoicePDF } from "@/lib/generatePDF";
import { getLabels, getPdfLabels } from "@/lib/languages";
import { TEMPLATES } from "@/lib/templates";
import { invoiceHeaderColors } from "@/lib/pdfHelpers";
import { logOf } from "./helpers/jspdfSpy";
import { stubFontFetch, valueForLabel, moneyValue, sameColor, contrast } from "./helpers/env";
import { fullInvoice, minimalInvoice, items, TEMPLATE_IDS } from "./helpers/fixtures";
import type { InvoiceData } from "@/types/invoice";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeEach(() => {
  cleanup();
  stubFontFetch();
});

const UI = getLabels("en");
const PDF = getPdfLabels("en");

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m) return rgb.toLowerCase();
  return "#" + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("");
}

/** Text of the value cell next to a totals label in the preview. */
function previewValue(label: string): string {
  const el = screen.getAllByText(label, { exact: true }).find((e) => e.tagName === "SPAN")!;
  return el.nextElementSibling!.textContent!;
}

async function pdfTotals(data: InvoiceData) {
  const doc = await generateInvoicePDF(data);
  return {
    doc,
    subtotal: valueForLabel(doc, PDF.subtotal),
    tax: valueForLabel(doc, `${data.taxLabel || "Tax"} (${data.taxRate}%)`),
    discount: valueForLabel(doc, `${PDF.discount} (${data.discountRate}%)`),
    shipping: valueForLabel(doc, PDF.shipping),
    total: valueForLabel(doc, PDF.total.toUpperCase()),
  };
}

describe("InvoicePreview totals match the PDF", () => {
  const cases: [string, Partial<InvoiceData>][] = [
    ["USD with tax+discount+shipping", { currency: "USD", taxRate: 18, discountRate: 10, shippingFee: 49.99 }],
    ["EUR big numbers", { currency: "EUR", lineItems: items(40, { rate: 12345.67 }), taxRate: 21, discountRate: 0, shippingFee: 0 }],
    ["JPY (no decimals)", { currency: "JPY", lineItems: items(3, { rate: 1999.5 }), taxRate: 10, discountRate: 0, shippingFee: 0 }],
    ["INR 1 item", { currency: "INR", lineItems: items(1, { rate: 99999.99 }), taxRate: 18, discountRate: 2.5, shippingFee: 0 }],
    ["0% tax", { currency: "GBP", taxRate: 0, discountRate: 0, shippingFee: 0 }],
  ];

  for (const [name, overrides] of cases) {
    it(name, async () => {
      const data = fullInvoice(overrides);
      render(<InvoicePreview data={data} />);
      const pdf = await pdfTotals(data);
      expect(moneyValue(previewValue(UI.subtotal))).toBe(moneyValue(pdf.subtotal));
      expect(moneyValue(previewValue(UI.total))).toBe(moneyValue(pdf.total));
      if (data.taxRate > 0) {
        expect(moneyValue(previewValue(`${data.taxLabel} (${data.taxRate}%)`))).toBe(moneyValue(pdf.tax));
      } else {
        expect(screen.queryByText(/\(0%\)/)).toBeNull();
        expect(pdf.tax).toBeUndefined();
      }
      if (data.discountRate > 0) expect(moneyValue(previewValue(`${UI.discount} (${data.discountRate}%)`))).toBe(moneyValue(pdf.discount));
      if (data.shippingFee > 0) expect(moneyValue(previewValue(UI.shipping))).toBe(moneyValue(pdf.shipping));
      // Same digits, grouping and decimals — only the symbol spacing differs.
      expect(previewValue(UI.total).replace(/[^\d.,]/g, "")).toBe(pdf.total!.replace(/[^\d.,]/g, "").replace(/^\./, ""));
    });
  }

  it("JPY shows no decimals in the preview either", () => {
    render(<InvoicePreview data={fullInvoice({ currency: "JPY", lineItems: items(2, { rate: 1500 }) })} />);
    expect(previewValue(UI.total)).not.toMatch(/\.\d\d$/);
    expect(previewValue(UI.total)).toMatch(/,/);
  });
});

describe("InvoicePreview header colours match the PDF for every template", () => {
  for (const template of TEMPLATE_IDS) {
    it(template, async () => {
      const data = fullInvoice({ template });
      const { container } = render(<InvoicePreview data={data} />);
      const header = container.querySelector("#invoice-preview > div.px-8.py-6") as HTMLElement;
      const bg = rgbToHex(header.style.backgroundColor);
      const fg = rgbToHex(header.style.color);
      expect(bg).toBe(TEMPLATES[template].headerBg.toLowerCase());
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);

      const doc = await generateInvoicePDF(data);
      const title = logOf(doc).texts.find((t) => t.text === PDF.invoice)!;
      expect(sameColor(title.color, fg), `pdf ${title.color} vs preview ${fg}`).toBe(true);
    });
  }
});

describe("client tax ID in the preview", () => {
  it("shows label + value when present", () => {
    render(<InvoicePreview data={fullInvoice({ currency: "INR", clientTaxId: "29ABCDE1234F1Z5" })} />);
    expect(screen.getByText("GSTIN: 29ABCDE1234F1Z5")).toBeInTheDocument();
  });
  it("hidden when empty", () => {
    render(<InvoicePreview data={fullInvoice({ currency: "INR", clientTaxId: "" })} />);
    expect(screen.queryByText(/GSTIN/)).toBeNull();
  });
});

describe("InvoicePreview robustness", () => {
  it("renders minimal data with placeholders", () => {
    render(<InvoicePreview data={minimalInvoice()} />);
    expect(screen.getByText("Your Business Name")).toBeInTheDocument();
  });
  it("renders 40 line items", () => {
    const { container } = render(<InvoicePreview data={fullInvoice({ lineItems: items(40) })} />);
    expect(within(container).getAllByText(/^Item \d+ /)).toHaveLength(40);
  });
});

describe("TemplatePreviewCard thumbnail header uses the shared contrast logic", () => {
  for (const template of TEMPLATE_IDS) {
    it(template, () => {
      const { container } = render(<TemplatePreviewCard templateId={template} data={fullInvoice()} />);
      const header = container.querySelector<HTMLElement>("div.px-3.py-2.relative.z-20")!;
      expect(header).not.toBeNull();
      expect(rgbToHex(header.style.backgroundColor)).toBe(TEMPLATES[template].headerBg.toLowerCase());
      const expected = invoiceHeaderColors(template, TEMPLATES[template].headerBg, TEMPLATES[template].primaryColor);
      expect(rgbToHex(header.style.color)).toBe(expected.text.toLowerCase());
    });
  }
});
