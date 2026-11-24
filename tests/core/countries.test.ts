import { describe, it, expect } from "vitest";
import { COUNTRIES, getCountryRule } from "@/lib/validation";
import { CURRENCIES, getCurrencySymbol, getPdfCurrencySymbol } from "@/lib/defaultInvoice";
import { getTaxLabelForCurrency } from "@/lib/languages";

const SUPPORTED = new Set(CURRENCIES.map((c) => c.code));
const byName = (name: string) => COUNTRIES.find((c) => c.name === name)!;

describe("COUNTRIES list integrity", () => {
  it("has unique ISO alpha-2 codes and names", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(new Set(COUNTRIES.map((c) => c.name)).size).toBe(COUNTRIES.length);
    for (const code of codes) expect(code).toMatch(/^[A-Z]{2}$/);
  });

  it("is sorted alphabetically by name", () => {
    const names = COUNTRIES.map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("only maps to currencies the app supports", () => {
    for (const c of COUNTRIES) expect(SUPPORTED.has(c.currency), `${c.name} → ${c.currency}`).toBe(true);
  });

  it("every supported currency has at least one country", () => {
    const used = new Set(COUNTRIES.map((c) => c.currency));
    for (const code of SUPPORTED) expect(used.has(code), code).toBe(true);
  });
});

describe("COUNTRIES → currency mapping", () => {
  it.each([
    ["India", "INR"], ["United Kingdom", "GBP"], ["Germany", "EUR"], ["France", "EUR"],
    ["United States", "USD"], ["Canada", "CAD"], ["Australia", "AUD"],
    ["United Arab Emirates", "AED"], ["Saudi Arabia", "SAR"], ["Japan", "JPY"], ["China", "CNY"],
    ["South Korea", "KRW"], ["Singapore", "SGD"], ["Switzerland", "CHF"], ["Brazil", "BRL"],
    ["Mexico", "MXN"], ["South Africa", "ZAR"], ["New Zealand", "NZD"], ["Sweden", "SEK"],
    ["Norway", "NOK"], ["Denmark", "DKK"], ["Philippines", "PHP"], ["Thailand", "THB"],
    ["Indonesia", "IDR"], ["Malaysia", "MYR"], ["Nigeria", "NGN"], ["Poland", "PLN"],
    ["Turkey", "TRY"], ["Colombia", "COP"], ["Argentina", "ARS"], ["Egypt", "EGP"],
    ["Pakistan", "PKR"], ["Bangladesh", "BDT"],
    // Euro adopters
    ["Croatia", "EUR"], ["Bulgaria", "EUR"], ["Ireland", "EUR"], ["Estonia", "EUR"],
    // USD-ised economies
    ["Ecuador", "USD"], ["El Salvador", "USD"], ["Panama", "USD"],
  ])("%s uses %s", (name, currency) => {
    expect(byName(name).currency).toBe(currency);
  });

  // Previously these were mapped to EUR / INR / USD even though they have
  // their own currency — a Czech user picking "Czech Republic" got euros and
  // a Nepali user got Indian GSTIN validation.
  it.each([
    ["Czech Republic", "CZK"], ["Hungary", "HUF"], ["Romania", "RON"], ["Serbia", "RSD"],
    ["Iceland", "ISK"], ["Albania", "ALL"], ["Bosnia and Herzegovina", "BAM"],
    ["North Macedonia", "MKD"], ["Moldova", "MDL"], ["Nepal", "NPR"],
    ["Hong Kong", "HKD"], ["Taiwan", "TWD"], ["Israel", "ILS"],
  ])("%s uses its own currency %s (not EUR/INR/USD)", (name, currency) => {
    expect(byName(name).currency).toBe(currency);
  });

  it("Nepal no longer triggers Indian GSTIN rules", () => {
    expect(getCountryRule(byName("Nepal").currency).taxIdLabel).not.toMatch(/GSTIN/);
  });

  it("non-EU European countries no longer get EU VAT rules", () => {
    for (const n of ["Serbia", "Iceland", "Albania", "North Macedonia", "Moldova", "Bosnia and Herzegovina"]) {
      expect(getCountryRule(byName(n).currency).taxIdLabel, n).not.toBe("VAT Identification Number");
    }
  });

  it("EU members outside the eurozone still require a VAT ID when charging VAT", () => {
    for (const n of ["Czech Republic", "Hungary", "Romania"]) {
      const r = getCountryRule(byName(n).currency);
      expect(r.taxIdRequired, n).toBe(true);
      expect(r.clientAddressRequired, n).toBe(true);
    }
  });
});

describe("CURRENCIES & symbols", () => {
  it("codes are unique ISO-4217 style 3-letter codes", () => {
    const codes = CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of CURRENCIES) {
      expect(c.code).toMatch(/^[A-Z]{3}$/);
      expect(c.symbol.length).toBeGreaterThan(0);
      expect(c.name.length).toBeGreaterThan(0);
    }
  });

  it.each([
    ["USD", "$"], ["EUR", "€"], ["GBP", "£"], ["INR", "₹"], ["JPY", "¥"], ["CAD", "C$"],
    ["AUD", "A$"], ["AED", "AED"], ["CZK", "Kč"], ["ILS", "₪"], ["HKD", "HK$"],
  ])("getCurrencySymbol(%s) === %s", (code, sym) => {
    expect(getCurrencySymbol(code)).toBe(sym);
  });

  it("unknown currency falls back to $", () => {
    expect(getCurrencySymbol("XYZ")).toBe("$");
    expect(getCurrencySymbol("")).toBe("$");
    expect(getPdfCurrencySymbol("XYZ")).toBe("$");
  });

  it.each([
    ["INR", "Rs."], ["KRW", "W"], ["PHP", "P"], ["THB", "B"], ["NGN", "N"], ["PLN", "zl"],
    ["TRY", "TL"], ["PKR", "Rs."], ["BDT", "Tk"], ["CZK", "Kc"], ["NPR", "Rs."], ["ILS", "ILS"],
    ["MKD", "den"], ["USD", "$"], ["GBP", "£"], ["EUR", "€"],
  ])("getPdfCurrencySymbol(%s) === %s", (code, sym) => {
    expect(getPdfCurrencySymbol(code)).toBe(sym);
  });

  // jsPDF's built-in fonts only cover WinAnsi (≈ Latin-1 + €, etc.). Anything
  // outside that renders as garbage in the downloaded PDF.
  it("every PDF symbol is renderable by jsPDF's WinAnsi fonts", () => {
    const winAnsiExtras = new Set(["€", "‚", "ƒ", "„", "…", "†", "‡", "ˆ", "‰", "Š", "‹", "Œ", "Ž", "‘", "’", "“", "”", "•", "–", "—", "˜", "™", "š", "›", "œ", "ž", "Ÿ"]);
    for (const { code } of CURRENCIES) {
      for (const ch of getPdfCurrencySymbol(code)) {
        const ok = ch.charCodeAt(0) <= 0xff || winAnsiExtras.has(ch);
        expect(ok, `${code} PDF symbol contains ${ch}`).toBe(true);
      }
    }
  });

  it("every currency has a tax label", () => {
    for (const { code } of CURRENCIES) expect(getTaxLabelForCurrency(code).length).toBeGreaterThan(0);
  });
});
