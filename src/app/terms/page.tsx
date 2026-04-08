import { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://invoicegen.app";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "InvoiceGen terms of service. Read the rules of using our free invoice generator. By using the site, you agree to these terms.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "April 8, 2026";

export default function TermsPage() {
  return (
    <div className="bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <nav className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">Terms of Service</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed">
              Welcome to InvoiceGen. By using this website, you agree to these Terms of Service.
              Please read them carefully. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. The Service</h2>
            <p className="text-gray-700">
              InvoiceGen is a free, browser-based invoice generator. You can create, customize, and
              download professional PDF invoices without signing up or paying. The service is
              provided as-is on a best-effort basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Free to Use</h2>
            <p className="text-gray-700">
              InvoiceGen is 100% free. There are no paywalls, premium tiers, or hidden fees. You
              can create unlimited invoices at no cost. The service is supported by advertising and
              donations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Acceptable Use</h2>
            <p className="text-gray-700 mb-2">You agree NOT to use InvoiceGen to:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Create fraudulent, fake, or misleading invoices</li>
              <li>• Impersonate another person or business</li>
              <li>• Conduct any illegal activity in your jurisdiction</li>
              <li>• Send spam or unsolicited emails through our email feature</li>
              <li>• Reverse-engineer, decompile, or attempt to extract source code from the service</li>
              <li>• Overwhelm our servers with automated requests or scraping</li>
              <li>• Violate any applicable laws, regulations, or third-party rights</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We reserve the right to block access from any IP address engaged in abusive behavior.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. No Account Required</h2>
            <p className="text-gray-700">
              InvoiceGen does not require an account. All your data is stored locally in your
              browser. You are responsible for backing up any saved templates or clients you wish
              to keep, as clearing your browser data will permanently delete them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Content</h2>
            <p className="text-gray-700">
              Anything you enter into InvoiceGen (sender details, client details, line items, etc.)
              belongs to you. We do not claim any ownership over the invoices you create. We do not
              store your invoice content on our servers — it stays in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Tax & Legal Compliance</h2>
            <p className="text-gray-700">
              <strong>InvoiceGen does not provide tax or legal advice.</strong> While we strive to
              help you create invoices that meet common legal requirements in various countries,
              we cannot guarantee compliance with every jurisdiction&apos;s rules. You are solely
              responsible for ensuring your invoices meet your local tax and legal requirements.
            </p>
            <p className="text-gray-700 mt-3">
              Always consult a qualified accountant or tax advisor for specific advice about
              invoicing in your country, region, or industry.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. No Warranty</h2>
            <p className="text-gray-700">
              InvoiceGen is provided <strong>&quot;as is&quot;</strong> without warranty of any
              kind, express or implied, including but not limited to warranties of merchantability,
              fitness for a particular purpose, or non-infringement. We do not warrant that the
              service will be uninterrupted, error-free, or completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, InvoiceGen and its creators will not be
              liable for any indirect, incidental, special, consequential, or punitive damages —
              including but not limited to loss of profits, data, or business — arising from your
              use of or inability to use the service.
            </p>
            <p className="text-gray-700 mt-3">
              Our total liability for any claims related to the service shall not exceed the amount
              you paid us in the past 12 months — which, since the service is free, is zero.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Third-Party Services</h2>
            <p className="text-gray-700">
              The service may include links to third-party websites or services (such as Google
              Analytics, Google AdSense, Vercel, payment providers). We are not responsible for the
              content, privacy policies, or practices of any third-party services. You access them
              at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Advertisements</h2>
            <p className="text-gray-700">
              InvoiceGen may display third-party advertisements (such as Google AdSense) to support
              the free service. We do not endorse the products or services in these ads. Any
              transactions you enter into with advertisers are between you and them — we are not
              responsible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to These Terms</h2>
            <p className="text-gray-700">
              We may update these terms from time to time. Continued use of the service after
              changes are posted constitutes acceptance of the new terms. The &quot;Last updated&quot;
              date at the top of this page reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Termination</h2>
            <p className="text-gray-700">
              We reserve the right to terminate or restrict your access to InvoiceGen at any time,
              without notice, for any reason — including but not limited to violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Governing Law</h2>
            <p className="text-gray-700">
              These terms are governed by the laws of India. Any disputes arising from your use of
              InvoiceGen will be resolved in the courts of India, unless local consumer protection
              laws require otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Contact</h2>
            <p className="text-gray-700">
              Questions about these terms? Reach out via our{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">
                feedback form
              </Link>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
