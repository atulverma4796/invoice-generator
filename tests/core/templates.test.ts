import { describe, it, expect } from "vitest";
import { TEMPLATES, COLOR_PRESETS } from "@/lib/templates";
import {
  getStaticSampleInvoice,
  ALL_TEMPLATE_IDS,
  INDUSTRY_TEMPLATE_IDS,
  DEFAULT_SAMPLE_SIGNATURE,
  DEFAULT_SAMPLE_QR,
} from "@/lib/sampleInvoice";
import { INDUSTRIES } from "@/lib/industries";
import { validateInvoice } from "@/lib/validation";
import { calculateLineAmount, calculateSubtotal } from "@/lib/calculations";
import type { TemplateId } from "@/types/invoice";

const HEX = /^#[0-9a-f]{6}$/i;

describe("TEMPLATES", () => {
  const entries = Object.entries(TEMPLATES) as [TemplateId, (typeof TEMPLATES)[TemplateId]][];

  it("has exactly the 10 template ids", () => {
    expect(Object.keys(TEMPLATES).sort()).toEqual(
      ["bold", "classic", "creative", "elegant", "executive", "minimal", "modern", "monochrome", "pastel", "sidebar"],
    );
  });

  it.each(entries)("%s: id matches key, valid colours and font", (key, t) => {
    expect(t.id).toBe(key);
    expect(t.name).toMatch(/\S/);
    expect(t.description).toMatch(/\S/);
    expect(t.primaryColor).toMatch(HEX);
    expect(t.accentColor).toMatch(HEX);
    expect(t.headerBg).toMatch(HEX);
    expect(["serif", "sans"]).toContain(t.fontStyle);
  });

  it("template display names are unique", () => {
    const names = entries.map(([, t]) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("COLOR_PRESETS", () => {
  it("have unique names and valid hex colours", () => {
    expect(new Set(COLOR_PRESETS.map((p) => p.name)).size).toBe(COLOR_PRESETS.length);
    for (const p of COLOR_PRESETS) {
      expect(p.primary).toMatch(HEX);
      expect(p.accent).toMatch(HEX);
    }
  });
});

describe("template id lists", () => {
  it("ALL_TEMPLATE_IDS covers every template exactly once", () => {
    expect([...ALL_TEMPLATE_IDS].sort()).toEqual(Object.keys(TEMPLATES).sort());
  });

  it("INDUSTRY_TEMPLATE_IDS is a 6-item subset without duplicates", () => {
    expect(INDUSTRY_TEMPLATE_IDS).toHaveLength(6);
    expect(new Set(INDUSTRY_TEMPLATE_IDS).size).toBe(6);
    for (const id of INDUSTRY_TEMPLATE_IDS) expect(TEMPLATES[id]).toBeDefined();
  });
});

describe("getStaticSampleInvoice", () => {
  it("is deterministic (server-safe, no Date.now/UUID)", () => {
    expect(getStaticSampleInvoice()).toEqual(getStaticSampleInvoice());
  });

  it("defaults to the modern template", () => {
    const s = getStaticSampleInvoice();
    expect(s.template).toBe("modern");
    expect(s.customStyle.primaryColor).toBe(TEMPLATES.modern.primaryColor);
  });

  it.each(ALL_TEMPLATE_IDS)("template %s: styled from its config, valid invoice", (id) => {
    const s = getStaticSampleInvoice({ template: id });
    expect(s.template).toBe(id);
    expect(s.customStyle).toEqual({
      primaryColor: TEMPLATES[id].primaryColor,
      accentColor: TEMPLATES[id].accentColor,
      fontStyle: TEMPLATES[id].fontStyle,
    });
    expect(validateInvoice(s)).toEqual({});
    expect(s.lineItems.every((li) => li.id.startsWith(`sample-${id}-`))).toBe(true);
  });

  it("default items total $4,900", () => {
    expect(calculateSubtotal(getStaticSampleInvoice().lineItems)).toBe(4900);
  });

  it.each(Object.keys(INDUSTRIES))("industry %s: uses its items with correct amounts", (key) => {
    const industry = INDUSTRIES[key];
    const s = getStaticSampleInvoice({ industry, template: "classic" });
    expect(s.lineItems.map((l) => l.description)).toEqual(industry.sampleItems.map((i) => i.description));
    for (const li of s.lineItems) expect(li.amount).toBe(calculateLineAmount(li.quantity, li.rate));
    expect(validateInvoice(s)).toEqual({});
  });

  it("embeds base64 SVG data URLs for signature and QR", () => {
    for (const uri of [DEFAULT_SAMPLE_SIGNATURE, DEFAULT_SAMPLE_QR]) {
      expect(uri.startsWith("data:image/svg+xml;base64,")).toBe(true);
      const svg = Buffer.from(uri.split(",")[1], "base64").toString("utf8");
      expect(svg).toMatch(/^<svg[\s\S]*<\/svg>$/);
    }
  });
});
