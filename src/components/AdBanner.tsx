"use client";

import { useEffect, useRef } from "react";

/**
 * AdBanner — Google AdSense ad slot placeholder.
 *
 * Setup once you're approved:
 * 1. Add to .env.local:
 *      NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 * 2. Add the AdSense script to layout.tsx <head> (one line):
 *      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script>
 * 3. Create ad units in your AdSense dashboard, copy each "data-ad-slot" ID
 * 4. Pass the slot ID as a prop:  <AdBanner slot="1234567890" />
 *
 * Until activated, this component renders a subtle placeholder div that takes
 * the same space (so layout doesn't shift after activation). Setting an
 * AdBlocker-aware fallback is handled by AdSense itself.
 */

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense will retry — silent fail
    }
  }, [client, slot]);

  // Not configured yet — render an invisible placeholder so layout stays stable
  if (!client || !slot) {
    return (
      <div
        className={`w-full min-h-[90px] flex items-center justify-center bg-gray-50/50 border border-dashed border-gray-200 rounded-lg text-[10px] text-gray-300 ${className}`}
        aria-hidden="true"
      >
        {/* Empty placeholder — invisible to users, holds space for ad after AdSense approval */}
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
