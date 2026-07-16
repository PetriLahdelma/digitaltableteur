#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { icons as phosphorIcons } from "@phosphor-icons/core";
import { validateImplementationLifecycle } from "./web-component-lifecycle.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_ROOT = join(ROOT, "packages/web-components");
const GENERATED_ROOT = join(PACKAGE_ROOT, "src/generated");
const PHOSPHOR_CORE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.resolve("@phosphor-icons/core"))),
  "..",
);
const CONFIG_PATH = join(PACKAGE_ROOT, "web-components.config.mjs");
const PUBLIC_API_PATH = join(ROOT, "packages/react/public-api.manifest.json");
const ICON_REGISTRY_PATH = join(
  ROOT,
  "nextjs-app/shared/components/Icon/iconRegistry.ts",
);
const DISCOVERED_ICON_REGISTRY_PATH = join(
  ROOT,
  "nextjs-app/shared/components/Icon/iconRegistry.discovered.ts",
);
const ICON_ALIASES_PATH = join(
  ROOT,
  "nextjs-app/shared/components/Icon/iconAliases.ts",
);
const CHECK = process.argv.includes("--check");

const { default: elements } = await import(pathToFileURL(CONFIG_PATH));
const publicApi = JSON.parse(readFileSync(PUBLIC_API_PATH, "utf8"));

const dashed = (value) =>
  value.replace(/([a-z0-9])([A-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`);
const quote = (value) => JSON.stringify(value);

function contractFor(element) {
  const path = join(
    ROOT,
    "nextjs-app/shared/components",
    element.contractDirectory ?? element.contract,
    `${element.contract}.contract.json`,
  );
  return JSON.parse(readFileSync(path, "utf8"));
}

function validate() {
  const tags = new Set();
  const classes = new Set();
  for (const element of elements) {
    if (tags.has(element.tagName))
      throw new Error(`Duplicate tag ${element.tagName}`);
    if (element.adapterClassName && classes.has(element.adapterClassName)) {
      throw new Error(`Duplicate adapter class ${element.adapterClassName}`);
    }
    tags.add(element.tagName);
    if (element.adapterClassName) classes.add(element.adapterClassName);

    if (
      element.adapterClassName &&
      !publicApi.runtimeExports.includes(element.sourceComponent)
    ) {
      throw new Error(
        `${element.tagName} React adapter references non-public React export ${element.sourceComponent}`,
      );
    }
    if (!element.tagName.startsWith("dt-")) {
      throw new Error(`${element.tagName} must use the dt- prefix`);
    }
    if (!["react", "native"].includes(element.defaultBackend)) {
      throw new Error(`${element.tagName} has invalid defaultBackend`);
    }
    if (element.defaultBackend === "native" && !element.nativeClassName) {
      throw new Error(
        `${element.tagName} is native but has no nativeClassName`,
      );
    }
    if (element.defaultBackend === "native" && !element.storyParity) {
      throw new Error(
        `${element.tagName} must declare storyParity for the web-component DoD`,
      );
    }
    for (const equivalent of element.storyParity?.equivalents ?? []) {
      if (!equivalent.react || !equivalent.native) {
        throw new Error(
          `${element.tagName} has an incomplete storyParity equivalent`,
        );
      }
    }
    for (const exclusion of element.storyParity?.exclusions ?? []) {
      if (!exclusion.react || exclusion.reason?.trim().length < 16) {
        throw new Error(
          `${element.tagName} storyParity exclusions require a React story and concrete reason`,
        );
      }
    }
    for (const extension of element.storyParity?.extensions ?? []) {
      if (!extension.native || extension.reason?.trim().length < 16) {
        throw new Error(
          `${element.tagName} storyParity extensions require a native story and concrete reason`,
        );
      }
    }
    const slotNames = new Set();
    for (const slot of element.slots ?? []) {
      if (slotNames.has(slot.name)) {
        throw new Error(
          `${element.tagName} declares duplicate slot ${slot.name}`,
        );
      }
      if (!slot.description?.trim()) {
        throw new Error(
          `${element.tagName} slot ${slot.name} needs a description`,
        );
      }
      slotNames.add(slot.name);
    }

    const contract = contractFor(element);
    validateImplementationLifecycle(element, contract);
    for (const prop of element.props) {
      if (!prop.sourceProp) continue;
      if (!contract.props?.[prop.sourceProp]) {
        throw new Error(
          `${element.tagName}.${prop.name} maps to missing ${element.contract}.${prop.sourceProp}`,
        );
      }
    }
    for (const event of element.events) {
      if (!event.name?.trim() || !event.description?.trim()) {
        throw new Error(
          `${element.tagName} events require a name and description`,
        );
      }
      if (!event.callbackProp && element.defaultBackend !== "native") {
        throw new Error(
          `${element.tagName}.${event.name} requires a React callback mapping`,
        );
      }
      if (event.callbackProp && !contract.props?.[event.callbackProp]) {
        throw new Error(
          `${element.tagName}.${event.name} maps to missing ${element.contract}.${event.callbackProp}`,
        );
      }
    }
  }
}

function renderAdapter(element) {
  const interfaceName = element.adapterClassName.replace(/Element$/, "Props");
  const propRows = element.props
    .map(
      (prop) =>
        `  ${prop.name}?: ${prop.type === "number" ? "number" : prop.type === "boolean" ? "boolean" : "string"};`,
    )
    .join("\n");
  const eventRows = element.events
    .map((event) => `  ${event.callbackProp}?: (detail?: unknown) => void;`)
    .join("\n");
  const propConfig = element.props
    .map((prop) => `    ${prop.name}: ${quote(prop.type)},`)
    .join("\n");
  const eventConfig = element.events
    .map(
      (event) =>
        `    ${event.callbackProp}: { bubbles: true, composed: true },`,
    )
    .join("\n");
  const sourceMappings = [
    ...element.props
      .filter((prop) => prop.sourceProp !== "children")
      .map((prop) => `${prop.sourceProp}: props.${prop.name}`),
    ...element.events.map(
      (event) => `${event.callbackProp}: props.${event.callbackProp}`,
    ),
  ].join(", ");
  const label = element.props.find((prop) => prop.sourceProp === "children");
  const booleanMappings = element.props
    .filter((prop) => prop.type === "boolean")
    .map((prop) => `[${quote(prop.name)}, ${quote(dashed(prop.name))}]`)
    .join(", ");
  const baseClassName = `${element.adapterClassName}Base`;

  return `export interface ${interfaceName} {\n${[propRows, eventRows].filter(Boolean).join("\n")}\n}\n\nconst ${element.adapterClassName}Adapter: React.FC<${interfaceName}> = (props) =>\n  React.createElement(\n    ${element.sourceComponent} as unknown as React.ComponentType<Record<string, unknown>>,\n    { ${sourceMappings} },\n    ${label ? `props.${label.name}` : "undefined"},\n  );\n\nconst ${baseClassName} = r2wc(${element.adapterClassName}Adapter, {\n  props: {\n${propConfig}\n  },${eventConfig ? `\n  events: {\n${eventConfig}\n  },` : ""}\n});\n\nexport const ${element.adapterClassName} = withStandardBooleanAttributes(\n  ${baseClassName},\n  [${booleanMappings}],\n);`;
}

function renderReactAdapters() {
  const adapterElements = elements.filter(
    (element) => element.adapterClassName,
  );
  const imports = adapterElements
    .map((element) => element.sourceComponent)
    .join(", ");
  const adapters = adapterElements.map(renderAdapter).join("\n\n");
  const allDefinitions = adapterElements
    .map(
      (element) =>
        `  [${quote(element.tagName)}, ${element.adapterClassName}],`,
    )
    .join("\n");
  const hybridDefinitions = adapterElements
    .filter((element) => element.defaultBackend === "react")
    .map(
      (element) =>
        `  [${quote(element.tagName)}, ${element.adapterClassName}],`,
    )
    .join("\n");

  return `/* This file is generated by scripts/design-system/generate-web-components.mjs. */\nimport React from "react";\nimport r2wc from "@r2wc/react-to-web-component";\nimport { ${imports} } from "@digitaltableteur/react";\nimport type { ElementDefinition } from "../registry";\n\ntype AttributeChanged = (name: string, oldValue: string | null, value: string | null) => void;\n\nfunction withStandardBooleanAttributes(\n  Base: CustomElementConstructor,\n  mappings: readonly (readonly [property: string, attribute: string])[],\n): CustomElementConstructor {\n  if (mappings.length === 0) return Base;\n  const baseCallback = (Base.prototype as { attributeChangedCallback?: AttributeChanged })\n    .attributeChangedCallback;\n  const booleanAttributes = new Set(mappings.map(([, attribute]) => attribute));\n\n  class StandardBooleanElement extends Base {\n    constructor() {\n      super();\n      for (const [, attribute] of mappings) {\n        if (this.getAttribute(attribute) === "") {\n          baseCallback?.call(this, attribute, null, "true");\n        }\n      }\n    }\n\n    attributeChangedCallback(\n      name: string,\n      oldValue: string | null,\n      value: string | null,\n    ): void {\n      const normalized = booleanAttributes.has(name)\n        ? value === null\n          ? "false"\n          : value === ""\n            ? "true"\n            : value\n        : value;\n      baseCallback?.call(this, name, oldValue, normalized);\n    }\n  }\n\n  for (const [property, attribute] of mappings) {\n    const baseProperty = Object.getOwnPropertyDescriptor(Base.prototype, property);\n    Object.defineProperty(StandardBooleanElement.prototype, property, {\n      configurable: true,\n      enumerable: true,\n      get() {\n        return Boolean(baseProperty?.get?.call(this));\n      },\n      set(value: unknown) {\n        this.toggleAttribute(attribute, Boolean(value));\n      },\n    });\n  }\n\n  return StandardBooleanElement;\n}\n\n${adapters}\n\nexport const reactElementDefinitions = [\n${allDefinitions}\n] as const satisfies readonly ElementDefinition[];\n\nexport const hybridReactElementDefinitions = [\n${hybridDefinitions}\n] as const satisfies readonly ElementDefinition[];\n`;
}

function renderElementContracts() {
  const interfaces = elements
    .map((element) => {
      const name = `${element.nativeClassName}Contract`;
      const props = element.props
        .filter((prop) => !prop.attributeOnly)
        .map(
          (prop) =>
            `  ${prop.name}?: ${prop.propertyType ?? (prop.type === "number" ? "number" : prop.type === "boolean" ? "boolean" : "string")};`,
        )
        .join("\n");
      return `export type ${name} = HTMLElement & {\n${props}\n};`;
    })
    .join("\n\n");
  const tagRows = elements
    .map(
      (element) =>
        `    ${quote(element.tagName)}: ${element.nativeClassName}Contract;`,
    )
    .join("\n");
  const migrationRows = elements
    .map((element) => {
      const contract = contractFor(element);
      return `  { tagName: ${quote(element.tagName)}, sourceComponent: ${quote(element.sourceComponent)}, backend: ${quote(element.defaultBackend)}, contractStatus: ${quote(contract.status)}, implementationStatus: ${quote(element.implementationStatus)}, implementationConsumers: ${JSON.stringify(element.implementationConsumers ?? [])} },`;
    })
    .join("\n");

  return `/* This file is generated by scripts/design-system/generate-web-components.mjs. */\n${interfaces}\n\nexport const elementMigrationManifest = [\n${migrationRows}\n] as const;\n\ndeclare global {\n  interface HTMLElementTagNameMap {\n${tagRows}\n  }\n}\n`;
}

function extractPhosphorExports(source) {
  const names = new Set();
  const imports = source.matchAll(
    /import\s*\{([\s\S]*?)\}\s*from\s*["']@phosphor-icons\/react\/ssr["'];/g,
  );
  for (const match of imports) {
    for (const entry of match[1].split(",")) {
      const name = entry.trim().split(/\s+as\s+/)[0];
      if (name) names.add(name);
    }
  }
  return names;
}

function extractIconAliases(source) {
  const body = source.match(/ICON_ALIASES[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1];
  if (!body) throw new Error("Unable to parse ICON_ALIASES");

  const aliases = {};
  for (const line of body.split("\n")) {
    const match = line.match(
      /^\s*(?:"([^"]+)"|([A-Za-z_$][\w$]*)):\s*"([^"]+)",?\s*$/,
    );
    if (match) aliases[match[1] ?? match[2]] = match[3];
  }
  return aliases;
}

function renderNativeIconData() {
  const iconNames = new Set([
    ...extractPhosphorExports(readFileSync(ICON_REGISTRY_PATH, "utf8")),
    ...extractPhosphorExports(
      readFileSync(DISCOVERED_ICON_REGISTRY_PATH, "utf8"),
    ),
  ]);
  const weights = ["thin", "light", "regular", "bold", "fill", "duotone"];
  const icons = {};
  const catalog = new Map(
    phosphorIcons.map((icon) => [icon.pascal_name, icon.name]),
  );

  for (const name of [...iconNames].sort()) {
    const assetName = catalog.get(name);
    if (!assetName) throw new Error(`Missing Phosphor core asset ${name}`);
    icons[name] = {};
    for (const weight of weights) {
      const assetPath = join(
        PHOSPHOR_CORE_ROOT,
        "assets",
        weight,
        `${assetName}${weight === "regular" ? "" : `-${weight}`}.svg`,
      );
      icons[name][weight] = readFileSync(assetPath, "utf8").replace(
        "<svg ",
        '<svg width="24" height="24" aria-hidden="true" focusable="false" ',
      );
    }
  }

  const aliases = extractIconAliases(readFileSync(ICON_ALIASES_PATH, "utf8"));
  return `/* This file is generated by scripts/design-system/generate-web-components.mjs. */\nexport const nativeIconNames = ${JSON.stringify([...iconNames].sort())} as const;\nexport type NativeIconName = (typeof nativeIconNames)[number];\nexport type NativeIconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";\nexport type NativeIconMarkup = Readonly<Record<NativeIconName, Readonly<Record<NativeIconWeight, string>>>>;\n\nexport const nativeIconMarkup: NativeIconMarkup = ${JSON.stringify(icons, null, 2)};\n\nexport const nativeIconAliases: Readonly<Record<string, string>> = ${JSON.stringify(aliases, null, 2)};\n`;
}

function renderCustomElementsManifest() {
  return `${JSON.stringify(
    {
      schemaVersion: "2.1.0",
      readme: "./README.md",
      modules: [
        {
          kind: "javascript-module",
          path: "dist/index.js",
          declarations: elements.map((element) => ({
            kind: "class",
            name: element.nativeClassName ?? element.className,
            description: element.description,
            customElement: true,
            tagName: element.tagName,
            ...(element.props.some((prop) => !prop.attributeOnly)
              ? {
                  members: element.props
                    .filter((prop) => !prop.attributeOnly)
                    .map((prop) => ({
                      kind: "field",
                      name: prop.name,
                      description: prop.description || undefined,
                      type: {
                        text:
                          prop.propertyType ??
                          (prop.type === "number"
                            ? "number"
                            : prop.type === "boolean"
                              ? "boolean"
                              : "string"),
                      },
                    })),
                }
              : {}),
            ...(element.slots?.length
              ? {
                  slots: element.slots.map((slot) => ({
                    name: slot.name,
                    description: slot.description,
                  })),
                }
              : {}),
            attributes: element.props
              .filter((prop) => !prop.propertyOnly)
              .map((prop) => ({
                name: prop.attributeName ?? dashed(prop.name),
                fieldName: prop.fieldName ?? prop.name,
                description: prop.description || undefined,
                type: { text: prop.type },
              })),
            events: element.events.map((event) => ({
              name: event.name,
              description: event.description,
              type: { text: "CustomEvent<unknown>" },
            })),
            dtSourceComponent: element.sourceComponent,
            dtBackend: element.defaultBackend,
            dtContractStatus: contractFor(element).status,
            dtImplementationStatus: element.implementationStatus,
            dtImplementationConsumers: element.implementationConsumers ?? [],
          })),
        },
      ],
    },
    null,
    2,
  )}\n`;
}

function update(path, content) {
  let current = null;
  try {
    current = readFileSync(path, "utf8");
  } catch {
    // Missing generated files are drift too.
  }
  if (current === content) return false;
  if (CHECK) {
    console.error(
      `Generated web-component artifact is stale: ${relative(ROOT, path)}`,
    );
    process.exitCode = 1;
    return true;
  }
  writeFileSync(path, content);
  console.log(`generated ${relative(ROOT, path)}`);
  return true;
}

validate();
mkdirSync(GENERATED_ROOT, { recursive: true });
update(join(GENERATED_ROOT, "react-adapters.ts"), renderReactAdapters());
update(join(GENERATED_ROOT, "element-contracts.ts"), renderElementContracts());
update(join(GENERATED_ROOT, "native-icon-data.ts"), renderNativeIconData());
update(
  join(PACKAGE_ROOT, "custom-elements.json"),
  renderCustomElementsManifest(),
);

if (CHECK && !process.exitCode) {
  console.log(
    `✓ web-component generated artifacts match ${elements.length} source contracts`,
  );
}
