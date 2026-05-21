// Generic download tracker for the 5 non-invoice document generators
// (quotation, purchase-order, delivery-note, salary-slip, rent-receipt).
// Sends a beacon to /api/t with the doc type so the admin notification
// email is labelled correctly.
//
// PII rules match trackInvoiceEvent: no sender/client names, addresses,
// emails, line-item descriptions, or notes are transmitted. Only the
// doc type, currency, total bucket, and abuse-detection signals.

export type DocType =
  | "quotation"
  | "purchase-order"
  | "delivery-note"
  | "salary-slip"
  | "rent-receipt";

interface DocSummary {
  currency?: string;
  total?: number;
  lineItemCount?: number;
  // Additional doc-specific signals — small flags only, no content
  flags?: Record<string, boolean>;
}

function totalBucket(total: number | undefined): string {
  if (total === undefined || !isFinite(total) || total <= 0) return "0";
  if (total < 100) return "<100";
  if (total < 1000) return "100-1k";
  if (total < 10000) return "1k-10k";
  if (total < 100000) return "10k-100k";
  return "100k+";
}

function getDeviceInfo() {
  if (typeof window === "undefined") {
    return { browser: "unknown", os: "unknown", platform: "unknown", screen: "unknown", language: "unknown", userAgent: "unknown" };
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

export function trackDocDownload(docType: DocType, summary: DocSummary = {}) {
  try {
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
      action: "download",
      docType,
      device: getDeviceInfo(),
      timezone,
      referrer,
      url,
      signals: {
        currency: summary.currency,
        lineItemCount: summary.lineItemCount,
        totalBucket: totalBucket(summary.total),
        ...summary.flags,
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
    // never block the user
  }
}
