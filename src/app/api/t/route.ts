import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceNumber, clientName, total, currency, device } = body;

    // Get IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    // Fetch location from IP (free API, no key needed)
    let location = "Unknown";
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,isp`);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.city) {
          location = `${geo.city}, ${geo.regionName}, ${geo.country} (ISP: ${geo.isp})`;
        }
      }
    } catch {
      // location stays "Unknown"
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    await transporter.sendMail({
      from: `"InvoiceGen Analytics" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `[Download] Invoice #${invoiceNumber} — ${clientName || "Unknown Client"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 16px;">Invoice Downloaded</h2>
          <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151; width: 140px;">Invoice #</td>
              <td style="padding: 10px; color: #6b7280;">${invoiceNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Client</td>
              <td style="padding: 10px; color: #6b7280;">${clientName || "Not specified"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Total</td>
              <td style="padding: 10px; color: #6b7280;">${currency} ${total}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Downloaded At</td>
              <td style="padding: 10px; color: #6b7280;">${now} IST</td>
            </tr>
          </table>

          <h3 style="color: #374151; margin-top: 20px; margin-bottom: 10px;">Device & Location</h3>
          <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151; width: 140px;">IP Address</td>
              <td style="padding: 10px; color: #6b7280;">${ip}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Location</td>
              <td style="padding: 10px; color: #6b7280;">${location}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Browser</td>
              <td style="padding: 10px; color: #6b7280;">${device.browser}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">OS</td>
              <td style="padding: 10px; color: #6b7280;">${device.os}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Platform</td>
              <td style="padding: 10px; color: #6b7280;">${device.platform}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Screen</td>
              <td style="padding: 10px; color: #6b7280;">${device.screen}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Language</td>
              <td style="padding: 10px; color: #6b7280;">${device.language}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">User Agent</td>
              <td style="padding: 10px; color: #6b7280; font-size: 11px; word-break: break-all;">${device.userAgent}</td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track download error:", error);
    // Don't block the download if tracking fails
    return NextResponse.json({ success: false });
  }
}
