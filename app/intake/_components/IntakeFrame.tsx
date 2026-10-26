import type { ReactNode } from "react";
import { Button, Container, Link, Logo, Text } from "@digitaltableteur/react";

import { intakeCopy } from "@/app/lib/intake/copy";
import { ENABLED_INTAKE_LOCALES } from "@/app/lib/intake/data-policy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { LanguageSwitch, LanguageSync } from "./LanguageControls";
import styles from "./intake.module.css";

/**
 * Page frame for every intake page: brand, language, sign-out, privacy
 * notice. Pages tied to an invite fix the language to the invite's and
 * hide the switch.
 */
export function IntakeFrame({
  locale,
  signedIn = false,
  languageSwitch = true,
  children,
}: {
  locale: IntakeLocale;
  signedIn?: boolean;
  languageSwitch?: boolean;
  children: ReactNode;
}) {
  const t = intakeCopy(locale);
  return (
    <div className={styles.shell} lang={locale}>
      <LanguageSync locale={locale} />
      <header className={styles.header}>
        <Container size="lg" className={styles.headerInner}>
          <span className={styles.brand}>
            <Logo size={32} title="Digitaltableteur" />
            <Text as="span" size="s">
              {t("areaName")}
            </Text>
          </span>
          <span className={styles.headerActions}>
            {languageSwitch ? (
              <LanguageSwitch locale={locale} locales={ENABLED_INTAKE_LOCALES} label={t("languageLabel")} />
            ) : null}
            {signedIn ? (
              <form method="post" action="/api/intake/auth/logout">
                <Button submits variant="secondary" size="sm">
                  {t("signOut")}
                </Button>
              </form>
            ) : null}
          </span>
        </Container>
      </header>
      <main id="main-content" className={styles.main}>
        <Container size="lg">{children}</Container>
      </main>
      <footer className={styles.footer}>
        <Container size="lg" className={styles.footerInner}>
          <Link href={`/intake/privacy?lang=${locale}`} size="sm">
            {t("privacyLink")}
          </Link>
          <Link href="https://www.digitaltableteur.com/" size="sm">
            {t("backToSite")}
          </Link>
        </Container>
      </footer>
    </div>
  );
}
