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

export async function runOverrideEvidence({
  React,
  ReactDOMClient,
  modules,
  components,
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

      const base = await renderInto(Component, props, containerChain);
      if (base.renderError) {
        base.cleanup();
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
      results[exportName] = measurement;
    } catch (error) {
      results[exportName] = {
        renderError: String(error?.message ?? error).split("\n")[0].slice(0, 300),
      };
    }
  }

  return results;
}
