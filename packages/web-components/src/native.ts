import { DtProgressElement } from "./native/progress";
import { DtSpinnerElement } from "./native/spinner";
import { defineElementSet, type ElementDefinition } from "./registry";

export { DtProgressElement } from "./native/progress";
export type { DtProgressSize, DtProgressState } from "./native/progress";
export { DtSpinnerElement } from "./native/spinner";
export type { DtSpinnerSize } from "./native/spinner";

export const nativeElementDefinitions = [
  ["dt-spinner", DtSpinnerElement],
  ["dt-progress", DtProgressElement],
] as const satisfies readonly ElementDefinition[];

export function defineNativeElements(
  registry?: CustomElementRegistry,
): readonly string[] {
  return defineElementSet(nativeElementDefinitions, registry);
}
