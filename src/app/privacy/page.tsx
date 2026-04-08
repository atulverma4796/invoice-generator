import { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://invoicegen.app";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "InvoiceGen privacy policy. Your invoice data stays in your browser. We respect your privacy and never sell your data.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "April 8, 2026";

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <nav className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">Privacy Policy</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed">
              Your privacy matters to us. This policy explains how InvoiceGen handles your
              information when you use our free invoice generator. The short version:{" "}
              <strong>your invoice data stays on your device</strong>, we don&apos;t require
              accounts, and we never sell your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Invoice Data</h2>
            <p className="text-gray-700">
              All the invoices you create — including sender details, client details, line items,
              amounts, logos, and signatures — stay on your device. We don&apos;t require you to
              sign up, and we don&apos;t store your invoice content. You are in full control of
              your data at all times.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Saved Templates &amp; Clients</h2>
            <p className="text-gray-700">
              When you save templates, clients, or product items for reuse, that information is
              stored locally in your browser. It is not transmitted to our servers. You can clear
              it anytime through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies &amp; Analytics</h2>
            <p className="text-gray-700">
              We use industry-standard analytics services to understand how visitors use our site
              so we can improve it. These services may set cookies and collect anonymous usage
              information such as page views, browser type, and general region. We do not use this
              data to identify individual users.
            </p>
            <p className="text-gray-700 mt-3">
              You can control cookies through your browser settings or by using the cookie consent
              banner shown on your first visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Advertisements</h2>
            <p className="text-gray-700">
              InvoiceGen may display third-party advertisements to support the free service. These
              ads may use cookies to show relevant content. You can manage your ad preferences
              through your browser or device settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Feedback &amp; Contact</h2>
            <p className="text-gray-700">
              If you submit feedback through our contact form, we use your message (and optional
              name) only to respond to you. We don&apos;t share this information with anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Third-Party Services</h2>
            <p className="text-gray-700">
              We rely on a small number of trusted third-party services to host our site, deliver
              fonts, and provide analytics. These services have their own privacy policies that
              govern how they handle data they receive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-700">
              Depending on where you live, you may have rights regarding your personal data,
              including the right to access, correct, or delete it. Since we don&apos;t store
              personal information about you, most of these rights are already in your hands —
              you can clear your browser data anytime to remove everything.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              InvoiceGen is not directed at children under 13. We do not knowingly collect any
              information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this privacy policy from time to time. Changes will be reflected on
              this page with a new &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-700">
              Questions about this privacy policy? Reach out through our{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">
                feedback form
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
