import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AspectRatioProps {
  children: ReactNode;
  ratio?: "1:1" | "4:3" | "16:9" | "21:9" | "3:2" | "2:3";
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
