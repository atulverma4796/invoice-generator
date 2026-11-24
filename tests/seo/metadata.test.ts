import { describe, it, expect, beforeAll } from "vitest";
import { BLOG_LIST, BLOG_POSTS } from "@/lib/blogPosts";
import { INDUSTRY_LIST } from "@/lib/industries";
import { SEO_COUNTRY_LIST } from "@/lib/seoCountries";
import { HOW_TO_LIST } from "@/lib/howToGuides";
import { generateMetadata as blogMeta } from "@/app/blog/[slug]/page";
import { getRoutes, homepageTitle, type RouteInfo } from "./routes";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TODAY = new Date();
const MAX_TITLE = 65;

describe("blog posts", () => {
  it("has posts", () => expect(BLOG_LIST.length).toBeGreaterThan(5));

  it("slugs are unique, URL-safe kebab-case and match their record key", () => {
    const slugs = BLOG_LIST.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const [key, p] of Object.entries(BLOG_POSTS)) {
      expect(p.slug).toBe(key);
      expect(p.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("titles are unique (case-insensitive)", () => {
    const t = BLOG_LIST.map((p) => p.title.toLowerCase().trim());
    expect(new Set(t).size).toBe(t.length);
  });

  it("SEO titles (what goes in <title>) are unique and <= 65 chars", () => {
    const seo = BLOG_LIST.map((p) => p.seoTitle ?? p.title);
    expect(new Set(seo.map((s) => s.toLowerCase())).size).toBe(seo.length);
    for (const p of BLOG_LIST) {
      const t = p.seoTitle ?? p.title;
      expect(t.length, `${p.slug}: "${t}"`).toBeLessThanOrEqual(MAX_TITLE);
      expect(t.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("seoTitle, when present, is shorter than the H1 title (only used to shorten)", () => {
    for (const p of BLOG_LIST.filter((x) => x.seoTitle)) {
      expect(p.seoTitle!.length).toBeLessThan(p.title.length);
    }
  });

  it("generateMetadata emits the SEO title + meta description", async () => {
    for (const p of BLOG_LIST) {
      const m = await blogMeta({ params: Promise.resolve({ slug: p.slug }) });
      expect(m.title).toBe(p.seoTitle ?? p.title);
      expect(m.description).toBe(p.metaDescription);
      expect(m.alternates?.canonical).toBe(`https://freeinvoicegen.org/blog/${p.slug}`);
    }
  });

  it("generateMetadata returns {} for an unknown slug (no crash)", async () => {
    for (const slug of ["nope", "", "../etc/passwd", "__proto__", "constructor"]) {
      const m = await blogMeta({ params: Promise.resolve({ slug }) });
      expect(m.title === undefined || typeof m.title === "string").toBe(true);
      if (slug === "nope" || slug === "" || slug === "../etc/passwd") expect(m).toEqual({});
    }
  });

  it("meta descriptions are unique and 50-160 chars", () => {
    const d = BLOG_LIST.map((p) => p.metaDescription.trim());
    expect(new Set(d).size).toBe(d.length);
    for (const p of BLOG_LIST) {
      expect(p.metaDescription.length, p.slug).toBeGreaterThanOrEqual(50);
      expect(p.metaDescription.length, p.slug).toBeLessThanOrEqual(160);
    }
  });

  it("dates are ISO yyyy-mm-dd, real calendar dates, not in the future", () => {
    for (const p of BLOG_LIST) {
      for (const d of [p.publishedAt, p.updatedAt]) {
        expect(d, p.slug).toMatch(ISO_DATE);
        const parsed = new Date(`${d}T00:00:00Z`);
        expect(Number.isNaN(parsed.getTime())).toBe(false);
        expect(parsed.toISOString().slice(0, 10)).toBe(d); // rejects 2026-02-30
        expect(parsed.getTime()).toBeLessThanOrEqual(TODAY.getTime());
      }
    }
  });

  it("updatedAt >= publishedAt", () => {
    for (const p of BLOG_LIST) {
      expect(new Date(p.updatedAt).getTime(), p.slug).toBeGreaterThanOrEqual(new Date(p.publishedAt).getTime());
    }
  });

  it("publish dates are staggered (no two posts on the same day — the doorway/auto-gen signal)", () => {
    const d = BLOG_LIST.map((p) => p.publishedAt);
    expect(new Set(d).size).toBe(d.length);
  });

  it("BLOG_LIST is sorted newest first", () => {
    for (let i = 1; i < BLOG_LIST.length; i++) {
      expect(new Date(BLOG_LIST[i - 1].publishedAt).getTime()).toBeGreaterThanOrEqual(new Date(BLOG_LIST[i].publishedAt).getTime());
    }
  });

  it("every post has a named author (not a generic 'Team' byline)", () => {
    for (const p of BLOG_LIST) {
      expect(p.author.trim().length).toBeGreaterThan(0);
      expect(p.author).not.toMatch(/team|admin|staff/i);
    }
  });

  it("every post has substantial content (>= 800 words) and a positive reading time", () => {
    for (const p of BLOG_LIST) {
      const words = p.content.split(/\s+/).filter(Boolean).length;
      expect(words, p.slug).toBeGreaterThanOrEqual(800);
      expect(p.readingTime).toBeGreaterThan(0);
    }
  });

  it("related slugs point at existing posts and never at themselves", () => {
    for (const p of BLOG_LIST) {
      for (const r of p.related ?? []) {
        expect(BLOG_POSTS[r], `${p.slug} -> ${r}`).toBeDefined();
        expect(r).not.toBe(p.slug);
      }
    }
  });

  it("internal /blog/ links inside content point at existing posts", () => {
    for (const p of BLOG_LIST) {
      for (const m of p.content.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
        expect(BLOG_POSTS[m[1]], `${p.slug} links to missing /blog/${m[1]}`).toBeDefined();
      }
    }
  });
});

describe("indexable page titles and descriptions", () => {
  let routes: RouteInfo[];
  beforeAll(async () => {
    routes = await getRoutes();
  });

  it("homepage <title> keeps 'Free Invoice Generator' and is <= 65 chars", () => {
    const t = homepageTitle();
    expect(t).toMatch(/Free Invoice Generator/);
    expect(t.length, t).toBeLessThanOrEqual(MAX_TITLE);
  });

  it("every indexable route has a title (<= 65 chars, excl. template suffix)", () => {
    for (const r of routes.filter((x) => x.index)) {
      expect(r.title, r.path).toBeTruthy();
      expect(r.title!.length, `${r.path}: ${r.title}`).toBeLessThanOrEqual(MAX_TITLE);
    }
  });

  it("indexable route titles are unique", () => {
    const t = routes.filter((x) => x.index).map((x) => x.title!.toLowerCase());
    expect(new Set(t).size).toBe(t.length);
  });

  it("indexable route descriptions (where set) are unique and 50-160 chars", () => {
    const withDesc = routes.filter((x) => x.index && x.description);
    const set = new Set(withDesc.map((x) => x.description));
    expect(set.size).toBe(withDesc.length);
    for (const r of withDesc) {
      expect(r.description!.length, r.path).toBeGreaterThanOrEqual(50);
      expect(r.description!.length, r.path).toBeLessThanOrEqual(160);
    }
  });
});

describe("programmatic data integrity", () => {
  it.each([
    ["industries", INDUSTRY_LIST.map((x) => x.slug)],
    ["countries", SEO_COUNTRY_LIST.map((x) => x.slug)],
    ["how-to", HOW_TO_LIST.map((x) => x.slug)],
  ])("%s slugs are unique kebab-case", (_n, slugs) => {
    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("industry pages marked indexable carry substantially more unique content than the bare template", () => {
    const size = (o: unknown) => JSON.stringify(o).length;
    const bare = INDUSTRY_LIST.filter((i) => !i.indexable).map(size);
    const avgBare = bare.reduce((a, b) => a + b, 0) / bare.length;
    for (const i of INDUSTRY_LIST.filter((x) => x.indexable)) {
      expect(size(i), i.slug).toBeGreaterThan(avgBare * 1.5);
    }
  });
});
