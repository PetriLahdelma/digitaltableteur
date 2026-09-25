/**
 * Extract design-system component usages from TSX source.
 *
 * Turns `<Button icon="search" href={url} />` into
 * `{ component: "Button", props: { icon: literal "search", href: expression } }`
 * so the contract rule engine can check it. Uses the TypeScript parser only
 * (no type checking), so it is fast enough to run over the whole repo.
 */
import ts from "typescript";

import type { JsxPropValue, JsxUsage } from "./contract-rules";

/** Import sources that resolve to design-system components. */
const DS_IMPORT_PATTERNS = [
  /^@dt\/([A-Za-z0-9]+)/,
  /^@digitaltableteur\/react(\/[a-z-]+)?$/,
  /\/shared\/(?:components|patterns|templates)\/(?:[a-z]+\/)?([A-Za-z0-9]+)/,
];

function isDsImport(specifier: string): boolean {
  return DS_IMPORT_PATTERNS.some((pattern) => pattern.test(specifier));
}

/** Component name implied by a path-style specifier, e.g. `@dt/Button` → Button. */
function componentFromSpecifier(specifier: string): string | undefined {
  for (const pattern of DS_IMPORT_PATTERNS) {
    const match = specifier.match(pattern);
    if (match?.[1] && /^[A-Z]/.test(match[1])) return match[1];
  }
  return undefined;
}

function literalFromExpression(expression: ts.Expression): JsxPropValue {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return { kind: "literal", value: expression.text };
  }
  if (ts.isNumericLiteral(expression)) {
    return { kind: "literal", value: Number(expression.text) };
  }
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return { kind: "literal", value: true };
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return { kind: "literal", value: false };
  if (
    ts.isPrefixUnaryExpression(expression) &&
    expression.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(expression.operand)
  ) {
    return { kind: "literal", value: -Number(expression.operand.text) };
  }
  if (ts.isParenthesizedExpression(expression)) return literalFromExpression(expression.expression);
  return { kind: "expression" };
}

function hasMeaningfulChildren(children: ts.NodeArray<ts.JsxChild>): boolean {
  return children.some((child) => {
    if (ts.isJsxText(child)) return child.text.trim().length > 0;
    if (ts.isJsxExpression(child)) return child.expression !== undefined;
    return true;
  });
}

export type ExtractOptions = {
  /**
   * Also match bare tag names against the catalog when the source has no
   * design-system imports (agent snippets often omit them).
   */
  matchBareTags?: boolean;
};

export function extractJsxUsages(
  source: string,
  knownComponents: ReadonlySet<string>,
  fileName = "snippet.tsx",
  options: ExtractOptions = {},
): JsxUsage[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  // Local identifier → catalog component name, from design-system imports.
  const aliases = new Map<string, string>();
  // Every locally bound import name, so bare-tag matching never claims a tag
  // that some other library supplies.
  const importedNames = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }
    const importClause = statement.importClause;
    if (importClause?.name) importedNames.add(importClause.name.text);
    if (importClause?.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
      for (const element of importClause.namedBindings.elements) importedNames.add(element.name.text);
    }
    const specifier = statement.moduleSpecifier.text;
    // Relative imports inside the component tree (`../Button`, `../components/Title`)
    // count when their last path segment is a catalog component.
    const relativeTarget = specifier.startsWith(".")
      ? specifier.split("/").filter((part) => part && part !== "." && part !== "..").pop()
      : undefined;
    const relativeComponent =
      relativeTarget && knownComponents.has(relativeTarget) ? relativeTarget : undefined;
    if (!isDsImport(specifier) && !relativeComponent) continue;
    const clause = statement.importClause;
    if (!clause) continue;
    if (clause.name) {
      const implied = relativeComponent ?? componentFromSpecifier(specifier) ?? clause.name.text;
      if (knownComponents.has(implied)) aliases.set(clause.name.text, implied);
    }
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const imported = (element.propertyName ?? element.name).text;
        if (knownComponents.has(imported)) aliases.set(element.name.text, imported);
      }
    }
  }
  const useBareTags = options.matchBareTags === true && aliases.size === 0;

  const usages: JsxUsage[] = [];

  function record(
    tagName: ts.JsxTagNameExpression,
    attributes: ts.JsxAttributes,
    hasChildren: boolean,
    position: number,
  ) {
    if (!ts.isIdentifier(tagName)) return;
    const tag = tagName.text;
    const component =
      aliases.get(tag) ??
      (useBareTags && knownComponents.has(tag) && !importedNames.has(tag) ? tag : undefined);
    if (!component) return;

    const props: Record<string, JsxPropValue> = {};
    let hasSpread = false;
    let childrenProp = false;
    for (const attribute of attributes.properties) {
      if (ts.isJsxSpreadAttribute(attribute)) {
        hasSpread = true;
        continue;
      }
      const name = attribute.name.getText(sourceFile);
      const initializer = attribute.initializer;
      let value: JsxPropValue;
      if (!initializer) value = { kind: "literal", value: true };
      else if (ts.isStringLiteral(initializer)) value = { kind: "literal", value: initializer.text };
      else if (ts.isJsxExpression(initializer) && initializer.expression) {
        value = literalFromExpression(initializer.expression);
      } else value = { kind: "expression" };
      if (name === "children") childrenProp = true;
      else props[name] = value;
    }

    usages.push({
      component,
      line: sourceFile.getLineAndCharacterOfPosition(position).line + 1,
      props,
      hasChildren: hasChildren || childrenProp,
      hasSpread,
    });
  }

  function visit(node: ts.Node) {
    if (ts.isJsxSelfClosingElement(node)) {
      record(node.tagName, node.attributes, false, node.getStart(sourceFile));
    } else if (ts.isJsxElement(node)) {
      const opening = node.openingElement;
      record(
        opening.tagName,
        opening.attributes,
        hasMeaningfulChildren(node.children),
        opening.getStart(sourceFile),
      );
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  return usages;
}
