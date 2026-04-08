export interface IndustryData {
  slug: string;
  name: string;
  h1: string;
  description: string;
  intro: string;
  sampleItems: { description: string; qty: number; rate: number }[];
  tips: string[];
  faqs: { q: string; a: string }[];
}

export const INDUSTRIES: Record<string, IndustryData> = {
  freelance: {
    slug: "freelance",
    name: "Freelance",
    h1: "Free Freelance Invoice Template",
    description: "Create professional freelance invoices in seconds. Free template with hourly rates, project fees, and instant PDF download. No signup required.",
    intro: "Whether you're a freelance writer, developer, designer, or consultant, our free freelance invoice template helps you get paid faster. Customize with your branding, save client details for reuse, and download a professional PDF in under 2 minutes.",
    sampleItems: [
      { description: "Web Development - Homepage Design", qty: 1, rate: 2500 },
      { description: "Content Writing (per article)", qty: 5, rate: 150 },
      { description: "Project Management Hours", qty: 10, rate: 75 },
    ],
    tips: [
      "Always include payment terms (Net 15 or Net 30 are standard for freelancers)",
      "Add a unique invoice number — sequential numbering helps with bookkeeping",
      "List your services clearly with quantities and rates so clients know what they're paying for",
      "Include your preferred payment method (bank transfer, PayPal, Wise, UPI) on the invoice",
      "Specify currency clearly when working with international clients",
      "Add a late fee clause to encourage on-time payment",
    ],
    faqs: [
      { q: "Do freelancers need to send invoices?", a: "Yes. Even if you're a sole proprietor, professional invoices are essential for tax records, payment tracking, and establishing credibility with clients." },
      { q: "What should a freelance invoice include?", a: "Your name/business name, client details, invoice number, date, itemized services with rates, payment terms, total amount, and your preferred payment method." },
      { q: "How do freelancers handle taxes on invoices?", a: "This depends on your country. In the US, freelancers typically don't charge sales tax on services. In the UK/EU, you may need to add VAT if registered. In India, GST applies above certain thresholds (₹20 lakh for services)." },
      { q: "What's the best free invoice generator for freelancers?", a: "InvoiceGen is built for freelancers — no signup, unlimited invoices, custom branding, signature support, multi-currency, and instant PDF download. Everything competitors charge $10-20/month for, free." },
    ],
  },
  contractor: {
    slug: "contractor",
    name: "Contractor",
    h1: "Free Contractor Invoice Template",
    description: "Create professional contractor invoices with labor, materials, and project details. Free template with PDF download. No signup required.",
    intro: "Built for independent contractors and tradespeople. Track labor hours, materials, equipment, and travel — all on one professional invoice that gets you paid faster.",
    sampleItems: [
      { description: "Labor — Site work (hours)", qty: 24, rate: 65 },
      { description: "Materials & Supplies", qty: 1, rate: 850 },
      { description: "Equipment Rental (3 days)", qty: 3, rate: 120 },
    ],
    tips: [
      "Separate labor from materials so clients can see exactly what they're paying for",
      "Include your contractor license number if your jurisdiction requires it",
      "Add change order references if billing for additional scope",
      "Document the project address on the invoice for tax/permit records",
      "Specify warranty terms for the work performed",
    ],
    faqs: [
      { q: "What should a contractor invoice include?", a: "Your business info, license number, client and project address, itemized labor and materials, taxes, total, and payment terms. Include change order references if applicable." },
      { q: "Should contractors charge sales tax on invoices?", a: "Depends on your state/country. Most US states don't tax labor but do tax materials. Check with your local tax authority — and use our country-aware tax fields to handle it correctly." },
      { q: "How do I invoice for a milestone payment?", a: "Add a line item like 'Milestone 1 of 3 — Foundation Complete' with the agreed amount. Reference the original contract or estimate number in the notes." },
    ],
  },
  consulting: {
    slug: "consulting",
    name: "Consulting",
    h1: "Free Consulting Invoice Template",
    description: "Professional consulting invoice template with hourly rates, retainers, and expense tracking. Free PDF download, no signup.",
    intro: "Designed for management consultants, IT consultants, business advisors, and coaches. Track billable hours, retainers, and expenses on one clean invoice.",
    sampleItems: [
      { description: "Strategy Consulting (hours)", qty: 16, rate: 200 },
      { description: "Monthly Retainer", qty: 1, rate: 3500 },
      { description: "Travel & Expenses", qty: 1, rate: 425 },
    ],
    tips: [
      "Bill in time blocks (15-min or 30-min increments) for transparency",
      "Separate consulting fees from reimbursable expenses",
      "Reference your engagement letter or contract number",
      "Include your tax ID — most clients need it for their records",
      "Add detailed descriptions so clients understand the value delivered",
    ],
    faqs: [
      { q: "How do consultants invoice for retainers?", a: "Add a single line item for 'Monthly Retainer — [Month]' with the agreed flat fee. Mention what's included (e.g. '20 hours of consulting included') in the description or notes." },
      { q: "Should I itemize hours on a consulting invoice?", a: "Yes, especially for hourly clients. Show date, task, hours, and rate. This justifies your rate and reduces disputes." },
      { q: "What's the typical payment term for consulting invoices?", a: "Net 15 to Net 30 is standard. For retainers, payment is often due upfront before the service period begins." },
    ],
  },
  photography: {
    slug: "photography",
    name: "Photography",
    h1: "Free Photography Invoice Template",
    description: "Professional photography invoice template for shoots, editing, prints, and licensing. Free PDF download, no signup.",
    intro: "Perfect for wedding photographers, portrait studios, event photographers, and commercial shoots. Bill for shoot time, editing, prints, travel, and image licensing — all on one clean invoice.",
    sampleItems: [
      { description: "Wedding Photography — 8 hour coverage", qty: 1, rate: 2500 },
      { description: "Photo Editing & Retouching", qty: 1, rate: 600 },
      { description: "Travel & Accommodation", qty: 1, rate: 350 },
    ],
    tips: [
      "Include image licensing/usage rights in the notes section",
      "Bill for travel time and mileage separately from shoot fees",
      "Specify the deliverables — number of edited photos, gallery access, prints",
      "Add your copyright/usage clause to protect your work",
      "Charge a non-refundable retainer to secure the booking date",
    ],
    faqs: [
      { q: "What should a photography invoice include?", a: "Shoot date, location, services rendered, number of images delivered, licensing terms, travel/expenses, and total. Include a copyright notice in the terms." },
      { q: "How do I invoice for image licensing?", a: "Add a separate line item for licensing with details (e.g. 'Commercial usage rights — 1 year, web only'). Specify any restrictions in the terms section." },
      { q: "Should photographers charge sales tax?", a: "Depends on your location. In many US states, photography services and prints are taxable. Use the country selector to apply your local tax rules automatically." },
    ],
  },
  "graphic-design": {
    slug: "graphic-design",
    name: "Graphic Design",
    h1: "Free Graphic Design Invoice Template",
    description: "Professional graphic design invoice template for logos, branding, and design projects. Free PDF download, no signup.",
    intro: "Built for graphic designers, illustrators, and brand designers. Bill for logo design, brand identity, illustrations, revisions, and source files on one clean invoice.",
    sampleItems: [
      { description: "Logo Design — 3 concepts + revisions", qty: 1, rate: 1200 },
      { description: "Brand Style Guide", qty: 1, rate: 800 },
      { description: "Source Files & Final Delivery", qty: 1, rate: 200 },
    ],
    tips: [
      "Specify the number of concepts and revisions included",
      "Charge separately for source files (AI, PSD, Figma)",
      "Include usage rights in the terms (commercial use, exclusivity)",
      "Bill 50% upfront to secure the project",
      "Charge for additional revisions beyond the agreed scope",
    ],
    faqs: [
      { q: "How much should a graphic designer charge?", a: "Rates vary widely. Junior designers: $25-50/hr. Mid-level: $50-100/hr. Senior/specialized: $100-250+/hr. Project pricing is more common for logos and branding." },
      { q: "Should I include source files in the invoice?", a: "Yes, but as a separate line item. Many designers charge extra for source files because they represent the full creative work." },
      { q: "How do I invoice for design revisions?", a: "Specify the number of revisions included in your original quote. For extra revisions, add a line item like 'Additional revision round — Round 4'." },
    ],
  },
  "web-design": {
    slug: "web-design",
    name: "Web Design",
    h1: "Free Web Design Invoice Template",
    description: "Professional web design and development invoice template. Free PDF download, no signup required.",
    intro: "For web designers and developers building websites, landing pages, and web apps. Bill for design, development, hosting, and ongoing maintenance.",
    sampleItems: [
      { description: "Website Design — 5 pages", qty: 1, rate: 2500 },
      { description: "Development & CMS Integration", qty: 1, rate: 1800 },
      { description: "Monthly Maintenance (3 months)", qty: 3, rate: 150 },
    ],
    tips: [
      "Separate design from development on the invoice",
      "Charge separately for hosting, domain, and third-party services",
      "Include a maintenance retainer for ongoing updates",
      "Specify what's included (responsive design, SEO basics, contact form)",
      "Add 50% deposit terms before starting work",
    ],
    faqs: [
      { q: "How much should I charge for a website?", a: "Simple landing pages: $500-1500. Small business sites (5-10 pages): $2000-5000. E-commerce: $5000-15000+. Custom web apps: $10,000+." },
      { q: "Should hosting be included in the invoice?", a: "Pass through hosting costs separately so clients understand it's a recurring expense, not part of your design fee." },
      { q: "How do I bill for ongoing website maintenance?", a: "Use a monthly retainer (e.g. $100-300/month) covering updates, backups, security, and minor changes. Bill for major changes separately." },
    ],
  },
  construction: {
    slug: "construction",
    name: "Construction",
    h1: "Free Construction Invoice Template",
    description: "Professional construction invoice template with labor, materials, and equipment tracking. Free PDF download, no signup.",
    intro: "Built for general contractors, builders, and construction crews. Track labor hours, materials, equipment rental, and subcontractor costs on one detailed invoice.",
    sampleItems: [
      { description: "Labor — Crew of 4 (40 hours)", qty: 40, rate: 55 },
      { description: "Building Materials & Supplies", qty: 1, rate: 8500 },
      { description: "Equipment Rental — Excavator (2 days)", qty: 2, rate: 450 },
    ],
    tips: [
      "Reference the project address and permit numbers",
      "Separate labor, materials, and equipment for transparency",
      "Include your contractor license and bonding info",
      "Add change order references for additional scope",
      "Bill in milestones (foundation, framing, finishes) for large projects",
    ],
    faqs: [
      { q: "What should a construction invoice include?", a: "Project address, license number, itemized labor (with hours and rates), materials with markup, equipment costs, taxes, change orders, and clear payment terms." },
      { q: "How do I bill for change orders?", a: "Create a line item like 'Change Order #1 — [description]' referencing the signed change order document. Get client approval in writing before doing extra work." },
      { q: "Should construction invoices show markup on materials?", a: "It's standard to mark up materials 10-20% to cover sourcing, transport, and storage. You don't need to disclose the markup percentage on the invoice." },
    ],
  },
  cleaning: {
    slug: "cleaning",
    name: "Cleaning Service",
    h1: "Free Cleaning Service Invoice Template",
    description: "Professional cleaning service invoice template for residential and commercial cleaning. Free PDF, no signup.",
    intro: "Perfect for residential cleaners, commercial cleaning companies, and janitorial services. Bill per visit, per hour, or by square footage on a clean professional invoice.",
    sampleItems: [
      { description: "Standard Home Cleaning (3 hours)", qty: 1, rate: 120 },
      { description: "Deep Cleaning Add-On", qty: 1, rate: 80 },
      { description: "Cleaning Supplies", qty: 1, rate: 25 },
    ],
    tips: [
      "Specify the cleaning type (standard, deep, move-out)",
      "Include the property address and visit date",
      "Offer recurring service discounts (weekly/bi-weekly)",
      "Add tipping line if applicable",
      "List add-on services separately (oven, fridge, windows)",
    ],
    faqs: [
      { q: "How much should I charge for house cleaning?", a: "Standard cleaning: $25-50/hour or $100-200 per visit (1-3 bedrooms). Deep cleaning: 1.5-2x standard rates. Commercial: $20-40/hour or per square foot." },
      { q: "Should cleaning services charge sales tax?", a: "Depends on your state/country. Many US states tax cleaning services. Check your local rules — our country-aware tax fields handle this automatically." },
      { q: "How do I invoice for recurring cleaning?", a: "Create a recurring template in InvoiceGen. Set it to weekly/bi-weekly/monthly and the system reminds you when it's time to bill." },
    ],
  },
  plumbing: {
    slug: "plumbing",
    name: "Plumbing",
    h1: "Free Plumbing Invoice Template",
    description: "Professional plumbing invoice template with labor, parts, and service call charges. Free PDF, no signup.",
    intro: "Built for plumbers and plumbing companies. Bill for service calls, labor, parts, and emergency surcharges on a professional invoice that gets you paid quickly.",
    sampleItems: [
      { description: "Service Call — Diagnosis", qty: 1, rate: 95 },
      { description: "Labor (2 hours)", qty: 2, rate: 85 },
      { description: "Parts — Pipe fittings & valves", qty: 1, rate: 145 },
    ],
    tips: [
      "Include your plumbing license number",
      "Add diagnostic/service call fee separately from labor",
      "Mark up parts 20-50% to cover sourcing and warranty",
      "Add an emergency/after-hours surcharge if applicable",
      "Specify warranty terms on parts and labor",
    ],
    faqs: [
      { q: "How much do plumbers charge per hour?", a: "Standard plumbing: $45-150/hour. Emergency calls: $100-300/hour. Service call fees are typically $50-150 just to show up, applied toward the work if you proceed." },
      { q: "Should I charge a service call fee?", a: "Yes — it covers your diagnostic time and travel. Most plumbers charge $50-150, often credited toward the repair if the customer accepts the quote." },
    ],
  },
  landscaping: {
    slug: "landscaping",
    name: "Landscaping",
    h1: "Free Landscaping Invoice Template",
    description: "Professional landscaping invoice template for lawn care, garden design, and tree services. Free PDF, no signup.",
    intro: "For landscapers, lawn care services, and garden designers. Bill for mowing, planting, mulching, design, and seasonal services on one clear invoice.",
    sampleItems: [
      { description: "Lawn Mowing & Edging", qty: 1, rate: 65 },
      { description: "Mulch Installation (3 cubic yards)", qty: 3, rate: 85 },
      { description: "Hedge Trimming", qty: 1, rate: 120 },
    ],
    tips: [
      "Set up recurring invoices for weekly/monthly service",
      "Charge separately for materials (mulch, plants, soil)",
      "Add seasonal services (leaf removal, snow plowing)",
      "Specify the property address",
      "Include before/after photos via the notes section for high-value projects",
    ],
    faqs: [
      { q: "How much should I charge for lawn care?", a: "Basic mowing: $30-80 per visit (small to large yards). Full lawn maintenance (mowing, edging, blowing): $50-150. Landscape design: $50-150/hour or project-based." },
      { q: "Should landscapers offer recurring billing?", a: "Yes — most lawn care is weekly or bi-weekly. Set up a recurring template in InvoiceGen and you'll get reminders when it's time to bill." },
    ],
  },
  catering: {
    slug: "catering",
    name: "Catering",
    h1: "Free Catering Invoice Template",
    description: "Professional catering invoice template for events, weddings, and corporate functions. Free PDF, no signup.",
    intro: "Built for catering companies and event caterers. Bill for menu items, staffing, equipment rental, and service charges on one detailed invoice.",
    sampleItems: [
      { description: "Buffet Menu — 50 guests @ $35/person", qty: 50, rate: 35 },
      { description: "Service Staff (4 servers, 5 hours)", qty: 20, rate: 25 },
      { description: "Table & Chair Rental", qty: 1, rate: 350 },
    ],
    tips: [
      "Quote per-person pricing for clarity",
      "Separate food, staffing, equipment, and service fees",
      "Add an 18-20% service charge if standard in your region",
      "Require a deposit (25-50%) to confirm the booking",
      "Specify dietary accommodations in the notes",
    ],
    faqs: [
      { q: "How is catering typically priced?", a: "Per-person pricing is most common. Buffet style: $15-50/person. Plated dinner: $35-150/person. Premium events: $100+/person. Add staffing, rental, and gratuity separately." },
      { q: "Should caterers charge a deposit?", a: "Yes — most caterers require 25-50% non-refundable deposit at booking, with the balance due before or on the event date." },
    ],
  },
  tutoring: {
    slug: "tutoring",
    name: "Tutoring",
    h1: "Free Tutoring Invoice Template",
    description: "Professional tutoring invoice template for private tutors, test prep, and online lessons. Free PDF, no signup.",
    intro: "Perfect for private tutors, test prep instructors, and online educators. Bill by the hour or by lesson package on a clean professional invoice.",
    sampleItems: [
      { description: "Math Tutoring (8 sessions @ 1 hour)", qty: 8, rate: 50 },
      { description: "SAT Prep Materials", qty: 1, rate: 45 },
    ],
    tips: [
      "List session dates in the description for transparency",
      "Offer package pricing (10-session bundles) for better cash flow",
      "Charge a cancellation fee for last-minute no-shows",
      "Include the student's name in the notes",
      "Specify the subject and grade level",
    ],
    faqs: [
      { q: "How much do tutors charge per hour?", a: "Subject tutors: $20-80/hour. Test prep specialists: $50-200/hour. Online tutoring tends to be slightly less than in-person. Premium tutors with advanced degrees command $100-300+/hour." },
      { q: "Should tutors invoice or get paid upfront?", a: "Either works. Many tutors require payment upfront for packages and invoice monthly for ongoing students. Use recurring invoices for monthly billing." },
    ],
  },
  electrician: {
    slug: "electrician",
    name: "Electrician",
    h1: "Free Electrician Invoice Template",
    description: "Professional electrician invoice template with service call, labor, and materials. Free PDF, no signup.",
    intro: "Built for electricians and electrical contractors. Bill for service calls, labor, materials, and emergency work on a clean professional invoice.",
    sampleItems: [
      { description: "Service Call & Diagnosis", qty: 1, rate: 110 },
      { description: "Labor (3 hours)", qty: 3, rate: 95 },
      { description: "Electrical Materials", qty: 1, rate: 185 },
    ],
    tips: [
      "Include your electrical license number",
      "Specify the service voltage and circuit details for records",
      "Mark up materials to cover sourcing and warranty",
      "Add emergency surcharge for after-hours work",
      "Reference inspection requirements if applicable",
    ],
    faqs: [
      { q: "How much do electricians charge?", a: "Service calls: $75-200. Hourly labor: $50-150. Emergency calls: $150-500/hour. Major projects (panel upgrade, rewiring): $1,500-10,000+ depending on scope." },
      { q: "Do electricians need to provide warranties?", a: "Most reputable electricians warranty their labor (1-2 years) and materials (manufacturer warranty). Specify the terms on your invoice." },
    ],
  },
  painting: {
    slug: "painting",
    name: "Painting",
    h1: "Free Painting Invoice Template",
    description: "Professional painting invoice template for interior and exterior painting jobs. Free PDF, no signup.",
    intro: "For house painters, commercial painting contractors, and decorative painters. Bill for surface prep, paint, labor, and finish work on a clear invoice.",
    sampleItems: [
      { description: "Interior Painting — 3 rooms", qty: 1, rate: 1200 },
      { description: "Paint & Supplies", qty: 1, rate: 380 },
      { description: "Surface Prep & Cleanup", qty: 1, rate: 220 },
    ],
    tips: [
      "Quote by square foot or by room",
      "Separate labor from paint/material costs",
      "Specify number of coats and finish type",
      "Note prep work included (patching, sanding, priming)",
      "Add cleanup and disposal as a line item",
    ],
    faqs: [
      { q: "How much do painters charge per room?", a: "Interior: $200-800 per room (12x12). Exterior: $1,500-5,000 for an average home. Pricing varies by paint quality, prep needed, and your region." },
      { q: "Should painters charge for paint separately?", a: "Some include it in the quote, others bill separately. Either is fine — just be clear with the customer upfront." },
    ],
  },
  videography: {
    slug: "videography",
    name: "Videography",
    h1: "Free Videography Invoice Template",
    description: "Professional videography invoice template for video production, editing, and licensing. Free PDF, no signup.",
    intro: "Perfect for videographers, wedding videographers, and video production companies. Bill for shoot time, editing, equipment, and licensing.",
    sampleItems: [
      { description: "Video Production (full day shoot)", qty: 1, rate: 1800 },
      { description: "Post-Production & Editing", qty: 1, rate: 1200 },
      { description: "Drone Footage", qty: 1, rate: 400 },
    ],
    tips: [
      "Specify final deliverables (4K, HD, format, runtime)",
      "Include licensing/usage rights in the terms",
      "Charge separately for drone, special equipment, additional crew",
      "Bill for revisions beyond the agreed scope",
      "Require a deposit to secure the shoot date",
    ],
    faqs: [
      { q: "How much should videographers charge?", a: "Day rate: $800-3000+ depending on experience and equipment. Wedding videography: $2000-10000. Corporate video: $1500-15000+. Commercial: $5000-50000+." },
      { q: "What licensing terms should I include?", a: "Specify usage type (web, broadcast, social media), territory (worldwide or regional), and duration (1 year, perpetual). Different licenses justify different rates." },
    ],
  },
};

export const INDUSTRY_LIST = Object.values(INDUSTRIES);
