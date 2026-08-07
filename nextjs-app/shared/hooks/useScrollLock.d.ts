/**
 * Lock scrolling on the document body while `active`, restoring the previous
 * `overflow` value on release (so nested locks compose). For DT's custom
 * overlays (e.g. Modal) that would otherwise let the background scroll behind
 * them.
 *
 * @param active whether the scroll lock is engaged.
 */
export declare function useScrollLock(active: boolean): void;
//# sourceMappingURL=useScrollLock.d.ts.map