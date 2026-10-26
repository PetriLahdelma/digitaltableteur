import type { ReactNode } from "react";
import { Button, Container, FlexBox, Section } from "@digitaltableteur/react";

import type { IntakeLocale } from "@/app/lib/intake/types";

import { IntakeLanguage } from "./LanguageControls";

/**
 * Content column for intake pages inside the site layout. The site header
 * and footer come from NextLayout; this adds only the page's width and the
 * link to the header's language switcher.
 */
export function IntakePage({
  locale,
  wide = false,
  children,
}: {
  locale: IntakeLocale;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Container size={wide ? "md" : "sm"}>
      <Section spacing="lg">
        <IntakeLanguage locale={locale} />
        <FlexBox direction="column" gap="var(--space-internal-24)">
          {children}
        </FlexBox>
      </Section>
    </Container>
  );
}

/** Plain form POST, so signing out works without JavaScript. */
export function SignOut({ label }: { label: string }) {
  return (
    <form method="post" action="/api/intake/auth/logout">
      <Button submits variant="secondary" size="sm">
        {label}
      </Button>
    </form>
  );
}

/** Back link on the left, sign-out on the right. */
export function IntakeToolbar({
  start,
  signOutLabel,
}: {
  start?: ReactNode;
  signOutLabel: string;
}) {
  return (
    <FlexBox
      direction="row"
      gap="var(--space-internal-16)"
      justify="space-between"
      align="center"
      wrap="wrap"
    >
      {start ?? <span />}
      <SignOut label={signOutLabel} />
    </FlexBox>
  );
}
