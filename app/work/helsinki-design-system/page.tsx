import type { Metadata } from "next";

import { HelsinkiDesignSystemPage } from "@/nextjs-app/shared/components/pages/Work/HelsinkiDesignSystem";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Helsinki Design System Case Study",
  description:
    "Design system for the City of Helsinki: research, process, components, and impact across multivendor services.",
};

export default function HelsinkiDesignSystem() {
  return <HelsinkiDesignSystemPage nav={<NextWorkNav />} />;
}
