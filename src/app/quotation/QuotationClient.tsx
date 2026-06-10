"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import QuotationForm, {
  QuotationData,
  defaultQuotationData,
  QUOTATION_STORAGE_KEY,
} from "@/components/QuotationForm";
import { trackDocDownload } from "@/lib/trackDocDownload";

export default function QuotationClient() {
  const [data, setData] = useState<QuotationData>(defaultQuotationData);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUOTATION_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<QuotationData>;
        setData((d) => ({ ...d, ...saved }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { generateQuotationPDF } = await import("@/lib/generateQuotationPDF");
      const doc = await generateQuotationPDF(data);
      doc.save(`quotation-${data.quoteNumber || "unnamed"}.pdf`);
      toast.success("Quotation downloaded");
      trackDocDownload("quotation", {
        currency: data.currency,
        lineItemCount: data.lineItems?.length,
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
      <QuotationForm
        data={data}
        setData={setData}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </div>
  );
}
