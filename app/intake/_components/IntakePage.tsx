import type { ReactNode } from "react";
import {
  Button,
  Container,
  FlexBox,
  Grid,
  Section,
  Text,
  Title,
} from "@digitaltableteur/react";

import type { IntakeLocale } from "@/app/lib/intake/types";

import { IntakeLanguage } from "./LanguageControls";

/**
 * Page body for intake pages inside the site layout. Same width as the site
 * header (Container lg), so content lines up with the logo and navigation.
 */
export function IntakePage({
  locale,
  children,
}: {
  locale: IntakeLocale;
  children: ReactNode;
}) {
  return (
    <Container size="lg">
      <Section spacing="sm">
        <IntakeLanguage locale={locale} />
        {children}
      </Section>
    </Container>
  );
}

/**
 * One reading column for the intake's own pages (sign-in, code, home,
 * submission, privacy): title, intro, content. Left-aligned with the site
 * header, about two thirds of its width, as GOV.UK question pages are.
 * `wide` lets the content take the full width (a two-column answer list, as
 * on Check and submit) while the title and intro keep the reading width.
 */
export function IntakeColumns({
  title,
  intro,
  wide = false,
  children,
}: {
  title: string;
  intro?: ReactNode;
  wide?: boolean;
  children?: ReactNode;
}) {
  const heading = (
    <FlexBox direction="column" gap="var(--space-internal-16)">
      <Title level={1} size="l">
        {title}
      </Title>
      {typeof intro === "string" ? <Text>{intro}</Text> : intro}
    </FlexBox>
  );
  return (
    <Grid columns={wide ? "minmax(0, 1fr)" : "minmax(0, 52rem)"}>
      <FlexBox direction="column" gap="var(--space-internal-32)">
        {wide ? <Grid columns="minmax(0, 52rem)">{heading}</Grid> : heading}
        {children}
      </FlexBox>
    </Grid>
  );
}
