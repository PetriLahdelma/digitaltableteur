import type { Metadata } from "next";

import { WorkIndexPage } from "@dt-pages/Work/WorkIndex";

export const metadata: Metadata = {
  title: "Work | Digitaltableteur",
  description: "Selected projects and experiments by Digitaltableteur.",
};

export default function Work() {
  return <WorkIndexPage />;
}
