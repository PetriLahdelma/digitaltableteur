export type ElementDefinition = readonly [
  tagName: string,
  constructor: CustomElementConstructor,
];

export function requireCustomElementRegistry(): CustomElementRegistry {
  if (!globalThis.customElements) {
    throw new Error(
      "Custom elements can only be registered in a browser-like environment.",
    );
  }
  return globalThis.customElements;
}

export function defineElementSet(
  definitions: readonly ElementDefinition[],
  registry: CustomElementRegistry = requireCustomElementRegistry(),
): readonly string[] {
  for (const [tagName, constructor] of definitions) {
    const existing = registry.get(tagName);
    if (existing && existing !== constructor) {
      throw new Error(
        `Cannot register ${tagName}: another implementation is already defined. ` +
          "Load exactly one Digitaltableteur registry mode per document.",
      );
    }
  }

  for (const [tagName, constructor] of definitions) {
    if (!registry.get(tagName)) registry.define(tagName, constructor);
  }

  return definitions.map(([tagName]) => tagName);
}
