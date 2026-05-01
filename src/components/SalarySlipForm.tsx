"use client";

import { useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { numberToIndianWords } from "@/lib/numberToWords";

export interface PayLine {
  id: string;
  label: string;
  amount: number;
}

export interface SalarySlipData {
  // Employer
  companyName: string;
  companyAddress: string;
  companyEmail: string;

  // Employee
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string;
  employeePan: string;
  bankAccount: string;
  bankName: string;

  // Period
  payMonth: string; // YYYY-MM
  workingDays: number;
  presentDays: number;
  paidLeave: number;

  earnings: PayLine[];
  deductions: PayLine[];

  notes: string;
  currencySymbol: string; // "₹", "$", etc.
}

const STORAGE_KEY = "salary_slip_form_v1";

function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

function newLine(label = "", amount = 0): PayLine {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    amount,
  };
}

export function defaultSalarySlipData(): SalarySlipData {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return {
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    employeeName: "",
    employeeId: "",
    designation: "",
    department: "",
    joiningDate: isoToday(),
    employeePan: "",
    bankAccount: "",
    bankName: "",
    payMonth: `${yyyy}-${mm}`,
    workingDays: 30,
    presentDays: 30,
    paidLeave: 0,
    earnings: [
      newLine("Basic", 30000),
      newLine("HRA", 12000),
      newLine("Conveyance Allowance", 1600),
      newLine("Medical Allowance", 1250),
      newLine("Special Allowance", 5150),
    ],
    deductions: [
      newLine("Provident Fund", 1800),
      newLine("Professional Tax", 200),
      newLine("Income Tax (TDS)", 0),
    ],
    notes: "This is a system-generated payslip and does not require a signature.",
    currencySymbol: "₹",
  };
}

function formatPeriod(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

interface Props {
  data: SalarySlipData;
  setData: (d: SalarySlipData) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function SalarySlipForm({ data, setData, onGenerate, generating }: Props) {
  const [savedToast, setSavedToast] = useState(false);
  void savedToast;

  const companyRef = useRef<HTMLInputElement>(null);
  const employeeRef = useRef<HTMLInputElement>(null);
  const designationRef = useRef<HTMLInputElement>(null);

  const focusAndScroll = (el: HTMLInputElement | null) => {
    if (!el) return;
    el.focus();
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const totals = useMemo(() => {
    const grossEarnings = data.earnings.reduce((s, l) => s + (l.amount || 0), 0);
    const totalDeductions = data.deductions.reduce((s, l) => s + (l.amount || 0), 0);
    const netPay = grossEarnings - totalDeductions;
    return { grossEarnings, totalDeductions, netPay };
  }, [data.earnings, data.deductions]);

  const update = <K extends keyof SalarySlipData>(field: K, value: SalarySlipData[K]) => {
    setData({ ...data, [field]: value });
  };

  const updateLine = (
    list: "earnings" | "deductions",
    id: string,
    field: keyof PayLine,
    value: string | number,
  ) => {
    setData({
      ...data,
      [list]: data[list].map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    });
  };

  const addLine = (list: "earnings" | "deductions") => {
    setData({ ...data, [list]: [...data[list], newLine()] });
  };

  const removeLine = (list: "earnings" | "deductions", id: string) => {
    setData({ ...data, [list]: data[list].filter((l) => l.id !== id) });
  };

  const validateAndFocus = (): boolean => {
    if (!data.companyName.trim()) {
      toast.error("Please enter the company name.");
      focusAndScroll(companyRef.current);
      return false;
    }
    if (!data.employeeName.trim()) {
      toast.error("Please enter the employee name.");
      focusAndScroll(employeeRef.current);
      return false;
    }
    if (!data.designation.trim()) {
      toast.error("Please enter the employee designation.");
      focusAndScroll(designationRef.current);
      return false;
    }
    if (totals.netPay < 0) {
      toast.error("Total deductions are higher than gross earnings — please review the amounts.");
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-800">
        A <strong>salary slip / payslip</strong> is the monthly statement employers issue to employees showing earnings, deductions, and net pay. It is the legal proof of salary used for loans, visas, tax filing, and credit card applications. All inputs are private and stay in your browser.
      </div>

      {/* Currency + Pay period + Working days */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
          <select
            value={data.currencySymbol}
            onChange={(e) => update("currencySymbol", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="₹">INR (₹)</option>
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
            <option value="A$">AUD (A$)</option>
            <option value="C$">CAD (C$)</option>
            <option value="AED">AED</option>
            <option value="S$">SGD (S$)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Pay Period</label>
          <input
            type="month"
            value={data.payMonth}
            onChange={(e) => update("payMonth", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Working Days</label>
          <input
            type="number"
            value={data.workingDays || ""}
            onChange={(e) => update("workingDays", Number(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            min={1}
            max={31}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Days Present</label>
          <input
            type="number"
            value={data.presentDays || ""}
            onChange={(e) => update("presentDays", Number(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            min={0}
            max={31}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Company */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Employer / Company</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            ref={companyRef}
            type="text"
            placeholder="Company name *"
            value={data.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="HR / company email"
            value={data.companyEmail}
            onChange={(e) => update("companyEmail", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Company address"
          value={data.companyAddress}
          onChange={(e) => update("companyAddress", e.target.value)}
          onFocus={(e) => e.target.select()}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Employee */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Employee</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            ref={employeeRef}
            type="text"
            placeholder="Employee name *"
            value={data.employeeName}
            onChange={(e) => update("employeeName", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Employee ID (e.g., EMP-1024)"
            value={data.employeeId}
            onChange={(e) => update("employeeId", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            ref={designationRef}
            type="text"
            placeholder="Designation *"
            value={data.designation}
            onChange={(e) => update("designation", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Department"
            value={data.department}
            onChange={(e) => update("department", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date of Joining</label>
            <input
              type="date"
              value={data.joiningDate}
              onChange={(e) => update("joiningDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PAN (Optional)</label>
            <input
              type="text"
              value={data.employeePan}
              onChange={(e) => update("employeePan", e.target.value.toUpperCase())}
              onFocus={(e) => e.target.select()}
              maxLength={10}
              placeholder="ABCDE1234F"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
            <input
              type="text"
              value={data.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <input
          type="text"
          placeholder="Bank account number (Optional)"
          value={data.bankAccount}
          onChange={(e) => update("bankAccount", e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Earnings + Deductions side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Earnings</h3>
            <button
              type="button"
              onClick={() => addLine("earnings")}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {data.earnings.map((l) => (
              <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={l.label}
                  onChange={(e) => updateLine("earnings", l.id, "label", e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Label"
                  className="col-span-7 px-2 py-1.5 border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
                <input
                  type="number"
                  value={l.amount || ""}
                  onChange={(e) => updateLine("earnings", l.id, "amount", parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  min={0}
                  step={0.01}
                  className="col-span-4 px-2 py-1.5 border border-emerald-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeLine("earnings", l.id)}
                  disabled={data.earnings.length <= 1}
                  className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200 flex justify-between text-sm">
            <span className="font-semibold text-emerald-800">Gross Earnings</span>
            <span className="font-bold text-emerald-800">
              {data.currencySymbol}{totals.grossEarnings.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">Deductions</h3>
            <button
              type="button"
              onClick={() => addLine("deductions")}
              className="text-xs font-semibold text-red-700 hover:text-red-900"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {data.deductions.map((l) => (
              <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={l.label}
                  onChange={(e) => updateLine("deductions", l.id, "label", e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Label"
                  className="col-span-7 px-2 py-1.5 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                />
                <input
                  type="number"
                  value={l.amount || ""}
                  onChange={(e) => updateLine("deductions", l.id, "amount", parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  min={0}
                  step={0.01}
                  className="col-span-4 px-2 py-1.5 border border-red-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeLine("deductions", l.id)}
                  disabled={data.deductions.length <= 1}
                  className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-red-200 flex justify-between text-sm">
            <span className="font-semibold text-red-800">Total Deductions</span>
            <span className="font-bold text-red-800">
              {data.currencySymbol}{totals.totalDeductions.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-100">Net Pay for {formatPeriod(data.payMonth)}</p>
            <p className="text-3xl sm:text-4xl font-extrabold mt-1">
              {data.currencySymbol}{totals.netPay.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-blue-100">Days</p>
            <p className="text-lg font-bold">
              {data.presentDays}/{data.workingDays}
              {data.paidLeave > 0 ? ` + ${data.paidLeave} PL` : ""}
            </p>
          </div>
        </div>
        {totals.netPay > 0 && data.currencySymbol === "₹" && (
          <p className="mt-3 text-xs text-blue-200 italic">
            {numberToIndianWords(totals.netPay)} Rupees Only
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Footer note</label>
        <textarea
          value={data.notes}
          onChange={(e) => update("notes", e.target.value)}
          onFocus={(e) => e.target.select()}
          rows={2}
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
        {generating ? "Generating PDF…" : "Download Salary Slip as PDF"}
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

export { STORAGE_KEY as SALARY_SLIP_STORAGE_KEY, formatPeriod };
