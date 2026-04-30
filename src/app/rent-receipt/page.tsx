import { Metadata } from "next";
import RentReceiptClient from "./RentReceiptClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Rent Receipt Generator (India) — HRA Claim, PDF Download",
  description:
    "Generate professional rent receipts for HRA claim under Section 10(13A). Free, no signup. Auto-fills the entire financial year (12 receipts), supports landlord PAN, revenue stamp prompt for cash payments, and instant PDF download.",
  keywords: [
    "rent receipt generator",
    "rent receipt format",
    "HRA receipt generator",
    "rent receipt India",
    "rent receipt PDF",
    "monthly rent receipt",
    "HRA claim receipt",
    "rent receipt template",
    "free rent receipt generator",
    "Section 10(13A) rent receipt",
    "landlord PAN rent receipt",
  ],
  alternates: { canonical: `${SITE_URL}/rent-receipt` },
  openGraph: {
    title: "Free Rent Receipt Generator — HRA Claim Compliant",
    description:
      "Generate professional rent receipts for HRA claim. Free, no signup. PDF download with revenue stamp prompt and landlord PAN support.",
    url: `${SITE_URL}/rent-receipt`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need rent receipts to claim HRA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Under Section 10(13A) of the Income Tax Act, you must submit rent receipts to your employer to claim HRA exemption. The receipts must show the amount, period, landlord name, and the rented property's address.",
      },
    },
    {
      "@type": "Question",
      name: "When is landlord PAN mandatory on the rent receipt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Landlord PAN is mandatory if your annual rent exceeds ₹1 lakh (₹8,333/month average). Without PAN, the employer cannot allow the HRA exemption beyond that threshold.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a revenue stamp on rent receipts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A revenue stamp is required only for cash rent payments above ₹5,000. For bank transfers, NEFT/IMPS, UPI or cheque, no revenue stamp is needed regardless of the amount.",
      },
    },
    {
      "@type": "Question",
      name: "How many rent receipts do I need for a full year?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most employers ask for monthly rent receipts (12 per financial year), though some accept a single consolidated annual receipt. Monthly receipts are safer because they match bank-statement entries during scrutiny.",
      },
    },
    {
      "@type": "Question",
      name: "Can I generate rent receipts for past months?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The generator can produce receipts for any past period. Each receipt is dated to the last day of the month it covers, which is the convention for HRA claims.",
      },
    },
  ],
};

export default function RentReceiptPage() {
  return (
    <div className="bg-white">
      <JsonLd data={faqSchema} />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Rent Receipt Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-200">
            🇮🇳 India · HRA Claim
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Free Rent Receipt Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Generate HRA-compliant rent receipts for the entire year in one click. Free, no signup,
            instant PDF download. Landlord PAN, revenue stamp prompt, and Indian financial-year defaults built in.
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <RentReceiptClient />
        </div>
      </section>

      {/* FAQs */}
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

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Need an invoice instead?
            </h2>
            <p className="text-blue-100 mb-5 text-sm">
              InvoiceGen also generates GST-compliant invoices, quotations, and more — all free.
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
