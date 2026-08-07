export interface CategoryOption {
    /** Category value */
    value: string;
    /** Display label */
    label: string;
}
export interface CategoryFilterProps {
    /** Array of category options */
    categories: CategoryOption[];
    /** Currently active category value */
    activeCategory: string;
    /** Callback when category changes */
    onCategoryChange: (category: string) => void;
    /** Custom className */
    className?: string;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Style variant */
    variant?: "pills" | "underline" | "minimal";
}
export declare function CategoryFilter({ categories, activeCategory, onCategoryChange, className, size, variant, }: CategoryFilterProps): import("react").JSX.Element;
export declare namespace CategoryFilter {
    var displayName: string;
}
//# sourceMappingURL=CategoryFilter.d.ts.map