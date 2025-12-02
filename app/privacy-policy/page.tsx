import { PrivacyPolicyPage } from "@/nextjs-app/shared/components/pages/PrivacyPolicyPage";

// Cache for an hour; content is static
export const revalidate = 3600;

export default function PrivacyPolicy() {
  return <PrivacyPolicyPage />;
}
