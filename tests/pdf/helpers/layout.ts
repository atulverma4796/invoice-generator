// Geometry helpers: "what colour is behind this text?" etc.
import type jsPDFType from "jspdf";
import { logOf, type TextCall, type RectCall } from "./jspdfSpy";

/**
 * Fill colour of the most recent filled rectangle (drawn before `t`, on the
 * same page) that contains the text's anchor point. White page otherwise.
 */
export function backgroundAt(doc: jsPDFType, t: TextCall): string {
  const calls = logOf(doc).calls;
  const idx = calls.indexOf(t);
  for (let i = idx - 1; i >= 0; i--) {
    const c = calls[i];
    if (c.kind !== "rect") continue;
    const r = c as RectCall;
    if (r.page !== t.page) continue;
    if (!r.style || !/F/i.test(r.style)) continue;
    // Anchor: for right-aligned text the anchor is the right edge.
    const px = t.x - (t.align === "right" ? 0.5 : -0.5);
    const py = t.y - 1; // baseline sits near the bottom of the glyphs
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return r.fill;
  }
  return "#ffffff";
}

export function pagesWithText(doc: jsPDFType, text: string): number[] {
  return [...new Set(logOf(doc).texts.filter((t) => t.text === text).map((t) => t.page))].sort((a, b) => a - b);
}
