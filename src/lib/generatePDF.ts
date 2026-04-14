import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceData } from "@/types/invoice";
import { getPdfCurrencySymbol } from "./defaultInvoice";
import { getPdfLabels } from "./languages";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
} from "./calculations";

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

const STATUS_PDF_COLORS: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
  draft: { bg: [243, 244, 246], text: [55, 65, 81] },
  pending: { bg: [254, 249, 195], text: [161, 98, 7] },
  paid: { bg: [220, 252, 231], text: [21, 128, 61] },
  overdue: { bg: [254, 226, 226], text: [185, 28, 28] },
};

const DEFAULT_STATUS_PDF = { bg: [237, 233, 254] as [number, number, number], text: [109, 40, 217] as [number, number, number] };

function fmt(amount: number, sym: string): string {
  return `${sym} ${amount.toFixed(2)}`;
}

export function generateInvoicePDF(data: InvoiceData, qrDataURL?: string): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const style = data.customStyle;
  const sym = getPdfCurrencySymbol(data.currency);
  const L = getPdfLabels(data.language);
  const taxLabel = data.taxLabel || "Tax";
  const primaryRgb = hexToRgb(style.primaryColor);
  const isLight = data.template === "minimal";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const mL = 15;
  const mR = 15;
  const contentW = pageWidth - mL - mR;

  // Header Background
  if (!isLight) {
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, pageWidth, 42, "F");
  } else {
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, pageWidth, 42, "F");
  }

  // Logo
  let headerLeftX = mL;
  if (data.logo) {
    try {
      doc.addImage(data.logo, "PNG", mL, 8, 20, 20);
      headerLeftX = mL + 23;
    } catch {
      // skip
    }
  }

  // Header Text
  const hColor: [number, number, number] = isLight ? primaryRgb : [255, 255, 255];
  doc.setTextColor(...hColor);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(L.invoice, headerLeftX, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${data.invoiceNumber}`, headerLeftX, 25);
  if (data.poNumber) {
    doc.setFontSize(8);
    doc.text(`PO: ${data.poNumber}`, headerLeftX, 30);
  }

  // Status Badge
  if (data.status && data.status !== "none") {
    const sc = STATUS_PDF_COLORS[data.status] || DEFAULT_STATUS_PDF;
    const label = data.status.toUpperCase();
    doc.setFontSize(7);
    const badgeW = doc.getTextWidth(label) + 8;
    doc.setFillColor(...sc.bg);
    doc.roundedRect(pageWidth - mR - badgeW, 6, badgeW, 7, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...sc.text);
    doc.text(label, pageWidth - mR - badgeW / 2, 11, { align: "center" });
  }

  // Sender info (top right)
  doc.setTextColor(...hColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.senderName || "Your Business Name", pageWidth - mR, 18, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let rY = 23;
  if (data.senderEmail) { doc.text(data.senderEmail, pageWidth - mR, rY, { align: "right" }); rY += 4; }
  if (data.senderPhone) { doc.text(data.senderPhone, pageWidth - mR, rY, { align: "right" }); rY += 4; }
  if (data.senderWebsite) { doc.text(data.senderWebsite, pageWidth - mR, rY, { align: "right" }); }

  doc.setTextColor(0, 0, 0);

  // From / Bill To / Dates
  let y = 52;
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.setFont("helvetica", "bold");
  doc.text(L.from.toUpperCase(), mL, y);
  doc.text(L.billTo.toUpperCase(), 80, y);
  doc.text(L.invoiceDate.toUpperCase(), pageWidth - mR, y, { align: "right" });

  y += 5;
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.senderName || "\u2014", mL, y);
  doc.text(data.clientName || "\u2014", 80, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const invoiceDateStr = data.invoiceDate
    ? new Date(data.invoiceDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "\u2014";
  doc.text(invoiceDateStr, pageWidth - mR, y, { align: "right" });

  y += 4;
  doc.setTextColor(107, 114, 128);
  const fromStartY = y;
  if (data.senderAddress) {
    data.senderAddress.split("\n").forEach((line) => { doc.text(line, mL, y); y += 3.5; });
  }
  if (data.senderTaxId) { doc.text(`${L.taxId}: ${data.senderTaxId}`, mL, y); y += 3.5; }

  let clientY = fromStartY;
  if (data.clientEmail) { doc.text(data.clientEmail, 80, clientY); clientY += 3.5; }
  if (data.clientAddress) {
    data.clientAddress.split("\n").forEach((line) => { doc.text(line, 80, clientY); clientY += 3.5; });
  }

  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.setFont("helvetica", "bold");
  doc.text(L.dueDate.toUpperCase(), pageWidth - mR, fromStartY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  const dueDateStr = data.dueDate
    ? new Date(data.dueDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "\u2014";
  doc.text(dueDateStr, pageWidth - mR, fromStartY + 4, { align: "right" });

  // ──────────── Items Table ────────────
  y = Math.max(y + 6, clientY + 6, 88);

  const tableRows = data.lineItems.map((item) => [
    item.description || "\u2014",
    String(item.quantity),
    fmt(item.rate, sym),
    fmt(item.amount, sym),
  ]);

  autoTable(doc, {
    startY: y,
    head: [[L.description, L.quantity, L.rate, L.amount]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [...primaryRgb] as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [55, 65, 81],
      lineWidth: 0.2,
      lineColor: [229, 231, 235],
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: contentW * 0.45, halign: "left" },
      1: { cellWidth: contentW * 0.10, halign: "center" },
      2: { cellWidth: contentW * 0.20, halign: "right" },
      3: { cellWidth: contentW * 0.25, halign: "right" },
    },
    margin: { left: mL, right: mR },
    showHead: "firstPage",
  });

  // ──────────── Totals ────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tY = (doc as any).lastAutoTable.finalY + 8;
  const subtotal = calculateSubtotal(data.lineItems);
  const tax = calculateTax(subtotal, data.taxRate);
  const discount = calculateDiscount(subtotal, data.discountRate);
  const total = calculateTotal(subtotal, tax, discount) + (data.shippingFee || 0);

  const totalsLabelX = pageWidth - 75;
  const totalsValueX = pageWidth - mR;

  function drawTotalRow(label: string, value: string, color?: [number, number, number]) {
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(label, totalsLabelX, tY);
    doc.setTextColor(...(color || [31, 41, 55]));
    doc.text(value, totalsValueX, tY, { align: "right" });
    tY += 6;
  }

  drawTotalRow(L.subtotal, fmt(subtotal, sym));
  if (data.taxRate > 0) drawTotalRow(`${taxLabel} (${data.taxRate}%)`, fmt(tax, sym));
  if (data.discountRate > 0) drawTotalRow(`${L.discount} (${data.discountRate}%)`, `-${fmt(discount, sym)}`, [220, 38, 38]);
  if (data.shippingFee > 0) drawTotalRow(L.shipping, fmt(data.shippingFee, sym));

  // Total line
  doc.setDrawColor(...primaryRgb);
  doc.setLineWidth(0.5);
  doc.line(totalsLabelX, tY - 2, totalsValueX, tY - 2);
  tY += 2;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryRgb);
  doc.text(L.total.toUpperCase(), totalsLabelX, tY);
  doc.text(fmt(total, sym), totalsValueX, tY, { align: "right" });
  doc.setFont("helvetica", "normal");

  // Late fee notice
  if (data.lateFeeRate > 0) {
    tY += 6;
    doc.setFontSize(7);
    doc.setTextColor(220, 38, 38);
    doc.text(`Late fee: ${data.lateFeeRate}% per month on overdue balance`, totalsValueX, tY, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  // ──────────── Payment Info ────────────
  const hasPayment = Object.values(data.paymentInfo).some((v) => v.trim() !== "");
  if (hasPayment) {
    tY += 8;
    // Payment section needs ~25-30mm; only break if less than 30mm remaining
    if (tY > pageHeight - 30) { doc.addPage(); tY = 20; }

    const entries = [
      data.paymentInfo.bankName && `Bank: ${data.paymentInfo.bankName}`,
      data.paymentInfo.accountName && `Account: ${data.paymentInfo.accountName}`,
      data.paymentInfo.accountNumber && `Account #: ${data.paymentInfo.accountNumber}`,
      data.paymentInfo.routingNumber && `Routing/IFSC: ${data.paymentInfo.routingNumber}`,
      data.paymentInfo.swiftCode && `SWIFT: ${data.paymentInfo.swiftCode}`,
      data.paymentInfo.paypalEmail && `PayPal: ${data.paymentInfo.paypalEmail}`,
      data.paymentInfo.customField && `Other: ${data.paymentInfo.customField}`,
    ].filter(Boolean) as string[];

    const boxH = Math.ceil(entries.length / 2) * 4 + 12;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(mL, tY - 4, contentW, boxH, 2, 2, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(156, 163, 175);
    doc.text(L.paymentInformation.toUpperCase(), mL + 5, tY);
    tY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(75, 85, 99);
    let pCol = 0;
    entries.forEach((entry, i) => {
      const x = pCol === 0 ? mL + 5 : mL + contentW / 2 + 5;
      doc.text(entry, x, tY);
      if (pCol === 1 || i === entries.length - 1) { tY += 4; pCol = 0; } else { pCol = 1; }
    });
    tY += 4;
  }

  // ──────────── Terms & Conditions (above notes, standard format) ────────────
  const hasTerms = data.terms?.trim();
  const hasNotes = data.notes?.trim();

  if (hasTerms || hasNotes) {
    tY += 6;
    // Terms/Notes section needs ~20-30mm; only break if less than 25mm remaining
    if (tY > pageHeight - 25) { doc.addPage(); tY = 20; }

    // Separator
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(mL, tY, pageWidth - mR, tY);
    tY += 6;

    // Terms first (standard invoice practice)
    if (hasTerms) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(L.termsAndConditions, mL, tY);
      tY += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      const termLines = doc.splitTextToSize(data.terms, contentW);
      doc.text(termLines, mL, tY);
      tY += termLines.length * 3.5 + 4;
    }

    // Notes at the bottom
    if (hasNotes) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(L.notes, mL, tY);
      tY += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      const noteLines = doc.splitTextToSize(data.notes, contentW);
      doc.text(noteLines, mL, tY);
      tY += noteLines.length * 3.5;
    }
  }

  // ──────────── QR Code + Signature (side-by-side row) ────────────
  // Place QR on left, signature on right to save vertical space and keep everything on 1 page
  const hasQR = !!qrDataURL;
  const hasSig = !!data.signature;

  if (hasQR || hasSig) {
    // Combined row height: ~30mm (QR is 28mm, signature block is 23mm)
    const rowHeight = 30;
    tY += 6;
    const remainingSpace = pageHeight - tY;
    if (remainingSpace < rowHeight) {
      doc.addPage();
      tY = 20;
    }

    const rowStartY = tY;

    // QR Code (left side)
    if (hasQR && qrDataURL) {
      try {
        doc.addImage(qrDataURL, "PNG", mL, rowStartY, 28, 28);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(55, 65, 81);
        doc.text("Scan to Pay", mL + 32, rowStartY + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(107, 114, 128);
        // Constrain QR text width so it doesn't overlap with signature area on the right
        const qrText = doc.splitTextToSize(data.qrCodeData, (pageWidth - 70) - (mL + 32));
        doc.text(qrText, mL + 32, rowStartY + 15);
      } catch {
        // skip
      }
    }

    // Signature (right side, same row as QR)
    if (hasSig && data.signature) {
      try {
        doc.addImage(data.signature, "PNG", pageWidth - 60, rowStartY, 40, 15);
        const sigLineY = rowStartY + 16;
        doc.setDrawColor(156, 163, 175);
        doc.setLineWidth(0.3);
        doc.line(pageWidth - 60, sigLineY, pageWidth - mR, sigLineY);
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text(L.authorizedSignature, pageWidth - 37.5, sigLineY + 4, { align: "center" });
      } catch {
        // skip
      }
    }

    tY = rowStartY + rowHeight;
  }

  // ──────────── Watermark (drawn last so it overlays everything) ────────────
  if (data.watermark) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();
      doc.setFontSize(70);
      doc.setTextColor(150, 150, 150);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
      doc.setFont("helvetica", "bold");
      doc.text(data.watermark, pageWidth / 2, pageHeight / 2, { align: "center", angle: 30 });
      doc.restoreGraphicsState();
    }
  }

  return doc;
}
