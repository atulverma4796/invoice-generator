import { LineItem } from "@/types/invoice";

// Round a money value to 2 decimals, half away from zero.
// `Math.round(x * 100) / 100` is wrong for values like 1.005 or 1234.005:
// in binary floating point 1.005 * 100 === 100.49999999999999, so the
// naive version rounds DOWN and the invoice is a cent short. Snapping the
// scaled value to 15 significant digits first removes that binary noise
// before rounding.
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return value;
  const scaled = Number((Math.abs(value) * 100).toPrecision(15));
  const rounded = Math.round(scaled) / 100;
  return value < 0 ? -rounded : rounded;
}

export function calculateLineAmount(qty: number, rate: number): number {
  return roundMoney(qty * rate);
}

export function calculateSubtotal(items: LineItem[]): number {
  // Round the sum too — adding already-rounded amounts can still drift
  // (0.1 + 0.2 === 0.30000000000000004).
  return roundMoney(items.reduce((sum, item) => sum + item.amount, 0));
}

// Tax applies to the *discounted* base, not the raw subtotal — that is
// the convention every accounting system (Tally, Zoho, QuickBooks, GST,
// VAT, EU-wide B2B) follows. Computing tax on the gross subtotal and
// then subtracting the discount under-discounts the customer by
// `discount × taxRate`, which is exactly the kind of math error a
// merchant gets a refund request over. `discount` defaults to 0 so
// existing callers that don't pass it keep their prior behavior.
export function calculateTax(
  subtotal: number,
  taxRate: number,
  discount: number = 0,
): number {
  const taxableBase = Math.max(0, subtotal - discount);
  return roundMoney(taxableBase * (taxRate / 100));
}

export function calculateDiscount(
  subtotal: number,
  discountRate: number
): number {
  return roundMoney(subtotal * (discountRate / 100));
}

export function calculateTotal(
  subtotal: number,
  tax: number,
  discount: number
): number {
  return roundMoney(subtotal + tax - discount);
}
