"use client";

import { PaymentInfo } from "@/types/invoice";

interface PaymentFieldsProps {
  data: PaymentInfo;
  onChange: (data: PaymentInfo) => void;
}

export default function PaymentFields({ data, onChange }: PaymentFieldsProps) {
  function update<K extends keyof PaymentInfo>(field: K, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank & Payment Info <span className="text-gray-400 font-normal normal-case">(All fields optional)</span></h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
          <input type="text" value={data.bankName} onChange={(e) => update("bankName", e.target.value)} placeholder="e.g. Chase Bank" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Account Name</label>
          <input type="text" value={data.accountName} onChange={(e) => update("accountName", e.target.value)} placeholder="Account holder name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
          <input type="text" value={data.accountNumber} onChange={(e) => update("accountNumber", e.target.value)} placeholder="XXXX-XXXX-XXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Routing / IFSC</label>
          <input type="text" value={data.routingNumber} onChange={(e) => update("routingNumber", e.target.value)} placeholder="Routing or IFSC code" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SWIFT / BIC Code</label>
          <input type="text" value={data.swiftCode} onChange={(e) => update("swiftCode", e.target.value)} placeholder="For international transfers" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">PayPal Email</label>
          <input type="email" value={data.paypalEmail} onChange={(e) => update("paypalEmail", e.target.value)} placeholder="paypal@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Additional Payment Info</label>
        <input type="text" value={data.customField} onChange={(e) => update("customField", e.target.value)} placeholder="e.g. UPI ID, Wise, Crypto address, etc." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
      </div>
    </div>
  );
}
