import { Metadata } from "next";
import DeliveryNoteClient from "./DeliveryNoteClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Delivery Note / Challan Generator",
  description:
    "Generate a professional delivery note or India GST challan in seconds. Vehicle, driver, two-signature block, GST-friendly. Free PDF, no signup.",
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
    title: "Free Delivery Note / Challan Generator — freeinvoicegen.org",
    description:
      "Generate a delivery note or India GST challan in seconds. Vehicle, driver, two-signature block. Free PDF, no signup.",
    url: `${SITE_URL}/delivery-note`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Delivery Note / Challan Generator — freeinvoicegen.org",
    description: "Generate a delivery note or India GST challan. Vehicle, driver, two-signature block. Free PDF, no signup.",
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

      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
        <div className="absolute top-20 -left-10 w-72 h-72 bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Delivery Note Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm border border-gray-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            🇮🇳 India GST Challan · Free forever
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Move goods.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Cover yourself.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
            A proper delivery challan with vehicle, driver, and two-signature block — the paper
            trail that protects you when goods get lost, stolen, or queried at a check-post.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Vehicle &amp; driver fields</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Two-signature block</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>GST-friendly format</span>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <DeliveryNoteClient />
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            What is a delivery note (and a delivery challan), and why does it matter?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            A delivery note — called a delivery challan in India — is a document that travels with
            goods when they move from the seller to the buyer. It lists exactly what is being shipped,
            in what quantity, from where, to where, by which vehicle, and on what date. It is not an
            invoice and it does not create a payment obligation. Its purpose is purely operational:
            to prove that goods were dispatched and received, and to track every movement in a way
            tax authorities and your own warehouse team can audit.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            In India, the GST regime requires a delivery challan for certain non-invoice goods
            movements — like sending material to a job-worker, transferring stock between your own
            branches, or shipping samples. In those cases, no GST invoice is raised yet, but a
            challan is mandatory and must be carried with the goods (along with an e-way bill above
            ₹50,000 value). For B2B businesses everywhere — not just India — sending a delivery note
            alongside shipments protects you when invoices are queried later (&quot;but you never
            delivered the items&quot;) and protects the buyer when they pay (&quot;the box arrived
            with 8 units, not the 10 you billed for&quot;).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">When to use a delivery note</h3>
          <ul className="text-gray-700 leading-relaxed space-y-2 mt-3 list-disc pl-6">
            <li>
              <strong>Stock transfer between branches.</strong> Moving inventory from your Delhi
              warehouse to your Bangalore branch — no sale, no GST, but a challan is mandatory.
            </li>
            <li>
              <strong>Job-work shipments.</strong> Sending raw fabric to a tailor for stitching, or
              raw metal to a fabricator. Material moves with a challan, returns with another.
            </li>
            <li>
              <strong>Goods sent on approval or sale-on-return basis.</strong> Sample shipments,
              consignment stock. No invoice until the buyer confirms acceptance.
            </li>
            <li>
              <strong>Pre-invoice deliveries.</strong> Sometimes goods ship before billing happens
              (month-end logistics). A challan covers the dispatch, then the invoice follows.
            </li>
            <li>
              <strong>Returns and replacements.</strong> Customer returns defective goods to you —
              you raise a delivery note for the return, not an invoice.
            </li>
            <li>
              <strong>Exhibition or demo dispatches.</strong> Equipment moving to a trade show for
              display.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">What to include on a delivery note</h3>
          <ol className="text-gray-700 leading-relaxed space-y-2 mt-3 list-decimal pl-6">
            <li>
              <strong>Challan/delivery note number</strong> — unique serial (e.g., DC-2026-0117)
              referenced on any subsequent invoice
            </li>
            <li>
              <strong>Date of dispatch</strong> — the day goods actually leave your premises
            </li>
            <li>
              <strong>Consignor (seller) details</strong> — your business name, address, GSTIN
            </li>
            <li>
              <strong>Consignee (buyer) details</strong> — recipient name, ship-to address, GSTIN
              if applicable
            </li>
            <li>
              <strong>Description of goods</strong> — itemized list with HSN code (India),
              description, unit, quantity, and unit price (optional but recommended for valuation)
            </li>
            <li>
              <strong>Total value</strong> — for transport documentation, even if no money changes
              hands. This decides if you need an e-way bill (above ₹50,000 in India)
            </li>
            <li>
              <strong>Transport details</strong> — vehicle number, driver name, transporter ID. For
              cross-border movement, also the LR (Lorry Receipt) number
            </li>
            <li>
              <strong>Place of delivery</strong> — full address where goods will be received
            </li>
            <li>
              <strong>Two signatures</strong> — one from the dispatching authority (your side),
              one from the receiving party (the buyer or transporter)
            </li>
            <li>
              <strong>Reference to PO or invoice</strong> — if the goods relate to a specific
              purchase order or future invoice, note the number
            </li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Common delivery note mistakes</h3>
          <ul className="text-gray-700 leading-relaxed space-y-3 mt-3 list-disc pl-6">
            <li>
              <strong>Treating it as an invoice.</strong> A delivery note does not transfer
              ownership of goods or create payment liability. Tax authorities reject claims based
              on challans alone — you still need a proper invoice for revenue recognition.
            </li>
            <li>
              <strong>Skipping the e-way bill (India).</strong> If goods worth more than ₹50,000 are
              moving, the e-way bill is mandatory along with the challan. Driving without it can
              mean detention and fines.
            </li>
            <li>
              <strong>Missing vehicle/transporter details.</strong> If goods are intercepted en
              route, the officer needs to verify the vehicle matches. Always print the lorry number
              on the challan.
            </li>
            <li>
              <strong>No buyer signature on the copy that returns.</strong> Always have the
              recipient sign on receipt and keep a counter-signed copy. Without it, you have no
              proof of delivery if there&apos;s a dispute later.
            </li>
            <li>
              <strong>Forgetting to link to the future invoice.</strong> Once you raise the
              invoice, write its number on your retained copy of the challan, so the audit trail
              connects in both directions.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">From delivery to invoice</h3>
          <p className="text-gray-700 leading-relaxed">
            Once the goods are delivered and the buyer signs, the next step is raising the invoice
            with the same line items, this time including the GST/VAT breakdown and payment terms.
            Reference the challan number on the invoice (&quot;Against DC-2026-0117&quot;) so your
            buyer&apos;s finance team can match the two documents instantly. For internal stock
            transfers between your own GSTINs, the invoice step is replaced by a tax invoice or
            self-billing — check with your CA. Need to raise that invoice? Use our{" "}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              free invoice generator
            </Link>{" "}
            to issue one with the matching line items.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-100">
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

      <section className="py-12 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Learn more about goods movement and billing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/blog/gst-invoice-india-compliance"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">India</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                GST Invoice India — Complete Compliance Guide
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                When a delivery challan is mandatory under GST, when the e-way bill is required,
                and the rules for cross-state and inter-branch movement.
              </p>
            </Link>
            <Link
              href="/blog/invoice-vs-receipt-vs-quotation"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guide</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Invoice vs. Receipt vs. Quotation vs. Challan
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Which document does what in the B2B paper trail — and why having the right one at
                each step protects you in audits.
              </p>
            </Link>
            <Link
              href="/blog/invoice-numbering-best-practices"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Best Practices</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Numbering Schemes for Invoices, POs, and Challans
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                How to design a numbering scheme across multiple document types that stays clean
                across years and survives a GST audit.
              </p>
            </Link>
            <Link
              href="/blog/professional-invoice-complete-guide-2026"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guide</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                How to Raise a Professional Invoice After Delivery
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Step-by-step guide to converting a delivery challan into a compliant tax invoice
                that gets paid without disputes.
              </p>
            </Link>
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
