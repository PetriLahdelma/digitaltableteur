#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { decode } = require("he");
const { randomUUID } = require("node:crypto");

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "src/pages/posts");
const OUTPUT_DIR = path.join(ROOT_DIR, "sanity-output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "parsed-posts.json");
const EN_TRANSLATIONS = JSON.parse(
  fs.readFileSync(
    path.join(ROOT_DIR, "src/locales/en/translation.json"),
    "utf8",
  ),
);

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function parseSourceFile(filePath) {
  return parser.parse(fs.readFileSync(filePath, "utf8"), {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

function getJSXName(nameNode) {
  if (!nameNode) return undefined;
  if (nameNode.type === "JSXIdentifier") return nameNode.name;
  if (nameNode.type === "JSXMemberExpression") {
    return `${getJSXName(nameNode.object)}.${getJSXName(nameNode.property)}`;
  }
  return undefined;
}

function literalToString(node) {
  if (!node) return undefined;
  if (node.type === "StringLiteral") return node.value;
  if (node.type === "TemplateLiteral") {
    const cooked = node.quasis.map((q) => q.value.cooked ?? "").join("");
    return cooked;
  }
  return undefined;
}

function extractIdentifier(node) {
  if (!node) return undefined;
  if (node.type === "Identifier") return node.name;
  if (
    node.type === "JSXExpressionContainer" &&
    node.expression.type === "Identifier"
  ) {
    return node.expression.name;
  }
  return undefined;
}

function buildPostsMetadata() {
  const indexPath = path.join(POSTS_DIR, "index.ts");
  const ast = parseSourceFile(indexPath);
  const importMap = {};
  traverse(ast, {
    ImportDeclaration(pathRef) {
      const source = pathRef.node.source.value;
      pathRef.node.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportDefaultSpecifier") {
          const resolvedSource = source.endsWith(".tsx")
            ? source
            : `${source}.tsx`;
          importMap[specifier.local.name] = path.resolve(
            path.dirname(indexPath),
            resolvedSource,
          );
        }
      });
    },
  });

  let postsArray;
  traverse(ast, {
    VariableDeclarator(pathRef) {
      if (
        pathRef.node.id.type === "Identifier" &&
        pathRef.node.id.name === "posts"
      ) {
        postsArray = pathRef.node.init;
        pathRef.stop();
      }
    },
  });
  if (!postsArray || postsArray.type !== "ArrayExpression") {
    throw new Error("Unable to locate posts array in src/pages/posts/index.ts");
  }

  return postsArray.elements.map((element) => {
    if (!element || element.type !== "ObjectExpression") {
      throw new Error("Unexpected posts entry format.");
    }
    const meta = {};
    element.properties.forEach((prop) => {
      const key =
        prop.key.type === "Identifier" ? prop.key.name : prop.key.value;
      if (key === "component") {
        const identifier = extractIdentifier(prop.value);
        meta.componentName = identifier;
        meta.componentPath = importMap[identifier];
        if (!meta.componentPath) {
          throw new Error(`Unable to resolve component path for ${identifier}`);
        }
        return;
      }
      const value =
        prop.value.type === "StringLiteral" ? prop.value.value : undefined;
      meta[key] = value;
    });
    const slug = (meta.link || "").replace(/^\/blog\//, "").replace(/\/$/, "");
    return {
      ...meta,
      slug,
    };
  });
}

function resolveTranslation(key, fallback) {
  if (!key) return fallback;
  return EN_TRANSLATIONS[key] || fallback;
}

function normalizeWhitespace(value) {
  if (!value) return "";
  return decode(value.replace(/\s+/g, " ").trim());
}

function stringFromExpression(expr) {
  if (!expr) return "";
  if (expr.type === "StringLiteral") return expr.value;
  if (expr.type === "TemplateLiteral") {
    return expr.quasis.map((q) => q.value.cooked ?? "").join("");
  }
  if (expr.type === "CallExpression" && expr.callee.name === "t") {
    const keyArg = expr.arguments[0];
    if (keyArg && keyArg.type === "StringLiteral") {
      return resolveTranslation(keyArg.value, keyArg.value);
    }
  }
  if (
    expr.type === "JSXExpressionContainer" &&
    (expr.expression.type === "StringLiteral" ||
      expr.expression.type === "TemplateLiteral")
  ) {
    return stringFromExpression(expr.expression);
  }
  return "";
}

function collectText(children) {
  const parts = [];
  children.forEach((child) => {
    if (!child) return;
    if (child.type === "JSXText") {
      parts.push(child.value);
      return;
    }
    if (child.type === "StringLiteral") {
      parts.push(child.value);
      return;
    }
    if (child.type === "JSXExpressionContainer") {
      const expr = child.expression;
      parts.push(stringFromExpression(expr));
      return;
    }
    if (child.type === "JSXElement") {
      const name = getJSXName(child.openingElement.name);
      if (name === "br") {
        parts.push("\n");
        return;
      }
      parts.push(collectText(child.children));
    }
  });
  return normalizeWhitespace(parts.join(" "));
}

function createSpan(text) {
  return {
    _type: "span",
    _key: randomUUID(),
    marks: [],
    text,
  };
}

function createBlock(style, text, extra = {}) {
  const value = normalizeWhitespace(text);
  if (!value) return null;
  return {
    _type: "block",
    _key: randomUUID(),
    style,
    markDefs: [],
    children: [createSpan(value)],
    ...extra,
  };
}

function getAttributeValue(element, attributeName) {
  const attr = element.openingElement.attributes.find(
    (attribute) =>
      attribute.type === "JSXAttribute" &&
      ((attribute.name.type === "JSXIdentifier" &&
        attribute.name.name === attributeName) ||
        (attribute.name.type === "JSXNamespacedName" &&
          attribute.name.name === attributeName)),
  );
  if (!attr) return undefined;
  if (!attr.value) return "";
  if (attr.value.type === "StringLiteral") return attr.value.value;
  if (attr.value.type === "JSXExpressionContainer") {
    return stringFromExpression(attr.value.expression);
  }
  return undefined;
}

function getAttributeIdentifier(element, attributeName) {
  const attr = element.openingElement.attributes.find(
    (attribute) =>
      attribute.type === "JSXAttribute" &&
      attribute.name.type === "JSXIdentifier" &&
      attribute.name.name === attributeName,
  );
  if (!attr || !attr.value) return undefined;
  if (
    attr.value.type === "JSXExpressionContainer" &&
    attr.value.expression.type === "Identifier"
  ) {
    return attr.value.expression.name;
  }
  return undefined;
}

function convertListItems(children, listType, context) {
  return children
    .filter((child) => child && child.type === "JSXElement")
    .flatMap((child) => {
      const name = getJSXName(child.openingElement.name);
      if (name !== "li") return [];
      const text = collectText(child.children);
      if (!text) return [];
      const block = createBlock("normal", text, {
        listItem: listType,
        level: 1,
      });
      return block ? [block] : [];
    });
}

function createImageBlock(node, context) {
  const alt = getAttributeValue(node, "alt");
  const srcLiteral = getAttributeValue(node, "src");
  const identifier = getAttributeIdentifier(node, "src");
  let resolvedPath = null;
  if (identifier && context.assetImports[identifier]) {
    resolvedPath = context.assetImports[identifier];
  } else if (srcLiteral && srcLiteral.startsWith("/")) {
    resolvedPath = path.join(ROOT_DIR, "public", srcLiteral.replace(/^\//, ""));
  } else if (srcLiteral) {
    resolvedPath = path.resolve(path.dirname(context.componentPath), srcLiteral);
  }
  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    return null;
  }
  return {
    _type: "image",
    _key: randomUUID(),
    assetPath: resolvedPath,
    alt: alt ? alt.trim() : "",
  };
}

function createEmbedBlock(node) {
  const src = getAttributeValue(node, "src");
  if (!src) return null;
  const provider = src.includes("youtube")
    ? "youtube"
    : src.includes("vimeo")
      ? "vimeo"
      : "iframe";
  return {
    _type: "embed",
    _key: randomUUID(),
    provider,
    url: src,
    title: getAttributeValue(node, "title") || provider,
  };
}

function convertJSXChildren(children, context, blocks = []) {
  children.forEach((child) => {
    if (!child) return;
    if (child.type === "JSXText") {
      const text = normalizeWhitespace(child.value);
      if (text) {
        const block = createBlock("normal", text);
        if (block) blocks.push(block);
      }
      return;
    }
    if (child.type === "JSXExpressionContainer") {
      const text = stringFromExpression(child.expression);
      if (text) {
        const block = createBlock("normal", text);
        if (block) blocks.push(block);
      }
      return;
    }
    if (child.type === "JSXFragment") {
      convertJSXChildren(child.children, context, blocks);
      return;
    }
    if (child.type !== "JSXElement") {
      return;
    }
    const name = getJSXName(child.openingElement.name);
    if (!name) return;
    if (/^[A-Z]/.test(name)) {
      if (name === "React.Fragment") {
        convertJSXChildren(child.children, context, blocks);
      }
      return;
    }
    if (name === "header" || name === "blognav") {
      return;
    }
    if (name === "caption") {
      const caption = collectText(child.children);
      if (caption) {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock._type === "image" && !lastBlock.caption) {
          lastBlock.caption = caption;
        } else {
          const captionBlock = createBlock("normal", caption);
          if (captionBlock) blocks.push(captionBlock);
        }
      }
      return;
    }
    let newBlocks = [];
    switch (name) {
      case "p":
        newBlocks = [createBlock("normal", collectText(child.children))];
        break;
      case "h2":
      case "h3":
      case "h4":
        newBlocks = [createBlock(name, collectText(child.children))];
        break;
      case "blockquote":
        newBlocks = [createBlock("blockquote", collectText(child.children))];
        break;
      case "ul":
        newBlocks = convertListItems(child.children, "bullet", context);
        break;
      case "ol":
        newBlocks = convertListItems(child.children, "number", context);
        break;
      case "div":
      case "section":
      case "article":
        convertJSXChildren(child.children, context, blocks);
        return;
      case "figure":
        convertJSXChildren(child.children, context, blocks);
        return;
      case "img": {
        const imageBlock = createImageBlock(child, context);
        if (imageBlock) newBlocks = [imageBlock];
        break;
      }
      case "iframe": {
        const embed = createEmbedBlock(child);
        if (embed) newBlocks = [embed];
        break;
      }
      case "hr":
        newBlocks = [{ _type: "divider", _key: randomUUID() }];
        break;
      case "br":
        newBlocks = [];
        break;
      default: {
        const text = collectText(child.children);
        if (text) {
          newBlocks = [createBlock("normal", text)];
        } else {
          convertJSXChildren(child.children, context, blocks);
          return;
        }
      }
    }
    newBlocks
      .filter(Boolean)
      .forEach((block) => blocks.push(block));
  });
  return blocks;
}

function findArticleNode(ast) {
  let articleNode;
  traverse(ast, {
    JSXElement(pathRef) {
      if (getJSXName(pathRef.node.openingElement.name) === "article") {
        articleNode = pathRef.node;
        pathRef.stop();
      }
    },
  });
  return articleNode;
}

function findAuthor(ast, importMap) {
  let author = { name: "Digitaltableteur" };
  traverse(ast, {
    JSXElement(pathRef) {
      if (getJSXName(pathRef.node.openingElement.name) !== "Author") return;
      const nameAttr = getAttributeValue(pathRef.node, "name");
      const imageIdentifier = getAttributeIdentifier(pathRef.node, "imageUrl");
      const imagePath = imageIdentifier ? importMap[imageIdentifier] : null;
      author = {
        name: nameAttr || author.name,
        imagePath: imagePath && fs.existsSync(imagePath) ? imagePath : undefined,
      };
      pathRef.stop();
    },
  });
  return author;
}

function buildAssetImportMap(ast, componentDir) {
  const assets = {};
  traverse(ast, {
    ImportDeclaration(pathRef) {
      const source = pathRef.node.source.value;
      const extension = path.extname(source || "");
      if (!IMAGE_EXTENSIONS.has(extension.toLowerCase())) {
        return;
      }
      pathRef.node.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportDefaultSpecifier") {
          const absPath = path.resolve(componentDir, source);
          assets[specifier.local.name] = absPath;
        }
      });
    },
  });
  return assets;
}

function parsePost(meta) {
  const ast = parseSourceFile(meta.componentPath);
  const assetImports = buildAssetImportMap(
    ast,
    path.dirname(meta.componentPath),
  );
  const articleNode = findArticleNode(ast);
  if (!articleNode) {
    throw new Error(`Unable to find <article> in ${meta.componentPath}`);
  }
  const body = convertJSXChildren(articleNode.children, {
    assetImports,
    componentPath: meta.componentPath,
  }).filter(Boolean);
  const author = findAuthor(ast, assetImports);
  const seoTitle = resolveTranslation(
    `post${meta.componentName}MetaTitle`,
    meta.title,
  );
  const seoDescription = resolveTranslation(
    `post${meta.componentName}MetaDescription`,
    meta.lead,
  );
  return {
    slug: meta.slug,
    meta,
    seo: {
      title: seoTitle,
      description: seoDescription,
    },
    author,
    body,
  };
}

function main() {
  try {
    ensureDir(OUTPUT_DIR);
    const metadata = buildPostsMetadata();
    const posts = metadata.map((entry) => parsePost(entry));
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), "utf8");
    console.log(
      `Parsed ${posts.length} posts into ${path.relative(
        ROOT_DIR,
        OUTPUT_FILE,
      )}`,
    );
  } catch (error) {
    console.error("[sanity-migration] Failed to parse posts.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
