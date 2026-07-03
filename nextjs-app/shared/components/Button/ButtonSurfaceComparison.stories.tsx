import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button as ShadcnButton } from "@/components/ui/button";
import DtButton from "@dt/Button";
import { cn } from "@/lib/utils";
import ctaStyles from "../../patterns/CTASection/CTASection.module.css";
import {
  MigrationDecisionBand,
  MigrationDecisionBlock,
  MigrationDecisionPage,
} from "../../stories/MigrationDecisionBoard/MigrationDecisionBoard";
import board from "../../stories/MigrationDecisionBoard/MigrationDecisionBoard.module.css";

const meta = {
  title: "Actions/Button/Surface comparison",
  parameters: {
    layout: "fullscreen",
    docs: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type BandId = "primary" | "gradient" | "dark" | "muted" | "brand";

const BANDS: { id: BandId; title: string; className?: string; style?: CSSProperties }[] = [
  {
    id: "primary",
    title: "Homepage CTA — background=primary",
    className:
      "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground",
  },
  {
    id: "gradient",
    title: "About bands — background=gradient",
    className:
      "bg-gradient-to-br from-primary via-[var(--color-primary)] to-[var(--color-primary)] text-primary-foreground",
  },
  {
    id: "dark",
    title: "Dark zinc band",
    className: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white",
  },
  {
    id: "muted",
    title: "Muted (light) band",
    className: "bg-muted text-foreground",
  },
  {
    id: "brand",
    title: "Work CTA — background=brand",
    className: ctaStyles.brandBackground,
  },
];

function LegacyCtaPair({ isDark, isBrand }: { isDark: boolean; isBrand: boolean }) {
  const primaryVariant = isDark ? ("secondary" as const) : ("default" as const);
  const primaryClass = cn(
    isDark && ctaStyles.primaryButton,
    isBrand && ctaStyles.brandPrimaryButton,
  );
  const outlineClass = cn(
    isDark && "border-white bg-transparent text-white hover:bg-white/10",
    isBrand && ctaStyles.brandOutlineButton,
  );

  return (
    <>
      <ShadcnButton variant={primaryVariant} size="lg" className={primaryClass}>
        Primary CTA
      </ShadcnButton>
      <ShadcnButton variant="outline" size="lg" className={outlineClass}>
        Secondary CTA
      </ShadcnButton>
    </>
  );
}

function DtNaivePair() {
  return (
    <>
      <DtButton variant="primary" size="lg">
        Primary CTA
      </DtButton>
      <DtButton variant="secondary" size="lg">
        Secondary CTA
      </DtButton>
    </>
  );
}

function DtSurfacePair({ surface }: { surface: "default" | "onDark" | "onBrand" }) {
  return (
    <>
      <DtButton variant="primary" size="lg" surface={surface}>
        Primary CTA
      </DtButton>
      <DtButton variant="secondary" size="lg" surface={surface}>
        Secondary CTA
      </DtButton>
    </>
  );
}

function CtaBandPanel({ band }: { band: (typeof BANDS)[number] }) {
  const isDark = band.id !== "muted" && band.id !== "brand";
  const isBrand = band.id === "brand";
  const dtSurface = isBrand ? "onBrand" : isDark ? "onDark" : "default";

  return (
    <MigrationDecisionBand title={band.title} className={band.className} style={band.style}>
      <MigrationDecisionBlock variant="legacy" title="Today — shadcn + pattern CSS">
        <LegacyCtaPair isDark={isDark} isBrand={isBrand} />
      </MigrationDecisionBlock>
      <MigrationDecisionBlock
        variant="wrong"
        title="Wrong — @dt primary/secondary, surface=default"
      >
        <DtNaivePair />
      </MigrationDecisionBlock>
      <MigrationDecisionBlock
        variant="proposed"
        title={`Proposed — @dt with surface=${dtSurface}`}
      >
        <DtSurfacePair surface={dtSurface} />
      </MigrationDecisionBlock>
    </MigrationDecisionBand>
  );
}

/**
 * Visual decision board: compare legacy shadcn CTAs vs naive @dt vs `surface` prop.
 * Open full-screen before migrating CTASection / HomeHero.
 */
export const CtaBands: Story = {
  render: () => (
    <MigrationDecisionPage
      title="Button surface decision board"
      lead={
        <>
          Decision: add <code>surface=&quot;onDark&quot; | &quot;onBrand&quot;</code> on @dt/Button
          (static CSS) for gradient bands rather than ad-hoc color inversion. More
          boards: Storybook → <strong>Design system / Migration boards</strong> → Review hub.
        </>
      }
    >
      {BANDS.map((band) => (
        <CtaBandPanel key={band.id} band={band} />
      ))}
    </MigrationDecisionPage>
  ),
};

/** Home hero: light HeroBackground (primary/20) — surface=default, not onDark */
export const HomeHeroBand: Story = {
  render: () => (
    <MigrationDecisionPage
      title="Home hero — HeroBackground colorScheme=primary (light)"
      lead={
        <>
          On light gradient heroes use <code>surface=default</code> only.{" "}
          <code>surface=onDark</code> is for dark CTA bands (see Cta Bands story).
        </>
      }
    >
      <MigrationDecisionBand
        title="Hero CTAs"
        className={cn(board.heroBandLight, "text-center text-foreground")}
      >
        <MigrationDecisionBlock
          variant="legacy"
          title="Legacy — shadcn default + outline"
          center
        >
          <ShadcnButton size="lg">Get in touch</ShadcnButton>
          <ShadcnButton variant="outline" size="lg">
            About us
          </ShadcnButton>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock
          variant="wrong"
          title="Wrong — surface=onDark (meant for dark CTA bands only)"
          center
        >
          <DtButton variant="primary" size="lg" surface="onDark">
            Get in touch
          </DtButton>
          <DtButton variant="secondary" size="lg" surface="onDark">
            About us
          </DtButton>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock
          variant="proposed"
          title="Correct — @dt primary + secondary, surface=default"
          center
        >
          <DtButton variant="primary" size="lg">
            Get in touch
          </DtButton>
          <DtButton variant="secondary" size="lg">
            About us
          </DtButton>
        </MigrationDecisionBlock>
      </MigrationDecisionBand>
    </MigrationDecisionPage>
  ),
};
