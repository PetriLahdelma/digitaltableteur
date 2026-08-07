/**
 * Browser-side runtime for override-precedence evidence
 * (docs/OVERRIDE_EVIDENCE_SPEC.md increment A). Bundled by
 * measure-override-evidence.mjs together with the dist entries and executed
 * in real Chromium; never imported in node.
 *
 * For each component: render the SSR-evidence plan from the built dist, then
 * (INV-1) re-render with the probe class merged into className and assert
 * each probed property computes to its sentinel on the root element, and
 * (INV-2) probe each contract-declared theming var for liveness against a
 * computed-style fingerprint of the base subtree.
 */
import {
  hydrationContainerChainFor,
  renderPlanFor,
  resolveDescriptors,
} from "./ssr-evidence-lib.mjs";
import {
  PROBE_CLASS,
  PROBE_PROPERTIES,
  overrideTargetsFor,
} from "./override-evidence-lib.mjs";

function nextPaint() {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
}

function subtreeFingerprint(root) {
  const parts = [];
  const walk = (el) => {
    const style = getComputedStyle(el);
    let line = "";
    for (let i = 0; i < style.length; i += 1) {
      const prop = style[i];
      line += `${prop}:${style.getPropertyValue(prop)};`;
    }
    parts.push(line);
    for (const child of el.children) walk(child);
  };
  walk(root);
  return parts.join("\n");
}

const CHILD_MARKER = "dtProbeChildMarker";

/**
 * Sub-slot composition recipes (increment C): how to place a child inside a
 * container's SEMANTIC slot, where the container's descendant rules actually
 * reach (Menu's `.item > *` only applies inside MenuItem). Explicit and
 * reviewable, like the gallery's PreviewSpec — a recipe is added when a
 * hostile container's rules are unreachable through direct children.
 */
const SUBSLOT_RECIPES = {
  Menu(createElement, lookup, child) {
    const MenuTrigger = lookup("MenuTrigger");
    const MenuContent = lookup("MenuContent");
    const MenuItem = lookup("MenuItem");
    if (!MenuTrigger || !MenuContent || !MenuItem) return null;
    return {
      props: { open: true },
      children: [
        createElement(MenuTrigger, { key: "t" }, "Open"),
        createElement(
          MenuContent,
          { key: "c" },
          createElement(MenuItem, null, child),
        ),
      ],
    };
  },
};

export async function runOverrideEvidence({
  React,
  ReactDOMClient,
  modules,
  components,
  matrixContainers = [],
}) {
  const { createElement } = React;
  const lookup = (name) => {
    for (const mod of Object.values(modules)) {
      if (name in mod) return mod[name];
    }
    return undefined;
  };

  const mountHost = document.createElement("div");
  document.body.appendChild(mountHost);

  async function renderInto(Component, props, containerChain) {
    const wrapper = document.createElement("div");
    let container = wrapper;
    for (const tag of containerChain) {
      const level = document.createElement(tag);
      container.appendChild(level);
      container = level;
    }
    mountHost.appendChild(wrapper);
    // React 19 render errors surface via onUncaughtError, never a
    // synchronous throw; capture them so a provider-required component is
    // recorded as a render error instead of a mislabelled "no root" skip.
    const renderErrors = [];
    const root = ReactDOMClient.createRoot(container, {
      onUncaughtError(error) {
        renderErrors.push(String(error?.message ?? error).split("\n")[0].slice(0, 300));
      },
    });
    root.render(createElement(Component, props));
    await nextPaint();
    return {
      wrapper,
      container,
      rootElement: container.firstElementChild,
      renderError: renderErrors[0] ?? null,
      cleanup() {
        root.unmount();
        wrapper.remove();
      },
    };
  }

  // Neutral reference for the pinned-property discriminator (INV-3): a
  // child only participates in matrix comparisons for properties whose
  // standalone computed value differs from a plain div in the same context,
  // so inherited-by-design values never register as interference.
  const neutralDiv = document.createElement("div");
  mountHost.appendChild(neutralDiv);
  await nextPaint();
  const neutralStyle = getComputedStyle(neutralDiv);
  const neutralComputed = {};
  for (const { prop } of PROBE_PROPERTIES) {
    neutralComputed[prop] = neutralStyle.getPropertyValue(prop);
  }
  neutralDiv.remove();

  const componentCache = new Map();
  const results = {};
  for (const { entry, exportName, contract } of components) {
    const measurement = {};
    try {
      const mod = modules[entry];
      const Component = mod?.[exportName];
      const plan = renderPlanFor(exportName, contract);
      if (plan.skip) {
        results[exportName] = { skip: plan.skip };
        continue;
      }
      const props = resolveDescriptors(plan.props, createElement, lookup);
      const containerChain = hydrationContainerChainFor(contract?.element);
      const targets = overrideTargetsFor(contract);

      // Containers in the INV-3 matrix only need a working render plan (their
      // child is located document-wide, so portal containers qualify); cache
      // before the in-flow-root check. Children additionally need
      // baseComputed + forwarded, added below.
      componentCache.set(exportName, { Component, props, containerChain });
      const base = await renderInto(Component, props, containerChain);
      if (base.renderError) {
        base.cleanup();
        componentCache.delete(exportName);
        results[exportName] = { renderError: base.renderError };
        continue;
      }
      if (!base.rootElement) {
        base.cleanup();
        results[exportName] = {
          skip: "renders no in-flow root element (portal or null render)",
        };
        continue;
      }
      const baseFingerprint = targets.vars.length
        ? subtreeFingerprint(base.rootElement)
        : null;
      const baseStyle = getComputedStyle(base.rootElement);
      const baseComputed = {};
      for (const { prop } of PROBE_PROPERTIES) {
        baseComputed[prop] = baseStyle.getPropertyValue(prop);
      }
      componentCache.get(exportName).baseComputed = baseComputed;
      base.cleanup();

      if (targets.hasClassName) {
        const mergedClassName = [props.className, PROBE_CLASS]
          .filter(Boolean)
          .join(" ");
        const probe = await renderInto(
          Component,
          { ...props, className: mergedClassName },
          containerChain,
        );
        if (!probe.rootElement) {
          measurement.skip =
            "renders no in-flow root element with probe class applied";
        } else if (!probe.rootElement.classList.contains(PROBE_CLASS)) {
          measurement.classNameForwarded = false;
          measurement.overrides = {};
        } else {
          measurement.classNameForwarded = true;
          const style = getComputedStyle(probe.rootElement);
          measurement.overrides = {};
          for (const { prop, value } of PROBE_PROPERTIES) {
            const computed = style.getPropertyValue(prop);
            measurement.overrides[prop] = {
              pass: computed === value,
              computed,
            };
          }
        }
        probe.cleanup();
      }

      if (!measurement.skip && targets.vars.length) {
        measurement.vars = {};
        for (const varTarget of targets.vars) {
          const themed = await renderInto(Component, props, containerChain);
          themed.wrapper.style.setProperty(
            varTarget.name,
            varTarget.probe.value,
          );
          await nextPaint();
          const changed = themed.rootElement
            ? subtreeFingerprint(themed.rootElement) !== baseFingerprint
            : false;
          measurement.vars[varTarget.name] = {
            changed,
            probeValue: varTarget.probe.value,
          };
          themed.cleanup();
        }
      }

      if (
        !measurement.skip &&
        !targets.hasClassName &&
        !targets.vars.length
      ) {
        measurement.skip =
          "contract declares neither className nor theming.vars (out of scope)";
      }
      if (componentCache.has(exportName)) {
        componentCache.get(exportName).forwarded =
          measurement.classNameForwarded === true;
      }
      results[exportName] = measurement;
    } catch (error) {
      results[exportName] = {
        renderError: String(error?.message ?? error).split("\n")[0].slice(0, 300),
      };
    }
  }

  // --- INV-3 matrix (informational): container × child interference ------
  const matrix = [];
  for (const containerName of matrixContainers) {
    const container = componentCache.get(containerName);
    if (!container) {
      matrix.push({
        container: containerName,
        child: "*",
        skip: "container is not renderable in the harness",
      });
      continue;
    }
    for (const [childName, child] of componentCache) {
      if (childName === containerName) continue;
      if (!child.baseComputed || !child.forwarded) continue; // marker travels via className
      if (child.containerChain.length) continue; // fragments need table ancestry
      const pinned = PROBE_PROPERTIES.map((p) => p.prop).filter(
        (prop) => child.baseComputed[prop] !== neutralComputed[prop],
      );
      if (!pinned.length) {
        matrix.push({
          container: containerName,
          child: childName,
          skip: "child pins none of the probed properties",
        });
        continue;
      }
      const childElement = () =>
        createElement(child.Component, {
          ...child.props,
          className: [child.props.className, CHILD_MARKER]
            .filter(Boolean)
            .join(" "),
        });

      const compositions = [
        {
          via: "direct",
          props: { ...container.props, children: childElement() },
        },
      ];
      const recipe = SUBSLOT_RECIPES[containerName];
      if (recipe) {
        const slotted = recipe(createElement, lookup, childElement());
        if (slotted) {
          compositions.push({
            via: "subslot",
            props: {
              ...container.props,
              ...slotted.props,
              children: slotted.children,
            },
          });
        } else {
          matrix.push({
            container: containerName,
            child: childName,
            via: "subslot",
            skip: "sub-slot recipe parts are not exported from the dist",
          });
        }
      }

      for (const composition of compositions) {
        try {
          const composed = await renderInto(
            container.Component,
            composition.props,
            container.containerChain,
          );
          // Portals may place the child outside the wrapper; search the page.
          const marked = document.querySelector(`.${CHILD_MARKER}`);
          if (!marked) {
            matrix.push({
              container: containerName,
              child: childName,
              via: composition.via,
              skip: "container did not render the marked child",
            });
          } else {
            const style = getComputedStyle(marked);
            const diffs = {};
            for (const prop of pinned) {
              const inContainer = style.getPropertyValue(prop);
              if (inContainer !== child.baseComputed[prop]) {
                diffs[prop] = {
                  standalone: child.baseComputed[prop],
                  inContainer,
                };
              }
            }
            matrix.push({
              container: containerName,
              child: childName,
              via: composition.via,
              diffs,
            });
          }
          composed.cleanup();
        } catch (error) {
          matrix.push({
            container: containerName,
            child: childName,
            via: composition.via,
            skip: `composition render failed: ${String(error?.message ?? error).split("\n")[0].slice(0, 200)}`,
          });
        }
      }
    }
  }

  return { results, matrix };
}
