"use client";

import { AboutPageContent } from "../../../patterns/AboutPageContent";
import { AskAI } from "../../AskAI";
import { AsciiSceneBackground } from "../AsciiScene";

export function AboutPage() {
  return (
    <>
      <AboutPageContent showCTA heroBackdrop={<AsciiSceneBackground scene="glove" />} />
      <AskAI />
    </>
  );
}
