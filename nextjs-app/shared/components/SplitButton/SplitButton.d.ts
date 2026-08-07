import React from "react";
import { type ButtonProps } from "../Button";
type BaseSplitButtonOption = {
    id?: string;
    label: string;
    description?: string;
    icon?: React.ReactNode | string;
    trailingIcon?: React.ReactNode | string;
    disabled?: boolean;
    /** Optional tooltip shown on hover */
    title?: string;
};
export type SplitButtonOption = (BaseSplitButtonOption & {
    /** Action invoked when selecting this option */
    onSelect?: () => void | Promise<void>;
    children?: never;
}) | (BaseSplitButtonOption & {
    /** Nested options for a second-level menu */
    children: SplitButtonOption[];
    onSelect?: never;
});
export interface SplitButtonProps extends Pick<ButtonProps, "variant" | "size" | "surface" | "rounded" | "tooltip" | "accessibleName"> {
    /** Main label rendered on the primary segment */
    label: React.ReactNode;
    /** Primary action invoked when clicking the main segment */
    onPrimaryClick?: React.MouseEventHandler<HTMLButtonElement>;
    /** List of alternative actions shown in the dropdown */
    options: SplitButtonOption[];
    /** Alignment of the dropdown menu along the toggle edge */
    menuAlign?: "start" | "end";
    /** Disable both segments */
    disabled?: boolean;
    /** Accessible label for the dropdown trigger */
    toggleLabel?: string;
    /** Optional className forwarded to the outer wrapper */
    className?: string;
}
/**
 * SplitButton renders a primary action with a trailing caret that opens a menu
 * of related actions. The dropdown is the shared Menu primitive (Radix
 * dropdown-menu): roving focus, arrow keys, typeahead, Escape, focus return,
 * submenus, and collision-aware placement come from Radix. The main button and
 * the toggle share the same visual variant for cohesion.
 */
declare const SplitButton: React.ForwardRefExoticComponent<SplitButtonProps & React.RefAttributes<HTMLDivElement>>;
export default SplitButton;
//# sourceMappingURL=SplitButton.d.ts.map