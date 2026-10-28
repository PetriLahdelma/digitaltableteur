import type { Metadata } from "next";

import { DataDeletionPage } from "@dt-pages/DataDeletionPage";

export const metadata: Metadata = {
  title: "Delete your data | Digitaltableteur",
  description:
    "Request deletion of the contact form messages and chat details Digitaltableteur holds for your email address.",
  alternates: {
    canonical: "/privacy-policy/delete",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DataDeletion() {
  return <DataDeletionPage />;
}
