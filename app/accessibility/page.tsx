import { AccessibilityPage } from "@/nextjs-app/shared/components/pages/AccessibilityPage";

export const revalidate = 3600;

export default function AccessibilityStatement() {
  return <AccessibilityPage />;
}
