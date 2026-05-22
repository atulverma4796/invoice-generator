"use client";

import { useEffect, useState } from "react";

// AffiliateCard — geo-aware:
//   India users → Razorpay (existing)
//   Worldwide users → Wise Business + Hostinger
//
// PLACEHOLDER URLs marked TODO — replace after sign-up. See
// AFFILIATE_SETUP.md for sign-up steps + commission rates.

interface AffiliateCardProps {
  variant?: "default" | "after-download" | "fast-payment" | "compact" | "india";
}

interface Offer {
  icon: string;
  bg: string;
  border: string;
  iconBg: string;
  title: string;
  titleColor: string;
  desc: string;
  descColor: string;
  cta: string;
  url: string;
}

// India users (or any IST timezone) see Razorpay. Everyone else sees the
// global default — Wise Business (best fit for "send/receive invoices"
// + currency conversion).
const INDIA_OFFERS: Record<string, Offer> = {
  default: {
    icon: "💳", bg: "from-blue-50 to-indigo-50", border: "border-blue-200", iconBg: "bg-blue-100",
    title: "Need to collect online payments from clients?",
    titleColor: "text-blue-900",
    desc: "Razorpay accepts payments via UPI, cards, netbanking, wallets. Trusted by 10M+ Indian businesses. Low transaction fees.",
    descColor: "text-blue-700",
    cta: "Sign Up on Razorpay (Free)",
    // TODO: Replace with user's Razorpay partner link
    url: "https://rzp.io/rzp/MHhTBES",
  },
  "after-download": {
    icon: "🎉", bg: "from-emerald-50 to-green-50", border: "border-emerald-200", iconBg: "bg-emerald-100",
    title: "Invoice ready! Now make sure you actually get paid.",
    titleColor: "text-emerald-900",
    desc: "Add a Razorpay payment link so clients pay you in one click via UPI / cards / netbanking. No setup fees.",
    descColor: "text-emerald-700",
    cta: "Get Paid Faster — Sign Up on Razorpay",
    url: "https://rzp.io/rzp/MHhTBES",
  },
  "fast-payment": {
    icon: "⚡", bg: "from-amber-50 to-yellow-50", border: "border-amber-200", iconBg: "bg-amber-100",
    title: "Tired of chasing payments?",
    titleColor: "text-amber-900",
    desc: "Stop sending follow-up emails. Razorpay sends auto-reminders, supports UPI/Cards/Wallets, settles to bank T+2.",
    descColor: "text-amber-700",
    cta: "Start Collecting Payments — It's Free",
    url: "https://rzp.io/rzp/MHhTBES",
  },
  compact: {
    icon: "💰", bg: "from-blue-50 to-cyan-50", border: "border-blue-200", iconBg: "bg-blue-100",
    title: "Want clients to pay you online?",
    titleColor: "text-blue-900",
    desc: "Use Razorpay — India's most trusted payment gateway. UPI, cards, netbanking, all in one place.",
    descColor: "text-blue-700",
    cta: "Sign Up Free",
    url: "https://rzp.io/rzp/MHhTBES",
  },
  india: {
    icon: "🇮🇳", bg: "from-orange-50 to-red-50", border: "border-orange-200", iconBg: "bg-orange-100",
    title: "Indian freelancer? Get paid via UPI in seconds.",
    titleColor: "text-orange-900",
    desc: "Razorpay supports UPI, IMPS, NEFT, cards. GST-compliant invoices. Used by 10M+ Indian businesses incl. Zomato, Swiggy.",
    descColor: "text-orange-700",
    cta: "Open Razorpay Account (Free)",
    url: "https://rzp.io/rzp/MHhTBES",
  },
};

// Worldwide (non-India) offers — Wise Business is the closest analog
// for "receive payments from clients globally" with low FX fees.
const WORLDWIDE_OFFERS: Record<string, Offer> = {
  default: {
    icon: "🌍", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", iconBg: "bg-emerald-100",
    title: "Get paid in any currency, without the bank fees.",
    titleColor: "text-emerald-900",
    desc: "Wise Business gives you a multi-currency account with local bank details in 8+ countries. 16M+ users worldwide.",
    descColor: "text-emerald-700",
    cta: "Open a Wise Business Account",
    // TODO: Replace with user's Wise affiliate link after sign-up at wise.com/affiliate-program
    url: "https://wise.com/invite/dic/atulv111",
  },
  "after-download": {
    icon: "🎉", bg: "from-emerald-50 to-green-50", border: "border-emerald-200", iconBg: "bg-emerald-100",
    title: "Invoice ready! Now make sure your client can pay it easily.",
    titleColor: "text-emerald-900",
    desc: "Send your Wise Business account details on the invoice — clients pay you in their local currency with no FX surprises.",
    descColor: "text-emerald-700",
    cta: "Set Up Wise Business",
    url: "https://wise.com/invite/dic/atulv111",
  },
  "fast-payment": {
    icon: "⚡", bg: "from-amber-50 to-yellow-50", border: "border-amber-200", iconBg: "bg-amber-100",
    title: "Tired of waiting 3-5 days for international payments?",
    titleColor: "text-amber-900",
    desc: "Wise Business transfers settle in minutes for most routes. Plus mid-market exchange rate — no bank markups.",
    descColor: "text-amber-700",
    cta: "Try Wise Business",
    url: "https://wise.com/invite/dic/atulv111",
  },
  compact: {
    icon: "💸", bg: "from-emerald-50 to-cyan-50", border: "border-emerald-200", iconBg: "bg-emerald-100",
    title: "Get paid globally, lose less to FX fees.",
    titleColor: "text-emerald-900",
    desc: "Wise Business — multi-currency account, real mid-market rates, used by freelancers in 70+ countries.",
    descColor: "text-emerald-700",
    cta: "Open Wise Business",
    url: "https://wise.com/invite/dic/atulv111",
  },
  // 'india' variant only makes sense for Indian users; for worldwide
  // fall back to a hosting offer that fits freelancers anywhere.
  india: {
    icon: "🌐", bg: "from-violet-50 to-fuchsia-50", border: "border-violet-200", iconBg: "bg-violet-100",
    title: "Freelancer? Get your own portfolio site for $1.99/mo.",
    titleColor: "text-violet-900",
    desc: "Hostinger — used by 3M+ sites, 178 countries. Domain + WordPress in 5 minutes. 30-day money-back. Up to 60% off.",
    descColor: "text-violet-700",
    cta: "Get Hostinger",
    // TODO: Replace with user's Hostinger affiliate link after sign-up at hostinger.com/affiliates
    url: "https://www.hostinger.com/affiliates",
  },
};

// Detect Indian users via Asia/Kolkata IANA timezone. Lightweight, no
// network call. Defaults to worldwide if detection fails.
function useIsIndia(): boolean {
  const [isIndia, setIsIndia] = useState<boolean>(false);
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      setIsIndia(tz === "Asia/Kolkata" || tz === "Asia/Calcutta");
    } catch {
      // ignore
    }
  }, []);
  return isIndia;
}

export default function AffiliateCard({ variant = "default" }: AffiliateCardProps) {
  const isIndia = useIsIndia();
  const pool = isIndia ? INDIA_OFFERS : WORLDWIDE_OFFERS;
  const c = pool[variant] || pool.default;

  return (
    <div className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 my-6`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center text-lg shrink-0`}>{c.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${c.titleColor}`}>{c.title}</p>
          <p className={`text-xs ${c.descColor} mt-1 leading-relaxed`}>{c.desc}</p>
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold ${c.titleColor} hover:opacity-80 transition-opacity`}
          >
            {c.cta}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <p className="text-[10px] text-gray-500 mt-2 leading-snug">
            Partner link — supports freeinvoicegen.org at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
