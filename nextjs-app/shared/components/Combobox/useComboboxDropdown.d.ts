export interface ComboboxDropdownPosition {
    top: number;
    left: number;
    width: number;
}
export declare function useComboboxDropdown(open: boolean, optionCount: number, onClose: () => void): {
    mounted: boolean;
    dropdownStyle: ComboboxDropdownPosition | null;
    controlRef: import("react").RefObject<HTMLDivElement | null>;
    listRef: import("react").RefObject<HTMLUListElement | null>;
    containerRef: import("react").RefObject<HTMLDivElement | null>;
};
//# sourceMappingURL=useComboboxDropdown.d.ts.map