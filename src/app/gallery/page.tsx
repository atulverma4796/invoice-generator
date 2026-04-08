import { Metadata } from "next";
import Link from "next/link";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import { getStaticSampleInvoice, ALL_TEMPLATE_IDS } from "@/lib/sampleInvoice";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Invoice Template Gallery — 10 Free Designs to Pick From",
  description: "Browse 10 free professional invoice templates side by side. Pick the design you like, click Use, and download a beautiful PDF in seconds. No signup required.",
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: {
    title: "Invoice Template Gallery — 10 Free Designs",
    description: "10 professional invoice templates. Pick one, customize, download. Free forever.",
    url: `${SITE_URL}/gallery`,
  },
};

export default function GalleryPage() {
  // Build sample data once — each card overrides the template
  const baseData = getStaticSampleInvoice();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Gallery</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-200">
            ✓ {ALL_TEMPLATE_IDS.length} Free Templates
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Invoice Template{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Pick the design you like best. Click <strong>Use this template</strong> and start
            editing instantly — no signup required.
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_TEMPLATE_IDS.map((templateId) => (
              <TemplatePreviewCard
                key={templateId}
                templateId={templateId}
                data={baseData}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 shadow-2xl shadow-blue-200">
            <h2 className="text-3xl font-bold text-white mb-3">Need an industry-specific template?</h2>
            <p className="text-blue-100 mb-6">Browse 15 industry-tailored invoice templates with sample line items.</p>
            <Link
              href="/invoice-template"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Browse Industries
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
