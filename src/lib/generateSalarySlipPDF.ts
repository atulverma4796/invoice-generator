import jsPDF from "jspdf";
import type { SalarySlipData, PayLine } from "@/components/SalarySlipForm";
import { computeSalaryTotals } from "@/components/SalarySlipForm";
import { drawWrappedText, wrap } from "./pdfHelpers";
import { numberToIndianWords } from "./numberToWords";
import { applyUnicodeFont, PDF_FONT_FAMILY } from "./pdfFont";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function isoToReadable(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatPeriod(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export async function generateSalarySlipPDF(
  data: SalarySlipData,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ff = (await applyUnicodeFont(doc)) ? PDF_FONT_FAMILY : "helvetica";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const mL = 18;
  const mR = 18;
  const contentW = pageWidth - mL - mR;
  // jsPDF's default font does not render the rupee glyph ₹; use "Rs." for INR.
  const moneyPrefix = data.currencySymbol === "₹" ? "Rs. " : `${data.currencySymbol} `;
  const totals = computeSalaryTotals(data);

  // Shrink a single-line value until it fits `maxW` (min 6.5pt), so long
  // names never spill into the neighbouring column of a fixed-size box.
  const fitFontSize = (text: string, maxW: number, start: number) => {
    let fs = start;
    doc.setFontSize(fs);
    while (fs > 6.5 && doc.getTextWidth(text) > maxW) {
      fs -= 0.5;
      doc.setFontSize(fs);
    }
    return fs;
  };

  // Header band
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.setFont(ff, "bold");
  doc.text("SALARY SLIP", mL, 12);
  doc.setFont(ff, "normal");
  doc.setFontSize(9);
  const emailW = data.companyEmail ? doc.getTextWidth(data.companyEmail) : 0;
  doc.setFont(ff, "bold");
  const companyMaxW = contentW - Math.min(emailW, contentW / 2) - 6;
  const companyName = data.companyName || "—";
  fitFontSize(companyName, companyMaxW, 16);
  doc.text(wrap(doc, companyName, companyMaxW)[0] ?? "", mL, 22);
  doc.setFont(ff, "normal");
  doc.setFontSize(10);
  doc.text(`For ${formatPeriod(data.payMonth)}`, pageWidth - mR, 12, { align: "right" });
  doc.setFontSize(9);
  if (data.companyEmail) {
    doc.text(wrap(doc, data.companyEmail, contentW / 2)[0] ?? "", pageWidth - mR, 22, { align: "right" });
  }

  // Reset
  doc.setTextColor(31, 41, 55);
  doc.setFont(ff, "normal");

  let y = 36;

  // Company address
  if (data.companyAddress) {
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    const addrLines = doc.splitTextToSize(data.companyAddress, contentW);
    doc.text(addrLines, mL, y);
    y += 5 * addrLines.length + 4;
  } else {
    y += 2;
  }

  // Employee details box
  doc.setFillColor(243, 244, 246);
  // 4 rows × 9mm pitch: label + value + breathing room (6.5 made labels
  // touch the value above).
  doc.roundedRect(mL, y, contentW, 41, 2, 2, "F");
  const halfW = contentW / 2;

  const drawField = (
    label: string,
    value: string,
    col: 0 | 1,
    row: 0 | 1 | 2 | 3,
  ) => {
    const x = mL + 4 + col * (halfW - 4);
    const yy = y + 6 + row * 9;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont(ff, "normal");
    doc.text(label, x, yy);
    doc.setTextColor(31, 41, 55);
    doc.setFont(ff, "bold");
    const v = value || "—";
    const maxW = halfW - 10;
    fitFontSize(v, maxW, 10);
    doc.text(wrap(doc, v, maxW)[0] ?? "", x, yy + 4);
  };

  drawField("Employee Name", data.employeeName, 0, 0);
  drawField("Employee ID", data.employeeId, 1, 0);
  drawField("Designation", data.designation, 0, 1);
  drawField("Department", data.department, 1, 1);
  drawField("Date of Joining", isoToReadable(data.joiningDate), 0, 2);
  drawField("PAN", data.employeePan, 1, 2);
  drawField("Bank", data.bankName, 0, 3);
  drawField("Account #", data.bankAccount, 1, 3);

  y += 47;

  // Working days line
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  const lopDays = totals.lopDays;
  const wdLine = `Working Days: ${data.workingDays}    Present: ${data.presentDays}    Paid Leave: ${data.paidLeave}    LOP: ${lopDays}`;
  doc.text(wdLine, mL, y);
  y += 8;

  // Earnings + Deductions table headers
  const colMid = pageWidth / 2;
  const colHalf = colMid - mL;

  doc.setFillColor(220, 252, 231); // emerald-100
  doc.rect(mL, y, colHalf - 2, 9, "F");
  doc.setFillColor(254, 226, 226); // red-100
  doc.rect(colMid + 2, y, colHalf - 2, 9, "F");

  doc.setFont(ff, "bold");
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text("EARNINGS", mL + 4, y + 6);
  doc.text("AMOUNT", mL + colHalf - 6, y + 6, { align: "right" });
  doc.setTextColor(153, 27, 27); // red-800
  doc.text("DEDUCTIONS", colMid + 6, y + 6);
  doc.text("AMOUNT", pageWidth - mR - 4, y + 6, { align: "right" });

  y += 12;

  // Unpaid days are deducted pro-rata as their own visible line.
  const deductions: PayLine[] = [...data.deductions];
  if (totals.lopDeduction > 0) {
    deductions.push({
      id: "__lop__",
      label: `Loss of Pay (${totals.lopDays} day${totals.lopDays === 1 ? "" : "s"})`,
      amount: totals.lopDeduction,
    });
  }

  // Two-column rows: longer of earnings/deductions decides table height.
  // Labels wrap inside their half so they never run under the amount.
  const rowH = 6.5;
  const labelW = colHalf - 40;
  const maxRows = Math.max(data.earnings.length, deductions.length);
  doc.setFont(ff, "normal");
  doc.setFontSize(9);
  for (let i = 0; i < maxRows; i++) {
    const e = data.earnings[i];
    const d = deductions[i];
    const eLines = e ? wrap(doc, e.label || "—", labelW) : [];
    const dLines = d ? wrap(doc, d.label || "—", labelW) : [];
    const extra = 4 * (Math.max(eLines.length, dLines.length, 1) - 1);
    if (y + extra > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(31, 41, 55);
    if (e) {
      doc.text(eLines, mL + 4, y);
      doc.text(`${moneyPrefix}${fmt(e.amount || 0)}`, mL + colHalf - 6, y, { align: "right" });
    }
    if (d) {
      doc.text(dLines, colMid + 6, y);
      doc.text(`${moneyPrefix}${fmt(d.amount || 0)}`, pageWidth - mR - 4, y, { align: "right" });
    }
    y += rowH + extra;
    doc.setDrawColor(229, 231, 235);
    doc.line(mL, y - 2, colMid - 2, y - 2);
    doc.line(colMid + 2, y - 2, pageWidth - mR, y - 2);
  }

  // Totals row + net pay band + words need ~60mm; keep them together.
  y += 2;
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 20;
  }
  const { grossEarnings, totalDeductions, netPay } = totals;

  doc.setFillColor(243, 244, 246);
  doc.rect(mL, y, colHalf - 2, 9, "F");
  doc.rect(colMid + 2, y, colHalf - 2, 9, "F");
  doc.setFont(ff, "bold");
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70);
  doc.text("Gross Earnings", mL + 4, y + 6);
  doc.text(`${moneyPrefix}${fmt(grossEarnings)}`, mL + colHalf - 6, y + 6, { align: "right" });
  doc.setTextColor(153, 27, 27);
  doc.text("Total Deductions", colMid + 6, y + 6);
  doc.text(`${moneyPrefix}${fmt(totalDeductions)}`, pageWidth - mR - 4, y + 6, { align: "right" });

  y += 14;

  // Net pay band
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(mL, y, contentW, 16, 2, 2, "F");
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.setFont(ff, "bold");
  doc.text("NET PAY", mL + 5, y + 7);
  doc.setFontSize(16);
  doc.text(`${moneyPrefix}${fmt(netPay)}`, pageWidth - mR - 5, y + 11, { align: "right" });
  doc.setFontSize(8);
  doc.setFont(ff, "normal");
  doc.text(formatPeriod(data.payMonth), mL + 5, y + 12);

  y += 22;

  // Net pay in words (only sensible for INR)
  if (data.currencySymbol === "₹" && netPay > 0) {
    doc.setTextColor(31, 41, 55);
    doc.setFont(ff, "italic");
    doc.setFontSize(9);
    y = drawWrappedText(doc, `(In words: ${numberToIndianWords(Math.round(netPay))} Rupees Only)`, mL, y, {
      maxWidth: contentW,
      lineHeight: 4.5,
      bottomMargin: 18,
    }) + 3.5;
  }

  // Notes
  if (data.notes && data.notes.trim()) {
    doc.setFont(ff, "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    y = drawWrappedText(doc, data.notes, mL, y, { maxWidth: contentW, lineHeight: 4, bottomMargin: 18 }) + 4;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Generated with InvoiceGen — freeinvoicegen.org · Confidential payroll document.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" },
  );

  return doc;
}
