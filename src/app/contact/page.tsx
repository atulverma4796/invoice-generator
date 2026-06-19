import { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";
const CONTACT_EMAIL = "iimtatul102@gmail.com";

export const metadata: Metadata = {
  title: "Contact InvoiceGen — Support, Feedback & Bug Reports",
  description:
    "Get in touch with the InvoiceGen team. Email us for support, feature requests, bug reports, or partnership enquiries. We read every message and usually reply within 1–2 business days.",
  alternates: { canonical: `${SITE_URL}/contact` },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <nav className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">Contact</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Contact{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              InvoiceGen
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Questions, feedback, a bug to report, or an idea for a feature? We genuinely want to
            hear from you — InvoiceGen is shaped almost entirely by what real users ask for.
          </p>
        </div>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Email us directly</h2>
            <p>
              The fastest way to reach a real person is email. Write to us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              and we will get back to you — usually within one to two business days. There is no
              support ticketing maze, no chatbot, and no signup required to ask a question.
            </p>
            <p className="mt-4">
              To help us help you faster, please include the document type you were working on
              (invoice, quotation, purchase order, delivery note, salary slip, or rent receipt),
              the browser and device you were using, and — if something went wrong — a short
              description of what you expected versus what actually happened.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What you can write to us about</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Bug reports.</strong> A total that looks wrong, a PDF that does not download,
                a layout that breaks on your phone — tell us and we will fix it.
              </li>
              <li>
                <strong>Feature requests.</strong> A currency, language, tax format, or template we
                do not support yet. Most of what InvoiceGen does today started as a user request.
              </li>
              <li>
                <strong>Tax &amp; format questions.</strong> Whether you are creating a GST invoice
                in India, a VAT invoice in the UK, or a delivery challan, we are happy to point you
                to the right tool or guide on the site.
              </li>
              <li>
                <strong>Partnership &amp; press.</strong> If you want to write about InvoiceGen,
                embed it, or work with us, this is the address.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Quick feedback form</h2>
            <p>
              Prefer not to open your email client? Use the short feedback form on the homepage —
              it lands in the same inbox.{" "}
              <Link href="/#feedback" className="font-semibold text-blue-600 hover:underline">
                Open the feedback form →
              </Link>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">A note on privacy</h2>
            <p>
              InvoiceGen builds your documents entirely in your browser — your invoice data never
              touches our servers. When you email us, we only see what you choose to write. We never
              ask for the contents of an invoice to "debug" it, and you should never send us
              sensitive client or payment details. For the full picture, see our{" "}
              <Link href="/privacy" className="font-semibold text-blue-600 hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Email {CONTACT_EMAIL}
          </a>
        </div>
      </article>
    </div>
  );
}
