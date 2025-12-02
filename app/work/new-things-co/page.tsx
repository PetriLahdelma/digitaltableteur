import type { Metadata } from "next";

import { NewThingsCoPage } from "@/nextjs-app/shared/components/pages/Work/NewThingsCo";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "New Things Co Case Study",
  description: "Branding, design system, and web design for New Things Co.",
};

export default function NewThingsCo() {
  return <NewThingsCoPage nav={<NextWorkNav />} />;
}
