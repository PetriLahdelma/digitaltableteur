"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register all plugins once at app startup
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

// Global defaults matching design system
gsap.defaults({
  duration: 0.8,
  ease: "power2.out",
});

export { gsap, useGSAP, ScrollTrigger };
