import { redirect } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  FlexBox,
  Text,
  Timestamp,
  Title,
} from "@digitaltableteur/react";

import { intakeCopy } from "@/app/lib/intake/copy";
import { listClientIntakes } from "@/app/lib/intake/service/forms";
import { currentClient } from "@/app/lib/intake/service/session";

import { IntakeColumns, IntakePage } from "../_components/IntakePage";
import { requestLocale } from "../_components/locale";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The client home: intakes in progress and past submissions. */
export default async function IntakeHomePage({ searchParams }: Props) {
  const { ctx, session } = await currentClient();
  if (!session) redirect("/intake");
  const intakes = await listClientIntakes(ctx, session.clientId);
  // A client has one initial intake: take them straight to it. The list is for
  // clients with more than one (later projects).
  if (intakes.length === 1) {
    const [only] = intakes;
    redirect(
      only.status === "submitted" && only.submissionId
        ? `/intake/submissions/${only.submissionId}`
        : `/intake/forms/${only.inviteId}`,
    );
  }
  const locale = await requestLocale(searchParams, intakes[0]?.locale);
  const t = intakeCopy(locale);

  const status = (intake: (typeof intakes)[number]) =>
    intake.status === "submitted"
      ? { tone: "success" as const, label: t("statusSubmitted") }
      : intake.updatedAt
        ? { tone: "info" as const, label: t("statusInProgress") }
        : { tone: "neutral" as const, label: t("statusNotStarted") };

  return (
    <IntakePage locale={locale}>
      <IntakeColumns title={t("homeTitle")} intro={t("homeIntro")}>
        {intakes.length === 0 ? (
          <Text>{t("noIntakes")}</Text>
        ) : (
          intakes.map((intake) => (
            <Card
              key={intake.inviteId}
              as="article"
              title={intake.title}
              titleProps={{ level: 2 }}
              headerEnd={
                <Badge variant="secondary" size="sm" tone={status(intake).tone}>
                  {status(intake).label}
                </Badge>
              }
              footerStart={
                intake.submittedAt ? (
                  <Text as="span" size="s">
                    {t("submittedOn")}{" "}
                    <Timestamp
                      value={intake.submittedAt}
                      format="date"
                      locale={locale}
                    />
                  </Text>
                ) : intake.updatedAt ? (
                  <Text as="span" size="s">
                    {t("lastSaved")}{" "}
                    <Timestamp
                      value={intake.updatedAt}
                      format="date_time"
                      locale={locale}
                    />
                  </Text>
                ) : null
              }
              footerEnd={
                intake.status === "submitted" && intake.submissionId ? (
                  <Button
                    href={`/intake/submissions/${intake.submissionId}`}
                    variant="secondary"
                  >
                    {t("viewSubmission")}
                  </Button>
                ) : (
                  <Button href={`/intake/forms/${intake.inviteId}`}>
                    {intake.updatedAt ? t("openIntake") : t("startIntake")}
                  </Button>
                )
              }
            />
          ))
        )}
      </IntakeColumns>
    </IntakePage>
  );
}
