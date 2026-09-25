/**
 * CSS custom-property values → DTCG 2025.10 token values.
 *
 * The source of truth stays variables.css. This module converts each CSS
 * value into the structured value its DTCG type requires (color objects,
 * { value, unit } dimensions, cubic-bezier arrays, shadow objects, gradient
 * stops, font-family arrays, "{alias}" references). A value that cannot be
 * expressed in DTCG 2025.10 (color-mix(), system colors, clamp(), %) returns
 * `null` with a reason instead of being forced into a type it does not fit:
 * the spec says such a token is invalid, and tools must reject it.
 */

export const DTCG_FORMAT_SCHEMA = "https://www.designtokens.org/schemas/2025.10/format.json";
export const DTCG_RESOLVER_SCHEMA = "https://www.designtokens.org/schemas/2025.10/resolver.json";
/** Reverse-DNS vendor key, as the spec recommends for $extensions. */
export const EXT = "com.digitaltableteur";

const round = (n, digits = 4) => Number(n.toFixed(digits));

/** Split on commas that are not inside parentheses or quotes. */
export function splitTopLevel(value, separator = ",") {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = "";
  for (const ch of value) {
    if (quote) {
      if (ch === quote) quote = null;
      current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (depth === 0 && (separator === " " ? /\s/.test(ch) : ch === separator)) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const normalize = (value) => String(value).replace(/\s+/g, " ").trim();

function hexOf(components) {
  return `#${components
    .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function srgb(components, alpha = 1) {
  return {
    colorSpace: "srgb",
    components: components.map((c) => round(c)),
    ...(alpha < 1 ? { alpha: round(alpha) } : {}),
    hex: hexOf(components),
  };
}

function parseAlpha(raw) {
  if (raw == null) return 1;
  const text = raw.trim();
  return text.endsWith("%") ? Number(text.slice(0, -1)) / 100 : Number(text);
}

/** Literal CSS color → DTCG color object, or null. */
export function parseCssColor(input) {
  const value = normalize(input).toLowerCase();
  if (value === "transparent") return { ...srgb([0, 0, 0], 0), alpha: 0 };
  const hex = value.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((d) => d + d).join("");
    if (digits.length !== 6 && digits.length !== 8) return null;
    const channels = digits.match(/../g).map((pair) => parseInt(pair, 16) / 255);
    return srgb(channels.slice(0, 3), channels[3] ?? 1);
  }
  const rgb = value.match(/^rgba?\((.*)\)$/);
  if (rgb) {
    const [colorPart, alphaPart] = rgb[1].includes("/") ? rgb[1].split("/") : [rgb[1], null];
    const parts = colorPart.includes(",")
      ? colorPart.split(",").map((p) => p.trim()).filter(Boolean)
      : colorPart.trim().split(/\s+/);
    if (parts.length < 3) return null;
    const channel = (p) => (p.endsWith("%") ? Number(p.slice(0, -1)) / 100 : Number(p) / 255);
    const channels = parts.slice(0, 3).map(channel);
    const alpha = parseAlpha(alphaPart ?? parts[3]);
    if ([...channels, alpha].some((n) => !Number.isFinite(n))) return null;
    return srgb(channels, alpha);
  }
  const mix = value.match(/^color-mix\(in srgb,(.*)\)$/);
  if (mix) return mixSrgb(splitTopLevel(mix[1]));
  return null;
}

/**
 * color-mix(in srgb, A p%, B q%) between static colors, per CSS Color 5:
 * missing percentages complement each other, the pair is normalized to 100%,
 * and channels are interpolated premultiplied by alpha.
 */
function mixSrgb(args) {
  if (args.length !== 2) return null;
  const parsed = args.map((arg) => {
    const parts = splitTopLevel(arg, " ");
    const pct = parts[1]?.match(/^(\d*\.?\d+)%$/);
    return { color: parseCssColor(parts[0]), pct: pct ? Number(pct[1]) / 100 : null };
  });
  if (parsed.some((p) => !p.color)) return null;
  let [p1, p2] = parsed.map((p) => p.pct);
  if (p1 == null && p2 == null) p1 = p2 = 0.5;
  else if (p1 == null) p1 = 1 - p2;
  else if (p2 == null) p2 = 1 - p1;
  const total = p1 + p2;
  if (total <= 0) return null;
  const [w1, w2] = [p1 / total, p2 / total];
  const [a, b] = parsed.map((p) => p.color);
  const alphaA = a.alpha ?? 1;
  const alphaB = b.alpha ?? 1;
  const alpha = alphaA * w1 + alphaB * w2;
  if (alpha === 0) return srgb([0, 0, 0], 0);
  const channels = [0, 1, 2].map(
    (i) => (a.components[i] * alphaA * w1 + b.components[i] * alphaB * w2) / alpha,
  );
  return srgb(channels, alpha);
}

/** "16px" / "1.5rem" / "0" → { value, unit }, or null. */
export function parseDimension(input) {
  const value = normalize(input);
  if (value === "0") return { value: 0, unit: "px" };
  const match = value.match(/^(-?\d*\.?\d+)(px|rem)$/);
  return match ? { value: Number(match[1]), unit: match[2] } : null;
}

export function parseDuration(input) {
  const match = normalize(input).match(/^(\d*\.?\d+)(ms|s)$/);
  return match ? { value: Number(match[1]), unit: match[2] } : null;
}

export function parseCubicBezier(input) {
  const match = normalize(input).match(/^cubic-bezier\((.*)\)$/);
  if (!match) return null;
  const points = match[1].split(",").map((p) => Number(p.trim()));
  return points.length === 4 && points.every(Number.isFinite) ? points : null;
}

export function parseNumber(input) {
  const value = normalize(input);
  return /^-?\d*\.?\d+$/.test(value) ? Number(value) : null;
}

export function parseFontWeight(input) {
  const n = parseNumber(input);
  return n != null && n >= 1 && n <= 1000 ? n : null;
}

/**
 * Converts one CSS value for a DTCG type.
 *
 * `ctx.aliasFor(cssVar)` returns a "{path}" reference when the variable is
 * itself an exported DTCG token; `ctx.resolve(cssVar)` returns the raw CSS
 * value of any variable (for fallbacks and font stacks, where the spec does
 * not allow references).
 *
 * @returns {{ value: unknown } | { reason: string }}
 */
export function convertValue(type, cssValue, ctx) {
  const value = normalize(cssValue);
  const varRef = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);

  if (varRef && type !== "fontFamily") {
    const alias = ctx.aliasFor(varRef[1], type);
    if (alias) return { value: alias };
    const fallback = varRef[2] ?? ctx.resolve(varRef[1]);
    if (fallback != null && fallback !== cssValue) return convertValue(type, fallback, ctx);
    return { reason: `references ${varRef[1]}, which has no DTCG equivalent` };
  }

  switch (type) {
    case "color": {
      const color = parseCssColor(value);
      return color ? { value: color } : { reason: `color "${value}" is not a static sRGB color` };
    }
    case "dimension": {
      const dim = parseDimension(value);
      return dim ? { value: dim } : { reason: `"${value}" is not a px/rem dimension` };
    }
    case "duration": {
      const dur = parseDuration(value);
      return dur ? { value: dur } : { reason: `"${value}" is not a ms/s duration` };
    }
    case "cubicBezier": {
      const curve = parseCubicBezier(value);
      return curve ? { value: curve } : { reason: `"${value}" is not a cubic-bezier()` };
    }
    case "number": {
      const n = parseNumber(value);
      return n != null ? { value: n } : { reason: `"${value}" is not a unitless number` };
    }
    case "fontWeight": {
      const weight = parseFontWeight(value);
      return weight != null ? { value: weight } : { reason: `"${value}" is not a font weight` };
    }
    case "fontFamily": {
      // References are not allowed inside font-family arrays: inline the stack.
      const families = [];
      for (const part of splitTopLevel(value)) {
        const ref = part.match(/^var\(\s*(--[\w-]+)\s*\)$/);
        if (ref) {
          const resolved = ctx.resolve(ref[1]);
          if (resolved == null) {
            return { reason: `font stack starts from ${ref[1]}, which next/font sets at runtime (not in variables.css)` };
          }
          const inner = convertValue("fontFamily", resolved, ctx);
          if ("reason" in inner) return inner;
          families.push(...[inner.value].flat());
        } else {
          families.push(part.replace(/^["']|["']$/g, ""));
        }
      }
      return families.length ? { value: families.length === 1 ? families[0] : families } : { reason: "empty font stack" };
    }
    case "shadow": {
      const layers = [];
      for (const layer of splitTopLevel(value)) {
        const tokens = splitTopLevel(layer, " ");
        const inset = tokens[0] === "inset";
        const rest = inset ? tokens.slice(1) : tokens;
        const lengths = [];
        let color = null;
        for (const token of rest) {
          const dim = parseDimension(token);
          if (dim && !color) lengths.push(dim);
          else color = parseCssColor(token);
        }
        if (!color || lengths.length < 2) return { reason: `shadow layer "${layer}" is not offset/blur/spread/color` };
        const zero = { value: 0, unit: "px" };
        layers.push({
          color,
          offsetX: lengths[0],
          offsetY: lengths[1],
          blur: lengths[2] ?? zero,
          spread: lengths[3] ?? zero,
          ...(inset ? { inset: true } : {}),
        });
      }
      return { value: layers.length === 1 ? layers[0] : layers };
    }
    case "gradient": {
      const match = value.match(/^linear-gradient\((.*)\)$/);
      if (!match) return { reason: `"${value}" is not a linear-gradient()` };
      const args = splitTopLevel(match[1]);
      const stops = args.filter((arg) => !/^-?\d*\.?\d+deg$|^to /.test(arg));
      const out = [];
      for (const [index, stop] of stops.entries()) {
        const parts = splitTopLevel(stop, " ");
        const color = parseCssColor(parts[0]);
        const pct = parts[1]?.match(/^(\d*\.?\d+)%$/);
        const position = pct ? Number(pct[1]) / 100 : stops.length > 1 ? index / (stops.length - 1) : 0;
        if (!color) return { reason: `gradient stop "${stop}" is not a static color` };
        out.push({ color, position: round(position) });
      }
      return out.length ? { value: out } : { reason: "gradient has no stops" };
    }
    default:
      return { reason: `no DTCG 2025.10 type fits "${value}"` };
  }
}

/** Path segments for a CSS custom property name: --space-internal-4 → [space, internal, 4]. */
export function cssVarToPath(name) {
  return name.replace(/^--/, "").split("-");
}

/**
 * Lay tokens out as a DTCG tree. A path that is both a token and a group
 * (--font-size-text and --font-size-text-lg) puts the token under the
 * group's reserved `$root` key, per 2025.10. Returns the final reference
 * path of every token so aliases can be written as "{a.b.$root}".
 */
export function layoutTree(names) {
  const tree = {};
  const isLeaf = (node) => node && node.__leaf === true;
  for (const name of names) {
    const path = cssVarToPath(name);
    let node = tree;
    for (const [i, segment] of path.entries()) {
      const last = i === path.length - 1;
      if (last) {
        if (node[segment] && !isLeaf(node[segment])) node[segment].$root = { __leaf: true, name };
        else node[segment] = { __leaf: true, name };
      } else {
        if (isLeaf(node[segment])) node[segment] = { $root: node[segment] };
        node[segment] ??= {};
        node = node[segment];
      }
    }
  }
  const paths = new Map();
  const walk = (node, prefix) => {
    for (const [key, child] of Object.entries(node)) {
      const next = [...prefix, key];
      if (isLeaf(child)) paths.set(child.name, next);
      else walk(child, next);
    }
  };
  walk(tree, []);
  return paths;
}

/** Set a token object at a reference path inside a plain tree. */
export function setAtPath(tree, path, token) {
  let node = tree;
  for (const segment of path.slice(0, -1)) {
    node[segment] ??= {};
    node = node[segment];
  }
  node[path[path.length - 1]] = token;
}
