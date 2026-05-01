import { Metadata } from "next";
import PurchaseOrderClient from "./PurchaseOrderClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Purchase Order Generator — PDF Download, No Signup | InvoiceGen",
  description:
    "Create professional purchase orders in seconds. Free, no signup, instant PDF download. Multi-currency, GST/VAT, separate ship-to address, expected delivery date, and terms & conditions.",
  keywords: [
    "purchase order generator",
    "purchase order PDF",
    "free purchase order maker",
    "PO generator",
    "purchase order format",
    "online purchase order generator",
    "purchase order template",
    "PO maker free",
    "PO format India",
    "purchase order generator India",
    "buy order generator",
  ],
  alternates: { canonical: `${SITE_URL}/purchase-order` },
  openGraph: {
    title: "Free Purchase Order Generator — PDF Download, No Signup",
    description:
      "Create professional purchase orders in seconds. Free, no signup, instant PDF download.",
    url: `${SITE_URL}/purchase-order`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a purchase order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A purchase order (PO) is a formal document a buyer sends to a vendor to confirm an order. It locks in the price, quantity, and delivery terms before goods or services are supplied. Once accepted by the vendor, it becomes a legally binding contract.",
      },
    },
    {
      "@type": "Question",
      name: "How is a purchase order different from an invoice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A purchase order is sent by the buyer before the work is done — it's a request to supply. An invoice is sent by the vendor after the work is done — it's a request to pay. The PO number is typically referenced on the matching invoice so both sides can reconcile.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a separate ship-to address?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if goods are being delivered to a different location than your billing address. Common examples: warehouses, project sites, branch offices. If shipping and billing are the same place, leave the ship-to field blank — the PDF will simply omit that section.",
      },
    },
    {
      "@type": "Question",
      name: "Is a purchase order legally binding?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A PO becomes binding once the vendor accepts it (formally or by starting work). Until then it's a unilateral offer. Best practice is to get a written acceptance — even a simple email reply — and keep it filed with the PO.",
      },
    },
    {
      "@type": "Question",
      name: "Should the PO include taxes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — it's clearer for both sides. Show the subtotal, tax (GST/VAT/etc.), shipping, and total separately. The vendor's invoice can then be matched line-by-line against the PO, which speeds up approval and reduces disputes.",
      },
    },
  ],
};

export default function PurchaseOrderPage() {
  return (
    <div className="bg-white">
      <JsonLd data={faqSchema} />

      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Purchase Order Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-200">
            ✓ 100% Free Forever
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Free Purchase Order Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Create professional purchase orders in seconds. Free, no signup, instant PDF download.
            Multi-currency, GST/VAT support, separate ship-to address, and expected delivery dates built in.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <PurchaseOrderClient />
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
              Need a quotation first? Or an invoice after?
            </h2>
            <p className="text-blue-100 mb-5 text-sm">
              InvoiceGen has free generators for the full B2B paper trail — quotation, PO, invoice, receipt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quotation"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Quotation Generator
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
              >
                Invoice Generator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
