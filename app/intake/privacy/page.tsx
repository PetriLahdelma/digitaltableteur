import { List, Section, Text, Title } from "@digitaltableteur/react";

import {
  PRIVACY_NOTICE,
  PRIVACY_NOTICE_TITLE,
  PRIVACY_NOTICE_UPDATED,
} from "@/app/lib/intake/privacy-notice";

import { IntakePage } from "../_components/IntakePage";
import { requestLocale } from "../_components/locale";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Same composition as the site privacy policy page: Title, Text, List in Sections. */
export default async function IntakePrivacyPage({ searchParams }: Props) {
  const locale = await requestLocale(searchParams);
  return (
    <IntakePage locale={locale}>
      <Title level={1} size="l">
        {PRIVACY_NOTICE_TITLE[locale]}
      </Title>
      <Text size="s">{PRIVACY_NOTICE_UPDATED[locale]}</Text>
      {PRIVACY_NOTICE.map((section) => (
        <Section key={section.title.en} spacing="none">
          <Title level={2} size="s">
            {section.title[locale]}
          </Title>
          {section.body ? <Text>{section.body[locale]}</Text> : null}
          {section.items ? (
            <List items={section.items.map((item) => item[locale])} />
          ) : null}
        </Section>
      ))}
    </IntakePage>
  );
}
