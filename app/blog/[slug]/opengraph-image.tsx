import { ImageResponse } from "next/og";
import { getPostMetaBySlug } from "../postMetadata";
import {
  BRAND_LIME,
  BRAND_DARK,
  OG_SIZE,
  LogoSvg,
} from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Digitaltableteur Blog";
export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostMetaBySlug(slug);

  const title = post?.title ?? "Blog Post";
  const author = post?.authorName ?? "Petri Lahdelma";
  const date = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : undefined;
  const readTime = post?.readTime;

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
            fontSize: title.length > 60 ? 44 : 56,
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
            {readTime}
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
