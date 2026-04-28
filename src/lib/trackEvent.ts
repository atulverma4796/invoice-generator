// Internal analytics — admin-only, silent, never shown to users.
// Captures full invoice context to detect bots vs real users in early days.
import { InvoiceData } from "@/types/invoice";
import { getCurrencySymbol } from "@/lib/defaultInvoice";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
} from "@/lib/calculations";

interface DeviceInfo {
  browser: string;
  os: string;
  platform: string;
  screen: string;
  language: string;
  userAgent: string;
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      browser: "unknown",
      os: "unknown",
      platform: "unknown",
      screen: "unknown",
      language: "unknown",
      userAgent: "unknown",
    };
  }
  const ua = window.navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/")) browser = "Safari";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return {
    browser,
    os,
    platform: window.navigator.platform || "Unknown",
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    language: window.navigator.language || "Unknown",
    userAgent: ua,
  };
}

/**
 * Sends a silent analytics beacon to /api/t with full invoice + device context.
 * Used internally to detect bots vs real users. Email goes only to admin.
 * Failures never block the user flow.
 */
export function trackInvoiceEvent(
  action: "download" | "email",
  data: InvoiceData,
  extra: { recipientEmail?: string } = {},
) {
  try {
    const subtotal = calculateSubtotal(data.lineItems);
    const tax = calculateTax(subtotal, data.taxRate);
    const discount = calculateDiscount(subtotal, data.discountRate);
    const total = calculateTotal(subtotal, tax, discount) + (data.shippingFee || 0);
    const symbol = getCurrencySymbol(data.currency);

    let timezone = "";
    let referrer = "";
    let url = "";
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      referrer = typeof document !== "undefined" ? document.referrer : "";
      url = typeof window !== "undefined" ? window.location.href : "";
    } catch {
      // ignore
    }

    const payload = JSON.stringify({
      action,
      invoiceNumber: data.invoiceNumber,
      clientName: data.clientName,
      total: `${symbol}${total.toFixed(2)}`,
      currency: data.currency,
      device: getDeviceInfo(),
      timezone,
      referrer,
      url,
      recipientEmail: extra.recipientEmail || "",
      invoice: {
        poNumber: data.poNumber,
        status: data.status,
        template: data.template,
        language: data.language,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        sender: {
          name: data.senderName,
          email: data.senderEmail,
          phone: data.senderPhone,
          website: data.senderWebsite,
          address: data.senderAddress,
          taxId: data.senderTaxId,
        },
        client: {
          name: data.clientName,
          email: data.clientEmail,
          address: data.clientAddress,
        },
        lineItems: data.lineItems
          .filter((it) => it.description?.trim() || it.amount > 0)
          .map((it) => ({
            description: it.description,
            quantity: it.quantity,
            rate: it.rate,
            amount: it.amount,
          })),
        subtotal: subtotal.toFixed(2),
        taxRate: data.taxRate,
        taxLabel: data.taxLabel,
        tax: tax.toFixed(2),
        discountRate: data.discountRate,
        discount: discount.toFixed(2),
        shippingFee: data.shippingFee || 0,
        lateFeeRate: data.lateFeeRate,
        paymentInfo: data.paymentInfo,
        notes: data.notes,
        terms: data.terms,
        watermark: data.watermark,
        hasLogo: !!data.logo,
        hasSignature: !!data.signature,
        qrCodeData: data.qrCodeData,
      },
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/t", new Blob([payload], { type: "application/json" }));
    } else if (typeof fetch !== "undefined") {
      fetch("/api/t", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // silent — never block the user
  }
}
