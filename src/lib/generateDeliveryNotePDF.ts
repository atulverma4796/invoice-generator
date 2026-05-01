import jsPDF from "jspdf";
import type { DeliveryNoteData } from "@/components/DeliveryNoteForm";

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

export function generateDeliveryNotePDF(data: DeliveryNoteData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const mL = 18;
  const mR = 18;

  // Header band
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 38, "F");
  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY NOTE", mL, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`#${data.challanNumber}`, mL, 28);

  doc.setFontSize(10);
  doc.text("Issue Date", pageWidth - mR, 16, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(isoToReadable(data.challanDate), pageWidth - mR, 22, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("Delivery Date", pageWidth - mR, 30, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(isoToReadable(data.deliveryDate), pageWidth - mR, 36, { align: "right" });

  // Reset
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");

  let y = 50;

  // Reference
  if (data.referenceNumber.trim()) {
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("REFERENCE", mL, y);
    y += 5;
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(data.referenceNumber, mL, y);
    y += 7;
  }

  // Consignor / Consignee
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("FROM (CONSIGNOR)", mL, y);
  doc.text("TO (CONSIGNEE)", pageWidth / 2 + 4, y);
  y += 5;
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.text(data.consignorName || "—", mL, y);
  doc.text(data.consigneeName || "—", pageWidth / 2 + 4, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  const fromLines: string[] = [];
  if (data.consignorAddress) fromLines.push(...data.consignorAddress.split("\n"));
  if (data.consignorPhone) fromLines.push(`Phone: ${data.consignorPhone}`);
  if (data.consignorTaxId) fromLines.push(`Tax ID: ${data.consignorTaxId}`);

  const toLines: string[] = [];
  if (data.consigneeAddress) toLines.push(...data.consigneeAddress.split("\n"));
  if (data.consigneePhone) toLines.push(`Phone: ${data.consigneePhone}`);

  const maxLines = Math.max(fromLines.length, toLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (fromLines[i]) doc.text(fromLines[i], mL, y);
    if (toLines[i]) doc.text(toLines[i], pageWidth / 2 + 4, y);
    y += 5;
  }
  y += 3;

  // Transport box
  const transportY = y;
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(mL, transportY, pageWidth - mL - mR, 18, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("TRANSPORT", mL + 4, transportY + 5);

  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  // Three columns inside transport box
  const colW = (pageWidth - mL - mR - 8) / 3;
  const tcol1 = mL + 4;
  const tcol2 = mL + 4 + colW;
  const tcol3 = mL + 4 + colW * 2;

  doc.setFont("helvetica", "bold");
  doc.text(data.transportMode || "—", tcol1, transportY + 12);
  doc.text(data.vehicleNumber || "—", tcol2, transportY + 12);
  doc.text(data.driverName || "—", tcol3, transportY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Mode", tcol1, transportY + 16);
  doc.text("Vehicle", tcol2, transportY + 16);
  doc.text(data.driverPhone ? `Driver · ${data.driverPhone}` : "Driver", tcol3, transportY + 16);

  y = transportY + 24;

  // Items table
  const tableX = mL;
  const tableW = pageWidth - mL - mR;
  const colDesc = tableX + 2;
  const colQty = tableX + tableW - 60;
  const colUnit = tableX + tableW - 20;

  doc.setFillColor(243, 244, 246);
  doc.rect(tableX, y, tableW, 9, "F");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIPTION", colDesc, y + 6);
  doc.text("QTY", colQty, y + 6, { align: "right" });
  doc.text("UNIT", colUnit, y + 6, { align: "right" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  let totalItems = 0;
  let totalQuantity = 0;
  for (const it of data.items) {
    if (!it.description.trim() && it.quantity === 0) continue;
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 20;
    }
    totalItems++;
    totalQuantity += it.quantity || 0;
    const descLines = doc.splitTextToSize(it.description || "—", tableW - 80);
    doc.text(descLines, colDesc, y);
    doc.text(String(it.quantity || 0), colQty, y, { align: "right" });
    doc.text(it.unit || "", colUnit, y, { align: "right" });
    y += 5 * descLines.length + 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(tableX, y - 1, tableX + tableW, y - 1);
    y += 3;
  }

  // Total quantity row
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text(`Total: ${totalItems} item${totalItems === 1 ? "" : "s"}`, colDesc, y);
  doc.text(String(totalQuantity), colQty, y, { align: "right" });
  y += 8;

  // Notes
  if (data.notes && data.notes.trim()) {
    if (y > pageHeight - 70) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text("Notes", mL, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    const lines = doc.splitTextToSize(data.notes, pageWidth - mL - mR);
    doc.text(lines, mL, y);
    y += 5 * lines.length + 4;
  }

  // Signature blocks: dispatched by + received by
  const sigY = Math.max(y + 6, pageHeight - 50);
  const halfW = (pageWidth - mL - mR - 20) / 2;
  doc.setDrawColor(156, 163, 175);
  doc.line(mL, sigY, mL + halfW, sigY);
  doc.line(pageWidth - mR - halfW, sigY, pageWidth - mR, sigY);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("Dispatched by (Consignor)", mL + halfW / 2, sigY + 5, { align: "center" });
  doc.text("Received in good condition (Consignee)", pageWidth - mR - halfW / 2, sigY + 5, {
    align: "center",
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Generated with InvoiceGen — freeinvoicegen.org · This delivery note is not a tax invoice. An invoice will follow separately.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" },
  );

  return doc;
}
