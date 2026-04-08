import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InvoiceGen - Free Invoice Generator",
    short_name: "InvoiceGen",
    description:
      "Free invoice generator with PDF download, multiple templates, 30+ currencies, and 120+ countries. No signup required.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait",
    categories: ["business", "finance", "productivity", "utilities"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
