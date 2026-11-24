import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());

import { generateSalarySlipPDF } from "@/lib/generateSalarySlipPDF";
import { computeSalaryTotals } from "@/components/SalarySlipForm";
import { numberToIndianWords } from "@/lib/numberToWords";
import { logOf } from "./helpers/jspdfSpy";
import { stubFontFetch, allText, valueForLabel, expectAllTextOnPage, expectValidPdf, extent, moneyValue, NAMES, A4, FOOTER_RE } from "./helpers/env";
import { salarySlip, LONG_TEXT } from "./helpers/fixtures";

beforeEach(() => {
  stubFontFetch();
});

describe("computeSalaryTotals", () => {
  it("full attendance → no LOP", () => {
    expect(computeSalaryTotals(salarySlip())).toEqual({
      grossEarnings: 50000,
      lopDays: 0,
      lopDeduction: 0,
      listedDeductions: 2000,
      totalDeductions: 2000,
      netPay: 48000,
    });
  });

  it("LOP is prorated: 3 unpaid days of 30 → 10% of gross deducted", () => {
    const t = computeSalaryTotals(salarySlip({ presentDays: 27 }));
    expect(t.lopDays).toBe(3);
    expect(t.lopDeduction).toBe(5000);
    expect(t.totalDeductions).toBe(7000);
    expect(t.netPay).toBe(43000);
  });

  it("paid leave is not LOP", () => {
    const t = computeSalaryTotals(salarySlip({ presentDays: 27, paidLeave: 3 }));
    expect(t.lopDays).toBe(0);
    expect(t.netPay).toBe(48000);
  });

  it("odd day counts round to paise", () => {
    const t = computeSalaryTotals(salarySlip({ workingDays: 31, presentDays: 30 }));
    expect(t.lopDeduction).toBe(Math.round((50000 / 31) * 100) / 100); // 1612.90
  });

  it("present + leave > working days never gives negative LOP", () => {
    expect(computeSalaryTotals(salarySlip({ presentDays: 31, paidLeave: 2 })).lopDays).toBe(0);
  });

  it("0 working days (blank field) → no LOP, no division by zero", () => {
    const t = computeSalaryTotals(salarySlip({ workingDays: 0, presentDays: 0 }));
    expect(t.lopDeduction).toBe(0);
    expect(Number.isFinite(t.netPay)).toBe(true);
  });

  it("zero attendance → whole gross is LOP", () => {
    const t = computeSalaryTotals(salarySlip({ presentDays: 0 }));
    expect(t.lopDays).toBe(30);
    expect(t.lopDeduction).toBe(50000);
    expect(t.netPay).toBe(-2000);
  });
});

describe("generateSalarySlipPDF", () => {
  it("full data → gross / deductions / net and amount in words", async () => {
    const doc = await generateSalarySlipPDF(salarySlip());
    expectValidPdf(doc);
    expect(valueForLabel(doc, "Gross Earnings")).toBe("Rs. 50,000.00");
    expect(valueForLabel(doc, "Total Deductions")).toBe("Rs. 2,000.00");
    expect(valueForLabel(doc, "NET PAY", { dy: 5 })).toBe("Rs. 48,000.00");
    expect(allText(doc)).toContain(`(In words: ${numberToIndianWords(48000)} Rupees Only)`);
    expect(allText(doc)).toContain("LOP: 0");
    expect(allText(doc)).not.toContain("Loss of Pay");
    expectAllTextOnPage(doc);
  });

  it("LOP days appear as a prorated deduction line and reduce net pay", async () => {
    const doc = await generateSalarySlipPDF(salarySlip({ presentDays: 27 }));
    expect(allText(doc)).toContain("LOP: 3");
    expect(valueForLabel(doc, "Loss of Pay (3 days)")).toBe("Rs. 5,000.00");
    expect(valueForLabel(doc, "Total Deductions")).toBe("Rs. 7,000.00");
    expect(valueForLabel(doc, "NET PAY", { dy: 5 })).toBe("Rs. 43,000.00");
    expect(allText(doc)).toContain(numberToIndianWords(43000));
  });

  it("PDF totals equal computeSalaryTotals for many shapes", async () => {
    const shapes = [
      salarySlip(),
      salarySlip({ presentDays: 20, paidLeave: 2 }),
      salarySlip({ workingDays: 26, presentDays: 25 }),
      salarySlip({ earnings: [{ id: "e", label: "Basic", amount: 12345.67 }], deductions: [{ id: "d", label: "TDS", amount: 0 }] }),
    ];
    for (const d of shapes) {
      const t = computeSalaryTotals(d);
      const doc = await generateSalarySlipPDF(d);
      expect(moneyValue(valueForLabel(doc, "Gross Earnings"))).toBeCloseTo(t.grossEarnings, 2);
      expect(moneyValue(valueForLabel(doc, "Total Deductions"))).toBeCloseTo(t.totalDeductions, 2);
      expect(moneyValue(valueForLabel(doc, "NET PAY", { dy: 5 }))).toBeCloseTo(t.netPay, 2);
    }
  });

  it("non-INR currency → symbol prefix, no Indian words line", async () => {
    const doc = await generateSalarySlipPDF(salarySlip({ currencySymbol: "$" }));
    expect(valueForLabel(doc, "NET PAY", { dy: 5 })).toBe("$ 48,000.00");
    expect(allText(doc)).not.toContain("In words");
  });

  it("minimal data (blank strings, single zero lines) renders", async () => {
    const doc = await generateSalarySlipPDF(
      salarySlip({
        companyName: "",
        companyAddress: "",
        companyEmail: "",
        employeeName: "",
        employeeId: "",
        designation: "",
        department: "",
        joiningDate: "",
        employeePan: "",
        bankAccount: "",
        bankName: "",
        earnings: [{ id: "e", label: "", amount: 0 }],
        deductions: [{ id: "d", label: "", amount: 0 }],
        notes: "",
      }),
    );
    expectValidPdf(doc);
    expect(allText(doc)).not.toContain("In words"); // net pay 0
    expectAllTextOnPage(doc);
  });

  it("40 earnings + 40 deductions → page break, totals and net pay on-page", async () => {
    const lines = (p: string) => Array.from({ length: 40 }, (_, i) => ({ id: `${p}${i}`, label: `${p} component ${i + 1}`, amount: 1000 + i }));
    const d = salarySlip({ earnings: lines("Earning"), deductions: lines("Deduction").map((l) => ({ ...l, amount: 10 })) });
    const doc = await generateSalarySlipPDF(d);
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expect(moneyValue(valueForLabel(doc, "NET PAY", { dy: 5 }))).toBeCloseTo(computeSalaryTotals(d).netPay, 2);
    expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
  });

  it("long labels wrap inside their half; long employee values never cross into the next column", async () => {
    const d = salarySlip({
      companyName: "Global Mega Conglomerate Software and Consulting Services Private Limited India",
      companyEmail: "human.resources.department@globalmegaconglomerate.example.com",
      employeeName: "Venkata Subramanian Lakshminarayanan Ramaswamy Iyer",
      designation: "Principal Staff Distinguished Software Development Engineer II",
      earnings: [{ id: "e", label: "Special Performance Linked Incentive Allowance (Quarterly Bonus Component)", amount: 5000 }],
      deductions: [{ id: "d", label: "Voluntary Provident Fund Contribution Over Statutory Limit", amount: 100 }],
      notes: LONG_TEXT,
    });
    const doc = await generateSalarySlipPDF(d);
    expectAllTextOnPage(doc, { bottom: A4.h - 14, ignore: FOOTER_RE });
    const mid = A4.w / 2;
    const grossY = logOf(doc).texts.find((t) => t.text === "Gross Earnings")!.y;
    for (const t of logOf(doc).texts.filter((t) => t.page === 1 && !t.align && t.y > 28 && t.y < grossY && !t.text.startsWith("Working Days"))) {
      const [l, r] = extent(t);
      if (l < mid - 10) expect(r, t.text).toBeLessThan(mid);
    }
    // header company name doesn't run into the right-aligned email
    const header = logOf(doc).texts.filter((t) => t.page === 1 && t.y === 22);
    const left = header.find((t) => !t.align)!;
    const right = header.find((t) => t.align === "right")!;
    expect(extent(left)[1]).toBeLessThan(extent(right)[0]);
  });

  for (const [script, name] of Object.entries(NAMES)) {
    it(`${script} names do not crash`, async () => {
      const doc = await generateSalarySlipPDF(salarySlip({ companyName: name, employeeName: name, earnings: [{ id: "e", label: name, amount: 1 }] }));
      expectValidPdf(doc);
    });
  }
});
