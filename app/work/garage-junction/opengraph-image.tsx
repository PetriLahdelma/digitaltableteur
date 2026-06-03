import { ImageResponse } from "next/og";
import { OG_SIZE, LogoSvg } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Garage Junction — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

const GARAGE_BLUE = "#1976D2";
const JUNCTION_ORANGE = "#F57C00";
const METRO_RED = "#FF0000";

const MONO_FONT_URL =
  "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf";

export default async function Image() {
  const monoFont = await fetch(MONO_FONT_URL).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          fontFamily: "JetBrains Mono",
          backgroundColor: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Metro line — horizontal red line across the image */}
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: METRO_RED,
            display: "flex",
          }}
        />

        {/* Metro station dots */}
        {[120, 320, 520, 720, 920].map((x) => (
          <div
            key={x}
            style={{
              position: "absolute",
              top: 190,
              left: x,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#ffffff",
              border: `6px solid ${METRO_RED}`,
              display: "flex",
            }}
          />
        ))}

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
                color: "rgba(0,0,0,0.4)",
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
              color: JUNCTION_ORANGE,
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
                color: GARAGE_BLUE,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              Garage
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 84,
                fontWeight: 800,
                color: GARAGE_BLUE,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              Junction
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 800,
              color: "rgba(0,0,0,0.35)",
              letterSpacing: "0.02em",
            }}
          >
            Branding → Event Identity → Merikerho Helsinki
          </div>
        </div>
      </div>
    ),
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
