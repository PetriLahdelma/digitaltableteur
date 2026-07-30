"use client";

import React from "react";
import { ProcessBlock, Text, Title } from "@digitaltableteur/react";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import {
  SiNpm,
  SiReact,
  SiStorybook,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import styles from "./dsharpDesignSystem.module.css";

const HERO_LOGO = "/images/portfolio/dsharp-design-system/dsharp-hero-logo.svg";

const palette = {
  opalDark: "#577164",
  opalLight: "#aac6bd",
  ivory: "#e6ded0",
  rust: "#9a5635",
  black: "#292628",
  ink: "#1a1a1a",
  inkSubtle: "#6b6966",
  inkMuted: "#8a8784",
  surface: "#ffffff",
  surfaceRaised: "#f8f8f7",
  surfaceSunken: "#f2f1ef",
  border: "rgba(41, 38, 40, 0.12)",
  borderStrong: "rgba(41, 38, 40, 0.22)",
  layerSource: "#6c6c6c",
  layerSourceTint: "#f0f0f0",
  layerBronze: "#8a6144",
  layerBronzeTint: "#f5ede5",
  layerSilver: "#5e6c7c",
  layerSilverTint: "#eef1f4",
  layerGold: "#906909",
  layerGoldTint: "#fdf6e3",
  archMoment: "#9a5635",
  archMomentTint: "#f5e7df",
  archParty: "#577164",
  archPartyTint: "#eef3f1",
  archDescription: "#4a6f7c",
  archDescriptionTint: "#ebf0f3",
  archRole: "#a17a1d",
  archRoleTint: "#f8efd9",
  statusGood: "#2d7a4f",
  statusGoodTint: "#e8f5ed",
  statusReview: "#8a5408",
  statusReviewTint: "#fef3e0",
  statusInfo: "#2563eb",
  statusInfoTint: "#eff6ff",
} as const;

const FONT_SANS = '"DM Sans", "Inter", system-ui, -apple-system, sans-serif';
const FONT_MONO =
  '"DM Mono", "JetBrains Mono", "SF Mono", ui-monospace, monospace';

type BadgeProps = {
  x: number;
  y: number;
  label: string;
  bg: string;
  fg: string;
  width?: number;
  italic?: boolean;
  dot?: string | null;
};

function SvgBadge({
  x,
  y,
  label,
  bg,
  fg,
  width = 72,
  italic = false,
  dot = null,
}: BadgeProps) {
  const height = 22;
  const radius = 4;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={bg}
      />
      {dot ? <circle cx={x + 12} cy={y + height / 2} r={3} fill={dot} /> : null}
      <text
        x={dot ? x + 22 : x + width / 2}
        y={y + height / 2 + 4}
        textAnchor={dot ? "start" : "middle"}
        fill={fg}
        fontFamily={FONT_SANS}
        fontSize={11}
        fontWeight={500}
        fontStyle={italic ? "italic" : "normal"}
      >
        {label}
      </text>
    </g>
  );
}

function SpecimenCaption({
  x,
  y,
  label,
}: {
  x: number;
  y: number;
  label: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={palette.inkMuted}
      fontFamily={FONT_MONO}
      fontSize={10}
      letterSpacing="0.1em"
      style={{ textTransform: "uppercase" }}
    >
      {label}
    </text>
  );
}

function FoundationsSpecimen() {
  const colors = [
    ["brand/opal-dark", palette.opalDark],
    ["brand/opal-light", palette.opalLight],
    ["brand/ivory", palette.ivory],
    ["brand/rust", palette.rust],
    ["neutral/black", palette.black],
    ["surface/raised", palette.surfaceRaised],
  ] as const;

  const space = [4, 8, 12, 16, 24, 32, 48, 64, 128];

  return (
    <figure className={styles.specimenFigure}>
      <svg
        viewBox="0 0 880 520"
        role="img"
        aria-label="DSharp Design System foundations: color, typography, spacing"
        className={styles.specimenSvg}
      >
        <defs>
          <filter
            id="swatchElevation"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor="#1a1a1a"
              floodOpacity="0.12"
            />
          </filter>
        </defs>

        {/* Color row */}
        <g transform="translate(40, 36)">
          <SpecimenCaption x={0} y={0} label="Color · primitives" />
          {colors.map(([name, value], i) => {
            const x = i * 130;
            const needsElevation = name === "surface/raised";
            return (
              <g key={name} transform={`translate(${x}, 16)`}>
                <rect
                  x={0}
                  y={0}
                  width={110}
                  height={84}
                  rx={8}
                  fill={value}
                  filter={needsElevation ? "url(#swatchElevation)" : undefined}
                />
                <text
                  x={0}
                  y={108}
                  fill={palette.ink}
                  fontFamily={FONT_MONO}
                  fontSize={11}
                  fontWeight={500}
                >
                  {name}
                </text>
                <text
                  x={0}
                  y={122}
                  fill={palette.inkSubtle}
                  fontFamily={FONT_MONO}
                  fontSize={10}
                >
                  {value}
                </text>
              </g>
            );
          })}
        </g>

        {/* Typography */}
        <g transform="translate(40, 220)">
          <SpecimenCaption x={0} y={0} label="Type · DM Sans / DM Mono" />
          <text
            x={0}
            y={88}
            fill={palette.ink}
            fontFamily={FONT_SANS}
            fontSize={88}
            fontWeight={700}
            letterSpacing="-0.02em"
          >
            Aa
          </text>
          <g transform="translate(180, 42)">
            <text
              x={0}
              y={0}
              fill={palette.ink}
              fontFamily={FONT_SANS}
              fontSize={22}
              fontWeight={600}
            >
              Modeling beats decoration.
            </text>
            <text
              x={0}
              y={30}
              fill={palette.inkSubtle}
              fontFamily={FONT_SANS}
              fontSize={14}
            >
              Headings, body, captions, and mono share one type ramp.
            </text>
            <text
              x={0}
              y={56}
              fill={palette.opalDark}
              fontFamily={FONT_MONO}
              fontSize={12}
              fontWeight={500}
            >
              var(--font-sans){"  "}·{"  "}var(--font-mono)
            </text>
          </g>
        </g>

        {/* Space scale */}
        <g transform="translate(40, 380)">
          <SpecimenCaption x={0} y={0} label="Space · 14-step rhythm" />
          {space.map((value, i) => {
            const x = i * 88;
            return (
              <g key={value} transform={`translate(${x}, 18)`}>
                <rect
                  x={0}
                  y={48 - Math.min(value, 76)}
                  width={Math.min(value, 76) || 4}
                  height={Math.min(value, 76) || 4}
                  fill={palette.opalDark}
                  rx={2}
                />
                <text
                  x={0}
                  y={72}
                  fill={palette.ink}
                  fontFamily={FONT_MONO}
                  fontSize={11}
                  fontWeight={500}
                >
                  --space-{i + 1}
                </text>
                <text
                  x={0}
                  y={86}
                  fill={palette.inkSubtle}
                  fontFamily={FONT_MONO}
                  fontSize={10}
                >
                  {value}px
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption className={styles.specimenCaption}>
        Six brand primitives, one type ramp, and the 14-step space scale. The
        scale numbers are the same set Rhythmguard later enforces in lint, so
        the rhythm in the documentation and the rhythm in the code cannot drift
        apart.
      </figcaption>
    </figure>
  );
}

type ButtonProps = {
  x: number;
  y: number;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "link" | "danger" | "icon";
  state?: "default" | "hover" | "focus" | "disabled";
  size?: "sm" | "md" | "lg";
  withIcon?: boolean;
};

function SvgButton({
  x,
  y,
  label,
  variant = "primary",
  state = "default",
  size = "md",
  withIcon = false,
}: ButtonProps) {
  const dims =
    size === "sm"
      ? { h: 28, pad: 12, font: 12, radius: 6, iconBox: 28 }
      : size === "lg"
        ? { h: 40, pad: 18, font: 14, radius: 10, iconBox: 40 }
        : { h: 32, pad: 14, font: 13, radius: 8, iconBox: 32 };

  const approxWidth =
    variant === "icon"
      ? dims.iconBox
      : Math.max(72, label.length * (dims.font * 0.62) + dims.pad * 2) +
        (withIcon ? 7 : 0);

  let bg: string = palette.opalDark;
  let fg: string = "#ffffff";
  let stroke: string | null = null;
  let strokeWidth = 0;
  let opacity = 1;
  let textWeight = 600;

  if (variant === "primary") {
    bg =
      state === "hover"
        ? "#4a6358"
        : state === "focus"
          ? palette.opalDark
          : palette.opalDark;
    if (state === "disabled") {
      bg = palette.surfaceSunken;
      fg = palette.inkMuted;
      textWeight = 500;
    }
  } else if (variant === "secondary") {
    bg = state === "hover" ? palette.surfaceSunken : palette.surfaceRaised;
    fg = state === "disabled" ? palette.inkMuted : palette.ink;
    stroke = state === "disabled" ? palette.border : palette.borderStrong;
    strokeWidth = 1;
    textWeight = 500;
    if (state === "disabled") {
      bg = palette.surfaceRaised;
    }
  } else if (variant === "ghost") {
    bg = state === "hover" ? palette.surfaceRaised : "transparent";
    fg = state === "hover" ? palette.ink : palette.inkSubtle;
    textWeight = 500;
  } else if (variant === "link") {
    bg = "transparent";
    fg = palette.opalDark;
    textWeight = 500;
  } else if (variant === "danger") {
    bg = state === "hover" ? "#a83232" : "#c53030";
    fg = "#ffffff";
  } else if (variant === "icon") {
    bg = state === "hover" ? palette.surfaceSunken : palette.surfaceRaised;
    fg = palette.ink;
    stroke = palette.borderStrong;
    strokeWidth = 1;
  }

  if (state === "disabled" && variant !== "secondary") {
    opacity = 0.55;
  }

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      {state === "focus" ? (
        <rect
          x={-4}
          y={-4}
          width={approxWidth + 8}
          height={dims.h + 8}
          rx={dims.radius + 4}
          fill="none"
          stroke={palette.opalDark}
          strokeWidth={2}
          strokeOpacity={0.55}
        />
      ) : null}
      {variant === "link" ? (
        <text
          x={0}
          y={dims.h / 2 + dims.font / 3}
          fill={fg}
          fontFamily={FONT_SANS}
          fontSize={dims.font}
          fontWeight={textWeight}
          style={{
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            textDecorationThickness: "1px",
          }}
        >
          {label}
        </text>
      ) : (
        <>
          <rect
            x={0}
            y={0}
            width={approxWidth}
            height={dims.h}
            rx={dims.radius}
            fill={bg}
            stroke={stroke ?? "none"}
            strokeWidth={strokeWidth}
          />
          {variant === "icon" ? (
            <>
              <line
                x1={approxWidth / 2}
                y1={dims.h / 2 - 6}
                x2={approxWidth / 2}
                y2={dims.h / 2 + 6}
                stroke={fg}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
              <line
                x1={approxWidth / 2 - 6}
                y1={dims.h / 2}
                x2={approxWidth / 2 + 6}
                y2={dims.h / 2}
                stroke={fg}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {withIcon ? (
                <g transform={`translate(${dims.pad - 2}, ${dims.h / 2 - 6})`}>
                  <circle
                    cx={6}
                    cy={6}
                    r={5.5}
                    fill="none"
                    stroke={fg}
                    strokeWidth={1.5}
                  />
                  <line
                    x1={4}
                    y1={6}
                    x2={8}
                    y2={6}
                    stroke={fg}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                  <line
                    x1={6}
                    y1={4}
                    x2={6}
                    y2={8}
                    stroke={fg}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </g>
              ) : null}
              <text
                x={withIcon ? dims.pad + 14 : approxWidth / 2}
                y={dims.h / 2 + dims.font / 3}
                textAnchor={withIcon ? "start" : "middle"}
                fill={fg}
                fontFamily={FONT_SANS}
                fontSize={dims.font}
                fontWeight={textWeight}
              >
                {label}
              </text>
            </>
          )}
        </>
      )}
    </g>
  );
}

function AtomsSpecimen() {
  return (
    <figure className={styles.specimenFigure}>
      <svg
        viewBox="0 0 880 600"
        role="img"
        aria-label="DSharp Button atom: variants, sizes, and interaction states"
        className={styles.specimenSvg}
      >
        {/* Variants row */}
        <g transform="translate(48, 56)">
          <SpecimenCaption x={0} y={0} label="Button · variants" />
          <text
            x={0}
            y={22}
            fill={palette.inkSubtle}
            fontFamily={FONT_SANS}
            fontSize={13}
          >
            Six variants, one type ramp, one radius scale.
          </text>
          <g transform="translate(0, 48)">
            <SvgButton x={0} y={0} label="Promote" variant="primary" />
            <SvgButton x={132} y={0} label="Cancel" variant="secondary" />
            <SvgButton x={252} y={0} label="Inspect" variant="ghost" />
            <SvgButton x={372} y={0} label="View source" variant="link" />
            <SvgButton x={500} y={0} label="Drop layer" variant="danger" />
            <SvgButton x={628} y={0} label="" variant="icon" />
            <SvgButton
              x={684}
              y={0}
              label="New concept"
              variant="primary"
              withIcon
            />
          </g>
          <g transform="translate(0, 96)">
            {[
              { x: 0, label: "Primary" },
              { x: 132, label: "Secondary" },
              { x: 252, label: "Ghost" },
              { x: 372, label: "Link" },
              { x: 500, label: "Danger" },
              { x: 628, label: "Icon" },
              { x: 684, label: "Primary + icon" },
            ].map((item) => (
              <text
                key={item.label}
                x={item.x}
                y={0}
                fill={palette.inkMuted}
                fontFamily={FONT_MONO}
                fontSize={10}
                letterSpacing="0.06em"
              >
                {item.label}
              </text>
            ))}
          </g>
        </g>

        {/* Sizes row */}
        <g transform="translate(48, 264)">
          <SpecimenCaption x={0} y={0} label="Button · sizes" />
          <text
            x={0}
            y={22}
            fill={palette.inkSubtle}
            fontFamily={FONT_SANS}
            fontSize={13}
          >
            Heights snap to the space scale: 28 · 32 · 40.
          </text>
          <g transform="translate(0, 48)">
            <SvgButton x={0} y={6} label="Save" variant="primary" size="sm" />
            <SvgButton x={100} y={4} label="Save" variant="primary" size="md" />
            <SvgButton x={216} y={0} label="Save" variant="primary" size="lg" />
          </g>
          <g transform="translate(0, 102)">
            {[
              { x: 0, label: "sm · 28px" },
              { x: 100, label: "md · 32px" },
              { x: 216, label: "lg · 40px" },
            ].map((item) => (
              <text
                key={item.label}
                x={item.x}
                y={0}
                fill={palette.inkMuted}
                fontFamily={FONT_MONO}
                fontSize={10}
                letterSpacing="0.06em"
              >
                {item.label}
              </text>
            ))}
          </g>
        </g>

        {/* States row */}
        <g transform="translate(48, 432)">
          <SpecimenCaption x={0} y={0} label="Button · states" />
          <text
            x={0}
            y={22}
            fill={palette.inkSubtle}
            fontFamily={FONT_SANS}
            fontSize={13}
          >
            Every variant carries the same four states; focus uses the accent
            token, never the platform default.
          </text>
          <g transform="translate(0, 56)">
            <SvgButton
              x={0}
              y={0}
              label="Promote"
              variant="primary"
              state="default"
            />
            <SvgButton
              x={132}
              y={0}
              label="Promote"
              variant="primary"
              state="hover"
            />
            <SvgButton
              x={264}
              y={0}
              label="Promote"
              variant="primary"
              state="focus"
            />
            <SvgButton
              x={396}
              y={0}
              label="Promote"
              variant="primary"
              state="disabled"
            />
          </g>
          <g transform="translate(0, 108)">
            {[
              { x: 0, label: "Default" },
              { x: 132, label: "Hover" },
              { x: 264, label: "Focus" },
              { x: 396, label: "Disabled" },
            ].map((item) => (
              <text
                key={item.label}
                x={item.x}
                y={0}
                fill={palette.inkMuted}
                fontFamily={FONT_MONO}
                fontSize={10}
                letterSpacing="0.06em"
              >
                {item.label}
              </text>
            ))}
          </g>
        </g>
      </svg>
      <figcaption className={styles.specimenCaption}>
        Button is the load-bearing atom in any system: six variants, three
        sizes, four states, all driven from the same tokens. DSharp&rsquo;s
        domain semantics, <code>LayerBadge</code>, <code>QualityBadge</code>,{" "}
        <code>ArchetypeBadge</code>, and <code>ModeSwitch</code>, sit alongside
        as separate atoms with closed string-literal unions rather than variants
        of a generic Badge.
      </figcaption>
    </figure>
  );
}

function MoleculesSpecimen() {
  const tableRows = [
    {
      name: "Customer",
      layer: "silver",
      quality: "review",
      layerColor: palette.layerSilver,
      layerTint: palette.layerSilverTint,
      qualityColor: palette.statusReview,
      qualityTint: palette.statusReviewTint,
    },
    {
      name: "Order",
      layer: "gold",
      quality: "good",
      layerColor: palette.layerGold,
      layerTint: palette.layerGoldTint,
      qualityColor: palette.statusGood,
      qualityTint: palette.statusGoodTint,
    },
    {
      name: "Product",
      layer: "bronze",
      quality: "raw",
      layerColor: palette.layerBronze,
      layerTint: palette.layerBronzeTint,
      qualityColor: palette.inkSubtle,
      qualityTint: palette.surfaceSunken,
    },
  ];

  return (
    <figure className={styles.specimenFigure}>
      <svg
        viewBox="0 0 880 432"
        role="img"
        aria-label="DSharp molecules: Alert, Tabs, FormField, and a Table composed from domain atoms"
        className={styles.specimenSvg}
      >
        {/* Alert */}
        <g transform="translate(48, 48)">
          <SpecimenCaption x={0} y={0} label="Alert · warning" />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={384}
              height={112}
              rx={12}
              fill={palette.statusReviewTint}
            />
            <rect
              x={0}
              y={0}
              width={4}
              height={112}
              rx={2}
              fill={palette.statusReview}
            />
            <g transform="translate(20, 22)">
              <circle cx={10} cy={10} r={10} fill={palette.statusReview} />
              <line
                x1={10}
                y1={5}
                x2={10}
                y2={11}
                stroke="#fff"
                strokeWidth={1.6}
                strokeLinecap="round"
              />
              <circle cx={10} cy={14} r={1} fill="#fff" />
            </g>
            <text
              x={56}
              y={36}
              fill={palette.ink}
              fontFamily={FONT_SANS}
              fontSize={14}
              fontWeight={600}
            >
              Mapping review required
            </text>
            <text
              x={56}
              y={58}
              fill={palette.inkSubtle}
              fontFamily={FONT_SANS}
              fontSize={13}
            >
              3 columns need confirmation before promotion.
            </text>
            <SvgButton
              x={56}
              y={74}
              label="Open review"
              variant="primary"
              size="sm"
            />
            <SvgButton
              x={172}
              y={74}
              label="Dismiss"
              variant="ghost"
              size="sm"
            />
          </g>
        </g>

        {/* Tabs */}
        <g transform="translate(472, 48)">
          <SpecimenCaption x={0} y={0} label="Tabs · contextual navigation" />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={384}
              height={112}
              rx={12}
              fill={palette.surface}
              stroke={palette.border}
            />
            <g transform="translate(24, 32)">
              {["Definition", "Sources", "Lineage", "Mappings"].map(
                (label, i) => {
                  const x = i * 80;
                  const active = i === 0;
                  return (
                    <g key={label}>
                      <text
                        x={x}
                        y={0}
                        fill={active ? palette.ink : palette.inkSubtle}
                        fontFamily={FONT_SANS}
                        fontSize={13}
                        fontWeight={active ? 600 : 500}
                      >
                        {label}
                      </text>
                      {active ? (
                        <rect
                          x={x - 6}
                          y={14}
                          width={64}
                          height={2}
                          rx={1}
                          fill={palette.opalDark}
                        />
                      ) : null}
                    </g>
                  );
                },
              )}
              <line
                x1={-24}
                y1={16}
                x2={360}
                y2={16}
                stroke={palette.border}
                strokeWidth={1}
              />
            </g>
            <text
              x={24}
              y={84}
              fill={palette.inkMuted}
              fontFamily={FONT_MONO}
              fontSize={10}
              letterSpacing="0.06em"
            >
              role=&quot;tablist&quot; · roving focus · arrow-key nav
            </text>
          </g>
        </g>

        {/* FormField */}
        <g transform="translate(48, 240)">
          <SpecimenCaption
            x={0}
            y={0}
            label="FormField · label, control, helper"
          />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={384}
              height={156}
              rx={12}
              fill={palette.surface}
              stroke={palette.border}
            />
            <g transform="translate(24, 28)">
              <text
                x={0}
                y={0}
                fill={palette.ink}
                fontFamily={FONT_SANS}
                fontSize={13}
                fontWeight={600}
              >
                Layer
              </text>
              <text
                x={36}
                y={0}
                fill={palette.archMoment}
                fontFamily={FONT_SANS}
                fontSize={13}
                fontWeight={600}
              >
                *
              </text>
              <text
                x={0}
                y={18}
                fill={palette.inkSubtle}
                fontFamily={FONT_SANS}
                fontSize={12}
              >
                Promote only validated concepts.
              </text>
              <g transform="translate(0, 32)">
                <rect
                  x={0}
                  y={0}
                  width={336}
                  height={36}
                  rx={8}
                  fill={palette.surface}
                  stroke={palette.opalDark}
                  strokeWidth={1.5}
                />
                <SvgBadge
                  x={12}
                  y={7}
                  label="silver"
                  bg={palette.layerSilverTint}
                  fg={palette.layerSilver}
                  dot={palette.layerSilver}
                  width={76}
                />
                <path
                  d="M 314 14 L 318 18 L 322 14"
                  fill="none"
                  stroke={palette.inkSubtle}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <text
                x={0}
                y={92}
                fill={palette.statusReview}
                fontFamily={FONT_SANS}
                fontSize={12}
              >
                Requires owner sign-off before gold promotion.
              </text>
            </g>
          </g>
        </g>

        {/* Table */}
        <g transform="translate(472, 240)">
          <SpecimenCaption x={0} y={0} label="Table · composing the atoms" />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={384}
              height={156}
              rx={12}
              fill={palette.surface}
              stroke={palette.border}
            />
            <rect
              x={0}
              y={0}
              width={384}
              height={32}
              fill={palette.surfaceRaised}
            />
            <rect
              x={0}
              y={0}
              width={12}
              height={32}
              fill={palette.surfaceRaised}
            />
            <line
              x1={0}
              y1={32}
              x2={384}
              y2={32}
              stroke={palette.border}
              strokeWidth={1}
            />
            <text
              x={24}
              y={20}
              fill={palette.inkMuted}
              fontFamily={FONT_MONO}
              fontSize={10}
              letterSpacing="0.08em"
            >
              CONCEPT
            </text>
            <text
              x={192}
              y={20}
              fill={palette.inkMuted}
              fontFamily={FONT_MONO}
              fontSize={10}
              letterSpacing="0.08em"
            >
              LAYER
            </text>
            <text
              x={296}
              y={20}
              fill={palette.inkMuted}
              fontFamily={FONT_MONO}
              fontSize={10}
              letterSpacing="0.08em"
            >
              QUALITY
            </text>
            {tableRows.map((row, i) => {
              const y = 32 + i * 40;
              return (
                <g key={row.name}>
                  {i > 0 ? (
                    <line
                      x1={24}
                      y1={y}
                      x2={360}
                      y2={y}
                      stroke={palette.border}
                      strokeWidth={1}
                    />
                  ) : null}
                  <text
                    x={24}
                    y={y + 24}
                    fill={palette.ink}
                    fontFamily={FONT_SANS}
                    fontSize={13}
                    fontWeight={500}
                  >
                    {row.name}
                  </text>
                  <SvgBadge
                    x={192}
                    y={y + 11}
                    label={row.layer}
                    bg={row.layerTint}
                    fg={row.layerColor}
                    dot={row.layerColor}
                    width={84}
                  />
                  <SvgBadge
                    x={296}
                    y={y + 11}
                    label={row.quality}
                    bg={row.qualityTint}
                    fg={row.qualityColor}
                    width={72}
                  />
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      <figcaption className={styles.specimenCaption}>
        Molecules combine atoms without inventing a second palette. The table
        composes <code>LayerBadge</code> and <code>QualityBadge</code> instead
        of restyling them; the form field uses the same primary accent the
        button uses; the alert pulls from the same status tokens.
      </figcaption>
    </figure>
  );
}

function ConceptCardNode({
  x,
  y,
  title,
  archetype,
  archetypeColor,
  archetypeTint,
  attrs,
  emphasized = false,
  width = 192,
}: {
  x: number;
  y: number;
  title: string;
  archetype: string;
  archetypeColor: string;
  archetypeTint: string;
  attrs: { label: string; type: string; key?: boolean }[];
  emphasized?: boolean;
  width?: number;
}) {
  const height = 36 + attrs.length * 22 + 12;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={10}
        fill={palette.surface}
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={30}
        rx={10}
        fill={archetypeTint}
      />
      <rect x={0} y={22} width={width} height={8} fill={archetypeTint} />
      <text
        x={14}
        y={20}
        fill={palette.ink}
        fontFamily={FONT_SANS}
        fontSize={13}
        fontWeight={700}
      >
        {title}
      </text>
      <text
        x={width - 14}
        y={20}
        textAnchor="end"
        fill={archetypeColor}
        fontFamily={FONT_MONO}
        fontSize={10}
        letterSpacing="0.04em"
      >
        {archetype}
      </text>
      {attrs.map((attr, i) => {
        const cy = 50 + i * 22;
        return (
          <g key={attr.label}>
            <text
              x={14}
              y={cy}
              fill={palette.ink}
              fontFamily={FONT_MONO}
              fontSize={11}
              fontWeight={attr.key ? 600 : 400}
            >
              {attr.label}
            </text>
            {attr.key ? (
              <g
                transform={`translate(${14 + attr.label.length * 7 + 6}, ${cy - 10})`}
              >
                <rect
                  x={0}
                  y={0}
                  width={20}
                  height={12}
                  rx={3}
                  fill={palette.opalDark}
                />
                <text
                  x={10}
                  y={9}
                  textAnchor="middle"
                  fill="#fff"
                  fontFamily={FONT_MONO}
                  fontSize={8}
                  fontWeight={700}
                  letterSpacing="0.04em"
                >
                  PK
                </text>
              </g>
            ) : null}
            <text
              x={width - 14}
              y={cy}
              textAnchor="end"
              fill={palette.inkSubtle}
              fontFamily={FONT_MONO}
              fontSize={11}
            >
              {attr.type}
            </text>
          </g>
        );
      })}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={10}
        fill="none"
        stroke={emphasized ? archetypeColor : palette.border}
        strokeWidth={emphasized ? 1.5 : 1}
      />
    </g>
  );
}

function OrganismsSpecimen() {
  const layerNav = [
    {
      name: "Source",
      count: 117,
      color: palette.layerSource,
      tint: palette.layerSourceTint,
      active: false,
    },
    {
      name: "Bronze",
      count: 42,
      color: palette.layerBronze,
      tint: palette.layerBronzeTint,
      active: false,
    },
    {
      name: "Silver",
      count: 18,
      color: palette.layerSilver,
      tint: palette.layerSilverTint,
      active: true,
    },
    {
      name: "Gold",
      count: 6,
      color: palette.layerGold,
      tint: palette.layerGoldTint,
      active: false,
    },
  ];

  return (
    <figure className={styles.specimenFigure}>
      <svg
        viewBox="0 0 880 856"
        role="img"
        aria-label="DSharp organisms: LayerNav, ConceptCard, AIToolbar, and the ConceptDiagram canvas"
        className={styles.specimenSvg}
      >
        {/* LayerNav */}
        <g transform="translate(48, 48)">
          <SpecimenCaption x={0} y={0} label="LayerNav · medallion sidebar" />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={236}
              height={332}
              rx={12}
              fill={palette.surfaceRaised}
              stroke={palette.border}
            />
            <text
              x={20}
              y={28}
              fill={palette.inkMuted}
              fontFamily={FONT_MONO}
              fontSize={10}
              letterSpacing="0.08em"
            >
              LAYERS
            </text>
            {layerNav.map((row, i) => {
              const y = 48 + i * 56;
              return (
                <g key={row.name}>
                  {row.active ? (
                    <rect
                      x={8}
                      y={y - 6}
                      width={220}
                      height={48}
                      rx={8}
                      fill={palette.surface}
                      stroke={palette.opalDark}
                      strokeWidth={1.5}
                    />
                  ) : null}
                  <circle cx={26} cy={y + 18} r={5} fill={row.color} />
                  <text
                    x={42}
                    y={y + 16}
                    fill={palette.ink}
                    fontFamily={FONT_SANS}
                    fontSize={13}
                    fontWeight={row.active ? 600 : 500}
                  >
                    {row.name}
                  </text>
                  <text
                    x={42}
                    y={y + 32}
                    fill={palette.inkSubtle}
                    fontFamily={FONT_SANS}
                    fontSize={11}
                  >
                    {row.count} tables
                  </text>
                  <rect
                    x={184}
                    y={y + 7}
                    width={36}
                    height={22}
                    rx={6}
                    fill={row.tint}
                  />
                  <text
                    x={202}
                    y={y + 22}
                    textAnchor="middle"
                    fill={row.color}
                    fontFamily={FONT_MONO}
                    fontSize={11}
                    fontWeight={600}
                  >
                    {row.count}
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* ConceptCard */}
        <g transform="translate(316, 48)">
          <SpecimenCaption x={0} y={0} label="ConceptCard · archetype tint" />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={252}
              height={332}
              rx={12}
              fill={palette.surface}
            />
            <rect
              x={0}
              y={0}
              width={252}
              height={64}
              rx={12}
              fill={palette.archPartyTint}
            />
            <rect
              x={0}
              y={54}
              width={252}
              height={10}
              fill={palette.archPartyTint}
            />
            <text
              x={20}
              y={28}
              fill={palette.archParty}
              fontFamily={FONT_MONO}
              fontSize={10}
              fontWeight={600}
              letterSpacing="0.1em"
            >
              PARTY
            </text>
            <text
              x={20}
              y={50}
              fill={palette.ink}
              fontFamily={FONT_SANS}
              fontSize={18}
              fontWeight={700}
            >
              Customer
            </text>
            <text
              x={20}
              y={90}
              fill={palette.inkSubtle}
              fontFamily={FONT_SANS}
              fontSize={12}
            >
              A person or organisation that orders.
            </text>
            <line
              x1={20}
              y1={110}
              x2={232}
              y2={110}
              stroke={palette.border}
              strokeWidth={1}
            />
            {[
              { label: "id", type: "binary(32)", key: true },
              { label: "name", type: "string", key: false },
              { label: "email", type: "string", key: false },
              { label: "since", type: "date", key: false },
            ].map((attr, i) => {
              const y = 134 + i * 28;
              return (
                <g key={attr.label}>
                  <text
                    x={20}
                    y={y}
                    fill={palette.ink}
                    fontFamily={FONT_MONO}
                    fontSize={12}
                    fontWeight={attr.key ? 600 : 400}
                  >
                    {attr.label}
                  </text>
                  {attr.key ? (
                    <g transform={`translate(40, ${y - 11})`}>
                      <rect
                        x={0}
                        y={0}
                        width={22}
                        height={14}
                        rx={3}
                        fill={palette.opalDark}
                      />
                      <text
                        x={11}
                        y={10}
                        textAnchor="middle"
                        fill="#fff"
                        fontFamily={FONT_MONO}
                        fontSize={9}
                        fontWeight={700}
                      >
                        PK
                      </text>
                    </g>
                  ) : null}
                  <text
                    x={232}
                    y={y}
                    textAnchor="end"
                    fill={palette.inkSubtle}
                    fontFamily={FONT_MONO}
                    fontSize={11}
                  >
                    {attr.type}
                  </text>
                </g>
              );
            })}
            <line
              x1={20}
              y1={272}
              x2={232}
              y2={272}
              stroke={palette.border}
              strokeWidth={1}
            />
            <g transform="translate(20, 290)">
              <text
                x={0}
                y={14}
                fill={palette.inkMuted}
                fontFamily={FONT_MONO}
                fontSize={10}
                letterSpacing="0.06em"
              >
                3 relations
              </text>
              <text
                x={0}
                y={28}
                fill={palette.inkMuted}
                fontFamily={FONT_MONO}
                fontSize={10}
                letterSpacing="0.06em"
              >
                8,912 rows
              </text>
            </g>
            <SvgBadge
              x={150}
              y={300}
              label="silver"
              bg={palette.layerSilverTint}
              fg={palette.layerSilver}
              dot={palette.layerSilver}
              width={68}
            />
            <rect
              x={0}
              y={0}
              width={252}
              height={332}
              rx={12}
              fill="none"
              stroke={palette.opalDark}
              strokeWidth={1.5}
            />
          </g>
        </g>

        {/* Inspector */}
        <g transform="translate(600, 48)">
          <SpecimenCaption x={0} y={0} label="Inspector · contract pane" />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={232}
              height={332}
              rx={12}
              fill={palette.surfaceRaised}
              stroke={palette.border}
            />
            <text
              x={20}
              y={28}
              fill={palette.ink}
              fontFamily={FONT_SANS}
              fontSize={13}
              fontWeight={600}
            >
              Customer.contract
            </text>
            <text
              x={20}
              y={46}
              fill={palette.inkMuted}
              fontFamily={FONT_MONO}
              fontSize={10}
              letterSpacing="0.06em"
            >
              tier: atom · group: domain
            </text>
            <line
              x1={20}
              y1={62}
              x2={212}
              y2={62}
              stroke={palette.border}
              strokeWidth={1}
            />
            {[
              ["variants", "primary / ghost"],
              ["slots", "label · helper"],
              ["asChild", "true"],
              ["a11y.reviewed", "true"],
              ["tokens.declared", "12"],
              ["stories.required", "5 / 5"],
              ["status", "stable"],
              ["figma", "EVr7qLFN..."],
            ].map(([key, value], i) => {
              const y = 84 + i * 24;
              return (
                <g key={key}>
                  <text
                    x={20}
                    y={y}
                    fill={palette.inkSubtle}
                    fontFamily={FONT_MONO}
                    fontSize={11}
                  >
                    {key}
                  </text>
                  <text
                    x={212}
                    y={y}
                    textAnchor="end"
                    fill={palette.ink}
                    fontFamily={FONT_MONO}
                    fontSize={11}
                    fontWeight={500}
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* AIToolbar */}
        <g transform="translate(48, 440)">
          <SpecimenCaption
            x={0}
            y={0}
            label="AIToolbar · scoped agent actions"
          />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={784}
              height={64}
              rx={12}
              fill="rgba(87, 113, 100, 0.06)"
              stroke="rgba(87, 113, 100, 0.22)"
            />
            <g transform="translate(20, 18)">
              <rect
                x={0}
                y={0}
                width={36}
                height={28}
                rx={6}
                fill={palette.opalDark}
              />
              <text
                x={18}
                y={19}
                textAnchor="middle"
                fill="#fff"
                fontFamily={FONT_MONO}
                fontSize={11}
                fontWeight={700}
                letterSpacing="0.1em"
              >
                AI
              </text>
            </g>
            {[
              "Classify columns",
              "Suggest mapping",
              "Promote to silver",
              "Explain lineage",
            ].map((action, i) => {
              const x = 76 + i * 148;
              return (
                <g key={action}>
                  <rect
                    x={x}
                    y={18}
                    width={136}
                    height={28}
                    rx={6}
                    fill={palette.surface}
                    stroke={palette.border}
                  />
                  <text
                    x={x + 68}
                    y={36}
                    textAnchor="middle"
                    fill={palette.ink}
                    fontFamily={FONT_SANS}
                    fontSize={12}
                    fontWeight={500}
                  >
                    {action}
                  </text>
                </g>
              );
            })}
            <g transform="translate(689, 18)">
              <circle cx={6} cy={14} r={4} fill={palette.statusGood} />
              <text
                x={16}
                y={18}
                fill={palette.inkSubtle}
                fontFamily={FONT_MONO}
                fontSize={11}
              >
                2 running
              </text>
            </g>
          </g>
        </g>

        {/* ConceptDiagram */}
        <g transform="translate(48, 564)">
          <SpecimenCaption x={0} y={0} label="ConceptDiagram · ER canvas" />
          <g transform="translate(0, 24)">
            <rect
              x={0}
              y={0}
              width={784}
              height={232}
              rx={12}
              fill={palette.surfaceRaised}
              stroke={palette.border}
            />
            {/* dotted background grid */}
            {Array.from({ length: 8 }).map((_, gx) =>
              Array.from({ length: 4 }).map((_, gy) => (
                <circle
                  key={`g${gx}-${gy}`}
                  cx={48 + gx * 96}
                  cy={36 + gy * 48}
                  r={1}
                  fill="rgba(41, 38, 40, 0.08)"
                />
              )),
            )}
            <ConceptCardNode
              x={32}
              y={48}
              title="Person"
              archetype="party"
              archetypeColor={palette.archParty}
              archetypeTint={palette.archPartyTint}
              attrs={[
                { label: "id", type: "int", key: true },
                { label: "name", type: "string" },
                { label: "dob", type: "date" },
              ]}
            />
            <ConceptCardNode
              x={296}
              y={48}
              title="Membership"
              archetype="moment"
              archetypeColor={palette.archMoment}
              archetypeTint={palette.archMomentTint}
              emphasized
              attrs={[
                { label: "id", type: "int", key: true },
                { label: "start", type: "date" },
                { label: "end", type: "date" },
              ]}
            />
            <ConceptCardNode
              x={560}
              y={48}
              title="Project"
              archetype="description"
              archetypeColor={palette.archDescription}
              archetypeTint={palette.archDescriptionTint}
              attrs={[
                { label: "id", type: "int", key: true },
                { label: "code", type: "string" },
                { label: "name", type: "string" },
              ]}
            />
            {/* Connectors */}
            <path
              d="M 224 104 C 252 104, 268 104, 296 104"
              fill="none"
              stroke={palette.inkSubtle}
              strokeWidth={1.25}
            />
            <path
              d="M 488 104 C 516 104, 532 104, 560 104"
              fill="none"
              stroke={palette.inkSubtle}
              strokeWidth={1.25}
            />
          </g>
        </g>
      </svg>
      <figcaption className={styles.specimenCaption}>
        Every organism reads the same domain semantics. LayerNav surfaces the
        medallion layers; ConceptCard tints by archetype; the Inspector renders
        the manifest the validator and AI agents both read; the ConceptDiagram
        lays the same archetypes out as an ER canvas. DSharp owns the visual
        language; library code, TanStack Table and xyflow, owns the interaction
        mechanics.
      </figcaption>
    </figure>
  );
}

export function DSharpDesignSystemPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("dsharp-design-system");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title="DSharp Design System"
          description="The shared UI substrate for a multi-product data-modelling platform: three packages, a contract per component, and domain semantics encoded as atoms instead of styling variants."
          image={{
            src: HERO_LOGO,
            alt: "DSharp logo on the opal-and-ivory brand field",
            width: 1800,
            height: 896,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="April 2026–Present"
          liveUrl={project.liveUrl}
          variant="contained"
          showScrollIndicator={true}
          className="pb-16 tablet:pb-20 desktop:pb-24"
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      {/* Meta */}
      <section className={styles.metaSection}>
        <div className={styles.metaGrid}>
          <div className={styles.metaLeft}>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Client</Title>
              <p className={styles.metaText}>
                DSharp, a Finnish data-modelling platform shipping DSharp
                Studio, PathFinder, and the new DSharp Scout.
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Type</Title>
              <p className={styles.metaText}>
                AI-native product design system. Three layered packages,
                contract-per-component, enforced spacing.
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Stack</Title>
              <div className={styles.metaTools}>
                <SiReact size={22} title="React 19" />
                <SiTypescript size={22} title="TypeScript 5" />
                <SiTailwindcss size={22} title="Tailwind 4" />
                <SiStorybook size={22} title="Storybook 10" />
                <SiNpm size={22} title="Published to Azure Artifacts" />
              </div>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Distribution</Title>
              <p className={styles.metaText}>
                Five npm packages, <code>@dsharp/tokens</code>,{" "}
                <code>@dsharp/tokens-css</code>, <code>@dsharp/react</code>,{" "}
                <code>@dsharp/cli</code>, and <code>@dsharp/mcp</code>, on a
                scoped Azure Artifacts feed. The MCP server exposes component
                contracts to AI agents; the CLI scaffolds and validates
                components against them.
              </p>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>Brief</Title>
            <p className={styles.metaOverview}>
              DSharp ships products to a broad customer base in Finland and
              internationally: DSharp Studio, a model-first desktop app
              maintained since 2006; PathFinder, its data-discovery sibling; and
              DSharp Scout, the new web product under active development. Each
              product had been built by its own team, with its own components,
              its own spacing, and its own colour tokens. Migrations between
              them rebuilt the same primitives. Visual polish regressed every
              release.
            </p>
            <p className={styles.metaOverview}>
              The brief was a shared design system. The constraints made it not
              a standard one. Scout was being built in parallel with the system
              itself. Studio was being modularised to consume the same
              components inside its desktop shell. A Windows target sat on the
              roadmap. And AI generation was expected to be a first-class
              consumer of the system, not an experiment on the side.
            </p>
          </div>
        </div>
      </section>

      {/* Approach */}
      <ProcessBlock
        phases={[
          {
            title: "Contracts",
            activities: [
              "Four files per component",
              "Scaffolder, never hand-written",
              "Validator pre-push",
              "Status lifecycle gates",
            ],
          },
          {
            title: "Tokens",
            activities: [
              "DTCG JSON as Layer 0",
              "Style Dictionary transforms",
              "Semantic palettes per mode",
              "14-step space scale",
            ],
          },
          {
            title: "Atomic structure",
            activities: [
              "Domain semantics as atoms",
              "Molecules combine atoms",
              "Workbench-shaped organisms",
              "CVA variants + Radix primitives",
            ],
          },
          {
            title: "Patterns & templates",
            activities: [
              "Layout primitives",
              "Product workflow templates",
              "Headless mechanics, owned visual",
              "Rhythmguard closes the gap",
            ],
          },
        ]}
        sectionTitle="Approach"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        columns={4}
      />

      {/* Tokens before components */}
      <StoryBlock
        subtitle="Tokens before components"
        title="Base layer is platform-agnostic JSON"
        content={[
          <Text key="1" size="s">
            The first commitment was that the brand, the rhythm, and the
            semantic palettes had to exist before the first button. The tokens
            ship as W3C DTCG JSON in <code>@dsharp/tokens</code> with no runtime
            dependencies; Style Dictionary transforms them into CSS custom
            properties and typed TypeScript constants for the web in{" "}
            <code>@dsharp/tokens-css</code>. A Windows or mobile target later
            becomes a sibling transform package, not a fork of the source.
          </Text>,
          <Text key="2" size="s">
            An early lesson came from the logo atom. Its first version bound the
            mark to a primitive brand token, which flattened it when the surface
            inverted in dark mode; DTCG primitives, by design, do not
            theme-switch. The fix was a dedicated semantic alias that resolves
            per mode, and a rule that travelled with it: brand-as-decoration
            uses primitives, brand-as-content uses semantics.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      <GridBlock
        columns={1}
        gap="none"
        backgroundColor="light"
        maxWidth="lg"
        spacing="compact"
        cells={[
          {
            type: "text",
            content: <FoundationsSpecimen />,
            innerPadding: false,
          },
        ]}
      />

      {/* The medallion problem */}
      <StoryBlock
        subtitle="The medallion problem"
        title="Domain vocabulary belongs in the type system"
        content={[
          <Text key="1" size="s">
            DSharp&rsquo;s data work is organised around two closed
            vocabularies. The medallion architecture sorts every table into one
            of four layers, <code>source</code>, <code>bronze</code>,{" "}
            <code>silver</code>, or <code>gold</code>, depending on how far it
            has moved from raw ingest. Every concept is one of four archetypes,{" "}
            <code>moment</code>, <code>party</code>, <code>description</code>,
            or <code>role</code>. These show up in tables, navigation, diagrams,
            mapping screens, and forty-odd other surfaces.
          </Text>,
          <Text key="2" size="s">
            The shortest path would have been a generic <code>Badge</code> with{" "}
            <code>variant=&ldquo;bronze&rdquo;</code>. The longer path we took
            was <code>LayerBadge</code>, <code>QualityBadge</code>, and{" "}
            <code>ArchetypeBadge</code> as separate atoms with string-literal
            unions. The type system refuses unknown values, the validator
            confirms every variant is covered by a story, and downstream AI
            agents have one authoritative source for what <code>bronze</code>{" "}
            means and where it can appear.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      <GridBlock
        columns={1}
        gap="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="compact"
        cells={[
          { type: "text", content: <AtomsSpecimen />, innerPadding: false },
        ]}
      />

      {/* A contract for AI to read */}
      <StoryBlock
        subtitle="A contract per component"
        title="The file AI agents read"
        content={[
          <Text key="1" size="s">
            Every component in <code>@dsharp/react</code> ships four files: the
            React source, a JSON manifest, a markdown spec, and Storybook
            stories. The manifest is the file built for agents. It declares the
            component&rsquo;s tier and group, its variants and slots, the
            stories that must exist, the tokens it is allowed to reference, and
            its accessibility-review state. A scaffolder generates all four
            files pre-wired; the team rule is that no component is ever
            hand-written.
          </Text>,
          <Text key="2" size="s">
            A validator runs on every push and on every CI build. It enforces
            parity between the CVA variant definition and the manifest, story
            coverage for every declared variant, and a status lifecycle that
            gates promotion: <code>beta</code> requires a Figma URL,{" "}
            <code>stable</code> requires accessibility review. The contract is
            also what made it possible to add Rhythmguard alongside the system
            instead of after; once allowed tokens are listed in the manifest,
            the linter has a closed set to check against.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      <GridBlock
        columns={1}
        gap="none"
        backgroundColor="light"
        maxWidth="lg"
        spacing="compact"
        cells={[
          { type: "text", content: <MoleculesSpecimen />, innerPadding: false },
        ]}
      />

      {/* Composition continues: organisms */}
      <StoryBlock
        subtitle="Composition, continued"
        title="Organisms encode the work, not the page"
        content={[
          <Text key="1" size="s">
            Scout is a task-based workbench rather than a CRUD app, which puts
            more weight on the organism layer than on the templates above it.
            LayerNav, ConceptCard, Inspector, AIToolbar, MappingGrid,
            ConceptDiagram, and LineageGraph carry across every modelling
            surface because they encode the work, not the page. A modelling
            template assembles a sidebar, a canvas, an inspector, and a toolbar;
            a refinement template assembles the same parts in a different
            proportion.
          </Text>,
          <Text key="2" size="s">
            Inside the heavier organisms, the work split is DSharp-owned visual,
            library-owned mechanics. DataTable wraps TanStack Table;
            ConceptDiagram and LineageGraph wrap <code>@xyflow/react</code>. The
            headless libraries handle sorting, virtualisation, node dragging,
            and edge routing. DSharp owns the typography, the badge composition,
            the archetype tints, and the focus rules. The split keeps the system
            small without rebuilding solved problems.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      <GridBlock
        columns={1}
        gap="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="compact"
        cells={[
          { type: "text", content: <OrganismsSpecimen />, innerPadding: false },
        ]}
      />

      {/* Closing the composition gap */}
      <GridBlock
        columns={1}
        gap="none"
        backgroundColor="light"
        maxWidth="lg"
        spacing="compact"
        cells={[
          {
            type: "image",
            src: "/images/portfolio/dsharp-design-system/rhythmguard-spec@2x.png",
            alt: "Rhythmguard spacing spec sheet showing the 14-step space scale",
            width: 1920,
            height: 360,
          },
        ]}
      />

      <StoryBlock
        subtitle="Closing the gap"
        title="Where the rhythm could still leak"
        content={[
          <Text key="1" size="s">
            One discipline did not survive the move from tokens to composition.{" "}
            <a className={styles.inlineLink} href="/work/rhythmguard">
              Rhythmguard
            </a>
            , the Stylelint plugin built alongside the system, enforces the
            14-step space scale in CSS declarations and Tailwind class strings.
            It rejects off-scale literals on padding, margin, gap, inset, and
            transform translations, and autofixes to the nearest valid step. The
            values in the spec sheet and the values in the code stay in
            agreement.
          </Text>,
          <Text key="2" size="s">
            Stylelint cannot reach JSX inline styles or Tailwind arbitrary
            brackets, so spacing could still leak through composition. The
            answer was a small set of layout primitives, <code>Stack</code>,{" "}
            <code>Row</code>, <code>Grid</code>, and <code>Container</code>,
            that take space-scale tokens as props rather than arbitrary numbers.
            With the lint rule on the styling side and the primitives on the
            composition side, the rhythm has no path left to drift.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Outcome */}
      <GridBlock
        columns={2}
        gap="none"
        maxWidth="lg"
        spacing="comfortable"
        backgroundColor="light"
        cells={[
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">112+ components</Text>
                <Text size="s">
                  Across five tiers: atoms, molecules, organisms, patterns,
                  templates. Each under the same four-file contract.
                </Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">5 packages</Text>
                <Text size="s">
                  <code>@dsharp/tokens</code>, <code>@dsharp/tokens-css</code>,{" "}
                  <code>@dsharp/react</code>, <code>@dsharp/cli</code>, and{" "}
                  <code>@dsharp/mcp</code>. Published on a project-scoped Azure
                  Artifacts feed.
                </Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">2 consumer apps</Text>
                <Text size="s">
                  Scout renders organisms from <code>@dsharp/react</code> in its
                  UI shell. Studio consumes the same package inside its desktop
                  surface. PathFinder is porting in, view by view.
                </Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">0.1.0 -&gt; 0.59.0</Text>
                <Text size="s">First packaged release shipped April 2026.</Text>
              </>
            ),
          },
        ]}
      />
    </ProjectDetailLayout>
  );
}
