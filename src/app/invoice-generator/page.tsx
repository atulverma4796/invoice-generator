import { Metadata } from "next";
import Link from "next/link";
import { SEO_COUNTRY_LIST } from "@/lib/seoCountries";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Invoice Generator by Country - 10+ Country-Specific Templates",
  description: "Country-specific invoice generators for India (GST), UK (VAT), USA, Canada, Australia (GST), UAE, Singapore, Germany, Brazil, and South Africa. Free PDF download, no signup.",
  alternates: { canonical: `${SITE_URL}/invoice-generator` },
  openGraph: {
    title: "Free Invoice Generator by Country",
    description: "10+ country-specific invoice generators with local tax compliance, currency, and legal requirements built in.",
    url: `${SITE_URL}/invoice-generator`,
  },
};

export default function CountryIndexPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-200">
            ✓ {SEO_COUNTRY_LIST.length} Countries Supported
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Free Invoice Generator by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Country
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Country-specific invoice generators with local tax compliance, currency, and legal requirements built in.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEO_COUNTRY_LIST.map((country) => (
              <Link
                key={country.slug}
                href={`/invoice-generator/${country.slug}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{country.name}</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{country.currency}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  <span className="font-semibold text-gray-700">{country.taxName}:</span> {country.taxRate}
                </p>
                <p className="text-xs text-blue-600 font-medium group-hover:underline">View {country.name} generator →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
