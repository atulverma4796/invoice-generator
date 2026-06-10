// POST /api/feedback — relays user feedback to the project Gmail inbox.
//
// Same hardening posture as /api/send-invoice: origin allowlist, per-IP
// rate limit, payload size cap, HTML escaping of every interpolated
// field. Type field is constrained to an enum to keep the subject
// line from being weaponised.

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  checkRateLimit,
  escapeHtml,
  isAllowedOrigin,
} from "@/lib/api-security";

const MAX_REQUEST_BYTES = 64 * 1024; // 64 KB is plenty for feedback text
const ALLOWED_TYPES = new Set([
  "Feedback",
  "Bug",
  "Feature",
  "Question",
  "Other",
]);

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Tighter limit than send-invoice — feedback should not arrive in
  // bursts from a single IP.
  const rl = checkRateLimit(req, "feedback", {
    capacity: 3,
    refillPerMinute: 1,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      },
    );
  }

  const cl = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (cl > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 },
    );
  }

  let body: { name?: unknown; type?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  const rawType = typeof body.type === "string" ? body.type.trim() : "";
  const rawMessage =
    typeof body.message === "string" ? body.message.trim() : "";

  if (!rawMessage) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 },
    );
  }

  // Cap visible-string lengths so a 100 KB "name" can't bloat the
  // outgoing email or the subject header.
  const name = (rawName || "Anonymous").slice(0, 80);
  const type = ALLOWED_TYPES.has(rawType) ? rawType : "Feedback";
  const message = rawMessage.slice(0, 5000);

  const nameHtml = escapeHtml(name);
  const typeHtml = escapeHtml(type);
  const messageHtml = escapeHtml(message);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"InvoiceGen Feedback" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `[InvoiceGen ${type}] from ${name}`,
      text: `Type: ${type}\nName: ${name}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #7c3aed;">InvoiceGen Feedback</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Type</td><td style="padding: 8px;">${typeHtml}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Name</td><td style="padding: 8px;">${nameHtml}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="color: #374151; white-space: pre-wrap;">${messageHtml}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
