"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/#generator", label: "Generator" },
  { href: "/gallery", label: "Gallery" },
  { href: "/invoice-template", label: "Templates" },
  { href: "/invoice-generator", label: "By Country" },
  { href: "/how-to", label: "Guides" },
  { href: "/templates", label: "My Invoices", accent: "amber" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#feedback", label: "Feedback" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // When menu opens: hide EVERYTHING else on the page
    const main = document.querySelector("main");
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");

    if (open) {
      document.body.style.overflow = "hidden";
      if (main) main.style.display = "none";
      if (footer) footer.style.display = "none";
      if (header) {
        header.style.backgroundColor = "#ffffff";
        header.style.backdropFilter = "none";
        (header.style as unknown as Record<string, string>).webkitBackdropFilter = "none";
      }
    } else {
      document.body.style.overflow = "";
      if (main) main.style.display = "";
      if (footer) footer.style.display = "";
      if (header) {
        header.style.backgroundColor = "";
        header.style.backdropFilter = "";
        (header.style as unknown as Record<string, string>).webkitBackdropFilter = "";
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (main) main.style.display = "";
      if (footer) footer.style.display = "";
      if (header) {
        header.style.backgroundColor = "";
        header.style.backdropFilter = "";
        (header.style as unknown as Record<string, string>).webkitBackdropFilter = "";
      }
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
        <div className="md:hidden bg-white w-full">
          <nav className="px-4 py-6 flex flex-col gap-1">
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
