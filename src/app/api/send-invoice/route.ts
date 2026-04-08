import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { to, senderName, senderEmail, invoiceNumber, pdfBase64 } = await req.json();

    if (!to?.trim()) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }
    if (!pdfBase64) {
      return NextResponse.json({ error: "PDF data is required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const fromName = senderName || "InvoiceGen";
    const invNum = invoiceNumber || "Invoice";

    await transporter.sendMail({
      from: `"${fromName}" <${process.env.GMAIL_USER}>`,
      to,
      replyTo: senderEmail || undefined,
      subject: `Invoice ${invNum} from ${fromName}`,
      text: `Please find attached invoice ${invNum} from ${fromName}.\n\nThis invoice was generated using InvoiceGen (free invoice generator).`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Invoice ${invNum}</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">from ${fromName}</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">
              Please find your invoice attached as a PDF. You can download and print it for your records.
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              This invoice was created with <a href="#" style="color: #2563eb; text-decoration: none;">InvoiceGen</a> — a free professional invoice generator.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${invNum}.pdf`,
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send invoice email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
