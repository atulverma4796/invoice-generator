import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SEO_COUNTRIES, SEO_COUNTRY_LIST } from "@/lib/seoCountries";
import JsonLd from "@/components/JsonLd";
import AffiliateCard from "@/components/AffiliateCard";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";

function blogSlugsForCountry(slug: string): string[] {
  const universal = [
    "professional-invoice-complete-guide-2026",
    "send-invoices-get-paid-on-time",
    "invoice-mistakes-freelancers-make",
    "tax-invoice-requirements-by-country",
  ];
  if (slug === "india") {
    return [
      "gst-invoice-india-compliance",
      "tax-invoice-requirements-by-country",
      "professional-invoice-complete-guide-2026",
    ];
  }
  if (slug === "uk") {
    return [
      "vat-invoice-uk-freelancers",
      "tax-invoice-requirements-by-country",
      "professional-invoice-complete-guide-2026",
    ];
  }
  return universal.slice(0, 3);
}

const SITE_URL = "https://freeinvoicegen.org";

export function generateStaticParams() {
  return SEO_COUNTRY_LIST.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const data = SEO_COUNTRIES[country];
  if (!data) return {};

  const title = `Free Invoice Generator ${data.name} - ${data.taxName} Compliant, PDF Download`;
  const description = `Create professional ${data.taxName}-compliant invoices for ${data.name} businesses. Free invoice generator with ${data.currency} support, ${data.taxIdName.split(" ")[0]} field, and instant PDF download.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/invoice-generator/${data.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/invoice-generator/${data.slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const data = SEO_COUNTRIES[country];
  if (!data) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Invoice Generator by Country", "item": `${SITE_URL}/invoice-generator` },
      { "@type": "ListItem", "position": 3, "name": data.name, "item": `${SITE_URL}/invoice-generator/${data.slug}` },
    ],
  };

  const related = SEO_COUNTRY_LIST.filter((c) => c.slug !== data.slug).slice(0, 6);

  return (
    <div>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/invoice-generator" className="hover:text-blue-600">Invoice Generator by Country</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">{data.name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-200">
              ✓ {data.taxName}-Compliant — 100% Free
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Free Invoice Generator for {data.name}
            </h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Create professional {data.taxName}-compliant invoices for {data.name} businesses.
              Auto-detect {data.currency}, include your {data.taxIdName.split(" (")[0]}, and download a beautiful PDF in seconds. No signup required.
            </p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Currency</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.currency}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Tax</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.taxName}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Tax ID</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.taxIdName.split(" ")[0]}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Compliance</p>
                <p className="text-sm font-bold text-green-600 mt-0.5">✓ Yes</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="/#generator" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-base shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
                Create Invoice for {data.name}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Info */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{data.taxName} & Tax Information for {data.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">{data.taxName} Rate</h3>
              <p className="text-gray-700 leading-relaxed">{data.taxRate}</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-2">Tax ID Required</h3>
              <p className="text-gray-700 leading-relaxed">{data.taxIdName}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Requirements */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Requirements in {data.name}</h2>
          <p className="text-gray-600 mb-6">A legally-compliant {data.name} invoice must include:</p>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <ul className="space-y-3">
              {data.legalRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">
            InvoiceGen handles all of these requirements automatically when you select {data.name} as your country.
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Payment Methods in {data.name}</h2>
          <p className="text-gray-600 mb-6">Add these to your invoice payment details:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.paymentMethods.map((method, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-800">{method}</p>
              </div>
            ))}
          </div>

          {/* Razorpay affiliate — different message for India vs other countries */}
          <AffiliateCard variant={data.slug === "india" ? "india" : "fast-payment"} />
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Further reading from the blog */}
      <RelatedBlogPosts
        slugs={blogSlugsForCountry(data.slug)}
        heading={`Further Reading for ${data.name} Businesses`}
        className="bg-white"
      />

      {/* Related Countries */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Invoice Generators for Other Countries</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {related.map((c) => (
              <Link
                key={c.slug}
                href={`/invoice-generator/${c.slug}`}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-md transition-all"
              >
                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.currency}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 shadow-2xl shadow-blue-200">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Invoice in {data.name}?</h2>
            <p className="text-blue-100 mb-6">Free, {data.taxName}-compliant, no signup. Auto-detects your country.</p>
            <a href="/#generator" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Start Creating — It&apos;s Free
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
