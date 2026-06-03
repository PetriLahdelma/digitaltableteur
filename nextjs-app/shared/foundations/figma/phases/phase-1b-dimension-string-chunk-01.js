
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

const RUN_ID = "dt-dsb-2026-06-03";

const dim = [{"name":"radius/lg","cssVar":"--radius-lg","type":"FLOAT","values":{"Value":8},"scopes":["CORNER_RADIUS"],"codeSyntax":{"WEB":"var(--radius-lg)"}},{"name":"radius/md","cssVar":"--radius-md","type":"FLOAT","values":{"Value":4},"scopes":["CORNER_RADIUS"],"codeSyntax":{"WEB":"var(--radius-md)"}},{"name":"radius/sm","cssVar":"--radius-sm","type":"FLOAT","values":{"Value":2},"scopes":["CORNER_RADIUS"],"codeSyntax":{"WEB":"var(--radius-sm)"}},{"name":"size/width/form","cssVar":"--size-width-form","type":"FLOAT","values":{"Value":600},"scopes":[],"codeSyntax":{"WEB":"var(--size-width-form)"}},{"name":"size/width/lg","cssVar":"--size-width-lg","type":"FLOAT","values":{"Value":900},"scopes":[],"codeSyntax":{"WEB":"var(--size-width-lg)"}},{"name":"size/width/md","cssVar":"--size-width-md","type":"FLOAT","values":{"Value":320},"scopes":[],"codeSyntax":{"WEB":"var(--size-width-md)"}},{"name":"space/internal/0","cssVar":"--space-internal-0","type":"FLOAT","values":{"Value":0},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-0)"}},{"name":"space/internal/12","cssVar":"--space-internal-12","type":"FLOAT","values":{"Value":12},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-12)"}},{"name":"space/internal/16","cssVar":"--space-internal-16","type":"FLOAT","values":{"Value":16},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-16)"}},{"name":"space/internal/2","cssVar":"--space-internal-2","type":"FLOAT","values":{"Value":2},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-2)"}},{"name":"space/internal/24","cssVar":"--space-internal-24","type":"FLOAT","values":{"Value":24},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-24)"}},{"name":"space/internal/32","cssVar":"--space-internal-32","type":"FLOAT","values":{"Value":32},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-32)"}},{"name":"space/internal/4","cssVar":"--space-internal-4","type":"FLOAT","values":{"Value":4},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-4)"}},{"name":"space/internal/6","cssVar":"--space-internal-6","type":"FLOAT","values":{"Value":6},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-6)"}},{"name":"space/internal/8","cssVar":"--space-internal-8","type":"FLOAT","values":{"Value":8},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-internal-8)"}},{"name":"space/layout/0","cssVar":"--space-layout-0","type":"FLOAT","values":{"Value":0},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-0)"}},{"name":"space/layout/120","cssVar":"--space-layout-120","type":"FLOAT","values":{"Value":120},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-120)"}},{"name":"space/layout/16","cssVar":"--space-layout-16","type":"FLOAT","values":{"Value":16},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-16)"}},{"name":"space/layout/160","cssVar":"--space-layout-160","type":"FLOAT","values":{"Value":160},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-160)"}},{"name":"space/layout/24","cssVar":"--space-layout-24","type":"FLOAT","values":{"Value":24},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-24)"}},{"name":"space/layout/32","cssVar":"--space-layout-32","type":"FLOAT","values":{"Value":32},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-32)"}},{"name":"space/layout/4","cssVar":"--space-layout-4","type":"FLOAT","values":{"Value":4},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-4)"}},{"name":"space/layout/40","cssVar":"--space-layout-40","type":"FLOAT","values":{"Value":40},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-40)"}},{"name":"space/layout/48","cssVar":"--space-layout-48","type":"FLOAT","values":{"Value":48},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-48)"}},{"name":"space/layout/6","cssVar":"--space-layout-6","type":"FLOAT","values":{"Value":6},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-6)"}},{"name":"space/layout/64","cssVar":"--space-layout-64","type":"FLOAT","values":{"Value":64},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-64)"}},{"name":"space/layout/8","cssVar":"--space-layout-8","type":"FLOAT","values":{"Value":8},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-8)"}},{"name":"space/layout/80","cssVar":"--space-layout-80","type":"FLOAT","values":{"Value":80},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-80)"}},{"name":"space/layout/96","cssVar":"--space-layout-96","type":"FLOAT","values":{"Value":96},"scopes":["GAP","WIDTH_HEIGHT"],"codeSyntax":{"WEB":"var(--space-layout-96)"}}];
const str = [{"name":"font/text","cssVar":"--font-text","type":"STRING","values":{"Value":"var(--font-body), system-ui, sans-serif"},"scopes":[],"codeSyntax":{"WEB":"var(--font-text)"}},{"name":"font/title","cssVar":"--font-title","type":"STRING","values":{"Value":"var(--font-heading), system-ui, sans-serif"},"scopes":[],"codeSyntax":{"WEB":"var(--font-title)"}},{"name":"font/weight/text","cssVar":"--font-weight-text","type":"STRING","values":{"Value":"400"},"scopes":[],"codeSyntax":{"WEB":"var(--font-weight-text)"}},{"name":"font/weight/title","cssVar":"--font-weight-title","type":"STRING","values":{"Value":"700"},"scopes":[],"codeSyntax":{"WEB":"var(--font-weight-title)"}}];
let created = [];
if (dim.length) {
  const { collection, modeIds } = await upsertCollection(
    "DT / Dimension",
    ["Value"],
    'collection/dt-dimension',
    RUN_ID,
  );
  for (const def of dim) created.push(await upsertVariable(collection, modeIds, def, RUN_ID));
}
if (str.length) {
  const { collection, modeIds } = await upsertCollection(
    "DT / String",
    ["Value"],
    'collection/dt-string',
    RUN_ID,
  );
  for (const def of str) created.push(await upsertVariable(collection, modeIds, def, RUN_ID));
}
return { variableIds: created, chunk: 1, total: 1 };

return { ok: true, RUN_ID };
