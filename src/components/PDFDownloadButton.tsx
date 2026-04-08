"use client";

import toast from "react-hot-toast";
import { InvoiceData } from "@/types/invoice";
import { getCurrencySymbol } from "@/lib/defaultInvoice";
import { validateInvoice, hasErrors } from "@/lib/validation";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
} from "@/lib/calculations";

interface PDFDownloadButtonProps {
  data: InvoiceData;
  onValidationFail?: () => void;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;

  let browser = "Unknown";
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR/")) browser = "Opera";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return {
    browser,
    os,
    platform: navigator.platform || "Unknown",
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language || "Unknown",
    userAgent: ua,
  };
}

export default function PDFDownloadButton({ data, onValidationFail }: PDFDownloadButtonProps) {
  async function handleDownload() {
    const errors = validateInvoice(data);
    if (hasErrors(errors)) {
      onValidationFail?.();
      const firstError = Object.values(errors)[0];
      toast.error(firstError, { duration: 4000 });
      return;
    }

    // Lazy-load PDF + QR libs only when user clicks download (saves ~700KB on first paint)
    const loadingToast = toast.loading("Preparing your invoice...");
    try {
      const [{ generateInvoicePDF }, { generateQRDataURL }] = await Promise.all([
        import("@/lib/generatePDF"),
        import("./QRCodeSection"),
      ]);
      const qrDataURL = data.qrCodeData ? await generateQRDataURL(data.qrCodeData) : undefined;
      const doc = generateInvoicePDF(data, qrDataURL);
      doc.save(`${data.invoiceNumber || "invoice"}.pdf`);
      toast.success("Invoice downloaded successfully!", { id: loadingToast });
    } catch {
      toast.error("Failed to generate PDF. Please try again.", { id: loadingToast });
      return;
    }

    // Analytics beacon
    try {
      const subtotal = calculateSubtotal(data.lineItems);
      const tax = calculateTax(subtotal, data.taxRate);
      const discount = calculateDiscount(subtotal, data.discountRate);
      const total = calculateTotal(subtotal, tax, discount) + (data.shippingFee || 0);
      const symbol = getCurrencySymbol(data.currency);

      const payload = JSON.stringify({
        invoiceNumber: data.invoiceNumber,
        clientName: data.clientName,
        total: `${symbol}${total.toFixed(2)}`,
        currency: data.currency,
        device: getDeviceInfo(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/t", new Blob([payload], { type: "application/json" }));
      }
    } catch {
      // silent
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-300 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      Download PDF
    </button>
  );
}
