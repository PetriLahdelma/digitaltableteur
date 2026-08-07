export interface SpacerProps {
    /** Tokenized gap size. @default "md" */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    /** Block (vertical) or inline (horizontal) axis. @default "vertical" */
    axis?: "vertical" | "horizontal";
    /** Additional CSS class names. */
    className?: string;
}
export declare function Spacer({ size, axis, className, }: SpacerProps): import("react").JSX.Element;
//# sourceMappingURL=Spacer.d.ts.map