import { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "About InvoiceGen — Why We Built a Free Invoice Generator",
  description:
    "The story, mission, and values behind InvoiceGen — a 100% free invoice generator built for freelancers and small businesses worldwide. No signup, no paywalls, no catch.",
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
            A free invoice generator built for freelancers and small businesses worldwide. No
            signup. No paywalls. No catch.
          </p>
        </div>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p>
              InvoiceGen exists for one reason: to make professional invoicing genuinely free for
              everyone, everywhere. Not free-with-asterisks. Not free-until-you-want-to-download.
              Not free-for-the-first-three-invoices. Just free.
            </p>
            <p className="mt-4">
              Freelancers, creators, tradespeople, and small business owners around the world spend
              an estimated US $1–4 billion every year on invoicing software they barely use — paying
              monthly subscriptions for tools that, at their core, do nothing more sophisticated
              than a good spreadsheet template. We think that is a problem worth solving, and the
              solution does not need to be complicated. It just needs to be honest.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why InvoiceGen Exists</h2>
            <p>
              Most invoice generators today are designed to upsell you. You start with a
              &quot;free&quot; tool, hit a paywall when you try to download a PDF, get asked to sign
              up, then get charged $10–30 per month for features that should be free. We built
              InvoiceGen to be different.
            </p>
            <p className="mt-4">
              Every feature competitors charge for — custom logos, multiple templates,
              multi-currency support, digital signatures, payment QR codes, recurring invoices,
              multi-language output, country-specific tax compliance — is{" "}
              <strong>100% free here</strong>. Forever. No tricks, no asterisks, no premium tier
              waiting in the wings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Who It Is For</h2>
            <p className="mb-4">
              InvoiceGen is built for the millions of people who do not need (and should not have to
              pay for) enterprise invoicing software:
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>Freelance designers, developers, writers, editors, and consultants</li>
              <li>Small business owners and shop owners</li>
              <li>Photographers, videographers, and creative professionals</li>
              <li>Tradespeople — plumbers, electricians, contractors, painters, landscapers</li>
              <li>Service providers — tutors, trainers, coaches, therapists</li>
              <li>Side-project sellers and one-person operations</li>
              <li>Anyone who occasionally needs to send a professional invoice and wants it to look right</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Values</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">1. Free means free.</h3>
                <p>No paywall, no premium tier, no &quot;upgrade for unlimited&quot; trick. The same tool that helps your first client gets you through your thousandth.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">2. Privacy by design.</h3>
                <p>Your invoice content stays in your browser. We do not have a database of your invoices, and we never transmit sender, client, or line-item data to our servers.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">3. Honest funding.</h3>
                <p>We are funded by Google AdSense advertising — clearly labelled, never deceptive. The ads pay for hosting and let us keep the tool free for everyone.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">4. Built for the world.</h3>
                <p>120+ countries, 30+ currencies, 24 languages, country-specific tax compliance (GST, VAT, IVA, sales tax). Default to localised, not US-centric.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5. No dark patterns.</h3>
                <p>No misleading buttons, no fake limited-time offers, no hidden checkboxes that opt you into newsletters. The behaviour you see is the behaviour you get.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacy by Design</h2>
            <p>
              <strong>Your invoice content stays in your browser.</strong> Sender details, client
              details, line items, saved clients, templates, and product catalogues are stored in
              your browser&apos;s localStorage and never transmitted to our servers. We do not have
              user accounts or a database of your invoices.
            </p>
            <p className="mt-4">
              Read our full{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              for the technical details on cookies, anonymous usage analytics, third-party services,
              and GDPR / CCPA rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Built For Everyone, Worldwide</h2>
            <p>InvoiceGen supports:</p>
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
            <p className="mt-4">
              We auto-detect your country, set the right currency, apply the correct tax label
              (GST, VAT, IVA, etc.), and translate the invoice output into your client&apos;s
              language. All instantly, with zero configuration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What You Can Do With InvoiceGen</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>Create unlimited professional invoices and download as PDF</li>
              <li>Choose from 10 design templates (Classic, Modern, Minimal, Executive, and more)</li>
              <li>Add your logo, digital signature, and payment QR code</li>
              <li>Calculate tax (GST / VAT / sales tax) automatically per country</li>
              <li>Send invoices directly via email from the browser</li>
              <li>Save clients and product catalogues for one-click reuse</li>
              <li>Generate proforma invoices, quotations, and credit notes from the same tool</li>
              <li>Translate the invoice into 24 languages so non-English clients can read it</li>
              <li>Read our{" "}
                <Link href="/blog" className="text-blue-600 hover:underline">blog</Link>{" "}
                for invoicing guides, tax compliance walkthroughs, and best-practice articles
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Open Feedback</h2>
            <p>
              We read every single piece of feedback. If something is broken, missing, or could be
              better, we want to know. We are a small project, but we ship fast — most reported
              bugs are fixed within 48 hours, and most requested features ship within a couple of
              weeks if they fit the mission.
            </p>
            <p className="mt-4">
              Have an idea or found a bug? Email us at{" "}
              <a
                href="mailto:iimtatul102@gmail.com"
                className="text-blue-600 hover:underline"
              >
                iimtatul102@gmail.com
              </a>{" "}
              or use our{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">
                feedback form
              </Link>{" "}
              — both go straight to the developer.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">The Story</h2>
            <p>
              InvoiceGen was built by an independent developer who got tired of seeing freelancers
              and small business owners pay $10–30 per month for invoicing tools that should be
              free. The cost of hosting a tool like this is essentially zero. There is no good
              reason it should cost anyone anything. So this exists.
            </p>
            <p className="mt-4">
              We launched in early 2026 with one goal: build the most useful free invoice generator
              on the internet, and keep it that way. Every feature is shaped by direct user
              feedback. The roadmap is shaped by the gap between what large invoicing companies
              charge for and what the underlying technology actually costs to run — which, in most
              cases, is essentially nothing.
            </p>
            <p className="mt-4">
              If InvoiceGen has helped you, the best thank-you is to tell another freelancer about
              it. Word of mouth keeps free tools alive.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Is InvoiceGen really free? What is the catch?</h3>
                <p>
                  Yes, genuinely free. The site is supported by Google AdSense advertising that
                  appears on some pages — that pays for hosting, email delivery, and the tool stays
                  free in return. There is no premium tier, no signup wall, no invoice limit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Do I need to create an account?</h3>
                <p>
                  No. There are no accounts. Your invoices, saved clients, and templates are stored
                  in your browser&apos;s localStorage and never leave your device.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What happens to my data?</h3>
                <p>
                  Nothing. Your invoice content never reaches our servers. We do not have a database
                  of your invoices. Clearing your browser data permanently removes everything you
                  have saved. See our{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>{" "}
                  for the full breakdown.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Are the invoices legally compliant?</h3>
                <p>
                  We support country-specific tax fields and labels (GSTIN, VAT number, ABN, etc.)
                  for 120+ countries, but we cannot guarantee compliance with every jurisdiction or
                  niche industry. Always verify with a qualified accountant for your specific
                  situation. See our blog guides on{" "}
                  <Link href="/blog/gst-invoice-india-compliance" className="text-blue-600 hover:underline">India GST</Link>,{" "}
                  <Link href="/blog/vat-invoice-uk-freelancers" className="text-blue-600 hover:underline">UK VAT</Link>, and{" "}
                  <Link href="/blog/tax-invoice-requirements-by-country" className="text-blue-600 hover:underline">tax invoice requirements globally</Link>{" "}
                  for starting points.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Will you ever introduce paid features?</h3>
                <p>
                  No. The mission is free invoicing for everyone. If we ever cannot sustain the
                  tool with advertising alone, we will say so transparently before changing
                  anything.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Can I use InvoiceGen for my business?</h3>
                <p>
                  Yes. Freelancers, sole traders, small businesses, agencies — anyone who needs to
                  issue invoices. There is no limit on the number of invoices, clients, or
                  templates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">How do I report a bug or suggest a feature?</h3>
                <p>
                  Email{" "}
                  <a
                    href="mailto:iimtatul102@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    iimtatul102@gmail.com
                  </a>{" "}
                  or use the{" "}
                  <Link href="/#feedback" className="text-blue-600 hover:underline">feedback form</Link>{" "}
                  on the homepage. Messages go straight to the developer.
                </p>
              </div>
            </div>
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
