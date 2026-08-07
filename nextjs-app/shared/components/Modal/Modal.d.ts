import React from "react";
import { type IconProps } from "@dt/Icon";
import { type TitleSizeUnified } from "../../utils/sizeNormalization";
export type ModalSeverity = "success" | "error" | "warning" | "info";
export type ModalAnimation = "none" | "scale" | "slide" | "fade";
export interface ModalProps {
    /** Semantic severity level */
    severity?: ModalSeverity;
    /** Shows loading state with spinner */
    isLoading?: boolean;
    /** Title size - supports both modern (sm/md/lg) and legacy (S/M/L) formats */
    titleSize?: TitleSizeUnified;
    /** Header icon size — Icon token scale (default lg for severity dialogs) */
    iconSize?: IconProps["size"];
    /** Controls visibility */
    isOpen: boolean;
    /** Title shown in header */
    title?: string;
    /** Supporting text — wired to aria-describedby (DialogDescription parity) */
    description?: string;
    /** Optional contextual menu or extra controls */
    menu?: React.ReactNode;
    /** Modal content */
    children?: React.ReactNode;
    /** Footer content, e.g. actions */
    footer?: React.ReactNode;
    /** Close callback */
    onClose?: () => void;
    /** Optional icon to display in the header */
    icon?: React.ReactNode;
    /** Optional className for additional styling on the panel */
    className?: string;
    /** When false, omit the footer region (e.g. composable dialog bodies) */
    showFooter?: boolean;
    /** Ref on the dialog panel for animation hooks */
    panelRef?: React.Ref<HTMLDivElement>;
    /** Entrance animation applied to the panel on open (respects prefers-reduced-motion) */
    animation?: ModalAnimation;
    /** Show close icon button in header */
    showCloseIcon?: boolean;
    /** Custom close icon name (defaults to "x") */
    closeIconName?: string;
    /** Custom close button aria-label */
    closeButtonLabel?: string;
}
/** Modal dialog for confirmations, forms, and focused tasks with focus trap and Escape close. */
declare const Modal: React.FC<ModalProps>;
export default Modal;
//# sourceMappingURL=Modal.d.ts.map