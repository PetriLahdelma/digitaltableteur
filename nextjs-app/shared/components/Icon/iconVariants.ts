import { cva } from "class-variance-authority";

export const iconVariants = cva("inline-flex shrink-0 items-center justify-center", {
  variants: {
    size: {
      "2xs": "h-3 w-3",
      xs: "h-4 w-4",
      sm: "h-5 w-5",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
      "2xl": "h-16 w-16",
    },
  },
  defaultVariants: { size: "md" },
});
