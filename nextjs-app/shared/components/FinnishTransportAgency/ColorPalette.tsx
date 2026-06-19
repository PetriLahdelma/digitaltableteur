"use client";

import React from "react";
import Image from "next/image";
import Text from "@dt/Text";
import styles from "./ColorPalette.module.css";

interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  pantone?: string;
}

const primaryColors: ColorSwatch[] = [
  {
    name: "Process Blue",
    hex: "#0088CE",
    rgb: "0 / 136 / 206",
    cmyk: "100 / 10 / 0 / 0",
    pantone: "Process Blue",
  },
  {
    name: "Teal",
    hex: "#3DB7E4",
    rgb: "61 / 183 / 228",
    cmyk: "65 / 0 / 0 / 0",
    pantone: "298",
  },
  {
    name: "Navy",
    hex: "#0046AD",
    rgb: "0 / 70 / 173",
    cmyk: "100 / 70 / 0 / 5",
    pantone: "293",
  },
  {
    name: "Cyan",
    hex: "#00B0CA",
    rgb: "0 / 176 / 202",
    cmyk: "85 / 0 / 20 / 0",
    pantone: "3125",
  },
];

const neutralColors: ColorSwatch[] = [
  {
    name: "Warm Gray 6",
    hex: "#A59D95",
    rgb: "165 / 157 / 149",
    cmyk: "14 / 19 / 21 / 38",
    pantone: "Warm Gray 6",
  },
  {
    name: "Warm Gray 10",
    hex: "#766A62",
    rgb: "118 / 106 / 98",
    cmyk: "24 / 34 / 35 / 53",
    pantone: "Warm Gray 10",
  },
];

const accentColors: ColorSwatch[] = [
  {
    name: "Purple",
    hex: "#6E2585",
    rgb: "110 / 37 / 133",
    cmyk: "55 / 80 / 20 / 0",
  },
  {
    name: "Pink",
    hex: "#F53F5B",
    rgb: "245 / 63 / 91",
    cmyk: "0 / 83 / 50 / 0",
  },
  {
    name: "Green",
    hex: "#3F9C35",
    rgb: "63 / 156 / 53",
    cmyk: "70 / 13 / 80 / 0",
  },
  {
    name: "Orange",
    hex: "#E98300",
    rgb: "233 / 131 / 0",
    cmyk: "0 / 60 / 100 / 0",
  },
];

function Swatch({ color, size = "normal" }: { color: ColorSwatch; size?: "normal" | "small" }) {
  return (
    <div className={`${styles.swatch} ${size === "small" ? styles.small : ""}`}>
      <div
        className={styles.color}
        style={{ backgroundColor: color.hex }}
        role="img"
        aria-label={`${color.name} color swatch`}
      />
      <div className={styles.info}>
        <span className={styles.name}>{color.name}</span>
        <span className={styles.hex}>{color.hex}</span>
        {size === "normal" && (
          <>
            <span className={styles.value}>RGB {color.rgb}</span>
            {color.pantone && <span className={styles.value}>PMS {color.pantone}</span>}
          </>
        )}
      </div>
    </div>
  );
}

interface ColorPaletteProps {
  showProportions?: boolean;
}

export function ColorPalette({ showProportions = true }: ColorPaletteProps) {
  return (
    <div className={styles.palette}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Primary</h4>
        <div className={styles.grid}>
          {primaryColors.map((color) => (
            <Swatch key={color.name} color={color} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Neutrals</h4>
        <div className={styles.row}>
          {neutralColors.map((color) => (
            <Swatch key={color.name} color={color} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Accents</h4>
        <div className={styles.row}>
          {accentColors.map((color) => (
            <Swatch key={color.name} color={color} size="small" />
          ))}
        </div>
      </div>

      {showProportions && (
        <div className={styles.proportionsSection}>
          <div className={styles.proportionsText}>
            <h4 className={styles.sectionTitle}>Color Proportions</h4>
            <Text size="s">
              The donut chart shows recommended color relationships. Primary blues
              dominate applications, with neutrals and accents used sparingly to
              maintain the identity&apos;s cohesion across all touchpoints.
            </Text>
          </div>
          <div className={styles.proportionsChart}>
            <Image
              src="/images/portfolio/finnish-transport-agency/color-coverage.png"
              alt="Color proportions donut chart showing primary blues, neutrals, and accent usage"
              width={1167}
              height={1151}
              className={styles.proportionsImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
