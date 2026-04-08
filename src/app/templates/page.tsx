"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { InvoiceData } from "@/types/invoice";
import { getCurrencySymbol } from "@/lib/defaultInvoice";
import { getStatusColors } from "@/components/StatusBadge";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
} from "@/lib/calculations";

interface SavedTemplate {
  name: string;
  data: InvoiceData;
  savedAt: string;
  recurrence?: string;
}

const STORAGE_KEY = "invoicegen_saved_templates";

function getSavedTemplates(): SavedTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function MiniPreview({ data }: { data: InvoiceData }) {
  const style = data.customStyle;
  const symbol = getCurrencySymbol(data.currency);
  const subtotal = calculateSubtotal(data.lineItems);
  const tax = calculateTax(subtotal, data.taxRate);
  const discount = calculateDiscount(subtotal, data.discountRate);
  const total = calculateTotal(subtotal, tax, discount) + (data.shippingFee || 0);
  const isLight = data.template === "minimal";
  const headerBg = isLight ? "#f9fafb" : style.primaryColor;
  const statusCfg = getStatusColors(data.status);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 relative"
      style={{
        fontFamily: style.fontStyle === "serif" ? "Georgia, serif" : "system-ui, sans-serif",
        minHeight: "320px",
      }}
    >
      {/* Watermark */}
      {data.watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <p
            className="text-[36px] font-extrabold uppercase tracking-widest select-none"
            style={{ color: style.primaryColor, opacity: 0.07, transform: "rotate(-30deg)" }}
          >
            {data.watermark}
          </p>
        </div>
      )}

      {/* Header */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: headerBg, color: isLight ? style.primaryColor : "#ffffff" }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {data.logo && (
              <img src={data.logo} alt="Logo" className="h-6 max-w-[40px] object-contain" />
            )}
            <div>
              <p className="text-xs font-bold">INVOICE</p>
              <p className="text-[10px] opacity-70">#{data.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            {data.status !== "none" && (
              <span
                className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
              >
                {data.status}
              </span>
            )}
            <p className="text-[10px] font-semibold mt-0.5">{data.senderName || "Your Business"}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3 relative z-20">
        {/* From / To */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[8px] font-semibold uppercase text-gray-400">From</p>
            <p className="text-[10px] font-medium text-gray-800 truncate">{data.senderName || "\u2014"}</p>
            {data.senderEmail && <p className="text-[9px] text-gray-500 truncate">{data.senderEmail}</p>}
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase text-gray-400">Bill To</p>
            <p className="text-[10px] font-medium text-gray-800 truncate">{data.clientName || "\u2014"}</p>
            {data.clientEmail && <p className="text-[9px] text-gray-500 truncate">{data.clientEmail}</p>}
          </div>
        </div>

        {/* Line items preview */}
        <div>
          <div
            className="grid grid-cols-12 gap-1 px-2 py-1 rounded-t text-[8px] font-semibold uppercase"
            style={{ backgroundColor: style.primaryColor + "10", color: style.primaryColor }}
          >
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-4 text-right">Amount</div>
          </div>
          {data.lineItems.slice(0, 3).map((item, i) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-1 px-2 py-1 text-[9px] ${i % 2 === 0 ? "bg-gray-50" : ""}`}
            >
              <div className="col-span-6 text-gray-700 truncate">{item.description || "\u2014"}</div>
              <div className="col-span-2 text-center text-gray-500">{item.quantity}</div>
              <div className="col-span-4 text-right text-gray-700">{symbol}{item.amount.toFixed(2)}</div>
            </div>
          ))}
          {data.lineItems.length > 3 && (
            <p className="text-[8px] text-gray-400 text-center py-0.5">+{data.lineItems.length - 3} more items</p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: style.primaryColor + "08" }}
          >
            <span className="text-[10px] font-semibold text-gray-600">Total</span>
            <span className="text-sm font-bold" style={{ color: style.primaryColor }}>
              {symbol}{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Signature hint */}
        {data.signature && (
          <div className="flex justify-end">
            <div className="text-center">
              <img src={data.signature} alt="Signature" className="h-5 max-w-[60px] object-contain" />
              <div className="w-16 border-t border-gray-200 mt-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTemplates(getSavedTemplates());
    setLoaded(true);
  }, []);

  function handleDelete(index: number) {
    const name = templates[index]?.name;
    const updated = templates.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTemplates(updated);
    toast.success(`"${name}" deleted`);
  }

  function handleEdit(index: number) {
    sessionStorage.setItem("invoicegen_edit_index", String(index));
    router.push("/#generator");
  }

  function handleDuplicate(index: number) {
    const original = templates[index];
    if (!original) return;
    const copy: SavedTemplate = {
      name: `${original.name} (copy)`,
      data: { ...original.data },
      savedAt: new Date().toISOString(),
    };
    const updated = [...templates, copy].slice(-10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTemplates(updated);
    toast.success(`Duplicated "${original.name}"`);
  }

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-20 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-32 right-16 w-56 h-56 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Your Saved Invoices
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              My{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Templates
              </span>
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              All your saved invoice templates in one place. Preview, edit, or create new ones.
            </p>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {templates.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No templates saved yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Create an invoice and save it as a template. Your saved templates will appear here for quick access.
              </p>
              <a
                href="/#generator"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Your First Invoice
              </a>
            </div>
          ) : (
            <>
              {/* Count + Create button */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {templates.length} Saved Template{templates.length !== 1 ? "s" : ""}
                  </h2>
                  <p className="text-sm text-gray-500">Click Edit to load a template into the invoice generator</p>
                </div>
                <a
                  href="/#generator"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-200 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Invoice
                </a>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((t, i) => {
                  const symbol = getCurrencySymbol(t.data.currency);
                  const subtotal = calculateSubtotal(t.data.lineItems);
                  const tax = calculateTax(subtotal, t.data.taxRate);
                  const discount = calculateDiscount(subtotal, t.data.discountRate);
                  const total = calculateTotal(subtotal, tax, discount) + (t.data.shippingFee || 0);

                  return (
                    <div
                      key={i}
                      className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
                    >
                      {/* Mini Preview */}
                      <div className="p-3 bg-gray-50/50 border-b border-gray-100">
                        <div className="transform scale-[0.95] origin-top">
                          <MiniPreview data={t.data} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-3">
                        {/* Name + Date */}
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 truncate">{t.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Saved {new Date(t.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                          {t.data.template && (
                            <span
                              className="shrink-0 ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                              style={{
                                backgroundColor: t.data.customStyle.primaryColor + "12",
                                color: t.data.customStyle.primaryColor,
                              }}
                            >
                              {t.data.template}
                            </span>
                          )}
                        </div>

                        {/* Summary chips */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-[11px] text-gray-600">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                            </svg>
                            {t.data.clientName || "No client"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[11px] font-medium">
                            {symbol}{total.toFixed(2)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[11px]">
                            {t.data.currency}
                          </span>
                          {t.data.lineItems.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-md text-[11px] text-gray-500">
                              {t.data.lineItems.length} item{t.data.lineItems.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {t.data.status !== "none" && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium capitalize"
                              style={{
                                backgroundColor: getStatusColors(t.data.status).bg,
                                color: getStatusColors(t.data.status).text,
                              }}
                            >
                              {t.data.status}
                            </span>
                          )}
                          {t.recurrence && t.recurrence !== "none" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[11px] font-medium capitalize">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                              </svg>
                              {t.recurrence}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleEdit(i)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md hover:shadow-blue-200 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(i)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            title="Duplicate"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(i)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
