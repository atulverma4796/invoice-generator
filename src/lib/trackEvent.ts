// Internal analytics — admin-only, silent, never shown to users.
// Captures abuse/bot signals + high-level feature-usage signals only.
// Does NOT transmit invoice content, sender/client identities, or line-item details.
// Does NOT create or transmit a persistent user identifier — returning-user
// patterns are tracked via Google Analytics 4 (already wired and disclosed).
import { InvoiceData } from "@/types/invoice";
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

function totalBucket(total: number): string {
  if (!isFinite(total) || total <= 0) return "0";
  if (total < 100) return "<100";
  if (total < 1000) return "100-1k";
  if (total < 10000) return "1k-10k";
  if (total < 100000) return "10k-100k";
  return "100k+";
}

/**
 * Sends a silent analytics beacon to /api/t.
 * Captures: feature-usage flags, totals bucket, device/browser/timezone/referrer/url,
 * and bot-detection inputs.
 * Does NOT capture: invoice number, sender/client name/email/address,
 * line item descriptions, exact totals, notes, terms, payment info, QR data,
 * recipient email, or any persistent user identifier.
 */
export function trackInvoiceEvent(
  action: "download" | "email",
  data: InvoiceData,
  _extra: { recipientEmail?: string } = {},
) {
  // _extra is intentionally unused — recipient email is no longer transmitted to
  // keep the silent analytics PII-free. Signature kept stable for callers.
  void _extra;
  try {
    const subtotal = calculateSubtotal(data.lineItems);
    const tax = calculateTax(subtotal, data.taxRate);
    const discount = calculateDiscount(subtotal, data.discountRate);
    const total = calculateTotal(subtotal, tax, discount) + (data.shippingFee || 0);

    const items = data.lineItems.filter(
      (it) => it.description?.trim() || it.amount > 0,
    );

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
      device: getDeviceInfo(),
      timezone,
      referrer,
      url,
      // High-level invoice signals — no PII, no content.
      signals: {
        template: data.template,
        language: data.language,
        currency: data.currency,
        lineItemCount: items.length,
        totalBucket: totalBucket(total),
        taxRate: data.taxRate,
        discountRate: data.discountRate,
        hasLogo: !!data.logo,
        hasSignature: !!data.signature,
        hasQrCode: !!data.qrCodeData,
        hasNotes: !!(data.notes && data.notes.trim()),
        hasTerms: !!(data.terms && data.terms.trim()),
        hasWatermark: !!(data.watermark && data.watermark.trim()),
        hasPaymentInfo:
          !!data.paymentInfo &&
          Object.values(data.paymentInfo).some((v) => v && String(v).trim() !== ""),
        hasShipping: (data.shippingFee || 0) > 0,
        hasLateFee: !!(data.lateFeeRate && data.lateFeeRate > 0),
        hasPoNumber: !!(data.poNumber && data.poNumber.trim()),
        hasDueDate: !!data.dueDate,
        status: data.status,
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
