"use client";

import { useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { numberToIndianWords } from "@/lib/numberToWords";
import SignaturePad from "@/components/SignaturePad";

export interface RentReceiptData {
  tenantName: string;
  landlordName: string;
  landlordPan: string;
  propertyAddress: string;
  monthlyRent: number;
  paymentMode: "Cash" | "Cheque" | "Bank Transfer" | "UPI";
  periodMode: "fy" | "custom";
  startMonth: string; // YYYY-MM
  endMonth: string; // YYYY-MM
  receiptStartNumber: number;
  landlordSignature: string; // PNG/JPEG data URL, empty when none
}

const STORAGE_KEY = "rent_receipt_form_v1";

// Indian financial year that a given date falls in (FY starts 1 April).
export function currentFyStartYear(now = new Date()): number {
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

// A financial year's month range, e.g. 2025 -> { start: "2025-04", end: "2026-03" }.
export function fyRange(startYear: number): { start: string; end: string } {
  return { start: `${startYear}-04`, end: `${startYear + 1}-03` };
}

// FY start-year derived from a "YYYY-MM" month (April onwards belongs to that year).
export function fyStartFromMonth(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return currentFyStartYear();
  return m >= 4 ? y : y - 1;
}

// Selectable financial years: current FY back through the last several years (HRA claims are often filed for past years).
export function financialYearOptions(now = new Date()): number[] {
  const cur = currentFyStartYear(now);
  const out: number[] = [];
  for (let y = cur; y >= cur - 6; y--) out.push(y);
  return out;
}

export function defaultRentReceiptData(): RentReceiptData {
  const fy = currentFyStartYear();
  const { start, end } = fyRange(fy);
  return {
    tenantName: "",
    landlordName: "",
    landlordPan: "",
    propertyAddress: "",
    monthlyRent: 15000,
    paymentMode: "Bank Transfer",
    periodMode: "fy",
    startMonth: start,
    endMonth: end,
    receiptStartNumber: 1,
    landlordSignature: "",
  };
}

function monthsBetween(start: string, end: string): string[] {
  // Inclusive on both ends; "YYYY-MM" strings
  if (!start || !end) return [];
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return [];
  const startIdx = sy * 12 + (sm - 1);
  const endIdx = ey * 12 + (em - 1);
  if (endIdx < startIdx) return [];
  const result: string[] = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const y = Math.floor(i / 12);
    const m = (i % 12) + 1;
    result.push(`${y}-${String(m).padStart(2, "0")}`);
  }
  return result;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function lastDayOfMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return "";
  const last = new Date(y, m, 0);
  return last.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  data: RentReceiptData;
  setData: (d: RentReceiptData) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function RentReceiptForm({ data, setData, onGenerate, generating }: Props) {
  const months = useMemo(
    () => monthsBetween(data.startMonth, data.endMonth),
    [data.startMonth, data.endMonth],
  );
  const totalReceipts = months.length;
  const totalAmount = totalReceipts * (data.monthlyRent || 0);

  const tenantRef = useRef<HTMLInputElement>(null);
  const landlordRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const rentRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof RentReceiptData>(field: K, value: RentReceiptData[K]) => {
    setData({ ...data, [field]: value });
  };

  const focusAndScroll = (
    el: HTMLInputElement | HTMLTextAreaElement | null,
  ) => {
    if (!el) return;
    el.focus();
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-800">
        <strong>Tip:</strong> For HRA claim under Section 10(13A), revenue stamp + landlord signature is required if monthly rent exceeds ₹3,000 in cash. Bank transfers don&apos;t need stamps. PAN is required if annual rent exceeds ₹1 lakh.
      </div>

      {/* Tenant + Landlord */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tenant Name *</label>
          <input
            ref={tenantRef}
            type="text"
            value={data.tenantName}
            onChange={(e) => update("tenantName", e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Landlord Name *</label>
          <input
            ref={landlordRef}
            type="text"
            value={data.landlordName}
            onChange={(e) => update("landlordName", e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Landlord's full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Landlord PAN <span className="text-gray-400 font-normal">(required if annual rent &gt; ₹1 lakh)</span>
        </label>
        <input
          ref={panRef}
          type="text"
          value={data.landlordPan}
          onChange={(e) => update("landlordPan", e.target.value.toUpperCase())}
          onFocus={(e) => e.target.select()}
          placeholder="ABCDE1234F"
          maxLength={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Property Address *</label>
        <textarea
          ref={addressRef}
          value={data.propertyAddress}
          onChange={(e) => update("propertyAddress", e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Flat 304, Sky Tower, MG Road, Bangalore — 560001"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Rent + Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Rent (₹) *</label>
          <input
            ref={rentRef}
            type="number"
            value={data.monthlyRent || ""}
            onChange={(e) => update("monthlyRent", Number(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            min={0}
            placeholder="15000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Payment Mode</label>
          <select
            value={data.paymentMode}
            onChange={(e) => update("paymentMode", e.target.value as RentReceiptData["paymentMode"])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
      </div>

      {/* Period */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Receipt Period *</label>

        {/* Whole financial year vs custom range toggle */}
        <div className="inline-flex p-1 bg-gray-100 rounded-lg mb-3">
          <button
            type="button"
            onClick={() =>
              setData({
                ...data,
                periodMode: "fy",
                ...fyRange(fyStartFromMonth(data.startMonth)),
              })
            }
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              data.periodMode === "fy"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Whole Financial Year
          </button>
          <button
            type="button"
            onClick={() => update("periodMode", "custom")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              data.periodMode === "custom"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Custom Range
          </button>
        </div>

        {data.periodMode === "fy" ? (
          <div>
            <select
              value={fyStartFromMonth(data.startMonth)}
              onChange={(e) => {
                const y = Number(e.target.value);
                setData({ ...data, ...fyRange(y) });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {financialYearOptions().map((y) => (
                <option key={y} value={y}>
                  FY {y}–{String((y + 1) % 100).padStart(2, "0")} (Apr {y} – Mar {y + 1})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              Generates 12 monthly receipts, April {fyStartFromMonth(data.startMonth)} to March{" "}
              {fyStartFromMonth(data.startMonth) + 1}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From Month *</label>
              <input
                type="month"
                value={data.startMonth}
                onChange={(e) => update("startMonth", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To Month *</label>
              <input
                type="month"
                value={data.endMonth}
                onChange={(e) => update("endMonth", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Starting Receipt Number
        </label>
        <input
          type="number"
          value={data.receiptStartNumber || 1}
          onChange={(e) => update("receiptStartNumber", Math.max(1, Number(e.target.value) || 1))}
          onFocus={(e) => e.target.select()}
          min={1}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Receipt numbers will increment from this value (e.g. R-001, R-002 …)
        </p>
      </div>

      {/* Landlord signature (optional) — appears on every receipt */}
      <div>
        <SignaturePad
          signature={data.landlordSignature}
          onChange={(dataUrl) => update("landlordSignature", dataUrl)}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Optional. The landlord&apos;s signature is placed above the signature line on every receipt.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[11px] text-gray-500">Receipts</p>
            <p className="text-xl font-bold text-blue-700">{totalReceipts}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Per month</p>
            <p className="text-xl font-bold text-blue-700">₹{(data.monthlyRent || 0).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Total period</p>
            <p className="text-xl font-bold text-emerald-700">₹{totalAmount.toLocaleString("en-IN")}</p>
          </div>
        </div>
        {totalReceipts > 0 && data.monthlyRent > 0 && (
          <p className="mt-3 text-[11px] text-gray-500 text-center">
            From {monthLabel(data.startMonth)} to {monthLabel(data.endMonth)}
            {totalAmount * 1 >= 100000 && !data.landlordPan
              ? " · Landlord PAN required (annual rent ≥ ₹1 lakh)"
              : ""}
          </p>
        )}
        {totalReceipts > 0 && data.monthlyRent > 0 && (
          <p className="mt-1 text-[11px] text-gray-400 text-center italic">
            {numberToIndianWords(totalAmount)} Rupees Only
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (!data.tenantName.trim()) {
            toast.error("Please enter the tenant name.");
            focusAndScroll(tenantRef.current);
            return;
          }
          if (!data.landlordName.trim()) {
            toast.error("Please enter the landlord name.");
            focusAndScroll(landlordRef.current);
            return;
          }
          if (!data.propertyAddress.trim()) {
            toast.error("Please enter the property address.");
            focusAndScroll(addressRef.current);
            return;
          }
          if (!data.monthlyRent || data.monthlyRent <= 0) {
            toast.error("Enter a valid monthly rent amount.");
            focusAndScroll(rentRef.current);
            return;
          }
          if (totalAmount >= 100000 && !data.landlordPan.trim()) {
            toast.error("Landlord PAN is required when annual rent ≥ ₹1 lakh.");
            focusAndScroll(panRef.current);
            return;
          }
          if (totalReceipts === 0) {
            toast.error("Please pick a valid From/To month range.");
            return;
          }
          onGenerate();
        }}
        disabled={generating}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "Generating PDF…" : `Download ${totalReceipts} receipt${totalReceipts === 1 ? "" : "s"} as PDF`}
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

export { STORAGE_KEY as RENT_RECEIPT_STORAGE_KEY, monthsBetween, monthLabel, lastDayOfMonth };
