import { InvoiceData } from "@/types/invoice";

// ─── Country tax regime mapping by currency ───
// Groups currencies by their tax/invoicing requirements

interface CountryRule {
  taxIdLabel: string;         // What the Tax ID field should be called
  taxIdRequired: boolean;     // Whether Tax ID is mandatory
  senderAddressRequired: boolean;
  clientAddressRequired: boolean;
  clientTaxIdRequired: boolean; // B2B: buyer Tax ID required
  clientTaxIdLabel: string;
  taxRateRequired: boolean;   // Must specify tax rate
  extraFields?: string[];     // Any extra fields needed
  notes?: string;             // Compliance note shown to user
}

const DEFAULT_RULE: CountryRule = {
  taxIdLabel: "Tax ID / Registration Number",
  taxIdRequired: false,
  senderAddressRequired: true,
  clientAddressRequired: false,
  clientTaxIdRequired: false,
  clientTaxIdLabel: "Client Tax ID",
  taxRateRequired: false,
};

// Mapping: currency code → country-specific invoicing rules
// Based on legal requirements from 100+ countries, grouped by tax regime
const CURRENCY_RULES: Record<string, CountryRule> = {
  // ── India (GST) ──
  INR: {
    taxIdLabel: "GSTIN (GST Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client GSTIN",
    taxRateRequired: true,
    notes: "India: GSTIN is mandatory for businesses registered under GST. Include HSN/SAC codes for items if applicable.",
  },

  // ── United Kingdom (VAT) ──
  GBP: {
    taxIdLabel: "VAT Registration Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client VAT Number",
    taxRateRequired: true,
    notes: "UK: VAT number is required if you are VAT-registered. Standard VAT rate is 20%.",
  },

  // ── Eurozone (VAT) ──
  EUR: {
    taxIdLabel: "VAT Identification Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client VAT Number",
    taxRateRequired: true,
    notes: "EU: VAT ID is required for intra-community supplies. Both seller and buyer VAT numbers must appear on cross-border B2B invoices.",
  },

  // ── United States (Sales Tax) ──
  USD: {
    taxIdLabel: "EIN / Tax ID",
    taxIdRequired: false,
    senderAddressRequired: true,
    clientAddressRequired: false,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client Tax ID",
    taxRateRequired: false,
    notes: "US: No federal invoice requirements, but include state sales tax if applicable. EIN recommended for businesses.",
  },

  // ── Canada (GST/HST) ──
  CAD: {
    taxIdLabel: "GST/HST Business Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client Business Number",
    taxRateRequired: true,
    notes: "Canada: GST/HST number required if registered. Include GST (5%) and/or provincial sales tax as applicable.",
  },

  // ── Australia (GST) ──
  AUD: {
    taxIdLabel: "ABN (Australian Business Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client ABN",
    taxRateRequired: true,
    notes: "Australia: ABN is required on tax invoices. Standard GST rate is 10%.",
  },

  // ── UAE (VAT) ──
  AED: {
    taxIdLabel: "TRN (Tax Registration Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client TRN",
    taxRateRequired: true,
    notes: "UAE: TRN is mandatory on all tax invoices. Standard VAT rate is 5%. Must be labeled 'Tax Invoice'.",
  },

  // ── Saudi Arabia (VAT + ZATCA) ──
  SAR: {
    taxIdLabel: "VAT Registration Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client VAT Number",
    taxRateRequired: true,
    notes: "KSA: VAT number mandatory. Standard rate is 15%. E-invoicing (ZATCA Phase 2) requires QR code for compliance.",
  },

  // ── Japan (Consumption Tax) ──
  JPY: {
    taxIdLabel: "Qualified Invoice Issuer Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: false,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client Registration Number",
    taxRateRequired: true,
    notes: "Japan: Qualified Invoice System (QIS) requires registration number since Oct 2023. Standard rate is 10%, reduced rate is 8%.",
  },

  // ── China (VAT — Fapiao) ──
  CNY: {
    taxIdLabel: "Taxpayer Identification Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client Taxpayer ID",
    taxRateRequired: true,
    notes: "China: Official Fapiao system required. Taxpayer ID is mandatory. Standard VAT rate is 13%.",
  },

  // ── South Korea (VAT) ──
  KRW: {
    taxIdLabel: "Business Registration Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client Business Reg. Number",
    taxRateRequired: true,
    notes: "Korea: Business Registration Number required. Standard VAT rate is 10%. Electronic tax invoices mandatory for most businesses.",
  },

  // ── Singapore (GST) ──
  SGD: {
    taxIdLabel: "GST Registration Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client GST Reg. Number",
    taxRateRequired: true,
    notes: "Singapore: GST registration number required if registered. Standard GST rate is 9% (since 2024).",
  },

  // ── Switzerland (VAT) ──
  CHF: {
    taxIdLabel: "UID / VAT Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client UID / VAT Number",
    taxRateRequired: true,
    notes: "Switzerland: UID (CHE-xxx.xxx.xxx) required if VAT-registered. Standard rate is 8.1%.",
  },

  // ── Brazil (CNPJ/CPF) ──
  BRL: {
    taxIdLabel: "CNPJ / CPF",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client CNPJ / CPF",
    taxRateRequired: true,
    notes: "Brazil: CNPJ (business) or CPF (individual) is mandatory. E-invoicing (NF-e) is required for most transactions.",
  },

  // ── Mexico (IVA) ──
  MXN: {
    taxIdLabel: "RFC (Tax ID)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client RFC",
    taxRateRequired: true,
    notes: "Mexico: RFC required. All invoices must be CFDI (electronic). Standard IVA rate is 16%.",
  },

  // ── South Africa (VAT) ──
  ZAR: {
    taxIdLabel: "VAT Registration Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client VAT Number",
    taxRateRequired: true,
    notes: "South Africa: VAT number required if registered. Standard rate is 15%.",
  },

  // ── New Zealand (GST) ──
  NZD: {
    taxIdLabel: "GST Number / IRD Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: false,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client GST Number",
    taxRateRequired: true,
    notes: "New Zealand: GST number required if registered. Standard GST rate is 15%.",
  },

  // ── Scandinavian countries (VAT) ──
  SEK: {
    taxIdLabel: "VAT Registration Number (Momsreg)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client VAT Number",
    taxRateRequired: true,
    notes: "Sweden: VAT number required. Standard rate is 25%.",
  },
  NOK: {
    taxIdLabel: "Organisation Number (MVA)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client Organisation Number",
    taxRateRequired: true,
    notes: "Norway: Organisation number with MVA suffix required. Standard rate is 25%.",
  },
  DKK: {
    taxIdLabel: "CVR Number / VAT Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client CVR / VAT Number",
    taxRateRequired: true,
    notes: "Denmark: CVR number required. Standard rate is 25%.",
  },

  // ── Southeast Asia ──
  PHP: {
    taxIdLabel: "TIN (Tax Identification Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client TIN",
    taxRateRequired: true,
    notes: "Philippines: TIN required. Standard VAT rate is 12%.",
  },
  THB: {
    taxIdLabel: "Tax ID Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client Tax ID",
    taxRateRequired: true,
    notes: "Thailand: Tax ID required for VAT-registered businesses. Standard rate is 7%.",
  },
  IDR: {
    taxIdLabel: "NPWP (Tax ID)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client NPWP",
    taxRateRequired: true,
    notes: "Indonesia: NPWP required. Standard VAT (PPN) rate is 11%. E-invoicing (e-Faktur) is mandatory.",
  },
  MYR: {
    taxIdLabel: "SST Registration Number",
    taxIdRequired: false,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client SST Number",
    taxRateRequired: false,
    notes: "Malaysia: E-invoicing mandatory from Aug 2024 for large businesses. SST applies to specific goods/services.",
  },

  // ── Africa ──
  NGN: {
    taxIdLabel: "TIN (Tax Identification Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: false,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client TIN",
    taxRateRequired: true,
    notes: "Nigeria: TIN required for VAT-registered businesses. Standard VAT rate is 7.5%.",
  },
  EGP: {
    taxIdLabel: "Tax Registration Number",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client Tax Reg. Number",
    taxRateRequired: true,
    notes: "Egypt: E-invoicing mandatory. Tax registration required. Standard VAT rate is 14%.",
  },

  // ── Eastern Europe ──
  PLN: {
    taxIdLabel: "NIP (VAT Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client NIP",
    taxRateRequired: true,
    notes: "Poland: NIP required. Standard VAT rate is 23%. E-invoicing (KSeF) becoming mandatory.",
  },
  TRY: {
    taxIdLabel: "Tax Identification Number (VKN)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client VKN / TCKN",
    taxRateRequired: true,
    notes: "Turkey: E-invoicing (e-Fatura) mandatory for most businesses. Standard VAT (KDV) rate is 20%.",
  },

  // ── South America ──
  COP: {
    taxIdLabel: "NIT (Tax ID)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client NIT",
    taxRateRequired: true,
    notes: "Colombia: NIT required. E-invoicing mandatory. Standard IVA rate is 19%.",
  },
  ARS: {
    taxIdLabel: "CUIT (Tax ID)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: true,
    clientTaxIdLabel: "Client CUIT / CUIL",
    taxRateRequired: true,
    notes: "Argentina: CUIT required. E-invoicing (Factura Electronica) is mandatory. Standard IVA rate is 21%.",
  },

  // ── South Asia ──
  PKR: {
    taxIdLabel: "NTN / STRN (Tax Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client NTN / STRN",
    taxRateRequired: true,
    notes: "Pakistan: NTN or STRN required for registered businesses. Standard sales tax rate is 18%.",
  },
  BDT: {
    taxIdLabel: "BIN (Business Identification Number)",
    taxIdRequired: true,
    senderAddressRequired: true,
    clientAddressRequired: true,
    clientTaxIdRequired: false,
    clientTaxIdLabel: "Client BIN",
    taxRateRequired: true,
    notes: "Bangladesh: BIN required for VAT-registered businesses. Standard VAT rate is 15%.",
  },
};

export function getCountryRule(currency: string): CountryRule {
  return CURRENCY_RULES[currency] ?? DEFAULT_RULE;
}

export function getTaxIdLabel(currency: string): string {
  return getCountryRule(currency).taxIdLabel;
}

export function getComplianceNote(currency: string): string | undefined {
  return getCountryRule(currency).notes;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateInvoice(data: InvoiceData): ValidationErrors {
  const errors: ValidationErrors = {};
  const rule = getCountryRule(data.currency);

  // ── Universal required fields ──
  if (!data.senderName.trim()) {
    errors.senderName = "Business or sender name is required";
  }
  if (!data.clientName.trim()) {
    errors.clientName = "Client or buyer name is required";
  }
  if (!data.invoiceNumber.trim()) {
    errors.invoiceNumber = "Invoice number is required";
  }
  if (!data.invoiceDate) {
    errors.invoiceDate = "Invoice date is required";
  }
  if (!data.dueDate) {
    errors.dueDate = "Payment due date is required";
  }

  // ── Country-specific: addresses ──
  if (rule.senderAddressRequired && !data.senderAddress.trim()) {
    errors.senderAddress = "Sender address is required for invoices in " + data.currency;
  }
  if (rule.clientAddressRequired && !data.clientAddress.trim()) {
    errors.clientAddress = "Client address is required for invoices in " + data.currency;
  }

  // ── Country-specific: Tax IDs ──
  if (rule.taxIdRequired && !data.senderTaxId.trim()) {
    errors.senderTaxId = `${rule.taxIdLabel} is required`;
  }

  // ── Country-specific: tax rate ──
  if (rule.taxRateRequired && data.taxRate <= 0) {
    errors.taxRate = "Tax rate is required for " + data.currency + " invoices";
  }

  // ── Line items ──
  const hasValidItem = data.lineItems.some(
    (item) => item.description.trim() && item.amount > 0
  );
  if (!hasValidItem) {
    errors.lineItems = "At least one item with description and amount is required";
  }

  // Per-item validation
  data.lineItems.forEach((item, i) => {
    if (!item.description.trim() && (item.quantity > 0 || item.rate > 0)) {
      errors[`item_${i}_desc`] = "Description is required";
    }
    if (item.description.trim() && item.rate <= 0) {
      errors[`item_${i}_rate`] = "Rate must be greater than 0";
    }
  });

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

// ─── Country → Currency mapping ───
// Sorted alphabetically. User picks country, we auto-set currency.

export interface Country {
  name: string;
  code: string;     // ISO 3166-1 alpha-2
  currency: string;  // ISO 4217
}

export const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "AF", currency: "USD" },
  { name: "Albania", code: "AL", currency: "EUR" },
  { name: "Algeria", code: "DZ", currency: "USD" },
  { name: "Argentina", code: "AR", currency: "ARS" },
  { name: "Armenia", code: "AM", currency: "USD" },
  { name: "Australia", code: "AU", currency: "AUD" },
  { name: "Austria", code: "AT", currency: "EUR" },
  { name: "Azerbaijan", code: "AZ", currency: "USD" },
  { name: "Bahrain", code: "BH", currency: "USD" },
  { name: "Bangladesh", code: "BD", currency: "BDT" },
  { name: "Belarus", code: "BY", currency: "USD" },
  { name: "Belgium", code: "BE", currency: "EUR" },
  { name: "Bolivia", code: "BO", currency: "USD" },
  { name: "Bosnia and Herzegovina", code: "BA", currency: "EUR" },
  { name: "Brazil", code: "BR", currency: "BRL" },
  { name: "Brunei", code: "BN", currency: "SGD" },
  { name: "Bulgaria", code: "BG", currency: "EUR" },
  { name: "Cambodia", code: "KH", currency: "USD" },
  { name: "Cameroon", code: "CM", currency: "USD" },
  { name: "Canada", code: "CA", currency: "CAD" },
  { name: "Chile", code: "CL", currency: "USD" },
  { name: "China", code: "CN", currency: "CNY" },
  { name: "Colombia", code: "CO", currency: "COP" },
  { name: "Costa Rica", code: "CR", currency: "USD" },
  { name: "Croatia", code: "HR", currency: "EUR" },
  { name: "Cyprus", code: "CY", currency: "EUR" },
  { name: "Czech Republic", code: "CZ", currency: "EUR" },
  { name: "Denmark", code: "DK", currency: "DKK" },
  { name: "Dominican Republic", code: "DO", currency: "USD" },
  { name: "Ecuador", code: "EC", currency: "USD" },
  { name: "Egypt", code: "EG", currency: "EGP" },
  { name: "El Salvador", code: "SV", currency: "USD" },
  { name: "Estonia", code: "EE", currency: "EUR" },
  { name: "Ethiopia", code: "ET", currency: "USD" },
  { name: "Finland", code: "FI", currency: "EUR" },
  { name: "France", code: "FR", currency: "EUR" },
  { name: "Georgia", code: "GE", currency: "USD" },
  { name: "Germany", code: "DE", currency: "EUR" },
  { name: "Ghana", code: "GH", currency: "USD" },
  { name: "Greece", code: "GR", currency: "EUR" },
  { name: "Guatemala", code: "GT", currency: "USD" },
  { name: "Honduras", code: "HN", currency: "USD" },
  { name: "Hong Kong", code: "HK", currency: "USD" },
  { name: "Hungary", code: "HU", currency: "EUR" },
  { name: "Iceland", code: "IS", currency: "EUR" },
  { name: "India", code: "IN", currency: "INR" },
  { name: "Indonesia", code: "ID", currency: "IDR" },
  { name: "Iran", code: "IR", currency: "USD" },
  { name: "Iraq", code: "IQ", currency: "USD" },
  { name: "Ireland", code: "IE", currency: "EUR" },
  { name: "Israel", code: "IL", currency: "USD" },
  { name: "Italy", code: "IT", currency: "EUR" },
  { name: "Jamaica", code: "JM", currency: "USD" },
  { name: "Japan", code: "JP", currency: "JPY" },
  { name: "Jordan", code: "JO", currency: "USD" },
  { name: "Kazakhstan", code: "KZ", currency: "USD" },
  { name: "Kenya", code: "KE", currency: "USD" },
  { name: "Kuwait", code: "KW", currency: "USD" },
  { name: "Latvia", code: "LV", currency: "EUR" },
  { name: "Lebanon", code: "LB", currency: "USD" },
  { name: "Lithuania", code: "LT", currency: "EUR" },
  { name: "Luxembourg", code: "LU", currency: "EUR" },
  { name: "Malaysia", code: "MY", currency: "MYR" },
  { name: "Malta", code: "MT", currency: "EUR" },
  { name: "Mexico", code: "MX", currency: "MXN" },
  { name: "Moldova", code: "MD", currency: "EUR" },
  { name: "Mongolia", code: "MN", currency: "USD" },
  { name: "Morocco", code: "MA", currency: "USD" },
  { name: "Mozambique", code: "MZ", currency: "USD" },
  { name: "Myanmar", code: "MM", currency: "USD" },
  { name: "Nepal", code: "NP", currency: "INR" },
  { name: "Netherlands", code: "NL", currency: "EUR" },
  { name: "New Zealand", code: "NZ", currency: "NZD" },
  { name: "Nicaragua", code: "NI", currency: "USD" },
  { name: "Nigeria", code: "NG", currency: "NGN" },
  { name: "North Macedonia", code: "MK", currency: "EUR" },
  { name: "Norway", code: "NO", currency: "NOK" },
  { name: "Oman", code: "OM", currency: "USD" },
  { name: "Pakistan", code: "PK", currency: "PKR" },
  { name: "Palestine", code: "PS", currency: "USD" },
  { name: "Panama", code: "PA", currency: "USD" },
  { name: "Paraguay", code: "PY", currency: "USD" },
  { name: "Peru", code: "PE", currency: "USD" },
  { name: "Philippines", code: "PH", currency: "PHP" },
  { name: "Poland", code: "PL", currency: "PLN" },
  { name: "Portugal", code: "PT", currency: "EUR" },
  { name: "Qatar", code: "QA", currency: "USD" },
  { name: "Romania", code: "RO", currency: "EUR" },
  { name: "Russia", code: "RU", currency: "USD" },
  { name: "Rwanda", code: "RW", currency: "USD" },
  { name: "Saudi Arabia", code: "SA", currency: "SAR" },
  { name: "Senegal", code: "SN", currency: "USD" },
  { name: "Serbia", code: "RS", currency: "EUR" },
  { name: "Singapore", code: "SG", currency: "SGD" },
  { name: "Slovakia", code: "SK", currency: "EUR" },
  { name: "Slovenia", code: "SI", currency: "EUR" },
  { name: "South Africa", code: "ZA", currency: "ZAR" },
  { name: "South Korea", code: "KR", currency: "KRW" },
  { name: "Spain", code: "ES", currency: "EUR" },
  { name: "Sri Lanka", code: "LK", currency: "USD" },
  { name: "Sweden", code: "SE", currency: "SEK" },
  { name: "Switzerland", code: "CH", currency: "CHF" },
  { name: "Taiwan", code: "TW", currency: "USD" },
  { name: "Tanzania", code: "TZ", currency: "USD" },
  { name: "Thailand", code: "TH", currency: "THB" },
  { name: "Trinidad and Tobago", code: "TT", currency: "USD" },
  { name: "Tunisia", code: "TN", currency: "USD" },
  { name: "Turkey", code: "TR", currency: "TRY" },
  { name: "Uganda", code: "UG", currency: "USD" },
  { name: "Ukraine", code: "UA", currency: "USD" },
  { name: "United Arab Emirates", code: "AE", currency: "AED" },
  { name: "United Kingdom", code: "GB", currency: "GBP" },
  { name: "United States", code: "US", currency: "USD" },
  { name: "Uruguay", code: "UY", currency: "USD" },
  { name: "Uzbekistan", code: "UZ", currency: "USD" },
  { name: "Venezuela", code: "VE", currency: "USD" },
  { name: "Vietnam", code: "VN", currency: "USD" },
  { name: "Zambia", code: "ZM", currency: "USD" },
  { name: "Zimbabwe", code: "ZW", currency: "USD" },
];
