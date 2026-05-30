import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface ComboboxDropdownPosition {
  top: number;
  left: number;
  width: number;
}

export function useComboboxDropdown(
  open: boolean,
  optionCount: number,
  onClose: () => void,
) {
  const controlRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<ComboboxDropdownPosition | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    const control = controlRef.current;
    if (!control) return;

    const rect = control.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setDropdownStyle(null);
      return;
    }

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open, optionCount, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const dropdown = listRef.current;
    if (!dropdown) return;

    const onWheel = (event: WheelEvent) => {
      if (dropdown.scrollHeight <= dropdown.clientHeight + 1) {
        event.stopPropagation();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = dropdown;
      const maxScrollTop = scrollHeight - clientHeight;
      const deltaY = event.deltaY;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop < maxScrollTop - 1;

      if ((deltaY < 0 && canScrollUp) || (deltaY > 0 && canScrollDown)) {
        event.preventDefault();
        event.stopPropagation();
        dropdown.scrollTop = Math.min(
          maxScrollTop,
          Math.max(0, scrollTop + deltaY),
        );
        return;
      }

      event.stopPropagation();
    };

    dropdown.addEventListener("wheel", onWheel, { passive: false });
    return () => dropdown.removeEventListener("wheel", onWheel);
  }, [open, optionCount]);

  return {
    mounted,
    dropdownStyle,
    controlRef,
    listRef,
    containerRef,
  };
}
