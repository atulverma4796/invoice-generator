"use client";

import { LineItem } from "@/types/invoice";
import { getCurrencySymbol } from "@/lib/defaultInvoice";

interface LineItemRowProps {
  item: LineItem;
  currency: string;
  onUpdate: (id: string, field: keyof LineItem, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export default function LineItemRow({
  item,
  currency,
  onUpdate,
  onRemove,
  canRemove,
}: LineItemRowProps) {
  const symbol = getCurrencySymbol(currency);

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-5">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate(item.id, "description", e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Item description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          value={item.quantity || ""}
          onChange={(e) => onUpdate(item.id, "quantity", parseFloat(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
          placeholder="Qty"
          min="0"
          step="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          value={item.rate || ""}
          onChange={(e) => onUpdate(item.id, "rate", parseFloat(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
          placeholder="Rate"
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="col-span-2 text-right text-sm font-medium text-gray-700 px-2">
        {symbol}{item.amount.toFixed(2)}
      </div>
      <div className="col-span-1 text-center">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={!canRemove}
          className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Remove item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
