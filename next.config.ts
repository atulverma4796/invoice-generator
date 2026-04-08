import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/invoice-templates", destination: "/invoice-template", permanent: true },
      { source: "/free-invoice-generator", destination: "/", permanent: true },
      { source: "/invoice", destination: "/#generator", permanent: true },
    ];
  },
};

export default nextConfig;
