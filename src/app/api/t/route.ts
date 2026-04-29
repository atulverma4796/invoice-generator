import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface DeviceInfo {
  browser?: string;
  os?: string;
  platform?: string;
  screen?: string;
  language?: string;
  userAgent?: string;
}

interface Signals {
  template?: string;
  language?: string;
  currency?: string;
  lineItemCount?: number;
  totalBucket?: string;
  taxRate?: number;
  discountRate?: number;
  hasLogo?: boolean;
  hasSignature?: boolean;
  hasQrCode?: boolean;
  hasNotes?: boolean;
  hasTerms?: boolean;
  hasWatermark?: boolean;
  hasPaymentInfo?: boolean;
  hasShipping?: boolean;
  hasLateFee?: boolean;
  hasPoNumber?: boolean;
  hasDueDate?: boolean;
  status?: string;
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

function bool(v: unknown): string {
  return v ? "✅" : "—";
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
      device = {} as DeviceInfo,
      timezone: browserTimezone = "",
      referrer = "",
      url = "",
      signals = {} as Signals,
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

    const actionLabel = action === "email" ? "Invoice Emailed" : "Invoice Downloaded";
    const subjectPrefix = action === "email" ? "[Email]" : "[Download]";
    const subjectGeo = geo?.countryCode || (locationLine !== "Unknown" ? locationLine : "??");
    const subjectDevice = `${device.browser || "?"} on ${device.os || "?"}`;
    const subjectAmount = `${signals.totalBucket || "?"} ${signals.currency || ""}`.trim();

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
      subject: `${subjectPrefix} ${subjectGeo} · ${subjectDevice} · ${subjectAmount}`,
      html: `
        <div style="font-family:sans-serif;max-width:780px;padding:20px;background:#fff;color:#111;">
          <h2 style="color:#2563eb;margin:0 0 4px 0;">${actionLabel}</h2>
          <p style="margin:0 0 12px 0;color:#6b7280;font-size:13px;">Tracked at ${escapeHtml(now)} IST · admin-only analytics · no invoice content collected</p>

          ${flagsBlock}

          <h3 style="color:#374151;margin-top:18px;">Event</h3>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px;font-weight:bold;color:#374151;width:200px;">Action</td><td style="padding:8px;color:#6b7280;">${escapeHtml(action)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Template / Language</td><td style="padding:8px;color:#6b7280;">${escapeHtml(signals.template) || "?"} / ${escapeHtml(signals.language) || "?"}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px;font-weight:bold;color:#374151;">Currency</td><td style="padding:8px;color:#6b7280;">${escapeHtml(signals.currency) || "?"}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Total range</td><td style="padding:8px;color:#6b7280;">${escapeHtml(signals.totalBucket) || "?"}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px;font-weight:bold;color:#374151;">Line items</td><td style="padding:8px;color:#6b7280;">${escapeHtml(signals.lineItemCount ?? "?")}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Tax / Discount rate</td><td style="padding:8px;color:#6b7280;">Tax: ${escapeHtml(signals.taxRate ?? "0")}% · Discount: ${escapeHtml(signals.discountRate ?? "0")}%</td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#374151;">Status</td><td style="padding:8px;color:#6b7280;">${escapeHtml(signals.status) || "—"}</td></tr>
          </table>

          <h3 style="color:#374151;margin-top:18px;">Feature Usage</h3>
          <table style="border-collapse:collapse;width:100%;font-size:13px;">
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;color:#374151;width:200px;">Logo</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasLogo)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;color:#374151;">Signature</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasSignature)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;color:#374151;">QR code</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasQrCode)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;color:#374151;">Notes</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasNotes)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;color:#374151;">Terms</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasTerms)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;color:#374151;">Watermark</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasWatermark)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;color:#374151;">Payment info</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasPaymentInfo)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;color:#374151;">Shipping fee</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasShipping)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;color:#374151;">Late fee</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasLateFee)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;"><td style="padding:6px 8px;color:#374151;">PO number</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasPoNumber)}</td></tr>
            <tr><td style="padding:6px 8px;color:#374151;">Due date</td><td style="padding:6px 8px;color:#6b7280;">${bool(signals.hasDueDate)}</td></tr>
          </table>

          <h3 style="color:#374151;margin-top:18px;">Device & Network</h3>
          <table style="border-collapse:collapse;width:100%;font-size:13px;">
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 8px;font-weight:bold;color:#374151;width:200px;">IP Address</td><td style="padding:6px 8px;color:#6b7280;">${escapeHtml(ip)}</td></tr>
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
