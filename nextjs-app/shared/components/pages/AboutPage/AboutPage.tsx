"use client";

import { AboutPageContent } from "../../../patterns/AboutPageContent";
import { AskAI } from "../../AskAI";

export function AboutPage() {
  return (
    <>
      <AboutPageContent showCTA />
      <AskAI />
    </>
  );
}
