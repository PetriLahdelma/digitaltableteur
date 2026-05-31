"use client";

import { Suspense } from "react";
import {
  ContactPage,
  type ContactPageProps,
} from "@dt-pages/ContactPage";

export function ContactContent(props: ContactPageProps) {
  return (
    <Suspense fallback={null}>
      <ContactPage {...props} />
    </Suspense>
  );
}
