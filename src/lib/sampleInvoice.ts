import { InvoiceData, TemplateId } from "@/types/invoice";
import { TEMPLATES } from "./templates";
import { IndustryData } from "./industries";

/**
 * Server-safe sample invoice builder.
 * Used by gallery + industry pages to render template previews.
 * No browser APIs (no crypto.randomUUID, no Date.now).
 */

const STATIC_DATE = "2026-04-15";
const STATIC_DUE = "2026-05-15";
const STATIC_INVOICE_NUMBER = "INV-001245";

const DEFAULT_SAMPLE_ITEMS = [
  { description: "Brand Identity Design — Logo + Style Guide", qty: 1, rate: 1800 },
  { description: "Website Design (5 pages)", qty: 1, rate: 2500 },
  { description: "Consulting Hours", qty: 4, rate: 150 },
];

// Inline SVG signature (handwritten cursive look) — works in PDF + preview
export const DEFAULT_SAMPLE_SIGNATURE =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <path d="M10 40 C 20 10, 30 50, 40 30 S 60 10, 75 35 Q 90 50, 100 25 T 130 35 Q 145 45, 155 20 T 190 30"
            stroke="#1a1a2e" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M50 45 L 60 45 M 70 48 L 85 48 M 95 47 L 110 47" stroke="#1a1a2e" stroke-width="1" fill="none" opacity="0.5"/>
    </svg>`
  ).toString("base64");

// Simple inline SVG QR placeholder — 21x21 grid pattern, looks like a real QR
export const DEFAULT_SAMPLE_QR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="white"/>
      <g fill="black">
        <rect x="10" y="10" width="25" height="25"/><rect x="15" y="15" width="15" height="15" fill="white"/><rect x="18" y="18" width="9" height="9"/>
        <rect x="65" y="10" width="25" height="25"/><rect x="70" y="15" width="15" height="15" fill="white"/><rect x="73" y="18" width="9" height="9"/>
        <rect x="10" y="65" width="25" height="25"/><rect x="15" y="70" width="15" height="15" fill="white"/><rect x="18" y="73" width="9" height="9"/>
        <rect x="40" y="10" width="5" height="5"/><rect x="50" y="10" width="5" height="5"/><rect x="40" y="20" width="5" height="5"/><rect x="55" y="20" width="5" height="5"/>
        <rect x="40" y="30" width="5" height="5"/><rect x="50" y="30" width="5" height="5"/><rect x="60" y="30" width="5" height="5"/>
        <rect x="10" y="40" width="5" height="5"/><rect x="20" y="40" width="5" height="5"/><rect x="30" y="40" width="5" height="5"/><rect x="40" y="40" width="5" height="5"/><rect x="55" y="40" width="5" height="5"/><rect x="65" y="40" width="5" height="5"/><rect x="80" y="40" width="5" height="5"/>
        <rect x="15" y="50" width="5" height="5"/><rect x="25" y="50" width="5" height="5"/><rect x="40" y="50" width="5" height="5"/><rect x="50" y="50" width="5" height="5"/><rect x="60" y="50" width="5" height="5"/><rect x="75" y="50" width="5" height="5"/>
        <rect x="40" y="60" width="5" height="5"/><rect x="50" y="60" width="5" height="5"/><rect x="60" y="60" width="5" height="5"/><rect x="70" y="60" width="5" height="5"/><rect x="85" y="60" width="5" height="5"/>
        <rect x="40" y="70" width="5" height="5"/><rect x="55" y="70" width="5" height="5"/><rect x="70" y="70" width="5" height="5"/><rect x="85" y="70" width="5" height="5"/>
        <rect x="40" y="80" width="5" height="5"/><rect x="50" y="80" width="5" height="5"/><rect x="65" y="80" width="5" height="5"/><rect x="80" y="80" width="5" height="5"/>
      </g>
    </svg>`
  ).toString("base64");

export function getStaticSampleInvoice(opts?: {
  template?: TemplateId;
  industry?: IndustryData;
}): InvoiceData {
  const templateId: TemplateId = opts?.template ?? "modern";
  const tpl = TEMPLATES[templateId];
  const items = opts?.industry?.sampleItems ?? DEFAULT_SAMPLE_ITEMS;

  return {
    senderName: "Studio Mercer & Co.",
    senderEmail: "hello@studiomercer.com",
    senderAddress: "1234 Market Street, Suite 500\nSan Francisco, CA 94105",
    senderPhone: "+1 (415) 555-0192",
    senderWebsite: "studiomercer.com",
    senderTaxId: "84-2541367",
    logo: "",

    clientName: "Northwind Trading Co.",
    clientEmail: "accounts@northwindtrading.com",
    clientAddress: "789 Broadway, Floor 12\nNew York, NY 10003",
    clientTaxId: "",

    invoiceNumber: STATIC_INVOICE_NUMBER,
    invoiceDate: STATIC_DATE,
    dueDate: STATIC_DUE,
    poNumber: "PO-7821",

    lineItems: items.map((item, i) => ({
      id: `sample-${templateId}-${i}`,
      description: item.description,
      quantity: item.qty,
      rate: item.rate,
      amount: item.qty * item.rate,
    })),

    taxRate: 8.25,
    taxLabel: "Tax",
    discountRate: 5,
    shippingFee: 0,
    lateFeeRate: 1.5,

    notes: "Thank you for your business! We appreciate your prompt payment.",
    terms: "Payment is due within 30 days of the invoice date. Late payments may be subject to a 1.5% monthly fee.",
    currency: "USD",
    language: "en",
    template: templateId,
    customStyle: {
      primaryColor: tpl.primaryColor,
      accentColor: tpl.accentColor,
      fontStyle: tpl.fontStyle,
    },
    status: "pending",

    paymentInfo: {
      bankName: "Wells Fargo Bank",
      accountName: "Studio Mercer & Co.",
      accountNumber: "**** **** **** 1234",
      routingNumber: "121000248",
      swiftCode: "WFBIUS6S",
      paypalEmail: "pay@studiomercer.com",
      customField: "",
    },
    signature: DEFAULT_SAMPLE_SIGNATURE,
    watermark: "PREVIEW",
    qrCodeData: "https://invoicegen.app/pay/sample",
  };
}

export const ALL_TEMPLATE_IDS: TemplateId[] = [
  "modern", "classic", "elegant", "executive",
  "creative", "minimal", "bold", "pastel",
  "monochrome", "sidebar",
];

// Subset shown on industry pages (6 most distinctive)
export const INDUSTRY_TEMPLATE_IDS: TemplateId[] = [
  "modern", "classic", "elegant",
  "executive", "creative", "monochrome",
];
