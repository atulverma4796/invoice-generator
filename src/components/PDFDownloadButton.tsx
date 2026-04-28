"use client";

import toast from "react-hot-toast";
import { InvoiceData } from "@/types/invoice";
import { validateInvoice, hasErrors } from "@/lib/validation";
import { trackInvoiceEvent } from "@/lib/trackEvent";

interface PDFDownloadButtonProps {
  data: InvoiceData;
  onValidationFail?: () => void;
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

    // Silent admin-only analytics — fires after the user already has the file
    trackInvoiceEvent("download", data);
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
