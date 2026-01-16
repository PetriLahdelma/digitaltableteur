import { cn } from "@/lib/utils";

export interface SpacerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  axis?: "vertical" | "horizontal";
  className?: string;
}

const sizeMap = {
  xs: { vertical: "h-2", horizontal: "w-2" },      // 8px
  sm: { vertical: "h-4", horizontal: "w-4" },      // 16px
  md: { vertical: "h-6", horizontal: "w-6" },      // 24px
  lg: { vertical: "h-8", horizontal: "w-8" },      // 32px
  xl: { vertical: "h-12", horizontal: "w-12" },    // 48px
  "2xl": { vertical: "h-16", horizontal: "w-16" }, // 64px
} as const;

export function Spacer({
  size = "md",
  axis = "vertical",
  className,
}: SpacerProps) {
  return (
    <div
      className={cn(sizeMap[size][axis], className)}
      aria-hidden="true"
    />
  );
}
