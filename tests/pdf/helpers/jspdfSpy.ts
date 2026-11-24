// Test-only instrumentation for jsPDF.
//
// jsPDF builds each document as a plain object inside its constructor
// (there is no prototype to spy on), so we replace the module's default
// export with a factory that creates the real document and then wraps the
// drawing methods we care about. Every call is recorded with the state that
// matters for assertions (page, colours, font, size), so tests can check
// WHAT was drawn, WHERE, and in WHICH colour — without parsing PDF bytes
// (text in an embedded TTF font is written as glyph ids, not readable text).
//
// Usage in a test file (vi.mock is hoisted, so it must be top-level):
//   vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import { vi } from "vitest";
import type jsPDFType from "jspdf";

export interface TextCall {
  kind: "text";
  text: string; // lines joined with "\n" when an array was passed
  lines: string[];
  x: number;
  y: number;
  align?: string;
  maxWidth?: number;
  angle?: number;
  page: number;
  color: string; // "#rrggbb"
  font: string;
  fontStyle: string;
  fontSize: number;
  width: number; // widest line in mm at the current font size
}

export interface RectCall {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  style?: string;
  page: number;
  fill: string;
}

export interface ImageCall {
  kind: "image";
  format: string;
  x: number;
  y: number;
  w: number;
  h: number;
  page: number;
}

export type DrawCall = TextCall | RectCall | ImageCall;

export interface DocLog {
  calls: DrawCall[];
  texts: TextCall[];
  rects: RectCall[];
  images: ImageCall[];
}

// Shared via globalThis so the registry survives vi.resetModules() (the
// mocked jspdf module is cached separately from this helper's instance).
const G = globalThis as unknown as { __jspdfSpyLogs?: WeakMap<object, DocLog> };
const LOGS: WeakMap<object, DocLog> = (G.__jspdfSpyLogs ??= new WeakMap<object, DocLog>());
export const createdDocs: jsPDFType[] = [];

export function logOf(doc: jsPDFType): DocLog {
  const log = LOGS.get(doc);
  if (!log) throw new Error("document was not created through the jsPDF spy");
  return log;
}

function normHex(c: unknown): string {
  if (typeof c !== "string") return String(c);
  let s = c.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(s)) s = "#" + s.slice(1).split("").map((ch) => ch + ch).join("");
  // jsPDF returns grey levels for setTextColor(255) as "#ffffff" already; keep as is
  return s;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function instrument(doc: any) {
  const log: DocLog = { calls: [], texts: [], rects: [], images: [] };
  LOGS.set(doc, log);
  const page = () => doc.getCurrentPageInfo().pageNumber as number;

  const origText = doc.text;
  doc.text = function (text: any, x: any, y: any, options?: any, transform?: any) {
    const lines: string[] = Array.isArray(text) ? text.map(String) : String(text).split("\n");
    let width = 0;
    try {
      for (const l of lines) width = Math.max(width, doc.getTextWidth(l));
    } catch {
      width = NaN;
    }
    const font = doc.getFont();
    const call: TextCall = {
      kind: "text",
      text: lines.join("\n"),
      lines,
      x: Number(x),
      y: Number(y),
      align: options?.align,
      maxWidth: options?.maxWidth,
      angle: options?.angle,
      page: page(),
      color: normHex(doc.getTextColor()),
      font: font.fontName,
      fontStyle: font.fontStyle,
      fontSize: doc.getFontSize(),
      width,
    };
    log.calls.push(call);
    log.texts.push(call);
    return origText.call(this, text, x, y, options, transform);
  };

  const origRect = doc.rect;
  doc.rect = function (...args: any[]) {
    const [x, y, w, h, style] = args as [number, number, number, number, string | undefined];
    const call: RectCall = { kind: "rect", x, y, w, h, style, page: page(), fill: normHex(doc.getFillColor()) };
    log.calls.push(call);
    log.rects.push(call);
    return origRect.apply(this, args);
  };

  const origRounded = doc.roundedRect;
  doc.roundedRect = function (...args: any[]) {
    const [x, y, w, h, , , style] = args as [number, number, number, number, number, number, string | undefined];
    const call: RectCall = { kind: "rect", x, y, w, h, style, page: page(), fill: normHex(doc.getFillColor()) };
    log.calls.push(call);
    log.rects.push(call);
    return origRounded.apply(this, args);
  };

  const origImage = doc.addImage;
  doc.addImage = function (...args: any[]) {
    const [, format, x, y, w, h] = args;
    const call: ImageCall = { kind: "image", format: String(format), x, y, w, h, page: page() };
    // Only record after a successful add so failed (skipped) images do not count.
    const res = origImage.apply(this, args);
    log.calls.push(call);
    log.images.push(call);
    return res;
  };
}

export async function jspdfMockFactory() {
  const actual: any = await vi.importActual("jspdf");
  const Real = actual.default ?? actual.jsPDF;
  function SpyJsPDF(this: any, ...args: any[]) {
    const doc = new Real(...args);
    instrument(doc);
    createdDocs.push(doc);
    return doc;
  }
  Object.assign(SpyJsPDF, Real);
  (SpyJsPDF as any).API = Real.API;
  (SpyJsPDF as any).version = Real.version;
  return { ...actual, default: SpyJsPDF, jsPDF: SpyJsPDF };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
