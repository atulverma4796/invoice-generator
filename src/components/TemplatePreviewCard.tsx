"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { InvoiceData, TemplateId } from "@/types/invoice";
import { TEMPLATES } from "@/lib/templates";
import { getCurrencySymbol } from "@/lib/defaultInvoice";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
} from "@/lib/calculations";

interface TemplatePreviewCardProps {
  templateId: TemplateId;
  data: InvoiceData;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "#f3f4f6", text: "#374151" },
  pending: { bg: "#fef9c3", text: "#a16207" },
  paid: { bg: "#dcfce7", text: "#15803d" },
  overdue: { bg: "#fee2e2", text: "#b91c1c" },
};

export default function TemplatePreviewCard({ templateId, data }: TemplatePreviewCardProps) {
  const router = useRouter();
  const tpl = TEMPLATES[templateId];

  // Apply template to data so the preview matches
  const previewData: InvoiceData = {
    ...data,
    template: templateId,
    customStyle: {
      primaryColor: tpl.primaryColor,
      accentColor: tpl.accentColor,
      fontStyle: tpl.fontStyle,
    },
  };

  function handleUse() {
    try {
      // Generate fresh IDs and dates so the loaded invoice is editable
      const now = new Date();
      const due = new Date(now);
      due.setDate(due.getDate() + 30);

      const liveData: InvoiceData = {
        ...previewData,
        invoiceDate: now.toISOString().split("T")[0],
        dueDate: due.toISOString().split("T")[0],
        invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
        lineItems: previewData.lineItems.map((item, i) => ({
          ...item,
          id: `${Date.now()}-${i}`,
        })),
      };

      sessionStorage.setItem("invoicegen_use_template", JSON.stringify(liveData));
      toast.success(`${tpl.name} template loaded`);
      router.push("/#generator");
    } catch {
      toast.error("Couldn't load template. Try again.");
    }
  }

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all">
      {/* Mini Preview */}
      <div className="bg-gray-50 p-3 border-b border-gray-100">
        <MiniPreview data={previewData} />
      </div>

      {/* Footer */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">{tpl.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{tpl.description}</p>
        </div>
        <button
          type="button"
          onClick={handleUse}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 transition-all"
        >
          Use this template
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Compact pure-render mini invoice preview — no hooks, no heavy imports */
function MiniPreview({ data }: { data: InvoiceData }) {
  const style = data.customStyle;
  const symbol = getCurrencySymbol(data.currency);
  const subtotal = calculateSubtotal(data.lineItems);
  const tax = calculateTax(subtotal, data.taxRate);
  const discount = calculateDiscount(subtotal, data.discountRate);
  const total = calculateTotal(subtotal, tax, discount) + (data.shippingFee || 0);

  const isLight = data.template === "minimal" || data.template === "pastel" || data.template === "monochrome";
  const isDark = data.template === "executive";
  const templateConfig = TEMPLATES[data.template];
  const headerBg = isLight
    ? data.template === "pastel" ? "#f5f0e8"
    : data.template === "monochrome" ? "#ffffff"
    : "#f9fafb"
    : (templateConfig?.headerBg || style.primaryColor);
  const headerText = isLight
    ? (data.template === "monochrome" ? "#000000" : style.primaryColor)
    : (isDark ? "#d4a843" : "#ffffff");
  const bodyBg = data.template === "pastel" ? "#faf8f4" : isDark ? "#1c1c1e" : "#ffffff";
  const bodyText = isDark ? "#e5e5e5" : "#1f2937";
  const mutedText = isDark ? "#9ca3af" : "#6b7280";
  const labelText = isDark ? "#6b7280" : "#9ca3af";

  const statusCfg = STATUS_COLORS[data.status as string] ?? null;

  const hasPayment = Object.values(data.paymentInfo).some((v) => v.trim() !== "");

  return (
    <div
      className="rounded-md overflow-hidden shadow-sm border border-gray-100 relative"
      style={{
        fontFamily: style.fontStyle === "serif" ? "Georgia, serif" : "system-ui, sans-serif",
        backgroundColor: bodyBg,
        color: bodyText,
      }}
    >
      {/* Watermark — diagonal, behind everything */}
      {data.watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <p
            className="text-[34px] font-extrabold uppercase tracking-widest select-none"
            style={{ color: style.primaryColor, opacity: 0.08, transform: "rotate(-30deg)" }}
          >
            {data.watermark}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="px-3 py-2 relative z-20" style={{ backgroundColor: headerBg, color: headerText }}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-bold tracking-wide">INVOICE</p>
            <p className="text-[8px] opacity-70 mt-0.5">#{data.invoiceNumber}</p>
          </div>
          <div className="text-right">
            {statusCfg && (
              <span
                className="inline-block px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider mb-0.5"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
              >
                {data.status}
              </span>
            )}
            <p className="text-[9px] font-semibold leading-tight">{data.senderName}</p>
            <p className="text-[7px] opacity-70 truncate max-w-[110px]">{data.senderEmail}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-2 relative z-20">
        {/* From / To */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[7px] font-semibold uppercase" style={{ color: labelText }}>From</p>
            <p className="text-[9px] font-medium truncate" style={{ color: bodyText }}>{data.senderName}</p>
            <p className="text-[8px] truncate" style={{ color: mutedText }}>{data.senderAddress.split("\n")[0]}</p>
          </div>
          <div>
            <p className="text-[7px] font-semibold uppercase" style={{ color: labelText }}>Bill To</p>
            <p className="text-[9px] font-medium truncate" style={{ color: bodyText }}>{data.clientName}</p>
            <p className="text-[8px] truncate" style={{ color: mutedText }}>{data.clientAddress.split("\n")[0]}</p>
          </div>
        </div>

        {/* Line items table */}
        <div>
          <div
            className="grid grid-cols-12 gap-1 px-1.5 py-1 rounded-t text-[7px] font-semibold uppercase"
            style={{ backgroundColor: style.primaryColor + "12", color: style.primaryColor }}
          >
            <div className="col-span-7">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Amount</div>
          </div>
          {data.lineItems.slice(0, 3).map((item, i) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-1 px-1.5 py-1 text-[8px]"
              style={{
                backgroundColor: i % 2 === 0
                  ? (isDark ? "#2a2a2e" : data.template === "pastel" ? "#f0ebe0" : "#f9fafb")
                  : "transparent",
                color: bodyText,
              }}
            >
              <div className="col-span-7 truncate">{item.description}</div>
              <div className="col-span-2 text-center" style={{ color: mutedText }}>{item.quantity}</div>
              <div className="col-span-3 text-right font-medium">
                {symbol}{item.amount.toFixed(0)}
              </div>
            </div>
          ))}
        </div>

        {/* Subtotals + Total */}
        <div className="flex justify-end">
          <div className="space-y-0.5 text-[8px] min-w-[100px]">
            <div className="flex justify-between gap-3">
              <span style={{ color: mutedText }}>Subtotal</span>
              <span style={{ color: bodyText }}>{symbol}{subtotal.toFixed(0)}</span>
            </div>
            {data.taxRate > 0 && (
              <div className="flex justify-between gap-3">
                <span style={{ color: mutedText }}>{data.taxLabel} ({data.taxRate}%)</span>
                <span style={{ color: bodyText }}>{symbol}{tax.toFixed(0)}</span>
              </div>
            )}
            {data.discountRate > 0 && (
              <div className="flex justify-between gap-3">
                <span style={{ color: mutedText }}>Discount ({data.discountRate}%)</span>
                <span style={{ color: "#dc2626" }}>-{symbol}{discount.toFixed(0)}</span>
              </div>
            )}
            <div
              className="flex justify-between items-center gap-3 mt-0.5 px-2 py-0.5 rounded"
              style={{ backgroundColor: style.primaryColor + "10" }}
            >
              <span className="text-[9px] font-semibold" style={{ color: mutedText }}>Total</span>
              <span className="text-[12px] font-bold" style={{ color: style.primaryColor }}>
                {symbol}{total.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info + QR side by side */}
        {(hasPayment || data.qrCodeData) && (
          <div className="flex gap-2 items-start pt-1.5 border-t" style={{ borderColor: isDark ? "#2a2a2e" : "#f3f4f6" }}>
            {hasPayment && (
              <div className="flex-1 min-w-0">
                <p className="text-[7px] font-semibold uppercase mb-0.5" style={{ color: labelText }}>Payment</p>
                {data.paymentInfo.bankName && (
                  <p className="text-[7px] truncate" style={{ color: mutedText }}>
                    <span className="font-medium" style={{ color: bodyText }}>Bank:</span> {data.paymentInfo.bankName}
                  </p>
                )}
                {data.paymentInfo.accountNumber && (
                  <p className="text-[7px] truncate" style={{ color: mutedText }}>
                    <span className="font-medium" style={{ color: bodyText }}>A/C:</span> {data.paymentInfo.accountNumber}
                  </p>
                )}
                {data.paymentInfo.paypalEmail && (
                  <p className="text-[7px] truncate" style={{ color: mutedText }}>
                    <span className="font-medium" style={{ color: bodyText }}>PayPal:</span> {data.paymentInfo.paypalEmail}
                  </p>
                )}
              </div>
            )}
            {data.qrCodeData && (
              <div className="shrink-0">
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IndoaXRlIi8+PGcgZmlsbD0iYmxhY2siPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjI1Ii8+PHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTgiIHk9IjE4IiB3aWR0aD0iOSIgaGVpZ2h0PSI5Ii8+PHJlY3QgeD0iNjUiIHk9IjEwIiB3aWR0aD0iMjUiIGhlaWdodD0iMjUiLz48cmVjdCB4PSI3MCIgeT0iMTUiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSI3MyIgeT0iMTgiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiLz48cmVjdCB4PSIxMCIgeT0iNjUiIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNSIvPjxyZWN0IHg9IjE1IiB5PSI3MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjE4IiB5PSI3MyIgd2lkdGg9IjkiIGhlaWdodD0iOSIvPjxyZWN0IHg9IjQwIiB5PSIxMCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjUwIiB5PSIxMCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjQwIiB5PSIyMCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjU1IiB5PSIyMCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjQwIiB5PSIzMCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjUwIiB5PSIzMCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjYwIiB5PSIzMCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjEwIiB5PSI0MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjMwIiB5PSI0MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjU1IiB5PSI0MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjY1IiB5PSI0MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjgwIiB5PSI0MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjE1IiB5PSI1MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjI1IiB5PSI1MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjQwIiB5PSI1MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjYwIiB5PSI1MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9Ijc1IiB5PSI1MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjQwIiB5PSI2MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjUwIiB5PSI2MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjcwIiB5PSI2MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9Ijg1IiB5PSI2MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjQwIiB5PSI3MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjU1IiB5PSI3MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9Ijg1IiB5PSI3MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjQwIiB5PSI4MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjUwIiB5PSI4MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjY1IiB5PSI4MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjxyZWN0IHg9IjgwIiB5PSI4MCIgd2lkdGg9IjUiIGhlaWdodD0iNSIvPjwvZz48L3N2Zz4="
                  alt="QR"
                  className="w-9 h-9 rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        )}

        {/* Terms & Conditions + Notes */}
        {(data.terms || data.notes) && (
          <div className="pt-1.5 border-t space-y-1" style={{ borderColor: isDark ? "#2a2a2e" : "#f3f4f6" }}>
            {data.terms && (
              <div>
                <p className="text-[7px] font-semibold uppercase" style={{ color: labelText }}>Terms</p>
                <p className="text-[7px] line-clamp-2 leading-snug" style={{ color: mutedText }}>{data.terms}</p>
              </div>
            )}
            {data.notes && (
              <div>
                <p className="text-[7px] font-semibold uppercase" style={{ color: labelText }}>Notes</p>
                <p className="text-[7px] line-clamp-1 leading-snug" style={{ color: mutedText }}>{data.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Signature */}
        {data.signature && (
          <div className="flex justify-end pt-0.5">
            <div className="text-right">
              <img
                src={data.signature}
                alt="Signature"
                className="h-5 max-w-[70px] object-contain inline-block"
                style={{ filter: isDark ? "invert(1)" : "none" }}
              />
              <div className="w-14 border-t mt-0.5 ml-auto" style={{ borderColor: mutedText }} />
              <p className="text-[6px] mt-0.5" style={{ color: mutedText }}>Authorized</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
