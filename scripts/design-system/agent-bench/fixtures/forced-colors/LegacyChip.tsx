import styles from "./LegacyChip.module.css";

export type LegacyChipStatus = "operational" | "degraded" | "down";

const LABELS: Record<LegacyChipStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

/**
 * Service status chip. Each status renders with its own background colour.
 */
export default function LegacyChip({ status }: { status: LegacyChipStatus }) {
  return (
    <span className={`${styles.chip} ${styles[status]}`}>
      {LABELS[status]}
    </span>
  );
}
