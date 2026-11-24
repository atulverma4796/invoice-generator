import { describe, it, expect, vi, afterEach } from "vitest";
import { detectCountryCode, detectCurrency, detectTaxLabel, getSampleInvoiceData } from "@/lib/autoDetect";
import { validateInvoice } from "@/lib/validation";
import { calculateLineAmount } from "@/lib/calculations";

function mockEnv(timeZone: string | undefined, language?: string) {
  const real = Intl.DateTimeFormat;
  vi.spyOn(Intl, "DateTimeFormat").mockImplementation(((...args: ConstructorParameters<typeof real>) => {
    const f = new real(...args);
    const ro = f.resolvedOptions();
    return { ...f, resolvedOptions: () => ({ ...ro, timeZone }) } as unknown as Intl.DateTimeFormat;
  }) as unknown as typeof Intl.DateTimeFormat);
  vi.stubGlobal("navigator", { language });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("detectCountryCode", () => {
  it.each([
    ["Asia/Kolkata", "IN"], ["Asia/Calcutta", "IN"], ["Europe/London", "GB"], ["Europe/Berlin", "DE"],
    ["America/New_York", "US"], ["America/Los_Angeles", "US"], ["America/Toronto", "CA"],
    ["Australia/Sydney", "AU"], ["Asia/Dubai", "AE"], ["Asia/Tokyo", "JP"], ["America/Sao_Paulo", "BR"],
    ["Africa/Lagos", "NG"], ["Europe/Prague", "CZ"], ["Asia/Hong_Kong", "HK"],
  ])("timezone %s → %s", (tz, code) => {
    mockEnv(tz, "en-US");
    expect(detectCountryCode()).toBe(code);
  });

  it("timezone wins over browser language", () => {
    mockEnv("Asia/Kolkata", "en-US");
    expect(detectCountryCode()).toBe("IN");
  });

  it("falls back to full navigator.language", () => {
    mockEnv("Etc/Unknown", "pt-BR");
    expect(detectCountryCode()).toBe("BR");
    mockEnv("Etc/Unknown", "fr-CA");
    expect(detectCountryCode()).toBe("CA");
  });

  it("falls back to base language", () => {
    mockEnv("Etc/Unknown", "de-LU");
    expect(detectCountryCode()).toBe("DE");
    mockEnv(undefined, "hi-XX");
    expect(detectCountryCode()).toBe("IN");
  });

  it("defaults to US when nothing matches", () => {
    mockEnv("Etc/Unknown", "xx-YY");
    expect(detectCountryCode()).toBe("US");
    mockEnv(undefined, undefined);
    expect(detectCountryCode()).toBe("US");
  });

  it("defaults to US when Intl throws", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("restricted");
    });
    expect(detectCountryCode()).toBe("US");
  });
});

describe("detectCurrency / detectTaxLabel", () => {
  it.each([
    ["Asia/Kolkata", "INR", "GST"],
    ["Europe/London", "GBP", "VAT"],
    ["Europe/Paris", "EUR", "VAT"],
    ["America/Chicago", "USD", "Tax"],
    ["America/Vancouver", "CAD", "GST/HST"],
    ["Australia/Perth", "AUD", "GST"],
    ["Asia/Dubai", "AED", "VAT"],
    ["America/Mexico_City", "MXN", "IVA"],
    ["Europe/Prague", "CZK", "VAT"],
    ["Europe/Bucharest", "RON", "VAT"],
    ["Asia/Taipei", "TWD", "VAT"],
    ["Africa/Nairobi", "USD", "Tax"],
  ])("%s → %s / %s", (tz, cur, label) => {
    mockEnv(tz, "en");
    expect(detectCurrency()).toBe(cur);
    expect(detectTaxLabel()).toBe(label);
  });
});

describe("getSampleInvoiceData", () => {
  it.each([
    ["Asia/Kolkata", "INR", 18, "Priya Design Studio"],
    ["America/New_York", "USD", 8.25, "Horizon Digital Agency"],
    ["Europe/London", "GBP", 20, "Sterling Creative Ltd"],
    ["Europe/Berlin", "EUR", 19, "Schmidt & Weber GmbH"],
    ["Asia/Dubai", "AED", 5, "Al Noor Consulting"],
    ["Asia/Tokyo", "JPY", 10, "Horizon Digital Agency"], // falls back to US copy
  ])("%s → %s sample, %s%% tax", (tz, cur, rate, sender) => {
    mockEnv(tz, "en");
    const s = getSampleInvoiceData();
    expect(s.currency).toBe(cur);
    expect(s.taxRate).toBe(rate);
    expect(s.senderName).toBe(sender);
  });

  it.each(["Asia/Kolkata", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Tokyo"])(
    "sample for %s passes validation and has consistent line amounts",
    (tz) => {
      mockEnv(tz, "en");
      const s = getSampleInvoiceData();
      // JPY sample has no Japanese tax ID → JP sample reuses US EIN, still non-empty.
      expect(validateInvoice(s)).toEqual({});
      for (const li of s.lineItems) expect(li.amount).toBe(calculateLineAmount(li.quantity, li.rate));
      expect(new Set(s.lineItems.map((l) => l.id)).size).toBe(s.lineItems.length);
      expect(s.clientEmail).toMatch(/^accounts@[a-z]+\.com$/);
      expect(s.invoiceDate < s.dueDate).toBe(true);
    },
  );
});
