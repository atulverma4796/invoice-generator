// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { useState, useEffect } from "react";
import { render, screen, fireEvent, cleanup, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { InvoiceData } from "@/types/invoice";
import { createDefaultInvoice, CURRENCIES } from "@/lib/defaultInvoice";
import { getTaxLabelForCurrency } from "@/lib/languages";
import { COUNTRIES } from "@/lib/validation";

// Children are owned/tested elsewhere and pull in canvas/QR libs — stub them.
vi.mock("@/components/TemplateSelector", () => ({ default: () => null }));
vi.mock("@/components/LogoUpload", () => ({ default: () => null }));
vi.mock("@/components/SignaturePad", () => ({ default: () => null }));
vi.mock("@/components/PaymentFields", () => ({ default: () => null }));
vi.mock("@/components/StatusBadge", () => ({ default: () => null }));
vi.mock("@/components/QRCodeSection", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() });
  return { default: toast };
});

import InvoiceForm, { countryDisplayCode } from "@/components/InvoiceForm";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

let latest: InvoiceData;
let loadExternal: (d: InvoiceData) => void;
const track = (d: InvoiceData) => { latest = d; };
const expose = (fn: (d: InvoiceData) => void) => { loadExternal = fn; };

/** Controlled wrapper — mirrors how page.tsx owns the invoice state. */
function Harness({ initial, showErrors = false }: { initial: InvoiceData; showErrors?: boolean }) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    track(data);
    expose(setData);
  }, [data]);
  return <InvoiceForm data={data} onChange={(d) => { track(d); setData(d); }} showErrors={showErrors} />;
}

function filled(over: Partial<InvoiceData> = {}): InvoiceData {
  return {
    ...createDefaultInvoice(),
    senderName: "Acme",
    senderAddress: "1 Main St",
    clientName: "Client",
    clientAddress: "2 High St",
    invoiceDate: "2026-01-01",
    dueDate: "2026-01-31",
    lineItems: [{ id: "li-1", description: "Work", quantity: 1, rate: 100, amount: 100 }],
    ...over,
  };
}

const taxCheckbox = () => screen.getByRole("checkbox", { name: /^Add .+ %$/ });
const taxInput = () => taxCheckbox().closest("div")!.querySelector('input[type="number"]') as HTMLInputElement;
const selectWithOption = (optionText: string) =>
  screen.getAllByRole("combobox").find((s) => within(s).queryByRole("option", { name: optionText }))! as HTMLSelectElement;
const countrySelect = () => selectWithOption("Select country...");
const currencySelect = () => selectWithOption("$ USD - US Dollar");
const taxLabelSelect = () => selectWithOption("Sales Tax");

describe("InvoiceForm — 'Add {taxLabel} %' checkbox", () => {
  it("is checked by default with the rate input enabled", () => {
    render(<Harness initial={createDefaultInvoice()} />);
    expect(taxCheckbox()).toBeChecked();
    expect(taxInput()).toBeEnabled();
    expect(taxInput()).toHaveAttribute("placeholder", "0");
    expect(screen.getByText("Add Tax %")).toBeInTheDocument();
  });

  it.each([["INR", "GST"], ["GBP", "VAT"], ["CAD", "GST/HST"], ["MXN", "IVA"], ["USD", "Tax"]])(
    "label follows the %s tax label (%s)",
    (currency, label) => {
      render(<Harness initial={filled({ currency, taxLabel: label })} />);
      expect(screen.getByRole("checkbox", { name: `Add ${label} %` })).toBeInTheDocument();
    },
  );

  it("typing a rate updates taxRate, including decimals", () => {
    render(<Harness initial={filled()} />);
    fireEvent.change(taxInput(), { target: { value: "8.25" } });
    expect(latest.taxRate).toBe(8.25);
  });

  it("unchecking sets taxRate to 0, disables the input and shows 'No tax'", async () => {
    render(<Harness initial={filled({ taxRate: 18 })} />);
    expect(taxInput()).toHaveValue(18);
    await userEvent.click(taxCheckbox());
    expect(latest.taxRate).toBe(0);
    expect(taxCheckbox()).not.toBeChecked();
    expect(taxInput()).toBeDisabled();
    expect(taxInput()).toHaveAttribute("placeholder", "No tax");
    expect(taxInput()).toHaveValue(null);
  });

  it("re-checking restores the previous rate", async () => {
    render(<Harness initial={filled({ taxRate: 12.5 })} />);
    await userEvent.click(taxCheckbox());
    expect(latest.taxRate).toBe(0);
    await userEvent.click(taxCheckbox());
    expect(latest.taxRate).toBe(12.5);
    expect(taxCheckbox()).toBeChecked();
    expect(taxInput()).toBeEnabled();
    expect(taxInput()).toHaveValue(12.5);
  });

  it("restores a rate the user typed before unchecking", async () => {
    render(<Harness initial={filled()} />);
    fireEvent.change(taxInput(), { target: { value: "20" } });
    await userEvent.click(taxCheckbox());
    await userEvent.click(taxCheckbox());
    expect(latest.taxRate).toBe(20);
  });

  it("uncheck/re-check at 0% keeps 0 and re-enables input", async () => {
    render(<Harness initial={filled({ taxRate: 0 })} />);
    await userEvent.click(taxCheckbox());
    await userEvent.click(taxCheckbox());
    expect(latest.taxRate).toBe(0);
    expect(taxInput()).toBeEnabled();
  });

  it("multiple toggles don't lose the rate", async () => {
    render(<Harness initial={filled({ taxRate: 5 })} />);
    for (let i = 0; i < 3; i++) {
      await userEvent.click(taxCheckbox());
      await userEvent.click(taxCheckbox());
    }
    expect(latest.taxRate).toBe(5);
  });

  it("loading data with taxRate > 0 shows the box checked", async () => {
    render(<Harness initial={filled({ taxRate: 20 })} />);
    await userEvent.click(taxCheckbox());
    expect(taxCheckbox()).not.toBeChecked();
    // e.g. user loads a saved invoice / template that charges tax
    act(() => loadExternal(filled({ taxRate: 7.5 })));
    expect(taxCheckbox()).toBeChecked();
    expect(taxInput()).toBeEnabled();
    expect(taxInput()).toHaveValue(7.5);
  });

  it("initial data with tax renders checked", () => {
    render(<Harness initial={filled({ taxRate: 18, currency: "INR", taxLabel: "GST" })} />);
    expect(taxCheckbox()).toBeChecked();
    expect(taxInput()).toHaveValue(18);
  });
});

describe("InvoiceForm — sender tax ID placeholder & errors", () => {
  const taxIdField = (label: string) => screen.getByPlaceholderText(new RegExp(`^${label.replace(/[()/]/g, "\\$&")}`));

  it("shows * only while tax is charged (INR)", async () => {
    render(<Harness initial={filled({ currency: "INR", taxLabel: "GST", taxRate: 18 })} />);
    expect(taxIdField("GSTIN (GST Number)")).toHaveAttribute("placeholder", "GSTIN (GST Number) *");
    await userEvent.click(taxCheckbox());
    expect(taxIdField("GSTIN (GST Number)")).toHaveAttribute("placeholder", "GSTIN (GST Number) (Optional)");
  });

  it.each([
    ["GBP", "VAT Registration Number"],
    ["EUR", "VAT Identification Number"],
    ["AED", "TRN (Tax Registration Number)"],
    ["AUD", "ABN (Australian Business Number)"],
  ])("%s at 0%% tax is Optional, with tax is *", (currency, label) => {
    const { unmount } = render(<Harness initial={filled({ currency, taxRate: 0 })} />);
    expect(taxIdField(label)).toHaveAttribute("placeholder", `${label} (Optional)`);
    unmount();
    render(<Harness initial={filled({ currency, taxRate: 10 })} />);
    expect(taxIdField(label)).toHaveAttribute("placeholder", `${label} *`);
  });

  it("USD tax ID is always Optional", () => {
    render(<Harness initial={filled({ currency: "USD", taxRate: 8.25 })} />);
    expect(taxIdField("EIN / Tax ID")).toHaveAttribute("placeholder", "EIN / Tax ID (Optional)");
  });

  it("missing GSTIN error disappears once tax is unchecked", async () => {
    render(<Harness initial={filled({ currency: "INR", taxLabel: "GST", taxRate: 18 })} showErrors />);
    expect(screen.getByText("GSTIN (GST Number) is required")).toBeInTheDocument();
    await userEvent.click(taxCheckbox());
    expect(screen.queryByText("GSTIN (GST Number) is required")).not.toBeInTheDocument();
  });

  it("no errors are shown when showErrors is false", () => {
    render(<Harness initial={createDefaultInvoice()} />);
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });

  it("shows range errors for tax and discount, and negative shipping", () => {
    render(<Harness initial={filled({ taxRate: 150, discountRate: 120, shippingFee: -5 })} showErrors />);
    expect(screen.getByText("Tax rate must be between 0 and 100")).toBeInTheDocument();
    expect(screen.getByText("Discount must be between 0 and 100")).toBeInTheDocument();
    expect(screen.getByText("Shipping cannot be negative")).toBeInTheDocument();
  });
});

describe("InvoiceForm — currency, tax label, country", () => {
  it.each(CURRENCIES.map((c) => c.code))("switching currency to %s sets a tax label the dropdown can show", (code) => {
    render(<Harness initial={filled({ currency: code === "USD" ? "EUR" : "USD" })} />);
    fireEvent.change(currencySelect(), { target: { value: code } });
    expect(latest.currency).toBe(code);
    expect(latest.taxLabel).toBe(getTaxLabelForCurrency(code));
    expect(taxLabelSelect().value).toBe(latest.taxLabel);
  });

  it("picking a country sets currency + tax label and keeps that country shown", () => {
    render(<Harness initial={filled()} />);
    fireEvent.change(countrySelect(), { target: { value: "DE" } });
    expect(latest.currency).toBe("EUR");
    expect(latest.taxLabel).toBe("VAT");
    expect(countrySelect().value).toBe("DE"); // not "Austria"
    fireEvent.change(countrySelect(), { target: { value: "IN" } });
    expect(latest.currency).toBe("INR");
    expect(latest.taxLabel).toBe("GST");
    expect(countrySelect().value).toBe("IN");
  });

  it("picking the United States shows United States, not Afghanistan", () => {
    render(<Harness initial={filled({ currency: "EUR" })} />);
    fireEvent.change(countrySelect(), { target: { value: "US" } });
    expect(countrySelect().value).toBe("US");
  });

  it("picking a USD-ised country keeps it selected", () => {
    render(<Harness initial={filled()} />);
    fireEvent.change(countrySelect(), { target: { value: "EC" } });
    expect(latest.currency).toBe("USD");
    expect(countrySelect().value).toBe("EC");
  });

  it("changing currency afterwards drops a country that no longer matches", () => {
    render(<Harness initial={filled()} />);
    fireEvent.change(countrySelect(), { target: { value: "FR" } });
    fireEvent.change(currencySelect(), { target: { value: "GBP" } });
    expect(countrySelect().value).toBe("GB");
  });

  it.each([["USD", "US"], ["SGD", "SG"], ["INR", "IN"], ["GBP", "GB"], ["EUR", ""], ["CZK", "CZ"], ["NPR", "NP"]])(
    "a loaded %s invoice shows country '%s'",
    (currency, code) => {
      render(<Harness initial={filled({ currency })} />);
      expect(countrySelect().value).toBe(code);
    },
  );

  it("country dropdown lists every country", () => {
    render(<Harness initial={filled()} />);
    expect(within(countrySelect()).getAllByRole("option")).toHaveLength(COUNTRIES.length + 1);
  });
});

describe("countryDisplayCode", () => {
  it("keeps a matching explicit pick", () => {
    expect(countryDisplayCode("DE", "EUR")).toBe("DE");
    expect(countryDisplayCode("BN", "SGD")).toBe("BN");
  });
  it("ignores a stale pick that no longer matches the currency", () => {
    expect(countryDisplayCode("DE", "USD")).toBe("US");
  });
  it("falls back to the issuer, then sole user, else blank", () => {
    expect(countryDisplayCode("", "USD")).toBe("US");
    expect(countryDisplayCode("", "AED")).toBe("AE");
    expect(countryDisplayCode("", "EUR")).toBe("");
    expect(countryDisplayCode("", "XYZ")).toBe("");
  });
});

describe("InvoiceForm — line items", () => {
  const descInputs = () => screen.getAllByPlaceholderText("Item description");

  it("recomputes amount with cent rounding when qty/rate change", () => {
    render(<Harness initial={filled()} />);
    fireEvent.change(screen.getByPlaceholderText("Qty"), { target: { value: "3" } });
    fireEvent.change(screen.getByPlaceholderText("Rate"), { target: { value: "0.335" } });
    expect(latest.lineItems[0]).toMatchObject({ quantity: 3, rate: 0.335, amount: 1.01 });
    fireEvent.change(screen.getByPlaceholderText("Rate"), { target: { value: "0.1" } });
    expect(latest.lineItems[0].amount).toBe(0.3);
  });

  it("editing description does not touch the amount", () => {
    render(<Harness initial={filled()} />);
    fireEvent.change(descInputs()[0], { target: { value: "Consulting" } });
    expect(latest.lineItems[0]).toMatchObject({ description: "Consulting", amount: 100 });
  });

  it("adds a blank item and removes it again; the last row can't be removed", async () => {
    render(<Harness initial={filled()} />);
    expect(screen.getByTitle("Remove item")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Add Item/ }));
    expect(latest.lineItems).toHaveLength(2);
    expect(latest.lineItems[1]).toMatchObject({ description: "", quantity: 1, rate: 0, amount: 0 });
    expect(latest.lineItems[1].id).not.toBe(latest.lineItems[0].id);
    await userEvent.click(screen.getAllByTitle("Remove item")[1]);
    expect(latest.lineItems).toHaveLength(1);
    expect(latest.lineItems[0].id).toBe("li-1");
  });

  it("shows per-item errors under the right row", () => {
    render(
      <Harness
        showErrors
        initial={filled({
          lineItems: [
            { id: "a", description: "Work", quantity: 1, rate: 100, amount: 100 },
            { id: "b", description: "", quantity: 2, rate: 10, amount: 20 },
          ],
        })}
      />,
    );
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });
});

describe("InvoiceForm — other numeric fields", () => {
  const numberInputAfterLabel = (label: string) =>
    screen.getByText(label).closest("div")!.querySelector('input[type="number"]') as HTMLInputElement;

  it.each([
    ["Discount %", "discountRate", "12.5", 12.5],
    ["Shipping", "shippingFee", "49.99", 49.99],
    ["Late Fee %/mo", "lateFeeRate", "1.5", 1.5],
  ] as const)("%s input updates %s", (label, field, typed, expected) => {
    render(<Harness initial={filled()} />);
    fireEvent.change(numberInputAfterLabel(label), { target: { value: typed } });
    expect(latest[field]).toBe(expected);
    fireEvent.change(numberInputAfterLabel(label), { target: { value: "" } });
    expect(latest[field]).toBe(0);
  });
});
