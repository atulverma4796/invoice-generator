import { MetadataRoute } from "next";

const BASE_URL = "https://invoicegen.app";

const INDUSTRIES = [
  "freelance", "contractor", "consulting", "photography", "graphic-design",
  "web-design", "construction", "cleaning", "plumbing", "landscaping",
  "catering", "tutoring", "electrician", "painting", "videography",
];

const COUNTRIES = [
  "india", "uk", "usa", "canada", "australia", "south-africa",
  "philippines", "nigeria", "singapore", "uae", "germany", "brazil",
  "malaysia", "pakistan", "indonesia",
];

const HOW_TO_TOPICS = [
  "create-invoice", "write-invoice", "create-invoice-freelancer",
  "send-invoice", "add-tax-to-invoice",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/invoice-template`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/invoice-generator`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/how-to`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const industryPages: MetadataRoute.Sitemap = INDUSTRIES.map((slug) => ({
    url: `${BASE_URL}/invoice-template/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((slug) => ({
    url: `${BASE_URL}/invoice-generator/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const howToPages: MetadataRoute.Sitemap = HOW_TO_TOPICS.map((slug) => ({
    url: `${BASE_URL}/how-to/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...industryPages, ...countryPages, ...howToPages];
}
