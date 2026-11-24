import { describe, it, expect } from "vitest";
import { LANGUAGES, getLabels, getPdfLabels, getTaxLabelForCurrency, type InvoiceLabels } from "@/lib/languages";

const KEYS: (keyof InvoiceLabels)[] = [
  "invoice", "billTo", "from", "invoiceDate", "dueDate", "description", "quantity", "rate",
  "amount", "subtotal", "tax", "discount", "shipping", "total", "paymentInformation",
  "termsAndConditions", "notes", "authorizedSignature", "taxId", "poNumber",
];
const NON_LATIN = ["hi", "ar", "zh", "ja", "ko", "ru", "th", "bn", "ur"];

describe("LANGUAGES", () => {
  it("has unique codes, English first", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes[0]).toBe("en");
    for (const l of LANGUAGES) {
      expect(l.name).toMatch(/\w/);
      expect(l.nativeName.length).toBeGreaterThan(0);
    }
  });
});

describe("getLabels", () => {
  it.each(LANGUAGES.map((l) => l.code))("%s has every label filled in", (code) => {
    const labels = getLabels(code);
    for (const k of KEYS) expect(labels[k], `${code}.${k}`).toMatch(/\S/);
  });

  it.each(LANGUAGES.filter((l) => l.code !== "en").map((l) => l.code))(
    "%s is actually translated (not the English fallback)",
    (code) => {
      expect(getLabels(code)).not.toBe(getLabels("en"));
      expect(getLabels(code).invoice).not.toBe("INVOICE");
    },
  );

  it("English labels are the expected strings", () => {
    const en = getLabels("en");
    expect(en.invoice).toBe("INVOICE");
    expect(en.billTo).toBe("Bill To");
    expect(en.total).toMatch(/Total/);
  });

  it("unknown / empty language falls back to English", () => {
    expect(getLabels("xx")).toBe(getLabels("en"));
    expect(getLabels("")).toBe(getLabels("en"));
    expect(getLabels("EN")).toBe(getLabels("en"));
  });
});

describe("getPdfLabels", () => {
  it.each(NON_LATIN)("%s returns romanized Latin-1 labels safe for jsPDF", (code) => {
    const labels = getPdfLabels(code);
    for (const k of KEYS) {
      expect(labels[k], `${code}.${k}`).toMatch(/\S/);
      for (const ch of labels[k]) expect(ch.charCodeAt(0), `${code}.${k} '${ch}'`).toBeLessThanOrEqual(0xff);
    }
    expect(labels).not.toBe(getLabels(code));
  });

  it.each(["en", "es", "fr", "de", "pt", "it", "nl"])("%s PDF labels equal screen labels", (code) => {
    expect(getPdfLabels(code)).toBe(getLabels(code));
  });

  it("unknown language falls back to English", () => {
    expect(getPdfLabels("xx")).toBe(getLabels("en"));
  });
});

describe("getTaxLabelForCurrency", () => {
  it.each([
    ["USD", "Tax"], ["EUR", "VAT"], ["GBP", "VAT"], ["INR", "GST"], ["CAD", "GST/HST"],
    ["AUD", "GST"], ["NZD", "GST"], ["SGD", "GST"], ["AED", "VAT"], ["SAR", "VAT"],
    ["MXN", "IVA"], ["COP", "IVA"], ["ARS", "IVA"], ["BRL", "ICMS"], ["SEK", "Moms"],
    ["DKK", "Moms"], ["NOK", "MVA"], ["IDR", "PPN"], ["MYR", "SST"], ["TRY", "KDV"],
    ["PKR", "Sales Tax"], ["JPY", "Tax"], ["CZK", "VAT"], ["HKD", "Tax"], ["ILS", "VAT"],
  ])("%s → %s", (cur, label) => {
    expect(getTaxLabelForCurrency(cur)).toBe(label);
  });

  it("unknown currency → Tax", () => {
    expect(getTaxLabelForCurrency("XYZ")).toBe("Tax");
    expect(getTaxLabelForCurrency("")).toBe("Tax");
  });
});
