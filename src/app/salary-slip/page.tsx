import { Metadata } from "next";
import SalarySlipClient from "./SalarySlipClient";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import AffiliateCard from "@/components/AffiliateCard";

const SITE_URL = "https://freeinvoicegen.org";

export const metadata: Metadata = {
  title: "Free Salary Slip Generator (Payslip)",
  description:
    "Generate a professional payslip with editable Basic/HRA/DA, PF/PT/TDS deductions, days-worked block, net pay in words. Free PDF, no signup.",
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
    title: "Free Salary Slip / Payslip Generator — freeinvoicegen.org",
    description:
      "Generate a payslip with editable Basic/HRA/DA, PF/PT/TDS, net pay in words. Free PDF, no signup.",
    url: `${SITE_URL}/salary-slip`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Salary Slip Generator — freeinvoicegen.org",
    description: "Editable payslip — Basic, HRA, DA, PF, PT, TDS, days-worked, net pay in words. Free PDF, no signup.",
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

      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" />
        <div className="absolute top-20 -left-10 w-72 h-72 bg-amber-300/30 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-rose-300/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Salary Slip Generator</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm border border-gray-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            For loan, visa &amp; rental proof
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Payroll without{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
              the $30/month
            </span>{" "}
            software.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
            Generate a professional payslip with editable earnings, deductions, working-days, and
            net pay in words. The kind banks and embassies accept for loans and visas.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Net pay in words</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Working-days block</span>
            <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>Editable earnings &amp; deductions</span>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SalarySlipClient />
          <AffiliateCard variant="compact" />
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            What is a salary slip, and why employees actually need one
          </h2>
          <p className="text-gray-700 leading-relaxed">
            A salary slip — also called a payslip or pay stub — is a monthly document an employer
            issues to an employee showing earnings, deductions, taxes, and net pay for that period.
            On paper it looks routine, but a salary slip is one of the most-used documents in a
            working person&apos;s life. It&apos;s required when applying for a home loan, a personal
            loan, a credit card, a visa, or rented housing. It&apos;s the proof banks and immigration
            officers want to see that you have steady income. Without 3-6 months of salary slips,
            most loan applications stall at the verification step.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            For employers, issuing a proper salary slip every month is not optional. The Payment of
            Wages Act, the Shops &amp; Establishments Act, and various state-level labour laws in
            India require it. Failure to give a written wage slip can lead to fines and disputes
            during termination. For small businesses paying just 2-3 employees, a clean PDF payslip
            generated each month is the simplest way to stay compliant without paying for a full
            HRMS subscription.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">When and why a salary slip is requested</h3>
          <ul className="text-gray-700 leading-relaxed space-y-2 mt-3 list-disc pl-6">
            <li>
              <strong>Home loan or car loan applications.</strong> Banks ask for 3-6 months of
              recent salary slips to verify your income and calculate eligibility.
            </li>
            <li>
              <strong>Visa applications.</strong> Embassies often require 3 months of payslips as
              proof of employment and financial stability, especially for tourist and student visas.
            </li>
            <li>
              <strong>Renting a flat in a metro.</strong> Landlords increasingly ask for salary
              slips to confirm you can afford the rent.
            </li>
            <li>
              <strong>Credit card upgrades.</strong> Banks use payslips to assess your eligibility
              for higher-limit or premium cards.
            </li>
            <li>
              <strong>Personal loan applications.</strong> Both banks and NBFCs use payslips to
              determine the loan amount they&apos;ll sanction.
            </li>
            <li>
              <strong>Income tax filing.</strong> Salary slips help you reconcile your annual income,
              Form 16, and tax deductions when filing your ITR.
            </li>
            <li>
              <strong>Background verification.</strong> When you switch jobs, the new employer&apos;s
              HR team may ask for previous payslips to verify your last drawn CTC.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">What must be on a salary slip</h3>
          <p className="text-gray-700 leading-relaxed">
            A compliant salary slip in India typically has these sections:
          </p>
          <ol className="text-gray-700 leading-relaxed space-y-2 mt-3 list-decimal pl-6">
            <li>
              <strong>Company details</strong> — legal name, registered address, logo (optional but
              recommended for credibility)
            </li>
            <li>
              <strong>Employee details</strong> — name, employee ID, designation, department, date
              of joining, PAN, bank account number
            </li>
            <li>
              <strong>Pay period and pay date</strong> — &quot;Salary for May 2026, paid on
              01-Jun-2026&quot;
            </li>
            <li>
              <strong>Working days breakdown</strong> — total working days in the month, days worked,
              leaves taken (paid &amp; unpaid)
            </li>
            <li>
              <strong>Earnings block</strong> — Basic, HRA, Conveyance, Special Allowance, Bonus,
              Overtime, any reimbursements (LTA, medical) — shown line-by-line
            </li>
            <li>
              <strong>Deductions block</strong> — Provident Fund (PF), Professional Tax,
              Income Tax (TDS), ESI (if applicable), Loan EMI deductions, other voluntary deductions
            </li>
            <li>
              <strong>Net pay</strong> — earnings minus deductions, the amount actually credited
            </li>
            <li>
              <strong>Net pay in words</strong> — required for cheque processing and dispute
              resolution
            </li>
            <li>
              <strong>YTD figures</strong> (optional) — year-to-date gross, tax deducted, useful at
              year-end
            </li>
            <li>
              <strong>Authorized signature</strong> — HR or finance signature/stamp (or
              &quot;System generated&quot; note for digital slips)
            </li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Common salary slip mistakes</h3>
          <ul className="text-gray-700 leading-relaxed space-y-3 mt-3 list-disc pl-6">
            <li>
              <strong>Missing PF / ESI numbers.</strong> If your company is registered for PF or
              ESI, the slip must show the employee&apos;s UAN/PF number and ESI number. Loan
              processors check these.
            </li>
            <li>
              <strong>HRA shown without supporting receipts.</strong> If you&apos;re claiming HRA
              exemption above ₹1 lakh annually, you need actual rent receipts with landlord PAN. Use
              our <Link href="/rent-receipt" className="text-blue-600 hover:underline font-medium">free
              rent receipt generator</Link> to create compliant ones.
            </li>
            <li>
              <strong>Inconsistent month-to-month.</strong> Banks compare 6 months of slips. If
              earnings jump around without explanation, they&apos;ll ask questions. Use a
              standardized format every month.
            </li>
            <li>
              <strong>Net pay doesn&apos;t match bank credit.</strong> The amount on the slip must
              equal what hit the bank account. Discrepancies kill loan applications instantly.
            </li>
            <li>
              <strong>No company stamp or sign.</strong> For employer-issued slips, unsigned PDFs
              are sometimes rejected by stricter banks and embassies. Always sign and stamp before
              giving it to the employee.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Salary slip for self-employed and freelancers</h3>
          <p className="text-gray-700 leading-relaxed">
            If you&apos;re a freelancer or consultant who pays yourself a regular monthly draw from
            your business, you can still generate a payslip for the amount. This helps when applying
            for loans (banks accept self-issued payslips combined with bank statements) and for
            visa purposes. Pair it with your{" "}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              invoice generator
            </Link>{" "}
            output and bank statements to build a clean income profile.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-100">
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

      <section className="py-12 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Learn more about salary, payroll, and tax
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/blog/self-employed-tax-tracking-invoices"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tax</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Managing Income Across Salary and Freelance Work
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                How to track salary, freelance, and consulting receipts in the same year — and how
                payslips fit into your tax return.
              </p>
            </Link>
            <Link
              href="/blog/tax-invoice-requirements-by-country"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Global</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Payslip &amp; Tax Document Requirements by Country
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                What payroll documents and tax slips are mandatory across India, UK, US, EU,
                and beyond.
              </p>
            </Link>
            <Link
              href="/blog/professional-invoice-complete-guide-2026"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guide</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Self-Issued Payslip for Freelancers and Consultants
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                How freelancers can generate self-payslips for loan applications and visas without
                a formal employer.
              </p>
            </Link>
            <Link
              href="/blog/invoice-numbering-best-practices"
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Best Practices</span>
              <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-blue-600">
                Payslip Numbering and Record-Keeping Best Practices
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                How to organize payslips month-over-month so they hold up under HR scrutiny and
                bank loan verification.
              </p>
            </Link>
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
