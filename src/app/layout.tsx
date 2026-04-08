import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import MobileMenu from "@/components/MobileMenu";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import { INDUSTRY_LIST } from "@/lib/industries";
import { SEO_COUNTRY_LIST } from "@/lib/seoCountries";
import { HOW_TO_LIST } from "@/lib/howToGuides";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Free Invoice Generator - PDF Download, No Signup | InvoiceGen",
    template: "%s | InvoiceGen - Free Invoice Generator",
  },
  description:
    "Create professional invoices in seconds. 100% free online invoice generator with 10 templates, 30+ currencies, live preview, and instant PDF download. No signup, no limits.",
  keywords: [
    "free invoice generator",
    "invoice maker",
    "create invoice online",
    "PDF invoice",
    "invoice template",
    "free invoice maker",
    "online invoice generator",
    "invoice generator no signup",
    "professional invoice",
    "freelancer invoice",
    "small business invoice",
    "invoice generator free no sign up",
    "free invoice template",
    "invoice format",
    "GST invoice generator",
    "VAT invoice template",
    "receipt generator",
    "billing software free",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Free Invoice Generator - PDF Download, No Signup",
    description:
      "Create professional invoices in seconds. 10 templates, 30+ currencies, live preview, instant PDF. 100% free, no signup.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "InvoiceGen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Invoice Generator - No Signup Required",
    description:
      "Create professional invoices in seconds. 10 templates, 30+ currencies, instant PDF download. 100% free.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here after setup
    // google: "your-verification-code",
  },
};

// JSON-LD schemas for rich results
const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "InvoiceGen - Free Invoice Generator",
  "url": SITE_URL,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "featureList": [
    "PDF invoice generation",
    "10 professional invoice templates",
    "30+ currency support",
    "Logo upload",
    "Digital signature",
    "QR code payments",
    "Email invoices directly",
    "Multi-language invoices (24 languages)",
    "Country-specific tax compliance",
    "Client management",
    "Product catalog",
    "Recurring invoice reminders",
    "No signup required",
  ],
  "softwareVersion": "1.0",
  "creator": { "@type": "Organization", "name": "InvoiceGen" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this invoice generator really free?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes, InvoiceGen is 100% free with no hidden charges, no signup required, and no limits on the number of invoices you can create or download." },
    },
    {
      "@type": "Question",
      "name": "Do I need to create an account?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Start creating your invoice immediately. No registration, login, or email address required. Your data stays in your browser." },
    },
    {
      "@type": "Question",
      "name": "What currencies are supported?",
      "acceptedAnswer": { "@type": "Answer", "text": "InvoiceGen supports 30+ currencies including USD, EUR, GBP, INR, CAD, AUD, JPY, AED, SAR, BRL, MXN, KRW, SGD, CHF, NGN, PKR, BDT, and many more." },
    },
    {
      "@type": "Question",
      "name": "Is my data safe?",
      "acceptedAnswer": { "@type": "Answer", "text": "All invoice data stays in your browser. Nothing is stored on our servers. Your financial information never leaves your device." },
    },
    {
      "@type": "Question",
      "name": "Can I add my company logo and signature?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Upload your logo, draw or upload a digital signature, customize colors and fonts — all free features that other tools charge $10-20/month for." },
    },
    {
      "@type": "Question",
      "name": "How do I create an invoice?",
      "acceptedAnswer": { "@type": "Answer", "text": "Fill in your business details, add client information, list your items or services, choose a template, and click Download PDF. The entire process takes under 2 minutes." },
    },
    {
      "@type": "Question",
      "name": "Can I send invoices by email?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. InvoiceGen lets you email invoices directly to clients with the PDF attached, using a professional email template." },
    },
    {
      "@type": "Question",
      "name": "Does it work for my country?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. InvoiceGen supports 120+ countries with auto-detected currency, country-specific tax labels (GST, VAT, IVA, etc.), and compliance notes for legal invoice requirements." },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a Professional Invoice Online for Free",
  "description": "Create and download a professional PDF invoice in under 2 minutes using InvoiceGen.",
  "totalTime": "PT2M",
  "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
  "tool": { "@type": "HowToTool", "name": "InvoiceGen Free Invoice Generator" },
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Enter your business details", "text": "Add your company name, address, email, and optionally upload your logo.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 2, "name": "Add client information", "text": "Enter the client name and billing address. Save clients for reuse on future invoices.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 3, "name": "List your items or services", "text": "Add line items with descriptions, quantities, and rates. Tax, discounts, and totals calculate automatically.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 4, "name": "Choose a template and customize", "text": "Select from 10 professional templates. Customize colors, fonts, add payment QR codes and digital signatures.", "url": `${SITE_URL}/#generator` },
    { "@type": "HowToStep", "position": 5, "name": "Download or email your invoice", "text": "Click Download PDF for an instant professional invoice, or email it directly to your client.", "url": `${SITE_URL}/#generator` },
  ],
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "InvoiceGen",
  "url": SITE_URL,
  "logo": `${SITE_URL}/icon.png`,
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "url": `${SITE_URL}/#feedback` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Analytics />
        <JsonLd data={webAppSchema} />
        <JsonLd data={faqSchema} />
        <JsonLd data={howToSchema} />
        <JsonLd data={orgSchema} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)]">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Invoice<span className="text-blue-600">Gen</span>
                </span>
              </a>
              <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
                <a href="/#generator" className="hover:text-blue-600 transition-colors">Generator</a>
                <a href="/gallery" className="hover:text-blue-600 transition-colors">Gallery</a>
                <a href="/invoice-template" className="hover:text-blue-600 transition-colors">Templates</a>
                <a href="/invoice-generator" className="hover:text-blue-600 transition-colors">By Country</a>
                <a href="/how-to" className="hover:text-blue-600 transition-colors">Guides</a>
                <a href="/templates" className="hover:text-amber-600 transition-colors">My Invoices</a>
              </nav>
              <MobileMenu />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <CookieConsent />

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Brand row */}
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">Invoice<span className="text-blue-600">Gen</span></span>
              </div>
              <p className="text-sm text-gray-500 max-w-2xl">
                Free professional invoice generator. No signup, no hidden fees, no limits. Made for freelancers & small businesses worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {/* Quick Links */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Links</h4>
                <nav className="flex flex-col gap-2">
                  <a href="/#generator" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Generator</a>
                  <a href="/gallery" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Template Gallery</a>
                  <a href="/invoice-template" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">All Templates</a>
                  <a href="/invoice-generator" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">By Country</a>
                  <a href="/how-to" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">How-To Guides</a>
                  <a href="/templates" className="text-sm text-gray-500 hover:text-amber-600 transition-colors">My Invoices</a>
                  <a href="/#features" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Features</a>
                  <a href="/#faq" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">FAQ</a>
                  <a href="/#feedback" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Feedback</a>
                </nav>
              </div>

              {/* Industry Templates — column 1 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  <a href="/invoice-template" className="hover:text-blue-600">Templates by Industry</a>
                </h4>
                <nav className="flex flex-col gap-2">
                  {INDUSTRY_LIST.slice(0, 8).map((i) => (
                    <a key={i.slug} href={`/invoice-template/${i.slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      {i.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Industry Templates — column 2 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">More Templates</h4>
                <nav className="flex flex-col gap-2">
                  {INDUSTRY_LIST.slice(8).map((i) => (
                    <a key={i.slug} href={`/invoice-template/${i.slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      {i.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Countries */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  <a href="/invoice-generator" className="hover:text-blue-600">By Country</a>
                </h4>
                <nav className="flex flex-col gap-2">
                  {SEO_COUNTRY_LIST.map((c) => (
                    <a key={c.slug} href={`/invoice-generator/${c.slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      {c.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* How-To Guides */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  <a href="/how-to" className="hover:text-blue-600">Invoice Guides</a>
                </h4>
                <nav className="flex flex-col gap-2">
                  {HOW_TO_LIST.map((g) => (
                    <a key={g.slug} href={`/how-to/${g.slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      {g.title.replace(/^How to /, "")}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Sub-footer nav — slim row of secondary links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-500 mb-4">
                <a href="/about" className="hover:text-blue-600 transition-colors">About</a>
                <span className="text-gray-300" aria-hidden="true">·</span>
                <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</a>
                <span className="text-gray-300" aria-hidden="true">·</span>
                <a href="/terms" className="hover:text-blue-600 transition-colors">Terms</a>
                <span className="text-gray-300" aria-hidden="true">·</span>
                <a href="/#feedback" className="hover:text-blue-600 transition-colors">Contact</a>
              </nav>

              {/* Bottom bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  &copy; {new Date().getFullYear()} InvoiceGen. All rights reserved.
                </p>
                <p className="text-xs text-gray-400">
                  Free invoice generator for freelancers, creators &amp; small businesses worldwide.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
