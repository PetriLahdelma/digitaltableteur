import React, { useEffect, useState } from "react";

const TITLES = ["Digitaltableteur"];

const SCROLL_STEP = 1; // px per frame
const SCROLL_DELAY = 20; // ms per frame

const ScrollTitle: React.FC = () => {
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && containerRef.current) {
      setWidth(ref.current.scrollWidth);
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [ref.current, containerRef.current]);

  useEffect(() => {
    if (width <= containerWidth) return;
    const interval = setInterval(() => {
      setOffset((prev) => {
        if (prev <= -width) return containerWidth;
        return prev - SCROLL_STEP;
      });
    }, SCROLL_DELAY);
    return () => clearInterval(interval);
  }, [width, containerWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: "100%",
        height: "2em",
        display: "flex",
        alignItems: "center",
      }}
      aria-label="Scrolling site title"
    >
      <div
        ref={ref}
        style={{
          display: "inline-block",
          transform: `translateX(${offset}px)`,
          willChange: "transform",
          fontWeight: 700,
          fontSize: "1.1em",
          letterSpacing: "0.05em",
        }}
      >
        {TITLES.join(" \u00B7 ")}
      </div>
    </div>
  );
};

export default ScrollTitle;
