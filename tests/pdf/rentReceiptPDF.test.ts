import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import { generateRentReceiptPDF } from "@/lib/generateRentReceiptPDF";
import {
  groupMonthsIntoReceipts,
  monthsBetween,
  monthsPerReceipt,
  fyRange,
  fyPeriod,
  fyStartFromMonth,
  currentFyStartYear,
  financialYearOptions,
  isLandlordPanRequired,
  needsRevenueStamp,
  type RentReceiptData,
} from "@/components/RentReceiptForm";
import { numberToIndianWords } from "@/lib/numberToWords";
import { logOf } from "./helpers/jspdfSpy";
import { stubFontFetch, allText, textsMatching, expectAllTextOnPage, expectValidPdf, NAMES, A4, FOOTER_RE } from "./helpers/env";
import { rentReceipt, PNG_1PX, JPEG_8x4 } from "./helpers/fixtures";

beforeEach(() => {
  stubFontFetch();
});

async function gen(data: RentReceiptData) {
  const groups = groupMonthsIntoReceipts(monthsBetween(data.startMonth, data.endMonth), data.receiptSplit);
  return { doc: await generateRentReceiptPDF({ data, groups }), groups };
}

// Independent words → number parser (Indian system) to cross-check the PDF.
const W: Record<string, number> = {
  Zero: 0, One: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10,
  Eleven: 11, Twelve: 12, Thirteen: 13, Fourteen: 14, Fifteen: 15, Sixteen: 16, Seventeen: 17, Eighteen: 18, Nineteen: 19,
  Twenty: 20, Thirty: 30, Forty: 40, Fifty: 50, Sixty: 60, Seventy: 70, Eighty: 80, Ninety: 90,
};
const SCALE: Record<string, number> = { Hundred: 100, Thousand: 1e3, Lakh: 1e5, Crore: 1e7 };
function wordsToNumber(words: string): number {
  let total = 0;
  let cur = 0;
  for (const w of words.trim().split(/\s+/)) {
    if (w in W) cur += W[w];
    else if (w === "Hundred") cur *= 100;
    else if (w in SCALE) {
      if (w === "Crore") {
        total = (total + cur) * 1e7;
      } else {
        total += cur * SCALE[w];
      }
      cur = 0;
    } else throw new Error(`unknown word ${w}`);
  }
  return total + cur;
}

/** Pull "Rs. 45,000 (Forty Five Thousand Rupees Only)" paragraphs per page. */
function amountLines(doc: Awaited<ReturnType<typeof gen>>["doc"]) {
  return textsMatching(doc, /^Rs\. [\d,]+ \([\s\S]+ Rupees Only\)$/).map((t) => {
    const m = /^Rs\. ([\d,]+) \((.+) Rupees Only\)$/.exec(t.text.replace(/\n/g, " "))!;
    return { page: t.page, figure: Number(m[1].replace(/,/g, "")), words: m[2] };
  });
}

describe("receipt grouping helpers", () => {
  it("monthsBetween is inclusive, crosses years, empty when reversed/blank", () => {
    expect(monthsBetween("2025-11", "2026-02")).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"]);
    expect(monthsBetween("2025-04", "2025-04")).toEqual(["2025-04"]);
    expect(monthsBetween("2026-02", "2025-11")).toEqual([]);
    expect(monthsBetween("", "2025-11")).toEqual([]);
  });

  it("splits: monthly 12, quarterly 4, half-yearly 2, single 1 for a full FY", () => {
    const fy = monthsBetween("2025-04", "2026-03");
    expect(groupMonthsIntoReceipts(fy, "monthly")).toHaveLength(12);
    expect(groupMonthsIntoReceipts(fy, "quarterly").map((g) => g.length)).toEqual([3, 3, 3, 3]);
    expect(groupMonthsIntoReceipts(fy, "half-yearly").map((g) => g.length)).toEqual([6, 6]);
    expect(groupMonthsIntoReceipts(fy, "yearly").map((g) => g.length)).toEqual([12]);
    expect(groupMonthsIntoReceipts([], "monthly")).toEqual([]);
  });

  it("uneven ranges leave a shorter last receipt", () => {
    const m = monthsBetween("2025-04", "2025-08");
    expect(groupMonthsIntoReceipts(m, "quarterly").map((g) => g.length)).toEqual([3, 2]);
    expect(groupMonthsIntoReceipts(m, "half-yearly").map((g) => g.length)).toEqual([5]);
    expect(monthsPerReceipt("yearly")).toBe(Infinity);
  });

  it("financial year helpers", () => {
    expect(fyRange(2025)).toEqual({ start: "2025-04", end: "2026-03" });
    // form-field shape used by the FY picker (regression: picker used to set stray start/end keys)
    expect(fyPeriod(2023)).toEqual({ startMonth: "2023-04", endMonth: "2024-03" });
    expect(fyStartFromMonth("2026-03")).toBe(2025);
    expect(fyStartFromMonth("2026-04")).toBe(2026);
    expect(fyStartFromMonth("2026-01")).toBe(2025);
    expect(currentFyStartYear(new Date(2026, 2, 31))).toBe(2025); // 31 Mar
    expect(currentFyStartYear(new Date(2026, 3, 1))).toBe(2026); // 1 Apr
    expect(financialYearOptions(new Date(2026, 10, 24))).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020]);
  });
});

describe("landlord PAN & revenue stamp rules", () => {
  it("PAN required when ANNUAL rent exceeds ₹1 lakh (independent of the period selected)", () => {
    expect(isLandlordPanRequired(8333)).toBe(false); // 99,996 / yr
    expect(isLandlordPanRequired(8334)).toBe(true); // 1,00,008 / yr
    expect(isLandlordPanRequired(100000 / 12)).toBe(false); // exactly 1 lakh is not "exceeds"
    expect(isLandlordPanRequired(10000)).toBe(true); // even if only 3 receipts (₹30k) are generated
    expect(isLandlordPanRequired(0)).toBe(false);
  });

  it("revenue stamp: cash receipts above ₹5,000, judged per receipt amount", () => {
    expect(needsRevenueStamp("Cash", 5000)).toBe(false);
    expect(needsRevenueStamp("Cash", 5001)).toBe(true);
    expect(needsRevenueStamp("UPI", 50000)).toBe(false);
    expect(needsRevenueStamp("Cheque", 50000)).toBe(false);
    expect(needsRevenueStamp("Bank Transfer", 50000)).toBe(false);
  });
});

describe("generateRentReceiptPDF", () => {
  it("monthly FY → 12 one-page receipts, numbered, dated to month end", async () => {
    const { doc } = await gen(rentReceipt());
    expectValidPdf(doc);
    expect(doc.getNumberOfPages()).toBe(12);
    for (let i = 1; i <= 12; i++) expect(allText(doc)).toContain(`No. R-${String(i).padStart(3, "0")}`);
    expect(allText(doc)).toContain("30 April 2025");
    expect(allText(doc)).toContain("31 March 2026");
    const amounts = amountLines(doc);
    expect(amounts).toHaveLength(12);
    for (const a of amounts) expect(a.figure).toBe(15000);
    expect(allText(doc)).toContain("PAN: ABCDE1234F");
    expectAllTextOnPage(doc);
  });

  for (const [split, receipts, months] of [
    ["quarterly", 4, 3],
    ["half-yearly", 2, 6],
    ["yearly", 1, 12],
  ] as const) {
    it(`${split} → ${receipts} receipt(s) of ${months} months each`, async () => {
      const { doc } = await gen(rentReceipt({ receiptSplit: split }));
      expect(doc.getNumberOfPages()).toBe(receipts);
      const amounts = amountLines(doc);
      expect(amounts.map((a) => a.figure)).toEqual(Array(receipts).fill(15000 * months));
      expect(textsMatching(doc, `(${months} months @ Rs. 15,000 per month)`)).toHaveLength(receipts);
      expect(textsMatching(doc, /^For the period: /)).toHaveLength(receipts);
    });
  }

  it("Indian digit grouping on amounts (₹1,80,000)", async () => {
    const { doc } = await gen(rentReceipt({ receiptSplit: "yearly" }));
    expect(allText(doc)).toContain("Rs. 1,80,000");
  });

  it("custom range with uneven quarterly split → 3-month and 2-month receipts", async () => {
    const { doc } = await gen(rentReceipt({ periodMode: "custom", startMonth: "2025-11", endMonth: "2026-03", receiptSplit: "quarterly" }));
    expect(amountLines(doc).map((a) => a.figure)).toEqual([45000, 30000]);
    expect(allText(doc)).toContain("For the period: Nov 2025 – Jan 2026");
    expect(allText(doc)).toContain("For the period: Feb 2026 – Mar 2026");
  });

  it("amount in words matches the figure on every receipt, for many rent values", async () => {
    for (const rent of [1, 999, 5000, 5001, 12345, 99999, 250000, 1234567]) {
      for (const split of ["monthly", "quarterly", "yearly"] as const) {
        const { doc, groups } = await gen(rentReceipt({ monthlyRent: rent, receiptSplit: split, periodMode: "custom", startMonth: "2025-04", endMonth: "2025-09" }));
        const lines = amountLines(doc);
        expect(lines.map((a) => a.figure)).toEqual(groups.map((g) => rent * g.length));
        for (const a of lines) {
          expect(a.words).toBe(numberToIndianWords(a.figure));
          expect(wordsToNumber(a.words), `${rent}/${split}: ${a.words}`).toBe(a.figure);
        }
      }
    }
  });

  it("revenue stamp box appears for cash monthly rent above ₹5,000", async () => {
    const { doc } = await gen(rentReceipt({ paymentMode: "Cash", monthlyRent: 5001, periodMode: "custom", startMonth: "2025-04", endMonth: "2025-04" }));
    expect(allText(doc)).toContain("REVENUE");
  });

  it("no stamp for cash at exactly ₹5,000 monthly, or for bank transfers", async () => {
    const a = await gen(rentReceipt({ paymentMode: "Cash", monthlyRent: 5000, periodMode: "custom", startMonth: "2025-04", endMonth: "2025-04" }));
    expect(allText(a.doc)).not.toContain("REVENUE");
    const b = await gen(rentReceipt({ paymentMode: "Bank Transfer", monthlyRent: 50000 }));
    expect(allText(b.doc)).not.toContain("REVENUE");
  });

  it("bundled cash receipt above ₹5,000 gets a stamp even if monthly rent is below (3 × ₹2,000 = ₹6,000)", async () => {
    const { doc } = await gen(rentReceipt({ paymentMode: "Cash", monthlyRent: 2000, receiptSplit: "quarterly" }));
    expect(textsMatching(doc, "REVENUE")).toHaveLength(4);
    const monthly = await gen(rentReceipt({ paymentMode: "Cash", monthlyRent: 2000, receiptSplit: "monthly" }));
    expect(allText(monthly.doc)).not.toContain("REVENUE");
  });

  it("receipt numbering continues from the chosen start number", async () => {
    const { doc } = await gen(rentReceipt({ receiptStartNumber: 99, periodMode: "custom", startMonth: "2025-04", endMonth: "2025-06" }));
    expect(allText(doc)).toContain("No. R-099");
    expect(allText(doc)).toContain("No. R-100");
    expect(allText(doc)).toContain("No. R-101");
  });

  it("landlord signature: PNG and JPEG embedded in their own format on every receipt; corrupt one skipped", async () => {
    const png = await gen(rentReceipt({ landlordSignature: PNG_1PX, receiptSplit: "quarterly" }));
    expect(logOf(png.doc).images.map((i) => i.format)).toEqual(["PNG", "PNG", "PNG", "PNG"]);
    const jpg = await gen(rentReceipt({ landlordSignature: JPEG_8x4, receiptSplit: "half-yearly" }));
    expect(logOf(jpg.doc).images.map((i) => i.format)).toEqual(["JPEG", "JPEG"]);
    const bad = await gen(rentReceipt({ landlordSignature: "data:image/png;base64,AAAA" }));
    expectValidPdf(bad.doc);
    expect(logOf(bad.doc).images).toHaveLength(0);
  });

  it("blank optional fields use fill-in lines; no PAN line without PAN", async () => {
    const { doc } = await gen(rentReceipt({ tenantName: "", landlordName: "", propertyAddress: "", landlordPan: "", periodMode: "custom", startMonth: "2025-04", endMonth: "2025-04" }));
    expect(allText(doc)).toContain("_________________");
    expect(allText(doc)).not.toContain("PAN:");
    expectAllTextOnPage(doc);
  });

  it("long tenant/landlord names and address wrap and stay above the signature line", async () => {
    const long = "Shri Venkata Subramanian Lakshminarayanan Ramaswamy Iyer and Smt. Padmavathi Lakshminarayanan";
    const { doc } = await gen(
      rentReceipt({
        tenantName: long,
        landlordName: long,
        propertyAddress: "Flat 1203, Tower B, " + "Extremely Long Residential Society Name Phase II, ".repeat(5) + "Bengaluru 560001",
        monthlyRent: 1234567,
        periodMode: "custom",
        startMonth: "2025-04",
        endMonth: "2025-04",
      }),
    );
    expectAllTextOnPage(doc, { ignore: FOOTER_RE });
    const sig = logOf(doc).texts.find((t) => t.text === "Landlord Signature")!;
    const body = logOf(doc).texts.filter((t) => t.page === 1 && t.y > 40 && t.text !== "Landlord Signature" && !FOOTER_RE.test(t.text));
    for (const t of body) {
      const lastBaseline = t.y + (t.lines.length - 1) * t.fontSize * 0.3528 * 1.15;
      expect(lastBaseline, t.text.slice(0, 30)).toBeLessThan(sig.y - 5);
    }
    // the bold amount paragraph wrapped into several lines rather than one overlong line
    const para = textsMatching(doc, /^Rs\. 12,34,567 \(/)[0];
    for (const l of para.lines) expect(l.length).toBeLessThan(110);
    expect(para.y).toBeLessThan(A4.h);
  });

  for (const [script, name] of Object.entries(NAMES)) {
    it(`${script} names do not crash`, async () => {
      const { doc } = await gen(rentReceipt({ tenantName: name, landlordName: name, propertyAddress: name, periodMode: "custom", startMonth: "2025-04", endMonth: "2025-05" }));
      expectValidPdf(doc);
      expect(allText(doc)).toContain(name);
    });
  }
});
