import { type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface ProseProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "[&>p]:text-text-s",
  md: "[&>p]:text-text-m",
  lg: "[&>p]:text-text-l",
} as const;

export function Prose({
  children,
  size = "md",
  className,
}: ProseProps) {
  return (
    <div
      className={cn(
        "prose-width font-body",
        "[&>p]:mb-4 [&>p]:leading-relaxed",
        "[&>h2]:font-heading [&>h2]:text-title-m [&>h2]:mt-8 [&>h2]:mb-4",
        "[&>h3]:font-heading [&>h3]:text-title-s [&>h3]:mt-6 [&>h3]:mb-3",
        "[&>ul]:pl-5 [&>ol]:pl-5 [&>ul]:mb-4 [&>ol]:mb-4",
        "[&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4",
        "[&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-sm [&>pre]:overflow-x-auto [&>pre]:my-4",
        "[&>code]:bg-muted [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-sm [&>code]:text-text-s",
        "[&>a]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
