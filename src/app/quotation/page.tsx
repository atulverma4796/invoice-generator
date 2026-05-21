import { Metadata } from "next";
import QuotationClient from "./QuotationClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Quotation Generator",
  description:
    "Create professional quotations and estimates in seconds. Multi-currency, GST/VAT-aware, with validity date and clean PDF download. No signup, no email.",
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
    title: "Free Quotation Generator — freeinvoicegen.org",
    description:
      "Create professional quotations and estimates in seconds. Multi-currency, GST/VAT-aware, validity date, clean PDF. No signup.",
    url: `${SITE_URL}/quotation`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Quotation Generator — freeinvoicegen.org",
    description: "Create professional quotations and estimates in seconds. Multi-currency, GST/VAT-aware. No signup, no email.",
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

      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute top-20 -left-10 w-72 h-72 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Quotation Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm border border-gray-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Free forever · No signup
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Win the deal{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              before
            </span>{" "}
            you do the work.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
            Send a professional quotation in 60 seconds. Multi-currency, GST/VAT-aware, with a
            validity date. Convert it into an invoice the moment your client says yes.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>30+ currencies</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>GST / VAT compliant</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Auto validity date</span>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuotationClient />
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            What is a quotation, and why does it matter?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            A quotation is a formal price proposal you send to a client before any work begins. It
            spells out the scope, line items, total cost, taxes, and how long the prices stay valid.
            Unlike an invoice, a quotation creates no payment obligation — it&apos;s an offer the
            client can accept, negotiate, or reject. For freelancers, consultants, agencies, and
            small businesses, sending a quotation before starting work is the single most effective
            way to prevent scope creep, payment disputes, and awkward conversations about price down
            the line.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Treat the quotation as your contract before the contract. When the client says &quot;yes&quot;
            in writing — by email, signature, or even a thumbs-up reply that references the
            quotation number — you have something to point to if expectations drift. Most disputes
            between freelancers and clients trace back to a missing or vague quotation. Spending 5
            minutes on a clear quotation saves hours of follow-up later.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">When to send a quotation</h3>
          <p className="text-gray-700 leading-relaxed">
            Send a quotation any time the cost of work is not fixed at first contact. Examples:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mt-3 list-disc pl-6">
            <li>
              A freelance designer quoting a website redesign with deliverables across 6 weeks
            </li>
            <li>
              A consultant proposing a 3-month retainer with monthly hours and deliverables
            </li>
            <li>
              A manufacturer pricing a bulk order with quantity tiers and delivery dates
            </li>
            <li>
              An IT services firm scoping a cloud migration with optional add-ons
            </li>
            <li>
              An event planner pricing a wedding package with optional upgrades (catering, decor)
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            For repeat clients on standard work — say, your tenth logo design for the same agency —
            you might skip the quotation and go straight to an invoice. But for new clients, large
            jobs, or anything with variable scope, always send a quotation first.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">What to include on a quotation</h3>
          <p className="text-gray-700 leading-relaxed">
            A complete, professional quotation has these elements:
          </p>
          <ol className="text-gray-700 leading-relaxed space-y-2 mt-3 list-decimal pl-6">
            <li>
              <strong>Quotation number</strong> — a unique reference (e.g., Q-2026-0042) so you and
              the client can refer to it later
            </li>
            <li>
              <strong>Issue date and validity date</strong> — usually 30 days, but use 7-14 days if
              your prices fluctuate (commodities, hardware, FX)
            </li>
            <li>
              <strong>Your business details</strong> — legal name, address, GSTIN/VAT number (if
              applicable), contact email and phone
            </li>
            <li>
              <strong>Client details</strong> — company name, billing address, contact person
            </li>
            <li>
              <strong>Itemized scope</strong> — clear description of each deliverable, quantity, rate,
              and line total. Avoid vague phrases like &quot;design work&quot; — write &quot;Homepage
              design, 3 revisions included&quot; instead
            </li>
            <li>
              <strong>Subtotal, tax breakdown, and grand total</strong> — show CGST/SGST or IGST
              separately for India; VAT line for UK/EU; tax-inclusive vs. exclusive for the US
            </li>
            <li>
              <strong>Payment terms</strong> — net 7/15/30, milestone splits (e.g., 50% advance, 50%
              on delivery), accepted payment methods
            </li>
            <li>
              <strong>Notes or terms section</strong> — revision policy, scope-change clause, what&apos;s
              NOT included
            </li>
            <li>
              <strong>Signature space or acceptance line</strong> — &quot;Accepted by: ____________
              Date: _______&quot; gives you a written sign-off
            </li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Common mistakes to avoid</h3>
          <p className="text-gray-700 leading-relaxed">
            Five mistakes that turn a clean quotation into a payment dispute:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-3 mt-3 list-disc pl-6">
            <li>
              <strong>Vague scope.</strong> &quot;Website design&quot; can mean a single landing page
              or a 40-page corporate site. Be specific: &quot;5-page responsive website (Home, About,
              Services, Blog, Contact), 2 design revisions, hosted on client&apos;s domain.&quot;
            </li>
            <li>
              <strong>No validity date.</strong> Without an expiry, a client can accept a 6-month-old
              quote at last year&apos;s prices. Always include &quot;Valid until [date].&quot;
            </li>
            <li>
              <strong>Missing tax treatment.</strong> Not clarifying whether prices include or exclude
              GST/VAT leads to last-minute disputes. State it clearly: &quot;All prices are exclusive
              of 18% GST&quot; or &quot;Inclusive of all taxes.&quot;
            </li>
            <li>
              <strong>No payment milestones for large jobs.</strong> A ₹2 lakh project with payment
              on delivery is risky. Break it into 30/40/30 or 50/50 splits so you have cashflow.
            </li>
            <li>
              <strong>Skipping the scope-change clause.</strong> Without it, clients add features
              mid-project and assume they&apos;re free. Add: &quot;Additional work outside this scope
              will be quoted separately at ₹[rate] per hour.&quot;
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">After the client accepts</h3>
          <p className="text-gray-700 leading-relaxed">
            Once the client says yes (in writing — keep that email), convert the quotation into an
            invoice. Use the same line items, the same totals, the same tax breakdown. Change the
            document type to &quot;Invoice&quot; with an invoice number (INV-...) and add payment
            terms. For long projects, send a partial invoice for the first milestone immediately so
            the client commits financially. Our{" "}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              invoice generator
            </Link>{" "}
            is built to take a quotation and produce a matching invoice in seconds.
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
            Learn more about quotations and invoicing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/blog/invoice-vs-receipt-vs-quotation"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guide</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Invoice vs. Receipt vs. Quotation: Key Differences
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                When to send each document, what they legally do, and how they fit into your
                client&apos;s payment workflow.
              </p>
            </Link>
            <Link
              href="/blog/professional-invoice-complete-guide-2026"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guide</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                How to Create a Professional Invoice in 2026
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Complete step-by-step guide covering required fields, tax compliance, and the
                common mistakes that delay payments.
              </p>
            </Link>
            <Link
              href="/blog/invoice-mistakes-freelancers-make"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tips</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                7 Invoice Mistakes Freelancers Keep Making
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Costly billing mistakes — from missing tax IDs to vague descriptions — and how to
                avoid them on your next quote or invoice.
              </p>
            </Link>
            <Link
              href="/blog/send-invoices-get-paid-on-time"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tips</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                How to Send Invoices That Actually Get Paid On Time
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Payment terms, follow-up cadence, and the language that gets clients to pay
                without chasing.
              </p>
            </Link>
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
