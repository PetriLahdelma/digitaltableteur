import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayerProvider, useLayer } from "./layer";

describe("LayerProvider", () => {
  it("defaults layered UI to document.body", () => {
    const { result } = renderHook(() => useLayer());

    expect(result.current.container).toBe(document.body);
    expect(result.current.role).toBe("modal");
    expect(result.current.zIndex).toBe(5000);
  });

  it("allows hosts to inject a portal container", () => {
    const portalRoot = document.createElement("div");
    document.body.appendChild(portalRoot);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayerProvider container={portalRoot} baseZIndex={7000}>
        {children}
      </LayerProvider>
    );

    const { result } = renderHook(
      () => useLayer({ role: "tooltip", level: 3 }),
      { wrapper },
    );

    expect(result.current.container).toBe(portalRoot);
    expect(result.current.zIndex).toBe(7303);
  });

  it("renders children unchanged", () => {
    render(
      <LayerProvider>
        <div>Layered child</div>
      </LayerProvider>,
    );

    expect(screen.getByText("Layered child")).toBeInTheDocument();
  });
});
