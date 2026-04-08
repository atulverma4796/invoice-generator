import { LineItem } from "@/types/invoice";

export function calculateLineAmount(qty: number, rate: number): number {
  return Math.round(qty * rate * 100) / 100;
}

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100;
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
