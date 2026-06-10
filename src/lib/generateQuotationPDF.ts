import jsPDF from "jspdf";
import type { QuotationData } from "@/components/QuotationForm";
import { getCurrencySymbol } from "@/components/QuotationForm";
import { applyUnicodeFont, PDF_FONT_FAMILY } from "./pdfFont";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function isoToReadable(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export async function generateQuotationPDF(
  data: QuotationData,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ff = (await applyUnicodeFont(doc)) ? PDF_FONT_FAMILY : "helvetica";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const mL = 18;
  const mR = 18;
  const symbol = getCurrencySymbol(data.currency);
  // jsPDF's default font doesn't render the rupee glyph; substitute "Rs."
  const moneyPrefix = data.currency === "INR" ? "Rs. " : symbol;

  // Header band
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 38, "F");
  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.setFont(ff, "bold");
  doc.text("QUOTATION", mL, 20);
  doc.setFontSize(11);
  doc.setFont(ff, "normal");
  doc.text(`#${data.quoteNumber}`, mL, 28);

  doc.setFontSize(10);
  doc.text("Date", pageWidth - mR, 16, { align: "right" });
  doc.setFont(ff, "bold");
  doc.text(isoToReadable(data.quoteDate), pageWidth - mR, 22, { align: "right" });
  doc.setFont(ff, "normal");
  doc.text("Valid Until", pageWidth - mR, 30, { align: "right" });
  doc.setFont(ff, "bold");
  doc.text(isoToReadable(data.validUntil), pageWidth - mR, 36, { align: "right" });

  // Reset text color
  doc.setTextColor(31, 41, 55);
  doc.setFont(ff, "normal");

  // From / To blocks
  let y = 50;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("FROM", mL, y);
  doc.text("TO", pageWidth / 2 + 4, y);
  y += 5;
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.setFont(ff, "bold");
  doc.text(data.senderName || "—", mL, y);
  doc.text(data.clientName || "—", pageWidth / 2 + 4, y);
  y += 5;
  doc.setFont(ff, "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  const fromLines: string[] = [];
  if (data.senderEmail) fromLines.push(data.senderEmail);
  if (data.senderPhone) fromLines.push(data.senderPhone);
  if (data.senderAddress) fromLines.push(...data.senderAddress.split("\n"));
  if (data.senderTaxId) fromLines.push(`Tax ID: ${data.senderTaxId}`);

  const toLines: string[] = [];
  if (data.clientEmail) toLines.push(data.clientEmail);
  if (data.clientAddress) toLines.push(...data.clientAddress.split("\n"));

  const maxLines = Math.max(fromLines.length, toLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (fromLines[i]) doc.text(fromLines[i], mL, y);
    if (toLines[i]) doc.text(toLines[i], pageWidth / 2 + 4, y);
    y += 5;
  }
  y += 5;

  // Items table
  const tableX = mL;
  const tableW = pageWidth - mL - mR;
  const colDesc = tableX + 2;
  const colQty = tableX + tableW - 70;
  const colRate = tableX + tableW - 40;
  const colAmount = tableX + tableW - 2;

  // Table header
  doc.setFillColor(243, 244, 246);
  doc.rect(tableX, y, tableW, 9, "F");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.setFont(ff, "bold");
  doc.text("DESCRIPTION", colDesc, y + 6);
  doc.text("QTY", colQty, y + 6, { align: "right" });
  doc.text("RATE", colRate, y + 6, { align: "right" });
  doc.text("AMOUNT", colAmount, y + 6, { align: "right" });
  y += 12;

  // Rows
  doc.setFont(ff, "normal");
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  let subtotal = 0;
  for (const it of data.lineItems) {
    if (!it.description.trim() && it.rate === 0 && it.quantity === 0) continue;
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }
    const amount = it.quantity * it.rate;
    subtotal += amount;
    const descLines = doc.splitTextToSize(it.description || "—", tableW - 80);
    doc.text(descLines, colDesc, y);
    doc.text(String(it.quantity || 0), colQty, y, { align: "right" });
    doc.text(`${moneyPrefix}${fmt(it.rate || 0)}`, colRate, y, { align: "right" });
    doc.text(`${moneyPrefix}${fmt(amount)}`, colAmount, y, { align: "right" });
    y += 5 * descLines.length + 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(tableX, y - 1, tableX + tableW, y - 1);
    y += 3;
  }

  // Totals
  const discount = (subtotal * (data.discountRate || 0)) / 100;
  const taxableBase = subtotal - discount;
  const tax = (taxableBase * (data.taxRate || 0)) / 100;
  const total = taxableBase + tax;

  if (y > pageHeight - 80) {
    doc.addPage();
    y = 20;
  }
  y += 4;

  const totalsRightX = colAmount;
  const totalsLeftX = colAmount - 60;

  const drawTotalsRow = (label: string, value: string, bold = false, color: [number, number, number] = [75, 85, 99]) => {
    doc.setFontSize(10);
    doc.setFont(ff, bold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(label, totalsLeftX, y);
    doc.text(value, totalsRightX, y, { align: "right" });
    y += 6;
  };

  drawTotalsRow("Subtotal", `${moneyPrefix}${fmt(subtotal)}`);
  if (discount > 0) {
    drawTotalsRow(`Discount (${data.discountRate}%)`, `-${moneyPrefix}${fmt(discount)}`, false, [220, 38, 38]);
  }
  if (tax > 0) {
    drawTotalsRow(`${data.taxLabel} (${data.taxRate}%)`, `${moneyPrefix}${fmt(tax)}`);
  }
  // Total
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.4);
  doc.line(totalsLeftX, y - 1, totalsRightX, y - 1);
  doc.setLineWidth(0.2);
  y += 3;
  doc.setFont(ff, "bold");
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text("Estimated Total", totalsLeftX, y);
  doc.text(`${moneyPrefix}${fmt(total)}`, totalsRightX, y, { align: "right" });
  y += 12;

  // Notes + Terms
  doc.setTextColor(31, 41, 55);
  doc.setFont(ff, "normal");
  doc.setFontSize(9);
  if (data.notes && data.notes.trim()) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }
    doc.setFont(ff, "bold");
    doc.text("Notes", mL, y);
    y += 5;
    doc.setFont(ff, "normal");
    doc.setTextColor(75, 85, 99);
    const lines = doc.splitTextToSize(data.notes, pageWidth - mL - mR);
    doc.text(lines, mL, y);
    y += 5 * lines.length + 4;
  }

  if (data.terms && data.terms.trim()) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(31, 41, 55);
    doc.setFont(ff, "bold");
    doc.text("Terms & Conditions", mL, y);
    y += 5;
    doc.setFont(ff, "normal");
    doc.setTextColor(75, 85, 99);
    const lines = doc.splitTextToSize(data.terms, pageWidth - mL - mR);
    doc.text(lines, mL, y);
    y += 5 * lines.length + 4;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Generated with InvoiceGen — freeinvoicegen.org · This quotation is valid until the date indicated above.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" },
  );

  return doc;
}
