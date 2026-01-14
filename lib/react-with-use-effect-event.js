/**
 * React wrapper that includes useEffectEvent ponyfill for Sanity compatibility.
 *
 * Sanity v5 imports useEffectEvent from 'react', but webpack doesn't properly
 * resolve this export during build. This wrapper re-exports everything from
 * React and adds the ponyfill from 'use-effect-event'.
 */

// Re-export everything from React
export * from "react";
export { default } from "react";

// Export useEffectEvent from the ponyfill
export { useEffectEvent } from "use-effect-event";
