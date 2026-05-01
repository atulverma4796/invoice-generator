import { Metadata } from "next";
import DeliveryNoteClient from "./DeliveryNoteClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Delivery Note Generator (Delivery Challan) — PDF Download | InvoiceGen",
  description:
    "Generate a professional delivery note / delivery challan in seconds. Free, no signup, instant PDF download. Vehicle number, driver details, two-signature block (dispatched / received), and India GST-friendly format.",
  keywords: [
    "delivery note generator",
    "delivery challan generator",
    "delivery challan format",
    "delivery note PDF",
    "free delivery challan maker",
    "delivery note format India",
    "GST delivery challan",
    "DC format",
    "consignment note generator",
    "online delivery note generator",
  ],
  alternates: { canonical: `${SITE_URL}/delivery-note` },
  openGraph: {
    title: "Free Delivery Note / Challan Generator — PDF Download",
    description:
      "Generate a professional delivery note / delivery challan in seconds. Free, no signup, instant PDF download.",
    url: `${SITE_URL}/delivery-note`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a delivery note (or delivery challan)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A delivery note (in India: delivery challan) is a document that accompanies goods in transit. It lists what is being delivered — quantities and items, but no prices — and is signed by the receiver as proof of delivery. The pricing comes later in a separate invoice.",
      },
    },
    {
      "@type": "Question",
      name: "When is a delivery challan required under GST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Under Rule 55 of the CGST Rules, a delivery challan is required when goods are moved without a tax invoice — for example: stock transfer between branches, sending material to a job worker, supply on approval/sale-or-return, or movement for exhibition. The challan must accompany the goods during transport.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a delivery note and an invoice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A delivery note tracks WHAT was delivered (items, quantities) — no pricing. An invoice tracks HOW MUCH was charged for it. The same shipment usually has both: the delivery note travels with the goods and gets signed on receipt; the invoice is sent separately for payment.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to mention vehicle number on a delivery challan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — for road transport in India, the vehicle number is required if the consignment value exceeds ₹50,000 (for an e-way bill). Even below the threshold, including the vehicle number and driver name is a strong best practice for accountability.",
      },
    },
    {
      "@type": "Question",
      name: "How many copies of the delivery challan are needed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GST law specifies three copies: the original for the consignee (receiver), the duplicate for the transporter, and the triplicate retained by the consignor (sender). For everyday B2B deliveries, two copies (one signed and returned, one kept by the receiver) is the practical minimum.",
      },
    },
  ],
};

export default function DeliveryNotePage() {
  return (
    <div className="bg-white">
      <JsonLd data={faqSchema} />

      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Delivery Note Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-200">
            ✓ 100% Free Forever
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Free Delivery Note &amp; Challan Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Generate a professional delivery note (delivery challan) in seconds. Free, no signup,
            instant PDF download. Vehicle and driver fields, two-signature block, and GST-friendly
            format built in.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <DeliveryNoteClient />
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
              Goods delivered? Now raise the invoice.
            </h2>
            <p className="text-blue-100 mb-5 text-sm">
              Once delivered, follow up with a GST/VAT-compliant invoice referencing this delivery note.
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
