"use client";

import type { EngagementId } from "../../../data/engagements";
import { EngagementPageContent } from "../../../patterns/EngagementPageContent";

export function EngagementPage({ engagementId }: { engagementId: EngagementId }) {
  return <EngagementPageContent engagementId={engagementId} />;
}

EngagementPage.displayName = "EngagementPage";
