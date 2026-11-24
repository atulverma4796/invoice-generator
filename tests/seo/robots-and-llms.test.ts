import { describe, it, expect, beforeAll } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { extractSitePaths, getRoutes, readPublic, toPath, type RouteInfo } from "./routes";

let routes: RouteInfo[];
let byPath: Map<string, RouteInfo>;
beforeAll(async () => {
  routes = await getRoutes();
  byPath = new Map(routes.map((r) => [r.path, r]));
});

const r = robots();
const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
const asArray = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** robots.txt prefix-match semantics (no wildcards used in this project). */
function blockedBy(disallows: string[], p: string): string | undefined {
  return disallows.find((d) => d && p.startsWith(d));
}

describe("robots.ts", () => {
  it("has a wildcard rule", () => {
    expect(rules.some((x) => asArray(x.userAgent).includes("*"))).toBe(true);
  });

  it("every rule disallows /api/", () => {
    for (const rule of rules) expect(asArray(rule.disallow)).toContain("/api/");
  });

  it("does not Disallow ANY page route (Googlebot must be able to read noindex)", async () => {
    for (const rule of rules) {
      const dis = asArray(rule.disallow);
      for (const route of routes) {
        expect(blockedBy(dis, route.path), `${route.path} blocked for ${rule.userAgent}`).toBeUndefined();
      }
    }
  });

  it("explicitly checks the noindexed templated paths are crawlable", () => {
    for (const rule of rules) {
      const dis = asArray(rule.disallow);
      for (const p of ["/gallery", "/how-to", "/how-to/create-invoice", "/invoice-generator", "/invoice-generator/india", "/invoice-template/freelance", "/templates"]) {
        expect(blockedBy(dis, p)).toBeUndefined();
      }
    }
  });

  it("disallow entries are root-relative and never the whole site", () => {
    for (const rule of rules) {
      for (const d of asArray(rule.disallow)) {
        expect(d.startsWith("/")).toBe(true);
        expect(d).not.toBe("/");
      }
    }
  });

  it("each user-agent appears in only one rule group", () => {
    const uas = rules.flatMap((x) => asArray(x.userAgent));
    expect(new Set(uas).size).toBe(uas.length);
  });

  it("points at the canonical sitemap", () => {
    expect(r.sitemap).toBe("https://freeinvoicegen.org/sitemap.xml");
  });

  it("no sitemap URL is blocked by robots", () => {
    for (const rule of rules) {
      for (const e of sitemap()) expect(blockedBy(asArray(rule.disallow), toPath(e.url))).toBeUndefined();
    }
  });
});

describe("ai.txt", () => {
  const ai = readPublic("ai.txt");
  const aiDisallows = [...ai.matchAll(/^Disallow:\s*(\S+)/gim)].map((m) => m[1]);
  const robotsDisallows = asArray(rules.find((x) => asArray(x.userAgent).includes("*"))!.disallow);

  it("Disallow set matches robots.ts wildcard rule exactly", () => {
    expect([...aiDisallows].sort()).toEqual([...robotsDisallows].sort());
  });

  it("does not disallow /templates (robots allows it; noindex handles it)", () => {
    expect(aiDisallows).not.toContain("/templates");
  });

  it("references sitemap and llms files on the canonical host", () => {
    expect(ai).toMatch(/^Sitemap: https:\/\/freeinvoicegen\.org\/sitemap\.xml$/m);
    expect(ai).toMatch(/^LLMS: https:\/\/freeinvoicegen\.org\/llms\.txt$/m);
    expect(ai).toMatch(/^LLMS-Full: https:\/\/freeinvoicegen\.org\/llms-full\.txt$/m);
  });
});

describe.each(["llms.txt", "llms-full.txt", "ai.txt"])("%s URL hygiene", (file) => {
  const text = readPublic(file);
  const paths = extractSitePaths(text);

  it("mentions at least one site URL", () => {
    expect(paths.length).toBeGreaterThan(0);
  });

  it("every advertised URL is a real route or a known static file", () => {
    const staticFiles = new Set(["/sitemap.xml", "/llms.txt", "/llms-full.txt", "/ai.txt", "/robots.txt"]);
    for (const p of paths) {
      expect(byPath.has(p) || staticFiles.has(p), `${file} advertises unknown URL ${p}`).toBe(true);
    }
  });

  it("advertises NO noindex URL", () => {
    const leaked = paths.filter((p) => byPath.get(p)?.index === false);
    expect(leaked).toEqual([]);
  });

  it("advertises no /api/ URL", () => {
    expect(paths.some((p) => p.startsWith("/api"))).toBe(false);
  });

  it("uses https canonical host only (no http://, no www.)", () => {
    expect(text).not.toMatch(/http:\/\/(www\.)?freeinvoicegen\.org/);
    expect(text).not.toMatch(/www\.freeinvoicegen\.org/);
  });
});

describe("llms.txt blog list", () => {
  it("lists every blog post URL", async () => {
    const { BLOG_LIST } = await import("@/lib/blogPosts");
    const paths = extractSitePaths(readPublic("llms.txt"));
    for (const p of BLOG_LIST) expect(paths).toContain(`/blog/${p.slug}`);
  });

  it("does not miscount the mistakes article (it is '10 Invoice Mistakes')", () => {
    expect(readPublic("llms.txt")).not.toMatch(/7 Invoice Mistakes/);
  });
});

describe("llms privacy claims stay truthful", () => {
  // /api/send-invoice relays the PDF through our Gmail. Claiming invoice
  // data is "never sent to our servers" is false for that feature.
  it.each(["llms.txt", "llms-full.txt"])("%s does not claim data is never sent/transmitted to servers", (file) => {
    const t = readPublic(file);
    expect(t).not.toMatch(/never sent to our servers/i);
    expect(t).not.toMatch(/never sees, stores, or transmits/i);
  });
});
