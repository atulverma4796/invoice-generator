import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS, BLOG_LIST } from "@/lib/blogPosts";
import JsonLd from "@/components/JsonLd";
import AffiliateCard from "@/components/AffiliateCard";

const SITE_URL = "https://freeinvoicegen.org";

export function generateStaticParams() {
  return BLOG_LIST.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) return {};

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
  };
}

// Lightweight markdown-to-HTML converter for blog post bodies.
// Handles headings (## ###), bullet/checkbox lists, paragraphs, bold, italic,
// inline code, links, blockquotes, and tables. Tailored to the blog content
// shape — not a full markdown spec parser.
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  let inList: "ul" | "ol" | null = null;
  let inTable = false;
  let inBlockquote = false;
  let paragraph: string[] = [];

  const inline = (text: string): string =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm">$1</code>');

  const closeParagraph = () => {
    if (paragraph.length) {
      out.push(`<p class="mb-4 text-gray-700 leading-relaxed">${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
  };

  const closeTable = () => {
    if (inTable) {
      out.push("</tbody></table></div>");
      inTable = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push("</blockquote>");
      inBlockquote = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // blank line
    if (trimmed === "") {
      closeParagraph();
      closeList();
      closeBlockquote();
      i++;
      continue;
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      closeParagraph();
      closeList();
      closeBlockquote();
      out.push(`<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">${inline(trimmed.slice(3))}</h2>`);
      i++;
      continue;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      closeParagraph();
      closeList();
      closeBlockquote();
      out.push(`<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">${inline(trimmed.slice(4))}</h3>`);
      i++;
      continue;
    }

    // Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed.slice(1, -1).split("|").map((c) => c.trim());

      // Detect separator row (|---|---|) and skip
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        i++;
        continue;
      }

      if (!inTable) {
        closeParagraph();
        closeList();
        closeBlockquote();
        out.push('<div class="overflow-x-auto my-5"><table class="w-full border-collapse text-sm"><tbody>');
        inTable = true;
      }

      const isHeader = i + 1 < lines.length && /^\|\s*:?-+:?\s*\|/.test(lines[i + 1].trim());
      const tag = isHeader ? "th" : "td";
      const rowClass = isHeader
        ? 'class="bg-gray-50 font-semibold text-gray-800 text-left p-3 border border-gray-200"'
        : 'class="text-gray-700 p-3 border border-gray-200"';
      out.push("<tr>" + cells.map((c) => `<${tag} ${rowClass}>${inline(c)}</${tag}>`).join("") + "</tr>");
      i++;
      continue;
    } else if (inTable) {
      closeTable();
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      closeParagraph();
      closeList();
      if (!inBlockquote) {
        out.push('<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-5">');
        inBlockquote = true;
      }
      out.push(`<p class="mb-2">${inline(trimmed.slice(2))}</p>`);
      i++;
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      closeParagraph();
      closeBlockquote();
      if (inList !== "ol") {
        closeList();
        out.push('<ol class="list-decimal list-outside ml-6 mb-4 space-y-1.5 text-gray-700">');
        inList = "ol";
      }
      out.push(`<li>${inline(trimmed.replace(/^\d+\.\s/, ""))}</li>`);
      i++;
      continue;
    }

    // Bullet list (including checkboxes)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      closeParagraph();
      closeBlockquote();
      if (inList !== "ul") {
        closeList();
        out.push('<ul class="list-disc list-outside ml-6 mb-4 space-y-1.5 text-gray-700">');
        inList = "ul";
      }
      let item = trimmed.replace(/^[-*]\s/, "");
      // Checkbox prefix
      if (item.startsWith("[ ] ")) item = `☐ ${item.slice(4)}`;
      else if (item.toLowerCase().startsWith("[x] ")) item = `☑ ${item.slice(4)}`;
      out.push(`<li>${inline(item)}</li>`);
      i++;
      continue;
    } else if (inList) {
      closeList();
    }

    // Paragraph (accumulate)
    paragraph.push(trimmed);
    i++;
  }

  closeParagraph();
  closeList();
  closeTable();
  closeBlockquote();
  return out.join("\n");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) notFound();

  const html = markdownToHtml(post.content);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "InvoiceGen",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
    keywords: post.keywords.join(", "),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  };

  const relatedPosts =
    post.related?.map((s) => BLOG_POSTS[s]).filter((p) => p) || [];

  return (
    <article>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">{post.category}</span>
          </nav>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
              {post.category}
            </span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
            <span>·</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">{post.excerpt}</p>
          <p className="mt-4 text-xs text-gray-500">
            By {post.author}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Affiliate card mid/bottom */}
          <AffiliateCard variant="default" />

          {/* CTA */}
          <div className="mt-10 p-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white text-center">
            <h3 className="text-xl font-bold mb-2">Ready to create your invoice?</h3>
            <p className="text-blue-100 mb-4 text-sm">Free, no signup, 30+ currencies, instant PDF download.</p>
            <Link
              href="/#generator"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Try the Generator
            </Link>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <p className="text-xs text-gray-500 mb-1">{p.readingTime} min read</p>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
