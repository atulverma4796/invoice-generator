"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/#generator", label: "Generator" },
  { href: "/invoice-template", label: "Templates" },
  { href: "/invoice-generator", label: "By Country" },
  { href: "/how-to", label: "Guides" },
  { href: "/templates", label: "My Invoices", accent: "amber" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#feedback", label: "Feedback" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Close menu on route change / link click — also lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-xl animate-in fade-in duration-200">
          <nav className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-4 py-4 rounded-xl text-base font-medium transition-colors ${
                  link.accent === "amber"
                    ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
