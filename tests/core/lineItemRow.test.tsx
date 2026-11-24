// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LineItemRow from "@/components/LineItemRow";
import type { LineItem } from "@/types/invoice";

afterEach(cleanup);

const base: LineItem = { id: "row-1", description: "Logo design", quantity: 2, rate: 150.5, amount: 301 };

function setup(item: Partial<LineItem> = {}, currency = "USD", canRemove = true) {
  const onUpdate = vi.fn();
  const onRemove = vi.fn();
  render(<LineItemRow item={{ ...base, ...item }} currency={currency} onUpdate={onUpdate} onRemove={onRemove} canRemove={canRemove} />);
  return { onUpdate, onRemove };
}

describe("LineItemRow", () => {
  it("shows description, qty, rate and the amount with 2 decimals", () => {
    setup();
    expect(screen.getByPlaceholderText("Item description")).toHaveValue("Logo design");
    expect(screen.getByPlaceholderText("Qty")).toHaveValue(2);
    expect(screen.getByPlaceholderText("Rate")).toHaveValue(150.5);
    expect(screen.getByText("$301.00")).toBeInTheDocument();
  });

  it.each([
    ["INR", "₹"], ["EUR", "€"], ["GBP", "£"], ["AED", "AED"], ["JPY", "¥"], ["CZK", "Kč"], ["XYZ", "$"],
  ])("prefixes the %s symbol %s", (currency, symbol) => {
    setup({ amount: 1234.5 }, currency);
    expect(screen.getByText(`${symbol}1234.50`)).toBeInTheDocument();
  });

  it("zero qty/rate render as empty inputs with placeholders, amount 0.00", () => {
    setup({ quantity: 0, rate: 0, amount: 0 });
    expect(screen.getByPlaceholderText("Qty")).toHaveValue(null);
    expect(screen.getByPlaceholderText("Rate")).toHaveValue(null);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("sends description changes as strings (unicode ok)", () => {
    const { onUpdate } = setup();
    fireEvent.change(screen.getByPlaceholderText("Item description"), { target: { value: "डिज़ाइन 設計" } });
    expect(onUpdate).toHaveBeenCalledWith("row-1", "description", "डिज़ाइन 設計");
  });

  it("parses quantity and rate to numbers, including decimals", () => {
    const { onUpdate } = setup();
    fireEvent.change(screen.getByPlaceholderText("Qty"), { target: { value: "1.5" } });
    expect(onUpdate).toHaveBeenLastCalledWith("row-1", "quantity", 1.5);
    fireEvent.change(screen.getByPlaceholderText("Rate"), { target: { value: "99.99" } });
    expect(onUpdate).toHaveBeenLastCalledWith("row-1", "rate", 99.99);
  });

  it("clearing a numeric field sends 0, not NaN", () => {
    const { onUpdate } = setup();
    fireEvent.change(screen.getByPlaceholderText("Qty"), { target: { value: "" } });
    expect(onUpdate).toHaveBeenLastCalledWith("row-1", "quantity", 0);
    fireEvent.change(screen.getByPlaceholderText("Rate"), { target: { value: "" } });
    expect(onUpdate).toHaveBeenLastCalledWith("row-1", "rate", 0);
  });

  it("remove button calls onRemove with the id", async () => {
    const { onRemove } = setup();
    await userEvent.click(screen.getByTitle("Remove item"));
    expect(onRemove).toHaveBeenCalledWith("row-1");
  });

  it("remove button is disabled when it's the last row", async () => {
    const { onRemove } = setup({}, "USD", false);
    expect(screen.getByTitle("Remove item")).toBeDisabled();
    await userEvent.click(screen.getByTitle("Remove item"));
    expect(onRemove).not.toHaveBeenCalled();
  });
});
