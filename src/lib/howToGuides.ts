export interface HowToSection {
  heading: string;
  content: string;
  list?: string[];
}

export interface HowToGuide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: HowToSection[];
  steps: { title: string; description: string }[];
  faqs: { q: string; a: string }[];
}

export const HOW_TO_GUIDES: Record<string, HowToGuide> = {
  "create-invoice": {
    slug: "create-invoice",
    title: "How to Create an Invoice (Free Step-by-Step Guide)",
    metaTitle: "How to Create an Invoice — Free Step-by-Step Guide 2026",
    metaDescription: "Learn how to create a professional invoice in under 2 minutes. Free step-by-step guide with templates, examples, and instant PDF download. No signup required.",
    intro: "Creating a professional invoice is essential for getting paid on time, tracking income, and maintaining financial records. This guide walks you through exactly how to create an invoice from scratch — for free, in under 2 minutes, with no signup required.",
    sections: [
      {
        heading: "What is an invoice?",
        content: "An invoice is a commercial document issued by a seller to a buyer that lists the products or services provided, their quantities, prices, and payment terms. It serves as a formal request for payment and a legal record of the transaction.",
      },
      {
        heading: "What should an invoice include?",
        content: "A professional invoice should include all of the following:",
        list: [
          "Your business name, address, and contact information",
          "Your tax ID (EIN, GSTIN, VAT number, etc.) if applicable",
          "A unique invoice number (sequential)",
          "Invoice date and due date",
          "Client's name and billing address",
          "Itemized list of products or services with descriptions",
          "Quantity and unit price for each item",
          "Subtotal, tax, discounts, and grand total",
          "Payment terms (Net 15, Net 30, Due on Receipt)",
          "Accepted payment methods and account details",
          "Notes or thank-you message",
        ],
      },
      {
        heading: "Why use a free invoice generator?",
        content: "Free invoice generators like InvoiceGen save hours of work compared to using Word, Excel, or paid software. You get:",
        list: [
          "Pre-built professional templates (no design work)",
          "Automatic calculations for tax, discounts, and totals",
          "Instant PDF download — ready to email or print",
          "Multi-currency and country-specific tax compliance",
          "No signup, no monthly fees, no limits",
        ],
      },
    ],
    steps: [
      { title: "Open the free invoice generator", description: "Go to InvoiceGen and start with a blank invoice. No signup required — your data stays in your browser." },
      { title: "Enter your business details", description: "Add your business name, address, email, phone, and tax ID. Upload your logo to brand the invoice." },
      { title: "Add client information", description: "Enter the client's name and billing address. You can save clients to reuse for future invoices." },
      { title: "List your items or services", description: "Add line items with descriptions, quantities, and rates. Tax, discounts, and totals calculate automatically." },
      { title: "Choose a template and customize", description: "Pick from 10 professional templates. Customize colors, fonts, add a digital signature, and include payment QR codes." },
      { title: "Download or email the invoice", description: "Click Download PDF for a professional invoice file, or email it directly to your client with one click." },
    ],
    faqs: [
      { q: "Is it legal to create your own invoice?", a: "Yes — anyone selling goods or services can create their own invoices. There's no requirement to use special software or services." },
      { q: "Do I need a business to create an invoice?", a: "No. Sole proprietors, freelancers, and individuals can issue invoices using their personal name. Just include your name, contact details, and tax ID (SSN in the US, similar in other countries)." },
      { q: "How long should I keep invoices?", a: "Most countries require keeping invoices for 5-7 years for tax purposes. The IRS recommends 7 years in the US. The UK HMRC requires 6 years." },
      { q: "Should invoices be numbered?", a: "Yes. Sequential invoice numbering is required for tax compliance in most countries and helps with bookkeeping. InvoiceGen auto-generates unique invoice numbers for you." },
    ],
  },
  "write-invoice": {
    slug: "write-invoice",
    title: "How to Write an Invoice (With Examples)",
    metaTitle: "How to Write an Invoice — With Free Examples & Templates",
    metaDescription: "Learn how to write a professional invoice with examples, templates, and free downloads. Step-by-step guide for freelancers and small businesses.",
    intro: "Writing a clear, professional invoice is the difference between getting paid in 7 days vs 60 days. This guide shows you exactly how to write an invoice that looks professional, meets legal requirements, and gets paid faster.",
    sections: [
      {
        heading: "The 10 essential parts of an invoice",
        content: "Every professional invoice needs these 10 elements:",
        list: [
          "Header with the word 'INVOICE' clearly visible",
          "Your business name and contact details",
          "Your logo (optional but recommended)",
          "Unique invoice number",
          "Issue date and due date",
          "Client's billing details",
          "Itemized line items with rates",
          "Subtotal, tax, discount, total",
          "Payment terms and instructions",
          "Notes or thank-you message",
        ],
      },
      {
        heading: "How to word an invoice professionally",
        content: "The tone should be polite but firm. Use clear, descriptive language for line items (e.g. 'Web design - homepage layout' instead of 'design work'). Specify quantities and rates clearly. Include payment terms in plain language: 'Payment due within 30 days of invoice date.'",
      },
    ],
    steps: [
      { title: "Add a clear invoice header", description: "The word 'INVOICE' should be prominent at the top, along with your invoice number and date." },
      { title: "Identify yourself and your client", description: "Both parties' full legal names, addresses, and contact details. Include tax IDs if required by your country." },
      { title: "Describe what you're billing for", description: "Use clear descriptions. Instead of 'work', write 'Logo design - 3 concepts + 2 revisions'. The client should know exactly what they're paying for." },
      { title: "Show the math", description: "List quantities, rates, subtotal, tax, discounts, and total. Make it easy to verify." },
      { title: "Specify how and when to pay", description: "Include payment terms ('Net 30'), accepted methods (bank transfer, PayPal, etc.), and account details if needed." },
    ],
    faqs: [
      { q: "Should I include my SSN on invoices?", a: "Avoid putting your SSN on invoices for security. Use an EIN instead (free from the IRS). For non-US, use your business tax registration number." },
      { q: "Can I write an invoice in Word or Excel?", a: "Yes, but it's much faster to use a free invoice generator like InvoiceGen. You get pre-built templates, automatic calculations, and PDF download — no formatting headaches." },
    ],
  },
  "create-invoice-freelancer": {
    slug: "create-invoice-freelancer",
    title: "How to Create an Invoice as a Freelancer",
    metaTitle: "How to Invoice as a Freelancer — Complete Guide & Free Template",
    metaDescription: "Complete guide for freelancers on how to create professional invoices, set rates, handle taxes, and get paid faster. Free template included.",
    intro: "As a freelancer, your invoice is your most important business document. It's what gets you paid. This guide covers everything freelancers need to know about invoicing — from what to include, to how to handle taxes, to how to follow up on late payments.",
    sections: [
      {
        heading: "Why freelancer invoices are different",
        content: "Freelancers face unique challenges: irregular income, international clients, multiple currencies, and self-employment taxes. Your invoice needs to handle all of this clearly and professionally.",
      },
      {
        heading: "What freelancers should include on every invoice",
        content: "Beyond the standard invoice fields, freelancers should always include:",
        list: [
          "A clear scope of work (what you delivered)",
          "Hours worked or project milestones",
          "Your hourly rate or project fee",
          "Tax information (SSN/EIN/GSTIN as required)",
          "Payment methods you accept (bank, PayPal, Wise, Stripe)",
          "Late fee policy",
          "A friendly thank-you note",
        ],
      },
    ],
    steps: [
      { title: "Set up a freelancer template", description: "Use InvoiceGen's free freelance template with pre-filled sample fields for hourly work, project fees, and payment terms." },
      { title: "Add your business details", description: "Include your name (or business name), tax ID, and contact info. Upload a simple logo for professionalism." },
      { title: "List your work clearly", description: "Break down hours, projects, or deliverables. Clients are more willing to pay when they see exactly what they got." },
      { title: "Set fair payment terms", description: "Net 15 or Net 30 is standard. Add a late fee clause (1.5-2% per month) to encourage on-time payment." },
      { title: "Send and follow up", description: "Email the PDF directly. If unpaid after the due date, send a polite reminder. Use recurring reminders for ongoing clients." },
    ],
    faqs: [
      { q: "How much should freelancers charge?", a: "Rates vary by skill and experience. Entry-level: $25-50/hr. Mid-level: $50-100/hr. Senior: $100-300+/hr. Project-based pricing is often more profitable than hourly." },
      { q: "Should freelancers charge upfront?", a: "For new clients or large projects, charge 25-50% upfront. This protects you and qualifies serious clients. Established clients often pay net-30." },
      { q: "How do freelancers handle taxes?", a: "Freelancers typically don't charge sales tax on services in the US. In the UK/EU, register for VAT if you exceed the threshold. In India, GST applies above ₹20 lakh turnover." },
    ],
  },
  "send-invoice": {
    slug: "send-invoice",
    title: "How to Send an Invoice (Email Templates Included)",
    metaTitle: "How to Send an Invoice — Best Practices + Email Templates",
    metaDescription: "Learn the best way to send invoices to clients with email templates, timing tips, and follow-up strategies. Get paid faster with these proven methods.",
    intro: "Sending an invoice the right way significantly affects how quickly you get paid. This guide covers email templates, timing, follow-ups, and tools that make sending invoices effortless.",
    sections: [
      {
        heading: "When to send an invoice",
        content: "Send invoices as soon as work is completed — don't wait. Studies show invoices sent within 24 hours of project completion get paid 50% faster than those sent a week later. For ongoing work, send weekly or monthly on a consistent schedule.",
      },
      {
        heading: "Email template for sending an invoice",
        content: "Keep it professional and brief:",
        list: [
          "Subject: 'Invoice [#INV-001] from [Your Name] — Due [Date]'",
          "Greeting: 'Hi [Client Name],'",
          "Body: 'Please find attached invoice #INV-001 for [project/service]. Payment is due by [date]. If you have any questions, please let me know.'",
          "Closing: 'Thank you for your business!'",
          "Signature with your contact details",
        ],
      },
    ],
    steps: [
      { title: "Generate your invoice as a PDF", description: "Use InvoiceGen to create a professional PDF invoice. Make sure all details are correct before sending." },
      { title: "Email the PDF directly", description: "InvoiceGen lets you email invoices directly with one click. The PDF is attached automatically." },
      { title: "Use a clear subject line", description: "Include the invoice number and due date in the subject. This makes it easy for clients to find later." },
      { title: "Follow up on overdue invoices", description: "If unpaid by the due date, send a polite reminder. Then a firmer one at +14 days. Always reference the original invoice." },
    ],
    faqs: [
      { q: "What's the best way to send an invoice?", a: "Email is fastest and creates a paper trail. Use a tool that sends the PDF directly. Avoid sending screenshots or images of invoices — always PDF." },
      { q: "Should I send invoices by mail?", a: "Only if specifically requested. Email is 99% of business invoicing today. Some government and legal contracts still require mail." },
    ],
  },
  "add-tax-to-invoice": {
    slug: "add-tax-to-invoice",
    title: "How to Add Tax to an Invoice",
    metaTitle: "How to Add Tax (VAT, GST, Sales Tax) to an Invoice",
    metaDescription: "Learn how to add VAT, GST, sales tax, or any other tax to your invoice correctly. Country-specific rules and free calculator included.",
    intro: "Adding tax to an invoice depends on your country, your tax registration status, and the type of goods or services you sell. This guide covers the basics for major tax systems including VAT, GST, sales tax, and more.",
    sections: [
      {
        heading: "Common tax systems by country",
        content: "Different countries use different tax systems on invoices:",
        list: [
          "USA: Sales tax (varies by state, only on physical goods in most states)",
          "UK: VAT (20% standard rate, register if turnover > £90,000)",
          "EU: VAT (varies 17-27% by country)",
          "India: GST (5%, 12%, 18%, or 28% depending on goods/services)",
          "Australia: GST (10% flat)",
          "Canada: GST/HST (5-15% depending on province)",
          "UAE: VAT (5%)",
          "Brazil: ICMS, ISS, PIS, COFINS (varies)",
        ],
      },
      {
        heading: "How to calculate tax on an invoice",
        content: "Tax is usually calculated on the subtotal (sum of all line items before tax). The formula is: Tax Amount = Subtotal × (Tax Rate / 100). The total invoice amount = Subtotal + Tax. InvoiceGen auto-calculates this when you enter the tax rate.",
      },
    ],
    steps: [
      { title: "Determine if you need to charge tax", description: "Check if you're tax-registered in your country. Most freelancers and small businesses below the threshold don't need to charge tax." },
      { title: "Find your tax rate", description: "Use the standard rate for your country/state (e.g., 20% UK VAT, 18% India GST, 10% Australia GST). InvoiceGen auto-suggests this when you select your country." },
      { title: "Add the tax rate to your invoice", description: "Enter the percentage in the Tax Rate field. The system calculates the tax amount and adds it to the total automatically." },
      { title: "Show tax separately on the invoice", description: "Tax must be shown as a separate line item — not bundled into the price. This is required by law in most countries." },
    ],
    faqs: [
      { q: "Do I need to register for tax to charge it?", a: "Yes — in most countries, you can only charge tax if you're registered with the tax authority and have a tax ID (VAT number, GSTIN, EIN, etc.)." },
      { q: "What if I forget to add tax to an invoice?", a: "If you're tax-registered and forgot to charge tax, you may still owe it to the government. Issue a corrected invoice or credit note as soon as possible and contact your accountant." },
      { q: "Can I include tax in the line item price?", a: "Yes, this is called 'tax inclusive' pricing. But you must clearly state it on the invoice (e.g., 'All prices include 20% VAT'). 'Tax exclusive' (showing tax separately) is more common for B2B." },
    ],
  },
};

export const HOW_TO_LIST = Object.values(HOW_TO_GUIDES);
