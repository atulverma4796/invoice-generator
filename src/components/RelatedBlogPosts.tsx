import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blogPosts";

interface Props {
  slugs: string[];
  heading?: string;
  className?: string;
}

export default function RelatedBlogPosts({
  slugs,
  heading = "Further Reading",
  className = "",
}: Props) {
  const posts = slugs.map((s) => BLOG_POSTS[s]).filter(Boolean);
  if (!posts.length) return null;

  return (
    <section className={`py-12 bg-white ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {p.category}
                </span>
                <span>·</span>
                <span>{p.readingTime} min read</span>
              </div>
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                {p.title}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                {p.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
