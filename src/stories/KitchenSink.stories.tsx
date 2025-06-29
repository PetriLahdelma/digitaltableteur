import React, { Suspense } from "react";
import { Meta } from "@storybook/react-webpack5";

// Dynamically import all .tsx files in components (excluding stories/test files)
// @ts-ignore
const req = (require as any).context(
  "../components",
  true,
  /^(?!.*(stories|test)\.tsx$).*\.tsx$/,
);

const modules: Record<string, React.ComponentType<any>> = req
  .keys()
  .reduce((acc: Record<string, React.ComponentType<any>>, key: string) => {
    const match = key.match(/\/([A-Za-z0-9_-]+)\.tsx$/);
    const componentName = match?.[1];
    const mod = req(key);
    const Comp = mod && (mod.default || mod);
    if (
      componentName &&
      (typeof Comp === "function" ||
        (typeof Comp === "object" && Comp !== null))
    ) {
      acc[componentName] = Comp as React.ComponentType<any>;
    }
    return acc;
  }, {});

export default {
  title: "Testing/Kitchen Sink",
} as Meta;

const EXCLUDED_COMPONENTS = ["ContactForm", "Link"];

export const AllComponents = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <div style={{ padding: "1rem", display: "grid", gap: "2rem" }}>
      {Object.entries(modules)
        .filter(([name]) => !EXCLUDED_COMPONENTS.includes(name))
        .map(([name, Component]) => (
          <div key={name} style={{ display: "grid", gap: "1rem" }}>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div>
              {/* Defensive: Only render if Component is a function or class */}
              {typeof Component === "function" ? <Component /> : null}
            </div>
          </div>
        ))}
    </div>
  </Suspense>
);
