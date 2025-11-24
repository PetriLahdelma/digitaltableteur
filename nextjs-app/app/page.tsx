import type { Metadata } from "next";

import { HomePage } from "../shared/components/pages/Home/HomePage";

export const metadata: Metadata = {
  title: "Digitaltableteur",
  description: "Design Systems & AI-Powered DesignOps",
};

export default function Home() {
  return <HomePage />;
}
