import Script from "next/script";

/**
 * Google Analytics 4 + Search Console verification
 *
 * Setup:
 * 1. Get a GA4 Measurement ID from https://analytics.google.com (looks like G-XXXXXXXXXX)
 * 2. Get a Search Console verification code from https://search.google.com/search-console
 * 3. Add to .env.local:
 *      NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 *      NEXT_PUBLIC_GSC_VERIFICATION=your-verification-code
 * 4. Redeploy
 *
 * This component gracefully no-ops if env vars aren't set, so it's safe to ship.
 */

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

  return (
    <>
      {gscVerification && (
        <meta name="google-site-verification" content={gscVerification} />
      )}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
