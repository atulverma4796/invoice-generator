import { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "InvoiceGen privacy policy. Detailed disclosure of how we handle data, cookies, advertising (Google AdSense), analytics, third-party services, and your rights under GDPR and CCPA.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "April 28, 2026";

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

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              This privacy policy explains how InvoiceGen (&quot;we&quot;, &quot;our&quot;, or
              &quot;the service&quot;) collects, uses, discloses, and safeguards information when
              you visit <a href={SITE_URL} className="text-blue-600 hover:underline">freeinvoicegen.org</a> or
              use our free invoice generator. The short version:{" "}
              <strong>your invoice data stays on your device</strong>, we do not require accounts,
              and we never sell your information. The longer version follows.
            </p>
            <p className="mt-3">
              By using InvoiceGen, you consent to the practices described in this policy. If you do
              not agree, please discontinue use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Do Not Collect</h2>
            <p>
              We have deliberately built InvoiceGen to minimise the personal information we touch.
              We <strong>do not</strong>:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
              <li>Require user registration or accounts</li>
              <li>Store your invoice content (sender, client, line items, totals) on our servers</li>
              <li>Store your saved templates, clients, or product catalogues on our servers</li>
              <li>Store your uploaded logos or signatures on our servers</li>
              <li>Sell, rent, or trade any information to third parties</li>
              <li>Use your invoice data to train machine-learning models</li>
            </ul>
            <p className="mt-3">
              Invoice content, saved templates, saved clients, product catalogues, uploaded logos,
              and signatures are stored entirely in your browser&apos;s <strong>localStorage</strong>
              and never transmitted to our servers. You can clear this data anytime through your
              browser settings (Settings → Privacy → Clear browsing data → Cookies and site data).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Do Collect</h2>
            <p>We collect a limited set of information for legitimate site-operation purposes:</p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
              <li>
                <strong>Server log data</strong> — when you visit the site, our hosting provider
                (Vercel) automatically records standard request logs including IP address, browser
                user-agent, referring URL, and request timestamps. This is used to operate the
                service, prevent abuse, and diagnose issues.
              </li>
              <li>
                <strong>Analytics data</strong> — see Section 3 below.
              </li>
              <li>
                <strong>Feedback messages</strong> — if you submit feedback via our contact form, we
                receive your message and any name or email you choose to share. We use this only to
                respond to you or improve the service.
              </li>
              <li>
                <strong>Email-send metadata</strong> — if you use our optional &quot;email this
                invoice&quot; feature, we transmit the recipient address and the rendered PDF
                through a third-party email provider. The PDF is not retained beyond delivery.
              </li>
              <li>
                <strong>Anonymous interaction events</strong> — when you download or email an
                invoice, we record an anonymous event with high-level feature-usage and
                abuse-detection signals. These events are not linked to your name, email, or
                invoice content.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies and Analytics</h2>
            <p>
              InvoiceGen uses <strong>Google Analytics 4</strong> to understand how visitors use
              the site so we can improve it. Google Analytics may set cookies on your browser to
              identify unique visitors and measure aggregate behaviour (page views, browser type,
              general region inferred from IP, session duration, traffic sources).
            </p>
            <p className="mt-3">
              We have configured Google Analytics with IP anonymisation enabled and do not transmit
              personally identifiable information. You can opt out of Google Analytics by installing
              the official browser add-on at{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                tools.google.com/dlpage/gaoptout
              </a>{" "}
              or by declining analytics in our cookie banner on first visit.
            </p>
            <p className="mt-3">
              We may also use functional cookies and localStorage entries to remember your preferences
              (selected template, currency, language) between sessions. These are first-party only
              and do not track you across other sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Advertising and Google AdSense</h2>
            <p>
              InvoiceGen displays advertising provided by <strong>Google AdSense</strong>, a
              third-party advertising network operated by Google LLC. AdSense allows us to keep the
              service free for everyone. Important things to know about AdSense on this site:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
              <li>
                Google, as a third-party vendor, uses cookies (including the{" "}
                <strong>DART cookie</strong>) to serve ads on our site based on visits to this and
                other sites on the internet.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to
                users based on their visits to this site and other sites.
              </li>
              <li>
                You may opt out of personalised advertising by visiting Google&apos;s{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Ads Settings
                </a>{" "}
                page.
              </li>
              <li>
                You can also opt out of a third-party vendor&apos;s use of cookies for
                personalised advertising by visiting{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.aboutads.info
                </a>
                .
              </li>
              <li>
                Detailed information on the Google advertising privacy practices is available at{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  policies.google.com/technologies/ads
                </a>
                .
              </li>
            </ul>
            <p className="mt-3">
              We do not control the content of ads served by Google AdSense or the data Google
              collects through them. Inclusion of third-party advertising is not an endorsement of
              the advertised products or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p>The following third parties process limited data on our behalf:</p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
              <li>
                <strong>Vercel</strong> — hosting and content delivery. Vercel processes server logs
                and traffic data. See{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Vercel&apos;s privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Google LLC</strong> — Google Analytics, Google AdSense, and Google Fonts.
                See{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google&apos;s privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery (only if you use the
                &quot;email this invoice&quot; feature). Resend processes the recipient email
                address and the PDF for delivery. See{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Resend&apos;s privacy policy
                </a>
                .
              </li>
              <li>
                <strong>IP geolocation services</strong> (ipapi.co, ip-api.com) — used to detect
                country and currency for invoice localisation. Your IP address is sent to these
                services in order to return geographic data. We do not retain the response beyond
                the active session.
              </li>
            </ul>
            <p className="mt-3">
              Each third party has its own privacy policy governing how it handles data. We
              recommend reviewing them if you have specific concerns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
            <p>
              Because we do not store your invoice content, there is nothing for us to retain in
              that respect. The limited data we do collect is retained as follows:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
              <li>Server logs: 30 days, then automatically purged</li>
              <li>Google Analytics data: 14 months (default GA4 retention setting)</li>
              <li>
                Feedback messages: retained until the issue is resolved, then deleted within 12
                months
              </li>
              <li>
                Email delivery records: not retained on our end; Resend retains delivery metadata
                per their policy
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights Under GDPR (EU/UK)</h2>
            <p>
              If you are located in the European Economic Area, the United Kingdom, or Switzerland,
              you have rights under the General Data Protection Regulation (GDPR) and equivalent
              local laws, including:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
              <li>The right to access any personal data we hold about you</li>
              <li>The right to request correction of inaccurate data</li>
              <li>The right to request deletion of your personal data</li>
              <li>The right to restrict or object to processing</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent at any time</li>
              <li>The right to lodge a complaint with your local data protection authority</li>
            </ul>
            <p className="mt-3">
              Because most data on InvoiceGen lives in your browser, many of these rights are
              already in your hands — clearing your browser data deletes everything. For data we do
              hold (server logs, feedback messages), contact us via the{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">feedback form</Link>{" "}
              and we will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights Under CCPA (California)</h2>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) and
              California Privacy Rights Act (CPRA) give you specific rights regarding your personal
              information, including the right to know what categories we collect, the right to
              delete personal information we hold, and the right to opt out of any &quot;sale&quot;
              of personal information.
            </p>
            <p className="mt-3">
              <strong>We do not sell personal information</strong> as the term is defined in CCPA.
              We do not knowingly collect or sell the personal information of minors under 16.
            </p>
            <p className="mt-3">
              To exercise your CCPA rights, contact us via the{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">feedback form</Link>.
              We will respond within 45 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. International Data Transfers</h2>
            <p>
              Our hosting provider (Vercel) operates globally, and your traffic may be served from
              edge locations in your region. Some third-party services (Google, Resend) are based in
              the United States and may process data there. Where required, these transfers rely on
              standard contractual clauses or other lawful transfer mechanisms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Children&apos;s Privacy</h2>
            <p>
              InvoiceGen is not directed at children under the age of 16. We do not knowingly
              collect personal information from children. If you are a parent or guardian and
              believe your child has provided us with personal information, please contact us and
              we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Do Not Track</h2>
            <p>
              Some browsers send a &quot;Do Not Track&quot; (DNT) signal. There is no industry
              consensus on how to interpret DNT, and our service does not currently respond to DNT
              signals. We minimise tracking by default — you can decline non-essential cookies via
              our consent banner, and core functionality (creating, downloading, emailing invoices)
              never depends on tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Security</h2>
            <p>
              We use industry-standard measures to protect the limited data we do hold. The site is
              served over HTTPS only, with HSTS enabled. However, no method of internet
              transmission or electronic storage is 100% secure, and we cannot guarantee absolute
              security. You are responsible for the security of the device you use to access
              InvoiceGen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time to reflect changes in our
              practices, the services we use, or applicable law. Material changes will be reflected
              by an updated &quot;Last updated&quot; date at the top of this page. We encourage you
              to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Contact Us</h2>
            <p>
              Questions, requests, or complaints about this privacy policy? You can reach us by
              email at{" "}
              <a
                href="mailto:iimtatul102@gmail.com"
                className="text-blue-600 hover:underline"
              >
                iimtatul102@gmail.com
              </a>{" "}
              or via the{" "}
              <Link href="/#feedback" className="text-blue-600 hover:underline">feedback form</Link>.
              We aim to respond to all privacy-related inquiries within 7 business days, and to
              GDPR/CCPA rights requests within the statutory deadlines (30 days for GDPR, 45 days
              for CCPA).
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
