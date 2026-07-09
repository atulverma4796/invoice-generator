"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RentReceiptForm, {
  RentReceiptData,
  defaultRentReceiptData,
  RENT_RECEIPT_STORAGE_KEY,
  monthsBetween,
  groupMonthsIntoReceipts,
} from "@/components/RentReceiptForm";
import { trackDocDownload } from "@/lib/trackDocDownload";

export default function RentReceiptClient() {
  const [data, setData] = useState<RentReceiptData>(defaultRentReceiptData);
  const [generating, setGenerating] = useState(false);

  // Load saved details on first mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RENT_RECEIPT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<RentReceiptData>;
        setData((d) => ({ ...d, ...saved }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const months = monthsBetween(data.startMonth, data.endMonth);
      const groups = groupMonthsIntoReceipts(months, data.receiptSplit);
      const { generateRentReceiptPDF } = await import("@/lib/generateRentReceiptPDF");
      const doc = await generateRentReceiptPDF({ data, groups });
      const filename = `rent-receipts-${data.startMonth}-to-${data.endMonth}.pdf`;
      doc.save(filename);
      toast.success(`Downloaded ${groups.length} receipt${groups.length === 1 ? "" : "s"}`);
      trackDocDownload("rent-receipt", {
        lineItemCount: groups.length,
        flags: { hasLandlordPan: !!data.landlordPan },
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
      <RentReceiptForm
        data={data}
        setData={setData}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </div>
  );
}
