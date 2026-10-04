/**
 * "On this page" behaviour for docs pages, layered over Storybook's tocbot
 * list (preview.tsx `docs.toc`).
 *
 * Two defects this replaces:
 * - Navigation. Storybook gives the docs iframe `<base target="_parent">` so
 *   ordinary links drive the manager. A bare `#section` link resolves against
 *   that base and navigates the parent window, which shows up as the docs
 *   opening in a new window instead of scrolling. Clicks are handled here and
 *   never reach the parent.
 * - Active state. tocbot's scroll tracking did not follow the iframe scroll,
 *   so the first item stayed highlighted. A scroll spy here marks the section
 *   being read (`aria-current="location"`) and moves the indicator bar.
 */

export const ACTIVE_CLASS = "dt-toc-active";
/** A heading counts as current once its top passes this fraction of the viewport. */
const READ_LINE = 0.3;

function headingFor(doc: Document, link: HTMLAnchorElement): HTMLElement | null {
  const href = link.getAttribute("href") ?? "";
  if (!href.startsWith("#")) return null;
  return doc.getElementById(decodeURIComponent(href.slice(1)));
}

function prefersReducedMotion(win: Window): boolean {
  return win.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Wire the TOC in `doc`; returns a cleanup function. Safe to call repeatedly. */
export function enhanceDocsToc(doc: Document): () => void {
  const win = doc.defaultView;
  if (!win) return () => {};
  let frame = 0;
  let pinned: HTMLAnchorElement | null = null;
  let pinRelease = 0;

  const links = (): HTMLAnchorElement[] =>
    Array.from(doc.querySelectorAll<HTMLAnchorElement>(".sbdocs-toc--custom a.toc-link"));

  const setActive = (active: HTMLAnchorElement | null) => {
    for (const link of links()) {
      const on = link === active;
      link.classList.toggle(ACTIVE_CLASS, on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    const nav = doc.querySelector<HTMLElement>(".sbdocs-toc--custom nav");
    if (!nav) return;
    if (!active) {
      nav.style.removeProperty("--dt-toc-indicator-opacity");
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const box = active.getBoundingClientRect();
    nav.style.setProperty("--dt-toc-indicator-top", `${box.top - navBox.top}px`);
    nav.style.setProperty("--dt-toc-indicator-height", `${box.height}px`);
    nav.style.setProperty("--dt-toc-indicator-opacity", "1");
  };

  const update = () => {
    frame = 0;
    if (pinned) return;
    const all = links();
    if (all.length === 0) return;
    const line = win.innerHeight * READ_LINE;
    let current: HTMLAnchorElement | null = all[0] ?? null;
    for (const link of all) {
      const heading = headingFor(doc, link);
      if (heading && heading.getBoundingClientRect().top <= line) current = link;
    }
    // At the very bottom the last sections can never reach the read line.
    const scroller = doc.scrollingElement ?? doc.documentElement;
    if (scroller.scrollTop + win.innerHeight >= scroller.scrollHeight - 2) {
      current = all[all.length - 1] ?? current;
    }
    setActive(current);
  };

  const schedule = () => {
    if (!frame) frame = win.requestAnimationFrame(update);
  };

  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
      ".sbdocs-toc--custom a.toc-link",
    );
    if (!link) return;
    const heading = headingFor(doc, link);
    if (!heading) return;
    // Modified clicks keep their native meaning (new tab etc.).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    heading.scrollIntoView({
      behavior: prefersReducedMotion(win) ? "auto" : "smooth",
      block: "start",
    });
    // Move focus with the reader so keyboard and screen-reader users land on
    // the section they chose, without a second scroll jump.
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    win.history.replaceState(win.history.state, "", `#${heading.id}`);
    // Hold the clicked item active while the smooth scroll passes the others.
    pinned = link;
    setActive(link);
    win.clearTimeout(pinRelease);
    pinRelease = win.setTimeout(() => {
      pinned = null;
      schedule();
    }, 700);
  };

  doc.addEventListener("click", onClick, true);
  win.addEventListener("scroll", schedule, { passive: true });
  win.addEventListener("resize", schedule);
  // tocbot renders after the page; re-run when the list appears or changes.
  const observer = new MutationObserver(schedule);
  observer.observe(doc.body, { childList: true, subtree: true });
  schedule();

  return () => {
    doc.removeEventListener("click", onClick, true);
    win.removeEventListener("scroll", schedule);
    win.removeEventListener("resize", schedule);
    observer.disconnect();
    if (frame) win.cancelAnimationFrame(frame);
    win.clearTimeout(pinRelease);
  };
}
