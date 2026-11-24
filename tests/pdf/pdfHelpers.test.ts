import { describe, it, expect, vi } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import jsPDF from "jspdf";
import {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  isLightColor,
  readableTextOn,
  invoiceHeaderColors,
  currencyFractionDigits,
  formatAmount,
  imageFormatFromDataUrl,
  toPdfImage,
  rasterizeSvgDataUrl,
  fitImage,
  drawWrappedText,
  clientTaxIdDisplayLabel,
} from "@/lib/pdfHelpers";
import { TEMPLATES, COLOR_PRESETS } from "@/lib/templates";
import { logOf } from "./helpers/jspdfSpy";
import { PNG_1PX, PNG_8x4, JPEG_8x4, SVG_LOGO, LONG_TEXT } from "./helpers/fixtures";

describe("colour helpers", () => {
  it("hexToRgb handles #rrggbb, rrggbb, #rgb and garbage", () => {
    expect(hexToRgb("#f5f0e8")).toEqual([245, 240, 232]);
    expect(hexToRgb("FFFFFF")).toEqual([255, 255, 255]);
    expect(hexToRgb("#fff")).toEqual([255, 255, 255]);
    expect(hexToRgb("nope")).toEqual([0, 0, 0]);
    expect(hexToRgb("")).toEqual([0, 0, 0]);
  });

  it("luminance and contrast match WCAG reference values", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("isLightColor classifies template headers", () => {
    expect(isLightColor("#f9fafb")).toBe(true); // minimal
    expect(isLightColor("#f5f0e8")).toBe(true); // pastel
    expect(isLightColor("#ffffff")).toBe(true); // mono
    expect(isLightColor("#1c1c1e")).toBe(false); // executive
    expect(isLightColor("#2563eb")).toBe(false);
  });

  it("readableTextOn keeps a legible preference, else picks white/near-black", () => {
    expect(readableTextOn("#2563eb", "#ffffff")).toBe("#ffffff");
    expect(readableTextOn("#ffffff", "#ffffff")).toBe("#1f2937");
    expect(readableTextOn("#d4a843", "#ffffff")).toBe("#1f2937"); // white on gold is 2.1:1
    expect(readableTextOn("#000000")).toBe("#ffffff");
  });

  for (const [id, tpl] of Object.entries(TEMPLATES)) {
    it(`invoiceHeaderColors(${id}) is readable (≥3:1) and keeps the template's look`, () => {
      const c = invoiceHeaderColors(id, tpl.headerBg, tpl.primaryColor);
      expect(c.bg).toBe(tpl.headerBg);
      expect(contrastRatio(c.text, c.bg)).toBeGreaterThanOrEqual(3);
      if (id === "executive") expect(c.text).toBe(tpl.primaryColor); // gold on charcoal
      else if (isLightColor(tpl.headerBg)) expect(c.text).toBe(tpl.primaryColor);
      else expect(c.text).toBe("#ffffff");
    });
  }

  it("custom brand colours on light templates stay readable (falls back if the brand colour is too pale)", () => {
    for (const p of COLOR_PRESETS) {
      for (const bg of ["#f9fafb", "#f5f0e8", "#ffffff"]) {
        const c = invoiceHeaderColors("minimal", bg, p.primary);
        expect(contrastRatio(c.text, bg), `${p.name} on ${bg}`).toBeGreaterThanOrEqual(3);
      }
    }
    expect(invoiceHeaderColors("pastel", "#f5f0e8", "#fde68a").text).toBe("#1f2937");
  });
});

describe("money formatting", () => {
  it("minor units per ISO 4217", () => {
    expect(currencyFractionDigits("USD")).toBe(2);
    expect(currencyFractionDigits("INR")).toBe(2);
    expect(currencyFractionDigits("IDR")).toBe(2);
    expect(currencyFractionDigits("PKR")).toBe(2);
    expect(currencyFractionDigits("JPY")).toBe(0);
    expect(currencyFractionDigits("KRW")).toBe(0);
    expect(currencyFractionDigits("jpy")).toBe(0);
    expect(currencyFractionDigits("BHD")).toBe(3);
    expect(currencyFractionDigits("KWD")).toBe(3);
    expect(currencyFractionDigits("???")).toBe(2);
    expect(currencyFractionDigits("")).toBe(2);
  });

  it.each([
    [1234567.891, "USD", "1,234,567.89"],
    [0, "USD", "0.00"],
    [0.005, "EUR", "0.01"],
    [999.999, "GBP", "1,000.00"],
    [1234567.5, "JPY", "1,234,568"],
    [1500, "KRW", "1,500"],
    [12.3456, "BHD", "12.346"],
    [-50, "USD", "-50.00"],
    [Number.NaN, "USD", "0.00"],
    [Number.POSITIVE_INFINITY, "USD", "0.00"],
  ])("formatAmount(%s, %s) = %s", (n, code, out) => {
    expect(formatAmount(n, code)).toBe(out);
  });
});

describe("images", () => {
  it.each([
    [PNG_1PX, "PNG"],
    [JPEG_8x4, "JPEG"],
    ["data:image/jpg;base64,xx", "JPEG"],
    ["data:image/webp;base64,xx", "WEBP"],
    ["data:image/gif;base64,xx", "GIF"],
    [SVG_LOGO, "SVG"],
    ["data:image/svg+xml;utf8,<svg/>", "SVG"],
    ["data:application/pdf;base64,xx", null],
    ["", null],
    ["https://example.com/logo.png", null],
  ])("imageFormatFromDataUrl(%#)", (url, fmt) => {
    expect(imageFormatFromDataUrl(url as string)).toBe(fmt);
  });

  it("toPdfImage passes raster images through and drops SVG when no canvas exists (node)", async () => {
    expect(await toPdfImage(JPEG_8x4)).toEqual({ data: JPEG_8x4, format: "JPEG" });
    expect(await toPdfImage(SVG_LOGO)).toBeNull();
    expect(await rasterizeSvgDataUrl(SVG_LOGO)).toBeNull();
    expect(await toPdfImage("garbage")).toBeNull();
  });

  it("fitImage preserves aspect ratio; falls back to the box for unreadable data", () => {
    const doc = new jsPDF();
    expect(fitImage(doc, PNG_8x4, 20, 20)).toEqual({ w: 20, h: 10 });
    expect(fitImage(doc, PNG_8x4, 40, 15)).toEqual({ w: 30, h: 15 });
    expect(fitImage(doc, "data:image/png;base64,AAAA", 20, 20)).toEqual({ w: 20, h: 20 });
  });
});

describe("drawWrappedText", () => {
  it("wraps to maxWidth and continues on a new page at topY", () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFontSize(9);
    const endY = drawWrappedText(doc, LONG_TEXT, 15, 250, { maxWidth: 100, lineHeight: 4, bottomMargin: 20, topY: 25 });
    const texts = logOf(doc).texts;
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    for (const t of texts) {
      expect(t.width).toBeLessThanOrEqual(100.5);
      expect(t.y).toBeLessThanOrEqual(297 - 20 + 4);
    }
    const page2 = texts.filter((t) => t.page === 2);
    expect(page2[0].y).toBe(25);
    expect(endY).toBeGreaterThan(25);
    // every word made it onto the page, in order
    expect(texts.map((t) => t.text).join(" ").replace(/\s+/g, " ")).toBe(LONG_TEXT.replace(/\s+/g, " "));
  });

  it("empty text draws nothing and returns the same y", () => {
    const doc = new jsPDF();
    expect(drawWrappedText(doc, "", 10, 50, { maxWidth: 100, lineHeight: 4 })).toBe(50);
    expect(logOf(doc).texts).toHaveLength(0);
  });
});

describe("clientTaxIdDisplayLabel", () => {
  it.each([
    ["INR", "GSTIN"],
    ["GBP", "VAT Number"],
    ["AED", "TRN"],
    ["AUD", "ABN"],
    ["USD", "Tax ID"],
    ["XYZ", "Tax ID"],
  ])("%s → %s", (cur, label) => {
    expect(clientTaxIdDisplayLabel(cur)).toBe(label);
  });
});
