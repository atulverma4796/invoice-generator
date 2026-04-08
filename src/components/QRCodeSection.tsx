"use client";

import { useState, useEffect, useCallback } from "react";

interface QRCodeSectionProps {
  qrCodeData: string;
  onChange: (data: string) => void;
  currency: string;
  senderName: string;
}

// Countries where QR payment is commonly used
const QR_RELEVANT_CURRENCIES = new Set([
  "INR",  // India — UPI
  "CNY",  // China — WeChat/Alipay
  "SGD",  // Singapore — PayNow
  "THB",  // Thailand — PromptPay
  "BRL",  // Brazil — PIX
  "IDR",  // Indonesia — QRIS
  "MYR",  // Malaysia — DuitNow
  "SAR",  // Saudi Arabia — ZATCA mandates QR
  "PHP",  // Philippines — GCash/Maya
  "KRW",  // South Korea — Kakao Pay
]);

// Currency-specific presets — show relevant ones first
interface QRPreset {
  label: string;
  template: (name: string) => string;
  currencies?: string[]; // show only for these currencies, undefined = always
}

const QR_PRESETS: QRPreset[] = [
  { label: "UPI", template: (name) => `upi://pay?pa=&pn=${encodeURIComponent(name)}&cu=INR`, currencies: ["INR"] },
  { label: "PIX", template: () => "pix:", currencies: ["BRL"] },
  { label: "PromptPay", template: () => "promptpay:", currencies: ["THB"] },
  { label: "PayNow", template: () => "paynow:", currencies: ["SGD"] },
  { label: "DuitNow", template: () => "duitnow:", currencies: ["MYR"] },
  { label: "QRIS", template: () => "", currencies: ["IDR"] },
  { label: "PayPal.me", template: () => "https://paypal.me/" },
  { label: "Wise", template: () => "https://wise.com/pay/" },
  { label: "Website / Link", template: () => "https://" },
];

export default function QRCodeSection({ qrCodeData, onChange, currency, senderName }: QRCodeSectionProps) {
  const [qrImage, setQrImage] = useState<string>("");
  const [error, setError] = useState("");
  const isQRCountry = QR_RELEVANT_CURRENCIES.has(currency);
  const [expanded, setExpanded] = useState(!!qrCodeData || isQRCountry);

  // Auto-expand when switching to a QR-relevant country
  useEffect(() => {
    if (isQRCountry) setExpanded(true);
  }, [isQRCountry]);

  const generateQR = useCallback(async (data: string) => {
    if (!data.trim()) {
      setQrImage("");
      setError("");
      return;
    }
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      setQrImage(url);
      setError("");
    } catch {
      setQrImage("");
      setError("Could not generate QR code. Check your input.");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => generateQR(qrCodeData), 300);
    return () => clearTimeout(timer);
  }, [qrCodeData, generateQR]);

  // Filter presets: show currency-specific ones + universal ones
  const relevantPresets = QR_PRESETS.filter(
    (p) => !p.currencies || p.currencies.includes(currency)
  );

  // If not a QR country and no data, show a subtle toggle
  if (!expanded && !qrCodeData) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full text-left px-3 py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
      >
        + Add Payment QR Code <span className="text-gray-300">(Optional — for UPI, PIX, PayPal, etc.)</span>
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Payment QR Code
          {!isQRCountry && <span className="text-gray-400 text-xs font-normal ml-1">(Optional)</span>}
          {isQRCountry && <span className="text-green-600 text-xs font-normal ml-1">(Recommended for {currency})</span>}
        </label>
        {qrCodeData && (
          <button
            type="button"
            onClick={() => { onChange(""); setExpanded(isQRCountry); }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isQRCountry && (
        <p className="text-xs text-green-600/70 mb-2">
          {currency === "INR" && "QR codes are widely used for UPI payments in India. Add your UPI ID to get paid instantly."}
          {currency === "BRL" && "PIX QR codes are the standard payment method in Brazil."}
          {currency === "SAR" && "ZATCA requires QR codes on tax invoices in Saudi Arabia."}
          {currency === "THB" && "PromptPay QR is the standard for payments in Thailand."}
          {currency === "SGD" && "PayNow QR is commonly used for payments in Singapore."}
          {currency === "IDR" && "QRIS is the national QR payment standard in Indonesia."}
          {currency === "MYR" && "DuitNow QR is widely used for payments in Malaysia."}
          {!["INR", "BRL", "SAR", "THB", "SGD", "IDR", "MYR"].includes(currency) && "QR payments are popular in your selected region."}
        </p>
      )}

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {relevantPresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.template(senderName))}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border-2 border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <textarea
            value={qrCodeData}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              currency === "INR" ? "e.g. upi://pay?pa=yourname@upi&pn=YourName&cu=INR" :
              currency === "BRL" ? "e.g. pix:your-pix-key" :
              "e.g. https://paypal.me/you or any payment link"
            }
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* QR Preview */}
        {qrImage && (
          <div className="shrink-0 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
            <img src={qrImage} alt="Payment QR" className="w-24 h-24" />
            <p className="text-[9px] text-gray-400 text-center mt-1">Scan to pay</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export a helper to generate QR as data URL for PDF/Preview
// Lazy-loads qrcode lib only when called — keeps it out of the main bundle
export async function generateQRDataURL(data: string): Promise<string> {
  if (!data.trim()) return "";
  try {
    const QRCode = (await import("qrcode")).default;
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
  } catch {
    return "";
  }
}
