import React, { Component, ReactNode } from "react";
import Title from "@dt/Title";

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
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "var(--font-body, sans-serif)",
            }}
          >
            <Title level={2}>Loading Error</Title>
            <p>The page is being updated. Refreshing automatically...</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.5rem 1rem",
                background: "#007bff",
                color: "var(--color-white)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Refresh Now
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
