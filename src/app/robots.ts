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

// Do NOT add the noindex'd templated paths here. If a URL is blocked in
// robots.txt, Googlebot never fetches the page and therefore never sees
// the <meta name="robots" content="noindex"> tag — the URL ends up in
// the "Indexed, though blocked by robots.txt" bucket without a snippet,
// which is the worst of both worlds (it stays indexed, it looks broken,
// and Google can no longer drop it because it can't read the directive).
//
// noindex de-indexes; robots.txt only prevents crawling. They are NOT
// belt-and-braces — they actively conflict. Let Googlebot crawl the
// templated paths so it can read the noindex and drop them.
const DISALLOW = ["/api/"];

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
