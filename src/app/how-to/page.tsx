import { Metadata } from "next";
import Link from "next/link";
import { HOW_TO_LIST } from "@/lib/howToGuides";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "How-To Guides — Free Invoice & Billing Tutorials",
  description: "Free step-by-step guides on how to create invoices, write invoices, send invoices, add tax, and more. Practical tips for freelancers and small businesses.",
  alternates: { canonical: `${SITE_URL}/how-to` },
  openGraph: {
    title: "Free Invoice How-To Guides",
    description: "Step-by-step invoice tutorials. Learn to create, write, send, and manage invoices like a pro.",
    url: `${SITE_URL}/how-to`,
  },
};

export default function HowToIndexPage() {
  return (
    <div>
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Invoice{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              How-To Guides
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Step-by-step tutorials on creating, writing, sending, and managing invoices like a pro.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HOW_TO_LIST.map((guide) => (
              <Link
                key={guide.slug}
                href={`/how-to/${guide.slug}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <h3 className="text-base font-bold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-3">{guide.intro}</p>
                <p className="text-xs text-blue-600 font-medium mt-3 group-hover:underline">Read guide →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
