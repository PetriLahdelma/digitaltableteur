import { defineElementSet } from "./registry";

export async function defineReactElements(
  registry?: CustomElementRegistry,
): Promise<readonly string[]> {
  const { reactElementDefinitions } = await import(
    "./generated/react-adapters"
  );
  return defineElementSet(reactElementDefinitions, registry);
}

export type {
  DtBadgeReactElement,
  DtButtonReactElement,
  DtProgressReactElement,
  DtSpinnerReactElement,
} from "./generated/react-adapters";
