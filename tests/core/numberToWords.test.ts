import { describe, it, expect } from "vitest";
import { numberToIndianWords } from "@/lib/numberToWords";

describe("numberToIndianWords", () => {
  it.each([
    [0, "Zero"],
    [1, "One"],
    [9, "Nine"],
    [10, "Ten"],
    [11, "Eleven"],
    [19, "Nineteen"],
    [20, "Twenty"],
    [21, "Twenty One"],
    [99, "Ninety Nine"],
    [100, "One Hundred"],
    [101, "One Hundred One"],
    [110, "One Hundred Ten"],
    [999, "Nine Hundred Ninety Nine"],
    [1000, "One Thousand"],
    [1001, "One Thousand One"],
    [5000, "Five Thousand"],
    [12345, "Twelve Thousand Three Hundred Forty Five"],
    [99999, "Ninety Nine Thousand Nine Hundred Ninety Nine"],
  ])("%s → %s", (n, words) => {
    expect(numberToIndianWords(n)).toBe(words);
  });

  it("uses lakh (1,00,000) instead of hundred thousand", () => {
    expect(numberToIndianWords(100000)).toBe("One Lakh");
    expect(numberToIndianWords(150000)).toBe("One Lakh Fifty Thousand");
    expect(numberToIndianWords(155000)).toBe("One Lakh Fifty Five Thousand");
    expect(numberToIndianWords(2500000)).toBe("Twenty Five Lakh");
    expect(numberToIndianWords(9999999)).toBe("Ninety Nine Lakh Ninety Nine Thousand Nine Hundred Ninety Nine");
  });

  it("uses crore (1,00,00,000) instead of ten million", () => {
    expect(numberToIndianWords(10000000)).toBe("One Crore");
    expect(numberToIndianWords(12345678)).toBe("One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight");
    expect(numberToIndianWords(990000000)).toBe("Ninety Nine Crore");
  });

  it("handles 100+ crore (previously produced 'undefined Crore')", () => {
    expect(numberToIndianWords(1000000000)).toBe("One Hundred Crore");
    expect(numberToIndianWords(1234567890)).toBe("One Hundred Twenty Three Crore Forty Five Lakh Sixty Seven Thousand Eight Hundred Ninety");
    expect(numberToIndianWords(999999999999)).toBe(
      "Ninety Nine Thousand Nine Hundred Ninety Nine Crore Ninety Nine Lakh Ninety Nine Thousand Nine Hundred Ninety Nine",
    );
    expect(numberToIndianWords(1000000000)).not.toMatch(/undefined/);
  });

  it("returns digits above the supported range instead of garbage", () => {
    expect(numberToIndianWords(1000000000000)).toBe("1000000000000");
  });

  it("drops the decimal part (paise) — integer rupees only", () => {
    expect(numberToIndianWords(1234.99)).toBe("One Thousand Two Hundred Thirty Four");
    expect(numberToIndianWords(0.99)).toBe("Zero");
  });

  it("uses the absolute value for negatives", () => {
    expect(numberToIndianWords(-2500)).toBe("Two Thousand Five Hundred");
  });

  it("returns Zero for NaN instead of an empty string", () => {
    expect(numberToIndianWords(NaN)).toBe("Zero");
  });

  it("never emits 'undefined' or double spaces across a wide range", () => {
    for (let n = 0; n < 1_000_000_000_000; n = Math.floor(n * 1.37) + 7) {
      const w = numberToIndianWords(n);
      expect(w, String(n)).not.toMatch(/undefined|\s{2}|^\s|\s$/);
    }
  });
});
