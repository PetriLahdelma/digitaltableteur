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

import { IntakePage, IntakeToolbar } from "../_components/IntakePage";
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
  const locale = await requestLocale(searchParams, intakes[0]?.locale);
  const t = intakeCopy(locale);

  return (
    <IntakePage locale={locale}>
      <IntakeToolbar signOutLabel={t("signOut")} />
      <Title level={1} size="l">
        {t("homeTitle")}
      </Title>
      <Text>{t("homeIntro")}</Text>
      {intakes.length === 0 ? (
        <Text>{t("noIntakes")}</Text>
      ) : (
        <FlexBox direction="column" gap="var(--space-internal-16)">
          {intakes.map((intake) => (
            <Card
              key={intake.inviteId}
              as="article"
              title={intake.title}
              titleProps={{ level: 2 }}
              headerEnd={
                <Badge
                  tone={intake.status === "submitted" ? "success" : "info"}
                >
                  {intake.status === "submitted"
                    ? t("statusSubmitted")
                    : t("statusInProgress")}
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
                    size="sm"
                  >
                    {t("viewSubmission")}
                  </Button>
                ) : (
                  <Button href={`/intake/forms/${intake.inviteId}`} size="sm">
                    {intake.updatedAt ? t("openIntake") : t("startIntake")}
                  </Button>
                )
              }
            />
          ))}
        </FlexBox>
      )}
    </IntakePage>
  );
}
