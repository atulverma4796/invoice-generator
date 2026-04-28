import { Metadata } from "next";
import Link from "next/link";
import { BLOG_LIST } from "@/lib/blogPosts";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Invoicing Blog — Guides, Tips & Best Practices",
  description:
    "Free guides on creating invoices, payment terms, tax compliance (GST, VAT, Sales Tax), and getting paid faster as a freelancer or small business.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Invoicing Blog — InvoiceGen",
    description:
      "Free guides on invoicing, tax compliance, and getting paid as a freelancer or small business.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

export default function BlogIndexPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "InvoiceGen Blog",
    url: `${SITE_URL}/blog`,
    description:
      "Free guides on invoicing, tax compliance, and getting paid as a freelancer or small business.",
    blogPost: BLOG_LIST.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: { "@type": "Organization", name: post.author },
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };

  return (
    <div>
      <JsonLd data={blogSchema} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Blog</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-3xl">
            Invoicing Guides for Freelancers &amp; Small Businesses
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Honest, practical guides on creating invoices, payment terms, tax compliance, and getting paid faster. No fluff, no upsells.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BLOG_LIST.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {post.category}
                  </span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{post.excerpt}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to create your invoice?
          </h2>
          <p className="text-gray-600 mb-5">
            Free invoice generator with 30+ currencies, 120+ countries, and instant PDF download.
          </p>
          <Link
            href="/#generator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
          >
            Try the Generator
          </Link>
        </div>
      </section>
    </div>
  );
}
