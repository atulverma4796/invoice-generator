// Route registry for SEO integrity tests.
//
// Resolves every concrete public URL the app serves, together with the
// EFFECTIVE robots `index` flag Next.js will emit for it (page metadata
// overrides the root layout, which is index:true). Metadata is read by
// importing the real page modules, so tests break if a page's robots
// directive changes without the sitemap / llms.txt / nav following.

import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

import * as about from "@/app/about/page";
import * as blogIndex from "@/app/blog/page";
import * as blogPost from "@/app/blog/[slug]/page";
import * as contact from "@/app/contact/page";
import * as privacy from "@/app/privacy/page";
import * as terms from "@/app/terms/page";
import * as quotation from "@/app/quotation/page";
import * as rentReceipt from "@/app/rent-receipt/page";
import * as salarySlip from "@/app/salary-slip/page";
import * as deliveryNote from "@/app/delivery-note/page";
import * as purchaseOrder from "@/app/purchase-order/page";
import * as gallery from "@/app/gallery/page";
import * as howToIndex from "@/app/how-to/page";
import * as howToTopic from "@/app/how-to/[topic]/page";
import * as countryIndex from "@/app/invoice-generator/page";
import * as countryPage from "@/app/invoice-generator/[country]/page";
import * as templateHub from "@/app/invoice-template/page";
import * as industryPage from "@/app/invoice-template/[industry]/page";
import * as savedTemplatesLayout from "@/app/templates/layout";

export const BASE_URL = "https://freeinvoicegen.org";
export const ROOT = path.resolve(__dirname, "../..");

export interface RouteInfo {
  path: string;
  index: boolean;
  title: string | undefined;
  description: string | undefined;
  /** "static" = hand-written page, "programmatic" = generated from a data list */
  kind: "static" | "programmatic";
}

function robotsIndex(meta: Metadata | undefined): boolean {
  const r = meta?.robots;
  if (r && typeof r === "object" && "index" in r && r.index !== undefined) {
    return r.index !== false;
  }
  if (typeof r === "string") return !/noindex/i.test(r);
  return true; // inherits root layout (index: true)
}

function titleOf(meta: Metadata | undefined): string | undefined {
  const t = meta?.title;
  if (!t) return undefined;
  if (typeof t === "string") return t;
  if (typeof t === "object" && "absolute" in t && t.absolute) return t.absolute;
  if (typeof t === "object" && "default" in t) return t.default;
  return undefined;
}

function info(p: string, meta: Metadata | undefined, kind: RouteInfo["kind"]): RouteInfo {
  return {
    path: p,
    index: robotsIndex(meta),
    title: titleOf(meta),
    description: typeof meta?.description === "string" ? meta.description : undefined,
    kind,
  };
}

type DynamicMod = {
  generateStaticParams: () => Record<string, string>[];
  generateMetadata: (a: { params: Promise<Record<string, string>> }) => Promise<Metadata>;
};

async function expand(mod: DynamicMod, prefix: string, key: string): Promise<RouteInfo[]> {
  const out: RouteInfo[] = [];
  for (const params of mod.generateStaticParams()) {
    const meta = await mod.generateMetadata({ params: Promise.resolve(params) });
    out.push(info(`${prefix}/${params[key]}`, meta, "programmatic"));
  }
  return out;
}

/** Root layout default title, read from source (layout imports next/font which can't load in node). */
export function homepageTitle(): string {
  const src = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
  const m = src.match(/title:\s*\{\s*default:\s*"([^"]+)"/);
  if (!m) throw new Error("Could not find default title in layout.tsx");
  return m[1];
}

let cache: Promise<RouteInfo[]> | null = null;

export function getRoutes(): Promise<RouteInfo[]> {
  cache ??= (async () => {
    const routes: RouteInfo[] = [
      // Homepage is a client component; it inherits the root layout metadata.
      { path: "/", index: true, title: homepageTitle(), description: undefined, kind: "static" },
      info("/about", about.metadata, "static"),
      info("/blog", blogIndex.metadata, "static"),
      info("/contact", contact.metadata, "static"),
      info("/privacy", privacy.metadata, "static"),
      info("/terms", terms.metadata, "static"),
      info("/quotation", quotation.metadata, "static"),
      info("/rent-receipt", rentReceipt.metadata, "static"),
      info("/salary-slip", salarySlip.metadata, "static"),
      info("/delivery-note", deliveryNote.metadata, "static"),
      info("/purchase-order", purchaseOrder.metadata, "static"),
      info("/gallery", gallery.metadata, "programmatic"),
      info("/how-to", howToIndex.metadata, "programmatic"),
      info("/invoice-generator", countryIndex.metadata, "programmatic"),
      info("/invoice-template", templateHub.metadata, "static"),
      info("/templates", savedTemplatesLayout.metadata, "static"),
      ...(await expand(blogPost as unknown as DynamicMod, "/blog", "slug")).map((r) => ({ ...r, kind: "static" as const })),
      ...(await expand(howToTopic as unknown as DynamicMod, "/how-to", "topic")),
      ...(await expand(countryPage as unknown as DynamicMod, "/invoice-generator", "country")),
      ...(await expand(industryPage as unknown as DynamicMod, "/invoice-template", "industry")),
    ];
    return routes;
  })();
  return cache;
}

/** All filesystem page routes as patterns, e.g. "/blog/[slug]". */
export function filesystemRoutePatterns(): string[] {
  const appDir = path.join(ROOT, "src/app");
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "api") continue;
        walk(full);
      } else if (e.name === "page.tsx" || e.name === "page.ts") {
        const rel = path.relative(appDir, dir).split(path.sep).join("/");
        out.push(rel ? `/${rel}` : "/");
      }
    }
  };
  walk(appDir);
  return out.sort();
}

export function patternOf(p: string): string {
  if (p === "/") return "/";
  const seg = p.split("/").filter(Boolean);
  const dyn: Record<string, string> = {
    blog: "[slug]",
    "how-to": "[topic]",
    "invoice-generator": "[country]",
    "invoice-template": "[industry]",
  };
  if (seg.length === 2 && dyn[seg[0]]) return `/${seg[0]}/${dyn[seg[0]]}`;
  return `/${seg.join("/")}`;
}

export function toPath(url: string): string {
  const u = new URL(url);
  expectHost(u);
  const p = u.pathname.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

function expectHost(u: URL) {
  if (u.origin !== BASE_URL) throw new Error(`Unexpected origin in URL: ${u.href}`);
}

export function readPublic(file: string): string {
  return fs.readFileSync(path.join(ROOT, "public", file), "utf8");
}

export function readSrc(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

/** Extract every same-site path from a text blob (absolute URLs + root-relative hrefs). */
export function extractSitePaths(text: string): string[] {
  const set = new Set<string>();
  for (const m of text.matchAll(/https:\/\/(?:www\.)?freeinvoicegen\.org(\/[^\s)"'`|<>]*)?/g)) {
    set.add(normalisePath(m[1] ?? "/"));
  }
  return [...set];
}

export function extractHrefs(src: string): string[] {
  const set = new Set<string>();
  for (const m of src.matchAll(/href[=:]\s*["'`]([^"'`]+)["'`]/g)) {
    const h = m[1];
    if (h.startsWith("/")) set.add(normalisePath(h));
  }
  return [...set];
}

export function normalisePath(p: string): string {
  const noHash = p.split("#")[0].split("?")[0];
  const trimmed = noHash.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}
