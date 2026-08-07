import React from "react";
export type AvatarGroupSize = "sm" | "md" | "lg";
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Accessible name for the cluster (e.g. "Project members"). */
    ariaLabel?: string;
    /** Avatars beyond this count collapse into a "+N" bubble. @default 4 */
    max?: number;
    /**
     * Size of the overflow bubble; children Avatars should match
     * (sm=2rem, md=2.5rem, lg=3rem). @default "md"
     */
    size?: AvatarGroupSize;
    /** @dt/Avatar elements (all the same size). */
    children: React.ReactNode;
}
/** Overlapping stack of Avatars with a +N overflow bubble. */
export declare const AvatarGroup: React.ForwardRefExoticComponent<AvatarGroupProps & React.RefAttributes<HTMLDivElement>>;
export default AvatarGroup;
//# sourceMappingURL=AvatarGroup.d.ts.map