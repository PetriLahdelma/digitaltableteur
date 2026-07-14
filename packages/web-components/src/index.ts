import { nativeElementDefinitions } from "./native";
import { defineElementSet } from "./registry";

export * from "./generated/element-contracts";
export * from "./native";

/**
 * Registers the hybrid fleet: native implementations where they have passed
 * parity review, React adapters for the remaining tags.
 */
export async function defineElements(
  registry?: CustomElementRegistry,
): Promise<readonly string[]> {
  const { hybridReactElementDefinitions } = await import(
    "./generated/react-adapters"
  );
  return defineElementSet(
    [...nativeElementDefinitions, ...hybridReactElementDefinitions],
    registry,
  );
}
