import { ImageResponse } from "next/og";
import { OG_SIZE, LogoSvg } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "KnobSmith Audio — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

const PINK = "#ED4B9B";
const STUDIO_DARK = "#2B2F33";

const MONO_FONT_URL =
  "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf";

function KnobSmithLogo({ logoSize = 280, color = "#ffffff" }: { logoSize?: number; color?: string }) {
  const scale = logoSize / 250;
  return (
    <svg
      width={logoSize}
      height={logoSize}
      viewBox="226 200 248 222"
      fill="none"
    >
      <path
        d="M350.02 200.5C366.513 200.5 381.682 202.852 393.729 206.791C405.798 210.738 414.647 216.25 418.616 222.505L418.649 222.556L418.692 222.598H418.693L418.712 222.617C418.727 222.632 418.751 222.656 418.781 222.688C418.843 222.751 418.935 222.848 419.054 222.979C419.292 223.242 419.635 223.641 420.048 224.179C420.875 225.253 421.983 226.88 423.092 229.075C425.309 233.464 427.537 240.133 427.537 249.219C427.537 263.88 428.438 279.377 428.798 285.044L428.817 285.33L428.851 285.348C428.926 285.989 428.967 286.629 428.967 287.27C428.967 297.179 420.326 306.306 405.989 312.986C391.694 319.647 371.91 323.781 350.029 323.781C328.149 323.781 308.366 319.647 294.07 312.986C279.734 306.306 271.093 297.179 271.093 287.27C271.093 286.532 271.142 285.805 271.238 285.089L271.242 285.054C271.602 279.387 272.503 263.89 272.503 249.229C272.503 240.138 274.731 233.47 276.948 229.082C278.058 226.887 279.165 225.261 279.991 224.188C280.405 223.651 280.748 223.252 280.986 222.989C281.104 222.858 281.196 222.761 281.258 222.697C281.289 222.666 281.312 222.642 281.327 222.627C281.335 222.62 281.341 222.615 281.344 222.611C281.346 222.61 281.347 222.608 281.348 222.607L281.391 222.566L281.423 222.515C285.393 216.26 294.242 210.745 306.312 206.796C318.358 202.854 333.527 200.5 350.02 200.5ZM401.808 252.976C398.105 252.642 393.836 253.596 389.863 255.889C385.891 258.181 382.929 261.399 381.366 264.77C379.853 268.033 379.636 271.484 381.159 274.348L381.312 274.623C382.995 277.539 386.177 279.169 389.877 279.504C393.58 279.839 397.849 278.887 401.821 276.594C405.794 274.301 408.755 271.084 410.319 267.713C411.881 264.344 412.061 260.776 410.373 257.859H410.372C408.689 254.939 405.508 253.309 401.808 252.976Z"
        fill={color}
      />
      <path
        d="M446.774 262.993C463.599 274.321 473.56 288.588 473.56 304.023V355.459C473.56 373.562 459.875 390.065 437.495 402.071C415.136 414.066 384.213 421.5 350.029 421.5C315.846 421.5 284.923 414.066 262.564 402.071C240.185 390.065 226.5 373.563 226.5 355.46L226.62 306.841V306.821L226.618 306.802C226.549 305.88 226.5 304.954 226.5 304.023C226.5 303.03 226.549 302.035 226.628 301.046L226.63 301.025V301.006C227.83 286.735 237.555 273.588 253.265 263.01C253.001 271.669 252.559 279.334 252.309 283.336C252.156 284.655 252.086 285.973 252.086 287.25C252.086 292.324 253.195 299.624 258.006 307.379C262.818 315.135 271.313 323.312 286.029 330.169C303.447 338.288 326.168 342.742 350.02 342.742C373.871 342.742 396.593 338.288 414.011 330.169C428.727 323.312 437.221 315.135 442.033 307.379C446.844 299.624 447.953 292.324 447.953 287.25C447.953 285.972 447.873 284.657 447.731 283.336C447.481 279.326 447.047 271.653 446.774 262.993Z"
        fill={color}
      />
    </svg>
  );
}

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
          backgroundColor: STUDIO_DARK,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Diagonal pink slab — top-right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 500,
            height: 900,
            backgroundColor: PINK,
            transform: "rotate(-12deg)",
            display: "flex",
          }}
        />

        {/* KnobSmith logo — white, on the pink slab */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: -100,
            transform: "translateY(-50%)",
            display: "flex",
            opacity: 0.25,
          }}
        >
          <KnobSmithLogo logoSize={420} color="#ffffff" />
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

          {/* Case study badge — top right */}
          <div
            style={{
              position: "absolute",
              top: 64,
              right: 80,
              display: "flex",
              fontSize: 14,
              fontWeight: 800,
              color: PINK,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Case Study
          </div>

          {/* Headline — stacked */}
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
              KnobSmith
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 84,
                fontWeight: 800,
                color: PINK,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              Audio
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
            Interaction Design → Visual Design → Brand Identity
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
