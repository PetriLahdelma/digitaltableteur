import { type ReactNode } from "react";
export interface AspectRatioProps {
    /** Media or placeholder content inside the ratio box. */
    children: ReactNode;
    /** Width-to-height ratio token. @default "16:9" */
    ratio?: "1:1" | "4:3" | "16:9" | "21:9" | "3:2" | "2:3";
    /** Additional CSS class names. */
    className?: string;
}
export declare function AspectRatio({ children, ratio, className, }: AspectRatioProps): import("react").JSX.Element;
//# sourceMappingURL=AspectRatio.d.ts.map