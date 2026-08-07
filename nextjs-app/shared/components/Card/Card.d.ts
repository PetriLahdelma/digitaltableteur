import React from "react";
export type CardVariant = "default" | "muted" | "transparent";
export type CardPadding = "none" | "sm" | "md" | "lg";
export interface CardTitleProps {
    /** Heading level for the document outline @default 3 */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Rendered element (defaults to h{level}) */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    /** Title size on the type ladder @default "xxs" */
    size?: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
    className?: string;
}
export interface CardDescriptionProps {
    /** Text size on the text ladder @default "s" */
    size?: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
    /** Rendered element for the description @default "p" */
    as?: "p" | "span" | "div";
    className?: string;
}
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
    /**
     * Background variant. All variants keep a transparent border so
     * switching never causes layout jitter.
     * - default: surface background with a hairline border
     * - muted: recessed light background, no visible border
     * - transparent: no background, no border — grouping without weight
     */
    variant?: CardVariant;
    /** Internal padding step on the space scale (12/16/24px) @default "md" */
    padding?: CardPadding;
    /** Semantic element for the card surface @default "div" */
    as?: "div" | "article" | "section" | "aside" | "li";
    /** Optional heading rendered at the top of the card */
    title?: string;
    /** Heading configuration */
    titleProps?: CardTitleProps;
    /** Optional supporting line under the title */
    description?: string;
    /** Description configuration */
    descriptionProps?: CardDescriptionProps;
    /** Leading header region. Defaults to the `title` heading block when omitted. */
    headerStart?: React.ReactNode;
    /** Trailing header region (badge, metadata, menu). Canonical replacement for `extra`. */
    headerEnd?: React.ReactNode;
    /** @deprecated Use `headerEnd`. Legacy alias feeding the trailing header region. */
    extra?: React.ReactNode;
    /** Leading footer region — the special/destructive action, pinned left. */
    footerStart?: React.ReactNode;
    /** Trailing footer region — 1–2 action buttons, pinned right. */
    footerEnd?: React.ReactNode;
    /** Makes the whole card one link to this href */
    link?: string;
    /** Accessible name for the link when title alone is ambiguous */
    linkLabel?: string;
    /** Skeleton loading state (role=status, aria-busy) */
    loading?: boolean;
    children?: React.ReactNode;
}
/**
 * A quiet, bordered surface for discrete content. The container owns
 * background, hairline border, radius, and padding; structure comes from
 * composition (Title/Text/Divider/Stack) or the thin title/description/
 * extra layer. `link` stretches a single anchor across the card.
 */
export declare const Card: React.FC<CardProps>;
export default Card;
//# sourceMappingURL=Card.d.ts.map