import jsPDF from "jspdf";
import type { SalarySlipData } from "@/components/SalarySlipForm";
import { numberToIndianWords } from "./numberToWords";

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

export function generateSalarySlipPDF(data: SalarySlipData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const mL = 18;
  const mR = 18;
  const contentW = pageWidth - mL - mR;
  // jsPDF's default font does not render the rupee glyph ₹; use "Rs." for INR.
  const moneyPrefix = data.currencySymbol === "₹" ? "Rs. " : `${data.currencySymbol} `;

  // Header band
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SALARY SLIP", mL, 12);
  doc.setFontSize(16);
  doc.text(data.companyName || "—", mL, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`For ${formatPeriod(data.payMonth)}`, pageWidth - mR, 12, { align: "right" });
  doc.setFontSize(9);
  if (data.companyEmail) {
    doc.text(data.companyEmail, pageWidth - mR, 22, { align: "right" });
  }

  // Reset
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");

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
  doc.roundedRect(mL, y, contentW, 32, 2, 2, "F");
  const halfW = contentW / 2;

  const drawField = (
    label: string,
    value: string,
    col: 0 | 1,
    row: 0 | 1 | 2 | 3,
  ) => {
    const x = mL + 4 + col * (halfW - 4);
    const yy = y + 6 + row * 6.5;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(label, x, yy);
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text(value || "—", x, yy + 4);
  };

  drawField("Employee Name", data.employeeName, 0, 0);
  drawField("Employee ID", data.employeeId, 1, 0);
  drawField("Designation", data.designation, 0, 1);
  drawField("Department", data.department, 1, 1);
  drawField("Date of Joining", isoToReadable(data.joiningDate), 0, 2);
  drawField("PAN", data.employeePan, 1, 2);
  drawField("Bank", data.bankName, 0, 3);
  drawField("Account #", data.bankAccount, 1, 3);

  y += 38;

  // Working days line
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  const lopDays = Math.max(0, data.workingDays - data.presentDays - data.paidLeave);
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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text("EARNINGS", mL + 4, y + 6);
  doc.text("AMOUNT", mL + colHalf - 6, y + 6, { align: "right" });
  doc.setTextColor(153, 27, 27); // red-800
  doc.text("DEDUCTIONS", colMid + 6, y + 6);
  doc.text("AMOUNT", pageWidth - mR - 4, y + 6, { align: "right" });

  y += 12;

  // Two-column rows: longer of earnings/deductions decides table height
  const rowH = 6.5;
  const maxRows = Math.max(data.earnings.length, data.deductions.length);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (let i = 0; i < maxRows; i++) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }
    const e = data.earnings[i];
    const d = data.deductions[i];
    doc.setTextColor(31, 41, 55);
    if (e) {
      doc.text(e.label || "—", mL + 4, y);
      doc.text(`${moneyPrefix}${fmt(e.amount || 0)}`, mL + colHalf - 6, y, { align: "right" });
    }
    if (d) {
      doc.text(d.label || "—", colMid + 6, y);
      doc.text(`${moneyPrefix}${fmt(d.amount || 0)}`, pageWidth - mR - 4, y, { align: "right" });
    }
    y += rowH;
    doc.setDrawColor(229, 231, 235);
    doc.line(mL, y - 2, colMid - 2, y - 2);
    doc.line(colMid + 2, y - 2, pageWidth - mR, y - 2);
  }

  // Totals row
  y += 2;
  const grossEarnings = data.earnings.reduce((s, l) => s + (l.amount || 0), 0);
  const totalDeductions = data.deductions.reduce((s, l) => s + (l.amount || 0), 0);
  const netPay = grossEarnings - totalDeductions;

  doc.setFillColor(243, 244, 246);
  doc.rect(mL, y, colHalf - 2, 9, "F");
  doc.rect(colMid + 2, y, colHalf - 2, 9, "F");
  doc.setFont("helvetica", "bold");
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
  doc.setFont("helvetica", "bold");
  doc.text("NET PAY", mL + 5, y + 7);
  doc.setFontSize(16);
  doc.text(`${moneyPrefix}${fmt(netPay)}`, pageWidth - mR - 5, y + 11, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(formatPeriod(data.payMonth), mL + 5, y + 12);

  y += 22;

  // Net pay in words (only sensible for INR)
  if (data.currencySymbol === "₹" && netPay > 0) {
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`(In words: ${numberToIndianWords(Math.round(netPay))} Rupees Only)`, mL, y);
    y += 8;
  }

  // Notes
  if (data.notes && data.notes.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    const lines = doc.splitTextToSize(data.notes, contentW);
    doc.text(lines, mL, y);
    y += 4 * lines.length + 4;
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
