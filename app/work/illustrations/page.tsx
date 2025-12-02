import type { Metadata } from "next";

import { IllustrationsPage } from "@/nextjs-app/shared/components/pages/Work/Illustrations";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Illustrations Case Study",
  description: "Illustration work across pencil, paint, vector, and pixel styles.",
};

export default function Illustrations() {
  return <IllustrationsPage nav={<NextWorkNav />} />;
}
