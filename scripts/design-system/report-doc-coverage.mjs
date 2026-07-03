import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DOC_TIER_1, docTierFor } from './doc-tiers.mjs';

// Scans nextjs-app/shared/components/ only. Contracts also exist under
// nextjs-app/shared/patterns/, but every DOC_TIER_1 name lives under
// components/, so scanning components/ alone is sufficient for this report.
const ROOT = new URL('../../nextjs-app/shared/components', import.meta.url).pathname;
const rows = [];
for (const dir of readdirSync(ROOT, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const contractPath = join(ROOT, dir.name, `${dir.name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const c = JSON.parse(readFileSync(contractPath, 'utf-8'));
    rows.push({
        name: dir.name,
        tier: docTierFor(dir.name),
        usage: Boolean(c.usage?.description),
        bestPractices: (c.usage?.bestPractices?.length ?? 0) >= 6,
        anatomy: (c.usage?.anatomy?.length ?? 0) >= 2,
        keywords: (c.keywords?.length ?? 0) >= 4,
        playground: Boolean(c.playground?.defaults),
        dense: Boolean(c.dense),
    });
}
for (const tier of [1, 2]) {
    const set = rows.filter((r) => r.tier === tier);
    const fields = tier === 1
        ? ['usage', 'bestPractices', 'anatomy', 'keywords', 'playground', 'dense']
        : ['usage', 'keywords', 'dense'];
    console.log(`\nDoc tier ${tier} (${set.length} components):`);
    for (const field of fields) {
        const done = set.filter((r) => r[field]).length;
        console.log(`  ${field.padEnd(14)} ${done}/${set.length}`);
    }
    const incomplete = set.filter((r) => !fields.every((f) => r[f])).map((r) => r.name);
    if (incomplete.length) console.log(`  incomplete: ${incomplete.join(', ')}`);
}
const missingTier1 = DOC_TIER_1.filter((n) => !rows.some((r) => r.name === n));
if (missingTier1.length) console.log(`\nWARNING: DOC_TIER_1 names with no contract on disk: ${missingTier1.join(', ')}`);
