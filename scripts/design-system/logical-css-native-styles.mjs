import postcss from "postcss";
import stylelint from "stylelint";
import ts from "typescript";

export const logicalCssRules = {
  "logical-css/require-logical-keywords": [
    true,
    {
      fix: true,
      ignore: ["caption-side", "offset-anchor", "offset-position", "resize"],
      severity: "error",
    },
  ],
  "logical-css/require-logical-properties": [
    true,
    {
      fix: true,
      ignore: [
        "left",
        "overflow-x",
        "overflow-y",
        "overscroll-behavior-x",
        "overscroll-behavior-y",
        "top",
      ],
      severity: "error",
    },
  ],
  "logical-css/require-logical-units": [true, { fix: true, severity: "error" }],
};

export const rhythmguardRules = {
  "rhythmguard/no-offscale-transform": [
    true,
    {
      fixToScale: false,
      scale: [0, 4, 8, 12, 16, 24, 32],
      severity: "warning",
    },
  ],
  "rhythmguard/prefer-token": [
    true,
    {
      propertyGroups: ["spacing", "radius"],
      severity: "warning",
      tokenPattern: "^--space-|^--radius-",
    },
  ],
  "rhythmguard/use-scale": [
    true,
    {
      propertyGroups: ["spacing", "radius", "typography", "size"],
      scale: [0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64],
      fixToScale: false,
      severity: "warning",
    },
  ],
};

export function extractNativeStyleTemplates(source, file) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const templates = [];

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      /styles$/i.test(node.name.text)
    ) {
      if (
        !node.initializer ||
        !ts.isNoSubstitutionTemplateLiteral(node.initializer)
      ) {
        const line =
          sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
            .line + 1;
        throw new Error(
          `${file}:${line} style constants must use a static, untagged template literal so CSS gates can inspect them`,
        );
      }
      const start = node.initializer.getStart(sourceFile) + 1;
      const end = node.initializer.getEnd() - 1;
      templates.push({
        css: source.slice(start, end),
        end,
        file,
        lineOffset: sourceFile.getLineAndCharacterOfPosition(start).line,
        start,
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return templates;
}

const compatibilityPairs = new Map([
  ["overflow-x", "overflow-inline"],
  ["overflow-y", "overflow-block"],
  ["overscroll-behavior-x", "overscroll-behavior-inline"],
  ["overscroll-behavior-y", "overscroll-behavior-block"],
]);
const logicalToPhysical = new Map(
  [...compatibilityPairs].map(([physical, logical]) => [logical, physical]),
);
const resizePairs = new Map([
  ["vertical", "block"],
  ["horizontal", "inline"],
]);
const logicalToPhysicalResize = new Map(
  [...resizePairs].map(([physical, logical]) => [logical, physical]),
);

function hasNegativePercentage(value) {
  return /-\d+(?:\.\d+)?%/.test(value);
}

function hasPhysicalInlineTranslation({ prop, value }) {
  const normalizedProperty = prop.toLowerCase();
  const normalizedValue = value.toLowerCase();
  if (normalizedProperty === "translate") {
    return hasNegativePercentage(
      normalizedValue.trim().split(/\s+/)[0] ?? "",
    );
  }
  if (normalizedProperty !== "transform") return false;
  return (
    /translatex\(\s*-\d+(?:\.\d+)?%/.test(normalizedValue) ||
    /translate(?:3d)?\(\s*-\d+(?:\.\d+)?%/.test(normalizedValue)
  );
}

function hasPhysicalBlockTranslation({ prop, value }) {
  const normalizedProperty = prop.toLowerCase();
  const normalizedValue = value.toLowerCase();
  if (normalizedProperty === "translate") {
    return hasNegativePercentage(
      normalizedValue.trim().split(/\s+/)[1] ?? "",
    );
  }
  if (normalizedProperty !== "transform") return false;
  return (
    /translatey\(\s*-\d+(?:\.\d+)?%/.test(normalizedValue) ||
    /translate(?:3d)?\(\s*[^,]+,\s*-\d+(?:\.\d+)?%/.test(normalizedValue)
  );
}

function findEffectiveDeclaration(declarations, property) {
  const candidates = declarations.filter(
    ({ prop }) => prop.toLowerCase() === property,
  );
  const importantCandidates = candidates.filter(({ important }) => important);
  return (importantCandidates.length > 0 ? importantCandidates : candidates).at(
    -1,
  );
}

export function findLogicalCssContractErrors(css, file) {
  const errors = [];
  const root = postcss.parse(css, { from: file });

  root.walkRules((rule) => {
    const declarations = rule.nodes.filter((node) => node.type === "decl");
    for (const [index, declaration] of declarations.entries()) {
      const property = declaration.prop.toLowerCase();
      const value = declaration.value.toLowerCase();
      const logicalProperty = compatibilityPairs.get(property);
      if (logicalProperty) {
        const next = declarations[index + 1];
        if (
          !next ||
          next.prop.toLowerCase() !== logicalProperty ||
          next.value !== declaration.value
        ) {
          errors.push({
            column: declaration.source?.start?.column ?? 0,
            line: declaration.source?.start?.line ?? 0,
            rule: "digitaltableteur/require-logical-fallback-pair",
            text: `${property} must be immediately followed by ${logicalProperty} with the same value`,
          });
        }
      }

      const physicalProperty = logicalToPhysical.get(property);
      if (physicalProperty) {
        const previous = declarations[index - 1];
        if (
          !previous ||
          previous.prop.toLowerCase() !== physicalProperty ||
          previous.value !== declaration.value
        ) {
          errors.push({
            column: declaration.source?.start?.column ?? 0,
            line: declaration.source?.start?.line ?? 0,
            rule: "digitaltableteur/require-logical-fallback-pair",
            text: `${property} must immediately follow ${physicalProperty} with the same value`,
          });
        }
      }

      const logicalResize =
        property === "resize"
          ? resizePairs.get(value)
          : undefined;
      if (logicalResize) {
        const next = declarations[index + 1];
        if (
          !next ||
          next.prop.toLowerCase() !== "resize" ||
          next.value.toLowerCase() !== logicalResize
        ) {
          errors.push({
            column: declaration.source?.start?.column ?? 0,
            line: declaration.source?.start?.line ?? 0,
            rule: "digitaltableteur/require-logical-fallback-pair",
            text: `resize: ${value} must be immediately followed by resize: ${logicalResize}`,
          });
        }
      }

      const physicalResize =
        property === "resize"
          ? logicalToPhysicalResize.get(value)
          : undefined;
      if (physicalResize) {
        const previous = declarations[index - 1];
        if (
          !previous ||
          previous.prop.toLowerCase() !== "resize" ||
          previous.value.toLowerCase() !== physicalResize
        ) {
          errors.push({
            column: declaration.source?.start?.column ?? 0,
            line: declaration.source?.start?.line ?? 0,
            rule: "digitaltableteur/require-logical-fallback-pair",
            text: `resize: ${value} must immediately follow resize: ${physicalResize}`,
          });
        }
      }
    }

    const hasLogicalMidpoint = declarations.some(
      ({ prop, value }) =>
        (prop.toLowerCase() === "inset-inline-start" ||
          prop.toLowerCase() === "inset-inline") &&
        value === "50%",
    );
    const effectiveTranslations = [
      findEffectiveDeclaration(declarations, "transform"),
      findEffectiveDeclaration(declarations, "translate"),
    ].filter(Boolean);
    const physicalInlineTranslation = effectiveTranslations.find(
      hasPhysicalInlineTranslation,
    );
    if (hasLogicalMidpoint && physicalInlineTranslation) {
      errors.push({
        column: physicalInlineTranslation.source?.start?.column ?? 0,
        line: physicalInlineTranslation.source?.start?.line ?? 0,
        rule: "digitaltableteur/no-mixed-direction-centering",
        text: "Logical 50% inset cannot be centered with a physical negative inline translation",
      });
    }

    const physicalInlineMidpoints = declarations.filter(
      ({ prop }) => prop.toLowerCase() === "left",
    );
    for (const physicalInlineMidpoint of physicalInlineMidpoints) {
      if (
        physicalInlineMidpoint.value !== "50%" ||
        !physicalInlineTranslation
      ) {
        errors.push({
          column: physicalInlineMidpoint.source?.start?.column ?? 0,
          line: physicalInlineMidpoint.source?.start?.line ?? 0,
          rule: "digitaltableteur/no-unpaired-physical-centering",
          text: "Physical left is allowed only as a 50% midpoint paired with a physical inline translation",
        });
      }
    }

    const hasLogicalBlockMidpoint = declarations.some(
      ({ prop, value }) =>
        (prop.toLowerCase() === "inset-block-start" ||
          prop.toLowerCase() === "inset-block") &&
        value === "50%",
    );
    const physicalBlockTranslation = effectiveTranslations.find(
      hasPhysicalBlockTranslation,
    );
    if (hasLogicalBlockMidpoint && physicalBlockTranslation) {
      errors.push({
        column: physicalBlockTranslation.source?.start?.column ?? 0,
        line: physicalBlockTranslation.source?.start?.line ?? 0,
        rule: "digitaltableteur/no-mixed-direction-centering",
        text: "Logical 50% inset cannot be centered with a physical negative block translation",
      });
    }

    const physicalBlockMidpoints = declarations.filter(
      ({ prop }) => prop.toLowerCase() === "top",
    );
    for (const physicalBlockMidpoint of physicalBlockMidpoints) {
      if (
        physicalBlockMidpoint.value !== "50%" ||
        !physicalBlockTranslation
      ) {
        errors.push({
          column: physicalBlockMidpoint.source?.start?.column ?? 0,
          line: physicalBlockMidpoint.source?.start?.line ?? 0,
          rule: "digitaltableteur/no-unpaired-physical-centering",
          text: "Physical top is allowed only as a 50% midpoint paired with a physical block translation",
        });
      }
    }
  });

  return errors;
}

export async function lintLogicalCss(template, { fix }) {
  const result = await stylelint.lint({
    code: template.css,
    codeFilename: `${template.file}.css`,
    config: {
      plugins: ["stylelint-plugin-logical-css"],
      rules: logicalCssRules,
    },
    fix,
  });

  return {
    css: (result.code ?? template.css).replaceAll("\\3c !--", "<!--"),
    warnings: result.results[0]?.warnings ?? [],
  };
}

export async function lintNativeCss(template) {
  const result = await stylelint.lint({
    code: template.css,
    codeFilename: `${template.file}.css`,
    config: {
      plugins: ["stylelint-plugin-logical-css", "stylelint-plugin-rhythmguard"],
      rules: { ...logicalCssRules, ...rhythmguardRules },
    },
    fix: false,
  });

  return {
    css: result.code ?? template.css,
    warnings: result.results[0]?.warnings ?? [],
  };
}

export function replaceNativeStyleTemplates(source, replacements) {
  return [...replacements]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (nextSource, replacement) =>
        `${nextSource.slice(0, replacement.start)}${replacement.css}${nextSource.slice(replacement.end)}`,
      source,
    );
}
