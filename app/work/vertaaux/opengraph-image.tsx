import { ImageResponse } from "next/og";
import { OG_SIZE, LogoSvg } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "VertaaUX — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

const VERTAAUX_TEAL = "#00FFCC";
const DARK = "#0D0D0D";

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
      {/* Giant VertaaUX logo shape — background element */}
      <svg
        width="800"
        height="480"
        viewBox="0 0 32 27"
        fill="none"
        style={{
          position: "absolute",
          top: 20,
          right: -200,
        }}
      >
        <path
          d="M12.0508 26.2451L0 10.3916H12.0508V0H32L12.0508 26.2451Z"
          fill={VERTAAUX_TEAL}
          opacity="1"
        />
      </svg>

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
            color: VERTAAUX_TEAL,
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
            VertaaUX
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
          UX Intelligence → Accessibility → AI Agents
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
