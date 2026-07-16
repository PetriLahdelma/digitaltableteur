import { expect, test } from "vitest";

import {
  buildAgentExperienceReport,
  compareAgentExperienceToBaseline,
  createAgentExperienceBaseline,
} from "./agent-experience-lib.mjs";

const completeEntry = {
  name: "Button",
  contract: {
    status: "stable",
    tier: "molecule",
    slots: ["icon"],
    keywords: ["action"],
    dense: "Canonical action trigger",
    usage: { description: "Use for actions that change application state." },
    a11y: { reviewed: true },
  },
  spec: "## Design notes\nThe polymorphic branches encode intent.",
  agent: {
    intent: "Trigger an action",
    props: {
      href: { type: "string", optional: true, description: "Destination." },
      submits: { type: "boolean", optional: true, description: "Submit form." },
    },
    propRelationships: [
      {
        kind: "mutuallyExclusive",
        props: ["href", "submits"],
        reason: "Choose navigation or submission.",
      },
    ],
    useWhen: ["Triggering an action"],
    avoidWhen: ["Selecting an option"],
    forbiddenUse: ["Nested interactive content"],
    composesWith: ["Icon"],
    canonicalExamples: ["Default"],
  },
};

function reportFor(components = [completeEntry]) {
  return buildAgentExperienceReport({
    manifest: { components },
    intentResult: { passed: 1, total: 1, rate: 1, minPassRate: 0.9 },
    patternResult: { passed: 1, total: 1, rate: 1, minPassRate: 1 },
  });
}

test("reports source-backed AX dimensions without a weighted score", () => {
  const report = reportFor();
  expect(report.scoringModel).toContain("No weighted aggregate");
  expect(report.dimensions.contractClarity.propDocumentation.rate).toBe(1);
  expect(report.dimensions.recoverability.machineRelationshipComponents).toBe(1);
  expect(report.dimensions.apiEntropy.maximumFiniteStateBits).toBe(1);
});

test("complexity baseline permits reductions and rejects API growth", () => {
  const report = reportFor();
  const baseline = createAgentExperienceBaseline(report);
  expect(compareAgentExperienceToBaseline(report, baseline)).toEqual([]);

  const grown = structuredClone(completeEntry);
  grown.agent.props.loading = {
    type: "boolean",
    optional: true,
    description: "Pending state.",
  };
  const violations = compareAgentExperienceToBaseline(reportFor([grown]), baseline);
  expect(
    violations.some(
      (violation) =>
        violation.kind === "complexity-budget-exceeded" &&
        violation.metric === "propCount",
    ),
  ).toBe(true);
});

test("coverage floors reject loss of agent guidance", () => {
  const report = reportFor();
  const baseline = createAgentExperienceBaseline(report);
  const degraded = structuredClone(completeEntry);
  degraded.agent.avoidWhen = [];
  degraded.agent.forbiddenUse = [];
  degraded.agent.propRelationships = [];
  degraded.agent.props.href.description = "";

  const violations = compareAgentExperienceToBaseline(
    reportFor([degraded]),
    baseline,
  );
  expect(
    violations.some((violation) => violation.kind === "coverage-regression"),
  ).toBe(true);
});
