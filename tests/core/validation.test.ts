import { describe, it, expect } from "vitest";
import {
  validateInvoice,
  hasErrors,
  getCountryRule,
  getTaxIdLabel,
  getComplianceNote,
} from "@/lib/validation";
import { createDefaultInvoice, CURRENCIES } from "@/lib/defaultInvoice";
import type { InvoiceData } from "@/types/invoice";

/** A fully filled invoice that is valid in every country when tax is charged. */
function validInvoice(over: Partial<InvoiceData> = {}): InvoiceData {
  return {
    ...createDefaultInvoice(),
    senderName: "Acme Studio",
    senderAddress: "1 Main St",
    senderTaxId: "TAX-123",
    clientName: "Client Co",
    clientAddress: "2 High St",
    clientTaxId: "CL-9",
    invoiceNumber: "INV-1",
    invoiceDate: "2026-01-01",
    dueDate: "2026-01-31",
    lineItems: [{ id: "1", description: "Design", quantity: 1, rate: 100, amount: 100 }],
    taxRate: 10,
    ...over,
  };
}

// Currencies whose rule makes the sender Tax ID mandatory when tax is charged.
const TAX_ID_REQUIRED = [
  "INR", "GBP", "EUR", "CAD", "AUD", "AED", "SAR", "JPY", "CNY", "KRW", "SGD", "CHF",
  "BRL", "MXN", "ZAR", "NZD", "SEK", "NOK", "DKK", "PHP", "THB", "IDR", "NGN", "EGP",
  "PLN", "TRY", "COP", "ARS", "PKR", "BDT", "CZK", "HUF", "RON",
];
const TAX_ID_OPTIONAL = ["USD", "MYR", "HKD", "TWD", "ILS", "NPR", "RSD", "ISK", "XYZ", ""];
const CLIENT_ADDRESS_REQUIRED = [
  "INR", "GBP", "EUR", "CAD", "AUD", "AED", "SAR", "CNY", "KRW", "SGD", "CHF", "BRL", "MXN",
  "ZAR", "SEK", "NOK", "DKK", "PHP", "THB", "IDR", "MYR", "EGP", "PLN", "TRY", "COP", "ARS",
  "PKR", "BDT", "CZK", "HUF", "RON",
];
const CLIENT_ADDRESS_OPTIONAL = ["USD", "JPY", "NZD", "NGN", "HKD", "ILS", "XYZ"];
const ALL_CODES = CURRENCIES.map((c) => c.code);

describe("validateInvoice — baseline", () => {
  it.each(ALL_CODES)("a complete invoice in %s has no errors", (currency) => {
    expect(validateInvoice(validInvoice({ currency }))).toEqual({});
  });

  it("the blank default invoice reports all universal required fields", () => {
    const e = validateInvoice(createDefaultInvoice());
    expect(e.senderName).toBeDefined();
    expect(e.clientName).toBeDefined();
    expect(e.invoiceDate).toBeDefined();
    expect(e.dueDate).toBeDefined();
    expect(e.senderAddress).toBeDefined();
    expect(e.lineItems).toBeDefined();
    expect(e.invoiceNumber).toBeUndefined(); // default INV-000001
    expect(e.senderTaxId).toBeUndefined(); // USD + 0% tax
    expect(hasErrors(e)).toBe(true);
  });

  it("hasErrors is false only for an empty object", () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ a: "b" })).toBe(true);
  });
});

describe("validateInvoice — universal required fields", () => {
  it.each([
    ["senderName", "Business or sender name is required"],
    ["clientName", "Client or buyer name is required"],
    ["invoiceNumber", "Invoice number is required"],
  ] as const)("%s empty → error", (field, msg) => {
    expect(validateInvoice(validInvoice({ [field]: "" }))[field]).toBe(msg);
  });

  it.each(["senderName", "clientName", "invoiceNumber"] as const)(
    "%s of only whitespace/newlines/tabs is treated as empty",
    (field) => {
      expect(validateInvoice(validInvoice({ [field]: "  \n\t " }))[field]).toBeDefined();
    },
  );

  it("missing dates are errors", () => {
    const e = validateInvoice(validInvoice({ invoiceDate: "", dueDate: "" }));
    expect(e.invoiceDate).toBe("Invoice date is required");
    expect(e.dueDate).toBe("Payment due date is required");
  });

  it("accepts non-Latin names (Hindi, Arabic, Chinese, Japanese, emoji)", () => {
    for (const name of ["प्रिया डिज़ाइन", "شركة النور", "北京科技有限公司", "株式会社テスト", "Café Ünïcödé 🚀"]) {
      expect(validateInvoice(validInvoice({ senderName: name, clientName: name }))).toEqual({});
    }
  });

  it("accepts very long values", () => {
    const long = "A".repeat(10_000);
    expect(validateInvoice(validInvoice({ senderName: long, senderAddress: long }))).toEqual({});
  });
});

describe("validateInvoice — addresses per country", () => {
  it.each(ALL_CODES.concat("XYZ"))("sender address is required in %s", (currency) => {
    const e = validateInvoice(validInvoice({ currency, senderAddress: "   " }));
    expect(e.senderAddress).toBe(`Sender address is required for invoices in ${currency}`);
  });

  it.each(CLIENT_ADDRESS_REQUIRED)("client address is required in %s", (currency) => {
    const e = validateInvoice(validInvoice({ currency, clientAddress: "" }));
    expect(e.clientAddress).toBe(`Client address is required for invoices in ${currency}`);
  });

  it.each(CLIENT_ADDRESS_OPTIONAL)("client address is optional in %s", (currency) => {
    expect(validateInvoice(validInvoice({ currency, clientAddress: "" })).clientAddress).toBeUndefined();
  });
});

describe("validateInvoice — sender tax ID (only when tax is charged)", () => {
  it.each(TAX_ID_REQUIRED)("%s: tax ID required when taxRate > 0", (currency) => {
    const e = validateInvoice(validInvoice({ currency, senderTaxId: "", taxRate: 5 }));
    expect(e.senderTaxId).toBe(`${getTaxIdLabel(currency)} is required`);
  });

  it.each(TAX_ID_REQUIRED)("%s: tax ID NOT required at 0%% tax", (currency) => {
    const e = validateInvoice(validInvoice({ currency, senderTaxId: "", taxRate: 0 }));
    expect(e.senderTaxId).toBeUndefined();
    expect(e).toEqual({});
  });

  it.each(TAX_ID_OPTIONAL)("%s: tax ID never required", (currency) => {
    const e = validateInvoice(validInvoice({ currency, senderTaxId: "", taxRate: 25 }));
    expect(e.senderTaxId).toBeUndefined();
  });

  it("whitespace-only tax ID counts as missing", () => {
    const e = validateInvoice(validInvoice({ currency: "INR", senderTaxId: "   ", taxRate: 18 }));
    expect(e.senderTaxId).toBe("GSTIN (GST Number) is required");
  });

  it("tiny fractional tax still requires the tax ID", () => {
    const e = validateInvoice(validInvoice({ currency: "GBP", senderTaxId: "", taxRate: 0.01 }));
    expect(e.senderTaxId).toBe("VAT Registration Number is required");
  });

  it("uses the country-specific label in the message", () => {
    const cases: Record<string, string> = {
      INR: "GSTIN (GST Number) is required",
      GBP: "VAT Registration Number is required",
      EUR: "VAT Identification Number is required",
      CAD: "GST/HST Business Number is required",
      AUD: "ABN (Australian Business Number) is required",
      AED: "TRN (Tax Registration Number) is required",
      MXN: "RFC (Tax ID) is required",
    };
    for (const [currency, msg] of Object.entries(cases)) {
      expect(validateInvoice(validInvoice({ currency, senderTaxId: "" })).senderTaxId).toBe(msg);
    }
  });

  it("client tax ID is never enforced (B2C invoices have no buyer tax ID)", () => {
    for (const currency of ["INR", "EUR", "AED", "MXN", "BRL"]) {
      expect(validateInvoice(validInvoice({ currency, clientTaxId: "" }))).toEqual({});
    }
  });
});

describe("validateInvoice — tax rate range", () => {
  it.each(ALL_CODES)("0%% tax is valid in %s", (currency) => {
    expect(validateInvoice(validInvoice({ currency, taxRate: 0 })).taxRate).toBeUndefined();
  });

  it.each([0, 0.01, 5, 8.25, 18, 27, 99.99, 100])("taxRate %s is accepted", (taxRate) => {
    expect(validateInvoice(validInvoice({ taxRate })).taxRate).toBeUndefined();
  });

  it.each([-0.01, -5, 100.01, 101, 1000])("taxRate %s is rejected", (taxRate) => {
    expect(validateInvoice(validInvoice({ taxRate })).taxRate).toBe("Tax rate must be between 0 and 100");
  });
});

describe("validateInvoice — discount and shipping", () => {
  it.each([0, 5, 12.5, 100])("discount %s%% is accepted", (discountRate) => {
    expect(validateInvoice(validInvoice({ discountRate })).discountRate).toBeUndefined();
  });

  it.each([-1, 100.5, 150])("discount %s%% is rejected (would give negative/inflated total)", (discountRate) => {
    expect(validateInvoice(validInvoice({ discountRate })).discountRate).toBe("Discount must be between 0 and 100");
  });

  it("negative shipping is rejected, zero and positive accepted", () => {
    expect(validateInvoice(validInvoice({ shippingFee: -10 })).shippingFee).toBe("Shipping cannot be negative");
    expect(validateInvoice(validInvoice({ shippingFee: 0 })).shippingFee).toBeUndefined();
    expect(validateInvoice(validInvoice({ shippingFee: 49.99 })).shippingFee).toBeUndefined();
  });
});

describe("validateInvoice — line items", () => {
  const li = (description: string, quantity: number, rate: number, amount = quantity * rate) => ({
    id: Math.random().toString(),
    description,
    quantity,
    rate,
    amount,
  });

  it("requires at least one item with description and positive amount", () => {
    const msg = "At least one item with description and amount is required";
    expect(validateInvoice(validInvoice({ lineItems: [] })).lineItems).toBe(msg);
    expect(validateInvoice(validInvoice({ lineItems: [li("", 1, 0)] })).lineItems).toBe(msg);
    expect(validateInvoice(validInvoice({ lineItems: [li("Work", 0, 100)] })).lineItems).toBe(msg);
    expect(validateInvoice(validInvoice({ lineItems: [li("   ", 1, 100)] })).lineItems).toBe(msg);
  });

  it("flags an item with amount but no description", () => {
    const e = validateInvoice(validInvoice({ lineItems: [li("Work", 1, 100), li("", 2, 50)] }));
    expect(e.item_1_desc).toBe("Description is required");
    expect(e.lineItems).toBeUndefined();
  });

  it("flags an item with a description but zero/negative rate", () => {
    const e = validateInvoice(validInvoice({ lineItems: [li("Work", 1, 100), li("Free", 1, 0), li("Neg", 1, -5)] }));
    expect(e.item_1_rate).toBe("Rate must be greater than 0");
    expect(e.item_2_rate).toBe("Rate must be greater than 0");
  });

  it("ignores fully blank extra rows", () => {
    const e = validateInvoice(validInvoice({ lineItems: [li("Work", 1, 100), li("", 0, 0)] }));
    expect(e).toEqual({});
  });

  it("accepts fractional quantity and sub-cent rates", () => {
    expect(validateInvoice(validInvoice({ lineItems: [li("Hours", 0.25, 0.04)] }))).toEqual({});
  });

  it("accepts huge amounts", () => {
    expect(validateInvoice(validInvoice({ lineItems: [li("Plant", 1, 1e12)] }))).toEqual({});
  });

  it.skip("PRODUCT DECISION: a described item with quantity ≤ 0 is not flagged (negative qty silently reduces the total)", () => {
    const e = validateInvoice(validInvoice({ lineItems: [li("Work", 1, 100), li("Refund?", -2, 30)] }));
    expect(e.item_1_qty).toBeDefined();
  });
});

describe("country rules lookup", () => {
  it("unknown currencies fall back to the default rule", () => {
    const r = getCountryRule("XYZ");
    expect(r.taxIdLabel).toBe("Tax ID / Registration Number");
    expect(r.taxIdRequired).toBe(false);
    expect(r.senderAddressRequired).toBe(true);
    expect(getComplianceNote("XYZ")).toBeUndefined();
  });

  it("every CURRENCIES entry resolves to a rule with a non-empty label", () => {
    for (const code of ALL_CODES) {
      expect(getTaxIdLabel(code).length).toBeGreaterThan(0);
      expect(getCountryRule(code).clientTaxIdLabel.length).toBeGreaterThan(0);
    }
  });

  it("compliance notes exist for major tax regimes", () => {
    for (const code of ["INR", "GBP", "EUR", "USD", "CAD", "AUD", "AED", "CZK", "HUF", "RON"]) {
      expect(getComplianceNote(code)).toMatch(/\w/);
    }
  });

  it("is case-sensitive (lowercase codes are unknown)", () => {
    expect(getCountryRule("inr").taxIdRequired).toBe(false);
  });
});
