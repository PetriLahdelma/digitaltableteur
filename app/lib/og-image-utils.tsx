import { ImageResponse } from "next/og";

// Brand colors
export const BRAND_LIME = "#DFFF00";
export const BRAND_DARK = "#041B23";

// Standard OG image size
export const OG_SIZE = {
  width: 1200,
  height: 630,
};

// Logo SVG component for OG images
export function LogoSvg({
  size = 72,
  color = BRAND_DARK,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 395 323" fill="none">
      <g clipPath="url(#clip0_og)">
        <rect x="190.742" width="39.0494" height="142.681" fill={color} />
        <rect
          x="190.742"
          y="180.228"
          width="39.0494"
          height="142.681"
          fill={color}
        />
        <rect
          x="267.338"
          y="181.73"
          width="39.0494"
          height="127.662"
          transform="rotate(-90 267.338 181.73)"
          fill={color}
        />
        <rect y="37.5475" width="39.0494" height="246.312" fill={color} />
        <rect
          x="115.646"
          y="76.597"
          width="39.0494"
          height="168.213"
          fill={color}
        />
        <path
          d="M39.0493 76.597L39.0493 37.5475L118.65 37.5475L154.696 76.5969L39.0493 76.597Z"
          fill={color}
        />
        <path
          d="M39.0493 244.81L39.0493 283.859L118.65 283.859L154.696 244.81L39.0493 244.81Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_og">
          <rect width="395" height="322.909" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

interface PageOgImageProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

/**
 * Generate a standard page OG image with title and optional subtitle
 */
export function generatePageOgImage({
  title,
  subtitle,
  showLogo = true,
}: PageOgImageProps) {
  return new ImageResponse(
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
      {showLogo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            backgroundColor: BRAND_LIME,
            borderRadius: 50,
            marginBottom: 40,
          }}
        >
          <LogoSvg size={60} color={BRAND_DARK} />
        </div>
      )}

      {/* Page title */}
      <div
        style={{
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          marginBottom: subtitle ? 20 : 0,
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 400,
            color: BRAND_LIME,
            letterSpacing: "0.02em",
            textAlign: "center",
            maxWidth: "70%",
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Brand footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "absolute",
          bottom: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            backgroundColor: BRAND_LIME,
            borderRadius: 16,
          }}
        >
          <LogoSvg size={20} color={BRAND_DARK} />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            fontWeight: 600,
            color: "#ffffff",
            opacity: 0.8,
          }}
        >
          Digitaltableteur
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
    },
  );
}

interface BlogOgImageProps {
  title: string;
  author?: string;
  date?: string;
  readTime?: string;
}

/**
 * Generate a blog post OG image with article-specific styling
 */
export function generateBlogOgImage({
  title,
  author,
  date,
  readTime,
}: BlogOgImageProps) {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: BRAND_DARK,
        backgroundImage:
          "radial-gradient(circle at 10% 20%, #0a3040 0%, transparent 30%), radial-gradient(circle at 90% 80%, #0a3040 0%, transparent 30%)",
        padding: 60,
      }}
    >
      {/* Top bar with logo and "BLOG" label */}
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
              backgroundColor: BRAND_LIME,
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
            color: BRAND_LIME,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "8px 16px",
            border: `2px solid ${BRAND_LIME}`,
            borderRadius: 4,
          }}
        >
          Blog
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>
      </div>

      {/* Footer with meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginTop: 40,
        }}
      >
        {author && (
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#ffffff",
              opacity: 0.8,
            }}
          >
            By {author}
          </div>
        )}
        {date && (
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: BRAND_LIME,
              opacity: 0.8,
            }}
          >
            {date}
          </div>
        )}
        {readTime && (
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#ffffff",
              opacity: 0.6,
            }}
          >
            {readTime} read
          </div>
        )}
      </div>
    </div>,
    {
      ...OG_SIZE,
    },
  );
}

interface WorkOgImageProps {
  title: string;
  category?: string;
  tags?: string[];
}

/**
 * Generate a work/portfolio OG image
 */
export function generateWorkOgImage({
  title,
  category,
  tags,
}: WorkOgImageProps) {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: BRAND_DARK,
        backgroundImage:
          "radial-gradient(circle at 10% 20%, #0a3040 0%, transparent 30%), radial-gradient(circle at 90% 80%, #0a3040 0%, transparent 30%)",
        padding: 60,
      }}
    >
      {/* Top bar with logo and category */}
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
              backgroundColor: BRAND_LIME,
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
        {category && (
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 600,
              color: BRAND_LIME,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "8px 16px",
              border: `2px solid ${BRAND_LIME}`,
              borderRadius: 4,
            }}
          >
            {category}
          </div>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "8px 16px",
                borderRadius: 4,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>,
    {
      ...OG_SIZE,
    },
  );
}
