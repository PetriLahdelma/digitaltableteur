/**
 * Ratchet enforcement for contract doc fields: rules apply only once a
 * contract has adopted the `usage` field, so unmigrated components stay
 * green while migrated ones can never regress.
 */
export function docFieldErrors(contract, docTier) {
    if (!contract.usage) return [];
    const errors = [];
    const name = contract.name;
    const push = (msg) => errors.push(`${name}.contract.json: ${msg}`);

    if (!contract.keywords || contract.keywords.length < 4) {
        push('doc fields require keywords[] with at least 4 entries');
    }
    if (!contract.dense) {
        push('doc fields require dense (a <=200 char agent-facing one-liner)');
    }
    if (docTier === 1) {
        const bp = contract.usage.bestPractices ?? [];
        if (bp.length < 6) {
            push('tier-1 docs require at least 6 usage.bestPractices entries');
        }
        if (bp.filter((entry) => entry.guidance === false).length < 2) {
            push('tier-1 docs require at least 2 bestPractices with guidance: false (do-nots)');
        }
        if (!contract.playground?.defaults) {
            push('tier-1 docs require playground.defaults');
        }
        const hasParts = (contract.slots?.length ?? 0) > 0 || (contract.subParts?.length ?? 0) > 0;
        if (hasParts && !(contract.usage.anatomy?.length >= 2)) {
            push('tier-1 docs require usage.anatomy (>=2 parts) when the component declares slots or subParts');
        }
    }
    return errors;
}
