/**
 * Contract-driven Controls: derives the argTypes treatment table at runtime
 * for components registered in .storybook/controls-autogen.json, instead of
 * hand-maintaining ~equivalent argTypes blocks in 125 story files.
 *
 * Sources, in priority order:
 *   1. Hand-written story argTypes/args — always win (presets, bespoke knobs).
 *   2. Docgen inference (JSDoc descriptions, extracted default values).
 *   3. The component contract (machine-checked prop set + union values).
 *
 * The treatment table implemented here is the one documented in
 * nextjs-app/shared/components/AGENTS.md ("Storybook Controls quality bar"):
 *   union            -> inline-radio (<=4 options) / select, options from contract
 *   boolean          -> boolean toggle, seeded to its default (unseeded = dead Set-button)
 *   string           -> text input, seeded "" (component must treat "" as absent)
 *   number           -> number input, seeded to its default (else 0)
 *   on* / function   -> action + hidden row (Actions pane covers it)
 *   ReactNode/object -> hidden row; stories override with mapping presets
 *   children         -> text control (label-like slots); stories override with
 *                       mapping presets when children are composite
 *
 * Enforcement: validate:components skips its static argTypes gate for
 * registered components; the rendered truth is measured by audit:controls
 * (presence, farm --min ratchet) and audit:controls --effects (0 inert).
 */
import type { ArgTypesEnhancer, ArgsEnhancer } from "storybook/internal/types";
import registry from "../controls-autogen.json";

type ContractProp = {
  optional?: boolean;
  type?: string;
  values?: (string | number)[];
};
type Contract = { props?: Record<string, ContractProp> };

const contractModules = import.meta.glob<{ default: Contract }>(
  "../../nextjs-app/shared/{components,patterns}/*/*.contract.json",
  { eager: true },
);

const contracts = new Map<string, Contract>();
for (const [path, mod] of Object.entries(contractModules)) {
  const name = path.split("/").pop()?.replace(".contract.json", "");
  if (name) contracts.set(name, mod.default ?? (mod as unknown as Contract));
}

const AUTOGEN = new Set<string>(registry.components);

// Plumbing a human never sets from a panel — hidden, same set audit:controls skips.
const HIDDEN = new Set([
  "ref",
  "style",
  "key",
  "asChild",
  "as",
  "data-role",
  "aria-label",
  "id",
]);

const componentNameFor = (title?: string) => title?.split("/").pop() ?? "";

const categoryFor = (name: string): string => {
  if (/^on[A-Z]/.test(name)) return "Behavior";
  if (/^aria|^role$|label|accessible|tooltip/i.test(name))
    return "Accessibility";
  if (/^(id|className|style|ref)$/.test(name)) return "Advanced";
  if (
    /variant|tone|size|surface|rounded|square|attached|align|spacing|lineHeight|terminals|weight|color/i.test(
      name,
    )
  )
    return "Appearance";
  return "Content";
};

/** Literal unions the extractor left as a type string: `"a" | "b"` or `1 | 2`. */
const literalUnionValues = (type: string): (string | number)[] | null => {
  const parts = type.split("|").map((p) => p.trim());
  if (parts.length < 2) return null;
  const values: (string | number)[] = [];
  for (const part of parts) {
    if (/^["'].*["']$/.test(part)) values.push(part.slice(1, -1));
    else if (/^-?\d+$/.test(part)) values.push(Number(part));
    else if (part === "undefined") continue;
    else return null;
  }
  return values.length >= 2 ? values : null;
};

const isStringish = (type: string) =>
  /\bstring\b/.test(type) && !/ReactNode|Element|Children/i.test(type);
const isFunction = (type: string) => type.includes("=>") || /^\(/.test(type);

type AnyArgType = Record<string, unknown> & { table?: Record<string, unknown> };

function deriveEntry(
  prop: string,
  spec: ContractProp,
  inherited: AnyArgType | undefined,
): AnyArgType {
  const type = spec.type ?? "";
  const table = { category: categoryFor(prop), ...(inherited?.table ?? {}) };

  if (HIDDEN.has(prop)) return { table: { ...table, disable: true } };
  if (/^on[A-Z]/.test(prop) || isFunction(type)) {
    return { action: prop, table: { ...table, disable: true } };
  }

  const unionValues =
    spec.values ?? (type !== "union" ? literalUnionValues(type) : null);
  if (unionValues) {
    return {
      ...inherited,
      control: { type: unionValues.length <= 4 ? "inline-radio" : "select" },
      options: unionValues,
      table,
    };
  }
  // Object form only: CSF shorthand normalization (control: "text") runs
  // BEFORE argTypes enhancers, so shorthands emitted here render no widget.
  if (/^boolean\b/.test(type))
    return { ...inherited, control: { type: "boolean" }, table };
  if (/^number\b/.test(type))
    return { ...inherited, control: { type: "number" }, table };
  if (prop === "children" || isStringish(type)) {
    return { ...inherited, control: { type: "text" }, table };
  }
  // ReactNode / arrays / objects: a "Set object" button helps nobody — hidden
  // unless the story supplies a mapping preset entry (which wins wholesale).
  return { table: { ...table, disable: true } };
}

/** Seed a no-op default so text/boolean/number controls render operable widgets. */
function seedFor(
  spec: ContractProp,
  inherited: AnyArgType | undefined,
): unknown {
  const type = spec.type ?? "";
  const summary = (
    inherited?.table as { defaultValue?: { summary?: string } } | undefined
  )?.defaultValue?.summary;
  if (/^boolean\b/.test(type)) {
    return summary === "true";
  }
  if (/^number\b/.test(type)) {
    const n = Number(summary);
    return Number.isFinite(n) ? n : 0;
  }
  if (isStringish(type) && !(spec.values || literalUnionValues(type))) {
    return "";
  }
  return undefined; // enums/unions render operable unseeded; ReactNode stays unset
}

export const autogenArgTypes: ArgTypesEnhancer = (context) => {
  if (context.parameters?.implementation === "web-component") {
    return context.argTypes;
  }
  const name = componentNameFor(context.title);
  if (!AUTOGEN.has(name)) return context.argTypes;
  const contract = contracts.get(name);
  if (!contract?.props) return context.argTypes;

  const out = { ...context.argTypes } as Record<string, AnyArgType>;
  for (const [prop, spec] of Object.entries(contract.props)) {
    const existing = out[prop];
    // A story-authored entry (control/options/mapping/action or explicit hide)
    // is deliberate — leave it alone. Docgen-inferred entries carry name/type/
    // description but none of those fields.
    const existingControl = existing?.control as
      | string
      | { type?: string }
      | undefined;
    const existingControlType =
      typeof existingControl === "string"
        ? existingControl
        : existingControl?.type;
    const docgenObjectControl =
      prop === "children" && existingControlType === "object";
    const authored =
      existing &&
      ((!docgenObjectControl && "control" in existing) ||
        "options" in existing ||
        "mapping" in existing ||
        "action" in existing ||
        (existing.table as { disable?: boolean } | undefined)?.disable ===
          true);
    if (authored) continue;
    out[prop] = { ...existing, ...deriveEntry(prop, spec, existing) };
  }
  return out;
};

export const autogenArgs: ArgsEnhancer = (context) => {
  if (context.parameters?.implementation === "web-component") {
    return context.initialArgs;
  }
  const name = componentNameFor(context.title);
  if (!AUTOGEN.has(name)) return context.initialArgs;
  const contract = contracts.get(name);
  if (!contract?.props) return context.initialArgs;

  const seeds: Record<string, unknown> = {};
  for (const [prop, spec] of Object.entries(contract.props)) {
    if (HIDDEN.has(prop) || /^on[A-Z]/.test(prop) || prop === "children")
      continue;
    const argType = (context.argTypes as Record<string, AnyArgType>)[prop];
    if (argType && "mapping" in argType) continue; // preset selects stay unset
    const seed = seedFor(spec, argType);
    if (seed !== undefined) seeds[prop] = seed;
  }
  return { ...seeds, ...context.initialArgs }; // story args always win
};
