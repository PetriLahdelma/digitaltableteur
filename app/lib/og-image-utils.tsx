import { ImageResponse } from "next/og";
import { CHROME_MARK_DATA_URL } from "./og-postcard-mark";

// Brand colors
export const BRAND_LIME = "#DFFF00";
export const BRAND_DARK = "#041B23";
export const POSTCARD_BLACK = "#050505";

// Standard OG image size
export const OG_SIZE = {
  width: 1200,
  height: 630,
};

// JetBrains Mono ExtraBold static TTF (the previous shared URL served the
// 400-weight file, so titles rendered faux-bold in satori)
const MONO_FONT_URL =
  "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8SKtjPQ.ttf";

// Logo SVG component for OG images
export function LogoSvg({ size = 72, color = BRAND_DARK }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 395 323"
      fill="none"
    >
      <g clipPath="url(#clip0_og)">
        <rect x="190.742" width="39.0494" height="142.681" fill={color} />
        <rect x="190.742" y="180.228" width="39.0494" height="142.681" fill={color} />
        <rect x="267.338" y="181.73" width="39.0494" height="127.662" transform="rotate(-90 267.338 181.73)" fill={color} />
        <rect y="37.5475" width="39.0494" height="246.312" fill={color} />
        <rect x="115.646" y="76.597" width="39.0494" height="168.213" fill={color} />
        <path d="M39.0493 76.597L39.0493 37.5475L118.65 37.5475L154.696 76.5969L39.0493 76.597Z" fill={color} />
        <path d="M39.0493 244.81L39.0493 283.859L118.65 283.859L154.696 244.81L39.0493 244.81Z" fill={color} />
      </g>
      <defs>
        <clipPath id="clip0_og">
          <rect width="395" height="322.909" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

interface MetaSegment {
  text: string;
  accent?: boolean;
}

interface PostcardOgImageProps {
  title: string;
  tag?: string;
  meta?: MetaSegment[];
}

function titleFontSize(title: string) {
  if (title.length > 110) return 44;
  if (title.length > 70) return 52;
  return 64;
}

/**
 * Postcard OG template (brand system 2026): black canvas, lime section tag,
 * JetBrains Mono title, chrome DX mark bleeding from the bottom-right corner.
 * Static brand surfaces (/, /about, /contact, /work, /blog) use pre-rendered
 * composites from scripts/og/render-og-images.mjs; every dynamic page derives
 * from this template.
 */
export async function generatePostcardOgImage({ title, tag, meta }: PostcardOgImageProps) {
  const monoFont = await fetch(MONO_FONT_URL).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          fontFamily: "JetBrains Mono",
          backgroundColor: POSTCARD_BLACK,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {tag && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 72,
              display: "flex",
              fontSize: 22,
              fontWeight: 800,
              color: BRAND_LIME,
              letterSpacing: "0.22em",
            }}
          >
            {tag}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 60,
            right: 72,
            display: "flex",
            fontSize: 22,
            fontWeight: 800,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.04em",
          }}
        >
          digitaltableteur.com
        </div>

        <div
          style={{
            position: "absolute",
            left: 72,
            top: 150,
            width: 760,
            display: "flex",
            fontSize: titleFontSize(title),
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>

        {meta && meta.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 56,
              left: 72,
              display: "flex",
              gap: 18,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            {meta.map((segment, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  color: segment.accent ? "#ffffff" : "rgba(255,255,255,0.55)",
                }}
              >
                {segment.text}
              </div>
            ))}
          </div>
        )}

        {/* Chrome DX mark bleeding from the bottom-right corner */}
        <img
          src={CHROME_MARK_DATA_URL}
          width={460}
          height={591}
          style={{
            position: "absolute",
            right: -60,
            bottom: -80,
            transform: "rotate(6deg)",
          }}
        />
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
    }
  );
}

interface PageOgImageProps {
  title: string;
  subtitle?: string;
  tag?: string;
  showLogo?: boolean;
}

/**
 * Generate a standard page OG image with title and optional subtitle.
 * Delegates to the postcard template; subtitle renders as the meta line.
 */
export function generatePageOgImage({ title, subtitle, tag }: PageOgImageProps) {
  return generatePostcardOgImage({
    title,
    tag,
    meta: subtitle ? [{ text: subtitle }] : undefined,
  });
}

interface BlogOgImageProps {
  title: string;
  author?: string;
  date?: string;
  readTime?: string;
}

/**
 * Generate a blog post OG image with article meta.
 */
export function generateBlogOgImage({ title, author, date, readTime }: BlogOgImageProps) {
  const meta: MetaSegment[] = [];
  if (author) meta.push({ text: author, accent: true });
  if (date) meta.push({ text: date });
  if (readTime) meta.push({ text: readTime });
  return generatePostcardOgImage({ title, tag: "BLOG", meta });
}

interface WorkOgImageProps {
  title: string;
  category?: string;
  tags?: string[];
}

/**
 * Generate a work/portfolio OG image.
 */
export function generateWorkOgImage({ title, category, tags }: WorkOgImageProps) {
  const meta: MetaSegment[] = [];
  if (category) meta.push({ text: category, accent: true });
  for (const tag of tags?.slice(0, 3) ?? []) meta.push({ text: tag });
  return generatePostcardOgImage({ title, tag: "WORK", meta });
}
