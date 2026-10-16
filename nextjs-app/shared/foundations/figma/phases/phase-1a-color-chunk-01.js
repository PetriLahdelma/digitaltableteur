
function hexToFigmaColor(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
    a: h.length === 8 ? parseInt(h.substring(6, 8), 16) / 255 : 1,
  };
}

// Variables/collections do NOT support setSharedPluginData (that mixin is
// nodes/styles only). Idempotency is by name, per the figma-generate-library
// skill's state table.
async function upsertCollection(name, modeLabels, _key, _runId) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  let coll = cols.find((c) => c.name === name) || null;
  if (!coll) coll = figma.variables.createVariableCollection(name);
  const modeIds = {};
  const existing = coll.modes.map((m) => m.name);
  if (existing.length === 1 && existing[0] === 'Mode 1' && modeLabels.length) {
    coll.renameMode(coll.modes[0].modeId, modeLabels[0]);
  }
  for (const label of modeLabels) {
    let mode = coll.modes.find((m) => m.name === label);
    if (!mode) {
      const id = coll.addMode(label);
      mode = coll.modes.find((m) => m.modeId === id);
    }
    if (mode) modeIds[label] = mode.modeId;
  }
  return { collection: coll, modeIds };
}

async function upsertVariable(coll, modeIds, def, _runId) {
  const vars = await figma.variables.getLocalVariablesAsync();
  let variable = vars.find(
    (v) => v.variableCollectionId === coll.id && v.name === def.name,
  );
  if (!variable) variable = figma.variables.createVariable(def.name, coll, def.type);
  for (const [modeLabel, raw] of Object.entries(def.values)) {
    const modeId = modeIds[modeLabel];
    if (!modeId) continue;
    let value = raw;
    if (def.type === 'COLOR' && typeof raw === 'string' && raw.startsWith('#')) {
      value = hexToFigmaColor(raw);
    }
    variable.setValueForMode(modeId, value);
  }
  variable.scopes = def.scopes || [];
  if (def.codeSyntax?.WEB) variable.setVariableCodeSyntax('WEB', def.codeSyntax.WEB);
  return variable.id;
}

const RUN_ID = "dt-dsb-2026-10-16";

const { collection, modeIds } = await upsertCollection(
  "DT / Color",
  ["Light","Dark","HCB","HCW"],
  'collection/dt-color',
  RUN_ID,
);
const created = [];
const defs = [{"name":"accent/cyan","cssVar":"--accent-cyan","type":"COLOR","values":{"Light":"#71efff","Dark":"#71efff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--accent-cyan)"}},{"name":"accent/pink","cssVar":"--accent-pink","type":"COLOR","values":{"Light":"#f205c5","Dark":"#f205c5","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--accent-pink)"}},{"name":"accent/purple","cssVar":"--accent-purple","type":"COLOR","values":{"Light":"#812eff","Dark":"#812eff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--accent-purple)"}},{"name":"accent/teal","cssVar":"--accent-teal","type":"COLOR","values":{"Light":"#85b5bd","Dark":"#85b5bd","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--accent-teal)"}},{"name":"accent/violet","cssVar":"--accent-violet","type":"COLOR","values":{"Light":"#bc6dff","Dark":"#bc6dff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--accent-violet)"}},{"name":"accent/yellow","cssVar":"--accent-yellow","type":"COLOR","values":{"Light":"#f2e274","Dark":"#f2e274","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--accent-yellow)"}},{"name":"color/black","cssVar":"--color-black","type":"COLOR","values":{"Light":"#000","Dark":"#fff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-black)"}},{"name":"color/border","cssVar":"--color-border","type":"COLOR","values":{"Light":"#c0c0c0","Dark":"#333","HCB":"#333","HCW":"#333"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-border)"}},{"name":"color/border/light","cssVar":"--color-border-light","type":"COLOR","values":{"Light":"#ccc","Dark":"#444","HCB":"#444","HCW":"#444"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-border-light)"}},{"name":"color/dark","cssVar":"--color-dark","type":"COLOR","values":{"Light":"#222","Dark":"#e0e0e0","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-dark)"}},{"name":"color/disabled/bg","cssVar":"--color-disabled-bg","type":"COLOR","values":{"Light":"#e8e8e8","Dark":"#23272a","HCB":"#313131","HCW":"#e8e8e8"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-disabled-bg)"}},{"name":"color/disabled/bg/light","cssVar":"--color-disabled-bg-light","type":"COLOR","values":{"Light":"#efefef","Dark":"#23272a","HCB":"#313131","HCW":"#efefef"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-disabled-bg-light)"}},{"name":"color/disabled/placeholder","cssVar":"--color-disabled-placeholder","type":"COLOR","values":{"Light":"#858585","Dark":"#767676","HCB":"#9e9e9e","HCW":"#6b6b6b"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-disabled-placeholder)"}},{"name":"color/error","cssVar":"--color-error","type":"COLOR","values":{"Light":"#dc3545","Dark":"#ff6b6b","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-error)"}},{"name":"color/error/bg","cssVar":"--color-error-bg","type":"COLOR","values":{"Light":"#dfbdbc","Dark":"#2d2323","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-error-bg)"}},{"name":"color/error/text","cssVar":"--color-error-text","type":"COLOR","values":{"Light":"#7a1f1f","Dark":"#ffb3b3","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-error-text)"}},{"name":"color/focus/ring","cssVar":"--color-focus-ring","type":"COLOR","values":{"Light":"#041b23","Dark":"#6fa8ff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-focus-ring)"}},{"name":"color/gray","cssVar":"--color-gray","type":"COLOR","values":{"Light":"#5e5e5e","Dark":"#aaa","HCB":"#aaa","HCW":"#aaa"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-gray)"}},{"name":"color/gray/dark","cssVar":"--color-gray-dark","type":"COLOR","values":{"Light":"#333","Dark":"#bbb","HCB":"#1f1f1f","HCW":"#e6e6e6"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-gray-dark)"}},{"name":"color/gray/medium","cssVar":"--color-gray-medium","type":"COLOR","values":{"Light":"#666","Dark":"#888","HCB":"#888","HCW":"#888"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-gray-medium)"}},{"name":"color/header/bg","cssVar":"--color-header-bg","type":"COLOR","values":{"Light":"#282c34","Dark":"#181a1b","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-header-bg)"}},{"name":"color/info","cssVar":"--color-info","type":"COLOR","values":{"Light":"#0c7a8b","Dark":"#71efff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-info)"}},{"name":"color/info/bg","cssVar":"--color-info-bg","type":"COLOR","values":{"Light":"#e6f4ff","Dark":"#0e2a33","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-info-bg)"}},{"name":"color/info/text","cssVar":"--color-info-text","type":"COLOR","values":{"Light":"#0c5460","Dark":"#71efff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-info-text)"}},{"name":"color/light/bg","cssVar":"--color-light-bg","type":"COLOR","values":{"Light":"#f9f9f9","Dark":"#23272a","HCB":"#101010","HCW":"#f1f1f1"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-light-bg)"}},{"name":"color/muted","cssVar":"--color-muted","type":"COLOR","values":{"Light":"#626a72","Dark":"#949494","HCB":"#888","HCW":"#333"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-muted)"}},{"name":"color/muted/light","cssVar":"--color-muted-light","type":"COLOR","values":{"Light":"#909090","Dark":"#555","HCB":"#555","HCW":"#555"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-muted-light)"}},{"name":"color/neutral/bg","cssVar":"--color-neutral-bg","type":"COLOR","values":{"Light":"#e2e8f0","Dark":"#3b3f5c","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-neutral-bg)"}},{"name":"color/neutral/text","cssVar":"--color-neutral-text","type":"COLOR","values":{"Light":"#1a1d26","Dark":"#f5f7ff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-neutral-text)"}},{"name":"color/on/media/text","cssVar":"--color-on-media-text","type":"COLOR","values":{"Light":"#fff","Dark":"#fff","HCB":"#fff","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-on-media-text)"}},{"name":"color/placeholder/dark","cssVar":"--color-placeholder-dark","type":"COLOR","values":{"Light":"#222","Dark":"#2a2c2d","HCB":"#2a2a2a","HCW":"#1a1a1a"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-placeholder-dark)"}},{"name":"color/placeholder/dark/fg","cssVar":"--color-placeholder-dark-fg","type":"COLOR","values":{"Light":"#fff","Dark":"#fff","HCB":"#fff","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-placeholder-dark-fg)"}},{"name":"color/primary","cssVar":"--color-primary","type":"COLOR","values":{"Light":"#041b23","Dark":"#6fa8ff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-primary)"}},{"name":"color/primary/dark","cssVar":"--color-primary-dark","type":"COLOR","values":{"Light":"#0046b8","Dark":"#0046b8","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-primary-dark)"}},{"name":"color/react","cssVar":"--color-react","type":"COLOR","values":{"Light":"#61dafb","Dark":"#61dafb","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-react)"}}];
for (const def of defs) {
  created.push(await upsertVariable(collection, modeIds, def, RUN_ID));
}
return { collectionId: collection.id, variableIds: created, chunk: 1, total: 2 };

return { ok: true, RUN_ID };
