import { ImageResponse } from "next/og";
import { OG_SIZE, BRAND_DARK, LogoSvg } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "VertaaUX — AI-Powered UX Intelligence Platform";
export const size = OG_SIZE;
export const contentType = "image/png";

const VERTAAUX_TEAL = "#00FFCC";

function VertaaUXLogo({ logoSize = 80 }: { logoSize?: number }) {
  const h = Math.round(logoSize * (27 / 32));
  return (
    <svg
      width={logoSize}
      height={h}
      viewBox="0 0 32 27"
      fill="none"
    >
      <path
        d="M12.0508 26.2451L0 10.3916H12.0508V0H32L12.0508 26.2451Z"
        fill={VERTAAUX_TEAL}
      />
    </svg>
  );
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0D0D0D",
          padding: 60,
        }}
      >
        {/* Top bar with DT logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                backgroundColor: "#DFFF00",
                borderRadius: 24,
              }}
            >
              <LogoSvg size={28} color={BRAND_DARK} />
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              Digitaltableteur
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 600,
              color: VERTAAUX_TEAL,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "8px 16px",
              border: `2px solid ${VERTAAUX_TEAL}`,
              borderRadius: 4,
            }}
          >
            Case Study
          </div>
        </div>

        {/* Center content: logo + title */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 32,
          }}
        >
          <VertaaUXLogo logoSize={100} />
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            VertaaUX
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: 1.4,
              maxWidth: "80%",
            }}
          >
            AI-Powered UX Intelligence Platform
          </div>
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["UX Intelligence", "Accessibility", "AI Agents", "Brand Identity"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 500,
                color: VERTAAUX_TEAL,
                backgroundColor: "rgba(0, 255, 204, 0.1)",
                padding: "8px 16px",
                borderRadius: 4,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
    },
  );
}
