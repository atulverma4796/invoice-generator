import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "InvoiceGen - Free Invoice Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            📄
          </div>
          <div style={{ fontSize: "64px", fontWeight: "800", letterSpacing: "-2px" }}>
            InvoiceGen
          </div>
        </div>
        <div
          style={{
            fontSize: "32px",
            opacity: 0.95,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Free Invoice Generator — No Signup Required
        </div>
        <div
          style={{
            display: "flex",
            gap: "30px",
            marginTop: "40px",
            fontSize: "20px",
            opacity: 0.8,
          }}
        >
          <span>10 Templates</span>
          <span>•</span>
          <span>30+ Currencies</span>
          <span>•</span>
          <span>Instant PDF</span>
          <span>•</span>
          <span>100% Free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
