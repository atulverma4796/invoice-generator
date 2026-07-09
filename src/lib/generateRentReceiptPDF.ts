import jsPDF from "jspdf";
import { numberToIndianWords } from "./numberToWords";
import type { RentReceiptData } from "@/components/RentReceiptForm";
import { applyUnicodeFont, PDF_FONT_FAMILY } from "./pdfFont";

interface ReceiptInput {
  data: RentReceiptData;
  groups: string[][]; // receipt groups; each is an ordered list of "YYYY-MM" months
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function monthShort(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function lastDayOfMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return "";
  const last = new Date(y, m, 0);
  return last.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function inrFmt(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

/**
 * Renders one rent receipt per group into a single multi-page PDF (A4).
 * A group may be a single month (monthly split) or several months bundled
 * (quarterly / half-yearly / whole-year). Each receipt fills one page so it
 * can be printed and signed individually.
 */
export async function generateRentReceiptPDF(
  { data, groups }: ReceiptInput,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ff = (await applyUnicodeFont(doc)) ? PDF_FONT_FAMILY : "helvetica";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const mL = 18;
  const mR = 18;
  const contentWidth = pageWidth - mL - mR;

  groups.forEach((group, idx) => {
    if (idx > 0) doc.addPage();

    const nMonths = group.length;
    const firstYm = group[0];
    const lastYm = group[nMonths - 1];
    const receiptNumber = `R-${String(data.receiptStartNumber + idx).padStart(3, "0")}`;
    const periodFull = nMonths === 1 ? monthLabel(firstYm) : `${monthLabel(firstYm)} to ${monthLabel(lastYm)}`;
    const periodShort = nMonths === 1 ? monthShort(firstYm) : `${monthShort(firstYm)} – ${monthShort(lastYm)}`;
    const issueDate = lastDayOfMonth(lastYm); // dated to the last month covered
    const amount = data.monthlyRent * nMonths;
    const amountWords = numberToIndianWords(amount) + " Rupees Only";

    // Title bar
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(mL, 18, contentWidth, 14, "F");
    doc.setTextColor(255);
    doc.setFontSize(18);
    doc.setFont(ff, "bold");
    doc.text("RENT RECEIPT", mL + 4, 27);
    doc.setFontSize(10);
    doc.setFont(ff, "normal");
    doc.text(`No. ${receiptNumber}`, pageWidth - mR - 4, 27, { align: "right" });

    // Body
    doc.setTextColor(31, 41, 55); // gray-800
    let y = 46;
    doc.setFontSize(11);
    doc.setFont(ff, "normal");

    // Issue date + month covered
    doc.setFont(ff, "bold");
    doc.text("Date of Issue:", mL, y);
    doc.setFont(ff, "normal");
    doc.text(issueDate, mL + 36, y);

    doc.setFont(ff, "normal");
    doc.text(
      `${nMonths === 1 ? "For the month of" : "For the period"}: ${periodShort}`,
      pageWidth - mR,
      y,
      { align: "right" },
    );

    y += 12;

    // Amount card
    doc.setFillColor(243, 244, 246); // gray-100
    doc.roundedRect(mL, y, contentWidth, 20, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("AMOUNT RECEIVED", mL + 4, y + 7);
    doc.setFontSize(20);
    doc.setFont(ff, "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(`Rs. ${inrFmt(amount)}`, pageWidth - mR - 4, y + 13, { align: "right" });
    y += 28;

    // Body paragraph
    doc.setFont(ff, "normal");
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);

    const para1 = `Received with thanks from ${data.tenantName || "_________________"} the sum of`;
    const para2 = `Rs. ${inrFmt(amount)} (${amountWords})`;
    const para3 = `towards rent of the premises located at:`;

    doc.text(para1, mL, y, { maxWidth: contentWidth });
    y += 6;
    doc.setFont(ff, "bold");
    doc.text(para2, mL, y, { maxWidth: contentWidth });
    y += 6;
    doc.setFont(ff, "normal");
    doc.text(para3, mL, y, { maxWidth: contentWidth });
    y += 8;

    // Property address (multi-line)
    doc.setFont(ff, "italic");
    const addressLines = doc.splitTextToSize(data.propertyAddress || "_________________", contentWidth);
    doc.text(addressLines, mL, y);
    y += 6 * addressLines.length + 6;

    // For period
    doc.setFont(ff, "normal");
    doc.text(`For the rent period: ${periodFull}`, mL, y);
    y += nMonths > 1 ? 6 : 8;
    if (nMonths > 1) {
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`(${nMonths} months @ Rs. ${inrFmt(data.monthlyRent)} per month)`, mL, y);
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      y += 8;
    }

    // Payment mode
    doc.text(`Paid via: ${data.paymentMode}`, mL, y);
    y += 14;

    // Landlord block (right-aligned signature area)
    const landlordBoxY = y;
    doc.setDrawColor(229, 231, 235);
    doc.line(mL, landlordBoxY, pageWidth - mR, landlordBoxY);
    y = landlordBoxY + 6;

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("LANDLORD", mL, y);
    y += 6;
    doc.setFontSize(12);
    doc.setFont(ff, "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(data.landlordName || "_________________", mL, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont(ff, "normal");
    doc.setTextColor(75, 85, 99);
    if (data.landlordPan) {
      doc.text(`PAN: ${data.landlordPan}`, mL, y);
      y += 6;
    }

    // Signature line
    const sigY = pageHeight - 50;

    // Landlord's online signature (drawn/uploaded), placed just above the line.
    if (data.landlordSignature) {
      try {
        const sigW = 40;
        const sigH = 14;
        const sigX = pageWidth - mR - 70; // left-aligned over the line, clear of the revenue stamp box
        const fmt = /^data:image\/jpe?g/i.test(data.landlordSignature) ? "JPEG" : "PNG";
        doc.addImage(data.landlordSignature, fmt, sigX, sigY - sigH - 1, sigW, sigH);
      } catch {
        // A malformed signature image must never break the whole PDF.
      }
    }

    doc.setDrawColor(156, 163, 175);
    doc.line(pageWidth - mR - 70, sigY, pageWidth - mR, sigY);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Landlord Signature", pageWidth - mR - 35, sigY + 5, { align: "center" });

    // Revenue stamp box (only for cash > 5000)
    if (data.paymentMode === "Cash" && data.monthlyRent > 5000) {
      const stampX = pageWidth - mR - 30;
      const stampY = sigY - 25;
      doc.setDrawColor(220, 38, 38);
      doc.setFillColor(254, 242, 242);
      doc.rect(stampX, stampY, 22, 18, "FD");
      doc.setFontSize(7);
      doc.setTextColor(220, 38, 38);
      doc.setFont(ff, "bold");
      doc.text("AFFIX", stampX + 11, stampY + 6, { align: "center" });
      doc.text("REVENUE", stampX + 11, stampY + 10, { align: "center" });
      doc.text("STAMP", stampX + 11, stampY + 14, { align: "center" });
      doc.setFont(ff, "normal");
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Generated by InvoiceGen — freeinvoicegen.org · This receipt is for record-keeping; landlord signature recommended for cash payments above Rs. 5,000.",
      pageWidth / 2,
      pageHeight - 12,
      { align: "center", maxWidth: contentWidth },
    );
  });

  return doc;
}
