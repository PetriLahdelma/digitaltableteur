import Badge from "@dt/Badge";
import Kbd from "@dt/Kbd";

/**
 * Deployment status panel. Shows the pipeline stage, the release channel,
 * and the shortcut that opens the full log view.
 */
export default function StatusPanel() {
  return (
    <section aria-label="Deployment status">
      <h2>Deployment status</h2>
      <p>
        Pipeline: <Badge variant="tertiary">Building</Badge>
      </p>
      <p>
        Channel: <Badge tone="stable" />
      </p>
      <p>
        Logs: press <Kbd power="high">L</Kbd> to open the full view.
      </p>
    </section>
  );
}
