import { Metadata } from "next";
import Link from "next/link";
import { INDUSTRY_LIST } from "@/lib/industries";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Invoice Templates - 15+ Industry Templates, PDF Download",
  description: "Browse 15+ free professional invoice templates for freelancers, contractors, photographers, consultants, designers, and more. No signup, instant PDF download.",
  alternates: { canonical: `${SITE_URL}/invoice-template` },
  openGraph: {
    title: "Free Invoice Templates - 15+ Industry Templates",
    description: "15+ professional invoice templates for every industry. 100% free, no signup, instant PDF.",
    url: `${SITE_URL}/invoice-template`,
  },
};

export default function InvoiceTemplateIndexPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-200">
            ✓ {INDUSTRY_LIST.length} Free Templates — No Signup
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Free Invoice{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Templates
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Professional invoice templates for every industry. Pick your trade, customize, and download a beautiful PDF in seconds.
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {INDUSTRY_LIST.map((industry) => (
              <Link
                key={industry.slug}
                href={`/invoice-template/${industry.slug}`}
                className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{industry.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{industry.description}</p>
                <p className="text-xs text-blue-600 font-medium mt-3 group-hover:underline">View template →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 shadow-2xl shadow-blue-200">
            <h2 className="text-3xl font-bold text-white mb-3">Don&apos;t see your industry?</h2>
            <p className="text-blue-100 mb-6">All our templates work for any business. Just pick one and customize.</p>
            <a href="/#generator" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Create Any Invoice — Free
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
