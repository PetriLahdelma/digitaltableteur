import type { Metadata } from "next";

import { GarageJunctionPage } from "../../../shared/components/pages/Work/GarageJunction";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Garage Junction Case Study",
  description: "Branding, event identity, and promotion for Garage Junction at Merikerho.",
};

export default function GarageJunction() {
  return <GarageJunctionPage nav={<NextWorkNav />} />;
}
