import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Helpers for SSR + hydration evidence (Astryx-gap Phase 4).
 *
 * The evidence answers two deterministic questions per exported component of
 * @digitaltableteur/react, measured against the built dist:
 *
 * - ssr: does renderToString succeed in a Node process WITHOUT DOM globals
 *   (the real server condition Next puts the package in)?
 * - hydration: does hydrateRoot over that server HTML complete in jsdom
 *   without recoverable hydration errors or hydration-mismatch console
 *   errors (the same stubbed browser environment the unit suite tests in)?
 *
 * Render timings are informational runtime data, never substance: they vary
 * by machine and run, so they live outside the stamp comparison.
 */

/**
 * Load a component's contract JSON from either shared/components or
 * shared/patterns. Shared by the SSR process and the hydration worker so
 * both derive the exact same render plan.
 */
export function loadComponentContract(root, name) {
  for (const base of [
    "nextjs-app/shared/components",
    "nextjs-app/shared/patterns",
  ]) {
    const path = join(root, base, name, `${name}.contract.json`);
    if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  }
  return null;
}

/**
 * Type-driven synthesis for required props that JSON contract defaults can
 * never express: functions and refs. Synthesis is a HARNESS capability and
 * every synthesized prop is recorded in the artifact, so the evidence stays
 * transparent about what the contract supplied vs what the harness filled.
 *
 * Returns { value, rule } or null when the type is not synthesizable.
 */
export function synthesizeProp(type) {
  const normalized = String(type ?? "");
  if (/^(React\.)?RefObject\b/.test(normalized)) {
    return { value: { current: null }, rule: "ref → { current: null }" };
  }
  if (!normalized.includes("=>")) return null;
  const returnType = normalized.slice(normalized.lastIndexOf("=>") + 2).trim();
  if (/^void\b|^Promise<void>/.test(returnType)) {
    return { value: () => {}, rule: "handler → no-op (never called during render)" };
  }
  if (/^string\b/.test(returnType)) {
    return {
      value: (input) =>
        typeof input === "object" && input !== null
          ? String(input.id ?? input.key ?? JSON.stringify(input))
          : String(input ?? "evidence"),
      rule: "string-deriving fn → stable id/stringify",
    };
  }
  if (/^(React\.)?Key\b/.test(returnType)) {
    return {
      value: (_input, index) => index ?? 0,
      rule: "key-deriving fn → index",
    };
  }
  return {
    value: () => ({ children: "Evidence" }),
    rule: "content-deriving fn → { children: 'Evidence' }",
  };
}

/**
 * Decide how (and whether) a component can be rendered from contract data
 * alone. Returns { props, synthesized } when renderable, { skip } with an
 * honest reason when not. A skip is a harness limitation, never component
 * evidence.
 */
export function renderPlanFor(exportName, contract) {
  if (!contract) {
    // Hooks, adapters, and runtime helpers have no component contract; they
    // are not renderable components and are out of scope by design.
    return { skip: "no component contract (not a renderable component export)" };
  }
  const defaults = contract.playground?.defaults ?? {};
  const props = { ...defaults };
  const synthesized = {};
  const missingRequired = [];
  for (const [name, spec] of Object.entries(contract.props ?? {})) {
    if (spec?.optional === true || name === "children" || name in props) continue;
    const synthesis = synthesizeProp(spec?.type);
    if (synthesis) {
      props[name] = synthesis.value;
      synthesized[name] = synthesis.rule;
    } else {
      missingRequired.push(name);
    }
  }
  if (missingRequired.length) {
    return {
      skip: `required props without playground defaults: ${missingRequired.join(", ")}`,
    };
  }
  const childrenSpec = contract.props?.children;
  if (childrenSpec && childrenSpec.optional !== true && !("children" in props)) {
    props.children = "Evidence";
  }
  return { props, synthesized };
}

/**
 * Resolve JSON-safe element descriptors ({ __element, props, children })
 * into real React elements, mirroring .storybook/lib/resolveElements.tsx so
 * contract defaults render the same way in the harness as in Storybook.
 * createElement and the component lookup are injected so both the SSR
 * process and the hydration worker resolve against the built dist.
 */
export function resolveDescriptors(value, createElement, lookup) {
  if (Array.isArray(value)) {
    return value.map((item) => resolveDescriptors(item, createElement, lookup));
  }
  if (typeof value === "object" && value !== null) {
    if (typeof value.__element === "string") {
      const { __element, props = {}, children } = value;
      const component = lookup(__element) ?? __element;
      const resolvedProps = {};
      for (const [name, propValue] of Object.entries(props)) {
        resolvedProps[name] = resolveDescriptors(propValue, createElement, lookup);
      }
      return children !== undefined
        ? createElement(
            component,
            resolvedProps,
            resolveDescriptors(children, createElement, lookup),
          )
        : createElement(component, resolvedProps);
    }
    const resolved = {};
    for (const [name, propValue] of Object.entries(value)) {
      resolved[name] = resolveDescriptors(propValue, createElement, lookup);
    }
    return resolved;
  }
  return value;
}

/**
 * Assemble the report substance. Only deterministic facts participate:
 * statuses, error messages, and server HTML byte counts. Sorted keys keep
 * reruns byte-stable when nothing changed.
 */
export function assembleSsrEvidence({
  packageName,
  packageVersion,
  reactVersion,
  jsdomVersion,
  entries,
}) {
  const sortedEntries = {};
  const totals = { ssrPass: 0, ssrError: 0, hydrationClean: 0, hydrationError: 0, skipped: 0 };
  for (const entryName of Object.keys(entries).sort()) {
    const entry = entries[entryName];
    const components = {};
    for (const name of Object.keys(entry.components).sort()) {
      const result = entry.components[name];
      components[name] = result;
      if (result.status === "skipped") totals.skipped += 1;
      else if (result.ssr?.ok === false) totals.ssrError += 1;
      else {
        totals.ssrPass += 1;
        if (result.hydration?.ok === true) totals.hydrationClean += 1;
        else if (result.hydration?.ok === false) totals.hydrationError += 1;
      }
    }
    sortedEntries[entryName] = {
      ...(entry.importError ? { importError: entry.importError } : {}),
      components,
    };
  }
  return {
    package: { name: packageName, version: packageVersion },
    environment: {
      react: reactVersion,
      jsdom: jsdomVersion,
      ssr: "node renderToString without DOM globals (the server condition Next runs the package in)",
      hydration:
        "hydrateRoot over the server HTML in jsdom with the unit suite's browser-API stubs (matchMedia, ResizeObserver, IntersectionObserver); recoverable hydration errors and hydration console errors fail the check",
    },
    methodology: {
      props:
        "components render with their contract playground defaults; required function/ref props (inexpressible in JSON) are synthesized by type-driven rules and recorded per component under `synthesized`; element descriptors ({ __element }) resolve against the built dist exactly as Storybook resolves them; a required prop that is neither defaulted nor synthesizable skips the component (harness limitation, recorded, never counted as component evidence)",
      errors:
        "an ssr error means renderToString threw for this component standalone; the recorded message distinguishes browser-API access from missing host context — both are real facts about server-rendering the component outside the app shell",
      timings:
        "render timings are informational runtime data outside the substance stamp; they vary by machine and never gate anything",
    },
    totals,
    entries: sortedEntries,
  };
}

/**
 * Classify one component measurement into the record the artifact stores.
 */
export function componentRecord({
  skip,
  ssrError,
  htmlBytes,
  hydrationErrors,
  synthesized,
}) {
  if (skip) return { status: "skipped", reason: skip };
  const synthesizedField =
    synthesized && Object.keys(synthesized).length ? { synthesized } : {};
  if (ssrError) {
    return {
      status: "ssr-error",
      ssr: { ok: false, error: ssrError },
      ...synthesizedField,
    };
  }
  const hydration =
    hydrationErrors == null
      ? undefined
      : hydrationErrors.length
        ? { ok: false, errors: hydrationErrors }
        : { ok: true };
  return {
    status: hydration?.ok === false ? "hydration-error" : "pass",
    ssr: { ok: true, htmlBytes },
    ...(hydration ? { hydration } : {}),
    ...synthesizedField,
  };
}

/**
 * Table/list fragment elements cannot parse or hydrate inside a generic
 * <div> container; give them the minimal valid ancestor chain so a
 * hydration mismatch means the COMPONENT drifted, not the harness.
 * Returns the nested tag names, outermost first, or [] for a plain div.
 */
export function hydrationContainerChainFor(contractElement) {
  switch (contractElement) {
    case "tr":
      return ["table", "tbody"];
    case "td":
    case "th":
      return ["table", "tbody", "tr"];
    case "tbody":
    case "thead":
    case "tfoot":
    case "caption":
    case "colgroup":
      return ["table"];
    case "li":
      return ["ul"];
    case "option":
    case "optgroup":
      return ["select"];
    case "dt":
    case "dd":
      return ["dl"];
    default:
      return [];
  }
}

/** Normalize an error into a stable, machine-diffable one-line message. */
export function stableErrorMessage(error) {
  const message = String(error?.message ?? error ?? "unknown error");
  return message.split("\n")[0].slice(0, 300);
}
