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
import { INDUSTRY_LIST } from "@/lib/industries";

const BASE_URL = "https://freeinvoicegen.org";
// Update this value only when a static tool or editorial page materially changes.
const STATIC_LAST_MODIFIED = new Date("2026-07-27T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  // Single-purpose document tools — each is a fundamentally different
  // document type (like CalcHub's calculators), so they're substantive on
  // their own and stay indexed.
  const toolPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/rent-receipt`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/quotation`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/purchase-order`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/delivery-note`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/salary-slip`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
  ];

  const editorialPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/blog`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_LIST.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // (Hub is noindex — not listed.) ONLY the industry pages flagged `indexable`
  // (enriched with unique editorial content). Must stay in lockstep with the
  // page-level robots meta in src/app/invoice-template/** — enforced by
  // tests/seo/sitemap.test.ts.
  const templatePages: MetadataRoute.Sitemap = [
    ...INDUSTRY_LIST.filter((i) => i.indexable === true).map((i) => ({
      url: `${BASE_URL}/invoice-template/${i.slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...toolPages, ...editorialPages, ...templatePages, ...blogPages];
}
