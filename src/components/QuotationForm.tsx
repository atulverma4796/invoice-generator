"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface QuotationData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  senderTaxId: string;

  clientName: string;
  clientEmail: string;
  clientAddress: string;

  quoteNumber: string;
  quoteDate: string;
  validUntil: string;

  lineItems: QuoteLineItem[];

  taxRate: number;
  taxLabel: string;
  discountRate: number;
  currency: string;

  notes: string;
  terms: string;
}

const STORAGE_KEY = "quotation_form_v1";

const CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "AED", symbol: "AED" },
  { code: "SGD", symbol: "S$" },
] as const;

function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function newLineItem(): QuoteLineItem {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: "",
    quantity: 1,
    rate: 0,
  };
}

export function defaultQuotationData(): QuotationData {
  const today = isoToday();
  const counter = Math.floor(100 + Math.random() * 900);
  return {
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderAddress: "",
    senderTaxId: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    quoteNumber: `Q-${new Date().getFullYear()}-${counter}`,
    quoteDate: today,
    validUntil: isoPlusDays(30),
    lineItems: [newLineItem()],
    taxRate: 0,
    taxLabel: "GST",
    discountRate: 0,
    currency: "INR",
    notes: "Thank you for the opportunity. We look forward to working with you.",
    terms:
      "1. This quotation is valid for 30 days from the date of issue.\n2. Prices are inclusive of all costs unless explicitly stated.\n3. Payment terms and conditions to be agreed upon order confirmation.",
  };
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol || "$";
}

interface Props {
  data: QuotationData;
  setData: (d: QuotationData) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function QuotationForm({ data, setData, onGenerate, generating }: Props) {
  const [savedToast, setSavedToast] = useState(false);
  void savedToast; // reserved for future "saved" UI state

  const totals = useMemo(() => {
    const subtotal = data.lineItems.reduce((sum, it) => sum + it.quantity * it.rate, 0);
    const discount = (subtotal * (data.discountRate || 0)) / 100;
    const taxableBase = subtotal - discount;
    const tax = (taxableBase * (data.taxRate || 0)) / 100;
    const total = taxableBase + tax;
    return { subtotal, discount, tax, total };
  }, [data.lineItems, data.taxRate, data.discountRate]);

  const symbol = getCurrencySymbol(data.currency);

  const update = <K extends keyof QuotationData>(field: K, value: QuotationData[K]) => {
    setData({ ...data, [field]: value });
  };

  const updateItem = <K extends keyof QuoteLineItem>(
    id: string,
    field: K,
    value: QuoteLineItem[K],
  ) => {
    setData({
      ...data,
      lineItems: data.lineItems.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    });
  };

  const addItem = () =>
    setData({ ...data, lineItems: [...data.lineItems, newLineItem()] });

  const removeItem = (id: string) =>
    setData({ ...data, lineItems: data.lineItems.filter((it) => it.id !== id) });

  const validate = (): string | null => {
    if (!data.senderName.trim()) return "Your name / business name is required.";
    if (!data.clientName.trim()) return "Client name is required.";
    if (!data.quoteNumber.trim()) return "Quotation number is required.";
    if (!data.lineItems.some((it) => it.description.trim()))
      return "Add at least one line item with a description.";
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-800">
        <strong>Quotation</strong> (also called <em>estimate</em> or <em>proforma</em>) is a price proposal sent before work
        begins. It is non-binding until accepted. Convert to an invoice once the client accepts.
      </div>

      {/* Currency + Quote # + Dates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
          <select
            value={data.currency}
            onChange={(e) => update("currency", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Quote #</label>
          <input
            type="text"
            value={data.quoteNumber}
            onChange={(e) => update("quoteNumber", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={data.quoteDate}
            onChange={(e) => update("quoteDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Valid Until</label>
          <input
            type="date"
            value={data.validUntil}
            onChange={(e) => update("validUntil", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">From</h3>
          <input
            type="text"
            placeholder="Your name / Business name *"
            value={data.senderName}
            onChange={(e) => update("senderName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Email"
            value={data.senderEmail}
            onChange={(e) => update("senderEmail", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={data.senderPhone}
            onChange={(e) => update("senderPhone", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Address"
            value={data.senderAddress}
            onChange={(e) => update("senderAddress", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <input
            type="text"
            placeholder="GSTIN / VAT / Tax ID (Optional)"
            value={data.senderTaxId}
            onChange={(e) => update("senderTaxId", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">To (Client)</h3>
          <input
            type="text"
            placeholder="Client / Company name *"
            value={data.clientName}
            onChange={(e) => update("clientName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Client email"
            value={data.clientEmail}
            onChange={(e) => update("clientEmail", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Client address"
            value={data.clientAddress}
            onChange={(e) => update("clientAddress", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            + Add line
          </button>
        </div>
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-500 uppercase px-1">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {data.lineItems.map((it) => {
            const amount = it.quantity * it.rate;
            return (
              <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={it.description}
                  onChange={(e) => updateItem(it.id, "description", e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Item or service"
                  className="col-span-12 md:col-span-6 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={it.quantity || ""}
                  onChange={(e) => updateItem(it.id, "quantity", parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Qty"
                  min={0}
                  className="col-span-4 md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={it.rate || ""}
                  onChange={(e) => updateItem(it.id, "rate", parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Rate"
                  min={0}
                  step={0.01}
                  className="col-span-4 md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="col-span-3 md:col-span-2 text-right text-sm font-medium text-gray-700 px-2">
                  {symbol}{amount.toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  disabled={data.lineItems.length <= 1}
                  className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax + Discount + Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tax Label</label>
              <select
                value={data.taxLabel}
                onChange={(e) => update("taxLabel", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="GST">GST</option>
                <option value="VAT">VAT</option>
                <option value="Sales Tax">Sales Tax</option>
                <option value="Tax">Tax</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                value={data.taxRate || ""}
                onChange={(e) => update("taxRate", parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                min={0}
                step={0.01}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Discount (%)</label>
            <input
              type="number"
              value={data.discountRate || ""}
              onChange={(e) => update("discountRate", parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              min={0}
              max={100}
              step={0.01}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{symbol}{totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount ({data.discountRate}%)</span>
              <span className="font-medium text-red-600">−{symbol}{totals.discount.toFixed(2)}</span>
            </div>
          )}
          {totals.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{data.taxLabel} ({data.taxRate}%)</span>
              <span className="font-medium">{symbol}{totals.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span>Estimated Total</span>
            <span className="text-blue-700">{symbol}{totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes + Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Terms</label>
          <textarea
            value={data.terms}
            onChange={(e) => update("terms", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          const err = validate();
          if (err) {
            toast.error(err);
            return;
          }
          onGenerate();
        }}
        disabled={generating}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "Generating PDF…" : "Download Quotation as PDF"}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            toast.success("Saved");
          } catch {
            toast.error("Could not save");
          }
        }}
        className="w-full text-xs text-gray-500 hover:text-blue-600"
      >
        Save these details locally for next time
      </button>
    </div>
  );
}

export { STORAGE_KEY as QUOTATION_STORAGE_KEY };
