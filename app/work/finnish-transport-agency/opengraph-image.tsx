import { ImageResponse } from "next/og";
import { OG_SIZE, LogoSvg } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Finnish Transport Agency — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

const TEAL = "#3DB7E4";
const PROCESS_BLUE = "#0088CE";
const NAVY = "#0046AD";
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
            color: PROCESS_BLUE,
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
              fontSize: 72,
              fontWeight: 800,
              color: TEAL,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Finnish
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: PROCESS_BLUE,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Transport
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: NAVY,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Agency
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
          Brand Identity → Public Sector → Multilingual
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
