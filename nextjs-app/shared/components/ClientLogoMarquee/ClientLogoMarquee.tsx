"use client";

import type { CSSProperties } from "react";
import { useAnimationContext } from "../../lib/animation";

type ClientLogo = {
  src: string;
  alt: string;
  mobileHeight?: string;
  desktopHeight?: string;
  mobileWidth?: string;
  desktopWidth?: string;
};

const logos: ClientLogo[] = [
  {
    src: "/logos/clients/abb.svg",
    alt: "ABB",
    mobileHeight: "h-4",
    desktopHeight: "md:h-[28px]",
  },
  { src: "/logos/clients/aalto.svg", alt: "Aalto" },
  { src: "/logos/clients/dna.svg", alt: "DNA" },
  {
    src: "/logos/clients/elisa.svg",
    alt: "Elisa",
    mobileHeight: "h-5",
    desktopHeight: "md:h-[34px]",
  },
  { src: "/logos/clients/alma.svg", alt: "Alma" },
  { src: "/logos/clients/a-lehdet.svg", alt: "A-lehdet" },
  {
    src: "/logos/clients/metso.svg",
    alt: "Metso",
    mobileHeight: "h-5",
    desktopHeight: "md:h-[34px]",
  },
  {
    src: "/logos/clients/nordea.svg",
    alt: "Nordea",
    mobileWidth: "w-[94px]",
    desktopWidth: "w-[182px]",
  },
  { src: "/logos/clients/op.svg", alt: "OP" },
  {
    src: "/logos/clients/fiskars.svg",
    alt: "Fiskars",
    mobileWidth: "w-[96px]",
    desktopWidth: "w-[186px]",
  },
  {
    src: "/logos/clients/enerkey.svg",
    alt: "Enerkey",
    mobileHeight: "h-4",
    desktopHeight: "md:h-[28px]",
  },
  {
    src: "/logos/clients/finnair.svg",
    alt: "Finnair",
    mobileWidth: "w-[92px]",
    desktopWidth: "w-[176px]",
  },
  {
    src: "/logos/clients/nokia.svg",
    alt: "Nokia",
    mobileWidth: "w-[80px]",
    desktopWidth: "w-[152px]",
  },
  { src: "/logos/clients/kesko.svg", alt: "Kesko" },
  {
    src: "/logos/clients/intrum.svg",
    alt: "Intrum",
    mobileWidth: "w-[84px]",
    desktopWidth: "w-[164px]",
  },
  { src: "/logos/clients/kone.svg", alt: "Kone" },
  { src: "/logos/clients/sap.svg", alt: "SAP" },
  {
    src: "/logos/clients/dsharp.svg",
    alt: "DSharp",
    mobileWidth: "w-[97px]",
    desktopWidth: "w-[185px]",
  },
  { src: "/logos/clients/seppo.svg", alt: "Seppo" },
];

const marqueeTrackStyle = {
  "--marquee-width": "50%",
} as CSSProperties;

function ClientLogoSemanticList() {
  return (
    <ul className="sr-only">
      {logos.map((logo) => (
        <li key={logo.src}>{logo.alt}</li>
      ))}
    </ul>
  );
}

function LogoItem({
  logo,
  duplicate = false,
}: {
  logo: ClientLogo;
  duplicate?: boolean;
}) {
  const hasCustomWidth = Boolean(logo.mobileWidth && logo.desktopWidth);

  const sizeClasses = [
    "flex shrink-0 items-center",
    logo.mobileHeight && logo.desktopHeight
      ? `${logo.mobileHeight} ${logo.desktopHeight}`
      : "h-6 md:h-10",
    hasCustomWidth ? `${logo.mobileWidth} md:${logo.desktopWidth}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={sizeClasses}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.alt}
        aria-hidden={duplicate ? "true" : undefined}
        role={duplicate ? "presentation" : undefined}
        className="client-logo-marquee-image block"
        loading={duplicate ? "lazy" : "eager"}
        decoding="async"
        style={
          hasCustomWidth
            ? {
                height: "100%",
                width: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }
            : {
                height: "100%",
                width: "auto",
                maxHeight: "100%",
              }
        }
      />
    </div>
  );
}

function LogoMarqueeTrack({ laneLogos }: { laneLogos: ClientLogo[] }) {
  return (
    <div className="overflow-hidden">
      <div
        className="client-logo-marquee-track flex w-max items-center py-3"
        style={marqueeTrackStyle}
      >
        {[0, 1].map((duplicateIndex) => (
          <div
            key={duplicateIndex}
            data-marquee-group
            className="flex shrink-0 items-center gap-5 pr-5 md:gap-10 md:pr-10"
            aria-hidden={duplicateIndex > 0 ? "true" : undefined}
          >
            {laneLogos.map((logo) => (
              <LogoItem
                key={`${logo.src}-${duplicateIndex}`}
                logo={logo}
                duplicate={duplicateIndex > 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Props for ClientLogoMarquee. */
export interface ClientLogoMarqueeProps {
  /** Accessible name for the marquee section. */
  ariaLabel: string;
  /** Additional CSS classes on the marquee section. */
  className?: string;
}

/**
 * ClientLogoMarquee component.
 */
export function ClientLogoMarquee({ ariaLabel, className }: ClientLogoMarqueeProps) {
  const { motionPreference, isReady } = useAnimationContext();

  // Render the animated marquee by DEFAULT. The animation is pure CSS
  // (no JS required to run) and reduced-motion is honoured by the CSS
  // @media query, so it is SSR-safe and keeps animating even if client
  // hydration is slow or never completes (e.g. mobile Safari over a dev
  // server). Only fall back to the static grid once we have positively
  // confirmed the visitor prefers reduced motion. Previously this gated on
  // !isReady, so any device where the AnimationProvider effect did not run
  // was stuck on the static grid.
  if (isReady && motionPreference === "reduced") {
    return (
      <section
        aria-label={ariaLabel}
        className={className ? `py-3 ${className}` : "py-3"}
      >
        <ClientLogoSemanticList />
        <div className="grid grid-cols-3 items-center justify-items-center gap-4 md:grid-cols-6 md:gap-6 lg:grid-cols-9">
          {logos.map((logo) => (
            <LogoItem key={logo.src} logo={logo} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={ariaLabel}
      className={
        className
          ? `client-logo-marquee-container relative overflow-hidden ${className}`
          : "client-logo-marquee-container relative overflow-hidden"
      }
    >
      <ClientLogoSemanticList />
      <LogoMarqueeTrack laneLogos={logos} />
    </section>
  );
}
