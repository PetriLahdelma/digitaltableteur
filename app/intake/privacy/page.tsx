import { List, Text, Title } from "@digitaltableteur/react";

import { PRIVACY_NOTICE, PRIVACY_NOTICE_TITLE, PRIVACY_NOTICE_UPDATED } from "@/app/lib/intake/privacy-notice";

import { IntakeFrame } from "../_components/IntakeFrame";
import styles from "../_components/intake.module.css";
import { requestLocale } from "../_components/locale";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function IntakePrivacyPage({ searchParams }: Props) {
  const locale = await requestLocale(searchParams);
  return (
    <IntakeFrame locale={locale}>
      <article className={styles.narrow}>
        <Title level={1} size="l">
          {PRIVACY_NOTICE_TITLE[locale]}
        </Title>
        <Text size="s">{PRIVACY_NOTICE_UPDATED[locale]}</Text>
        {PRIVACY_NOTICE.map((section) => (
          <section key={section.title.en} className={styles.stack}>
            <Title level={2} size="s">
              {section.title[locale]}
            </Title>
            {section.body ? <Text>{section.body[locale]}</Text> : null}
            {section.items ? <List items={section.items.map((item) => item[locale])} /> : null}
          </section>
        ))}
      </article>
    </IntakeFrame>
  );
}
