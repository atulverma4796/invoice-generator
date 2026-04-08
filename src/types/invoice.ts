export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type TemplateId = "classic" | "modern" | "minimal" | "bold" | "elegant" | "executive" | "creative" | "pastel" | "monochrome" | "sidebar";
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "none" | (string & {});
export type FontStyle = "serif" | "sans";

export interface CustomStyle {
  primaryColor: string;
  accentColor: string;
  fontStyle: FontStyle;
}

export interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  paypalEmail: string;
  customField: string;
}

export interface SavedClient {
  id: string;
  name: string;
  email: string;
  address: string;
  taxId: string;
  savedAt: string;
}

export interface InvoiceData {
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  senderPhone: string;
  senderWebsite: string;
  senderTaxId: string;
  logo: string; // base64 data URL

  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientTaxId: string;

  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;

  lineItems: LineItem[];

  taxRate: number;
  taxLabel: string; // "Tax", "VAT", "GST", "IVA", etc.
  discountRate: number;
  shippingFee: number;
  lateFeeRate: number; // % per month for overdue invoices

  notes: string;
  terms: string;
  currency: string;
  language: string; // Invoice output language code e.g. "en", "es", "fr"
  template: TemplateId;
  customStyle: CustomStyle;
  status: InvoiceStatus;

  paymentInfo: PaymentInfo;
  signature: string; // base64 data URL
  watermark: string;
  qrCodeData: string; // URL or UPI string for QR code
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  headerBg: string;
  fontStyle: FontStyle;
}
