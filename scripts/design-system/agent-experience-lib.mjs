const ACTIVE_STATUSES = new Set(["alpha", "beta", "stable"]);

function round(value, digits = 4) {
  return Number(value.toFixed(digits));
}

function coverage(numerator, denominator) {
  return {
    numerator,
    denominator,
    rate: denominator ? round(numerator / denominator) : 1,
  };
}

function isBooleanProp(schema) {
  const parts = String(schema?.type ?? "")
    .split("|")
    .map((part) => part.trim());
  return parts.includes("boolean");
}

export function componentAgentExperienceMetrics(entry) {
  const agent = entry.agent ?? {};
  const contract = entry.contract ?? {};
  const props = Object.entries(agent.props ?? {});
  const documentedProps = props.filter(([, schema]) =>
    Boolean(schema?.description?.trim()),
  ).length;
  const finiteStateBits = props.reduce((bits, [, schema]) => {
    if (Array.isArray(schema?.values) && schema.values.length > 1) {
      return bits + Math.log2(schema.values.length);
    }
    return bits + (isBooleanProp(schema) ? 1 : 0);
  }, 0);
  const relationships = agent.propRelationships ?? [];
  const forbiddenUse = agent.forbiddenUse ?? contract.forbiddenUse ?? [];
  const prefersOver = agent.prefersOver ?? contract.prefersOver ?? [];

  const evidence = {
    intent: Boolean(agent.intent?.trim()),
    positiveGuidance: Boolean(agent.useWhen?.length),
    negativeGuidance: Boolean(agent.avoidWhen?.length || forbiddenUse.length),
    accessibilityReview: contract.a11y?.reviewed === true,
    canonicalExamples: Boolean(agent.canonicalExamples?.length),
    discoverability: Boolean(contract.keywords?.length && contract.dense?.trim()),
    usageRationale: Boolean(contract.usage?.description?.trim()),
    designRationale: /##\s+(Design notes|Rationale)\b/i.test(entry.spec ?? ""),
  };

  return {
    name: entry.name,
    status: contract.status,
    tier: contract.tier,
    api: {
      propCount: props.length,
      requiredPropCount: props.filter(([, schema]) => schema?.optional === false)
        .length,
      documentedPropCount: documentedProps,
      booleanAxisCount: props.filter(([, schema]) => isBooleanProp(schema)).length,
      finiteChoiceAxisCount: props.filter(
        ([, schema]) => Array.isArray(schema?.values) && schema.values.length > 1,
      ).length,
      finiteStateBits: round(finiteStateBits, 3),
      slotCount: contract.slots?.length ?? 0,
      relationshipCount: relationships.length,
    },
    evidence,
    recoverability: Boolean(
      agent.avoidWhen?.length ||
        forbiddenUse.length ||
        prefersOver.length ||
        agent.replacementFor?.length ||
        relationships.length,
    ),
    composable: Boolean(agent.composesWith?.length),
    machineRelationships: relationships,
  };
}

export function buildAgentExperienceReport({
  manifest,
  intentResult,
  patternResult,
}) {
  const components = (manifest.components ?? [])
    .filter((entry) => ACTIVE_STATUSES.has(entry.contract?.status))
    .map(componentAgentExperienceMetrics);
  const totalProps = components.reduce((sum, row) => sum + row.api.propCount, 0);
  const documentedProps = components.reduce(
    (sum, row) => sum + row.api.documentedPropCount,
    0,
  );
  const completeContracts = components.filter((row) =>
    Object.values(row.evidence).every(Boolean),
  ).length;
  const recoverable = components.filter((row) => row.recoverability).length;
  const composable = components.filter((row) => row.composable).length;
  const withRelationships = components.filter(
    (row) => row.api.relationshipCount > 0,
  ).length;

  return {
    schemaVersion: 1,
    scoringModel:
      "Evidence scorecard only. No weighted aggregate or model-authored quality score is produced.",
    componentCount: components.length,
    dimensions: {
      apiEntropy: {
        description:
          "Raw API surface and finite-choice state-space indicators; lower is not automatically better.",
        totalProps,
        maximumPropCount: Math.max(0, ...components.map((row) => row.api.propCount)),
        maximumFiniteStateBits: Math.max(
          0,
          ...components.map((row) => row.api.finiteStateBits),
        ),
        largestSurfaces: [...components]
          .sort(
            (left, right) =>
              right.api.finiteStateBits - left.api.finiteStateBits ||
              right.api.propCount - left.api.propCount,
          )
          .slice(0, 12)
          .map(({ name, tier, api }) => ({ name, tier, ...api })),
      },
      promptability: {
        description: "Golden intent queries resolved by the production ranker.",
        passed: intentResult.passed,
        total: intentResult.total,
        rate: round(intentResult.rate),
        minimumRate: intentResult.minPassRate,
      },
      recoverability: {
        description:
          "Components with negative guidance, replacement guidance, or executable prop relationships.",
        coverage: coverage(recoverable, components.length),
        machineRelationshipComponents: withRelationships,
      },
      composability: {
        description:
          "Components connected to the relationship graph plus golden pattern retrieval evidence.",
        componentCoverage: coverage(composable, components.length),
        patternRetrieval: {
          passed: patternResult.passed,
          total: patternResult.total,
          rate: round(patternResult.rate),
          minimumRate: patternResult.minPassRate,
        },
      },
      contractClarity: {
        description:
          "Source-backed prop documentation and complete intent/guidance/a11y/example/rationale evidence.",
        propDocumentation: coverage(documentedProps, totalProps),
        completeContractEvidence: coverage(completeContracts, components.length),
      },
    },
    components,
  };
}

export function createAgentExperienceBaseline(report) {
  return {
    schemaVersion: 1,
    note:
      "Complexity is a per-component no-growth ratchet, not an ideal-quality claim. Update deliberately with npm run audit:agent-experience -- --update-baseline.",
    minimums: {
      propDocumentationRate:
        report.dimensions.contractClarity.propDocumentation.rate,
      completeContractEvidenceRate:
        report.dimensions.contractClarity.completeContractEvidence.rate,
      recoverabilityRate: report.dimensions.recoverability.coverage.rate,
      composabilityRate: report.dimensions.composability.componentCoverage.rate,
      machineRelationshipComponents:
        report.dimensions.recoverability.machineRelationshipComponents,
    },
    components: Object.fromEntries(
      report.components.map((row) => [
        row.name,
        {
          maxPropCount: row.api.propCount,
          maxFiniteStateBits: row.api.finiteStateBits,
          maxSlotCount: row.api.slotCount,
        },
      ]),
    ),
  };
}

export function compareAgentExperienceToBaseline(report, baseline) {
  const violations = [];
  const checks = [
    [
      "propDocumentationRate",
      report.dimensions.contractClarity.propDocumentation.rate,
    ],
    [
      "completeContractEvidenceRate",
      report.dimensions.contractClarity.completeContractEvidence.rate,
    ],
    ["recoverabilityRate", report.dimensions.recoverability.coverage.rate],
    ["composabilityRate", report.dimensions.composability.componentCoverage.rate],
    [
      "machineRelationshipComponents",
      report.dimensions.recoverability.machineRelationshipComponents,
    ],
  ];

  for (const [name, actual] of checks) {
    const minimum = baseline.minimums?.[name];
    if (typeof minimum === "number" && actual + Number.EPSILON < minimum) {
      violations.push({
        kind: "coverage-regression",
        metric: name,
        actual,
        expected: `>= ${minimum}`,
      });
    }
  }

  for (const row of report.components) {
    const budget = baseline.components?.[row.name];
    if (!budget) {
      violations.push({
        kind: "missing-complexity-budget",
        component: row.name,
        expected: "explicit baseline entry",
      });
      continue;
    }

    for (const [metric, budgetKey] of [
      ["propCount", "maxPropCount"],
      ["finiteStateBits", "maxFiniteStateBits"],
      ["slotCount", "maxSlotCount"],
    ]) {
      if (row.api[metric] > budget[budgetKey] + Number.EPSILON) {
        violations.push({
          kind: "complexity-budget-exceeded",
          component: row.name,
          metric,
          actual: row.api[metric],
          expected: `<= ${budget[budgetKey]}`,
        });
      }
    }
  }

  return violations;
}
