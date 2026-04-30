// Indian-style number-to-words: lakhs/crores. Used for rent receipts and
// any other doc where amounts in words are required (a legal nicety in India
// for receipts above ₹5,000).

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? " " + ONES[o] : "");
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let s = "";
  if (h > 0) s += ONES[h] + " Hundred";
  if (rest > 0) s += (s ? " " : "") + twoDigits(rest);
  return s;
}

/** Convert an integer rupee amount into Indian English words ("lakh", "crore"). */
export function numberToIndianWords(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "Zero";
  if (n > 999999999999) return n.toString();

  const crores = Math.floor(n / 10000000);
  const lakhs = Math.floor((n % 10000000) / 100000);
  const thousands = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];
  if (crores > 0) parts.push(twoDigits(crores) + " Crore");
  if (lakhs > 0) parts.push(twoDigits(lakhs) + " Lakh");
  if (thousands > 0) parts.push(twoDigits(thousands) + " Thousand");
  if (rest > 0) parts.push(threeDigits(rest));
  return parts.join(" ");
}
