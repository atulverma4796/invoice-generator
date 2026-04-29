import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { INDUSTRIES, INDUSTRY_LIST } from "@/lib/industries";
import { getStaticSampleInvoice, INDUSTRY_TEMPLATE_IDS } from "@/lib/sampleInvoice";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import JsonLd from "@/components/JsonLd";
import AffiliateCard from "@/components/AffiliateCard";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";

const INDUSTRY_BLOG_SLUGS = [
  "professional-invoice-complete-guide-2026",
  "invoice-mistakes-freelancers-make",
  "send-invoices-get-paid-on-time",
];

const SITE_URL = "https://freeinvoicegen.org";

export function generateStaticParams() {
  return INDUSTRY_LIST.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await params;
  const data = INDUSTRIES[industry];
  if (!data) return {};

  return {
    title: `${data.h1} - PDF Download, No Signup`,
    description: data.description,
    alternates: { canonical: `${SITE_URL}/invoice-template/${data.slug}` },
    openGraph: {
      title: data.h1,
      description: data.description,
      url: `${SITE_URL}/invoice-template/${data.slug}`,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: data.h1, description: data.description },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params;
  const data = INDUSTRIES[industry];
  if (!data) notFound();

  // FAQ + HowTo structured data for AI overviews
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
      { "@type": "ListItem", "position": 2, "name": "Invoice Templates", "item": `${SITE_URL}/invoice-template` },
      { "@type": "ListItem", "position": 3, "name": data.name, "item": `${SITE_URL}/invoice-template/${data.slug}` },
    ],
  };

  // Related industries (6 others)
  const related = INDUSTRY_LIST.filter((i) => i.slug !== data.slug).slice(0, 6);

  // Sample data with this industry's line items — used for template previews
  const baseInvoice = getStaticSampleInvoice({ industry: data });

  return (
    <div>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/invoice-template" className="hover:text-blue-600">Invoice Templates</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">{data.name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-200">
              ✓ 100% Free — No Signup
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              {data.h1}
            </h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">{data.intro}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="/#generator" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-base shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
                Create {data.name} Invoice Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a href="/#generator" className="inline-flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-xl font-medium text-sm hover:border-blue-300 hover:text-blue-600 transition-all">
                Download PDF Template
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Template Gallery — pick a design pre-filled with this industry's items */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pick a {data.name} Invoice Template</h2>
              <p className="text-gray-600">All 6 designs come pre-filled with sample {data.name.toLowerCase()} items. Click <strong>Use this template</strong> to start editing.</p>
            </div>
            <Link href="/gallery" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              View all 10 templates →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRY_TEMPLATE_IDS.map((templateId) => (
              <TemplatePreviewCard
                key={templateId}
                templateId={templateId}
                data={baseInvoice}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.name} Invoice Tips</h2>
          <p className="text-gray-600 mb-6">Best practices to get paid faster:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600 mb-6">Everything you need to know about {data.name.toLowerCase()} invoicing:</p>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
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

      {/* Razorpay affiliate */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AffiliateCard variant="fast-payment" />
        </div>
      </section>

      {/* Further reading from the blog */}
      <RelatedBlogPosts
        slugs={INDUSTRY_BLOG_SLUGS}
        heading="Further Reading from the Blog"
      />

      {/* Related Templates */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Free Invoice Templates</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/invoice-template/${r.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-md transition-all"
              >
                <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Free template</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 shadow-2xl shadow-blue-200">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Create Your {data.name} Invoice?</h2>
            <p className="text-blue-100 mb-6">100% Free. No signup. Instant PDF download.</p>
            <a href="/#generator" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Start Creating — It&apos;s Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
