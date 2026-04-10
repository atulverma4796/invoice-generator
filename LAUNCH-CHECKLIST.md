# InvoiceGen — Post-Launch Checklist

> Your site is live at **https://freeinvoicegen.org**
> This doc tells you exactly what to check, when to check it, and what action to take.
> Bookmark this file. Come back to it on the dates below.

---

## Week 1 (April 10-17, 2026)

### Check GA4 is tracking real visitors
- **URL:** https://analytics.google.com → Reports → Realtime
- **What to look for:** At least 1 user (yourself) showing up when you visit your site
- **Action if broken:** Check Vercel env var `NEXT_PUBLIC_GA_ID` is set to `G-RSD593B5ZW`

### Check Search Console sitemap status
- **URL:** https://search.google.com/search-console → Sitemaps
- **What to look for:** Status should say "Success" with 43 discovered pages
- **Action if "Couldn't fetch":** Wait another day. If still failing after 3 days, resubmit the sitemap.

### Check your site loads correctly
- **URLs to test:**
  - https://freeinvoicegen.org (homepage)
  - https://freeinvoicegen.org/gallery (10 templates)
  - https://freeinvoicegen.org/invoice-template/freelance (industry page)
  - https://freeinvoicegen.org/invoice-generator/india (country page)
  - https://freeinvoicegen.org/how-to/create-invoice (guide page)
  - https://freeinvoicegen.org/sitemap.xml (should show XML with 43 URLs)
  - https://freeinvoicegen.org/llms.txt (AI summary)
  - https://freeinvoicegen.org/robots.txt (should show 25+ AI bot rules)
  - https://freeinvoicegen.org/privacy (privacy policy)
  - https://freeinvoicegen.org/terms (terms of service)
  - https://freeinvoicegen.org/about (about page)
- **Action if any 404:** Open a new Claude Code session, describe the issue, I'll fix it.

---

## Week 2 (April 17-24, 2026)

### Check Search Console → Performance
- **URL:** https://search.google.com/search-console → Performance
- **What to look for:**
  - **Impressions** — how many times your pages appeared in Google search results
  - **Clicks** — how many people actually clicked through to your site
  - **Queries** — the exact words people typed before seeing your site
  - **Pages** — which of your 43 pages are getting impressions
- **What's normal:** 10-100 impressions in week 2, maybe 1-5 clicks. This is fine. Growth compounds.
- **Action:** Write down the top 5 queries. These tell you what content to create next.

### Check GA4 → Reports → Engagement → Pages
- **URL:** https://analytics.google.com → Reports → Engagement → Pages and screens
- **What to look for:** Which pages get the most views
- **Action:** Note the top 3 pages. If an industry or country page is doing well, consider creating similar ones.

---

## Week 3-4 (April 24 - May 8, 2026)

### Check Search Console → Coverage (or Pages)
- **URL:** https://search.google.com/search-console → Pages (or "Coverage" in older UI)
- **What to look for:**
  - **Indexed pages** — should be growing toward 43
  - **Not indexed** — pages Google found but chose not to index yet (normal for new sites)
  - **Errors** — any crawl errors (404s, server errors)
- **Action if errors:** Open Claude Code session, paste the error, I'll fix it.

### Check GA4 → Reports → Acquisition → Traffic acquisition
- **URL:** https://analytics.google.com → Reports → Acquisition
- **What to look for:**
  - **Organic Search** — people coming from Google
  - **Direct** — people typing your URL
  - **Referral** — people coming from other websites
- **What's normal:** Mostly "Direct" (just you) in the early weeks. Organic Search starts growing in week 3-4.

---

## Month 2 (May 2026)

### Review top performing content
- **Search Console → Performance → Pages tab**
- Sort by **Impressions** (descending)
- **Action:** Your top 5 pages are what's working. Consider:
  - Creating more content similar to your best-performing pages
  - If `/invoice-generator/india` is doing well → add more country pages
  - If `/invoice-template/freelance` is doing well → add more industry pages
  - If `/how-to/create-invoice` is doing well → write more how-to guides

### Review search queries
- **Search Console → Performance → Queries tab**
- **Action:** Look for queries where you have high impressions but low clicks. These are opportunities — your page shows up but the title/description isn't compelling enough. Improve the meta title/description for those pages.

### Check GA4 for user behavior
- **GA4 → Reports → Engagement → Pages and screens**
- **What to look for:**
  - Which pages have the highest "Average engagement time" (people spending time = good)
  - Which pages have the highest bounce rate (people leaving immediately = bad)
- **Action:** Improve pages with high bounce rate. The content isn't matching what the user expected.

---

## Month 3 (June 2026)

### Assess traffic growth
- **Search Console → Performance → set date range to "Last 3 months"**
- **What to look for:** An upward trend in impressions and clicks
- **What's normal:** 100-1000 impressions/day, 10-100 clicks/day by month 3
- **If traffic is flat:** Open Claude Code session and ask to add more SEO content (more industries, countries, how-to guides from the features backlog)

### Consider adding more content
Based on what GA4 and Search Console show, pick from the features backlog:
- More how-to guides (7 topics still pending)
- More country pages (5+ countries still pending)
- More industry templates (7+ industries still pending)

**Rule:** Only build content that matches what people are actually searching for. Don't guess — use Search Console query data.

---

## Month 4-6 (July-September 2026)

### Apply for Google AdSense
- **When:** Once you consistently get 500+ visits/day (check GA4 daily active users)
- **URL:** https://www.google.com/adsense/start/
- **Requirements already met:**
  - ✅ Privacy Policy at /privacy
  - ✅ Terms of Service at /terms
  - ✅ About page at /about
  - ✅ Contact form at /#feedback
  - ✅ Cookie consent banner
  - ✅ Original content (47 unique pages)
  - ✅ Custom domain (freeinvoicegen.org)
- **What to do after approval:**
  1. Copy your AdSense Publisher ID (looks like `ca-pub-XXXXXXXXXXXXXXXX`)
  2. Open Claude Code session
  3. Say: "Add my AdSense ID: ca-pub-XXXXXXXXXXXXXXXX"
  4. I'll add it to `NEXT_PUBLIC_ADSENSE_CLIENT` env var and place `<AdBanner>` components on key pages
  5. Push + redeploy → ads start showing → revenue starts flowing

### Consider building features from the backlog
- **File:** `/memory/project_invoicegen_features_backlog.md` (or ask Claude to read it)
- **Rule:** Check GA4 first. Build what users actually need, not what seems cool.
- **Top candidates based on search volume:**
  - Estimates/Quotes that convert to invoices (FreshBooks charges $15/mo for this)
  - Credit notes / refund invoices
  - Bulk CSV export

---

## Ongoing (forever)

### Monthly — check these 3 things (5 minutes)

1. **Search Console → Performance** — are impressions/clicks growing?
2. **GA4 → Reports → Realtime** — are people using the site right now?
3. **GA4 → Reports → Engagement → Pages** — which pages are most popular?

### Quarterly — review strategy (30 minutes)

1. Which keywords bring the most traffic? → Create more content targeting those
2. Which pages have high bounce rate? → Improve them
3. Are there new competitor tools? → Check if they have features you don't
4. Has traffic plateaued? → Time to add more SEO pages or consider other marketing

---

## Important URLs (bookmark these)

| What | URL |
|---|---|
| **Your live site** | https://freeinvoicegen.org |
| **Google Analytics** | https://analytics.google.com |
| **Google Search Console** | https://search.google.com/search-console |
| **Vercel Dashboard** | https://vercel.com/atul-vermas-projects-c57cd5a1/invoice-generator |
| **Cloudflare DNS** | https://dash.cloudflare.com/7cfb6ae1bb4ea6013be235fa3d6f2f2b/freeinvoicegen.org/dns/records |
| **GitHub Repo** | https://github.com/atulverma4796/invoice-generator |
| **AdSense Application** | https://www.google.com/adsense/start/ |
| **Sitemap (live)** | https://freeinvoicegen.org/sitemap.xml |
| **Robots.txt (live)** | https://freeinvoicegen.org/robots.txt |
| **LLMs.txt (live)** | https://freeinvoicegen.org/llms.txt |

---

## Important Vercel Environment Variables

| Name | Value | What it does |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | `G-RSD593B5ZW` | Google Analytics tracking |
| `GMAIL_USER` | `atulverma4796@gmail.com` | Email invoice feature |
| `GMAIL_APP_PASSWORD` | (set in Vercel) | Email invoice feature |
| `NEXT_PUBLIC_GSC_VERIFICATION` | `bAsXnruNSaCna_tIzwbLk6SdNIXAz_Nc5AjmlJ4yVKM` | Search Console ownership |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | NOT SET YET — add after AdSense approval | Activates ad slots |

---

## Domain Renewal

- **Domain:** freeinvoicegen.org
- **Registrar:** Cloudflare
- **Expires:** April 9, 2027
- **Auto-renew:** ON (set during purchase)
- **Renewal cost:** $10.13/year
- **Action:** Make sure your Cloudflare payment method stays valid. If the domain expires, your entire site goes offline.

---

## If something breaks

1. Open a new **Claude Code** session
2. Say: "Read the invoice-generator status from memory and help me fix [describe the issue]"
3. Claude will read the project status + features backlog from memory and know exactly where things are

---

*Created: April 10, 2026*
*Site: https://freeinvoicegen.org*
*Author: Atul Verma + Claude*
