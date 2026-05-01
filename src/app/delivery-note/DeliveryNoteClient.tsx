"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DeliveryNoteForm, {
  DeliveryNoteData,
  defaultDeliveryNoteData,
  DELIVERY_NOTE_STORAGE_KEY,
} from "@/components/DeliveryNoteForm";

export default function DeliveryNoteClient() {
  const [data, setData] = useState<DeliveryNoteData>(defaultDeliveryNoteData);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DELIVERY_NOTE_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<DeliveryNoteData>;
        setData((d) => ({ ...d, ...saved }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { generateDeliveryNotePDF } = await import("@/lib/generateDeliveryNotePDF");
      const doc = generateDeliveryNotePDF(data);
      doc.save(`delivery-note-${data.challanNumber || "unnamed"}.pdf`);
      toast.success("Delivery note downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
      <DeliveryNoteForm
        data={data}
        setData={setData}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </div>
  );
}
