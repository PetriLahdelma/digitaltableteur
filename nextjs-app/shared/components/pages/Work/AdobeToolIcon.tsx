import styles from "./AdobeToolIcon.module.css";

type AdobeTool = "illustrator" | "photoshop" | "indesign" | "after-effects";

const TOOL_LABELS: Record<AdobeTool, { mark: string; label: string }> = {
  illustrator: { mark: "Ai", label: "Adobe Illustrator" },
  photoshop: { mark: "Ps", label: "Adobe Photoshop" },
  indesign: { mark: "Id", label: "Adobe InDesign" },
  "after-effects": { mark: "Ae", label: "Adobe After Effects" },
};

export function AdobeToolIcon({ tool }: { tool: AdobeTool }) {
  const { mark, label } = TOOL_LABELS[tool];

  return (
    <span className={styles.icon} role="img" aria-label={label} title={label}>
      {mark}
    </span>
  );
}
