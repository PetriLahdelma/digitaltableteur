"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

// Note: Metadata must be exported from layout.tsx for client components
// See: app/studio/layout.tsx

export default function StudioPage() {
  return <NextStudio config={config} />;
}
