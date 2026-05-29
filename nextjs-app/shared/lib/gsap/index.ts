"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register all plugins once at app startup
if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).React = React;
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

// Global defaults matching design system
gsap.defaults({
  duration: 0.8,
  ease: "power2.out",
});

export { gsap, useGSAP, ScrollTrigger };
