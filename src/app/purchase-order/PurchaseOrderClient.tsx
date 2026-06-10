"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PurchaseOrderForm, {
  PurchaseOrderData,
  defaultPurchaseOrderData,
  PURCHASE_ORDER_STORAGE_KEY,
} from "@/components/PurchaseOrderForm";
import { trackDocDownload } from "@/lib/trackDocDownload";

export default function PurchaseOrderClient() {
  const [data, setData] = useState<PurchaseOrderData>(defaultPurchaseOrderData);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PURCHASE_ORDER_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PurchaseOrderData>;
        setData((d) => ({ ...d, ...saved }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { generatePurchaseOrderPDF } = await import("@/lib/generatePurchaseOrderPDF");
      const doc = await generatePurchaseOrderPDF(data);
      doc.save(`purchase-order-${data.poNumber || "unnamed"}.pdf`);
      toast.success("Purchase order downloaded");
      trackDocDownload("purchase-order", {
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
      <PurchaseOrderForm
        data={data}
        setData={setData}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </div>
  );
}
