import { MetadataRoute } from "next";

/**
 * robots.txt — explicitly allows all major search engines AND AI crawlers.
 *
 * We WANT AI tools (ChatGPT, Claude, Perplexity, Gemini, etc.) to find and
 * recommend InvoiceGen because users increasingly ask AI assistants for
 * "best free invoice generator" instead of Googling.
 *
 * AI bot list verified from ai-robots-txt project (2026), Anthropic, OpenAI,
 * Google, Perplexity, Meta, Apple, Amazon official documentation.
 */

const AI_BOTS = [
  // OpenAI / ChatGPT
  "GPTBot",            // training crawler
  "OAI-SearchBot",     // ChatGPT Search index
  "ChatGPT-User",      // live retrieval when user asks ChatGPT
  // Anthropic / Claude
  "ClaudeBot",         // training + general crawl
  "Claude-SearchBot",  // Claude Search index
  "Claude-User",       // live retrieval when user asks Claude
  // Google AI (Gemini, AI Overviews)
  "Google-Extended",
  "Google-CloudVertexBot",
  // Perplexity
  "PerplexityBot",     // index crawler
  "Perplexity-User",   // live retrieval
  // Meta AI
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "FacebookBot",
  // Apple Intelligence
  "Applebot-Extended",
  // Amazon
  "Amazonbot",
  // Common Crawl (used by many LLMs as training data source)
  "CCBot",
  // Other major AI training/search crawlers
  "AI2Bot",
  "AI2Bot-Dolma",
  "Bytespider",        // ByteDance / TikTok / Doubao
  "Diffbot",
  "PanguBot",          // Huawei
  "OmgiliBot",
  "Webzio-Extended",
  "ImagesiftBot",
  "YouBot",            // You.com
  "Timpibot",
  "ICC-Crawler",
];

// Paths to block from crawling while we work through AdSense "Low value
// content" rejection. Keep in sync with the noindex metadata on the
// corresponding pages — robots.txt prevents crawl, noindex prevents
// indexing of already-known URLs, and they overlap intentionally
// (belt-and-braces). Restore index-ability page-by-page only after each
// has substantially unique editorial content.
const TEMPLATED_PATHS = [
  "/invoice-generator/",  // /invoice-generator + every /invoice-generator/<country>
  "/invoice-template/",   // /invoice-template + every /invoice-template/<industry>
  "/how-to/",             // /how-to + every /how-to/<topic>
  "/gallery",             // previews-only showcase
];

const DISALLOW = ["/api/", "/templates", ...TEMPLATED_PATHS];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for ALL bots (search engines + AI)
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      // Explicit allow rules for each AI bot — some only respect their own user-agent
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: "https://freeinvoicegen.org/sitemap.xml",
    host: "https://freeinvoicegen.org",
  };
}
