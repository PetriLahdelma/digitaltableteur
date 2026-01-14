import { cn } from "@/lib/utils";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  decorative = true,
  className,
}: DividerProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
    />
  );
}
