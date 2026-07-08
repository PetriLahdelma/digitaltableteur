import { type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface AspectRatioProps {
  /** Media or placeholder content inside the ratio box. */
  children: ReactNode;
  /** Width-to-height ratio token. @default "16:9" */
  ratio?: "1:1" | "4:3" | "16:9" | "21:9" | "3:2" | "2:3";
  /** Additional CSS class names. */
  className?: string;
}

const ratioClasses = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "21:9": "aspect-[21/9]",
  "3:2": "aspect-[3/2]",
  "2:3": "aspect-[2/3]",
} as const;

export function AspectRatio({
  children,
  ratio = "16:9",
  className,
}: AspectRatioProps) {
  return (
    <div className={cn("relative overflow-hidden", ratioClasses[ratio], className)}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
