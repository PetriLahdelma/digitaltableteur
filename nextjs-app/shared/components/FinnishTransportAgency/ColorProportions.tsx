"use client";

import React from "react";
import styles from "./ColorProportions.module.css";

/**
 * SVG donut chart showing Liikennevirasto color proportions.
 * Outer ring: Primary blues (dominant usage)
 * Inner ring: Supporting colors (neutrals and accents)
 * Uses filled wedge paths for seamless appearance (no gaps)
 */
export function ColorProportions() {
  // Outer ring segments (primary blues) - percentages from brand guidelines
  const outerSegments = [
    { color: "#0046AD", percent: 30 },  // Navy
    { color: "#0088CE", percent: 28 },  // Process Blue
    { color: "#3DB7E4", percent: 22 },  // Teal
    { color: "#00B0CA", percent: 20 },  // Cyan
  ];

  // Inner ring segments (all colors including neutrals and accents)
  const innerSegments = [
    { color: "#0046AD", percent: 22 },  // Navy
    { color: "#0088CE", percent: 20 },  // Process Blue
    { color: "#3DB7E4", percent: 15 },  // Teal
    { color: "#00B0CA", percent: 13 },  // Cyan
    { color: "#A59D95", percent: 12 },  // Warm Gray 6
    { color: "#766A62", percent: 6 },   // Warm Gray 10
    { color: "#6E2585", percent: 3 },   // Purple
    { color: "#F53F5B", percent: 3 },   // Pink
    { color: "#3F9C35", percent: 3 },   // Green
    { color: "#E98300", percent: 3 },   // Orange
  ];

  const centerX = 140;
  const centerY = 140;
  const outerRadius = 130;
  const outerInnerRadius = 90;
  const innerRadius = 80;
  const innerInnerRadius = 45;

  // Create a wedge path (filled arc segment)
  const createWedge = (
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    startAngle: number,
    endAngle: number
  ) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const outerStart = {
      x: cx + outerR * Math.cos(startRad),
      y: cy + outerR * Math.sin(startRad),
    };
    const outerEnd = {
      x: cx + outerR * Math.cos(endRad),
      y: cy + outerR * Math.sin(endRad),
    };
    const innerStart = {
      x: cx + innerR * Math.cos(startRad),
      y: cy + innerR * Math.sin(startRad),
    };
    const innerEnd = {
      x: cx + innerR * Math.cos(endRad),
      y: cy + innerR * Math.sin(endRad),
    };

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
      `Z`
    ].join(" ");
  };

  // Generate outer ring wedges
  let outerAngle = 0;
  const outerWedges = outerSegments.map((segment, i) => {
    const startAngle = outerAngle;
    const sweepAngle = (segment.percent / 100) * 360;
    outerAngle += sweepAngle;
    return {
      ...segment,
      d: createWedge(centerX, centerY, outerRadius, outerInnerRadius, startAngle, outerAngle),
      key: `outer-${i}`,
    };
  });

  // Generate inner ring wedges
  let innerAngle = 0;
  const innerWedges = innerSegments.map((segment, i) => {
    const startAngle = innerAngle;
    const sweepAngle = (segment.percent / 100) * 360;
    innerAngle += sweepAngle;
    return {
      ...segment,
      d: createWedge(centerX, centerY, innerRadius, innerInnerRadius, startAngle, innerAngle),
      key: `inner-${i}`,
    };
  });

  return (
    <svg
      viewBox="0 0 280 280"
      className={styles.chart}
      aria-label="Color proportions donut chart"
      role="img"
    >
      {/* Outer ring */}
      <g className={styles.outerRing}>
        {outerWedges.map((wedge) => (
          <path
            key={wedge.key}
            d={wedge.d}
            fill={wedge.color}
          />
        ))}
      </g>

      {/* Inner ring */}
      <g className={styles.innerRing}>
        {innerWedges.map((wedge) => (
          <path
            key={wedge.key}
            d={wedge.d}
            fill={wedge.color}
          />
        ))}
      </g>

      {/* Center circle (white) */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerInnerRadius - 2}
        fill="var(--color-surface, white)"
      />
    </svg>
  );
}
