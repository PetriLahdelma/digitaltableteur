import React from "react";
import type { IconWeight } from "@phosphor-icons/react";
import styles from "./Icon.module.css";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { resolvePhosphorIcon } from "./iconRegistry";

export const iconVariants = cva("inline-flex shrink-0 items-center justify-center", {
  variants: {
    size: {
      "2xs": "h-3 w-3", xs: "h-4 w-4", sm: "h-5 w-5", md: "h-6 w-6", lg: "h-8 w-8", xl: "h-12 w-12", "2xl": "h-16 w-16",
    },
  },
  defaultVariants: { size: "md" },
});


type NamedSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type LegacyStyle =
  | "solid"
  | "regular"
  | "light"
  | "thin"
  | "duotone"
  | "brands";

export type IconProps = Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
  /**
   * Phosphor icon name. Accepts PascalCase (e.g., "ShareNetwork") or slug ("share-network").
   */
  name: string;
  /**
   * Optional Phosphor weight override.
   */
  weight?: IconWeight;
  /**
   * Legacy FontAwesome-style weight string kept for backward compatibility.
   */
  legacyStyle?: LegacyStyle;
  size?: NamedSize | number;
  color?: string;
  rotate?: 0 | 90 | 180 | 270;
  flip?: "horizontal" | "vertical" | "both";
  spin?: boolean;
  pulse?: boolean;
  mirrored?: boolean;
  ariaLabel?: string;
  decorative?: boolean;
};

const NAMED_SIZES: Record<NamedSize, number> = {
  "2xs": 12,
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  "2xl": 64,
};

const LEGACY_STYLE_TO_WEIGHT: Record<LegacyStyle, IconWeight> = {
  solid: "regular",
  regular: "regular",
  light: "light",
  thin: "thin",
  duotone: "duotone",
  brands: "regular",
};

/** Phosphor icon wrapper with size tokens, motion affordances, and accessible naming. */
const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name,
      weight,
      legacyStyle,
      size = "md",
      color,
      rotate,
      flip,
      spin,
      pulse,
      mirrored,
      ariaLabel,
      decorative = !ariaLabel,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const IconComponent = resolvePhosphorIcon(name);
    if (!IconComponent) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[Icon] Unable to find Phosphor icon "${name}". Add it to iconRegistry.ts.`,
        );
      }
      return null;
    }

    const resolvedWeight =
      weight ??
      (legacyStyle && legacyStyle in LEGACY_STYLE_TO_WEIGHT
        ? LEGACY_STYLE_TO_WEIGHT[legacyStyle as LegacyStyle]
        : undefined) ??
      "regular";
    const resolvedSize =
      typeof size === "string" ? (NAMED_SIZES[size] ?? NAMED_SIZES.md) : size;

    const transforms: string[] = [];
    if (typeof rotate === "number") {
      transforms.push(`rotate(${rotate}deg)`);
    }
    if (flip === "horizontal" || flip === "both") {
      transforms.push("scaleX(-1)");
    }
    if (flip === "vertical" || flip === "both") {
      transforms.push("scaleY(-1)");
    }

    const transformValue =
      transforms.length > 0 ? transforms.join(" ") : undefined;

    const animationClass = spin
      ? styles.spin
      : pulse
        ? styles.pulse
        : undefined;

    // Build inline styles for SVG - combine transform and any user style
    const svgStyle =
      transformValue || style
        ? {
            ...style,
            ...(transformValue ? { transform: transformValue } : {}),
          }
        : undefined;

    const sizeClassMap: Record<NamedSize, string> = {
      "2xs": styles.size2xs,
      xs: styles.sizeXs,
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
      xl: styles.sizeXl,
      "2xl": styles.size2xl,
    };

    const sizeClass =
      typeof size === "string"
        ? (sizeClassMap[size as NamedSize] ?? sizeClassMap.md)
        : undefined;

    const mergedClassName = cn(
      styles.base,
      typeof size === "string" ? iconVariants({ size: size as NamedSize }) : iconVariants({ size: "md" }),
      sizeClass,
      animationClass,
      className,
    );

    return (
      <span
        ref={ref}
        className={mergedClassName}
        aria-hidden={decorative && !ariaLabel ? true : undefined}
        aria-label={ariaLabel}
        role={!decorative && ariaLabel ? "img" : undefined}
        data-icon-name={name}
        {...rest}
      >
        <IconComponent
          size={resolvedSize}
          weight={resolvedWeight}
          color={color}
          mirrored={mirrored}
          aria-hidden="true"
          focusable="false"
          style={svgStyle}
        />
      </span>
    );
  },
);

Icon.displayName = "Icon";

export default Icon;
