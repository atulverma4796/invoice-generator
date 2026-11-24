import { describe, it, expect } from "vitest";
import {
  roundMoney,
  calculateLineAmount,
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
} from "@/lib/calculations";
import type { LineItem } from "@/types/invoice";

const item = (quantity: number, rate: number, id = Math.random().toString()): LineItem => ({
  id,
  description: "x",
  quantity,
  rate,
  amount: calculateLineAmount(quantity, rate),
});

/** Full invoice pipeline exactly as InvoicePreview / generatePDF run it. */
function invoiceTotals(items: LineItem[], taxRate: number, discountRate: number, shipping = 0) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, discountRate);
  const tax = calculateTax(subtotal, taxRate, discount);
  const total = calculateTotal(subtotal, tax, discount) + shipping;
  return { subtotal, discount, tax, total };
}

describe("roundMoney", () => {
  it.each([
    [0, 0],
    [1, 1],
    [1.004, 1],
    [1.005, 1.01], // naive Math.round(x*100)/100 gives 1.00
    [1.015, 1.02],
    [2.675, 2.68], // classic toFixed trap
    [1.255, 1.26],
    [8.345, 8.35],
    [1234.005, 1234.01],
    [1234567.895, 1234567.9],
    [0.1 + 0.2, 0.3],
    [0.005, 0.01],
    [0.0049, 0],
    [99.999, 100],
    [-1.005, -1.01], // half away from zero, symmetric
    [-0.004, -0],
    [1e12 + 0.125, 1e12 + 0.13],
  ])("roundMoney(%s) === %s", (input, expected) => {
    expect(roundMoney(input)).toBe(expected);
  });

  it("passes non-finite values through unchanged", () => {
    expect(roundMoney(Infinity)).toBe(Infinity);
    expect(roundMoney(-Infinity)).toBe(-Infinity);
    expect(Number.isNaN(roundMoney(NaN))).toBe(true);
  });

  it("is idempotent on already-rounded values", () => {
    for (const v of [0.01, 0.1, 0.29, 1.1, 19.99, 1000000.07, 123456789.12]) {
      expect(roundMoney(roundMoney(v))).toBe(v);
    }
  });
});

describe("calculateLineAmount", () => {
  it("multiplies quantity by rate", () => {
    expect(calculateLineAmount(3, 50)).toBe(150);
    expect(calculateLineAmount(1, 85000)).toBe(85000);
  });

  it("returns 0 for zero quantity or zero rate", () => {
    expect(calculateLineAmount(0, 999.99)).toBe(0);
    expect(calculateLineAmount(10, 0)).toBe(0);
    expect(calculateLineAmount(0, 0)).toBe(0);
  });

  it("handles fractional quantities (hours, kg)", () => {
    expect(calculateLineAmount(1.5, 80)).toBe(120);
    expect(calculateLineAmount(0.25, 150)).toBe(37.5);
    expect(calculateLineAmount(2.333, 45)).toBe(104.99); // 104.985 → half-up
    expect(calculateLineAmount(0.1, 0.1)).toBe(0.01);
  });

  it("rounds to cents with half-up on .005 boundaries", () => {
    expect(calculateLineAmount(1, 1.005)).toBe(1.01);
    expect(calculateLineAmount(3, 0.335)).toBe(1.01); // 1.005
    expect(calculateLineAmount(1, 10.235)).toBe(10.24);
    expect(calculateLineAmount(7, 1.4285)).toBe(10); // 9.9995
  });

  it("is free of binary floating point noise", () => {
    expect(calculateLineAmount(3, 0.1)).toBe(0.3); // 0.30000000000000004
    expect(calculateLineAmount(0.7, 0.1)).toBe(0.07);
    expect(calculateLineAmount(100, 1.1)).toBe(110); // 110.00000000000001
  });

  it("handles very large values (crore-scale INR, IDR, KRW)", () => {
    expect(calculateLineAmount(1000, 99999999.99)).toBe(99999999990);
    expect(calculateLineAmount(1, 1e12)).toBe(1e12);
    expect(calculateLineAmount(250, 1500000)).toBe(375000000); // IDR
  });

  it("supports negative rate (credit line) with symmetric rounding", () => {
    expect(calculateLineAmount(1, -1.005)).toBe(-1.01);
    expect(calculateLineAmount(2, -50)).toBe(-100);
  });
});

describe("calculateSubtotal", () => {
  it("is 0 for no items", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("sums line amounts", () => {
    expect(calculateSubtotal([item(1, 4500), item(1, 1200), item(3, 350)])).toBe(6750);
  });

  it("does not drift with floating point sums (0.1 + 0.2)", () => {
    expect(calculateSubtotal([item(1, 0.1), item(1, 0.2)])).toBe(0.3);
    const tenDimes = Array.from({ length: 10 }, () => item(1, 0.1));
    expect(calculateSubtotal(tenDimes)).toBe(1);
  });

  it("sums many cent-level items exactly", () => {
    const items = Array.from({ length: 1000 }, () => item(1, 0.01));
    expect(calculateSubtotal(items)).toBe(10);
  });

  it("uses the stored amount field, not qty*rate", () => {
    const stale: LineItem = { id: "a", description: "x", quantity: 5, rate: 5, amount: 7 };
    expect(calculateSubtotal([stale])).toBe(7);
  });

  it("nets credit (negative) lines", () => {
    expect(calculateSubtotal([item(1, 100), item(1, -30)])).toBe(70);
  });
});

describe("calculateDiscount", () => {
  it.each([
    [1000, 0, 0],
    [1000, 10, 100],
    [1000, 100, 1000],
    [6750, 5, 337.5],
    [99.99, 15, 15], // 14.9985 → 15.00
    [10.01, 5, 0.5], // 0.5005 → 0.50
    [0.1, 50, 0.05],
    [0, 50, 0],
    [123.45, 12.5, 15.43], // 15.43125
  ])("subtotal %s at %s%% → %s", (subtotal, rate, expected) => {
    expect(calculateDiscount(subtotal, rate)).toBe(expected);
  });
});

describe("calculateTax", () => {
  it("applies the rate to the subtotal when no discount is given", () => {
    expect(calculateTax(100, 10)).toBe(10);
    expect(calculateTax(1000, 18)).toBe(180); // INR GST
    expect(calculateTax(1000, 20)).toBe(200); // GBP VAT
    expect(calculateTax(1000, 8.25)).toBe(82.5); // US sales tax
    expect(calculateTax(1000, 8.1)).toBe(81); // CHF
    expect(calculateTax(1000, 7.5)).toBe(75); // NGN
  });

  it("taxes the DISCOUNTED base", () => {
    // 1000 - 100 discount = 900 taxable * 18% = 162 (not 180)
    expect(calculateTax(1000, 18, 100)).toBe(162);
    expect(calculateTax(6750, 8.25, 337.5)).toBe(529.03); // 529.03125
  });

  it("is 0 at 0% tax", () => {
    expect(calculateTax(12345.67, 0)).toBe(0);
    expect(calculateTax(12345.67, 0, 100)).toBe(0);
  });

  it("is 0 with a 100% discount", () => {
    expect(calculateTax(1000, 20, 1000)).toBe(0);
  });

  it("never taxes a negative base (discount larger than subtotal)", () => {
    expect(calculateTax(100, 20, 150)).toBe(0);
  });

  it("rounds tax to cents half-up", () => {
    expect(calculateTax(0.5, 1)).toBe(0.01); // 0.005
    expect(calculateTax(10.05, 10)).toBe(1.01); // 1.005
    expect(calculateTax(33.33, 5)).toBe(1.67); // 1.6665
    expect(calculateTax(0.04, 10)).toBe(0); // 0.004
  });

  it("handles huge values", () => {
    expect(calculateTax(1e12, 18)).toBe(1.8e11);
  });
});

describe("calculateTotal", () => {
  it("is subtotal + tax - discount", () => {
    expect(calculateTotal(1000, 162, 100)).toBe(1062);
  });

  it("rounds away floating point noise", () => {
    expect(calculateTotal(0.1, 0.2, 0)).toBe(0.3);
    expect(calculateTotal(1.1, 2.2, 0)).toBe(3.3);
  });

  it("is 0 with everything zero", () => {
    expect(calculateTotal(0, 0, 0)).toBe(0);
  });
});

describe("full invoice pipeline", () => {
  it("US sample: 4500 + 1200 + 3×350, 5% discount, 8.25% tax", () => {
    const t = invoiceTotals([item(1, 4500), item(1, 1200), item(3, 350)], 8.25, 5);
    expect(t).toEqual({ subtotal: 6750, discount: 337.5, tax: 529.03, total: 6941.53 });
  });

  it("India sample: ₹1,55,000 at 18% GST, 5% discount", () => {
    const t = invoiceTotals([item(1, 85000), item(1, 45000), item(1, 25000)], 18, 5);
    expect(t.subtotal).toBe(155000);
    expect(t.discount).toBe(7750);
    expect(t.tax).toBe(26505); // 147250 × 18%
    expect(t.total).toBe(173755);
  });

  it("UK: VAT 20%, no discount", () => {
    const t = invoiceTotals([item(1, 2800), item(1, 3500), item(1, 1200)], 20, 0);
    expect(t).toEqual({ subtotal: 7500, discount: 0, tax: 1500, total: 9000 });
  });

  it("UAE: 5% VAT with fractional quantity", () => {
    const t = invoiceTotals([item(2.5, 3000)], 5, 0);
    expect(t.total).toBe(7875);
  });

  it("EUR with cents and both discount and VAT", () => {
    const t = invoiceTotals([item(3, 19.99), item(1, 0.01)], 19, 10);
    // 59.97 + 0.01 = 59.98; discount 5.998→6.00; base 53.98; VAT 10.2562→10.26
    expect(t).toEqual({ subtotal: 59.98, discount: 6, tax: 10.26, total: 64.24 });
  });

  it("100% discount gives a zero total even with tax", () => {
    const t = invoiceTotals([item(1, 500)], 20, 100);
    expect(t).toEqual({ subtotal: 500, discount: 500, tax: 0, total: 0 });
  });

  it("0% tax (exempt) gives total = subtotal - discount", () => {
    const t = invoiceTotals([item(4, 25)], 0, 10);
    expect(t.total).toBe(90);
  });

  it("shipping is added after tax (not taxed)", () => {
    const t = invoiceTotals([item(1, 100)], 10, 0, 15);
    expect(t.tax).toBe(10);
    expect(t.total).toBe(125);
  });

  it("zero-value invoice stays zero", () => {
    expect(invoiceTotals([item(0, 100)], 18, 5)).toEqual({ subtotal: 0, discount: 0, tax: 0, total: 0 });
  });

  it("JPY/KRW style whole-number invoices stay whole", () => {
    const t = invoiceTotals([item(3, 15000)], 10, 0);
    expect(t.total).toBe(49500);
  });

  it("every computed money value has at most 2 decimals", () => {
    const rates = [0, 5, 7.5, 8.25, 9, 12.5, 18, 19, 20, 27];
    const discounts = [0, 3.3, 5, 12.5, 33.333, 100];
    const qtys = [0.333, 1, 1.5, 7, 13.13];
    const prices = [0.01, 0.99, 1.005, 19.99, 333.333, 49999.995];
    for (const r of rates) for (const d of discounts) for (const q of qtys) for (const p of prices) {
      const t = invoiceTotals([item(q, p), item(1, 0.1)], r, d);
      for (const v of [t.subtotal, t.discount, t.tax, t.total]) {
        expect(Math.round(v * 100) / 100).toBeCloseTo(v, 10);
        expect(v.toFixed(2)).toBe((Math.round(v * 100) / 100).toFixed(2));
      }
      expect(t.total).toBeCloseTo(t.subtotal - t.discount + t.tax, 9);
    }
  });
});
