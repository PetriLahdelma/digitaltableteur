
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

const RUN_ID = "dt-dsb-2026-07-10";

const { collection, modeIds } = await upsertCollection(
  "DT / Color",
  ["Light","Dark","HCB","HCW"],
  'collection/dt-color',
  RUN_ID,
);
const created = [];
const defs = [{"name":"color/warning/text","cssVar":"--color-warning-text","type":"COLOR","values":{"Light":"#041b23","Dark":"#181a1b","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-warning-text)"}},{"name":"color/white","cssVar":"--color-white","type":"COLOR","values":{"Light":"#fff","Dark":"#181a1b","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--color-white)"}},{"name":"link/color","cssVar":"--link-color","type":"COLOR","values":{"Light":"#041b23","Dark":"#6fa8ff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--link-color)"}},{"name":"logo/background","cssVar":"--logo-background","type":"COLOR","values":{"Light":"#dfff00","Dark":"#812eff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--logo-background)"}},{"name":"logo/color","cssVar":"--logo-color","type":"COLOR","values":{"Light":"#000","Dark":"#fff","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--logo-color)"}},{"name":"logo/text/color","cssVar":"--logo-text-color","type":"COLOR","values":{"Light":"#041b23","Dark":"#e0e0e0","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--logo-text-color)"}},{"name":"main/body/background/color","cssVar":"--main-body-background-color","type":"COLOR","values":{"Light":"#fff","Dark":"#181a1b","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--main-body-background-color)"}},{"name":"main/body/copy/color","cssVar":"--main-body-copy-color","type":"COLOR","values":{"Light":"#041b23","Dark":"#e0e0e0","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--main-body-copy-color)"}},{"name":"selection/background","cssVar":"--selection-background","type":"COLOR","values":{"Light":"#041b23","Dark":"#6fa8ff","HCB":"#fff","HCW":"#000"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--selection-background)"}},{"name":"selection/color","cssVar":"--selection-color","type":"COLOR","values":{"Light":"#fff","Dark":"#181a1b","HCB":"#000","HCW":"#fff"},"scopes":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"codeSyntax":{"WEB":"var(--selection-color)"}}];
for (const def of defs) {
  created.push(await upsertVariable(collection, modeIds, def, RUN_ID));
}
return { collectionId: collection.id, variableIds: created, chunk: 2, total: 2 };

return { ok: true, RUN_ID };
