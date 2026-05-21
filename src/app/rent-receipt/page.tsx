import { Metadata } from "next";
import RentReceiptClient from "./RentReceiptClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Rent Receipt Generator (HRA)",
  description:
    "Generate 12 HRA-compliant rent receipts for the whole financial year. Landlord PAN, revenue stamp prompt, Section 10(13A) ready. Free PDF, no signup.",
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
    title: "Free Rent Receipt Generator (HRA) — freeinvoicegen.org",
    description:
      "Generate 12 HRA-compliant rent receipts for the whole financial year. Landlord PAN, Section 10(13A). Free PDF, no signup.",
    url: `${SITE_URL}/rent-receipt`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Rent Receipt Generator (HRA) — freeinvoicegen.org",
    description: "Generate 12 HRA rent receipts in one click. Landlord PAN, Section 10(13A). Free PDF, no signup.",
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
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50" />
        <div className="absolute top-20 -left-10 w-72 h-72 bg-violet-300/30 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-fuchsia-300/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-violet-700">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Rent Receipt Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm border border-gray-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            🇮🇳 India · Section 10(13A) HRA
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Save up to{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
              ₹60,000
            </span>{" "}
            on tax. In one click.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
            Generate 12 HRA-compliant rent receipts for the whole financial year — landlord PAN
            field, revenue-stamp prompt for cash, FY defaults, employer-ready PDF.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Landlord PAN field</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>FY 2025-26 defaults</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>12 receipts in one PDF</span>
          </div>
        </div>
      </section>

      {/* Generator */}
      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <RentReceiptClient />
        </div>
      </section>

      {/* Educational content */}
      <section className="py-12 sm:py-16 border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Why rent receipts matter for your HRA claim
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you live in rented accommodation and your salary includes a House Rent Allowance
            (HRA) component, you can claim a tax exemption on a portion of that allowance under
            Section 10(13A) of the Income-tax Act. The exemption can save a salaried employee
            anywhere from a few thousand to over a lakh in tax annually — but it&apos;s conditional
            on producing valid rent receipts. Most employees discover this only at year-end, when
            HR or finance asks for proofs and they scramble to backfill 12 months of receipts. A
            month of unbacked HRA can cost you up to ₹15,000 in lost exemption.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            The Income Tax Department&apos;s rules are clear: the rent receipt must include the
            landlord&apos;s name, address, the rented property address, rent amount, the period
            covered, the landlord&apos;s PAN (mandatory if total annual rent exceeds ₹1 lakh — i.e.
            over ₹8,333/month), and a revenue stamp if cash payment exceeds ₹5,000 in any single
            payment. Receipts without PAN above the ₹1 lakh threshold are rejected by employers and
            assessed by tax officers as ineligible for HRA exemption.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">How HRA exemption is calculated</h3>
          <p className="text-gray-700 leading-relaxed">
            The HRA exemption is the LOWEST of three values:
          </p>
          <ol className="text-gray-700 leading-relaxed space-y-2 mt-3 list-decimal pl-6">
            <li>
              The actual HRA received from your employer
            </li>
            <li>
              50% of (Basic Salary + DA) if you live in a metro city (Mumbai, Delhi, Kolkata,
              Chennai), or 40% if non-metro
            </li>
            <li>
              Actual rent paid minus 10% of (Basic Salary + DA)
            </li>
          </ol>
          <p className="text-gray-700 leading-relaxed mt-4">
            <strong>Example:</strong> Basic ₹40,000/month, HRA ₹16,000/month, rent paid
            ₹20,000/month in Bangalore (metro).
            <br />
            (1) HRA received = ₹1,92,000.
            (2) 50% of Basic = ₹2,40,000.
            (3) Rent paid (₹2,40,000) minus 10% of Basic (₹48,000) = ₹1,92,000.
            Lowest is ₹1,92,000 = your HRA exemption. At a 30% tax slab, that&apos;s ₹57,600 saved
            for the year. Use our{" "}
            <a
              href="https://thecalchub.org/calculator/hra"
              target="_blank"
              rel="noopener"
              className="text-blue-600 hover:underline font-medium"
            >
              HRA Calculator
            </a>{" "}
            to plug in your own numbers.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">What every rent receipt must include</h3>
          <ol className="text-gray-700 leading-relaxed space-y-2 mt-3 list-decimal pl-6">
            <li>
              <strong>Tenant&apos;s name</strong> — yours, as appears on your PAN and salary records
            </li>
            <li>
              <strong>Property address</strong> — the rented address (city, street, pincode)
            </li>
            <li>
              <strong>Landlord&apos;s name and address</strong> — must match the rent agreement
            </li>
            <li>
              <strong>Landlord&apos;s PAN</strong> — mandatory when total annual rent &gt; ₹1 lakh.
              No PAN? You must use Form 60 declaration instead
            </li>
            <li>
              <strong>Period covered by the receipt</strong> — &quot;Receipt for month of May 2026&quot;
              or &quot;01-May-2026 to 31-May-2026&quot;
            </li>
            <li>
              <strong>Rent amount</strong> — in figures and words
            </li>
            <li>
              <strong>Mode of payment</strong> — cash, bank transfer, UPI (write the transaction
              reference if possible)
            </li>
            <li>
              <strong>Revenue stamp</strong> — required if a single cash payment is ₹5,000 or more.
              Bank transfers don&apos;t need it
            </li>
            <li>
              <strong>Landlord&apos;s signature</strong> — without it, the receipt has no
              evidentiary weight
            </li>
            <li>
              <strong>Date the receipt was issued</strong>
            </li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Common rent receipt mistakes</h3>
          <ul className="text-gray-700 leading-relaxed space-y-3 mt-3 list-disc pl-6">
            <li>
              <strong>Generating all 12 receipts on one date.</strong> The income tax officer will
              ask why all 12 receipts have the same issue date. Always backdate the receipt to the
              month it covers.
            </li>
            <li>
              <strong>Missing landlord PAN above ₹1L annual rent.</strong> Without PAN, the
              employer&apos;s HR team is required to NOT allow HRA exemption. Get the PAN — it&apos;s
              your right as a tenant.
            </li>
            <li>
              <strong>Paying rent to a relative without proper rent agreement.</strong> You can pay
              rent to parents and claim HRA, but you need a registered rent agreement and the parent
              must declare the rent as their income.
            </li>
            <li>
              <strong>Skipping the revenue stamp for cash payments above ₹5,000.</strong> Without
              the stamp, the receipt isn&apos;t legally valid as a cash payment receipt.
            </li>
            <li>
              <strong>Inconsistent amounts month-to-month.</strong> Rent should stay constant
              through the financial year (or change once if there&apos;s a documented increase).
              Random fluctuations look fabricated.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">After year-end: what to do with these receipts</h3>
          <p className="text-gray-700 leading-relaxed">
            Submit them along with your investment proofs to your employer&apos;s payroll team
            before the cut-off date (usually January). They will reduce your TDS for the remaining
            months. If you missed the employer deadline, you can still claim HRA exemption when
            filing your ITR — just keep the receipts for at least 6 years in case of a notice. Need
            to estimate your tax saving before claiming? Try our{" "}
            <a
              href="https://thecalchub.org/calculator/form-16"
              target="_blank"
              rel="noopener"
              className="text-blue-600 hover:underline font-medium"
            >
              Form 16 / TDS estimator
            </a>{" "}
            on CalcHub.
          </p>
        </div>
      </section>

      {/* FAQs */}
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
            Learn more about HRA and salary tax planning
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/blog/self-employed-tax-tracking-invoices"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tax</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Tracking Tax Across Salary, HRA, and Freelance Income
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                How to manage income and deductions when you have a mix of salary, HRA, and
                freelance receipts in the same year.
              </p>
            </Link>
            <Link
              href="/blog/tax-invoice-requirements-by-country"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Compliance</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Tax-Receipt Requirements by Country
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                What different countries require for rent receipts, salary slips, and HRA-style
                housing allowances.
              </p>
            </Link>
            <Link
              href="/blog/gst-invoice-india-compliance"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">India</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                GST &amp; Income Tax Compliance for Salaried Folks
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                The line between GST (business) and Income Tax (salary) compliance — and how rent
                receipts fit into both.
              </p>
            </Link>
            <Link
              href="/blog/invoice-mistakes-freelancers-make"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Best Practices</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Tax Receipt Mistakes That Cost You Money
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                The most common errors people make on rent receipts, freelance invoices, and tax
                proofs — and how to fix them.
              </p>
            </Link>
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
