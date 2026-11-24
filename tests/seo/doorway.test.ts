// Doorway-pattern guards. AdSense rejected freeinvoicegen.org 3 times for
// "low value content"; the review flagged a site-wide nav/footer funnel
// into templated, near-duplicate programmatic pages. These tests keep the
// global chrome (header, footer, mobile menu) from linking to noindex
// templated pages again.

import { describe, it, expect, beforeAll } from "vitest";
import { INDUSTRY_LIST } from "@/lib/industries";
import { extractHrefs, getRoutes, readSrc, type RouteInfo } from "./routes";

// noindex pages that are legitimate user utilities, not templated SEO
// pages. /templates = the user's own saved invoices (localStorage).
const UTILITY_NOINDEX = new Set(["/templates"]);

let routes: RouteInfo[];
let byPath: Map<string, RouteInfo>;
beforeAll(async () => {
  routes = await getRoutes();
  byPath = new Map(routes.map((r) => [r.path, r]));
});

const layoutSrc = readSrc("src/app/layout.tsx");
const mobileSrc = readSrc("src/components/MobileMenu.tsx");
const hubSrc = readSrc("src/app/invoice-template/page.tsx");

const chrome: [string, string[]][] = [
  ["layout.tsx (header + footer)", extractHrefs(layoutSrc)],
  ["MobileMenu.tsx", extractHrefs(mobileSrc)],
];

describe.each(chrome)("%s links", (_name, hrefs) => {
  it("finds links to check", () => {
    expect(hrefs.length).toBeGreaterThan(3);
  });

  it("every internal link resolves to a real route", () => {
    for (const h of hrefs) expect(byPath.has(h), `link to unknown route ${h}`).toBe(true);
  });

  it("links to NO noindex templated/programmatic page", () => {
    const bad = hrefs.filter((h) => byPath.get(h)?.index === false && !UTILITY_NOINDEX.has(h));
    expect(bad).toEqual([]);
  });

  it("does not link to any individual programmatic page (country / industry / how-to / gallery)", () => {
    const bad = hrefs.filter((h) =>
      /^\/(invoice-generator|how-to|gallery)(\/|$)/.test(h) ||
      (/^\/invoice-template\/[^/]+$/.test(h) && byPath.get(h)?.index === false),
    );
    expect(bad).toEqual([]);
  });
});

describe("utility noindex allowlist", () => {
  it("only contains pages that really are noindex", () => {
    for (const p of UTILITY_NOINDEX) expect(byPath.get(p)?.index).toBe(false);
  });
});

describe("header and mobile menu stay in sync", () => {
  it("mobile menu offers the same top-level destinations as the desktop header", () => {
    const desktop = new Set(extractHrefs(layoutSrc));
    for (const h of extractHrefs(mobileSrc)) expect(desktop.has(h), h).toBe(true);
  });
});

describe("/invoice-template hub", () => {
  // Decision 2026-11-24: hub is a thin grid mostly linking to noindex
  // templates (doorway shape AdSense flagged) → noindex + out of global nav.
  it("is noindex while it links mostly to noindex thin pages", () => {
    const children = INDUSTRY_LIST.map((i) => `/invoice-template/${i.slug}`);
    const noindex = children.filter((c) => byPath.get(c)?.index === false);
    if (noindex.length / children.length > 0.5) {
      expect(byPath.get("/invoice-template")?.index).toBe(false);
    }
  });

  it("is not linked from header, footer or mobile menu", () => {
    expect(extractHrefs(layoutSrc)).not.toContain("/invoice-template");
    expect(extractHrefs(mobileSrc)).not.toContain("/invoice-template");
  });

  it("source no longer claims AdSense is approved (it was rejected 3x)", () => {
    expect(hubSrc).not.toMatch(/AdSense is approved/i);
  });
});
