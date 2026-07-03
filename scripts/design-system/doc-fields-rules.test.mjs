import { describe, it, expect } from 'vitest';
import { docFieldErrors } from './doc-fields-rules.mjs';

const base = { name: 'Button', status: 'stable' };

describe('docFieldErrors (ratchet: only applies when usage is present)', () => {
    it('is silent when the contract has no usage field', () => {
        expect(docFieldErrors(base, 1)).toEqual([]);
    });

    it('requires the full tier-1 set once usage exists', () => {
        const errors = docFieldErrors({ ...base, usage: { description: 'A button that triggers an action when pressed.' } }, 1);
        expect(errors.join('\n')).toMatch(/bestPractices/);
        expect(errors.join('\n')).toMatch(/keywords/);
        expect(errors.join('\n')).toMatch(/playground/);
        expect(errors.join('\n')).toMatch(/dense/);
    });

    it('requires at least 6 bestPractices with at least 2 do-nots for tier 1', () => {
        const bp = Array.from({ length: 6 }, () => ({ guidance: true, description: 'Do the right thing here.' }));
        const errors = docFieldErrors(
            { ...base, usage: { description: 'A button that triggers an action when pressed.', bestPractices: bp }, keywords: ['a', 'b', 'c', 'd'], playground: { defaults: {} }, dense: 'action trigger w/ variants and loading state' },
            1,
        );
        expect(errors.join('\n')).toMatch(/guidance: false/);
    });

    it('tier 2 needs only description, keywords, dense', () => {
        const errors = docFieldErrors(
            { ...base, usage: { description: 'A marketing card used on the services page grid.' }, keywords: ['card', 'service', 'grid', 'marketing'], dense: 'marketing card for the services grid' },
            2,
        );
        expect(errors).toEqual([]);
    });
});
