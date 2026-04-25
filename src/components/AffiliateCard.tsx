"use client";

interface AffiliateCardProps {
  variant?: "default" | "after-download" | "fast-payment" | "compact" | "india";
}

const VARIANTS = {
  default: {
    icon: "💳",
    bg: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    title: "Need to collect online payments from clients?",
    titleColor: "text-blue-900",
    desc: "Razorpay accepts payments via UPI, cards, netbanking, and wallets. Trusted by 10M+ businesses in India. Get paid instantly with low transaction fees.",
    descColor: "text-blue-700",
    cta: "Sign Up on Razorpay (Free)",
  },
  "after-download": {
    icon: "🎉",
    bg: "from-emerald-50 to-green-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    title: "Invoice ready! Now make sure you actually get paid.",
    titleColor: "text-emerald-900",
    desc: "Add a Razorpay payment link to your invoices and let clients pay you in one click via UPI, cards, or netbanking. No setup fees.",
    descColor: "text-emerald-700",
    cta: "Get Paid Faster — Sign Up on Razorpay",
  },
  "fast-payment": {
    icon: "⚡",
    bg: "from-amber-50 to-yellow-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    title: "Tired of chasing payments?",
    titleColor: "text-amber-900",
    desc: "Stop sending follow-up emails for payments. Razorpay sends auto-reminders, supports UPI/Cards/Wallets, and settles money to your bank in T+2 days.",
    descColor: "text-amber-700",
    cta: "Start Collecting Payments — It's Free",
  },
  compact: {
    icon: "💰",
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    title: "Want clients to pay you online?",
    titleColor: "text-blue-900",
    desc: "Use Razorpay — India's most trusted payment gateway. UPI, cards, netbanking, all in one place.",
    descColor: "text-blue-700",
    cta: "Sign Up Free",
  },
  india: {
    icon: "🇮🇳",
    bg: "from-orange-50 to-red-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
    title: "Indian freelancer? Get paid via UPI in seconds.",
    titleColor: "text-orange-900",
    desc: "Razorpay supports UPI, IMPS, NEFT, and all major cards. GST-compliant invoices. Used by 10M+ Indian businesses including Zomato, Swiggy, BookMyShow.",
    descColor: "text-orange-700",
    cta: "Open Razorpay Account (Free)",
  },
};

export default function AffiliateCard({ variant = "default" }: AffiliateCardProps) {
  const c = VARIANTS[variant];
  const url = "https://rzp.io/rzp/MHhTBES";

  return (
    <div className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 my-6`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center text-lg shrink-0`}>{c.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${c.titleColor}`}>{c.title}</p>
          <p className={`text-xs ${c.descColor} mt-1 leading-relaxed`}>{c.desc}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold ${c.titleColor} hover:opacity-80 transition-opacity`}
          >
            {c.cta}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
