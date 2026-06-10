"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SalarySlipForm, {
  SalarySlipData,
  defaultSalarySlipData,
  SALARY_SLIP_STORAGE_KEY,
} from "@/components/SalarySlipForm";
import { trackDocDownload } from "@/lib/trackDocDownload";

export default function SalarySlipClient() {
  const [data, setData] = useState<SalarySlipData>(defaultSalarySlipData);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SALARY_SLIP_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SalarySlipData>;
        setData((d) => ({ ...d, ...saved }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { generateSalarySlipPDF } = await import("@/lib/generateSalarySlipPDF");
      const doc = await generateSalarySlipPDF(data);
      const safeName = (data.employeeName || "employee").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      doc.save(`payslip-${safeName}-${data.payMonth}.pdf`);
      toast.success("Payslip downloaded");
      trackDocDownload("salary-slip", {
        currency: data.currencySymbol,
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
      <SalarySlipForm
        data={data}
        setData={setData}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </div>
  );
}
