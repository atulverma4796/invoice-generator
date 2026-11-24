// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("jspdf", async () => (await import("./helpers/jspdfSpy")).jspdfMockFactory());
vi.mock("react-hot-toast", () => {
  const t = Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() });
  return { default: t, toast: t };
});
vi.mock("@/components/SignaturePad", () => ({ default: () => null }));

import { useState } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import QuotationForm, { type QuotationData } from "@/components/QuotationForm";
import PurchaseOrderForm, { type PurchaseOrderData } from "@/components/PurchaseOrderForm";
import SalarySlipForm, { type SalarySlipData } from "@/components/SalarySlipForm";
import RentReceiptForm, { type RentReceiptData } from "@/components/RentReceiptForm";
import DeliveryNoteForm, { type DeliveryNoteData } from "@/components/DeliveryNoteForm";
import { generateQuotationPDF } from "@/lib/generateQuotationPDF";
import { generatePurchaseOrderPDF } from "@/lib/generatePurchaseOrderPDF";
import { generateSalarySlipPDF } from "@/lib/generateSalarySlipPDF";
import { stubFontFetch, valueForLabel, moneyValue } from "./helpers/env";
import { quotation, purchaseOrder, salarySlip, rentReceipt, deliveryNote, quoteItems } from "./helpers/fixtures";

beforeEach(() => {
  cleanup();
  vi.mocked(toast.error).mockClear();
  Element.prototype.scrollIntoView = vi.fn();
  stubFontFetch();
});

/** Render a controlled form with real state so edits flow through. */
function Harness<T>({ initial, Form, onGenerate }: {
  initial: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form: React.ComponentType<any>;
  onGenerate: (d: T) => void;
}) {
  const [data, setData] = useState<T>(initial);
  return <Form data={data} setData={setData} onGenerate={() => onGenerate(data)} generating={false} />;
}

function formValue(label: string): string {
  const el = screen.getAllByText(label, { exact: true }).find((e) => e.tagName === "SPAN")!;
  return el.nextElementSibling!.textContent!;
}

describe("QuotationForm on-screen totals equal the PDF", () => {
  const cases: [string, Partial<QuotationData>][] = [
    ["default sample", {}],
    ["no tax/discount", { taxRate: 0, discountRate: 0 }],
    ["40 items, fractional rates", { lineItems: quoteItems(40), taxRate: 12.5, discountRate: 7 }],
    ["half-cent edge", { lineItems: [{ id: "a", description: "x", quantity: 1, rate: 1.005 }], taxRate: 18, discountRate: 0 }],
  ];
  for (const [name, o] of cases) {
    it(name, async () => {
      const data = quotation(o);
      render(<Harness initial={data} Form={QuotationForm} onGenerate={() => {}} />);
      const doc = await generateQuotationPDF(data);
      expect(moneyValue(formValue("Subtotal"))).toBe(moneyValue(valueForLabel(doc, "Subtotal")));
      expect(moneyValue(formValue("Estimated Total"))).toBe(moneyValue(valueForLabel(doc, "Estimated Total")));
      if (data.taxRate > 0) {
        const label = `${data.taxLabel} (${data.taxRate}%)`;
        expect(moneyValue(formValue(label))).toBe(moneyValue(valueForLabel(doc, label)));
      }
    });
  }

  it("validation blocks download without sender/client names", async () => {
    const gen = vi.fn();
    render(<Harness initial={quotation({ senderName: "" })} Form={QuotationForm} onGenerate={gen} />);
    await userEvent.click(screen.getByRole("button", { name: /Download Quotation/i }));
    expect(gen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Please enter your name or business name.");
  });
});

describe("PurchaseOrderForm on-screen totals equal the PDF", () => {
  const cases: [string, Partial<PurchaseOrderData>][] = [
    ["default", {}],
    ["no tax/discount/shipping", { taxRate: 0, discountRate: 0, shippingFee: 0 }],
    ["40 items", { lineItems: quoteItems(40), taxRate: 20, discountRate: 2.5, shippingFee: 99.99 }],
  ];
  for (const [name, o] of cases) {
    it(name, async () => {
      const data = purchaseOrder(o);
      render(<Harness initial={data} Form={PurchaseOrderForm} onGenerate={() => {}} />);
      const doc = await generatePurchaseOrderPDF(data);
      expect(moneyValue(formValue("Subtotal"))).toBe(moneyValue(valueForLabel(doc, "Subtotal")));
      expect(moneyValue(formValue("PO Total"))).toBe(moneyValue(valueForLabel(doc, "PO Total")));
      if (data.shippingFee > 0) expect(moneyValue(formValue("Shipping"))).toBe(moneyValue(valueForLabel(doc, "Shipping")));
    });
  }
});

describe("SalarySlipForm", () => {
  function netShown(): number {
    const p = screen.getByText(/^Net Pay for /);
    return moneyValue(p.nextElementSibling!.textContent!);
  }

  it("net pay on screen equals the PDF, with LOP prorated in both", async () => {
    const data = salarySlip({ presentDays: 27 });
    render(<Harness initial={data} Form={SalarySlipForm} onGenerate={() => {}} />);
    expect(screen.getByTestId("lop-deduction")).toHaveTextContent("Loss of Pay (3 days)");
    const doc = await generateSalarySlipPDF(data);
    expect(netShown()).toBe(43000);
    expect(netShown()).toBe(moneyValue(valueForLabel(doc, "NET PAY", { dy: 5 })));
    expect(moneyValue(formValue("Total Deductions"))).toBe(moneyValue(valueForLabel(doc, "Total Deductions")));
  });

  it("changing Days Present updates the LOP deduction live", async () => {
    render(<Harness initial={salarySlip()} Form={SalarySlipForm} onGenerate={() => {}} />);
    expect(screen.queryByTestId("lop-deduction")).toBeNull();
    const present = screen.getByText("Days Present").parentElement!.querySelector("input")!;
    fireEvent.change(present, { target: { value: "25" } });
    expect(screen.getByTestId("lop-deduction")).toHaveTextContent("Loss of Pay (5 days)");
    expect(netShown()).toBe(50000 - 2000 - Math.round((50000 * 5 / 30) * 100) / 100);
  });

  it("blocks download when deductions exceed gross", async () => {
    const gen = vi.fn();
    render(<Harness initial={salarySlip({ presentDays: 0 })} Form={SalarySlipForm} onGenerate={gen} />);
    await userEvent.click(screen.getByRole("button", { name: /Download Salary Slip/i }));
    expect(gen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/deductions are higher/));
  });
});

describe("RentReceiptForm", () => {
  const download = () => screen.getByRole("button", { name: /^Download \d+ receipts? as PDF/ });

  it("PAN is required based on ANNUAL rent even for a short custom range", async () => {
    // 3 months × ₹10,000 = ₹30,000 selected, but ₹1.2 lakh a year → PAN needed.
    const gen = vi.fn();
    render(
      <Harness
        initial={rentReceipt({ landlordPan: "", monthlyRent: 10000, periodMode: "custom", startMonth: "2025-04", endMonth: "2025-06" })}
        Form={RentReceiptForm}
        onGenerate={gen}
      />,
    );
    expect(screen.getByText(/Landlord PAN required/)).toBeInTheDocument();
    await userEvent.click(download());
    expect(gen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/Landlord PAN is required/));
  });

  it("PAN not required when annual rent ≤ ₹1 lakh, even across a long range", async () => {
    // 8,000 × 12 = 96,000 / yr; custom 15-month span totals ₹1.2 lakh but the rule is annual.
    const gen = vi.fn();
    render(
      <Harness
        initial={rentReceipt({ landlordPan: "", monthlyRent: 8000, periodMode: "custom", startMonth: "2025-01", endMonth: "2026-03" })}
        Form={RentReceiptForm}
        onGenerate={gen}
      />,
    );
    expect(screen.queryByText(/Landlord PAN required/)).toBeNull();
    await userEvent.click(download());
    expect(gen).toHaveBeenCalledTimes(1);
  });

  it("financial-year picker sets Apr–Mar and 12 receipts; split options update counts", async () => {
    let generated: RentReceiptData | null = null;
    render(<Harness initial={rentReceipt()} Form={RentReceiptForm} onGenerate={(d: RentReceiptData) => (generated = d)} />);
    const fySelect = screen.getAllByRole("combobox").find((s) => /FY \d{4}/.test(s.textContent || ""))! as HTMLSelectElement;
    const year = Number(fySelect.options[2].value);
    await userEvent.selectOptions(fySelect, String(year));
    expect(screen.getByText(new RegExp(`Generates 12 monthly receipts, April ${year} to March\\s*${year + 1}`))).toBeInTheDocument();
    expect(download()).toHaveTextContent("Download 12 receipts as PDF");

    const split = screen.getAllByRole("combobox").find((s) => /Quarterly/.test(s.textContent || ""))!;
    fireEvent.change(split, { target: { value: "quarterly" } });
    expect(download()).toHaveTextContent("Download 4 receipts as PDF");
    fireEvent.change(split, { target: { value: "yearly" } });
    expect(download()).toHaveTextContent("Download 1 receipt as PDF");

    await userEvent.click(download());
    expect(generated!.startMonth).toBe(`${year}-04`);
    expect(generated!.endMonth).toBe(`${year + 1}-03`);
  });

  it("'Whole Financial Year' toggle snaps a custom range to the FY containing its start month", async () => {
    let generated: RentReceiptData | null = null;
    render(
      <Harness
        initial={rentReceipt({ periodMode: "custom", startMonth: "2025-01", endMonth: "2025-02" })}
        Form={RentReceiptForm}
        onGenerate={(d: RentReceiptData) => (generated = d)}
      />,
    );
    expect(download()).toHaveTextContent("Download 2 receipts as PDF");
    await userEvent.click(screen.getByRole("button", { name: "Whole Financial Year" }));
    expect(download()).toHaveTextContent("Download 12 receipts as PDF");
    await userEvent.click(download());
    expect(generated!.startMonth).toBe("2024-04"); // Jan 2025 is in FY 2024-25
    expect(generated!.endMonth).toBe("2025-03");
    expect(generated).not.toHaveProperty("start");
  });

  it("summary total and words agree", () => {
    render(<Harness initial={rentReceipt({ monthlyRent: 12345 })} Form={RentReceiptForm} onGenerate={() => {}} />);
    expect(screen.getByText("₹1,48,140")).toBeInTheDocument(); // 12 × 12,345
    expect(screen.getByText("One Lakh Forty Eight Thousand One Hundred Forty Rupees Only")).toBeInTheDocument();
  });

  it("reversed custom range → 0 receipts, download blocked", async () => {
    const gen = vi.fn();
    render(
      <Harness initial={rentReceipt({ periodMode: "custom", startMonth: "2026-03", endMonth: "2025-04" })} Form={RentReceiptForm} onGenerate={gen} />,
    );
    await userEvent.click(download());
    expect(gen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/valid From\/To month range/));
  });
});

describe("DeliveryNoteForm", () => {
  it("valid data reaches onGenerate", async () => {
    const gen = vi.fn();
    render(<Harness initial={deliveryNote()} Form={DeliveryNoteForm} onGenerate={gen} />);
    await userEvent.click(screen.getByRole("button", { name: /Download Delivery Note/i }));
    expect(gen).toHaveBeenCalledTimes(1);
  });
  it("blocks download without consignee", async () => {
    const gen = vi.fn();
    render(<Harness initial={deliveryNote({ consigneeName: "" }) as DeliveryNoteData} Form={DeliveryNoteForm} onGenerate={gen} />);
    await userEvent.click(screen.getByRole("button", { name: /Download Delivery Note/i }));
    expect(gen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Please enter the recipient (consignee) name.");
  });
});

// Type-only reference so unused-import lint doesn't trip on SalarySlipData.
export type _Unused = SalarySlipData;
