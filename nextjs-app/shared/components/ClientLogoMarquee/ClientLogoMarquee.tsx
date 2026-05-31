"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";

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

function ClientLogoSemanticList() {
  return (
    <ul className="sr-only">
      {logos.map((logo) => (
        <li key={logo.src}>{logo.alt}</li>
      ))}
    </ul>
  );
}

const mobilePrimaryLogos = logos.filter((_, index) => index % 2 === 0);
const mobileSecondaryLogos = logos.filter((_, index) => index % 2 !== 0);

/** Speed constant: pixels per second */
const MARQUEE_SPEED = 50;

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
    hasCustomWidth
      ? `${logo.mobileWidth} md:${logo.desktopWidth}`
      : "",
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

function LogoLane({
  laneLogos,
  className,
  groupClassName,
  reverse = false,
}: {
  laneLogos: ClientLogo[];
  className: string;
  groupClassName: string;
  reverse?: boolean;
}) {
  const laneRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const lane = laneRef.current;
      if (!lane) return;

      const firstGroup = lane.querySelector(
        "[data-marquee-group]",
      ) as HTMLElement | null;
      if (!firstGroup) return;

      const width = firstGroup.scrollWidth;
      if (width <= 0) return;

      const groups = lane.querySelectorAll("[data-marquee-group]");

      tweenRef.current = gsap.to(groups, {
        x: reverse ? width : -width,
        duration: width / MARQUEE_SPEED,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x: string) => {
            const val = parseFloat(x);
            // Wrap the value so it seamlessly loops
            return reverse
              ? ((val % width) + width) % width
              : -(((Math.abs(val)) % width + width) % width);
          }),
        },
      });
    },
    { scope: laneRef },
  );

  const handleMouseEnter = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, {
        timeScale: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, {
        timeScale: 1,
        duration: 0.5,
        ease: "power2.in",
      });
    }
  };

  return (
    <div
      ref={laneRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {[0, 1].map((duplicateIndex) => (
        <div
          key={duplicateIndex}
          data-marquee-group
          className={groupClassName}
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
  );
}


/** Props for ClientLogoMarquee. */
export interface ClientLogoMarqueeProps {
  className?: string;
}

/**
 * ClientLogoMarquee component.
 */
export function ClientLogoMarquee({
  ariaLabel,
}: {
  ariaLabel: string;
}) {
  const { motionPreference } = useAnimationContext();

  if (motionPreference === "reduced") {
    return (
      <section aria-label={ariaLabel} className="py-3">
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
      className="client-logo-marquee-container relative overflow-hidden"
    >
      <ClientLogoSemanticList />
      <div className="space-y-3 md:hidden">
        <div className="overflow-hidden">
          <LogoLane
            laneLogos={mobilePrimaryLogos}
            className="flex w-max items-center"
            groupClassName="flex items-center gap-5 pr-5"
          />
        </div>
        <div className="overflow-hidden">
          <LogoLane
            laneLogos={mobileSecondaryLogos}
            className="flex w-max items-center"
            groupClassName="flex items-center gap-5 pr-5"
            reverse
          />
        </div>
      </div>
      <div className="hidden md:block">
        <LogoLane
          laneLogos={logos}
          className="flex w-max items-center py-3"
          groupClassName="flex items-center gap-10 pr-10"
        />
      </div>
    </section>
  );
}
