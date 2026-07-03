import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { isValidElement, type ReactElement } from "react";
import { resolveValue } from "./resolveElements";

describe("resolveValue", () => {
    it("passes primitives and plain objects through untouched", () => {
        expect(resolveValue("hello")).toBe("hello");
        expect(resolveValue(3)).toBe(3);
        expect(resolveValue({ a: 1 })).toEqual({ a: 1 });
    });

    it("resolves a known element descriptor to a React element", () => {
        const resolved = resolveValue({ __element: "Badge", props: { children: "3" } });
        expect(isValidElement(resolved)).toBe(true);
        render(<>{resolved}</>);
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("resolves descriptors nested in arrays and objects, adding array keys", () => {
        const resolved = resolveValue([
            { __element: "Badge", props: { children: "a" } },
            { __element: "Badge", props: { children: "b" } },
        ]) as ReactElement[];
        expect(resolved.map((el) => el.key)).toEqual(["0", "1"]);
    });

    it("falls back to the tag string for unknown component names", () => {
        const resolved = resolveValue({ __element: "span", props: { children: "raw" } });
        render(<>{resolved}</>);
        expect(screen.getByText("raw").tagName).toBe("SPAN");
    });
});
