import React, { Component, ReactNode } from "react";
import Button from "@dt/Button";
import Title from "@dt/Title";
import styles from "./ChunkErrorBoundary.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk loading error
    const isChunkError =
      error.message.includes("Loading chunk") ||
      error.message.includes("Failed to fetch dynamically imported module");

    return { hasError: isChunkError, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isChunkError =
      error.message.includes("Loading chunk") ||
      error.message.includes("Failed to fetch dynamically imported module");

    if (isChunkError) {
      console.warn("Chunk loading failed, reloading page:", error);
      // Automatically reload the page to get the latest chunks
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className={styles.fallback}>
            <Title level={2}>Loading Error</Title>
            <p>The page is being updated. Refreshing automatically...</p>
            <Button
              type="button"
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Refresh Now
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
