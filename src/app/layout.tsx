import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import MobileMenu from "@/components/MobileMenu";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import AppToaster from "@/components/AppToaster";
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
    default: "Free Invoice, Quotation, Salary Slip & More — No Signup | InvoiceGen",
    template: "%s | InvoiceGen — Free PDF Tools, No Signup",
  },
  description:
    "Cancel your invoice subscription. Generate invoices, quotations, purchase orders, delivery notes, salary slips, and rent receipts — free, no signup, no email collection. 30+ currencies, 24 languages, 120+ countries.",
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
    title: "Cancel your invoice subscription — InvoiceGen",
    description:
      "6 free PDF generators: invoice, quotation, purchase order, delivery note, salary slip, rent receipt. No signup, no email, no limits. 120+ countries.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "InvoiceGen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cancel your invoice subscription — InvoiceGen",
    description:
      "6 free PDF generators in one place: invoice, quotation, PO, delivery note, salary slip, rent receipt. No signup, ever.",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5211865118198179" crossOrigin="anonymous"></script>
        <JsonLd data={webAppSchema} />
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
              <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
                {/* Documents dropdown */}
                <div className="relative group">
                  <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2">
                    Documents
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-2 z-50">
                    <a href="/#generator" className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-lg leading-none mt-0.5">📄</span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">Invoice</span>
                        <span className="block text-xs text-gray-500">After work is done</span>
                      </span>
                    </a>
                    <a href="/quotation" className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-lg leading-none mt-0.5">💼</span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">Quotation</span>
                        <span className="block text-xs text-gray-500">Price proposal before work</span>
                      </span>
                    </a>
                    <a href="/purchase-order" className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-lg leading-none mt-0.5">🛒</span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">Purchase Order</span>
                        <span className="block text-xs text-gray-500">Buyer → seller authorization</span>
                      </span>
                    </a>
                    <a href="/delivery-note" className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-lg leading-none mt-0.5">📦</span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">Delivery Note</span>
                        <span className="block text-xs text-gray-500">Goods dispatch / India challan</span>
                      </span>
                    </a>
                    <a href="/salary-slip" className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-lg leading-none mt-0.5">💰</span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">Salary Slip</span>
                        <span className="block text-xs text-gray-500">Monthly payslip / payroll</span>
                      </span>
                    </a>
                    <a href="/rent-receipt" className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-lg leading-none mt-0.5">🏠</span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">Rent Receipt</span>
                        <span className="block text-xs text-gray-500">India HRA claim format</span>
                      </span>
                    </a>
                  </div>
                </div>

                {/* Resources dropdown */}
                <div className="relative group">
                  <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2">
                    Resources
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-2 z-50">
                    <a href="/gallery" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Template Gallery</a>
                    <a href="/invoice-template" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">By Industry</a>
                    <a href="/invoice-generator" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">By Country</a>
                    <div className="h-px bg-gray-100 my-2 mx-3" />
                    <a href="/how-to" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">How-to Guides</a>
                    <a href="/blog" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Blog</a>
                  </div>
                </div>

                <a href="/templates" className="hover:text-amber-600 transition-colors">My Invoices</a>
              </nav>
              <MobileMenu />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <CookieConsent />
        <AppToaster />

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
                  <a href="/blog" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Blog</a>
                  <a href="/quotation" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Quotation Generator</a>
                  <a href="/purchase-order" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Purchase Order Generator</a>
                  <a href="/delivery-note" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Delivery Note Generator</a>
                  <a href="/salary-slip" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Salary Slip Generator</a>
                  <a href="/rent-receipt" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Rent Receipt Generator</a>
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
                <span className="text-gray-300" aria-hidden="true">·</span>
                <a href="mailto:iimtatul102@gmail.com" className="hover:text-blue-600 transition-colors">iimtatul102@gmail.com</a>
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
