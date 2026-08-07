/**
 * Browser-side runtime for interaction cost evidence (Astryx-gap Phase 4).
 * Bundled by measure-interaction-evidence.mjs, executed in real Chromium;
 * never imported in node.
 *
 * Per renderable component: mount cost, re-render cost (medians inside
 * flushSync — synchronous commit work, no vsync quantization), and the DOM
 * element count of the rendered subtree. For the data primitives, named
 * INTERACTION_RECIPES exercise the documented hot paths with deterministic
 * index-generated datasets and record outcome facts alongside durations.
 */
import {
  hydrationContainerChainFor,
  renderPlanFor,
  resolveDescriptors,
} from "./ssr-evidence-lib.mjs";

const RUNS = 7;

function nextPaint() {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return Number(sorted[Math.floor(sorted.length / 2)].toFixed(2));
}

/**
 * Interaction recipes. Each builds its own deterministic props (functions
 * are fine here — this is browser code, not contract JSON), names a target
 * selector, performs the interaction inside flushSync, and returns
 * deterministic facts about the outcome. Datasets are index-generated: no
 * Math.random, no Date.
 */
const INTERACTION_RECIPES = {
  DataTable: {
    name: "sort 1k rows (header click)",
    props(createElement) {
      const data = Array.from({ length: 1000 }, (_, index) => ({
        id: `row-${index}`,
        name: `Row ${(index * 37) % 1000}`,
        projects: (index * 53) % 997,
      }));
      return {
        caption: "Interaction evidence",
        data,
        columns: [
          {
            id: "name",
            header: "Name",
            accessor: (row) => row.name,
            sortable: true,
            rowHeader: true,
          },
          {
            id: "projects",
            header: "Projects",
            accessor: (row) => row.projects,
            sortable: true,
          },
        ],
        getRowId: (row) => row.id,
      };
    },
    target: "th button",
    facts(root) {
      const sortedHeader = root.querySelector("th[aria-sort]");
      return {
        ariaSort: sortedHeader?.getAttribute("aria-sort") ?? null,
        visibleRows: root.querySelectorAll("tbody tr").length,
      };
    },
  },
  TreeView: {
    name: "expand a 30-leaf branch (row click)",
    props() {
      return {
        "aria-label": "Interaction evidence",
        nodes: Array.from({ length: 10 }, (_, branch) => ({
          id: `branch-${branch}`,
          label: `Branch ${branch}`,
          children: Array.from({ length: 30 }, (_, leaf) => ({
            id: `leaf-${branch}-${leaf}`,
            label: `Leaf ${branch}.${leaf}`,
          })),
        })),
      };
    },
    target: '[role="treeitem"][aria-expanded="false"]',
    facts(root) {
      return {
        treeItems: root.querySelectorAll('[role="treeitem"]').length,
        expanded: root.querySelectorAll('[aria-expanded="true"]').length,
      };
    },
  },
  VirtualList: {
    name: "jump 9000 rows into 10k (scroll re-window)",
    props() {
      return {
        "aria-label": "Interaction evidence",
        height: 320,
        itemHeight: 48,
        overscan: 3,
        items: Array.from({ length: 10_000 }, (_, index) => ({
          id: `item-${index}`,
          label: `Item ${index}`,
        })),
        getItemKey: (item) => item.id,
        getItemProps: (item) => ({ children: item.label }),
      };
    },
    // Synthetic scroll events never reach React's onScroll (measured: a
    // dispatched Event("scroll") — bubbling or not — leaves the window
    // unmoved while a plain scrollTop assignment re-windows via the NATIVE
    // event). So this recipe assigns and awaits the paint; its duration is
    // assignment → painted re-window, frame scheduling included.
    async interact(root) {
      const viewport = root.querySelector('[class*="viewport"]');
      if (!viewport) return false;
      // Force layout so the scroll range exists; an unlaid-out element
      // clamps scrollTop to 0.
      void viewport.scrollHeight;
      const start = performance.now();
      viewport.scrollTop = 48 * 9000;
      await nextPaint();
      return { performed: true, duration: performance.now() - start };
    },
    facts(root) {
      const items = root.querySelectorAll('[role="listitem"]');
      return {
        renderedItems: items.length,
        firstPosInSet: items[0]?.getAttribute("aria-posinset") ?? null,
      };
    },
  },
  CommandPalette: {
    name: "filter 100 commands (query keystroke)",
    props() {
      return {
        open: true,
        items: Array.from({ length: 100 }, (_, index) => ({
          id: `command-${index}`,
          label: `Command ${index}`,
          onSelect: () => {},
        })),
      };
    },
    interact(_root, flushSync) {
      // The palette portals to document.body; find its combobox anywhere.
      const input = document.querySelector('[role="combobox"]');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      ).set;
      flushSync(() => {
        setter.call(input, "Command 4");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      return true;
    },
    facts() {
      return {
        // "Command 4" prefix-matches 4, 40-49: 11 options, deterministic.
        visibleOptions: document.querySelectorAll('[role="option"]').length,
      };
    },
    factsScope: "document (portal content)",
  },
};

export async function runInteractionEvidence({
  React,
  ReactDOM,
  ReactDOMClient,
  modules,
  components,
}) {
  const { createElement } = React;
  const { flushSync } = ReactDOM;
  const lookup = (name) => {
    for (const mod of Object.values(modules)) {
      if (name in mod) return mod[name];
    }
    return undefined;
  };

  const mountHost = document.createElement("div");
  document.body.appendChild(mountHost);

  const results = {};
  const timings = {};

  for (const { entry, exportName, contract } of components) {
    try {
      const mod = modules[entry];
      const Component = mod?.[exportName];
      const plan = renderPlanFor(exportName, contract);
      if (plan.skip) {
        results[exportName] = { skip: plan.skip };
        continue;
      }
      const props = resolveDescriptors(plan.props, createElement, lookup);
      const chain = hydrationContainerChainFor(contract?.element);

      const renderErrors = [];
      const makeRoot = (container) =>
        ReactDOMClient.createRoot(container, {
          onUncaughtError(error) {
            renderErrors.push(
              String(error?.message ?? error).split("\n")[0].slice(0, 300),
            );
          },
        });
      const buildContainer = () => {
        const wrapper = document.createElement("div");
        let container = wrapper;
        for (const tag of chain) {
          const level = document.createElement(tag);
          container.appendChild(level);
          container = level;
        }
        mountHost.appendChild(wrapper);
        return { wrapper, container };
      };

      // Warmup + measured mounts.
      const mountRuns = [];
      const rerenderRuns = [];
      let domNodes = 0;
      for (let run = 0; run <= RUNS; run += 1) {
        const { wrapper, container } = buildContainer();
        const root = makeRoot(container);
        const t0 = performance.now();
        flushSync(() => root.render(createElement(Component, props)));
        const t1 = performance.now();
        flushSync(() => root.render(createElement(Component, { ...props })));
        const t2 = performance.now();
        if (run > 0) {
          mountRuns.push(t1 - t0);
          rerenderRuns.push(t2 - t1);
        }
        if (run === RUNS) domNodes = wrapper.querySelectorAll("*").length;
        root.unmount();
        wrapper.remove();
        if (renderErrors.length) break;
      }
      if (renderErrors.length) {
        results[exportName] = { renderError: renderErrors[0] };
        continue;
      }

      const measurement = { domNodes };
      timings[exportName] = {
        mountMs: median(mountRuns),
        rerenderMs: median(rerenderRuns),
      };

      const recipe = INTERACTION_RECIPES[exportName];
      if (recipe) {
        const recipeProps = recipe.props(createElement);
        const { wrapper, container } = buildContainer();
        const root = makeRoot(container);
        flushSync(() => root.render(createElement(Component, recipeProps)));
        // Let mount effects and layout land before interacting: portal
        // components render their content after a mounted-state effect, and
        // scroll ranges need layout.
        await nextPaint();
        let performed = false;
        let duration = null;
        if (recipe.interact) {
          const t0 = performance.now();
          const outcome = await recipe.interact(wrapper, flushSync);
          if (typeof outcome === "object" && outcome !== null) {
            performed = outcome.performed;
            duration = outcome.duration;
          } else {
            performed = outcome;
            duration = performance.now() - t0;
          }
        } else {
          const target = wrapper.querySelector(recipe.target);
          if (target) {
            const t0 = performance.now();
            flushSync(() => target.click());
            duration = performance.now() - t0;
            performed = true;
          }
        }
        if (performed) {
          measurement.recipe = {
            name: recipe.name,
            status: "completed",
            facts: recipe.facts(wrapper),
            ...(recipe.factsScope ? { factsScope: recipe.factsScope } : {}),
          };
          timings[exportName].recipeMs = Number(duration.toFixed(2));
        } else {
          measurement.recipe = {
            name: recipe.name,
            status: "target-not-found",
          };
        }
        root.unmount();
        wrapper.remove();
      }

      results[exportName] = measurement;
    } catch (error) {
      results[exportName] = {
        renderError: String(error?.message ?? error).split("\n")[0].slice(0, 300),
      };
    }
  }

  return { results, timings };
}
