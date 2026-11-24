// Data builders for the PDF suite: minimal / full / many-items / long-text /
// non-Latin variants for every document type.
import type { InvoiceData, LineItem, TemplateId } from "@/types/invoice";
import { TEMPLATES } from "@/lib/templates";
import type { QuotationData } from "@/components/QuotationForm";
import type { PurchaseOrderData } from "@/components/PurchaseOrderForm";
import type { DeliveryNoteData } from "@/components/DeliveryNoteForm";
import type { SalarySlipData } from "@/components/SalarySlipForm";
import type { RentReceiptData } from "@/components/RentReceiptForm";
import { lorem } from "./env";

// Small PNG / JPEG data URLs (valid images jsPDF can embed).
export const PNG_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
export const JPEG_8x4 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACKADAAQAAAABAAAABAAAAAD/wAARCAAEAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwACAgICAgIDAgIDBQMDAwUGBQUFBQYIBgYGBgYICggICAgICAoKCgoKCgoKDAwMDAwMDg4ODg4PDw8PDw8PDw8P/9sAQwECAgIEBAQHBAQHEAsJCxAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ/90ABAAB/9oADAMBAAIRAxEAPwD9LKKKK/lc/is//9k=";
// 8x4 (2:1) PNG — for aspect-ratio checks.
export const PNG_8x4 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACKADAAQAAAABAAAABAAAAABQdJZTAAAAF0lEQVQIHWNk+M9Qz4AHMOGRA0tRrgAAw5IBhhCQu5kAAAAASUVORK5CYII=";
export const SVG_LOGO =
  "data:image/svg+xml;base64," +
  Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>').toString("base64");

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

export function items(n: number, opts: { rate?: number; qty?: number; desc?: (i: number) => string } = {}): LineItem[] {
  return Array.from({ length: n }, (_, i) => {
    const quantity = opts.qty ?? (i % 3) + 1;
    const rate = opts.rate ?? 100 + i * 12.5;
    return {
      id: `li-${i}`,
      description: opts.desc ? opts.desc(i) : `Item ${i + 1} — consulting services`,
      quantity,
      rate,
      amount: Math.round(quantity * rate * 100) / 100,
    };
  });
}

export function minimalInvoice(overrides: Partial<InvoiceData> = {}): InvoiceData {
  const tpl = TEMPLATES[overrides.template ?? "modern"];
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
    invoiceNumber: "INV-1",
    invoiceDate: "",
    dueDate: "",
    poNumber: "",
    lineItems: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
    taxRate: 0,
    taxLabel: "",
    discountRate: 0,
    shippingFee: 0,
    lateFeeRate: 0,
    notes: "",
    terms: "",
    currency: "USD",
    language: "en",
    template: "modern",
    customStyle: { primaryColor: tpl.primaryColor, accentColor: tpl.accentColor, fontStyle: tpl.fontStyle },
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
    ...overrides,
  };
}

export function fullInvoice(overrides: Partial<InvoiceData> = {}): InvoiceData {
  const template = overrides.template ?? "modern";
  const tpl = TEMPLATES[template];
  return minimalInvoice({
    senderName: "Studio Mercer & Co.",
    senderEmail: "hello@studiomercer.com",
    senderAddress: "1234 Market Street, Suite 500\nSan Francisco, CA 94105",
    senderPhone: "+1 (415) 555-0192",
    senderWebsite: "studiomercer.com",
    senderTaxId: "84-2541367",
    logo: PNG_1PX,
    clientName: "Northwind Trading Co.",
    clientEmail: "accounts@northwind.com",
    clientAddress: "789 Broadway, Floor 12\nNew York, NY 10003",
    clientTaxId: "12-3456789",
    invoiceNumber: "INV-001245",
    invoiceDate: "2026-04-15",
    dueDate: "2026-05-15",
    poNumber: "PO-7821",
    lineItems: items(3),
    taxRate: 10,
    taxLabel: "Tax",
    discountRate: 5,
    shippingFee: 25,
    lateFeeRate: 1.5,
    notes: "Thank you for your business!",
    terms: "Payment due within 30 days.",
    status: "pending",
    paymentInfo: {
      bankName: "Wells Fargo",
      accountName: "Studio Mercer",
      accountNumber: "1234567890",
      routingNumber: "121000248",
      swiftCode: "WFBIUS6S",
      paypalEmail: "pay@studiomercer.com",
      customField: "Zelle: pay@studiomercer.com",
    },
    signature: PNG_1PX,
    watermark: "PAID",
    qrCodeData: "upi://pay?pa=studio@upi",
    template,
    customStyle: { primaryColor: tpl.primaryColor, accentColor: tpl.accentColor, fontStyle: tpl.fontStyle },
    ...overrides,
  });
}

// ─── Quotation ───
export function quotation(overrides: Partial<QuotationData> = {}): QuotationData {
  return {
    senderName: "Acme Supplies",
    senderEmail: "sales@acme.test",
    senderPhone: "+91 98765 43210",
    senderAddress: "12 MG Road\nBengaluru 560001",
    senderTaxId: "29ABCDE1234F1Z5",
    clientName: "Globex Ltd",
    clientEmail: "buy@globex.test",
    clientAddress: "5 Park Street\nKolkata",
    quoteNumber: "Q-2026-101",
    quoteDate: "2026-04-01",
    validUntil: "2026-05-01",
    lineItems: [
      { id: "a", description: "Widget", quantity: 2, rate: 1500 },
      { id: "b", description: "Installation", quantity: 1, rate: 2000 },
    ],
    taxRate: 18,
    taxLabel: "GST",
    discountRate: 10,
    currency: "INR",
    notes: "Thanks for the opportunity.",
    terms: "Valid for 30 days.",
    ...overrides,
  };
}

export function minimalQuotation(): QuotationData {
  return quotation({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderAddress: "",
    senderTaxId: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    quoteDate: "",
    validUntil: "",
    lineItems: [{ id: "a", description: "", quantity: 1, rate: 0 }],
    taxRate: 0,
    discountRate: 0,
    notes: "",
    terms: "",
  });
}

export function quoteItems(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: `q${i}`, description: `Line ${i + 1}`, quantity: (i % 4) + 1, rate: 99.99 + i }));
}

// ─── Purchase order ───
export function purchaseOrder(overrides: Partial<PurchaseOrderData> = {}): PurchaseOrderData {
  return {
    buyerName: "Buyer Corp",
    buyerEmail: "po@buyer.test",
    buyerPhone: "+1 555 0100",
    buyerAddress: "1 Infinite Loop\nCupertino CA",
    buyerTaxId: "US-998877",
    vendorName: "Vendor Inc",
    vendorEmail: "orders@vendor.test",
    vendorAddress: "42 Industrial Way\nAustin TX",
    shipToAddress: "Warehouse 7, Dock B, Reno NV",
    poNumber: "PO-2026-555",
    poDate: "2026-03-10",
    expectedDelivery: "2026-03-24",
    lineItems: [
      { id: "a", description: "Steel bolts M8", quantity: 500, rate: 0.35 },
      { id: "b", description: "Washers", quantity: 500, rate: 0.05 },
    ],
    taxRate: 8,
    taxLabel: "Sales Tax",
    discountRate: 5,
    shippingFee: 40,
    currency: "USD",
    notes: "Deliver to the back dock.",
    terms: "Net 30.",
    ...overrides,
  };
}

export function minimalPurchaseOrder(): PurchaseOrderData {
  return purchaseOrder({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerTaxId: "",
    vendorName: "",
    vendorEmail: "",
    vendorAddress: "",
    shipToAddress: "",
    poDate: "",
    expectedDelivery: "",
    lineItems: [{ id: "a", description: "", quantity: 1, rate: 0 }],
    taxRate: 0,
    discountRate: 0,
    shippingFee: 0,
    notes: "",
    terms: "",
  });
}

// ─── Delivery note ───
export function deliveryNote(overrides: Partial<DeliveryNoteData> = {}): DeliveryNoteData {
  return {
    consignorName: "Dispatch Co",
    consignorAddress: "Plot 9, MIDC\nPune",
    consignorTaxId: "27AAACD1234E1Z2",
    consignorPhone: "+91 20 1234 5678",
    consigneeName: "Receiver Pvt Ltd",
    consigneeAddress: "Sector 18\nNoida",
    consigneePhone: "+91 120 555 0000",
    challanNumber: "DC-2026-77",
    challanDate: "2026-02-01",
    deliveryDate: "2026-02-03",
    referenceNumber: "PO-2026-555",
    vehicleNumber: "MH12AB1234",
    driverName: "Ramesh",
    driverPhone: "+91 99999 00000",
    transportMode: "Road",
    items: [
      { id: "a", description: "Cartons of tiles", quantity: 40, unit: "Box" },
      { id: "b", description: "Adhesive", quantity: 12.5, unit: "Kg" },
    ],
    notes: "Handle with care.",
    ...overrides,
  };
}

export function minimalDeliveryNote(): DeliveryNoteData {
  return deliveryNote({
    consignorName: "",
    consignorAddress: "",
    consignorTaxId: "",
    consignorPhone: "",
    consigneeName: "",
    consigneeAddress: "",
    consigneePhone: "",
    challanDate: "",
    deliveryDate: "",
    referenceNumber: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    items: [{ id: "a", description: "", quantity: 1, unit: "" }],
    notes: "",
  });
}

// ─── Salary slip ───
export function salarySlip(overrides: Partial<SalarySlipData> = {}): SalarySlipData {
  return {
    companyName: "Initech Software Pvt Ltd",
    companyAddress: "4th Floor, Tech Park\nHyderabad 500081",
    companyEmail: "hr@initech.test",
    employeeName: "Priya Sharma",
    employeeId: "EMP-0042",
    designation: "Senior Engineer",
    department: "Platform",
    joiningDate: "2022-07-01",
    employeePan: "ABCDE1234F",
    bankAccount: "XXXX1234",
    bankName: "HDFC Bank",
    payMonth: "2026-03",
    workingDays: 30,
    presentDays: 30,
    paidLeave: 0,
    earnings: [
      { id: "e1", label: "Basic", amount: 30000 },
      { id: "e2", label: "HRA", amount: 12000 },
      { id: "e3", label: "Special Allowance", amount: 8000 },
    ],
    deductions: [
      { id: "d1", label: "Provident Fund", amount: 1800 },
      { id: "d2", label: "Professional Tax", amount: 200 },
    ],
    notes: "System generated payslip.",
    currencySymbol: "₹",
    ...overrides,
  };
}

// ─── Rent receipt ───
export function rentReceipt(overrides: Partial<RentReceiptData> = {}): RentReceiptData {
  return {
    tenantName: "Arjun Mehta",
    landlordName: "Sunita Rao",
    landlordPan: "ABCDE1234F",
    propertyAddress: "Flat 304, Sky Tower, MG Road, Bengaluru 560001",
    monthlyRent: 15000,
    paymentMode: "Bank Transfer",
    periodMode: "fy",
    startMonth: "2025-04",
    endMonth: "2026-03",
    receiptSplit: "monthly",
    receiptStartNumber: 1,
    landlordSignature: "",
    ...overrides,
  };
}

export const LONG_TEXT = lorem(900); // ~6000 chars — several pages of terms
