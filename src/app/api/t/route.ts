import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface LineItem {
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
}

interface InvoicePayload {
  poNumber?: string;
  status?: string;
  template?: string;
  language?: string;
  invoiceDate?: string;
  dueDate?: string;
  sender?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    taxId?: string;
  };
  client?: {
    name?: string;
    email?: string;
    address?: string;
  };
  lineItems?: LineItem[];
  subtotal?: string;
  taxRate?: number;
  taxLabel?: string;
  tax?: string;
  discountRate?: number;
  discount?: string;
  shippingFee?: number;
  lateFeeRate?: number;
  paymentInfo?: Record<string, string>;
  notes?: string;
  terms?: string;
  watermark?: string;
  hasLogo?: boolean;
  hasSignature?: boolean;
  qrCodeData?: string;
}

interface DeviceInfo {
  browser?: string;
  os?: string;
  platform?: string;
  screen?: string;
  language?: string;
  userAgent?: string;
}

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface GeoLookup {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  isp?: string;
  org?: string;
  asn?: string;
  timezone?: string;
  proxy?: boolean;
  hosting?: boolean;
  mobile?: boolean;
  raw?: unknown;
}

async function lookupGeo(ip: string): Promise<GeoLookup | null> {
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::1")) return null;

  // 1) Try ipapi.co (HTTPS, accurate, generous free tier)
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "InvoiceGen-Analytics/1.0" },
    });
    if (res.ok) {
      const j = await res.json();
      if (j && !j.error && j.country_name) {
        return {
          city: j.city,
          region: j.region,
          country: j.country_name,
          countryCode: j.country_code,
          isp: j.org,
          org: j.org,
          asn: j.asn,
          timezone: j.timezone,
          raw: j,
        };
      }
    }
  } catch {
    // fall through
  }

  // 2) Fallback: ip-api.com (HTTP only, but extra signals like proxy/hosting/mobile)
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,as,proxy,hosting,mobile,timezone`,
    );
    if (res.ok) {
      const j = await res.json();
      if (j && j.status === "success") {
        return {
          city: j.city,
          region: j.regionName,
          country: j.country,
          countryCode: j.countryCode,
          isp: j.isp,
          org: j.org,
          asn: j.as,
          timezone: j.timezone,
          proxy: j.proxy,
          hosting: j.hosting,
          mobile: j.mobile,
          raw: j,
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function botSignals(geo: GeoLookup | null, device: DeviceInfo, browserTimezone: string, referrer: string): string[] {
  const flags: string[] = [];
  if (geo?.hosting) flags.push("hosting/datacenter IP");
  if (geo?.proxy) flags.push("proxy/VPN");
  if (geo && geo.timezone && browserTimezone && geo.timezone !== browserTimezone) {
    flags.push(`timezone mismatch (IP: ${geo.timezone} vs browser: ${browserTimezone})`);
  }
  const ua = (device.userAgent || "").toLowerCase();
  if (/(bot|crawler|spider|headless|phantom|puppeteer|playwright|selenium|httpclient|curl|wget)/i.test(ua)) {
    flags.push("automated user-agent");
  }
  if (!device.screen || device.screen === "0x0") flags.push("missing screen size");
  if (!referrer) flags.push("no referrer");
  return flags;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "download",
      invoiceNumber,
      clientName,
      total,
      currency,
      device = {} as DeviceInfo,
      timezone: browserTimezone = "",
      referrer = "",
      url = "",
      recipientEmail = "",
      invoice = {} as InvoicePayload,
    } = body || {};

    // IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    // Geo lookup with fallbacks
    const geo = await lookupGeo(ip);
    const locationLine = geo
      ? [geo.city, geo.region, geo.country].filter(Boolean).join(", ")
      : "Unknown";
    const ispLine = geo?.isp || geo?.org || "Unknown";
    const flags = botSignals(geo, device, browserTimezone, referrer);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Build line-items table
    const items: LineItem[] = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
    const itemsRows = items.length
      ? items
          .map(
            (it) => `
              <tr>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;">${escapeHtml(it.description)}</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(it.quantity)}</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(it.rate)}</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(it.amount)}</td>
              </tr>`,
          )
          .join("")
      : `<tr><td colspan="4" style="padding:6px 8px;border:1px solid #e5e7eb;color:#9ca3af;">No items captured</td></tr>`;

    // Build payment-info rows (only non-empty fields)
    const pi = invoice.paymentInfo || {};
    const paymentRows = Object.entries(pi)
      .filter(([, v]) => v && String(v).trim() !== "")
      .map(
        ([k, v]) => `
          <tr>
            <td style="padding:6px 8px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">${escapeHtml(k)}</td>
            <td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(v)}</td>
          </tr>`,
      )
      .join("");

    const sender = invoice.sender || {};
    const client = invoice.client || {};

    const actionLabel = action === "email" ? "Invoice Emailed" : "Invoice Downloaded";
    const subjectPrefix = action === "email" ? "[Email]" : "[Download]";

    const flagsBlock = flags.length
      ? `<div style="margin:12px 0;padding:10px 12px;background:#fef3c7;border:1px solid #fbbf24;border-radius:6px;">
          <strong style="color:#92400e;">⚠️ Bot signals:</strong>
          <ul style="margin:4px 0 0 18px;padding:0;color:#92400e;font-size:13px;">${flags.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
        </div>`
      : `<div style="margin:12px 0;padding:10px 12px;background:#dcfce7;border:1px solid #86efac;border-radius:6px;color:#166534;font-size:13px;">
          ✅ No bot signals detected — likely a real user.
        </div>`;

    await transporter.sendMail({
      from: `"InvoiceGen Analytics" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `${subjectPrefix} Invoice #${invoiceNumber || "?"} — ${clientName || "Unknown Client"}`,
      html: `
        <div style="font-family:sans-serif;max-width:780px;padding:20px;background:#fff;color:#111;">
          <h2 style="color:#2563eb;margin:0 0 4px 0;">${actionLabel}</h2>
          <p style="margin:0 0 12px 0;color:#6b7280;font-size:13px;">Tracked at ${escapeHtml(now)} IST · admin-only analytics</p>

          ${flagsBlock}

          <h3 style="color:#374151;margin-top:18px;">Top Line</h3>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px;font-weight:bold;color:#374151;width:160px;">Action</td><td style="padding:8px;color:#6b7280;">${escapeHtml(action)}${recipientEmail ? ` → ${escapeHtml(recipientEmail)}` : ""}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Invoice #</td><td style="padding:8px;color:#6b7280;">${escapeHtml(invoiceNumber)}${invoice.poNumber ? ` &nbsp; PO: ${escapeHtml(invoice.poNumber)}` : ""}${invoice.status ? ` &nbsp; <span style="background:#fef3c7;padding:2px 6px;border-radius:4px;font-size:11px;color:#92400e;">${escapeHtml(invoice.status)}</span>` : ""}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px;font-weight:bold;color:#374151;">Client</td><td style="padding:8px;color:#6b7280;">${escapeHtml(client.name)}${client.email ? ` (${escapeHtml(client.email)})` : ""}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Total</td><td style="padding:8px;color:#6b7280;font-weight:bold;">${escapeHtml(currency)} ${escapeHtml(total)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px;font-weight:bold;color:#374151;">Template / Language</td><td style="padding:8px;color:#6b7280;">${escapeHtml(invoice.template)} / ${escapeHtml(invoice.language)}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Dates</td><td style="padding:8px;color:#6b7280;">Issued: ${escapeHtml(invoice.invoiceDate)} · Due: ${escapeHtml(invoice.dueDate)}</td></tr>
          </table>

          <h3 style="color:#374151;margin-top:18px;">From / To</h3>
          <table style="border-collapse:collapse;width:100%;font-size:13px;">
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;width:50%;vertical-align:top;">
                <strong style="color:#374151;">FROM</strong><br>
                ${escapeHtml(sender.name) || "<span style='color:#9ca3af;'>(empty)</span>"}<br>
                <span style="color:#6b7280;">${escapeHtml(sender.email)}</span><br>
                <span style="color:#6b7280;">${escapeHtml(sender.phone)}</span><br>
                <span style="color:#6b7280;">${escapeHtml(sender.website)}</span><br>
                <span style="color:#6b7280;white-space:pre-line;">${escapeHtml(sender.address)}</span><br>
                ${sender.taxId ? `<span style="color:#6b7280;">Tax ID: ${escapeHtml(sender.taxId)}</span>` : ""}
              </td>
              <td style="padding:10px;border:1px solid #e5e7eb;vertical-align:top;">
                <strong style="color:#374151;">BILL TO</strong><br>
                ${escapeHtml(client.name) || "<span style='color:#9ca3af;'>(empty)</span>"}<br>
                <span style="color:#6b7280;">${escapeHtml(client.email)}</span><br>
                <span style="color:#6b7280;white-space:pre-line;">${escapeHtml(client.address)}</span>
              </td>
            </tr>
          </table>

          <h3 style="color:#374151;margin-top:18px;">Line Items (${items.length})</h3>
          <table style="border-collapse:collapse;width:100%;font-size:13px;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;color:#374151;">Description</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;color:#374151;">Qty</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;color:#374151;">Rate</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;color:#374151;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>

          <h3 style="color:#374151;margin-top:18px;">Totals</h3>
          <table style="border-collapse:collapse;width:100%;font-size:13px;">
            <tr><td style="padding:6px 8px;border:1px solid #e5e7eb;width:160px;color:#374151;">Subtotal</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(invoice.subtotal)}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;">${escapeHtml(invoice.taxLabel || "Tax")} (${escapeHtml(invoice.taxRate)}%)</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(invoice.tax)}</td></tr>
            <tr><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;">Discount (${escapeHtml(invoice.discountRate)}%)</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(invoice.discount)}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;">Shipping</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(invoice.shippingFee)}</td></tr>
            <tr><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;">Late Fee Rate</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(invoice.lateFeeRate)}%</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;font-weight:bold;">Total</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#111;font-weight:bold;">${escapeHtml(currency)} ${escapeHtml(total)}</td></tr>
          </table>

          ${
            paymentRows
              ? `<h3 style="color:#374151;margin-top:18px;">Payment Info</h3>
                 <table style="border-collapse:collapse;width:100%;font-size:13px;">${paymentRows}</table>`
              : ""
          }

          ${
            invoice.notes || invoice.terms || invoice.watermark || invoice.qrCodeData
              ? `<h3 style="color:#374151;margin-top:18px;">Extras</h3>
                 <table style="border-collapse:collapse;width:100%;font-size:13px;">
                   ${invoice.watermark ? `<tr><td style="padding:6px 8px;border:1px solid #e5e7eb;width:160px;color:#374151;">Watermark</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(invoice.watermark)}</td></tr>` : ""}
                   ${invoice.notes ? `<tr style="background:#f9fafb;"><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;vertical-align:top;">Notes</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;white-space:pre-line;">${escapeHtml(invoice.notes)}</td></tr>` : ""}
                   ${invoice.terms ? `<tr><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;vertical-align:top;">Terms</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;white-space:pre-line;">${escapeHtml(invoice.terms)}</td></tr>` : ""}
                   ${invoice.qrCodeData ? `<tr style="background:#f9fafb;"><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;">QR Code Data</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;word-break:break-all;">${escapeHtml(invoice.qrCodeData)}</td></tr>` : ""}
                   <tr><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#374151;">Logo / Signature</td><td style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280;">Logo: ${invoice.hasLogo ? "✅ Yes" : "—"} · Signature: ${invoice.hasSignature ? "✅ Yes" : "—"}</td></tr>
                 </table>`
              : ""
          }

          <h3 style="color:#374151;margin-top:18px;">Device & Network</h3>
          <table style="border-collapse:collapse;width:100%;font-size:13px;">
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;width:160px;">IP Address</td><td style="padding:6px 8px;color:#6b7280;">${escapeHtml(ip)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">Location</td><td style="padding:6px 8px;color:#6b7280;">${escapeHtml(locationLine)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">ISP / Org</td><td style="padding:6px 8px;color:#6b7280;">${escapeHtml(ispLine)}${geo?.asn ? ` · ${escapeHtml(geo.asn)}` : ""}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">IP timezone / Browser timezone</td><td style="padding:6px 8px;color:#6b7280;">${escapeHtml(geo?.timezone || "?")} / ${escapeHtml(browserTimezone)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">Connection type</td><td style="padding:6px 8px;color:#6b7280;">${geo?.mobile ? "📱 Mobile" : ""}${geo?.proxy ? " 🛡️ Proxy/VPN" : ""}${geo?.hosting ? " 🖥️ Hosting/datacenter" : ""}${!geo?.mobile && !geo?.proxy && !geo?.hosting ? "Residential / Unknown" : ""}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">Browser / OS</td><td style="padding:6px 8px;color:#6b7280;">${escapeHtml(device.browser)} on ${escapeHtml(device.os)} (${escapeHtml(device.platform)})</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">Screen / Language</td><td style="padding:6px 8px;color:#6b7280;">${escapeHtml(device.screen)} · ${escapeHtml(device.language)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">Page URL</td><td style="padding:6px 8px;color:#6b7280;word-break:break-all;">${escapeHtml(url)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">Referrer</td><td style="padding:6px 8px;color:#6b7280;word-break:break-all;">${escapeHtml(referrer) || "<span style='color:#9ca3af;'>none</span>"}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;">User Agent</td><td style="padding:6px 8px;color:#6b7280;font-size:11px;word-break:break-all;">${escapeHtml(device.userAgent)}</td></tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track event error:", error);
    return NextResponse.json({ success: false });
  }
}
