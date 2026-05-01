"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";

export interface DeliveryItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface DeliveryNoteData {
  // Consignor (sender / dispatcher)
  consignorName: string;
  consignorAddress: string;
  consignorTaxId: string;
  consignorPhone: string;

  // Consignee (recipient)
  consigneeName: string;
  consigneeAddress: string;
  consigneePhone: string;

  // Delivery details
  challanNumber: string;
  challanDate: string;
  deliveryDate: string;
  referenceNumber: string; // PO / Invoice ref

  // Transport
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  transportMode: "Road" | "Air" | "Rail" | "Sea" | "Hand-delivered";

  items: DeliveryItem[];

  notes: string;
}

const STORAGE_KEY = "delivery_note_form_v1";

function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

function newItem(): DeliveryItem {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: "",
    quantity: 1,
    unit: "Pcs",
  };
}

export function defaultDeliveryNoteData(): DeliveryNoteData {
  const today = isoToday();
  const counter = Math.floor(100 + Math.random() * 900);
  return {
    consignorName: "",
    consignorAddress: "",
    consignorTaxId: "",
    consignorPhone: "",
    consigneeName: "",
    consigneeAddress: "",
    consigneePhone: "",
    challanNumber: `DC-${new Date().getFullYear()}-${counter}`,
    challanDate: today,
    deliveryDate: today,
    referenceNumber: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    transportMode: "Road",
    items: [newItem()],
    notes:
      "Goods delivered as per the order. Please verify and acknowledge receipt with signature on the receiver's copy.",
  };
}

interface Props {
  data: DeliveryNoteData;
  setData: (d: DeliveryNoteData) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function DeliveryNoteForm({ data, setData, onGenerate, generating }: Props) {
  const consignorRef = useRef<HTMLInputElement>(null);
  const consigneeRef = useRef<HTMLInputElement>(null);
  const challanRef = useRef<HTMLInputElement>(null);
  const firstItemRef = useRef<HTMLInputElement>(null);

  const focusAndScroll = (el: HTMLInputElement | null) => {
    if (!el) return;
    el.focus();
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const update = <K extends keyof DeliveryNoteData>(field: K, value: DeliveryNoteData[K]) => {
    setData({ ...data, [field]: value });
  };

  const updateItem = <K extends keyof DeliveryItem>(
    id: string,
    field: K,
    value: DeliveryItem[K],
  ) => {
    setData({
      ...data,
      items: data.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    });
  };

  const addItem = () => setData({ ...data, items: [...data.items, newItem()] });
  const removeItem = (id: string) =>
    setData({ ...data, items: data.items.filter((it) => it.id !== id) });

  const validateAndFocus = (): boolean => {
    if (!data.consignorName.trim()) {
      toast.error("Please enter the sender (consignor) name.");
      focusAndScroll(consignorRef.current);
      return false;
    }
    if (!data.consigneeName.trim()) {
      toast.error("Please enter the recipient (consignee) name.");
      focusAndScroll(consigneeRef.current);
      return false;
    }
    if (!data.challanNumber.trim()) {
      toast.error("Please enter a delivery note number.");
      focusAndScroll(challanRef.current);
      return false;
    }
    if (!data.items.some((it) => it.description.trim())) {
      toast.error("Please add at least one item being delivered.");
      focusAndScroll(firstItemRef.current);
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-800">
        A <strong>Delivery Note</strong> (also called <em>Delivery Challan</em> in India) accompanies goods in transit. It lists what is being delivered — not what it costs — and is signed by the receiver as proof of delivery. It is required for movement of goods under GST when an invoice is not yet raised.
      </div>

      {/* Header fields */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Note #</label>
          <input
            ref={challanRef}
            type="text"
            value={data.challanNumber}
            onChange={(e) => update("challanNumber", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={data.challanDate}
            onChange={(e) => update("challanDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Date</label>
          <input
            type="date"
            value={data.deliveryDate}
            onChange={(e) => update("deliveryDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Reference (PO or Invoice #) <span className="text-gray-400 font-normal">— optional</span>
        </label>
        <input
          type="text"
          value={data.referenceNumber}
          onChange={(e) => update("referenceNumber", e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="PO-2026-001 or INV-2026-042"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Consignor / Consignee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">From (Consignor)</h3>
          <input
            ref={consignorRef}
            type="text"
            placeholder="Sender / Business name *"
            value={data.consignorName}
            onChange={(e) => update("consignorName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Sender address"
            value={data.consignorAddress}
            onChange={(e) => update("consignorAddress", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <input
            type="tel"
            placeholder="Phone (Optional)"
            value={data.consignorPhone}
            onChange={(e) => update("consignorPhone", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="GSTIN / Tax ID (Optional)"
            value={data.consignorTaxId}
            onChange={(e) => update("consignorTaxId", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">To (Consignee)</h3>
          <input
            ref={consigneeRef}
            type="text"
            placeholder="Recipient / Company name *"
            value={data.consigneeName}
            onChange={(e) => update("consigneeName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Delivery address"
            value={data.consigneeAddress}
            onChange={(e) => update("consigneeAddress", e.target.value)}
            onFocus={(e) => e.target.select()}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <input
            type="tel"
            placeholder="Recipient phone (Optional)"
            value={data.consigneePhone}
            onChange={(e) => update("consigneePhone", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Transport */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Transport Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
            <select
              value={data.transportMode}
              onChange={(e) => update("transportMode", e.target.value as DeliveryNoteData["transportMode"])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Road">Road</option>
              <option value="Air">Air</option>
              <option value="Rail">Rail</option>
              <option value="Sea">Sea</option>
              <option value="Hand-delivered">Hand-delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle #</label>
            <input
              type="text"
              value={data.vehicleNumber}
              onChange={(e) => update("vehicleNumber", e.target.value.toUpperCase())}
              onFocus={(e) => e.target.select()}
              placeholder="MH 12 AB 1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Driver Name</label>
            <input
              type="text"
              value={data.driverName}
              onChange={(e) => update("driverName", e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Driver Phone</label>
            <input
              type="tel"
              value={data.driverPhone}
              onChange={(e) => update("driverPhone", e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Items Being Delivered</h3>
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
            <div className="col-span-7">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-1"></div>
          </div>
          {data.items.map((it, idx) => (
            <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                ref={idx === 0 ? firstItemRef : undefined}
                type="text"
                value={it.description}
                onChange={(e) => updateItem(it.id, "description", e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="Item or service"
                className="col-span-12 md:col-span-7 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={it.quantity || ""}
                onChange={(e) => updateItem(it.id, "quantity", parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="Qty"
                min={0}
                className="col-span-5 md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={it.unit}
                onChange={(e) => updateItem(it.id, "unit", e.target.value)}
                className="col-span-5 md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pcs">Pcs</option>
                <option value="Box">Box</option>
                <option value="Carton">Carton</option>
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
                <option value="Metre">Metre</option>
                <option value="Set">Set</option>
                <option value="Pair">Pair</option>
                <option value="Pack">Pack</option>
                <option value="Roll">Roll</option>
                <option value="Bag">Bag</option>
                <option value="Other">Other</option>
              </select>
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                disabled={data.items.length <= 1}
                className="col-span-2 md:col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

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

      <button
        type="button"
        onClick={() => {
          if (!validateAndFocus()) return;
          onGenerate();
        }}
        disabled={generating}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "Generating PDF…" : "Download Delivery Note as PDF"}
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

export { STORAGE_KEY as DELIVERY_NOTE_STORAGE_KEY };
