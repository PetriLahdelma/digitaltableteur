import { ImageResponse } from "next/og";
import { LogoSvg } from "./lib/og-image-utils";

export const runtime = "edge";
export const alt = "Digitaltableteur — Design Systems & AI-Powered DesignOps";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const LIME = "#DFFF00";
const DARK = "#041B23";

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
          backgroundColor: DARK,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Diagonal lime slab — top-right, creates tension */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 500,
            height: 900,
            backgroundColor: LIME,
            transform: "rotate(-12deg)",
            display: "flex",
          }}
        />

        {/* Logo mark on the lime slab */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 100,
            transform: "translateY(-50%)",
            display: "flex",
            opacity: 0.15,
          }}
        >
          <LogoSvg size={400} color={DARK} />
        </div>

        {/* Content — left side, bottom-heavy */}
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
                backgroundColor: LIME,
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

          {/* Headline — stacked, tight */}
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
              Design
            </div>
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
              Systems
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 84,
                fontWeight: 800,
                color: LIME,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                marginTop: 8,
              }}
            >
              +AI
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
            UX Strategy → Accessibility → DesignOps
          </div>
        </div>
      </div>
    ),
    {
      ...size,
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
