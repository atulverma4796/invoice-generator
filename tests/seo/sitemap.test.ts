import { describe, it, expect, beforeAll } from "vitest";
import sitemap from "@/app/sitemap";
import { BLOG_LIST } from "@/lib/blogPosts";
import { INDUSTRY_LIST } from "@/lib/industries";
import {
  BASE_URL,
  filesystemRoutePatterns,
  getRoutes,
  patternOf,
  toPath,
  type RouteInfo,
} from "./routes";

let routes: RouteInfo[];
let byPath: Map<string, RouteInfo>;
const entries = sitemap();
const sitemapPaths = entries.map((e) => toPath(e.url));

beforeAll(async () => {
  routes = await getRoutes();
  byPath = new Map(routes.map((r) => [r.path, r]));
});

describe("route registry sanity", () => {
  it("covers every page.tsx under src/app (forces registry update when routes are added)", () => {
    const registryPatterns = new Set(routes.map((r) => patternOf(r.path)));
    for (const pattern of filesystemRoutePatterns()) {
      expect(registryPatterns, `route ${pattern} missing from tests/seo/routes.ts`).toContain(pattern);
    }
  });

  it("has no duplicate concrete paths", () => {
    expect(new Set(routes.map((r) => r.path)).size).toBe(routes.length);
  });
});

describe("sitemap.xml", () => {
  it("is non-empty and every URL is absolute on the canonical https origin without trailing slash", () => {
    expect(entries.length).toBeGreaterThan(10);
    for (const e of entries) {
      const u = new URL(e.url);
      expect(u.protocol).toBe("https:");
      expect(u.origin).toBe(BASE_URL);
      expect(u.search).toBe("");
      expect(u.hash).toBe("");
      if (u.pathname !== "/") expect(u.pathname.endsWith("/")).toBe(false);
      expect(e.url).not.toMatch(/\s/);
    }
  });

  it("has no duplicate URLs", () => {
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
  });

  it("every URL resolves to a real route", () => {
    for (const p of sitemapPaths) {
      expect(byPath.has(p), `${p} is in sitemap but no such route`).toBe(true);
    }
  });

  it("no noindex page appears in the sitemap", () => {
    const leaked = sitemapPaths.filter((p) => byPath.get(p)?.index === false);
    expect(leaked).toEqual([]);
  });

  it("every indexable route IS in the sitemap", () => {
    const set = new Set(sitemapPaths);
    const missing = routes.filter((r) => r.index && !set.has(r.path)).map((r) => r.path);
    expect(missing).toEqual([]);
  });

  it("excludes the noindex /invoice-template hub but includes every industry flagged indexable", () => {
    expect(sitemapPaths).not.toContain("/invoice-template");
    const indexable = INDUSTRY_LIST.filter((i) => i.indexable === true);
    expect(indexable.length).toBeGreaterThan(0);
    for (const i of indexable) expect(sitemapPaths).toContain(`/invoice-template/${i.slug}`);
  });

  it("excludes every industry page NOT flagged indexable", () => {
    for (const i of INDUSTRY_LIST.filter((x) => x.indexable !== true)) {
      expect(sitemapPaths).not.toContain(`/invoice-template/${i.slug}`);
    }
  });

  it("excludes the saved-invoices utility page /templates and all /api routes", () => {
    expect(sitemapPaths).not.toContain("/templates");
    expect(sitemapPaths.some((p) => p.startsWith("/api"))).toBe(false);
  });

  it("includes every blog post with lastModified = updatedAt", () => {
    for (const post of BLOG_LIST) {
      const e = entries.find((x) => x.url === `${BASE_URL}/blog/${post.slug}`);
      expect(e, post.slug).toBeDefined();
      expect(new Date(e!.lastModified as Date).toISOString().slice(0, 10)).toBe(post.updatedAt.slice(0, 10));
    }
  });

  it("lastModified values are valid dates, not in the future", () => {
    const now = Date.now();
    for (const e of entries) {
      const d = new Date(e.lastModified as Date | string);
      expect(Number.isNaN(d.getTime()), e.url).toBe(false);
      expect(d.getTime(), e.url).toBeLessThanOrEqual(now);
    }
  });

  it("priorities are within 0..1 and the homepage is the top priority", () => {
    for (const e of entries) {
      expect(e.priority).toBeGreaterThanOrEqual(0);
      expect(e.priority).toBeLessThanOrEqual(1);
    }
    const home = entries.find((e) => toPath(e.url) === "/");
    expect(home?.priority).toBe(Math.max(...entries.map((e) => e.priority ?? 0)));
  });
});
