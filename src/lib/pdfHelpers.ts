// Shared, framework-free helpers for the PDF generators and the on-screen
// invoice preview. Anything that decides WHAT the user sees (colours,
// number formatting) lives here so the preview and the downloaded PDF can
// never drift apart.

import type jsPDF from "jspdf";
import { getCountryRule } from "./validation";

// ───────────────────────── Colour ─────────────────────────

export function hexToRgb(hex: string): [number, number, number] {
  let h = (hex || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map((c) => c + c).join("");
  const m = /^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

/** WCAG 2.x relative luminance, 0 (black) … 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** True for pale backgrounds (cream, white, light grey) that need dark text. */
export function isLightColor(hex: string): boolean {
  return relativeLuminance(hex) > 0.5;
}

const NEAR_BLACK = "#1f2937";
const WHITE = "#ffffff";
// WCAG AA for large / bold text (the header title and the table head).
const MIN_HEADER_CONTRAST = 3;

/**
 * Pick a readable text colour for text drawn on `bg`.
 * `preferred` (e.g. the template's brand colour) wins when it is legible;
 * otherwise fall back to whichever of white / near-black contrasts more.
 */
export function readableTextOn(bg: string, preferred?: string): string {
  if (preferred && contrastRatio(preferred, bg) >= MIN_HEADER_CONTRAST) return preferred;
  return contrastRatio(WHITE, bg) >= contrastRatio(NEAR_BLACK, bg) ? WHITE : NEAR_BLACK;
}

/**
 * Header colours for an invoice template. Used by BOTH the preview and the
 * PDF so they always agree. Light headers (Minimal, Pastel, Mono) show the
 * brand colour as text; dark headers show white — except Executive, whose
 * gold-on-charcoal brand colour is the point of the design.
 */
export function invoiceHeaderColors(
  template: string,
  headerBg: string,
  primaryColor: string,
): { bg: string; text: string } {
  const preferred = isLightColor(headerBg) || template === "executive" ? primaryColor : WHITE;
  return { bg: headerBg, text: readableTextOn(headerBg, preferred) };
}

// ───────────────────────── Money ─────────────────────────

// ISO 4217 minor units. Explicit (not Intl's resolvedOptions) because ICU
// versions disagree — some report 0 decimals for IDR/PKR/COP/HUF, which
// would silently round a merchant's paise/centavos away.
const ZERO_DECIMAL = new Set([
  "JPY", "KRW", "VND", "CLP", "ISK", "UGX", "PYG", "XAF", "XOF", "XPF", "RWF", "KMF", "GNF", "DJF", "VUV", "BIF",
]);
const THREE_DECIMAL = new Set(["BHD", "KWD", "OMR", "JOD", "TND", "IQD", "LYD"]);

/** ISO-4217 minor units (JPY/KRW → 0, BHD/KWD → 3, everything else → 2). */
export function currencyFractionDigits(code: string): number {
  const c = (code || "").toUpperCase();
  if (ZERO_DECIMAL.has(c)) return 0;
  if (THREE_DECIMAL.has(c)) return 3;
  return 2;
}

/** "1,234.50" — grouped, with the currency's own number of decimals. */
export function formatAmount(amount: number, currencyCode: string): string {
  const d = currencyFractionDigits(currencyCode);
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
}

// ───────────────────────── Images ─────────────────────────

export type DataUrlImageFormat = "PNG" | "JPEG" | "WEBP" | "GIF" | "SVG" | null;

export function imageFormatFromDataUrl(dataUrl: string): DataUrlImageFormat {
  const m = /^data:image\/([a-z0-9.+-]+)[;,]/i.exec(dataUrl || "");
  if (!m) return null;
  const t = m[1].toLowerCase();
  if (t === "png") return "PNG";
  if (t === "jpeg" || t === "jpg" || t === "pjpeg") return "JPEG";
  if (t === "webp") return "WEBP";
  if (t === "gif") return "GIF";
  if (t === "svg+xml" || t === "svg") return "SVG";
  return null;
}

/**
 * jsPDF cannot embed SVG. In the browser we rasterise it to a PNG via a
 * canvas; anywhere a canvas is unavailable (server, tests) we return null
 * and the caller simply leaves the image out — never a crash.
 */
export async function rasterizeSvgDataUrl(dataUrl: string, sizePx = 400): Promise<string | null> {
  if (typeof document === "undefined" || typeof Image === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const img = new Image();
    const loaded = new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      setTimeout(() => resolve(false), 3000);
    });
    img.src = dataUrl;
    if (!(await loaded)) return null;
    const w = img.naturalWidth || sizePx;
    const h = img.naturalHeight || sizePx;
    const scale = sizePx / Math.max(w, h);
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Normalise a user image (logo / signature) to something jsPDF can embed.
 * Returns null when the image can't be used (unknown type, SVG without a
 * canvas) so the generator can skip it gracefully.
 */
export async function toPdfImage(
  dataUrl: string,
): Promise<{ data: string; format: "PNG" | "JPEG" | "WEBP" | "GIF" } | null> {
  const fmt = imageFormatFromDataUrl(dataUrl);
  if (!fmt) return null;
  if (fmt === "SVG") {
    const png = await rasterizeSvgDataUrl(dataUrl);
    return png ? { data: png, format: "PNG" } : null;
  }
  return { data: dataUrl, format: fmt };
}

/** Fit an image inside a box keeping its aspect ratio. */
export function fitImage(doc: jsPDF, data: string, maxW: number, maxH: number): { w: number; h: number } {
  try {
    const p = doc.getImageProperties(data);
    if (p.width > 0 && p.height > 0) {
      const s = Math.min(maxW / p.width, maxH / p.height);
      return { w: p.width * s, h: p.height * s };
    }
  } catch {
    // fall through to the box size
  }
  return { w: maxW, h: maxH };
}

// ───────────────────────── Text layout ─────────────────────────

/**
 * Draw wrapped text that may span pages. Lines that would cross
 * `pageHeight - bottomMargin` continue at `topY` on a fresh page.
 * Returns the y just below the last line.
 */
export function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  opts: { maxWidth: number; lineHeight: number; bottomMargin?: number; topY?: number },
): number {
  if (!text) return y;
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottom = pageHeight - (opts.bottomMargin ?? 15);
  const topY = opts.topY ?? 20;
  const lines: string[] = doc.splitTextToSize(text, opts.maxWidth);
  for (const line of lines) {
    if (y > bottom) {
      doc.addPage();
      y = topY;
    }
    doc.text(line, x, y);
    y += opts.lineHeight;
  }
  return y;
}

/** Wrap one block of text to a column width (array of lines). */
export function wrap(doc: jsPDF, text: string, width: number): string[] {
  return doc.splitTextToSize(text, width) as string[];
}

// ───────────────────────── Labels ─────────────────────────

/** "GSTIN" from "Client GSTIN" — the Bill To block already says who it is. */
export function clientTaxIdDisplayLabel(currency: string): string {
  const label = getCountryRule(currency).clientTaxIdLabel || "Tax ID";
  return label.replace(/^client\s+/i, "") || "Tax ID";
}
