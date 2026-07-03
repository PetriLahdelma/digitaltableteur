import React from "react";
import styles from "./ShowcaseStage.module.css";

type ErrorBoundaryState = { error: Error | null };

/**
 * A docs page must never white-screen because one story throws; render the
 * error inline instead so the rest of the page stays useful.
 */
class StageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre className={styles.error}>
          {this.state.error.message || String(this.state.error)}
        </pre>
      );
    }
    return this.props.children;
  }
}

/**
 * Full-width surface stage for the primary story. Honors the theme toolbar
 * because the inner surface uses the same body-background token the theme
 * classes drive.
 */
export function ShowcaseStage({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.stage} data-doc-block="showcase">
      <StageErrorBoundary>{children}</StageErrorBoundary>
    </div>
  );
}
