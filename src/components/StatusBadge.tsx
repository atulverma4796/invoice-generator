"use client";

import { useState } from "react";
import { InvoiceStatus } from "@/types/invoice";

interface StatusBadgeProps {
  status: InvoiceStatus;
  onChange: (status: InvoiceStatus) => void;
}

const PRESET_STATUSES = ["none", "draft", "pending", "paid", "overdue"] as const;

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  none: { label: "No Status", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
  pending: { label: "Pending", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  paid: { label: "Paid", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  overdue: { label: "Overdue", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  none: { bg: "transparent", text: "transparent" },
  draft: { bg: "#f3f4f6", text: "#374151" },
  pending: { bg: "#fef9c3", text: "#a16207" },
  paid: { bg: "#dcfce7", text: "#15803d" },
  overdue: { bg: "#fee2e2", text: "#b91c1c" },
};

export function getStatusColors(status: string): { bg: string; text: string } {
  return STATUS_COLORS[status] || { bg: "#ede9fe", text: "#6d28d9" };
}

export default function StatusBadge({ status, onChange }: StatusBadgeProps) {
  const isCustom = !PRESET_STATUSES.includes(status as typeof PRESET_STATUSES[number]);
  const [customInput, setCustomInput] = useState(isCustom ? status : "");
  const [showCustom, setShowCustom] = useState(isCustom);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Invoice Status
      </label>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setShowCustom(false);
                setCustomInput("");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                status === s
                  ? `${cfg.bg} ${cfg.text} border-current`
                  : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}

        {/* Custom status button / input */}
        {showCustom ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customInput.trim()) {
                  onChange(customInput.trim().toLowerCase());
                }
              }}
              onBlur={() => {
                if (customInput.trim()) {
                  onChange(customInput.trim().toLowerCase());
                }
              }}
              placeholder="e.g. cancelled"
              maxLength={20}
              className="px-3 py-1.5 border border-purple-300 rounded-full text-xs w-28 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                if (customInput.trim()) {
                  onChange(customInput.trim().toLowerCase());
                } else {
                  setShowCustom(false);
                }
              }}
              className="text-xs text-purple-600 font-medium hover:text-purple-700"
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustom(false);
                setCustomInput("");
                onChange("none");
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
              isCustom
                ? "border-purple-400 bg-purple-50 text-purple-700"
                : "border-dashed border-gray-300 text-gray-400 hover:border-purple-300 hover:text-purple-500"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCustom ? "bg-purple-500" : "bg-gray-300"}`} />
            {isCustom ? status.charAt(0).toUpperCase() + status.slice(1) : "Custom..."}
          </button>
        )}
      </div>
    </div>
  );
}
