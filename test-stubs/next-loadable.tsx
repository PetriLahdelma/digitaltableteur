import React from "react";

/** Avoid Next loadable.shared-runtime pulling a second React copy under Vitest. */
export default function dynamic(
  loader: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
) {
  function Loadable(props: Record<string, unknown>) {
    const [Component, setComponent] = React.useState<React.ComponentType<
      Record<string, unknown>
    > | null>(null);

    React.useEffect(() => {
      let active = true;
      loader().then((mod) => {
        if (!active) return;
        setComponent(() => mod.default);
      });
      return () => {
        active = false;
      };
    }, []);

    if (!Component) return null;
    return React.createElement(Component, props);
  }
  Loadable.displayName = "LoadableMock";
  return Loadable;
}
