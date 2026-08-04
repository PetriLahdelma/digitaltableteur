import Badge from "@dt/Badge";

export type LegacyChipStatus = "operational" | "degraded" | "down";

const LABELS: Record<LegacyChipStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

const TONES: Record<LegacyChipStatus, "success" | "warning" | "error"> = {
  operational: "success",
  degraded: "warning",
  down: "error",
};

/**
 * Service status chip. Delegates to the design-system Badge, whose tones
 * come from the token system and carry forced-colors evidence: status stays
 * distinguishable through text, not background colour alone.
 */
export default function LegacyChip({ status }: { status: LegacyChipStatus }) {
  return (
    <Badge size="sm" tone={TONES[status]}>
      {LABELS[status]}
    </Badge>
  );
}
