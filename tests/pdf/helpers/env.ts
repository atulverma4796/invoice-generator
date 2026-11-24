// Shared test environment helpers for the PDF suite.
import { vi, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type jsPDFType from "jspdf";
import { logOf, type TextCall } from "./jspdfSpy";

const PUBLIC_DIR = path.resolve(__dirname, "../../../public");

/**
 * In the browser pdfFont fetches `/fonts/*.ttf` from the same origin. In
 * tests there is no server, so serve those paths straight from /public.
 */
export function stubFontFetch() {
  const fetchMock = vi.fn(async (url: string | URL) => {
    const p = typeof url === "string" ? url : url.toString();
    const file = path.join(PUBLIC_DIR, p.replace(/^\//, ""));
    if (!fs.existsSync(file)) return new Response("not found", { status: 404 });
    return new Response(fs.readFileSync(file));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export const A4 = { w: 210, h: 297 };

/** All drawn strings, flattened, for "contains" style assertions. */
export function allText(doc: jsPDFType): string {
  return logOf(doc).texts.map((t) => t.text).join("\n");
}

export function textsMatching(doc: jsPDFType, re: RegExp | string): TextCall[] {
  return logOf(doc).texts.filter((t) => (typeof re === "string" ? t.text.includes(re) : re.test(t.text)));
}

/**
 * The value drawn on the same line (same page, |Δy| ≤ dy) nearest to the
 * right of a label. Works for two-column layouts (salary slip) too.
 */
export function valueForLabel(doc: jsPDFType, label: RegExp | string, opts: { dy?: number } = {}): string | undefined {
  const dy = opts.dy ?? 0.01;
  const texts = logOf(doc).texts;
  const lbl = texts.find((t) => (typeof label === "string" ? t.text === label : label.test(t.text)));
  if (!lbl) return undefined;
  const sameRow = texts.filter((t) => t !== lbl && t.page === lbl.page && Math.abs(t.y - lbl.y) <= dy && t.x > lbl.x);
  return sameRow.sort((a, b) => a.x - b.x)[0]?.text;
}

/** Horizontal extent of a text call, honouring alignment. */
export function extent(t: TextCall): [number, number] {
  const w = t.maxWidth && t.width > t.maxWidth ? t.maxWidth : t.width;
  if (t.align === "right") return [t.x - w, t.x];
  if (t.align === "center") return [t.x - w / 2, t.x + w / 2];
  return [t.x, t.x + w];
}

/**
 * Every text call stays on the page: inside the horizontal edges and above
 * the bottom edge (line baselines of multi-line calls included).
 * Rotated watermark text is excluded.
 */
export const FOOTER_RE = /^Generated (with|by) InvoiceGen/;

export function expectAllTextOnPage(doc: jsPDFType, opts: { bottom?: number; ignore?: RegExp } = {}) {
  const bottom = opts.bottom ?? A4.h - 4;
  for (const t of logOf(doc).texts) {
    if (t.angle) continue;
    if (opts.ignore && opts.ignore.test(t.text)) continue;
    const [l, r] = extent(t);
    expect(l, `text "${t.text.slice(0, 40)}" starts off-page (x=${l})`).toBeGreaterThanOrEqual(-0.5);
    expect(r, `text "${t.text.slice(0, 40)}" runs off the right edge (r=${r.toFixed(1)})`).toBeLessThanOrEqual(A4.w + 0.5);
    const lineH = (t.fontSize * 0.3528) * 1.15;
    const lastBaseline = t.y + (t.lines.length - 1) * lineH;
    expect(lastBaseline, `text "${t.text.slice(0, 40)}" runs off the bottom (y=${lastBaseline.toFixed(1)})`).toBeLessThanOrEqual(bottom);
  }
}

/** Valid PDF bytes come out (font subsetting etc. happens here). */
export function expectValidPdf(doc: jsPDFType) {
  const buf = doc.output("arraybuffer");
  const head = new TextDecoder().decode(new Uint8Array(buf).slice(0, 5));
  expect(head).toBe("%PDF-");
  expect(buf.byteLength).toBeGreaterThan(1000);
}

// ── colour maths for contrast assertions (WCAG 2.x) ──
export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`bad hex ${hex}`);
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function lum(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Parse a "Rs. 1,234.50" / "$ 1,234" / "-€ 12.00" string to a number. */
export function moneyValue(s: string | undefined): number {
  if (s == null) return NaN;
  const neg = s.trim().startsWith("-") || s.trim().startsWith("−");
  const m = s.match(/[\d,]+(\.\d+)?/g);
  if (!m) return NaN;
  const n = Number(m[m.length - 1].replace(/,/g, ""));
  return neg ? -n : n;
}

export function lorem(words: number): string {
  const base = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");
  return Array.from({ length: words }, (_, i) => base[i % base.length]).join(" ");
}

export const NAMES = {
  latin: "Jürgen Müller-Lüdenscheidt GmbH & Co. KG",
  cyrillic: "ООО «Ромашка» Иванов Пётр",
  greek: "Παπαδόπουλος Α.Ε. Αθήνα",
  hindi: "शर्मा एंटरप्राइजेज",
  arabic: "شركة النور للتجارة",
  chinese: "北京科技有限公司",
};

/** jsPDF stores colours as 0..1 floats, so read-back hex can be off by 1. */
export function sameColor(a: string, b: string, tol = 2): boolean {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return x.every((v, i) => Math.abs(v - y[i]) <= tol);
}
