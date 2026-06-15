/**
 * Generates use_figma plugin code to rebuild VIews route frames from DS components.
 * Run: node scripts/design-system/figma-rebuild-route-views.mjs > /tmp/rebuild-views.js
 * Then apply via Figma MCP use_figma with fileKey PC2UPdYwm8qGt6ZTg0AakF
 */
import { FIGMA_FILE_KEY } from "./figma-config.mjs";

export const VIEW_IDS = [
  "606:3192",
  "615:33",
  "616:2",
  "620:5030",
  "620:3746",
  "620:4652",
  "620:4022",
  "620:5995",
  "620:4366",
];

export const COMPONENT_KEYS = {
  SiteHeader: "23921b09d0f2e994ab6e532c8f5804ebb1c1b88c",
  SiteFooter: "6947bd220cd44cdf61c6abd2d005bd1c35f07671",
  NewsBulletin: "18ba39afd52209db9ff63bc5008ff4691983b0e8",
  CTASection: "1eb756d4d583f5823866521b8f26de03d1b898e5",
  ContactForm: "badb77fde78a21967ce0007e77a124d6ef298c1a",
  Button: "77e2caf2ded1c675e19fdb75bca756d1383b007e",
  Title: "037373f5ec308fe06aac587cb7c746635e18a85e",
  Text: "c2691610a40c589db8e2544213d140f80d64669a",
  Card: "d3ccb9f2f0b4a1bf4c023969734ce593addd6f99",
  Inputs: "374:10", // resolved in-plugin by node id fallback
};

/** Plugin body — executed inside Figma via use_figma */
export const PLUGIN_CODE = String.raw`
const RUN_ID = 'dt-dsb-2026-06-05';
const VIEW_IDS = ${JSON.stringify(VIEW_IDS)};

const KEYS = ${JSON.stringify(COMPONENT_KEYS)};

const PATTERN_SWAP_NAMES = new Set([
  "NewsBulletin",
  "CTASection",
  "ContactForm",
]);

const CARD_FRAME_NAMES = /^(Card|ServiceCard|EnhancedProjectCard|card)$/i;

function depthIn(node, root) {
  let d = 0, n = node;
  while (n && n !== root) { d++; n = n.parent; }
  return d;
}

function tag(node, key) {
  node.setSharedPluginData('dsb', 'run_id', RUN_ID);
  node.setSharedPluginData('dsb', 'phase', 'phase4-route-views-rebuild');
  node.setSharedPluginData('dsb', 'key', key);
}

function copyImageHashes(fromNode, toNode) {
  const src = fromNode.findAll(n => 'fills' in n && Array.isArray(n.fills) && n.fills.some(f => f.type === 'IMAGE'));
  const dst = toNode.findAll(n => 'fills' in n && Array.isArray(n.fills));
  for (let i = 0; i < Math.min(src.length, dst.length); i++) {
    const sf = src[i].fills.find(f => f.type === 'IMAGE');
    const df = dst[i].fills;
    if (sf && df?.length) {
      dst[i].fills = [{ ...sf, scaleMode: sf.scaleMode || 'FILL' }];
    }
  }
}

async function importComp(key) {
  try { return await figma.importComponentByKeyAsync(key); }
  catch { return null; }
}

async function importSet(key) {
  try { return await figma.importComponentSetByKeyAsync(key); }
  catch { return null; }
}

function replaceFrameWithInstance(frame, comp, label) {
  if (!comp || frame.removed) return null;
  const inst = comp.createInstance();
  inst.name = label + ' (DS)';
  inst.x = frame.x;
  inst.y = frame.y;
  inst.resize(frame.width, frame.height);
  const parent = frame.parent;
  const idx = parent.children.indexOf(frame);
  copyImageHashes(frame, inst);
  parent.insertChild(idx, inst);
  tag(inst, label);
  frame.remove();
  return inst;
}

function findCtaSection(root) {
  return root.findAll(n => n.type === 'FRAME' && n.name === 'Section').find(s => {
    const texts = s.findAllWithCriteria({ types: ['TEXT'] });
    return texts.some(t => /ready to create|let's talk|get in touch/i.test(t.characters || ''));
  }) || null;
}

function titleVariantForFontSize(fs) {
  if (fs >= 80) return 'Size=title-xl';
  if (fs >= 64) return 'Size=title-l';
  if (fs >= 56) return 'Size=title';
  if (fs >= 44) return 'Size=title-m';
  return 'Size=title-s';
}

function textVariantForFontSize(fs) {
  if (fs >= 23) return 'Size=text-l';
  if (fs >= 19) return 'Size=text';
  return 'Size=text-s';
}

function isInsideInstance(node) {
  let p = node.parent;
  while (p) {
    if (p.type === 'INSTANCE') return true;
    p = p.parent;
  }
  return false;
}

function replaceTextWithAtom(textNode, titleSet, textSet) {
  if (textNode.removed || isInsideInstance(textNode)) return false;
  const fsRaw = textNode.fontSize;
  if (fsRaw === figma.mixed || typeof fsRaw !== 'number') return false;
  const fn = textNode.fontName;
  if (fn === figma.mixed) return false;
  const chars = textNode.characters?.trim();
  if (!chars || chars.length > 500) return false;

  const isSyne = /syne/i.test(fn.family || '');
  const isBold = /bold|extrabold/i.test(fn.style || '');
  const useTitle = isSyne && isBold && fsRaw >= 32;

  const set = useTitle ? titleSet : textSet;
  if (!set) return false;
  const variantName = useTitle ? titleVariantForFontSize(fsRaw) : textVariantForFontSize(fsRaw);
  let comp = set.findChild(c => c.type === 'COMPONENT' && c.name === variantName);
  if (!comp) comp = set.defaultVariant;
  const inst = comp.createInstance();
  inst.name = useTitle ? 'Title (DS)' : 'Text (DS)';
  inst.x = textNode.x;
  inst.y = textNode.y;

  const parent = textNode.parent;
  const idx = parent.children.indexOf(textNode);
  parent.insertChild(idx, inst);

  try {
    const props = inst.componentProperties;
    for (const [k, v] of Object.entries(props)) {
      if (v.type === 'TEXT' && /label/i.test(k)) {
        inst.setProperties({ [k]: chars.slice(0, 200) });
      }
    }
  } catch (e) {}

  inst.resize(Math.max(inst.width, textNode.width), Math.max(inst.height, textNode.height));
  textNode.remove();
  tag(inst, useTitle ? 'Title' : 'Text');
  return true;
}

function replaceCardFrames(root, cardSet) {
  if (!cardSet) return 0;
  const comp = cardSet.findChild(c => c.type === 'COMPONENT' && /default|bordered/i.test(c.name)) || cardSet.defaultVariant;
  let n = 0;
  const frames = root.findAll(
    (node) =>
      node.type === "FRAME" &&
      CARD_FRAME_NAMES.test(node.name) &&
      !isInsideInstance(node),
  );
  frames.sort((a, b) => depthIn(b, root) - depthIn(a, root));
  for (const frame of frames) {
    replaceFrameWithInstance(frame, comp, 'Card');
    n++;
  }
  return n;
}

const compCache = {};
async function getComp(name) {
  if (compCache[name]) return compCache[name];
  compCache[name] = await importComp(KEYS[name]);
  return compCache[name];
}

const setCache = {};
async function getSet(name) {
  if (setCache[name]) return setCache[name];
  setCache[name] = await importSet(KEYS[name]);
  return setCache[name];
}

const report = [];

for (const frameId of VIEW_IDS) {
  const frame = await figma.getNodeByIdAsync(frameId);
  if (!frame || frame.type !== 'FRAME') {
    report.push({ frameId, error: 'missing' });
    continue;
  }

  tag(frame, 'view:' + (frame.name.split('|')[0] || frame.name).trim());
  const layout = frame.children.find(c => c.name === 'NextLayout');
  const contentRoot = layout?.findOne(n => /Page|Content|HomePage|WorkIndex|About|Contact|Pricing|Blog|PageTransition|Sitemap/.test(n.name)) || layout;

  let patterns = 0, ctas = 0, titles = 0, cards = 0;

  // 1) Named pattern frames (deepest first)
  if (contentRoot) {
    const patternFrames = contentRoot.findAll(n =>
      n.type === 'FRAME' && PATTERN_SWAP_NAMES.has(n.name) && !/\\(DS\\)/.test(n.name)
    );
    patternFrames.sort((a, b) => depthIn(b, contentRoot) - depthIn(a, contentRoot));
    for (const pf of patternFrames) {
      const comp = await getComp(pf.name);
      if (replaceFrameWithInstance(pf, comp, pf.name)) patterns++;
    }

    const ctaFrame = findCtaSection(contentRoot);
    if (ctaFrame && !ctaFrame.removed) {
      const comp = await getComp('CTASection');
      if (replaceFrameWithInstance(ctaFrame, comp, 'CTASection')) ctas++;
    }
  }

  // 2) Card frames
  const cardSet = await getSet('Card');
  if (contentRoot) cards = replaceCardFrames(contentRoot, cardSet);

  // 3) Title / Text atoms (leaf text nodes, bottom-up)
  const titleSet = await getSet('Title');
  const textSet = await getSet('Text');
  const texts = frame.findAllWithCriteria({ types: ['TEXT'] });
  texts.sort((a, b) => depthIn(b, frame) - depthIn(a, frame));
  for (const t of texts) {
    if (replaceTextWithAtom(t, titleSet, textSet)) titles++;
  }

  const instances = frame.findAllWithCriteria({ types: ['INSTANCE'] }).length;
  report.push({
    frameId,
    name: frame.name.split('|')[0].trim(),
    patterns,
    ctas,
    cards,
    titles,
    instances,
  });
}

return { success: true, report };
`;

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`// fileKey: ${FIGMA_FILE_KEY}\n// Paste into use_figma code parameter\n`);
  console.log(PLUGIN_CODE);
}
