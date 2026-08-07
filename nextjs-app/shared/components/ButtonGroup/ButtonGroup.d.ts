import React from "react";
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Accessible name for the group (announced by screen readers). */
    ariaLabel?: string;
    /** Fuse the children into one segmented control surface. @default true */
    attached?: boolean;
    /** Buttons / IconButtons of the same variant and size. */
    children: React.ReactNode;
}
/** Groups related Buttons into one row — attached (segmented) or evenly spaced. */
export declare const ButtonGroup: React.ForwardRefExoticComponent<ButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
export default ButtonGroup;
//# sourceMappingURL=ButtonGroup.d.ts.map