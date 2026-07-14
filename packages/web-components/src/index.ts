import { nativeElementDefinitions } from "./native";
import { defineElementSet } from "./registry";

export * from "./generated/element-contracts";
export * from "./native";

/** Registers the framework-free native element fleet. */
export function defineElements(
  registry?: CustomElementRegistry,
): readonly string[] {
  return defineElementSet(nativeElementDefinitions, registry);
}
