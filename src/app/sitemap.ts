// Sitemap restricted to high-quality, unique-content pages while we work
// through the AdSense "Low value content" rejection. The templated
// programmatic pages (country, industry, how-to listings, gallery) are
// excluded here AND noindex'd on the page itself — leaving them as
// nav-accessible doorways was reading as a templated factory to Google's
// reviewer.
//
// Re-add programmatic pages to the sitemap one wave at a time AFTER:
//   (a) AdSense is approved on freeinvoicegen.org, and
//   (b) Each batch has been rewritten with substantially unique editorial
//       content per page (not just data swaps), so they're individually
//       index-worthy.

import { MetadataRoute } from "next";
import { BLOG_LIST } from "@/lib/blogPosts";

const BASE_URL = "https://freeinvoicegen.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Single-purpose document tools — each is a fundamentally different
  // document type (like CalcHub's calculators), so they're substantive on
  // their own and stay indexed.
  const toolPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/rent-receipt`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/quotation`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/purchase-order`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/delivery-note`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/salary-slip`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const editorialPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_LIST.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...toolPages, ...editorialPages, ...blogPages];
}
