import { z } from "zod";

import { QUESTIONNAIRE_IDS } from "@/app/lib/intake";
import { isEnabledLocale } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

/** The invite form, shared by preview and send. */
export const InviteBody = z
  .object({
    email: z.email().max(254),
    name: z.string().trim().min(1).max(200),
    questionnaireId: z.enum(QUESTIONNAIRE_IDS),
    locale: z.string().refine(isEnabledLocale).transform((value) => value as IntakeLocale),
    note: z.string().max(600).optional(),
  })
  .strict();
