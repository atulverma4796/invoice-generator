import { LineItem } from "@/types/invoice";

export function calculateLineAmount(qty: number, rate: number): number {
  return Math.round(qty * rate * 100) / 100;
}

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
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
  return Math.round(taxableBase * (taxRate / 100) * 100) / 100;
}

export function calculateDiscount(
  subtotal: number,
  discountRate: number
): number {
  return Math.round(subtotal * (discountRate / 100) * 100) / 100;
}

export function calculateTotal(
  subtotal: number,
  tax: number,
  discount: number
): number {
  return Math.round((subtotal + tax - discount) * 100) / 100;
}
