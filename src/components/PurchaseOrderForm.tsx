"use client";

import { useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";

export interface POLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface PurchaseOrderData {
  // Buyer (the one placing the order — that's you).
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerTaxId: string;

  // Vendor / supplier — the one receiving the order.
  vendorName: string;
  vendorEmail: string;
  vendorAddress: string;

  // Ship-to address (often different from buyer's billing address).
  shipToAddress: string;

  poNumber: string;
  poDate: string;
  expectedDelivery: string;

  lineItems: POLineItem[];

  taxRate: number;
  taxLabel: string;
  discountRate: number;
  shippingFee: number;
  currency: string;

  notes: string;
  terms: string;
}

const STORAGE_KEY = "purchase_order_form_v1";

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

function newLineItem(): POLineItem {
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

export function defaultPurchaseOrderData(): PurchaseOrderData {
  const today = isoToday();
  const counter = Math.floor(100 + Math.random() * 900);
  return {
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerTaxId: "",
    vendorName: "",
    vendorEmail: "",
    vendorAddress: "",
    shipToAddress: "",
    poNumber: `PO-${new Date().getFullYear()}-${counter}`,
    poDate: today,
    expectedDelivery: isoPlusDays(14),
    lineItems: [newLineItem()],
    taxRate: 0,
    taxLabel: "GST",
    discountRate: 0,
    shippingFee: 0,
    currency: "INR",
    notes: "",
    terms:
      "1. All goods must conform to specifications agreed upon.\n2. Invoices must reference this PO number to be processed.\n3. Payment terms: Net 30 from invoice date unless otherwise agreed.\n4. Late deliveries beyond the expected date may attract a penalty as agreed in our master agreement.",
  };
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol || "$";
}

interface Props {
  data: PurchaseOrderData;
  setData: (d: PurchaseOrderData) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function PurchaseOrderForm({ data, setData, onGenerate, generating }: Props) {
  const [savedToast, setSavedToast] = useState(false);
  void savedToast;

  const buyerRef = useRef<HTMLInputElement>(null);
  const vendorRef = useRef<HTMLInputElement>(null);
  const poNumberRef = useRef<HTMLInputElement>(null);
  const firstItemRef = useRef<HTMLInputElement>(null);

  const focusAndScroll = (el: HTMLInputElement | null) => {
    if (!el) return;
    el.focus();
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const totals = useMemo(() => {
    const subtotal = data.lineItems.reduce((sum, it) => sum + it.quantity * it.rate, 0);
    const discount = (subtotal * (data.discountRate || 0)) / 100;
    const taxableBase = subtotal - discount;
    const tax = (taxableBase * (data.taxRate || 0)) / 100;
    const total = taxableBase + tax + (data.shippingFee || 0);
    return { subtotal, discount, tax, total };
  }, [data.lineItems, data.taxRate, data.discountRate, data.shippingFee]);

  const symbol = getCurrencySymbol(data.currency);

  const update = <K extends keyof PurchaseOrderData>(field: K, value: PurchaseOrderData[K]) => {
    setData({ ...data, [field]: value });
  };

  const updateItem = <K extends keyof POLineItem>(
    id: string,
    field: K,
    value: POLineItem[K],
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

  const validateAndFocus = (): boolean => {
    if (!data.buyerName.trim()) {
      toast.error("Please enter your company / buyer name.");
      focusAndScroll(buyerRef.current);
      return false;
    }
    if (!data.vendorName.trim()) {
      toast.error("Please enter the vendor / supplier name.");
      focusAndScroll(vendorRef.current);
      return false;
    }
    if (!data.poNumber.trim()) {
      toast.error("Please enter a purchase order number.");
      focusAndScroll(poNumberRef.current);
      return false;
    }
    if (!data.lineItems.some((it) => it.description.trim())) {
      toast.error("Please add at least one line item with a description.");
      focusAndScroll(firstItemRef.current);
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-800">
        A <strong>Purchase Order</strong> is your formal commitment to buy goods/services from a vendor at agreed terms. It locks in price and quantity, references your accounting system, and helps reconcile against the vendor&apos;s invoice when it arrives.
      </div>

      {/* Currency + PO# + Dates */}
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
          <label className="block text-xs font-medium text-gray-600 mb-1">PO #</label>
          <input
            ref={poNumberRef}
            type="text"
            value={data.poNumber}
            onChange={(e) => update("poNumber", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">PO Date</label>
          <input
            type="date"
            value={data.poDate}
            onChange={(e) => update("poDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Expected Delivery</label>
          <input
            type="date"
            value={data.expectedDelivery}
            onChange={(e) => update("expectedDelivery", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Buyer (you) / Vendor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Buyer (you)</h3>
          <input
            ref={buyerRef}
            type="text"
            placeholder="Company / Business name *"
            value={data.buyerName}
            onChange={(e) => update("buyerName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Email"
            value={data.buyerEmail}
            onChange={(e) => update("buyerEmail", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={data.buyerPhone}
            onChange={(e) => update("buyerPhone", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Billing address"
            value={data.buyerAddress}
            onChange={(e) => update("buyerAddress", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <input
            type="text"
            placeholder="GSTIN / VAT / Tax ID (Optional)"
            value={data.buyerTaxId}
            onChange={(e) => update("buyerTaxId", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Vendor / Supplier</h3>
          <input
            ref={vendorRef}
            type="text"
            placeholder="Vendor / Supplier name *"
            value={data.vendorName}
            onChange={(e) => update("vendorName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Vendor email"
            value={data.vendorEmail}
            onChange={(e) => update("vendorEmail", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Vendor address"
            value={data.vendorAddress}
            onChange={(e) => update("vendorAddress", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Ship-to */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Ship To <span className="text-gray-400 font-normal">(if different from billing)</span>
        </label>
        <textarea
          value={data.shipToAddress}
          onChange={(e) => update("shipToAddress", e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Same as billing address — leave blank if no separate ship-to"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Items Ordered</h3>
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
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {data.lineItems.map((it, idx) => {
            const amount = it.quantity * it.rate;
            return (
              <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  ref={idx === 0 ? firstItemRef : undefined}
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

      {/* Tax + Discount + Shipping + Totals */}
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
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Fee</label>
              <input
                type="number"
                value={data.shippingFee || ""}
                onChange={(e) => update("shippingFee", parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                min={0}
                step={0.01}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
          {(data.shippingFee || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{symbol}{(data.shippingFee || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span>PO Total</span>
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
            placeholder="Any additional instructions for the vendor"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Terms & Conditions</label>
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
          if (!validateAndFocus()) return;
          onGenerate();
        }}
        disabled={generating}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "Generating PDF…" : "Download Purchase Order as PDF"}
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

export { STORAGE_KEY as PURCHASE_ORDER_STORAGE_KEY };
