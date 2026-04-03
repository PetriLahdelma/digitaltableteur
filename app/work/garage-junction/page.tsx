import type { Metadata } from "next";

import { GarageJunctionPage } from "@dt-pages/Work/GarageJunction";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Garage Junction Case Study | Digitaltableteur",
  description:
    "Branding, event identity, and promotional campaign for Garage Junction music events at Merikerho, Helsinki. Event design and marketing.",
  openGraph: {
    title: "Garage Junction Case Study | Digitaltableteur",
    description:
      "Branding, event identity, and promotional campaign for Garage Junction music events at Merikerho, Helsinki. Event design and marketing.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garage Junction Case Study | Digitaltableteur",
    description:
      "Branding, event identity, and promotional campaign for Garage Junction music events at Merikerho, Helsinki. Event design and marketing.",
  },
  alternates: {
    canonical: "/work/garage-junction",
  },
};

export const revalidate = 3600;

export default function GarageJunction() {
  return <GarageJunctionPage nav={<NextWorkNav />} />;
}
