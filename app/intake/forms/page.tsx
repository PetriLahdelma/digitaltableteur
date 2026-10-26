import { redirect } from "next/navigation";
import { Badge, Button, Card, Text, Timestamp, Title } from "@digitaltableteur/react";

import { intakeCopy, resolveIntakeLocale } from "@/app/lib/intake/copy";
import { listClientIntakes } from "@/app/lib/intake/service/forms";
import { currentClient } from "@/app/lib/intake/service/session";

import { IntakeFrame } from "../_components/IntakeFrame";
import styles from "../_components/intake.module.css";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

/** The client home: intakes in progress and past submissions. */
export default async function IntakeHomePage() {
  const { ctx, session } = await currentClient();
  if (!session) redirect("/intake");
  const intakes = await listClientIntakes(ctx, session.clientId);
  // The interface follows the language the client was invited in.
  const locale = resolveIntakeLocale(intakes[0]?.locale ?? null);
  const t = intakeCopy(locale);

  return (
    <IntakeFrame locale={locale} signedIn languageSwitch={false}>
      <div className={styles.narrow}>
        <Title level={1} size="l">
          {t("homeTitle")}
        </Title>
        <Text>{t("homeIntro")}</Text>
        {intakes.length === 0 ? (
          <Text>{t("noIntakes")}</Text>
        ) : (
          <ul className={styles.intakeList}>
            {intakes.map((intake) => (
              <li key={intake.inviteId}>
                <Card
                  as="article"
                  title={intake.title}
                  titleProps={{ level: 2 }}
                  headerEnd={
                    <Badge tone={intake.status === "submitted" ? "success" : "info"}>
                      {intake.status === "submitted" ? t("statusSubmitted") : t("statusInProgress")}
                    </Badge>
                  }
                  footerStart={
                    intake.submittedAt ? (
                      <Text as="span" size="s">
                        {t("submittedOn")} <Timestamp value={intake.submittedAt} format="date" locale={locale} />
                      </Text>
                    ) : intake.updatedAt ? (
                      <Text as="span" size="s">
                        {t("lastSaved")} <Timestamp value={intake.updatedAt} format="date_time" locale={locale} />
                      </Text>
                    ) : null
                  }
                  footerEnd={
                    intake.status === "submitted" && intake.submissionId ? (
                      <Button href={`/intake/submissions/${intake.submissionId}`} variant="secondary" size="sm">
                        {t("viewSubmission")}
                      </Button>
                    ) : (
                      <Button href={`/intake/forms/${intake.inviteId}`} size="sm">
                        {intake.updatedAt ? t("openIntake") : t("startIntake")}
                      </Button>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </IntakeFrame>
  );
}
