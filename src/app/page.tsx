"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { InvoiceData } from "@/types/invoice";
import {
  createDefaultInvoice,
  initializeInvoiceDates,
} from "@/lib/defaultInvoice";
import { detectCurrency, detectTaxLabel, getSampleInvoiceData } from "@/lib/autoDetect";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import PDFDownloadButton from "@/components/PDFDownloadButton";
import AffiliateCard from "@/components/AffiliateCard";
import { validateInvoice, hasErrors } from "@/lib/validation";
import RecurringReminder from "@/components/RecurringReminder";
import { trackInvoiceEvent } from "@/lib/trackEvent";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://freeinvoicegen.org";

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Is this invoice generator really free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, InvoiceGen is 100% free with no hidden charges, no signup required, and no limits on the number of invoices you can create or download." } },
    { "@type": "Question", "name": "Do I need to create an account?", "acceptedAnswer": { "@type": "Answer", "text": "No. Start creating your invoice immediately. No registration, login, or email address required. Your data stays in your browser." } },
    { "@type": "Question", "name": "What currencies are supported?", "acceptedAnswer": { "@type": "Answer", "text": "InvoiceGen supports 30+ currencies including USD, EUR, GBP, INR, CAD, AUD, JPY, AED, SAR, BRL, MXN, KRW, SGD, CHF, NGN, PKR, BDT, and many more." } },
    { "@type": "Question", "name": "Is my data safe?", "acceptedAnswer": { "@type": "Answer", "text": "All invoice data stays in your browser. Nothing is stored on our servers. Your financial information never leaves your device." } },
    { "@type": "Question", "name": "Can I add my company logo and signature?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Upload your logo, draw or upload a digital signature, customize colors and fonts — all free features that other tools charge $10-20/month for." } },
    { "@type": "Question", "name": "How do I create an invoice?", "acceptedAnswer": { "@type": "Answer", "text": "Fill in your business details, add client information, list your items or services, choose a template, and click Download PDF. The entire process takes under 2 minutes." } },
    { "@type": "Question", "name": "Can I send invoices by email?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. InvoiceGen lets you email invoices directly to clients with the PDF attached, using a professional email template." } },
    { "@type": "Question", "name": "Does it work for my country?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. InvoiceGen supports 120+ countries with auto-detected currency, country-specific tax labels (GST, VAT, IVA, etc.), and compliance notes for legal invoice requirements." } },
  ],
};

const homeHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a Professional Invoice Online for Free",
  "description": "Create and download a professional PDF invoice in under 2 minutes using InvoiceGen.",
  "totalTime": "PT2M",
  "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
  "tool": { "@type": "HowToTool", "name": "InvoiceGen Free Invoice Generator" },
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Enter your business details", "text": "Add your company name, address, email, and optionally upload your logo.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 2, "name": "Add client information", "text": "Enter the client name and billing address. Save clients for reuse on future invoices.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 3, "name": "List your items or services", "text": "Add line items with descriptions, quantities, and rates. Tax, discounts, and totals calculate automatically.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 4, "name": "Choose a template and customize", "text": "Select from 10 professional templates. Customize colors, fonts, add payment QR codes and digital signatures.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 5, "name": "Download or email your invoice", "text": "Click Download PDF for an instant professional invoice, or email it directly to your client.", "url": `${SITE_URL}/#generator` },
  ],
};

const FEATURES = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
        />
      </svg>
    ),
    title: "Custom Branding & Colors",
    desc: "Upload your logo, pick any brand color, choose fonts. Full customization — others charge $10-20/mo for this.",
    premium: true,
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
        />
      </svg>
    ),
    title: "Digital Signature",
    desc: "Upload your signature image. It appears on the PDF — no printing and scanning needed.",
    premium: true,
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
    title: "Payment Details & Bank Info",
    desc: "Add bank account, SWIFT, IFSC, PayPal, UPI — all payment methods on the invoice itself.",
    premium: true,
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
    title: "Status Badges & Watermarks",
    desc: "Mark invoices as Paid, Pending, Overdue, or Draft. Add PAID/CONFIDENTIAL watermarks.",
    premium: true,
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
    title: "30+ Currencies Worldwide",
    desc: "USD, EUR, GBP, INR, JPY, AED, SAR, NGN, BDT, PKR, and 20+ more currencies.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "Instant PDF — No Signup",
    desc: "Download your invoice as a professional PDF in one click. No account, no email, no limits.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
        />
      </svg>
    ),
    title: "Tax, Discount & Shipping",
    desc: "Auto-calculated tax, discounts, shipping fees, and PO numbers. Everything a pro invoice needs.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: "Live Preview",
    desc: "See exactly how your invoice looks as you type. What you see is what you get.",
  },
];

const FAQS = [
  {
    q: "Is this invoice generator really free?",
    a: "Yes, 100% free. No hidden fees, no signup, no credit card. Create and download unlimited invoices as PDFs.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Start creating your invoice immediately. No registration or login required.",
  },
  {
    q: "What currencies are supported?",
    a: "We support 30+ currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, BRL, MXN, KRW, SGD, CHF, AED, SAR, NGN, PKR, BDT, and many more.",
  },
  {
    q: "Is my data safe?",
    a: "Your invoice data stays in your browser. We don't store any of your information on our servers. Everything is processed locally.",
  },
  {
    q: "Can I customize the invoice design?",
    a: "Yes! Choose from 5 professionally designed templates: Classic, Modern, Minimal, Bold, and Elegant. Each has its own color scheme and style.",
  },
  {
    q: "What format is the downloaded invoice?",
    a: "Invoices are downloaded as professional PDF files that you can email, print, or share with your clients.",
  },
];

const TERMS_MAP: Record<string, string> = {
  none: "Payment is due within 30 days of the invoice date.",
  draft:
    "This is a draft invoice and is subject to changes. Final invoice will be issued upon confirmation.",
  pending:
    "Payment is due within 30 days of the invoice date. Late payments may incur a 1.5% monthly interest charge.",
  paid: "Payment received in full. Thank you for your prompt payment. This invoice is for your records only.",
  overdue:
    "This invoice is overdue. Please remit payment immediately to avoid further action. Late fees of 1.5% per month may apply.",
};

export default function Home() {
  const [invoice, setInvoice] = useState<InvoiceData>(createDefaultInvoice());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [saveRecurrence, setSaveRecurrence] = useState("none");
  const [showErrors, setShowErrors] = useState(false);
  const prevStatusRef = useRef(invoice.status);

  async function handleSendEmail() {
    if (!emailTo.trim() || !emailTo.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const errors = validateInvoice(invoice);
    if (hasErrors(errors)) {
      setShowErrors(true);
      toast.error(Object.values(errors)[0], { duration: 4000 });
      return;
    }
    setEmailSending(true);
    try {
      // Lazy-load PDF + QR libs only when sending email
      const [{ generateInvoicePDF }, { generateQRDataURL }] = await Promise.all([
        import("@/lib/generatePDF"),
        import("@/components/QRCodeSection"),
      ]);
      const qrDataURL = invoice.qrCodeData ? await generateQRDataURL(invoice.qrCodeData) : undefined;
      const doc = generateInvoicePDF(invoice, qrDataURL);
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const res = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          senderName: invoice.senderName,
          senderEmail: invoice.senderEmail,
          invoiceNumber: invoice.invoiceNumber,
          pdfBase64,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Invoice sent to ${emailTo}!`);
        // Silent admin-only analytics — fires after the user got their success toast
        trackInvoiceEvent("email", invoice, { recipientEmail: emailTo.trim() });
        setShowEmailModal(false);
        setEmailTo("");
      } else {
        toast.error(data.error || "Failed to send. Try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setEmailSending(false);
    }
  }

  function handleSaveTemplate() {
    const name = saveTemplateName.trim() || `Template ${Date.now().toString().slice(-4)}`;
    try {
      const raw = localStorage.getItem("invoicegen_saved_templates");
      const templates = raw ? JSON.parse(raw) : [];
      templates.push({
        name,
        data: invoice,
        savedAt: new Date().toISOString(),
        recurrence: saveRecurrence,
      });
      localStorage.setItem("invoicegen_saved_templates", JSON.stringify(templates));
      toast.success(`Template "${name}" saved!${saveRecurrence !== "none" ? ` (${saveRecurrence})` : ""}`);
    } catch {
      toast.error("Failed to save template. Storage may be full.");
    }
    setShowSaveModal(false);
    setSaveTemplateName("");
    setSaveRecurrence("none");
  }

  // Initialize dates/IDs + auto-detect country on client only
  useEffect(() => {
    setInvoice((prev) => {
      const initialized = initializeInvoiceDates(prev);
      // Auto-detect currency from browser timezone/language
      const detectedCurrency = detectCurrency();
      const detectedTaxLabel = detectTaxLabel();
      return { ...initialized, currency: detectedCurrency, taxLabel: detectedTaxLabel };
    });

    // Check if redirected from /templates with an edit request
    const editIndex = sessionStorage.getItem("invoicegen_edit_index");
    if (editIndex !== null) {
      sessionStorage.removeItem("invoicegen_edit_index");
      try {
        const raw = localStorage.getItem("invoicegen_saved_templates");
        const templates = raw ? JSON.parse(raw) : [];
        const template = templates[parseInt(editIndex)];
        if (template?.data) {
          const loadedData = { ...template.data };
          // For recurring templates, auto-update dates and invoice number
          if (template.recurrence && template.recurrence !== "none") {
            const today = new Date();
            const due = new Date(today);
            const recurrenceDays: Record<string, number> = {
              weekly: 7, "bi-weekly": 14, monthly: 30, quarterly: 90, yearly: 365,
            };
            due.setDate(due.getDate() + (recurrenceDays[template.recurrence] || 30));
            loadedData.invoiceDate = today.toISOString().split("T")[0];
            loadedData.dueDate = due.toISOString().split("T")[0];
            loadedData.invoiceNumber = `INV-${String(Date.now()).slice(-6)}`;
          }
          setInvoice(loadedData);
          // Scroll to generator after a short delay to ensure DOM is ready
          setTimeout(() => {
            document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } catch {
        // ignore parse errors
      }
    }

    // Check if user clicked "Use this template" from gallery or industry page
    const useTemplate = sessionStorage.getItem("invoicegen_use_template");
    if (useTemplate) {
      sessionStorage.removeItem("invoicegen_use_template");
      try {
        const loaded = JSON.parse(useTemplate) as InvoiceData;
        setInvoice(loaded);
        setShowErrors(false);
        setTimeout(() => {
          document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Load a recurring template by index (from reminder banner)
  const handleLoadRecurringTemplate = useCallback((index: number) => {
    try {
      const raw = localStorage.getItem("invoicegen_saved_templates");
      const templates = raw ? JSON.parse(raw) : [];
      const template = templates[index];
      if (template?.data) {
        const loadedData = { ...template.data };
        const today = new Date();
        const due = new Date(today);
        const recurrenceDays: Record<string, number> = {
          weekly: 7, "bi-weekly": 14, monthly: 30, quarterly: 90, yearly: 365,
        };
        due.setDate(due.getDate() + (recurrenceDays[template.recurrence] || 30));
        loadedData.invoiceDate = today.toISOString().split("T")[0];
        loadedData.dueDate = due.toISOString().split("T")[0];
        loadedData.invoiceNumber = `INV-${String(Date.now()).slice(-6)}`;
        setInvoice(loadedData);
        setTimeout(() => {
          document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch {
      // ignore
    }
  }, []);

  // Wrapper that auto-updates T&C when status changes
  const handleInvoiceChange = useCallback((newData: InvoiceData) => {
    if (newData.status !== prevStatusRef.current) {
      prevStatusRef.current = newData.status;
      const newTerms = TERMS_MAP[newData.status];
      if (newTerms) {
        newData = { ...newData, terms: newTerms };
      }
    }
    setInvoice(newData);
  }, []);

  return (
    <div>
      <JsonLd data={homeFaqSchema} />
      <JsonLd data={homeHowToSchema} />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute -bottom-10 left-1/3 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: "4s" }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-bold px-5 py-2 rounded-full mb-6 shadow-sm border border-green-200 animate-pulse">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              100% Free &mdash; No Signup, No Limits, No Catch
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Create Professional{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invoices
              </span>{" "}
              in Seconds
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The fastest free invoice generator online. Fill in your details,
              pick a template, and download a stunning PDF invoice. No signup,
              no fees, no limits.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const fresh = createDefaultInvoice();
                  const today = new Date();
                  const due = new Date(today);
                  due.setDate(due.getDate() + 30);
                  setInvoice({
                    ...fresh,
                    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
                    invoiceDate: today.toISOString().split("T")[0],
                    dueDate: due.toISOString().split("T")[0],
                    lineItems: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, amount: 0 }],
                  });
                  setShowErrors(false);
                  setTimeout(() => {
                    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all hover:-translate-y-0.5"
              >
                Create Invoice Now
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInvoice(getSampleInvoiceData());
                  setShowErrors(false);
                  setTimeout(() => {
                    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="inline-flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-xl font-medium text-sm hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                See a Demo Invoice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 bg-white border-y border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Premium Features. Zero Price Tag.
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              Everything others charge $10-20/month for — we give you free. No
              catches.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`group relative bg-gradient-to-b from-gray-50 to-white border rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 ${
                  "premium" in f && f.premium
                    ? "border-blue-200 hover:border-blue-300"
                    : "border-gray-100 hover:border-blue-100"
                }`}
              >
                {"premium" in f && f.premium && (
                  <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Free
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Invoice Generator Section */}
      <section id="generator" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Recurring Invoice Reminders */}
          <div className="mb-6">
            <RecurringReminder onLoadTemplate={handleLoadRecurringTemplate} />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Create Your Invoice
            </h2>
            <p className="mt-2 text-gray-600">
              Fill in the form on the left. Preview updates live on the right.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 order-2 lg:order-1">
              <InvoiceForm data={invoice} onChange={handleInvoiceChange} showErrors={showErrors} />
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <PDFDownloadButton data={invoice} onValidationFail={() => setShowErrors(true)} />
                <button
                  type="button"
                  onClick={() => {
                    if (!invoice.senderName.trim() && !invoice.clientName.trim()) {
                      toast.error("Fill in at least your name or client name before saving.");
                      return;
                    }
                    const hasItems = invoice.lineItems.some(
                      (item) => item.description.trim() && item.amount > 0
                    );
                    if (!hasItems) {
                      toast.error("Add at least one line item with a description and amount.");
                      return;
                    }
                    setShowSaveModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  Save as Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (invoice.clientEmail) setEmailTo(invoice.clientEmail);
                    setShowEmailModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Email Invoice
                </button>
              </div>

              {/* Razorpay affiliate — placed right after PDF/Email buttons */}
              <AffiliateCard variant="after-download" />

              {/* Email Invoice Modal */}
              {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Email Invoice</h3>
                    <p className="text-sm text-gray-500 mb-4">Send the invoice PDF directly to your client&apos;s email.</p>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="client@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendEmail();
                        if (e.key === "Escape") setShowEmailModal(false);
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">The PDF invoice will be attached to the email.</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={handleSendEmail}
                        disabled={emailSending}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50"
                      >
                        {emailSending ? "Sending..." : "Send Invoice"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowEmailModal(false); setEmailTo(""); }}
                        className="px-4 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Template Modal */}
              {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Save Template</h3>
                    <p className="text-sm text-gray-500 mb-4">Give your template a name so you can find it later.</p>
                    <input
                      type="text"
                      value={saveTemplateName}
                      onChange={(e) => setSaveTemplateName(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. Monthly Client Invoice"
                      maxLength={30}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTemplate();
                        if (e.key === "Escape") setShowSaveModal(false);
                      }}
                    />
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Recurring Invoice?</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["none", "weekly", "bi-weekly", "monthly", "quarterly", "yearly"].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSaveRecurrence(r)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border-2 transition-all capitalize ${
                              saveRecurrence === r
                                ? "border-amber-500 bg-amber-50 text-amber-700"
                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {r === "none" ? "One-time" : r}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {saveRecurrence !== "none"
                          ? "When you load this template, the invoice number and dates will auto-update."
                          : "No recurrence — this is a one-time invoice template."}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={handleSaveTemplate}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowSaveModal(false); setSaveTemplateName(""); }}
                        className="px-4 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview — hidden on mobile, sticky on desktop */}
            <div className="hidden lg:block lg:sticky lg:top-24 order-1 lg:order-2">
              <div className="bg-gray-100 rounded-2xl p-4 shadow-inner">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 text-center">
                  Live Preview
                </div>
                <div className="transform scale-[0.65] origin-top">
                  <InvoicePreview data={invoice} />
                </div>
              </div>
            </div>

            {/* Mobile Preview Toggle */}
            <div className="lg:hidden order-1">
              <details className="group bg-gray-100 rounded-2xl shadow-inner overflow-hidden">
                <summary className="flex items-center justify-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Tap to Preview Invoice
                  <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="p-2 overflow-x-auto">
                  <InvoicePreview data={invoice} />
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section
        id="feedback"
        className="py-12 bg-white border-t border-gray-100"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Feedback & Bug Reports
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Found a bug? Have a feature request? We&apos;d love to hear from
                you.
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const btn = form.querySelector(
                  "button[type=submit]",
                ) as HTMLButtonElement;
                const fd = new FormData(form);
                const msg = fd.get("message") as string;
                if (!msg.trim()) {
                  toast.error("Please enter a message before sending.");
                  return;
                }
                if (msg.trim().length < 10) {
                  toast.error(
                    "Message is too short. Please provide more details.",
                  );
                  return;
                }

                btn.disabled = true;
                btn.textContent = "Sending...";

                try {
                  const res = await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: fd.get("name"),
                      type: fd.get("type"),
                      message: msg,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast.success("Feedback sent successfully! Thank you.");
                    form.reset();
                  } else {
                    toast.error("Failed to send. Please try again.");
                  }
                } catch {
                  toast.error("Network error. Please try again.");
                } finally {
                  btn.disabled = false;
                  btn.textContent = "Send Feedback";
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Feedback">Feedback</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us what you think, report a bug, or suggest a feature..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                Send Feedback
              </button>
              <p className="text-xs text-center text-gray-400">
                Your feedback is sent directly to us. We read every message.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-blue-200">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Create Your Invoice?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of freelancers and small businesses who create
              professional invoices in seconds.
            </p>
            <button
              type="button"
              onClick={() => {
                const fresh = createDefaultInvoice();
                const today = new Date();
                const due = new Date(today);
                due.setDate(due.getDate() + 30);
                setInvoice({
                  ...fresh,
                  invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
                  invoiceDate: today.toISOString().split("T")[0],
                  dueDate: due.toISOString().split("T")[0],
                  lineItems: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, amount: 0 }],
                });
                setShowErrors(false);
                setTimeout(() => {
                  document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Creating - It&apos;s Free
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
