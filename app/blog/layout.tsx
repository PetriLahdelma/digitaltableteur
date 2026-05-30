import type { ReactNode } from "react";

import { DraftPreviewBanner } from "./DraftPreviewBanner";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DraftPreviewBanner />
      {children}
    </>
  );
}
