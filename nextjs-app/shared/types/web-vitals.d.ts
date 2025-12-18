declare module "web-vitals" {
  export interface Metric {
    name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
    value: number;
    rating: "good" | "needs-improvement" | "poor";
    delta: number;
    id: string;
    navigationType?:
      | "navigate"
      | "reload"
      | "back-forward"
      | "back-forward-cache"
      | "prerender"
      | "restore";
    entries: PerformanceEntry[];
  }

  export type ReportCallback = (metric: Metric) => void;

  export function onCLS(
    callback: ReportCallback,
    options?: { reportAllChanges?: boolean },
  ): void;
  export function onFCP(
    callback: ReportCallback,
    options?: { reportAllChanges?: boolean },
  ): void;
  export function onFID(
    callback: ReportCallback,
    options?: { reportAllChanges?: boolean },
  ): void;
  export function onINP(
    callback: ReportCallback,
    options?: { reportAllChanges?: boolean },
  ): void;
  export function onLCP(
    callback: ReportCallback,
    options?: { reportAllChanges?: boolean },
  ): void;
  export function onTTFB(
    callback: ReportCallback,
    options?: { reportAllChanges?: boolean },
  ): void;
}
