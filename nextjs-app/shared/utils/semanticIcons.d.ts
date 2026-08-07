import { type IconProps } from "@dt/Icon";
export type SemanticStatus = "success" | "info" | "warning" | "error";
export declare const STATUS_ICON_NAMES: Record<SemanticStatus, string>;
export type SemanticIconOptions = {
    size?: IconProps["size"];
};
export declare const getSemanticIcon: (status: SemanticStatus, options?: SemanticIconOptions) => import("react").JSX.Element;
//# sourceMappingURL=semanticIcons.d.ts.map