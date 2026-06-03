import { ImageResponse } from "next/og";
import { OG_SIZE, LogoSvg } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Raw View — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

const RAW_RED = "#C0392B";
const DARK = "#0A0A0A";

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
      {/* Diagonal red slab — editorial energy */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 500,
          height: 900,
          backgroundColor: RAW_RED,
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
            <LogoSvg size={28} color="#041B23" />
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
            color: RAW_RED,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Case Study
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
            Raw
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 800,
              color: RAW_RED,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            View
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
          Editorial Design → Photography → Bilingual Publishing
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
