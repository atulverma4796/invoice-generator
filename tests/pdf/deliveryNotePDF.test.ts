import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import { generateDeliveryNotePDF } from "@/lib/generateDeliveryNotePDF";
import { logOf } from "./helpers/jspdfSpy";
import { stubFontFetch, allText, expectAllTextOnPage, expectValidPdf, extent, NAMES, A4, FOOTER_RE } from "./helpers/env";
import { pagesWithText } from "./helpers/layout";
import { deliveryNote, minimalDeliveryNote, LONG_TEXT } from "./helpers/fixtures";

beforeEach(() => {
  stubFontFetch();
});

const manyItems = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `${i}`, description: `Carton ${i + 1}`, quantity: i + 1, unit: "Box" }));

describe("generateDeliveryNotePDF", () => {
  it("minimal data → valid 1-page PDF with both signature blocks", async () => {
    const doc = await generateDeliveryNotePDF(minimalDeliveryNote());
    expectValidPdf(doc);
    expect(doc.getNumberOfPages()).toBe(1);
    const text = allText(doc);
    expect(text).toContain("DELIVERY NOTE");
    expect(text).toContain("Dispatched by (Consignor)");
    expect(text).toContain("Received in good condition (Consignee)");
    expect(text).not.toContain("REFERENCE");
    expectAllTextOnPage(doc);
  });

  it("full data → totals count items and sum quantities (decimals kept)", async () => {
    const doc = await generateDeliveryNotePDF(deliveryNote());
    const text = allText(doc);
    expect(text).toContain("Total: 2 items");
    expect(text).toContain("52.5"); // 40 + 12.5
    expect(text).toContain("REFERENCE");
    expect(text).toContain("Driver · +91 99999 00000");
    expectAllTextOnPage(doc);
  });

  it("singular 'item' for one row; blank rows ignored", async () => {
    const doc = await generateDeliveryNotePDF(deliveryNote({ items: [{ id: "a", description: "Only", quantity: 3, unit: "Pcs" }, { id: "b", description: "", quantity: 0, unit: "" }] }));
    expect(allText(doc)).toContain("Total: 1 item");
    expect(allText(doc)).not.toContain("Total: 1 items");
  });

  for (const n of [40, 120]) {
    it(`${n} items → header repeats on every page, signatures on-page`, async () => {
      const doc = await generateDeliveryNotePDF(deliveryNote({ items: manyItems(n) }));
      expect(doc.getNumberOfPages()).toBeGreaterThan(1);
      const rowPages = [...new Set(logOf(doc).texts.filter((t) => /^Carton \d+$/.test(t.text)).map((t) => t.page))];
      expect(pagesWithText(doc, "DESCRIPTION")).toEqual(rowPages);
      expect(allText(doc)).toContain(`Total: ${n} items`);
      expect(allText(doc)).toContain(String((n * (n + 1)) / 2));
      expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
    });
  }

  it("signature blocks never get pushed below the page (content near the bottom)", async () => {
    // Find item counts that end the table close to the signature zone.
    for (let n = 18; n <= 30; n++) {
      const doc = await generateDeliveryNotePDF(deliveryNote({ items: manyItems(n), notes: "Line one of notes" }));
      const sig = logOf(doc).texts.find((t) => t.text === "Dispatched by (Consignor)")!;
      expect(sig.y, `n=${n}`).toBeLessThanOrEqual(A4.h - 40);
      const lastPage = doc.getNumberOfPages();
      expect(sig.page).toBe(lastPage);
      // no item/notes text overlaps the signature line zone on that page
      const sameZone = logOf(doc).texts.filter((t) => t.page === sig.page && t.y > sig.y - 6 && t.y < sig.y && !FOOTER_RE.test(t.text));
      expect(sameZone, `n=${n}`).toHaveLength(0);
    }
  });

  it("long notes continue across pages", async () => {
    const doc = await generateDeliveryNotePDF(deliveryNote({ notes: LONG_TEXT }));
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
  });

  it("long party names / transport values stay inside their columns", async () => {
    const long = "Extremely Long Consignor Logistics and Warehousing Solutions Private Limited";
    const doc = await generateDeliveryNotePDF(
      deliveryNote({ consignorName: long, consigneeName: long, consignorAddress: long, consigneeAddress: long, driverName: long, vehicleNumber: long }),
    );
    expectAllTextOnPage(doc);
    const mid = A4.w / 2;
    for (const t of logOf(doc).texts.filter((t) => t.page === 1 && t.y > 50 && t.y < 90 && !t.align)) {
      const [l, r] = extent(t);
      if (l < mid) expect(r, t.text).toBeLessThan(mid + 4);
    }
  });

  for (const [script, name] of Object.entries(NAMES)) {
    it(`${script} text does not crash`, async () => {
      const doc = await generateDeliveryNotePDF(deliveryNote({ consignorName: name, consigneeName: name, items: [{ id: "a", description: name, quantity: 1, unit: "Pcs" }] }));
      expectValidPdf(doc);
      expect(allText(doc)).toContain(name);
    });
  }

  it("every transport mode renders", async () => {
    for (const mode of ["Road", "Air", "Rail", "Sea", "Hand-delivered"] as const) {
      const doc = await generateDeliveryNotePDF(deliveryNote({ transportMode: mode }));
      expect(allText(doc)).toContain(mode);
    }
  });
});
