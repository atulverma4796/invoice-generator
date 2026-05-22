import { Metadata } from "next";
import PurchaseOrderClient from "./PurchaseOrderClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import AffiliateCard from "@/components/AffiliateCard";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Purchase Order Generator",
  description:
    "Create professional POs in seconds — PO number, ship-to address, expected delivery date, GST/VAT, multi-currency. Free PDF, no signup, no email.",
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
    title: "Free Purchase Order Generator — freeinvoicegen.org",
    description:
      "Create professional POs in seconds — PO number, ship-to address, delivery date, GST/VAT. Free PDF, no signup.",
    url: `${SITE_URL}/purchase-order`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Purchase Order Generator — freeinvoicegen.org",
    description: "Create professional POs in seconds. PO number, ship-to, delivery date, GST/VAT. No signup, no email.",
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

      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute top-20 -left-10 w-72 h-72 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Purchase Order Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm border border-gray-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Free forever · No signup
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Stop ordering on{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WhatsApp
            </span>{" "}
            and emails.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
            A real purchase order — with PO number, ship-to address, expected delivery date, and
            tax breakdown. The paper trail that protects you when goods arrive wrong.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>30+ currencies</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Separate ship-to address</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Expected delivery date</span>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <PurchaseOrderClient />
          <AffiliateCard variant="fast-payment" />
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            What is a purchase order, and why does it matter?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            A purchase order (PO) is a formal document a buyer sends to a seller to authorize a
            specific purchase. It locks in the items, quantities, prices, ship-to address, and
            expected delivery date — all before money or goods change hands. When the seller accepts
            the PO, both sides have a legally binding contract for that order. For procurement teams,
            small businesses buying inventory, and freelancers buying equipment, the PO is the single
            cleanest way to make sure what you ordered is exactly what you receive (and exactly what
            you&apos;re billed for).
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Most disputes between buyers and suppliers come from informal orders — a phone call, a
            WhatsApp message, a vague email. With a written PO, you have a reference number for
            every conversation about that order. Invoice doesn&apos;t match? You compare it to the
            PO. Wrong quantity delivered? You point at the PO. Late delivery? The PO has the
            expected date in writing. It&apos;s the buyer&apos;s equivalent of the seller&apos;s
            quotation, and the two together create an unambiguous record of what was agreed.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">When you should issue a PO</h3>
          <p className="text-gray-700 leading-relaxed">
            Any purchase above a small threshold (typically ₹5,000 or $100 — set your own) should go
            through a PO. Use one when:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mt-3 list-disc pl-6">
            <li>
              Buying inventory or raw materials from a regular supplier
            </li>
            <li>
              Ordering equipment, hardware, or software licenses for the business
            </li>
            <li>
              Engaging a vendor for services with defined deliverables (e.g., translation, printing)
            </li>
            <li>
              Procuring goods that need to be shipped to a separate address (warehouse, project site)
            </li>
            <li>
              Booking subcontractor work as part of a larger project you&apos;re running
            </li>
            <li>
              Any purchase that needs internal approval (finance team, manager sign-off)
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            For tiny purchases — a courier charge, a one-off office supply — skipping the PO is
            fine. But for anything that will appear on an expense audit, a vendor invoice, or a tax
            return, having a matching PO makes the paperwork bulletproof.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">What to include on a purchase order</h3>
          <p className="text-gray-700 leading-relaxed">
            A complete PO has these fields:
          </p>
          <ol className="text-gray-700 leading-relaxed space-y-2 mt-3 list-decimal pl-6">
            <li>
              <strong>PO number</strong> — unique reference (e.g., PO-2026-0042) used on all
              follow-up emails and on the supplier&apos;s invoice
            </li>
            <li>
              <strong>Issue date and expected delivery date</strong> — sets the timeline. If the
              delivery window matters, use a date range or &quot;on or before&quot; phrasing
            </li>
            <li>
              <strong>Buyer details</strong> — your legal entity name, billing address, GSTIN/VAT
              number, contact person
            </li>
            <li>
              <strong>Vendor details</strong> — supplier&apos;s name, address, tax ID, contact email
            </li>
            <li>
              <strong>Ship-to address</strong> — only if different from billing address (warehouse,
              site, branch office). This is the #1 field people forget
            </li>
            <li>
              <strong>Itemized order</strong> — SKU or item code, description, unit, quantity, unit
              price, line total. Be specific: &quot;A4 printer paper, 80gsm, 500-sheet ream&quot; not
              just &quot;paper&quot;
            </li>
            <li>
              <strong>Subtotal, tax breakdown, total</strong> — show CGST/SGST/IGST for India,
              VAT for UK/EU, sales tax for US
            </li>
            <li>
              <strong>Payment terms</strong> — net 30, net 45, or advance — and currency if doing
              international procurement
            </li>
            <li>
              <strong>Special instructions</strong> — packaging, labeling, delivery window, contact
              person on receipt, any quality specs
            </li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Common PO mistakes</h3>
          <ul className="text-gray-700 leading-relaxed space-y-3 mt-3 list-disc pl-6">
            <li>
              <strong>No PO number on the invoice.</strong> Always require the supplier to put your
              PO number on their invoice. Without it, your finance team can&apos;t match invoice to
              order and payment gets delayed.
            </li>
            <li>
              <strong>Vague item descriptions.</strong> &quot;Office furniture&quot; is useless if
              you receive plastic chairs instead of ergonomic ones. Specify model, dimensions, color,
              spec sheet.
            </li>
            <li>
              <strong>Missing ship-to address.</strong> If your bill-to and ship-to differ, write
              both explicitly. Tax also depends on this: inter-state vs. intra-state for GST.
            </li>
            <li>
              <strong>No expected delivery date.</strong> &quot;ASAP&quot; means different things to
              different people. Pick a date, even if approximate, so you can enforce it later.
            </li>
            <li>
              <strong>Forgetting tax treatment.</strong> For India procurement, missing the GSTIN
              field on the vendor side means you can&apos;t claim input tax credit. Always capture
              it.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">PO vs. invoice — who issues what</h3>
          <p className="text-gray-700 leading-relaxed">
            The PO is from the <strong>buyer to the seller</strong>. The invoice flows back the
            other way — <strong>seller to buyer</strong>, after the goods or services are delivered.
            Both reference the same PO number. The buyer&apos;s accounting system marks the PO as
            &quot;received&quot; when goods arrive, and as &quot;paid&quot; when the invoice is
            settled. Need an invoice generator after receiving a vendor&apos;s goods? Use our{" "}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              free invoice generator
            </Link>{" "}
            to issue one to your own clients, or use this PO generator to source your inputs.
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
            Learn more about procurement and invoicing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/blog/invoice-vs-receipt-vs-quotation"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guide</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                PO, Invoice, Receipt &amp; Quotation: The Full B2B Paper Trail
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Understand exactly which document goes where in a typical B2B order — and why
                missing one breaks the audit trail.
              </p>
            </Link>
            <Link
              href="/blog/gst-invoice-india-compliance"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">India</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                GST Invoice India — Full Compliance Guide
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                CGST/SGST/IGST split, HSN/SAC codes, place of supply, and the rules for claiming
                input tax credit on procurement.
              </p>
            </Link>
            <Link
              href="/blog/invoice-numbering-best-practices"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Best Practices</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Invoice and PO Numbering Best Practices
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                How to design a numbering scheme that keeps your finance team happy and survives
                audits years later.
              </p>
            </Link>
            <Link
              href="/blog/tax-invoice-requirements-by-country"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Global</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Tax Invoice Requirements by Country
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                What fields each tax authority wants on invoices and POs across India, UK, US, EU,
                Australia, and more.
              </p>
            </Link>
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
