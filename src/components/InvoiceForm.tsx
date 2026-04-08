"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { InvoiceData, LineItem, SavedClient } from "@/types/invoice";
import { calculateLineAmount } from "@/lib/calculations";
import { CURRENCIES, getTermsForWatermark, getTermsPresetsForWatermark } from "@/lib/defaultInvoice";
import { validateInvoice, getCountryRule, getComplianceNote, ValidationErrors, COUNTRIES } from "@/lib/validation";
import { LANGUAGES, getTaxLabelForCurrency } from "@/lib/languages";
import LineItemRow from "./LineItemRow";
import TemplateSelector from "./TemplateSelector";
import LogoUpload from "./LogoUpload";
import SignaturePad from "./SignaturePad";
import PaymentFields from "./PaymentFields";
import StatusBadge from "./StatusBadge";
import QRCodeSection from "./QRCodeSection";

const CLIENTS_STORAGE_KEY = "invoicegen_saved_clients";
const CATALOG_STORAGE_KEY = "invoicegen_product_catalog";

interface CatalogItem {
  id: string;
  description: string;
  rate: number;
}

function getSavedClients(): SavedClient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getSavedCatalog(): CatalogItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const TAX_LABEL_OPTIONS = ["Tax", "VAT", "GST", "GST/HST", "IVA", "SST", "PPN", "KDV", "Moms", "MVA", "ICMS", "Sales Tax"];

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  showErrors?: boolean;
}

const WATERMARK_PRESETS = ["", "PAID", "DRAFT", "CONFIDENTIAL", "COPY", "VOID", "SAMPLE"];

function RequiredStar() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

function OptionalTag() {
  return <span className="text-gray-400 text-xs font-normal ml-1">(Optional)</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
}

export { validateInvoice } from "@/lib/validation";

export default function InvoiceForm({ data, onChange, showErrors = false }: InvoiceFormProps) {
  const errors: ValidationErrors = showErrors ? validateInvoice(data) : {};
  const rule = getCountryRule(data.currency);
  const complianceNote = getComplianceNote(data.currency);
  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  useEffect(() => {
    setSavedClients(getSavedClients());
    setCatalog(getSavedCatalog());
  }, []);

  function update<K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) {
    onChange({ ...data, [field]: value });
  }

  function handleCurrencyChange(currency: string) {
    onChange({ ...data, currency, taxLabel: getTaxLabelForCurrency(currency) });
  }

  function handleCountryChange(countryCode: string) {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (country) {
      onChange({ ...data, currency: country.currency, taxLabel: getTaxLabelForCurrency(country.currency) });
    }
  }

  function saveClient() {
    if (!data.clientName.trim()) { toast.error("Enter a client name before saving."); return; }
    const client: SavedClient = {
      id: crypto.randomUUID(),
      name: data.clientName,
      email: data.clientEmail,
      address: data.clientAddress,
      taxId: data.clientTaxId,
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedClients.filter((c) => c.name !== client.name), client].slice(-20);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updated));
    setSavedClients(updated);
    toast.success(`Client "${client.name}" saved!`);
  }

  function loadClient(client: SavedClient) {
    onChange({ ...data, clientName: client.name, clientEmail: client.email, clientAddress: client.address, clientTaxId: client.taxId });
    toast.success(`Loaded "${client.name}"`);
  }

  function deleteClient(id: string) {
    const updated = savedClients.filter((c) => c.id !== id);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updated));
    setSavedClients(updated);
    toast.success("Client removed");
  }

  function saveItemToCatalog(description: string, rate: number) {
    if (!description.trim() || rate <= 0) return;
    const exists = catalog.some((c) => c.description === description);
    if (exists) return; // already saved
    const item: CatalogItem = { id: crypto.randomUUID(), description, rate };
    const updated = [...catalog, item].slice(-50);
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
    setCatalog(updated);
    toast.success(`"${description}" saved to catalog`);
  }

  function addFromCatalog(catalogItem: CatalogItem) {
    const newItem = {
      id: crypto.randomUUID(),
      description: catalogItem.description,
      quantity: 1,
      rate: catalogItem.rate,
      amount: catalogItem.rate,
    };
    update("lineItems", [...data.lineItems, newItem]);
  }

  function removeCatalogItem(id: string) {
    const updated = catalog.filter((c) => c.id !== id);
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
    setCatalog(updated);
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    const items = data.lineItems.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "rate") {
        updated.amount = calculateLineAmount(updated.quantity, updated.rate);
      }
      return updated;
    });
    update("lineItems", items);
  }

  function addLineItem() {
    update("lineItems", [
      ...data.lineItems,
      { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  }

  function removeLineItem(id: string) {
    if (data.lineItems.length <= 1) return;
    update("lineItems", data.lineItems.filter((item) => item.id !== id));
  }

  const errBorder = "border-red-300 focus:ring-red-500";
  const okBorder = "border-gray-300 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      {/* ── Customize Appearance (collapsible) ── */}
      <details className="group border border-gray-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 cursor-pointer select-none hover:from-indigo-100 hover:to-purple-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Customize Appearance</h3>
              <p className="text-[11px] text-gray-400">Template, colors, fonts, status badge, watermark</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </summary>
        <div className="px-5 pb-5 pt-3 space-y-6 border-t border-indigo-100 bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
          {/* Template & Color Customization */}
          <TemplateSelector
            selected={data.template}
            customStyle={data.customStyle}
            onSelect={(id, style) => onChange({ ...data, template: id, customStyle: style })}
            onCustomStyleChange={(s) => update("customStyle", s)}
          />

          {/* Status Badge */}
          <StatusBadge status={data.status} onChange={(s) => update("status", s)} />

          {/* Watermark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Watermark<OptionalTag />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WATERMARK_PRESETS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    onChange({ ...data, watermark: w, terms: getTermsForWatermark(w) });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                    data.watermark === w
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {w || "None"}
                </button>
              ))}
              <input
                type="text"
                value={WATERMARK_PRESETS.includes(data.watermark) ? "" : data.watermark}
                onChange={(e) => update("watermark", e.target.value.toUpperCase())}
                placeholder="Custom..."
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
              />
            </div>
          </div>
        </div>
      </details>

      {/* ── Invoice Details + Logo (compact row) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Invoice Details</h3>
          <LogoUpload logo={data.logo} onChange={(v) => update("logo", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number<RequiredStar /></label>
            <input
              type="text"
              value={data.invoiceNumber}
              onChange={(e) => update("invoiceNumber", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${errors.invoiceNumber ? errBorder : okBorder}`}
            />
            <FieldError message={errors.invoiceNumber} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Number<OptionalTag /></label>
            <input
              type="text"
              value={data.poNumber}
              onChange={(e) => update("poNumber", e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Country, Currency, Language & Dates */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            value={COUNTRIES.find((c) => c.currency === data.currency)?.code ?? ""}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400 mt-0.5">Auto-sets currency, tax label &amp; validation</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency<RequiredStar /></label>
          <select
            value={data.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Language</label>
          <select
            value={data.language}
            onChange={(e) => update("language", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400 mt-0.5">Translates labels on the PDF &amp; preview</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date<RequiredStar /></label>
          <input
            type="date"
            value={data.invoiceDate}
            onChange={(e) => update("invoiceDate", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${errors.invoiceDate ? errBorder : okBorder}`}
          />
          <FieldError message={errors.invoiceDate} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date<RequiredStar /></label>
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${errors.dueDate ? errBorder : okBorder}`}
          />
          <FieldError message={errors.dueDate} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Label</label>
          <select
            value={data.taxLabel}
            onChange={(e) => update("taxLabel", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {TAX_LABEL_OPTIONS.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400 mt-0.5">Auto-set by country</p>
        </div>
      </div>

      {/* Country Compliance Note */}
      {complianceNote && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed">{complianceNote}</p>
        </div>
      )}

      {/* From / To */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            From (Your Details)
          </h3>
          <div>
            <input type="text" placeholder="Your name / Business name *" value={data.senderName} onChange={(e) => update("senderName", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${errors.senderName ? errBorder : okBorder}`} />
            <FieldError message={errors.senderName} />
          </div>
          <input type="email" placeholder="Email (Optional)" value={data.senderEmail} onChange={(e) => update("senderEmail", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div className="grid grid-cols-2 gap-2">
            <input type="tel" placeholder="Phone (Optional)" value={data.senderPhone} onChange={(e) => update("senderPhone", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input type="text" placeholder="Website (Optional)" value={data.senderWebsite} onChange={(e) => update("senderWebsite", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <input
              type="text"
              placeholder={`${rule.taxIdLabel}${rule.taxIdRequired ? " *" : " (Optional)"}`}
              value={data.senderTaxId}
              onChange={(e) => update("senderTaxId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${errors.senderTaxId ? errBorder : okBorder}`}
            />
            <FieldError message={errors.senderTaxId} />
          </div>
          <div>
            <textarea placeholder={`Address${rule.senderAddressRequired ? " *" : " (Optional)"}`} value={data.senderAddress} onChange={(e) => update("senderAddress", e.target.value)} rows={2} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent resize-none ${errors.senderAddress ? errBorder : okBorder}`} />
            <FieldError message={errors.senderAddress} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              To (Client Details)
            </h3>
            {savedClients.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  const client = savedClients.find((c) => c.id === e.target.value);
                  if (client) loadClient(client);
                }}
                className="px-2 py-1 border border-blue-200 bg-blue-50 rounded-lg text-xs text-blue-600 font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Load saved client...</option>
                {savedClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <input type="text" placeholder="Client name / Business name *" value={data.clientName} onChange={(e) => update("clientName", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${errors.clientName ? errBorder : okBorder}`} />
            <FieldError message={errors.clientName} />
          </div>
          <input type="email" placeholder="Client email (Optional)" value={data.clientEmail} onChange={(e) => update("clientEmail", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div>
            <textarea placeholder={`Client address${rule.clientAddressRequired ? " *" : " (Optional)"}`} value={data.clientAddress} onChange={(e) => update("clientAddress", e.target.value)} rows={2} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent resize-none ${errors.clientAddress ? errBorder : okBorder}`} />
            <FieldError message={errors.clientAddress} />
          </div>
          <input
            type="text"
            placeholder={`${rule.clientTaxIdLabel}${rule.clientTaxIdRequired ? " *" : " (Optional)"}`}
            value={data.clientTaxId}
            onChange={(e) => update("clientTaxId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button type="button" onClick={saveClient} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Save Client
            </button>
            {savedClients.length > 0 && (
              <select
                value=""
                onChange={(e) => { if (e.target.value) deleteClient(e.target.value); }}
                className="px-2 py-1 border border-red-200 bg-red-50 rounded-lg text-xs text-red-600 font-medium"
              >
                <option value="">Delete client...</option>
                {savedClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Items<RequiredStar />
        </h3>

        {/* Product Catalog Bar — always visible */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            {catalog.length === 0 ? (
              <p className="text-xs text-blue-600">
                <span className="font-medium">Product Catalog</span>
                <span className="text-blue-400 ml-1">— Add items below, then save to reuse across invoices</span>
              </p>
            ) : (
              <select
                value=""
                onChange={(e) => {
                  const item = catalog.find((c) => c.id === e.target.value);
                  if (item) addFromCatalog(item);
                }}
                className="px-2 py-1 border border-blue-200 bg-white rounded-lg text-xs text-blue-700 font-medium focus:ring-2 focus:ring-blue-500 min-w-[160px]"
              >
                <option value="">+ Add from catalog ({catalog.length} saved)...</option>
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>{c.description} — {data.currency} {c.rate}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {data.lineItems.some((item) => item.description.trim() && item.rate > 0) && (
              <button
                type="button"
                onClick={() => {
                  let saved = 0;
                  data.lineItems.forEach((item) => {
                    if (item.description.trim() && item.rate > 0) {
                      const exists = catalog.some((c) => c.description === item.description);
                      if (!exists) { saveItemToCatalog(item.description, item.rate); saved++; }
                    }
                  });
                  if (saved === 0) toast("All items already in catalog", { icon: "ℹ️" });
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Save to Catalog
              </button>
            )}
            {catalog.length > 0 && (
              <select
                value=""
                onChange={(e) => { if (e.target.value) removeCatalogItem(e.target.value); }}
                className="px-2 py-1 border border-red-200 bg-white rounded-lg text-[10px] text-red-500 font-medium"
              >
                <option value="">Remove...</option>
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>{c.description}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase px-1">
          <div className="col-span-5">Description<RequiredStar /></div>
          <div className="col-span-2 text-right">Quantity<RequiredStar /></div>
          <div className="col-span-2 text-right">Rate<RequiredStar /></div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1" />
        </div>
        {data.lineItems.map((item, index) => (
          <div key={item.id}>
            <LineItemRow
              item={item}
              currency={data.currency}
              onUpdate={updateLineItem}
              onRemove={removeLineItem}
              canRemove={data.lineItems.length > 1}
            />
            {errors[`item_${index}_desc`] && <FieldError message={errors[`item_${index}_desc`]} />}
            {errors[`item_${index}_rate`] && <FieldError message={errors[`item_${index}_rate`]} />}
          </div>
        ))}
        {errors.lineItems && <FieldError message={errors.lineItems} />}
        <button
          type="button"
          onClick={addLineItem}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Tax, Discount, Shipping & Late Fee */}
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 truncate">
            {data.taxLabel} %{rule.taxRateRequired && <RequiredStar />}
          </label>
          <input type="number" value={data.taxRate || ""} onChange={(e) => update("taxRate", parseFloat(e.target.value) || 0)} placeholder="0" min="0" max="100" step="0.1" className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${errors.taxRate ? errBorder : okBorder}`} />
          <FieldError message={errors.taxRate} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Discount %</label>
          <input type="number" value={data.discountRate || ""} onChange={(e) => update("discountRate", parseFloat(e.target.value) || 0)} placeholder="0" min="0" max="100" step="0.1" className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Shipping</label>
          <input type="number" value={data.shippingFee || ""} onChange={(e) => update("shippingFee", parseFloat(e.target.value) || 0)} placeholder="0" min="0" step="0.01" className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Late Fee %/mo</label>
          <input type="number" value={data.lateFeeRate || ""} onChange={(e) => update("lateFeeRate", parseFloat(e.target.value) || 0)} placeholder="0" min="0" max="25" step="0.5" className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      {/* ── Payment Details (accordion) ── */}
      <details className="group border border-gray-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-green-50 to-emerald-50 cursor-pointer select-none hover:from-green-100 hover:to-emerald-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Payment Details</h3>
              <p className="text-[11px] text-gray-400">Bank info, PayPal, UPI, QR code</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </summary>
        <div className="px-5 pb-5 pt-3 space-y-6 border-t border-green-100 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
          <PaymentFields data={data.paymentInfo} onChange={(v) => update("paymentInfo", v)} />
          <QRCodeSection
            qrCodeData={data.qrCodeData}
            onChange={(v) => update("qrCodeData", v)}
            currency={data.currency}
            senderName={data.senderName}
          />
        </div>
      </details>

      {/* Terms & Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Terms & Conditions</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {getTermsPresetsForWatermark(data.watermark).map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => update("terms", preset.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border-2 transition-all ${
                data.terms === preset.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <textarea value={data.terms} onChange={(e) => update("terms", e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
        <p className="text-xs text-gray-400 mt-1">Auto-filled when you change the watermark. Pick a preset or write your own.</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={data.notes || "Thank you for your business!"} onChange={(e) => update("notes", e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
      </div>

      {/* Signature */}
      <SignaturePad signature={data.signature} onChange={(v) => update("signature", v)} />
    </div>
  );
}
