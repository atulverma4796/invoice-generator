import { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "About InvoiceGen — Why We Built a Free Invoice Generator",
  description: "Learn the story behind InvoiceGen — a 100% free invoice generator built for freelancers and small businesses worldwide. No signup, no paywalls, no catch.",
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <nav className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">About</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-200">
            ✓ 100% Free Forever
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              InvoiceGen
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            A free invoice generator built for freelancers and small businesses worldwide.
            No signup. No paywalls. No catch.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why InvoiceGen Exists</h2>
            <p className="text-gray-700 leading-relaxed">
              Most invoice generators today are designed to upsell you. You start with a &quot;free&quot;
              tool, hit a paywall when you try to download a PDF, get asked to sign up, then get
              charged $10–30/month for features that should be free. We built InvoiceGen to be different.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Every feature competitors charge for — custom logos, multiple templates, multi-currency,
              digital signatures, payment QR codes, recurring invoices, multi-language support — is
              <strong> 100% free here</strong>. Forever. No tricks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Who It&apos;s For</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              InvoiceGen is built for the millions of people who don&apos;t need (and shouldn&apos;t have to pay for) enterprise invoicing software:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Freelance designers, developers, writers, and consultants</li>
              <li>• Small business owners and shop owners</li>
              <li>• Photographers, videographers, and creatives</li>
              <li>• Tradespeople — plumbers, electricians, contractors, painters</li>
              <li>• Service providers — tutors, trainers, coaches, therapists</li>
              <li>• Anyone who occasionally needs to send a professional invoice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How It&apos;s Free (And Stays Free)</h2>
            <p className="text-gray-700 leading-relaxed">
              InvoiceGen is supported by{" "}
              <strong>unobtrusive Google AdSense advertisements</strong> that may appear on the
              site. We never sell your data — your invoice content stays in your browser and is
              never sent to our servers. The ads pay for hosting and let us keep the tool free for
              everyone, forever.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              We&apos;ll never introduce a premium tier, hide features behind paywalls, or limit
              how many invoices you can create.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacy by Design</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Your data never leaves your browser.</strong> All invoice content, saved
              clients, templates, and product catalogs are stored in your browser&apos;s
              localStorage. We do not have a database. We do not have user accounts. We cannot
              read your invoices even if we wanted to — they simply aren&apos;t on our servers.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Read our full{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              for the technical details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Built For Everyone, Worldwide</h2>
            <p className="text-gray-700 leading-relaxed">
              InvoiceGen supports:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">120+</p>
                <p className="text-xs text-gray-600 mt-0.5">Countries</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">30+</p>
                <p className="text-xs text-gray-600 mt-0.5">Currencies</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">24</p>
                <p className="text-xs text-gray-600 mt-0.5">Languages</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">10</p>
                <p className="text-xs text-gray-600 mt-0.5">Templates</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We auto-detect your country, set the right currency, apply the correct tax label
              (GST, VAT, IVA, etc.), and translate the invoice output into your client&apos;s
              language. All instantly, with zero configuration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Open Feedback</h2>
            <p className="text-gray-700 leading-relaxed">
              We read every single piece of feedback. If something is broken, missing, or could be
              better, we want to know. We&apos;re a small project, but we ship fast.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Have an idea or found a bug? Use our{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">
                feedback form
              </Link>{" "}
              — it goes straight to the developer.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">The Story</h2>
            <p className="text-gray-700 leading-relaxed">
              InvoiceGen was built by an independent developer who got tired of seeing freelancers
              and small business owners pay $10–30/month for invoicing tools that should be free.
              The cost to host a tool like this is essentially zero — there&apos;s no reason it
              should cost anyone anything. So this exists.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              If InvoiceGen has helped you, the best thank-you is to tell another freelancer about
              it. Word of mouth keeps free tools alive.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/#generator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
          >
            Create Your First Invoice
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </article>
    </div>
  );
}
