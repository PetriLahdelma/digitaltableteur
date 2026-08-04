export function formatHuman(result, options = {}) {
  if (options.dense) return JSON.stringify(result.data);
  switch (result.type) {
    case "search":
      return [
        `Results for "${result.data.query}" (${result.data.results.length})`,
        ...result.data.results.map(
          (item) =>
            `- ${item.name} [${item.status}] ${item.import}\n  ${item.description}`,
        ),
      ].join("\n");
    case "component.detail":
      return [
        `${result.data.name} [${result.data.status}]`,
        result.data.import,
        result.data.description,
        result.data.usage?.description,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "component.examples":
      return [
        `${result.data.name} examples`,
        ...result.data.examples.map(
          (item) =>
            `\n${item.story}\n${item.description ?? ""}\n${item.source}`,
        ),
      ].join("\n");
    case "composition.suggestions":
      return [
        `Composition suggestions for "${result.data.query}"`,
        ...result.data.seeds.map(
          (item) => `- Start with ${item.name}: ${item.description}`,
        ),
        ...result.data.related.map(
          (item) => `- Add ${item.name}: ${item.reason}`,
        ),
      ].join("\n");
    case "doctor":
      return [
        result.data.healthy
          ? "Digitaltableteur CLI: healthy"
          : "Digitaltableteur CLI: attention required",
        ...result.data.checks.map(
          (check) =>
            `- ${check.status.toUpperCase()} ${check.id}: ${check.detail}`,
        ),
      ].join("\n");
    case "diff.report": {
      const head = `Contract diff ${result.data.from} -> ${result.data.to}: ${result.data.componentCount} component(s) changed, semver recommendation: ${result.data.semverRecommendation}`;
      const bodies = result.data.components.map((component) =>
        [
          `\n${component.name} [${component.semver}]`,
          ...component.changes.map(
            (change) => `- (${change.severity}) ${change.detail}`,
          ),
        ].join("\n"),
      );
      const files = result.data.affectedConsumerFiles;
      return [
        head,
        ...bodies,
        files && files.length
          ? `\nAffected consumer files (${files.length}):\n${files.map((file) => `- ${file}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "affected.report": {
      const rows = result.data.targets.map((target) =>
        [
          `${target.name} [${target.status ?? "?"}]`,
          target.directImporters.length
            ? `  imported by: ${target.directImporters.join(", ")}`
            : "  imported by: (none detected)",
          target.composedBy.length
            ? `  composed by: ${target.composedBy.join(", ")}`
            : null,
          target.prodPages.length
            ? `  production pages: ${target.prodPages.join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
      );
      return rows.join("\n\n");
    }
    case "manifest":
      return [
        `${result.data.name} ${result.data.version}`,
        ...result.data.commands.map((command) => `- ${command.name}`),
      ].join("\n");
    case "help":
      return [
        `${result.data.name} ${result.data.version}`,
        result.data.description,
        "",
        "Usage: dt <command> [arguments] [options]",
        "",
        "Commands:",
        ...result.data.commands.map((command) => `  ${command.name}`),
        "",
        "Global options:",
        "  --json   Print a typed JSON response envelope",
        "  --dense  Print compact output",
        "  --help   Show this help",
      ].join("\n");
    default:
      return JSON.stringify(result.data, null, 2);
  }
}
