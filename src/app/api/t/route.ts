import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const MAX_BODY_BYTES = 12_288;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 12;
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const DOC_LABELS: Record<string, { name: string; subjectTag: string }> = {
  invoice: { name: "Invoice", subjectTag: "Invoice" }, quotation: { name: "Quotation", subjectTag: "Quotation" },
  "purchase-order": { name: "Purchase Order", subjectTag: "PO" }, "delivery-note": { name: "Delivery Note", subjectTag: "Delivery Note" },
  "salary-slip": { name: "Salary Slip", subjectTag: "Salary Slip" }, "rent-receipt": { name: "Rent Receipt", subjectTag: "Rent Receipt" },
};
const FEATURE_FIELDS = ["hasLogo", "hasSignature", "hasQrCode", "hasNotes", "hasTerms", "hasWatermark", "hasPaymentInfo", "hasShipping", "hasLateFee", "hasPoNumber", "hasDueDate"] as const;

function text(value: unknown, maxLength: number): string { return typeof value === "string" ? value.trim().slice(0, maxLength) : ""; }
function escapeHtml(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function sameOrigin(req: NextRequest): boolean { const origin = req.headers.get("origin"); try { return !!origin && new URL(origin).origin === req.nextUrl.origin; } catch { return false; } }
function clientKey(req: NextRequest): string { return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || req.headers.get("user-agent") || "unknown"; }
function withinRateLimit(key: string): boolean { const now = Date.now(); const entry = rateLimits.get(key); if (!entry || entry.resetAt <= now) { rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }); return true; } if (entry.count >= MAX_EVENTS_PER_WINDOW) return false; entry.count += 1; return true; }
function country(req: NextRequest): string { const value = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || ""; return /^[A-Z]{2}$/i.test(value) ? value.toUpperCase() : "??"; }
function bool(value: unknown): string { return value === true ? "✅" : "—"; }
function likelyBot(userAgent: string): boolean { return /(bot|crawler|spider|headless|phantom|puppeteer|playwright|selenium|httpclient|curl|wget)/i.test(userAgent); }

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ success: false }, { status: 403 });
  if (Number(req.headers.get("content-length") || "0") > MAX_BODY_BYTES) return NextResponse.json({ success: false }, { status: 413 });
  if (!withinRateLimit(clientKey(req))) return NextResponse.json({ success: false }, { status: 429 });
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ success: false }, { status: 400 });
    const payload = body as Record<string, unknown>;
    const rawDevice = payload.device && typeof payload.device === "object" && !Array.isArray(payload.device) ? payload.device as Record<string, unknown> : {};
    const rawSignals = payload.signals && typeof payload.signals === "object" && !Array.isArray(payload.signals) ? payload.signals as Record<string, unknown> : {};
    const docType = text(payload.docType, 40);
    const doc = DOC_LABELS[docType] || DOC_LABELS.invoice;
    const action = payload.action === "email" ? "email" : "download";
    const browser = text(rawDevice.browser, 40) || "Unknown";
    const os = text(rawDevice.os, 40) || "Unknown";
    const userAgent = text(rawDevice.userAgent, 500) || text(req.headers.get("user-agent"), 500);
    if (likelyBot(userAgent)) return NextResponse.json({ success: true, suppressed: "bot" });
    const signals = {
      template: text(rawSignals.template, 60), language: text(rawSignals.language, 30), currency: text(rawSignals.currency, 10), totalBucket: text(rawSignals.totalBucket, 30),
      lineItemCount: typeof rawSignals.lineItemCount === "number" && Number.isFinite(rawSignals.lineItemCount) ? Math.max(0, Math.min(rawSignals.lineItemCount, 999)) : "?",
      taxRate: typeof rawSignals.taxRate === "number" && Number.isFinite(rawSignals.taxRate) ? rawSignals.taxRate : 0,
      discountRate: typeof rawSignals.discountRate === "number" && Number.isFinite(rawSignals.discountRate) ? rawSignals.discountRate : 0,
    };
    const features = FEATURE_FIELDS.map((field) => `<tr><td style="padding:6px 8px;width:180px">${field.replace(/^has/, "").replace(/([A-Z])/g, " $1")}</td><td style="padding:6px 8px">${bool(rawSignals[field])}</td></tr>`).join("");
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    await transporter.sendMail({
      from: `"InvoiceGen Analytics" <${process.env.GMAIL_USER}>`, to: process.env.GMAIL_USER,
      subject: `${action === "email" ? "[Email · " : "["}${doc.subjectTag}] ${country(req)} · ${browser} on ${os} · ${signals.totalBucket || "?"} ${signals.currency}`.trim(),
      html: `<div style="font-family:sans-serif;max-width:780px;padding:20px;background:#fff;color:#111"><h2 style="color:#2563eb;margin:0 0 4px">${action === "email" ? "Emailed" : "Downloaded"} ${doc.name}</h2><p style="color:#6b7280;font-size:13px">Tracked at ${escapeHtml(now)} IST · no invoice content collected</p><table style="border-collapse:collapse;width:100%;font-size:14px"><tr><td style="padding:8px;font-weight:bold;width:180px">Country</td><td style="padding:8px">${country(req)}</td></tr><tr><td style="padding:8px;font-weight:bold">Template / language</td><td style="padding:8px">${escapeHtml(signals.template) || "?"} / ${escapeHtml(signals.language) || "?"}</td></tr><tr><td style="padding:8px;font-weight:bold">Currency / total range</td><td style="padding:8px">${escapeHtml(signals.currency) || "?"} / ${escapeHtml(signals.totalBucket) || "?"}</td></tr><tr><td style="padding:8px;font-weight:bold">Line items</td><td style="padding:8px">${signals.lineItemCount}</td></tr><tr><td style="padding:8px;font-weight:bold">Tax / discount</td><td style="padding:8px">${signals.taxRate}% / ${signals.discountRate}%</td></tr><tr><td style="padding:8px;font-weight:bold">Browser / OS</td><td style="padding:8px">${escapeHtml(browser)} on ${escapeHtml(os)}</td></tr></table><h3>Feature usage</h3><table style="border-collapse:collapse;width:100%;font-size:13px">${features}</table></div>`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track event error:", error);
    return NextResponse.json({ success: false });
  }
}
