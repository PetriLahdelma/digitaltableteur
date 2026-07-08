import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* The DT type scale ships custom font-size utilities (`text-dt-text-*`,
 * `text-dt-title-*`, `text-dt-button-*` from the `--text-dt-*` theme tokens),
 * and many call sites still carry legacy `text-text-*` aliases. Stock
 * tailwind-merge classifies any unrecognised `text-*` class as a text COLOR,
 * so e.g. cn("text-primary-foreground", "text-text-s") silently dropped the
 * real color utility (Tag rendered #e0e0e0 on the dark-theme primary at
 * 1.82:1). Registering both scales as font-size classes keeps color and size
 * utilities orthogonal in every cn() merge.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "text-xxs",
            "text-xs",
            "text-s",
            "text-m",
            "text-l",
            "text-xl",
            "text-xxl",
            "dt-text",
            "dt-text-xxs",
            "dt-text-xs",
            "dt-text-s",
            "dt-text-m",
            "dt-text-l",
            "dt-text-xl",
            "dt-text-xxl",
            "dt-title",
            "dt-title-xxs",
            "dt-title-xs",
            "dt-title-s",
            "dt-title-m",
            "dt-title-l",
            "dt-title-xl",
            "dt-title-xxl",
            "dt-button-s",
            "dt-button-m",
            "dt-button-l",
          ],
        },
      ],
    },
  },
});

/** Merge class names with clsx + a DT-aware tailwind-merge (font-size scale registered). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
