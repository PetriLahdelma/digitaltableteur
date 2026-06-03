import { ImageResponse } from "next/og";
import { OG_SIZE, LogoSvg } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "SAP Build Apps Design System — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

const SAP_GOLD = "#F0AB00";
const SAP_BLUE = "#0070F2";
const DARK = "#041B23";

const MONO_FONT_URL =
  "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf";

export default async function Image() {
  const monoFont = await fetch(MONO_FONT_URL).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        fontFamily: "JetBrains Mono",
        backgroundColor: DARK,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Diagonal SAP blue slab */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 500,
          height: 900,
          backgroundColor: SAP_BLUE,
          transform: "rotate(-12deg)",
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 80px 64px 80px",
          flex: 1,
          position: "relative",
        }}
      >
        {/* Logo lockup — top left */}
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 80,
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
            <LogoSvg size={28} color={DARK} />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 800,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.01em",
            }}
          >
            Digitaltableteur
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 64,
            right: 80,
            display: "flex",
            fontSize: 14,
            fontWeight: 800,
            color: SAP_GOLD,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Case Study
        </div>

        {/* SAP Build Apps wedge mark above headline */}
        <div
          style={{
            display: "flex",
            marginBottom: 24,
          }}
        >
          <svg width="120" height="60" viewBox="0 0 70 34.15" fill="none">
            <path d="M70 0H0V34.15H35L70 0Z" fill={SAP_BLUE} />
          </svg>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Build
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 800,
              color: SAP_BLUE,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Apps
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 18,
            fontWeight: 800,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.02em",
          }}
        >
          Design System → Enterprise → Low-Code
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "JetBrains Mono",
          data: monoFont,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
