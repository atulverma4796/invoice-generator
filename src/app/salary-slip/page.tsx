import { Metadata } from "next";
import SalarySlipClient from "./SalarySlipClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Salary Slip Generator (Payslip) — PDF Download | InvoiceGen",
  description:
    "Generate a professional salary slip / payslip in seconds. Free, no signup, instant PDF download. Editable earnings (Basic, HRA, DA, allowances), deductions (PF, PT, TDS), days-worked block, net pay in words. India-friendly format.",
  keywords: [
    "salary slip generator",
    "payslip generator",
    "free salary slip maker",
    "salary slip format",
    "salary slip PDF",
    "monthly payslip generator",
    "payslip India",
    "salary slip generator India",
    "online payslip generator",
    "salary slip template",
    "payslip format with PF and tax",
  ],
  alternates: { canonical: `${SITE_URL}/salary-slip` },
  openGraph: {
    title: "Free Salary Slip / Payslip Generator — PDF Download",
    description:
      "Generate a professional salary slip in seconds. Free, no signup, instant PDF download.",
    url: `${SITE_URL}/salary-slip`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a salary slip?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A salary slip (also called a payslip) is the monthly statement an employer issues to an employee showing earnings, deductions, and net pay. It is the standard proof of income used for loans, visas, credit-card applications, rental agreements, and tax filing.",
      },
    },
    {
      "@type": "Question",
      name: "Is a salary slip a legal document?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. In India, the Payment of Wages Act and the Code on Wages, 2019 require employers to issue payslips to employees. Most banks and financial institutions accept the payslip as proof of income alongside Form 16 / ITR.",
      },
    },
    {
      "@type": "Question",
      name: "What goes into Earnings vs Deductions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Earnings typically include: Basic salary, HRA (House Rent Allowance), DA (Dearness Allowance), Conveyance Allowance, Medical Allowance, Special Allowance, and Bonus. Deductions usually include: Provident Fund (PF), Professional Tax (PT), Income Tax (TDS), and any salary advance or loan EMI being recovered.",
      },
    },
    {
      "@type": "Question",
      name: "How is Net Pay calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Net Pay = Gross Earnings − Total Deductions. Gross Earnings is the sum of all earning components (Basic + HRA + DA + Allowances + Bonus). Total Deductions is the sum of all deductions (PF + PT + TDS + others). Net Pay is what actually lands in the employee's bank account.",
      },
    },
    {
      "@type": "Question",
      name: "Can I generate a payslip if I'm self-employed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Salary slips are specifically for salaried employees. If you are self-employed, banks and visa offices typically ask for ITR, bank statements, or income certificates instead. Generating a salary slip for yourself when you are not a salaried employee can constitute misrepresentation — use the right document for your situation.",
      },
    },
  ],
};

export default function SalarySlipPage() {
  return (
    <div className="bg-white">
      <JsonLd data={faqSchema} />

      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Salary Slip Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-200">
            ✓ 100% Free Forever
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Free Salary Slip Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Generate a professional payslip in seconds. Free, no signup, instant PDF download.
            Editable earnings &amp; deductions, working-days block, and net pay in words built in.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SalarySlipClient />
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((q, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {q.name}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {q.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Need an HRA receipt for tax claim?
            </h2>
            <p className="text-blue-100 mb-5 text-sm">
              Generate a year of compliant rent receipts with landlord PAN — alongside your payslip — for the HRA exemption under Section 10(13A).
            </p>
            <Link
              href="/rent-receipt"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Rent Receipt Generator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
