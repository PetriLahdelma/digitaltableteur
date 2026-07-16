// Ref-counted background inerting for modal overlays. Shared by dt-modal and the
// dt-cookie-consent preferences dialog so an open modal hides sibling content from
// assistive technology (parity with the React useFocusTrap `inert` behavior), and
// stacked overlays restore the original state correctly. The dt-command-palette
// carries its own equivalent because it also manages a palette stack.
const inertLocks = new Map<
  HTMLElement,
  { owners: Set<object>; wasInert: boolean }
>();

export class BackgroundInert {
  private readonly inerted = new Set<HTMLElement>();

  constructor(private readonly host: HTMLElement) {}

  engage(): void {
    this.restore();
    const doc = this.host.ownerDocument;
    let current: Node = this.host;
    while (current.parentNode && current.parentNode !== doc) {
      const parent = current.parentNode;
      for (const sibling of parent.childNodes) {
        if (sibling === current || !(sibling instanceof HTMLElement)) continue;
        const lock = inertLocks.get(sibling);
        if (lock) lock.owners.add(this);
        else
          inertLocks.set(sibling, {
            owners: new Set([this]),
            wasInert: sibling.hasAttribute("inert"),
          });
        this.inerted.add(sibling);
        sibling.setAttribute("inert", "");
      }
      current = parent;
    }
  }

  restore(): void {
    for (const element of this.inerted) {
      const lock = inertLocks.get(element);
      if (!lock) continue;
      lock.owners.delete(this);
      if (lock.owners.size) continue;
      if (!lock.wasInert) element.removeAttribute("inert");
      inertLocks.delete(element);
    }
    this.inerted.clear();
  }
}
