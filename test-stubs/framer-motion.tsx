/**
 * Vitest stub: render motion nodes as plain DOM without entrance animations.
 */
import React from "react";

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  variants?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  layout?: unknown;
  layoutId?: unknown;
};

const motionTags = [
  "a",
  "article",
  "aside",
  "button",
  "div",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "header",
  "hr",
  "img",
  "label",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "section",
  "span",
  "ul",
] as const;

function createMotionComponent(tag: string) {
  return React.forwardRef<HTMLElement, MotionProps>(function MotionStub(
    { children, ...props },
    ref,
  ) {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      whileTap: _whileTap,
      whileInView: _whileInView,
      viewport: _viewport,
      layout: _layout,
      layoutId: _layoutId,
      ...domProps
    } = props;

    return React.createElement(
      tag,
      { ref, ...domProps },
      children,
    );
  });
}

export const motion = Object.fromEntries(
  motionTags.map((tag) => [tag, createMotionComponent(tag)]),
) as Record<(typeof motionTags)[number], ReturnType<typeof createMotionComponent>>;

export function AnimatePresence({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <>{children}</>;
}

export function MotionConfig({
  children,
}: {
  children?: React.ReactNode;
  reducedMotion?: unknown;
  transition?: unknown;
}) {
  return <>{children}</>;
}

export const useReducedMotion = () => true;
export const useAnimation = () => ({});
export const useMotionValue = (initial: number) => ({ get: () => initial });
export const useTransform = () => 0;
export const useSpring = (value: number) => value;
export const useScroll = () => ({
  scrollX: { get: () => 0 },
  scrollY: { get: () => 0 },
  scrollXProgress: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
});
export const useInView = () => true;
export const LazyMotion = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
export const domAnimation = {};
export const m = motion;
