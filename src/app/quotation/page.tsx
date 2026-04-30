import { Metadata } from "next";
import QuotationClient from "./QuotationClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Quotation Generator — PDF Download, No Signup | InvoiceGen",
  description:
    "Create professional quotations and estimates in seconds. Free, no signup, instant PDF download. Multi-currency, GST/VAT support, validity dates, and clean templates. Convert to invoice when accepted.",
  keywords: [
    "quotation generator",
    "estimate generator",
    "free quotation maker",
    "quotation format",
    "quotation PDF",
    "online quotation generator",
    "business quotation template",
    "quotation maker free",
    "proforma invoice generator",
    "price quote generator",
    "quotation generator India",
  ],
  alternates: { canonical: `${SITE_URL}/quotation` },
  openGraph: {
    title: "Free Quotation Generator — PDF Download, No Signup",
    description:
      "Create professional quotations and estimates in seconds. Free, no signup, instant PDF download.",
    url: `${SITE_URL}/quotation`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's the difference between a quotation and an invoice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A quotation is a price proposal sent before work begins — non-binding until the client accepts. An invoice is sent after the work is done (or in installments) and creates a payment obligation. Once the client accepts your quotation, you typically issue an invoice for the same scope.",
      },
    },
    {
      "@type": "Question",
      name: "How long should a quotation be valid for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Industry standard is 30 days for most services and 7-14 days for products with volatile pricing (commodities, hardware). Shorter validity protects you from cost increases; longer validity gives the client room to decide. State the validity date clearly on the quotation.",
      },
    },
    {
      "@type": "Question",
      name: "Can a quotation include tax?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Quotations can show prices inclusive of tax (showing the breakdown), exclusive of tax (with a clear note), or both. For B2B work, exclusive-of-tax with a clear tax line is the cleanest approach since the buyer typically claims input tax credit.",
      },
    },
    {
      "@type": "Question",
      name: "Is a quotation the same as a proforma invoice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Very similar. A proforma invoice is a more formal quotation that resembles an invoice in layout and is often used for international trade (customs, advance-payment requests). A standard quotation is informal and used domestically. Both are non-binding until accepted.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert this quotation to an invoice later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. After the client accepts the quotation, copy the line items into our free invoice generator at /, change the document number to an invoice format (INV-...), and add payment terms. The line items, totals, and tax stay the same.",
      },
    },
  ],
};

export default function QuotationPage() {
  return (
    <div className="bg-white">
      <JsonLd data={faqSchema} />

      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Quotation Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-200">
            ✓ 100% Free Forever
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Free Quotation Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Create professional quotations and estimates in seconds. Free, no signup, instant PDF
            download. Multi-currency, GST/VAT support, and validity dates built in.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuotationClient />
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((q, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {q.name}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {q.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Quotation accepted? Convert it to an invoice.
            </h2>
            <p className="text-blue-100 mb-5 text-sm">
              Once the client says yes, generate a GST/VAT-compliant invoice with the same line items.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Go to Invoice Generator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
