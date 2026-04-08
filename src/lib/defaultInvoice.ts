import { InvoiceData } from "@/types/invoice";

// Static defaults — no Date.now() or crypto.randomUUID() to avoid hydration mismatch
export function createDefaultInvoice(): InvoiceData {
  return {
    senderName: "",
    senderEmail: "",
    senderAddress: "",
    senderPhone: "",
    senderWebsite: "",
    senderTaxId: "",
    logo: "",

    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientTaxId: "",

    invoiceNumber: "INV-000001",
    invoiceDate: "",
    dueDate: "",
    poNumber: "",

    lineItems: [
      {
        id: "default-item-1",
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],

    taxRate: 0,
    taxLabel: "Tax",
    discountRate: 0,
    shippingFee: 0,
    lateFeeRate: 0,

    notes: "Thank you for your business!",
    terms: "Payment is due within 30 days of the invoice date.",
    currency: "USD",
    language: "en",
    template: "modern",
    customStyle: {
      primaryColor: "#2563eb",
      accentColor: "#3b82f6",
      fontStyle: "sans",
    },
    status: "none",

    paymentInfo: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      paypalEmail: "",
      customField: "",
    },
    signature: "",
    watermark: "",
    qrCodeData: "",
  };
}

// Called only on client side after mount
export function initializeInvoiceDates(data: InvoiceData): InvoiceData {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  return {
    ...data,
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    invoiceDate: today.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    lineItems: data.lineItems.map((item) =>
      item.id === "default-item-1" ? { ...item, id: crypto.randomUUID() } : item
    ),
  };
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "CNY", symbol: "\u00A5", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "KRW", symbol: "\u20A9", name: "South Korean Won" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "PHP", symbol: "\u20B1", name: "Philippine Peso" },
  { code: "THB", symbol: "\u0E3F", name: "Thai Baht" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "NGN", symbol: "\u20A6", name: "Nigerian Naira" },
  { code: "PLN", symbol: "z\u0142", name: "Polish Zloty" },
  { code: "TRY", symbol: "\u20BA", name: "Turkish Lira" },
  { code: "COP", symbol: "COL$", name: "Colombian Peso" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso" },
  { code: "EGP", symbol: "E\u00A3", name: "Egyptian Pound" },
  { code: "PKR", symbol: "\u20A8", name: "Pakistani Rupee" },
  { code: "BDT", symbol: "\u09F3", name: "Bangladeshi Taka" },
];

// Predefined T&C mapped to watermark status
const WATERMARK_TERMS: Record<string, string> = {
  "": "Payment is due within 30 days of the invoice date. Late payments may be subject to a fee of 1.5% per month.",
  PAID: "This invoice has been paid in full. No further action is required. Please retain this document for your records.",
  DRAFT: "This is a draft invoice and is not a request for payment. Amounts and details are subject to change before the final invoice is issued.",
  CONFIDENTIAL: "This invoice and its contents are confidential. It is intended solely for the recipient. Unauthorized distribution, copying, or disclosure is strictly prohibited. Payment is due within 30 days.",
  COPY: "This is a copy of the original invoice provided for your records. The original invoice remains the binding document. Please do not make duplicate payments.",
  VOID: "This invoice has been voided and is no longer valid. No payment is due. If payment has already been made, please contact us to arrange a refund.",
  SAMPLE: "This is a sample invoice for demonstration purposes only. It does not represent an actual transaction and no payment is required.",
};

// T&C presets per watermark — each watermark shows contextually relevant options
const WATERMARK_PRESETS_MAP: Record<string, { label: string; value: string }[]> = {
  "": [
    { label: "Standard (Net 30)", value: "Payment is due within 30 days of the invoice date. Late payments may be subject to a fee of 1.5% per month." },
    { label: "Net 15", value: "Payment is due within 15 days of the invoice date. A late fee of 2% per month will apply to overdue balances." },
    { label: "Net 60", value: "Payment is due within 60 days of the invoice date. Late payments may incur interest at 1% per month on the outstanding balance." },
    { label: "Due on Receipt", value: "Payment is due immediately upon receipt of this invoice. Late payments may be subject to additional charges." },
    { label: "50% Advance", value: "50% of the total amount is due before work begins. The remaining 50% is due upon completion and delivery. Late payments may incur a 1.5% monthly fee." },
    { label: "Milestone-Based", value: "Payment is due as per the agreed milestone schedule. Each milestone payment must be received before work on the next phase begins." },
    { label: "Recurring", value: "This is a recurring invoice. Payment is due on the date shown above. Continued service is subject to timely payment of each invoice." },
    { label: "Freelancer", value: "Payment is due within 14 days of the invoice date. Please include the invoice number as payment reference. Late payments exceeding 30 days may result in suspension of services." },
  ],
  PAID: [
    { label: "Paid — Standard", value: "This invoice has been paid in full. No further action is required. Please retain this document for your records." },
    { label: "Paid — With Thanks", value: "Payment received in full — thank you! This invoice is now closed. Please keep this as your receipt for the transaction." },
    { label: "Paid — Refund Policy", value: "This invoice has been paid in full. Refund requests must be submitted within 30 days of payment. Please retain this document for your records." },
    { label: "Paid — Warranty", value: "Payment received. This invoice serves as proof of purchase. Warranty terms apply as per the original agreement. Contact us for support." },
  ],
  DRAFT: [
    { label: "Draft — Standard", value: "This is a draft invoice and is not a request for payment. Amounts and details are subject to change before the final invoice is issued." },
    { label: "Draft — Approval Needed", value: "This draft invoice requires your review and approval before it becomes final. Please confirm the details and amounts listed. No payment is due at this time." },
    { label: "Draft — Estimate", value: "This draft invoice is provided as a cost estimate only. Final charges may vary based on actual work completed. A final invoice will be issued upon completion." },
    { label: "Draft — Pending Scope", value: "This is a preliminary draft based on the current scope of work. Changes to the project scope may result in adjustments to the amounts shown." },
  ],
  CONFIDENTIAL: [
    { label: "Confidential — Standard", value: "This invoice and its contents are confidential. It is intended solely for the recipient. Unauthorized distribution, copying, or disclosure is strictly prohibited. Payment is due within 30 days." },
    { label: "Confidential — NDA", value: "This invoice is covered under the existing Non-Disclosure Agreement between the parties. Contents must not be shared with third parties. Payment is due within 30 days." },
    { label: "Confidential — Internal", value: "Confidential — for internal use only. This document contains proprietary billing information. Do not forward or share outside your organization. Payment terms as agreed." },
    { label: "Confidential — Strict", value: "STRICTLY CONFIDENTIAL. This invoice contains sensitive financial information. Any unauthorized reproduction, distribution, or disclosure may result in legal action. Payment is due within 30 days." },
  ],
  COPY: [
    { label: "Copy — Standard", value: "This is a copy of the original invoice provided for your records. The original invoice remains the binding document. Please do not make duplicate payments." },
    { label: "Copy — Reference Only", value: "This copy is provided for reference and record-keeping purposes only. All payment terms and conditions from the original invoice apply. Contact us if you need a revised original." },
    { label: "Copy — Duplicate Notice", value: "DUPLICATE COPY — This is not a new invoice. It is a copy of an invoice previously issued. If payment has already been made, please disregard. Contact us with any discrepancies." },
    { label: "Copy — Tax Records", value: "This copy is issued for tax and accounting purposes. The original invoice has been delivered separately. Retain this copy for your financial records." },
  ],
  VOID: [
    { label: "Void — Standard", value: "This invoice has been voided and is no longer valid. No payment is due. If payment has already been made, please contact us to arrange a refund." },
    { label: "Void — Replaced", value: "This invoice has been voided and replaced with a new invoice. Please disregard this document entirely. Refer to the replacement invoice for current amounts and terms." },
    { label: "Void — Error", value: "This invoice has been voided due to a billing error. A corrected invoice will be issued separately. We apologize for any inconvenience. No payment should be made on this document." },
    { label: "Void — Cancelled", value: "This invoice is void due to cancellation of the associated order or service. No payment is required. Any payments already made will be refunded within 7-10 business days." },
  ],
  SAMPLE: [
    { label: "Sample — Standard", value: "This is a sample invoice for demonstration purposes only. It does not represent an actual transaction and no payment is required." },
    { label: "Sample — Template Preview", value: "SAMPLE DOCUMENT — This invoice is a template preview showing how your invoices will look. Replace the placeholder information with your actual business and client details." },
    { label: "Sample — Test", value: "This is a test invoice generated for internal review. It does not represent a real transaction. Do not process any payment based on this document." },
    { label: "Sample — Training", value: "This sample invoice is provided for training and educational purposes only. All names, amounts, and details are fictitious. No goods or services were actually rendered." },
  ],
};

export function getTermsPresetsForWatermark(watermark: string): { label: string; value: string }[] {
  return WATERMARK_PRESETS_MAP[watermark] ?? WATERMARK_PRESETS_MAP[""];
}

export function getTermsForWatermark(watermark: string): string {
  return WATERMARK_TERMS[watermark] ?? WATERMARK_TERMS[""];
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

// PDF-safe symbols — jsPDF only supports basic Latin characters
const PDF_SAFE_SYMBOLS: Record<string, string> = {
  INR: "Rs.",
  KRW: "W",
  PHP: "P",
  THB: "B",
  NGN: "N",
  PLN: "zl",
  TRY: "TL",
  PKR: "Rs.",
  BDT: "Tk",
};

export function getPdfCurrencySymbol(code: string): string {
  if (PDF_SAFE_SYMBOLS[code]) return PDF_SAFE_SYMBOLS[code];
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}
