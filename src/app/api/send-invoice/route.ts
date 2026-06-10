// POST /api/send-invoice — emails a generated invoice PDF to a recipient
// via the project's Gmail SMTP account.
//
// Hardened against open-relay abuse: origin allowlist, per-IP rate
// limit, payload size cap, HTML escaping of all interpolated fields,
// recipient/replyTo format validation, attachment filename sanitization.
// Without these, an attacker could POST arbitrary `to`, `replyTo`,
// `senderName`, and `pdfBase64` and turn the Gmail account into a
// phishing/spam relay — Google would suspend the account.

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  base64ByteSize,
  checkRateLimit,
  escapeHtml,
  isAllowedOrigin,
  sanitizeFilename,
} from "@/lib/api-security";

// Safe enough for a single attachment without triggering Gmail's
// per-message size limit. Two checks: (a) headers Content-Length cap
// before body parse, (b) decoded PDF size cap after parse.
const MAX_REQUEST_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

// Standard email format check. Same regex the HTML email input uses;
// we still re-validate server-side because client-side validation can
// be bypassed by anyone calling the API directly.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Layer 1: origin allowlist. Stops the trivial cross-site script
  // calling our API from a foreign page. Genuine API consumers from our
  // own pages always carry an Origin/Referer header.
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Layer 2: per-IP rate limit. 5/burst, 3/min sustained — generous for
  // a legit user retrying a bounce, tight enough to make scripted spam
  // relay uneconomical.
  const rl = checkRateLimit(req, "send-invoice");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      },
    );
  }

  // Layer 3: payload size cap via Content-Length BEFORE parsing the
  // body, so a 1 GB POST doesn't read into memory just to be rejected.
  const cl = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (cl > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 },
    );
  }

  let body: {
    to?: unknown;
    senderName?: unknown;
    senderEmail?: unknown;
    invoiceNumber?: unknown;
    pdfBase64?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const senderName =
    typeof body.senderName === "string" ? body.senderName.trim() : "";
  const senderEmail =
    typeof body.senderEmail === "string" ? body.senderEmail.trim() : "";
  const invoiceNumber =
    typeof body.invoiceNumber === "string" ? body.invoiceNumber.trim() : "";
  const pdfBase64 =
    typeof body.pdfBase64 === "string" ? body.pdfBase64 : "";

  if (!to) {
    return NextResponse.json(
      { error: "Recipient email is required" },
      { status: 400 },
    );
  }
  // Reject multi-address `to` outright — a single relay request
  // sending to 50 recipients is a clear abuse signal.
  if (!EMAIL_RE.test(to) || to.includes(",") || to.includes(";")) {
    return NextResponse.json(
      { error: "Recipient email is invalid" },
      { status: 400 },
    );
  }
  if (senderEmail && !EMAIL_RE.test(senderEmail)) {
    return NextResponse.json(
      { error: "Reply-to email is invalid" },
      { status: 400 },
    );
  }
  if (!pdfBase64) {
    return NextResponse.json(
      { error: "PDF data is required" },
      { status: 400 },
    );
  }
  if (base64ByteSize(pdfBase64) > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "PDF too large" },
      { status: 413 },
    );
  }

  // Length caps on user-visible strings — keeps email subject + display
  // name reasonable and curtails giant-string DoS attempts.
  const fromName = (senderName || "InvoiceGen").slice(0, 80);
  const invNum = (invoiceNumber || "Invoice").slice(0, 60);

  // Pre-escape every user-interpolated value before it lands in HTML.
  // The text/plain body is fine without escaping but we still cap
  // length there.
  const fromNameHtml = escapeHtml(fromName);
  const invNumHtml = escapeHtml(invNum);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${fromName.replace(/["\\]/g, "")}" <${process.env.GMAIL_USER}>`,
      to,
      replyTo: senderEmail || undefined,
      subject: `Invoice ${invNum} from ${fromName}`,
      text: `Please find attached invoice ${invNum} from ${fromName}.\n\nThis invoice was generated using InvoiceGen (free invoice generator).`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Invoice ${invNumHtml}</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">from ${fromNameHtml}</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">
              Please find your invoice attached as a PDF. You can download and print it for your records.
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              This invoice was created with <a href="https://freeinvoicegen.org" style="color: #2563eb; text-decoration: none;">InvoiceGen</a> — a free professional invoice generator.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: sanitizeFilename(invNum, "pdf"),
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send invoice email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
