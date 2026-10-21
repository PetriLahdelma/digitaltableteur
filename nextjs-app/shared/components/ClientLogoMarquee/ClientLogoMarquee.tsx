"use client";

import { useState, type CSSProperties } from "react";
import Button from "@dt/Button";
import styles from "./ClientLogoMarquee.module.css";
import sizes from "./ClientLogoMarquee.sizes.module.css";
import clientLogos from "./clientLogos.json";
import { useAnimationContext } from "../../lib/animation";

type ClientLogo = {
  /** File under /public/logos/clients/. */
  file: string;
  alt: string;
  /** Manual optical correction, read by build:logo-sizes only. */
  optical?: number;
};

/* Order and names live in clientLogos.json; each logo's optical size is
   generated from it by npm run build:logo-sizes. */
const logos: ClientLogo[] = clientLogos;

/* Object literals so build:icons registers both Phosphor glyphs. */
const pauseControl = { icon: "pause" };
const resumeControl = { icon: "play" };

const marqueeTrackStyle = {
  "--marquee-width": "50%",
} as CSSProperties;

function ClientLogoSemanticList() {
  return (
    <ul className="sr-only">
      {logos.map((logo) => (
        <li key={logo.file}>{logo.alt}</li>
      ))}
    </ul>
  );
}

function LogoItem({ logo }: { logo: ClientLogo }) {
  return (
    <div className="flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logos/clients/${logo.file}`}
        alt=""
        aria-hidden="true"
        role="presentation"
        className={`client-logo-marquee-image ${sizes.logo} ${sizes[logo.file.replace(/\.svg$/, "")]}`}
        loading="lazy"
        decoding="async"
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
              <LogoItem key={`${logo.file}-${duplicateIndex}`} logo={logo} />
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
  /** Label for the control that pauses the marquee. */
  pauseLabel?: string;
  /** Label for the control that resumes the marquee. */
  resumeLabel?: string;
  /** Additional CSS classes on the marquee section. */
  className?: string;
}

/**
 * ClientLogoMarquee component.
 */
export function ClientLogoMarquee({
  ariaLabel,
  pauseLabel = "Pause client logo animation",
  resumeLabel = "Resume client logo animation",
  className,
}: ClientLogoMarqueeProps) {
  const { motionPreference, isReady } = useAnimationContext();
  const [isPaused, setIsPaused] = useState(false);

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
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-12 md:gap-y-8">
          {logos.map((logo) => (
            <LogoItem key={logo.file} logo={logo} />
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
      data-paused={isPaused ? "true" : undefined}
    >
      <ClientLogoSemanticList />
      <LogoMarqueeTrack laneLogos={logos} />
      <div className={styles.controls}>
        <Button
          variant="tertiary"
          size="sm"
          icon={(isPaused ? resumeControl : pauseControl).icon}
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? resumeLabel : pauseLabel}
        </Button>
      </div>
    </section>
  );
}
