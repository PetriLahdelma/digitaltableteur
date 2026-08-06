/**
 * Pure helpers for SSR + hydration evidence (Astryx-gap Phase 4).
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
 * Decide how (and whether) a component can be rendered from contract data
 * alone. Returns { props } when renderable, { skip } with an honest reason
 * when not. A skip is a harness limitation, never component evidence.
 */
export function renderPlanFor(exportName, contract) {
  if (!contract) {
    // Hooks, adapters, and runtime helpers have no component contract; they
    // are not renderable components and are out of scope by design.
    return { skip: "no component contract (not a renderable component export)" };
  }
  const defaults = contract.playground?.defaults ?? {};
  const props = { ...defaults };
  const propEntries = Object.entries(contract.props ?? {});
  const missingRequired = propEntries
    .filter(
      ([name, spec]) =>
        spec?.optional !== true && name !== "children" && !(name in props),
    )
    .map(([name]) => name);
  if (missingRequired.length) {
    return {
      skip: `required props without playground defaults: ${missingRequired.join(", ")}`,
    };
  }
  const childrenSpec = contract.props?.children;
  if (childrenSpec && childrenSpec.optional !== true && !("children" in props)) {
    props.children = "Evidence";
  }
  return { props };
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
        "components render with their contract playground defaults; a required prop with no default skips the component (harness limitation, recorded, never counted as component evidence)",
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
export function componentRecord({ skip, ssrError, htmlBytes, hydrationErrors }) {
  if (skip) return { status: "skipped", reason: skip };
  if (ssrError) {
    return { status: "ssr-error", ssr: { ok: false, error: ssrError } };
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
