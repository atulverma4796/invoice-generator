import { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "InvoiceGen terms of service. By using our free invoice generator you agree to these terms. Covers acceptable use, intellectual property, disclaimers, limitations of liability, and dispute resolution.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "April 28, 2026";

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

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              Welcome to InvoiceGen (&quot;we&quot;, &quot;our&quot;, &quot;the service&quot;).
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of{" "}
              <a href={SITE_URL} className="text-blue-600 hover:underline">freeinvoicegen.org</a>{" "}
              and any related features, content, or applications (collectively, the
              &quot;Service&quot;). By using the Service, you agree to be bound by these Terms. If
              you do not agree, you must not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility</h2>
            <p>
              You must be at least 16 years old to use InvoiceGen. By using the Service, you
              represent and warrant that you are at least 16 and have the legal capacity to enter
              into these Terms. If you are using the Service on behalf of a business or other
              entity, you represent that you have authority to bind that entity to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. The Service</h2>
            <p>
              InvoiceGen is a free, browser-based invoice generator that lets you create,
              customise, preview, download, and email professional invoices without registration.
              The Service is provided on an as-is, best-effort basis and is supported by
              advertising. We may add, modify, or remove features at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Free to Use</h2>
            <p>
              Core functionality is and will remain 100% free, with no paywalls, premium tiers, or
              hidden fees. There is no limit on the number of invoices you can create. The Service
              is supported by Google AdSense advertising; see our{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="mb-2">You agree NOT to use InvoiceGen to:</p>
            <ul className="space-y-2 list-disc pl-6">
              <li>Create fraudulent, fake, or misleading invoices</li>
              <li>Impersonate another person, business, or entity</li>
              <li>Conduct any activity that is illegal in your jurisdiction</li>
              <li>Send spam, phishing, or unsolicited bulk email through our email feature</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code from the Service</li>
              <li>Probe, scan, or test the vulnerability of any system or network</li>
              <li>Overwhelm our servers with automated requests, scraping, or denial-of-service traffic</li>
              <li>Distribute malware, viruses, or other harmful code through any feature of the Service</li>
              <li>Violate any applicable laws, regulations, or third-party rights (including intellectual property, privacy, and contract rights)</li>
              <li>Use the Service in any way that disrupts, harms, or limits the experience of other users</li>
            </ul>
            <p className="mt-3">
              We reserve the right to investigate suspected violations and to block, suspend, or
              terminate access from any account, IP address, or device engaged in abusive behaviour.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. No Account Required</h2>
            <p>
              InvoiceGen does not require account registration. All your data — invoice content,
              saved templates, saved clients, product catalogues, logos, signatures — is stored
              locally in your browser&apos;s localStorage. You are solely responsible for backing
              up any saved data you wish to keep. Clearing your browser data, switching browsers, or
              using private/incognito mode will permanently remove this information from your
              device, and we cannot recover it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Content</h2>
            <p>
              You retain all ownership rights in any content you create or upload through the
              Service (sender details, client details, line items, logos, signatures, invoice PDFs).
              We do not claim any ownership over your content, and we do not store your invoice
              content on our servers.
            </p>
            <p className="mt-3">
              You represent and warrant that you have all necessary rights to any content you
              upload — including logos and images — and that your use of the Service does not
              infringe any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Tax and Legal Compliance</h2>
            <p>
              <strong>InvoiceGen does not provide tax, legal, financial, or accounting advice.</strong>{" "}
              While we strive to help you create invoices that meet common legal requirements in
              various countries (GST, VAT, sales tax, etc.), we cannot and do not guarantee
              compliance with the rules of any specific jurisdiction, industry, or transaction. You
              are solely responsible for ensuring that the invoices you generate meet your local
              tax, regulatory, and contractual obligations.
            </p>
            <p className="mt-3">
              Always consult a qualified accountant, tax advisor, or attorney for specific advice
              about invoicing in your country, region, or business sector.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p>
              The Service — including its design, code, logos, content (excluding user-generated
              content), and trademarks — is owned by InvoiceGen and protected by copyright,
              trademark, and other intellectual property laws. We grant you a limited,
              non-exclusive, non-transferable, revocable licence to use the Service for your
              personal or internal business purposes, subject to these Terms.
            </p>
            <p className="mt-3">
              The blog content and educational guides published on this site are licensed under{" "}
              the same Terms — you may read and reference them, but reposting or republishing in
              substantial portions without attribution is not permitted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. No Warranty</h2>
            <p>
              THE SERVICE IS PROVIDED <strong>&quot;AS IS&quot;</strong> AND{" "}
              <strong>&quot;AS AVAILABLE&quot;</strong> WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, OR NON-INFRINGEMENT. We do not warrant
              that the Service will be uninterrupted, error-free, secure, free from viruses, or
              that defects will be corrected. You use the Service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, INVOICEGEN AND ITS CREATORS,
              CONTRIBUTORS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES — INCLUDING BUT NOT LIMITED
              TO LOSS OF PROFITS, REVENUE, DATA, BUSINESS OPPORTUNITY, OR GOODWILL — ARISING FROM
              OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE SERVICE, EVEN IF WE HAVE BEEN
              ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-3">
              Our total cumulative liability for any claim arising from or relating to the Service
              shall not exceed the greater of (a) the amount you have paid us in the twelve months
              preceding the claim, or (b) US $50. Because the Service is free, this typically means
              our liability is limited to US $50.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless InvoiceGen, its creators,
              contributors, and affiliates from and against any and all claims, damages, losses,
              liabilities, costs, and expenses (including reasonable legal fees) arising from or
              related to: (a) your use of the Service; (b) your violation of these Terms; (c) your
              violation of any third-party right (including intellectual property or privacy
              rights); or (d) any content you upload or generate through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Third-Party Services and Links</h2>
            <p>
              The Service may include links to third-party websites or rely on third-party services
              (such as Google Analytics, Google AdSense, Vercel hosting, Resend email, payment
              gateways, IP geolocation services, and others). We are not responsible for the
              content, privacy practices, or actions of any third party. Your use of third-party
              services is governed by their respective terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Advertising</h2>
            <p>
              InvoiceGen displays advertising provided by Google AdSense and possibly other ad
              networks. We do not endorse the products, services, or businesses featured in those
              advertisements. Any transactions or interactions between you and an advertiser are
              solely between you and that advertiser, and we are not responsible for them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time to reflect changes in our practices, our
              service, or applicable law. The &quot;Last updated&quot; date at the top of this page
              reflects the most recent revision. Continued use of the Service after changes are
              posted constitutes acceptance of the updated Terms. If you do not agree to a change,
              you must stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Termination</h2>
            <p>
              We reserve the right to terminate, suspend, or restrict your access to the Service at
              any time, without notice, for any reason — including but not limited to violation of
              these Terms or a request by law enforcement. You may stop using the Service at any
              time; clearing your browser data will remove your local data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">16. Severability</h2>
            <p>
              If any provision of these Terms is held to be unenforceable or invalid by a court of
              competent jurisdiction, that provision shall be modified to the minimum extent
              necessary to make it enforceable, and the remaining provisions shall remain in full
              force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">17. No Waiver</h2>
            <p>
              Our failure to enforce any right or provision of these Terms shall not be deemed a
              waiver of that right or provision. Any waiver must be in writing and signed by an
              authorised representative of InvoiceGen to be effective.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">18. Force Majeure</h2>
            <p>
              We are not liable for any failure or delay in performance caused by circumstances
              beyond our reasonable control, including acts of God, natural disasters, war,
              terrorism, riots, government action, network or hosting failures, or epidemics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">19. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of India, without regard to its conflict-of-laws
              rules. Any dispute arising from or relating to your use of the Service shall be
              resolved in the courts located in India, except where applicable consumer-protection
              law of your country of residence requires otherwise.
            </p>
            <p className="mt-3">
              We encourage you to contact us first to resolve any concern informally — most issues
              can be resolved quickly through our{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">feedback form</Link>{" "}
              before any formal dispute arises.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">20. Entire Agreement</h2>
            <p>
              These Terms, together with our{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>,
              constitute the entire agreement between you and InvoiceGen regarding the Service and
              supersede any prior agreements, understandings, or communications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">21. Contact</h2>
            <p>
              Questions about these Terms? Reach us via the{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">feedback form</Link>.
              We aim to respond within 7 business days.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
