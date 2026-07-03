/**
 * Resolves JSON-safe element descriptors ({ __element, props, children })
 * from contract playground.defaults into real React elements, so contracts
 * can express "this slot defaults to <Icon name='check' />" without code.
 * Astryx pattern (apps/docsite resolveElements.ts), adapted to DT.
 */
import { createElement, type ReactNode } from "react";
import Badge from "@dt/Badge";
import Icon from "@dt/Icon";
import Text from "@dt/Text";
import Title from "@dt/Title";

export type ElementDescriptor = {
    __element: string;
    props?: Record<string, unknown>;
    children?: unknown;
};

/** Extend as doc content adopts more slot elements (Phase 3 batches). */
const REGISTRY: Record<string, React.ComponentType<any>> = {
    Badge,
    Icon,
    Text,
    Title,
};

function isDescriptor(value: unknown): value is ElementDescriptor {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as ElementDescriptor).__element === "string"
    );
}

export function resolveValue(value: unknown, key?: string): unknown {
    if (Array.isArray(value)) {
        return value.map((item, index) => resolveValue(item, String(index)));
    }
    if (isDescriptor(value)) {
        const { __element, props = {}, children } = value;
        const component = REGISTRY[__element] ?? __element;
        const resolvedProps: Record<string, unknown> = { ...props };
        for (const [propName, propValue] of Object.entries(props)) {
            resolvedProps[propName] = resolveValue(propValue);
        }
        if (key != null) resolvedProps.key = key;
        // Only pass a third argument when the descriptor has its own
        // top-level `children`; otherwise omit it so `resolvedProps.children`
        // (resolved from `props.children`, e.g. { props: { children: "3" } })
        // survives. createElement(el, props, undefined) would otherwise
        // overwrite props.children with undefined.
        if (children !== undefined) {
            return createElement(
                component as React.ComponentType<any> | string,
                resolvedProps,
                resolveValue(children) as ReactNode,
            );
        }
        return createElement(component as React.ComponentType<any> | string, resolvedProps);
    }
    if (typeof value === "object" && value !== null) {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolveValue(v)]),
        );
    }
    return value;
}
