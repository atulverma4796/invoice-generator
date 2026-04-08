import { COUNTRIES } from "./validation";
import { getTaxLabelForCurrency } from "./languages";

// ─── Auto-detect country from browser ───
// Uses Intl.DateTimeFormat timezone + navigator.language as fallback

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Asia
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN", "Asia/Chongqing": "CN",
  "Asia/Seoul": "KR",
  "Asia/Singapore": "SG",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "Asia/Bangkok": "TH",
  "Asia/Jakarta": "ID",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Manila": "PH",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Taipei": "TW",
  "Asia/Hong_Kong": "HK",
  // Europe
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Zurich": "CH",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Warsaw": "PL",
  "Europe/Istanbul": "TR",
  "Europe/Moscow": "RU",
  "Europe/Lisbon": "PT",
  "Europe/Dublin": "IE",
  "Europe/Brussels": "BE",
  "Europe/Vienna": "AT",
  "Europe/Helsinki": "FI",
  "Europe/Prague": "CZ",
  "Europe/Bucharest": "RO",
  "Europe/Athens": "GR",
  // Americas
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Bogota": "CO",
  // Oceania
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  // Africa
  "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG",
  "Africa/Cairo": "EG",
  "Africa/Nairobi": "KE",
};

const LANG_TO_COUNTRY: Record<string, string> = {
  "en-US": "US", "en-GB": "GB", "en-AU": "AU", "en-CA": "CA", "en-IN": "IN", "en-NZ": "NZ",
  "hi": "IN", "hi-IN": "IN",
  "fr": "FR", "fr-FR": "FR", "fr-CA": "CA",
  "de": "DE", "de-DE": "DE", "de-AT": "AT", "de-CH": "CH",
  "es": "ES", "es-ES": "ES", "es-MX": "MX", "es-AR": "AR",
  "pt": "PT", "pt-BR": "BR",
  "it": "IT", "it-IT": "IT",
  "nl": "NL", "nl-NL": "NL",
  "ja": "JP", "ja-JP": "JP",
  "ko": "KR", "ko-KR": "KR",
  "zh": "CN", "zh-CN": "CN", "zh-TW": "TW",
  "ar": "SA", "ar-SA": "SA", "ar-AE": "AE",
  "tr": "TR", "tr-TR": "TR",
  "pl": "PL", "pl-PL": "PL",
  "sv": "SE", "sv-SE": "SE",
  "da": "DK", "da-DK": "DK",
  "nb": "NO", "no": "NO",
  "th": "TH", "th-TH": "TH",
  "id": "ID", "ms": "MY",
  "vi": "VN", "bn": "BD", "ur": "PK",
  "ru": "RU", "ru-RU": "RU",
};

export function detectCountryCode(): string {
  try {
    // Try timezone first — most reliable
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];

    // Fallback to navigator.language
    const lang = navigator.language;
    if (lang && LANG_TO_COUNTRY[lang]) return LANG_TO_COUNTRY[lang];

    // Try base language
    const baseLang = lang?.split("-")[0];
    if (baseLang && LANG_TO_COUNTRY[baseLang]) return LANG_TO_COUNTRY[baseLang];
  } catch {
    // SSR or restricted environment
  }
  return "US"; // default
}

export function detectCurrency(): string {
  const code = detectCountryCode();
  const country = COUNTRIES.find((c) => c.code === code);
  return country?.currency ?? "USD";
}

export function detectTaxLabel(): string {
  return getTaxLabelForCurrency(detectCurrency());
}

// ─── Sample invoice data for demo ───

export function getSampleInvoiceData() {
  const countryCode = detectCountryCode();
  const country = COUNTRIES.find((c) => c.code === countryCode);
  const currency = country?.currency ?? "USD";
  const taxLabel = getTaxLabelForCurrency(currency);
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);

  // Country-specific sample data
  const samples: Record<string, { sender: string; client: string; senderAddr: string; clientAddr: string; email: string; phone: string; taxId: string; items: { desc: string; qty: number; rate: number }[] }> = {
    IN: {
      sender: "Priya Design Studio",
      client: "TechNova Solutions Pvt. Ltd.",
      senderAddr: "42, Koramangala 4th Block\nBangalore, Karnataka 560034",
      clientAddr: "Tower B, Cyber City\nGurgaon, Haryana 122002",
      email: "priya@designstudio.in",
      phone: "+91 98765 43210",
      taxId: "29ABCDE1234F1Z5",
      items: [
        { desc: "UI/UX Design — Mobile App (12 screens)", qty: 1, rate: 85000 },
        { desc: "Brand Identity Package", qty: 1, rate: 45000 },
        { desc: "Design System Documentation", qty: 1, rate: 25000 },
      ],
    },
    US: {
      sender: "Horizon Digital Agency",
      client: "Maple & Co. Enterprises",
      senderAddr: "1234 Market Street, Suite 500\nSan Francisco, CA 94105",
      clientAddr: "789 Broadway, Floor 12\nNew York, NY 10003",
      email: "hello@horizondigital.com",
      phone: "+1 (415) 555-0192",
      taxId: "84-2541367",
      items: [
        { desc: "Website Redesign — 15 Pages", qty: 1, rate: 4500 },
        { desc: "SEO Optimization Package", qty: 1, rate: 1200 },
        { desc: "Monthly Maintenance (3 months)", qty: 3, rate: 350 },
      ],
    },
    GB: {
      sender: "Sterling Creative Ltd",
      client: "Blackwood & Partners",
      senderAddr: "14 Clerkenwell Close\nLondon EC1R 0AA",
      clientAddr: "8 St James's Square\nManchester M2 6DS",
      email: "info@sterlingcreative.co.uk",
      phone: "+44 20 7946 0958",
      taxId: "GB 123 4567 89",
      items: [
        { desc: "Brand Strategy Workshop (2 days)", qty: 1, rate: 2800 },
        { desc: "Logo & Visual Identity Design", qty: 1, rate: 3500 },
        { desc: "Brand Guidelines Document", qty: 1, rate: 1200 },
      ],
    },
    DE: {
      sender: "Schmidt & Weber GmbH",
      client: "TechBau AG",
      senderAddr: "Friedrichstrasse 43\n10117 Berlin",
      clientAddr: "Maximilianstrasse 10\n80539 Munchen",
      email: "kontakt@schmidtweber.de",
      phone: "+49 30 1234 5678",
      taxId: "DE123456789",
      items: [
        { desc: "Software-Entwicklung — Backend API", qty: 1, rate: 8500 },
        { desc: "Datenbankdesign und Migration", qty: 1, rate: 3200 },
        { desc: "Code-Review und Dokumentation", qty: 1, rate: 1800 },
      ],
    },
    AE: {
      sender: "Al Noor Consulting",
      client: "Emirates Tech Solutions LLC",
      senderAddr: "Office 301, Business Bay Tower\nDubai, UAE",
      clientAddr: "Al Reem Island, Sky Tower\nAbu Dhabi, UAE",
      email: "info@alnoor.ae",
      phone: "+971 4 555 1234",
      taxId: "100234567890003",
      items: [
        { desc: "IT Infrastructure Audit", qty: 1, rate: 15000 },
        { desc: "Cloud Migration Strategy", qty: 1, rate: 22000 },
        { desc: "Staff Training (5 sessions)", qty: 5, rate: 3000 },
      ],
    },
  };

  // Get country-specific or fall back to US
  const s = samples[countryCode] || samples.US;

  return {
    senderName: s.sender,
    senderEmail: s.email,
    senderAddress: s.senderAddr,
    senderPhone: s.phone,
    senderWebsite: "",
    senderTaxId: s.taxId,
    logo: "",
    clientName: s.client,
    clientEmail: "accounts@" + s.client.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10) + ".com",
    clientAddress: s.clientAddr,
    clientTaxId: "",
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    invoiceDate: today.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
    poNumber: `PO-${Math.floor(Math.random() * 9000 + 1000)}`,
    lineItems: s.items.map((item) => ({
      id: crypto.randomUUID(),
      description: item.desc,
      quantity: item.qty,
      rate: item.rate,
      amount: item.qty * item.rate,
    })),
    taxRate: currency === "USD" ? 8.25 : currency === "GBP" ? 20 : currency === "INR" ? 18 : currency === "EUR" ? 19 : currency === "AED" ? 5 : 10,
    taxLabel,
    discountRate: 5,
    shippingFee: 0,
    lateFeeRate: 1.5,
    notes: "Thank you for your business! We appreciate your prompt payment.",
    terms: "",
    currency,
    language: "en",
    template: "modern" as const,
    customStyle: {
      primaryColor: "#2563eb",
      accentColor: "#3b82f6",
      fontStyle: "sans" as const,
    },
    status: "pending" as const,
    paymentInfo: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      paypalEmail: "",
      customField: "",
    },
    signature: "",
    watermark: "",
    qrCodeData: "",
  };
}
