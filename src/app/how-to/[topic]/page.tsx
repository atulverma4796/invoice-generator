import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HOW_TO_GUIDES, HOW_TO_LIST } from "@/lib/howToGuides";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://invoicegen.app";

export function generateStaticParams() {
  return HOW_TO_LIST.map((g) => ({ topic: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const data = HOW_TO_GUIDES[topic];
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `${SITE_URL}/how-to/${data.slug}` },
    openGraph: { title: data.metaTitle, description: data.metaDescription, url: `${SITE_URL}/how-to/${data.slug}`, type: "article" },
    twitter: { card: "summary_large_image", title: data.metaTitle, description: data.metaDescription },
  };
}

export default async function HowToPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const data = HOW_TO_GUIDES[topic];
  if (!data) notFound();

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.title,
    "description": data.metaDescription,
    "totalTime": "PT2M",
    "step": data.steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": step.title,
      "text": step.description,
    })),
  };

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
      { "@type": "ListItem", "position": 2, "name": "How-To Guides", "item": `${SITE_URL}/how-to` },
      { "@type": "ListItem", "position": 3, "name": data.title, "item": `${SITE_URL}/how-to/${data.slug}` },
    ],
  };

  const related = HOW_TO_LIST.filter((g) => g.slug !== data.slug).slice(0, 4);

  return (
    <div>
      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/how-to" className="hover:text-blue-600">How-To Guides</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">{data.title}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {data.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">{data.intro}</p>
        </div>
      </section>

      {/* Article */}
      <article className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Sections */}
          {data.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.heading}</h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
              {section.list && (
                <ul className="mt-4 space-y-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Steps */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step-by-Step Guide</h2>
            <ol className="space-y-5">
              {data.steps.map((step, i) => (
                <li key={i} className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 text-center">
              <a href="/#generator" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
                Try It Now — Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
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
          </section>
        </div>
      </article>

      {/* Related Guides */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Invoice Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((g) => (
              <Link
                key={g.slug}
                href={`/how-to/${g.slug}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <p className="text-sm font-bold text-gray-900 mb-1">{g.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{g.intro.substring(0, 100)}...</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
