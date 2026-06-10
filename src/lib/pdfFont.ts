// Unicode-capable font loader for jsPDF.
//
// jsPDF's built-in helvetica is a Type1 font with WinAnsi encoding —
// only 256 characters, so any non-Latin-1 user text (Russian, Greek,
// accented EU languages, currency symbols beyond € and £, etc.) renders
// as garbage. The fix is to register a TrueType font that has the
// glyphs we need.
//
// We ship NotoSans (Latin + Greek + Cyrillic, Regular + Bold) from
// `/public/fonts/` and register it at PDF generation time. Both styles
// must be registered separately — jsPDF/jsPDF-AutoTable does NOT
// synthesize bold from regular for a TTF face.
//
// CJK, Arabic, Devanagari, Hebrew are still unsupported (they need
// additional script-specific Noto subsets — each is ~600KB so we don't
// preload them). When that user demand shows up, drop the relevant
// `NotoSansDevanagari-Regular.ttf` etc. into `/public/fonts/` and
// extend `FONT_SOURCES` below.
//
// The loader is memoized so a single page can generate many PDFs
// without re-fetching the TTFs each time. Failures are non-fatal: we
// log once and fall back to helvetica.

import type jsPDF from "jspdf";

interface FontSource {
  file: string;       // path under /public served from same origin
  pdfName: string;    // logical font name passed to doc.setFont()
  style: "normal" | "bold" | "italic";
}

const FONT_SOURCES: FontSource[] = [
  { file: "/fonts/NotoSans-Regular.ttf", pdfName: "NotoSans", style: "normal" },
  { file: "/fonts/NotoSans-Bold.ttf", pdfName: "NotoSans", style: "bold" },
  { file: "/fonts/NotoSans-Italic.ttf", pdfName: "NotoSans", style: "italic" },
];

let cachedBase64: Record<string, string> | null = null;
let loadFailed = false;

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url} ${res.status}`);
  const buf = await res.arrayBuffer();
  // Walk in chunks — String.fromCharCode chokes on very large spreads.
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Register the Unicode font(s) with `doc` and set NotoSans as the
 * default face. Returns true if the registration succeeded — caller
 * should leave jsPDF on its built-in helvetica if false comes back.
 *
 * Safe to call multiple times: the underlying TTF bytes are fetched
 * once per page-load and the doc-side registration is fast.
 */
export async function applyUnicodeFont(doc: jsPDF): Promise<boolean> {
  if (loadFailed) return false;
  try {
    if (!cachedBase64) {
      const entries = await Promise.all(
        FONT_SOURCES.map(async (s) => [s.file, await fetchAsBase64(s.file)] as const),
      );
      cachedBase64 = Object.fromEntries(entries);
    }
    for (const src of FONT_SOURCES) {
      const b64 = cachedBase64[src.file];
      if (!b64) continue;
      const vfsName = src.file.split("/").pop() ?? src.file;
      doc.addFileToVFS(vfsName, b64);
      doc.addFont(vfsName, src.pdfName, src.style);
    }
    doc.setFont("NotoSans", "normal");
    return true;
  } catch (err) {
    loadFailed = true;
    if (typeof console !== "undefined") {
      console.warn(
        "[pdfFont] Unicode font load failed — non-Latin text in PDFs may render incorrectly.",
        err,
      );
    }
    return false;
  }
}

/**
 * Logical font face callers should pass to `doc.setFont(...)` once the
 * Unicode font has been applied. Centralised so a future face change
 * (e.g. switching to Inter) only edits one place.
 */
export const PDF_FONT_FAMILY = "NotoSans";
