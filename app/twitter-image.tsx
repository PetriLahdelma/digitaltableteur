import { ImageResponse } from "next/og";

// Image metadata
export const runtime = "edge";
export const alt = "Digitaltableteur — Design Systems & AI-Powered DesignOps";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Brand colors
const BRAND_LIME = "#DFFF00";
const BRAND_DARK = "#041B23";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND_DARK,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #0a3040 0%, transparent 40%), radial-gradient(circle at 80% 70%, #0a3040 0%, transparent 40%)",
        }}
      >
        {/* Logo mark with lime background */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            backgroundColor: BRAND_LIME,
            borderRadius: 60,
            marginBottom: 48,
          }}
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 395 323"
            fill="none"
          >
            <g clipPath="url(#clip0_tw)">
              <rect x="190.742" width="39.0494" height="142.681" fill={BRAND_DARK} />
              <rect x="190.742" y="180.228" width="39.0494" height="142.681" fill={BRAND_DARK} />
              <rect x="267.338" y="181.73" width="39.0494" height="127.662" transform="rotate(-90 267.338 181.73)" fill={BRAND_DARK} />
              <rect y="37.5475" width="39.0494" height="246.312" fill={BRAND_DARK} />
              <rect x="115.646" y="76.597" width="39.0494" height="168.213" fill={BRAND_DARK} />
              <path d="M39.0493 76.597L39.0493 37.5475L118.65 37.5475L154.696 76.5969L39.0493 76.597Z" fill={BRAND_DARK} />
              <path d="M39.0493 244.81L39.0493 283.859L118.65 283.859L154.696 244.81L39.0493 244.81Z" fill={BRAND_DARK} />
            </g>
            <defs>
              <clipPath id="clip0_tw">
                <rect width="395" height="322.909" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}
        >
          Digitaltableteur
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            fontWeight: 400,
            color: BRAND_LIME,
            letterSpacing: "0.02em",
          }}
        >
          Design Systems & AI-Powered DesignOps
        </div>

        {/* Decorative line */}
        <div
          style={{
            display: "flex",
            width: 160,
            height: 4,
            backgroundColor: BRAND_LIME,
            borderRadius: 2,
            marginTop: 48,
            opacity: 0.5,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
