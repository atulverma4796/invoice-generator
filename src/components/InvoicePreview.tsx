"use client";

import { useState, useEffect } from "react";
import { InvoiceData } from "@/types/invoice";
import { getCurrencySymbol } from "@/lib/defaultInvoice";
import { getLabels } from "@/lib/languages";
import { getStatusColors } from "./StatusBadge";
import { generateQRDataURL } from "./QRCodeSection";
import { TEMPLATES } from "@/lib/templates";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
} from "@/lib/calculations";

interface InvoicePreviewProps {
  data: InvoiceData;
}

export default function InvoicePreview({ data }: InvoicePreviewProps) {
  const [qrImage, setQrImage] = useState("");
  const style = data.customStyle;
  const symbol = getCurrencySymbol(data.currency);
  const L = getLabels(data.language);

  useEffect(() => {
    if (data.qrCodeData?.trim()) {
      generateQRDataURL(data.qrCodeData).then(setQrImage);
    } else {
      setQrImage("");
    }
  }, [data.qrCodeData]);
  const subtotal = calculateSubtotal(data.lineItems);
  const tax = calculateTax(subtotal, data.taxRate);
  const discount = calculateDiscount(subtotal, data.discountRate);
  const total = calculateTotal(subtotal, tax, discount) + (data.shippingFee || 0);
  const isLight = data.template === "minimal" || data.template === "pastel" || data.template === "monochrome";
  const isDark = data.template === "executive";
  const templateConfig = TEMPLATES[data.template];
  const headerBg = isLight ? (data.template === "pastel" ? "#f5f0e8" : data.template === "monochrome" ? "#ffffff" : "#f9fafb") : (templateConfig?.headerBg || style.primaryColor);
  const taxLabel = data.taxLabel || "Tax";
  const bodyBg = data.template === "pastel" ? "#faf8f4" : isDark ? "#1c1c1e" : "white";
  const bodyText = isDark ? "#e5e5e5" : "#1f2937";
  const mutedText = isDark ? "#9ca3af" : "#6b7280";
  const labelText = isDark ? "#6b7280" : "#9ca3af";

  const hasPayment = Object.values(data.paymentInfo).some((v) => v.trim() !== "");
  const statusCfg = getStatusColors(data.status);
  const notesText = data.notes || "Thank you for your business!";

  return (
    <div
      id="invoice-preview"
      className="shadow-lg rounded-lg overflow-hidden relative"
      style={{
        fontFamily: style.fontStyle === "serif" ? "Georgia, serif" : "system-ui, sans-serif",
        width: "100%",
        minHeight: "842px",
        backgroundColor: bodyBg,
        color: bodyText,
      }}
    >
      {/* Watermark — z-30 so it shows above table */}
      {data.watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 30 }}>
          <p
            className="text-[80px] font-extrabold uppercase tracking-widest select-none"
            style={{
              color: style.primaryColor,
              opacity: 0.07,
              transform: "rotate(-30deg)",
            }}
          >
            {data.watermark}
          </p>
        </div>
      )}

      {/* Header */}
      <div
        className="px-8 py-6"
        style={{
          backgroundColor: headerBg,
          color: isLight ? (data.template === "monochrome" ? "#000000" : style.primaryColor) : (isDark ? "#d4a843" : "#ffffff"),
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {data.logo && (
              <img
                src={data.logo}
                alt="Logo"
                className="h-12 max-w-[100px] object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{L.invoice}</h1>
              <p className="text-sm mt-0.5 opacity-80">#{data.invoiceNumber}</p>
              {data.poNumber && (
                <p className="text-xs mt-0.5 opacity-60">PO: {data.poNumber}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {data.status !== "none" && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
              >
                {data.status}
              </span>
            )}
            <p className="font-semibold text-lg">
              {data.senderName || "Your Business Name"}
            </p>
            {data.senderEmail && (
              <p className="text-sm opacity-80">{data.senderEmail}</p>
            )}
            {data.senderPhone && (
              <p className="text-sm opacity-80">{data.senderPhone}</p>
            )}
            {data.senderWebsite && (
              <p className="text-sm opacity-60">{data.senderWebsite}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 relative" style={{ zIndex: 20 }}>
        {/* Dates & Addresses */}
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: labelText }}>{L.from}</p>
            <p className="font-medium" style={{ color: bodyText }}>{data.senderName || "\u2014"}</p>
            {data.senderAddress && (
              <p className="text-gray-600 whitespace-pre-line">{data.senderAddress}</p>
            )}
            {data.senderTaxId && (
              <p className="text-gray-500 text-xs mt-1">{L.taxId}: {data.senderTaxId}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: labelText }}>{L.billTo}</p>
            <p className="font-medium" style={{ color: bodyText }}>{data.clientName || "\u2014"}</p>
            {data.clientEmail && <p className="text-gray-600">{data.clientEmail}</p>}
            {data.clientAddress && (
              <p className="text-gray-600 whitespace-pre-line">{data.clientAddress}</p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase text-gray-400">{L.invoiceDate}</p>
              <p className="text-gray-800">
                {data.invoiceDate
                  ? new Date(data.invoiceDate + "T00:00:00").toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })
                  : "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">{L.dueDate}</p>
              <p className="text-gray-800">
                {data.dueDate
                  ? new Date(data.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })
                  : "\u2014"}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <div
            className="grid grid-cols-12 gap-2 px-4 py-2 rounded-t text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: style.primaryColor + "10", color: style.primaryColor }}
          >
            <div className="col-span-5">{L.description}</div>
            <div className="col-span-2 text-center">{L.quantity}</div>
            <div className="col-span-2 text-right">{L.rate}</div>
            <div className="col-span-3 text-right">{L.amount}</div>
          </div>
          {data.lineItems.map((item, i) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm"
              style={{ backgroundColor: i % 2 === 0 ? (isDark ? "#2a2a2e" : data.template === "pastel" ? "#f0ebe0" : "#f9fafb") : "transparent" }}
            >
              <div className="col-span-5" style={{ color: bodyText }}>{item.description || "\u2014"}</div>
              <div className="col-span-2 text-center" style={{ color: mutedText }}>{item.quantity}</div>
              <div className="col-span-2 text-right" style={{ color: mutedText }}>
                {symbol}{item.rate.toFixed(2)}
              </div>
              <div className="col-span-3 text-right font-medium" style={{ color: bodyText }}>
                {symbol}{item.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: mutedText }}>{L.subtotal}</span>
              <span style={{ color: bodyText }}>{symbol}{subtotal.toFixed(2)}</span>
            </div>
            {data.taxRate > 0 && (
              <div className="flex justify-between">
                <span style={{ color: mutedText }}>{taxLabel} ({data.taxRate}%)</span>
                <span style={{ color: bodyText }}>{symbol}{tax.toFixed(2)}</span>
              </div>
            )}
            {data.discountRate > 0 && (
              <div className="flex justify-between">
                <span style={{ color: mutedText }}>{L.discount} ({data.discountRate}%)</span>
                <span className="text-red-600">-{symbol}{discount.toFixed(2)}</span>
              </div>
            )}
            {data.shippingFee > 0 && (
              <div className="flex justify-between">
                <span style={{ color: mutedText }}>{L.shipping}</span>
                <span style={{ color: bodyText }}>{symbol}{data.shippingFee.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between pt-2 border-t-2 text-base font-bold"
              style={{ borderColor: style.primaryColor }}
            >
              <span>{L.total}</span>
              <span style={{ color: style.primaryColor }}>{symbol}{total.toFixed(2)}</span>
            </div>
            {data.lateFeeRate > 0 && (
              <p className="text-[10px] mt-2 text-right" style={{ color: "#dc2626" }}>
                Late fee: {data.lateFeeRate}% per month on overdue balance
              </p>
            )}
          </div>
        </div>

        {/* Payment Info */}
        {hasPayment && (
          <div className="rounded-lg p-4 border" style={{ backgroundColor: isDark ? "#2a2a2e" : "#f9fafb", borderColor: isDark ? "#3a3a3e" : "#f3f4f6" }}>
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2">{L.paymentInformation}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
              {data.paymentInfo.bankName && (
                <p><span className="font-medium text-gray-700">Bank:</span> {data.paymentInfo.bankName}</p>
              )}
              {data.paymentInfo.accountName && (
                <p><span className="font-medium text-gray-700">Account Name:</span> {data.paymentInfo.accountName}</p>
              )}
              {data.paymentInfo.accountNumber && (
                <p><span className="font-medium text-gray-700">Account #:</span> {data.paymentInfo.accountNumber}</p>
              )}
              {data.paymentInfo.routingNumber && (
                <p><span className="font-medium text-gray-700">Routing/IFSC:</span> {data.paymentInfo.routingNumber}</p>
              )}
              {data.paymentInfo.swiftCode && (
                <p><span className="font-medium text-gray-700">SWIFT:</span> {data.paymentInfo.swiftCode}</p>
              )}
              {data.paymentInfo.paypalEmail && (
                <p><span className="font-medium text-gray-700">PayPal:</span> {data.paymentInfo.paypalEmail}</p>
              )}
              {data.paymentInfo.customField && (
                <p className="col-span-2"><span className="font-medium text-gray-700">Other:</span> {data.paymentInfo.customField}</p>
              )}
            </div>
          </div>
        )}

        {/* QR Code */}
        {qrImage && (
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <img src={qrImage} alt="Payment QR" className="w-20 h-20 rounded-md border border-gray-200" />
            <div>
              <p className="text-xs font-semibold text-gray-700">Scan to Pay</p>
              <p className="text-[10px] text-gray-400 mt-0.5 max-w-[200px] break-all">{data.qrCodeData}</p>
            </div>
          </div>
        )}

        {/* Terms & Conditions — full width, first */}
        {data.terms && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-1">{L.termsAndConditions}</p>
            <p className="text-xs text-gray-500 whitespace-pre-line">{data.terms}</p>
          </div>
        )}

        {/* Notes — full width, after T&C */}
        {(notesText) && (
          <div className={`${!data.terms ? "pt-4 border-t border-gray-200" : ""}`}>
            <p className="text-xs font-semibold uppercase text-gray-400 mb-1">{L.notes}</p>
            <p className="text-xs text-gray-500 whitespace-pre-line">{notesText}</p>
          </div>
        )}

        {/* Signature */}
        {data.signature && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <div className="text-center">
              <img src={data.signature} alt="Signature" className="h-12 max-w-[180px] object-contain mb-1" />
              <div className="w-40 border-t border-gray-300" />
              <p className="text-xs text-gray-500 mt-1">{L.authorizedSignature}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
