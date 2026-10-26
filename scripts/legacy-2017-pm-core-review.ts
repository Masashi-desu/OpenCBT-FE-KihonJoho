/** Dedicated old-PM runtime probe, using the registered producer without mutation. */
import assert from 'node:assert/strict';
import { mock } from 'node:test';
import type { Question, Template, Instance, Exam } from '../src/core/types';
import type { GenerationDefinition } from '../src/core/generators/definition';
import { additionalDefinitions } from '../src/core/generators';
import { legacyAfternoonDefinitions } from '../src/core/generators/legacy-afternoon-definitions';
import { parametersForSeed, bindQuestion, answerSignature, answerCanVary } from '../src/core/generation';
import { prepareRun } from '../src/core/session';
import { contentHash } from '../src/core/hash';
import { gradeAnswer } from '../src/core/answers';
import { schema } from '../src/core/validation';
import { fixture } from '../tests/fixtures/legacy-afternoon-main-preservation';
export async function reviewLegacy2017PmCore(base: Question, template: Template, d: GenerationDefinition, count: number, inspect: (values: number[]) => void, cleanupControl = false) {
    const before = [...additionalDefinitions], managed = [...legacyAfternoonDefinitions];
    assert(managed.includes(d));
    assert(!before.some(x => x.source === d.source));
    assert(answerCanVary(template));
    const seedByValue = new Map<number, string>();
    let searchCalls = 0;
    for (let n = 0; n < 1024 && seedByValue.size < count; n++) {
        const seed = n.toString(16).padStart(32, '0'), p = await parametersForSeed(seed, template);
        searchCalls++;
        if (!seedByValue.has(p.values[0]))
            seedByValue.set(p.values[0], seed);
    }
    assert.equal(seedByValue.size, count);
    const questions = Array.from({ length: count }, (_, v) => { inspect([v]); const q = bindQuestion(base, template, [v], 'instance-pm-core-direct-' + v, '2026-10-26T00:00:00Z'); schema('question', q); assert.equal(q.choiceShuffleAllowed, false); return q; }), signatures = questions.map(answerSignature);
    assert.equal(new Set(signatures).size, count);
    const history: Instance[] = await Promise.all(questions.map(async (q, v) => ({ schemaVersion: '3.0.0', id: 'instance-pm-source-' + v, sessionId: 'session-pm-synthetic-history', entryIndex: v, createdAt: '2026-10-26T00:00:00Z', templateRef: { id: template.id, revision: template.revision }, baseQuestionRef: { questionId: base.id, revision: base.revision }, generatorRef: template.generatorRef, parameterSelection: 'seeded', seed: seedByValue.get(v)!, parameters: { values: [v] }, question: structuredClone(q), contentSha256: await contentHash(q), bindingPerformed: true as const })));
    const bundle = fixture();
    bundle.questions.push(base);
    bundle.templates.push(template);
    const selection = { subject: base.subject, kind: 'bookmark' as const, mode: 'study' as const, bindingMode: 'generated_values' as const, bookmarkQuestionRef: { questionId: base.id, revision: base.revision } }, set = { ...structuredClone(bundle.sets[0]), id: 'set-local-pm-core', revision: 1, questionRefs: [{ questionId: base.id, revision: base.revision }], generationBindings: [{ questionRef: { questionId: base.id, revision: base.revision }, templateRef: { id: template.id, revision: template.revision } }] }, exam = { ...structuredClone(bundle.exams[0]), id: 'exam-local-pm-core', title: '登録済み旧午後core局所検査', mode: 'study' as const, questionCount: 1, choiceOrder: 'shuffle' as const };
    delete exam.timeLimitSeconds;
    delete exam.practiceScope;
    let queue: string[] = [], seedCalls = 0, now = Date.UTC(2026, 9, 26);
    const control = mock.method(crypto, 'getRandomValues', <T extends ArrayBufferView | null>(a: T): T => { assert(a); if (a instanceof Uint8Array && a.byteLength === 16) {
        const seed = queue[Math.min(seedCalls, queue.length - 1)];
        assert(seed);
        a.set(Uint8Array.from(seed.match(/../g)!.map(x => parseInt(x, 16))));
        seedCalls++;
    }
    else
        new Uint8Array(a.buffer, a.byteOffset, a.byteLength).fill(0); return a; });
    const observations: {
        forcedValues: number[];
        previous: number[][];
        samplerSeedCalls: number;
        success: boolean;
        error: {
            code: unknown;
        } | null;
        historyUnchanged: boolean;
    }[] = [];
    try {
        const execute = async (values: number[], recent: Instance[], policy: 'cycle_unique' | 'instance_unique', capacity = false) => { queue = values.map(v => seedByValue.get(v)!); seedCalls = 0; const original = JSON.stringify(recent), ex: Exam = { ...exam, duplicatePolicy: policy }; if (policy === 'cycle_unique')
            delete ex.questionCount; let error: {
            code: unknown;
        } | null = null, success = false; try {
            const run = await prepareRun(bundle, selection, {}, now++, undefined, { questions: [base], exam: ex, set, quota: {} }, recent);
            assert(!capacity, 'capacity must refuse');
            assert.equal(run.instances.length, 1);
            assert.deepEqual(run.session.entries[0].choiceOrder, run.issued[0].choices.map(c => c.id));
            assert.equal(run.issued[0].choiceShuffleAllowed, false);
            assert.equal(run.instances[0].parameters.values[0], values[Math.min(seedCalls - 1, values.length - 1)]);
            success = true;
        }
        catch (e) {
            const x = e as Error & {
                code?: unknown;
            };
            if (!capacity)
                throw e;
            assert.equal(x.code, 'GENERATION_CAPACITY');
            assert.equal(seedCalls, 128);
            error = { code: x.code };
        } assert.equal(JSON.stringify(recent), original); const row = { forcedValues: values, previous: recent.map(x => x.parameters.values), samplerSeedCalls: seedCalls, success, error, historyUnchanged: true }; observations.push(row); return row; };
        const directBind = questions.map((q, v) => ({ values: [v], contentSha256: answerSignature(q), schema: 'pass' }));
        for (let v = 0; v < count; v++)
            await execute([v], [], 'instance_unique');
        for (let previous = 0; previous < count; previous++) {
            await execute([previous], [history[previous]], 'cycle_unique', true);
            for (let next = 0; next < count; next++)
                if (next !== previous) {
                    const r = await execute([previous, next], [history[previous]], 'cycle_unique');
                    assert.equal(r.samplerSeedCalls, 2);
                }
        }
        await execute(Array.from({ length: count }, (_, i) => i), history, 'instance_unique', true);
        let usedThreeControl: undefined | {
            samplerSeedCalls: number;
            realError: null;
        }, distinctSessionControl: undefined | {
            samplerSeedCalls: number;
            reusedOlderSessionInput: boolean;
        };
        if (count === 4) {
            const used = await execute([0, 1, 2, 3], history.slice(0, 3), 'instance_unique');
            assert.equal(used.samplerSeedCalls, 4);
            usedThreeControl = { samplerSeedCalls: 4, realError: null };
            const separate = [{ ...structuredClone(history[0]), sessionId: 'session-pm-latest', createdAt: '2026-10-26T00:10:00Z' }, { ...structuredClone(history[1]), sessionId: 'session-pm-older', createdAt: '2026-10-26T00:09:00Z' }], other = await execute([1], separate, 'instance_unique');
            assert.equal(other.samplerSeedCalls, 1);
            distinctSessionControl = { samplerSeedCalls: 1, reusedOlderSessionInput: true };
        }
        const privateEligibility = [];
        for (let mask = 0; mask < (1 << count); mask++)
            for (let previous = -1; previous < count; previous++) {
                const eligible = Array.from({ length: count }, (_, i) => i).filter(i => !(mask & (1 << i)) && i !== previous);
                privateEligibility.push({ mask, previous, eligible });
            }
        const JSONQuestions = [];
        for (const q of questions) {
            const saved = JSON.parse(JSON.stringify(q));
            assert.equal(await contentHash(q), await contentHash(saved));
            const correct = Object.fromEntries(q.correctAnswer.parts!.map(p => { assert(p.kind === 'choice'); return [p.partId, p.choiceId]; }));
            assert.equal(gradeAnswer(saved, { selectedPartChoices: correct }).outcome, 'correct');
            JSONQuestions.push({ signature: answerSignature(q), contentSha256: await contentHash(q) });
        }
        if (cleanupControl)
            throw Error('PM' + d.source.split('-').pop() + '_CLEANUP_CONTROL');
        return { scope: 'registered_producer_real_bind_and_prepareRun_local_not_App_admission', registryBefore: before.length, registryRestored: additionalDefinitions.length, seedSearchCalls: searchCalls, seedByValue: [...seedByValue], directBind, privateQuestions: JSONQuestions, observations, privateEligibility, distinctSessionControl: distinctSessionControl ?? { samplerSeedCalls: 0, reusedOlderSessionInput: false }, usedThreeControl: usedThreeControl ?? { samplerSeedCalls: 0, realError: null }, limits: 'Local factories remain excluded. These are actual seeded core runs and finite-capacity controls; normal collection/Run restoration/IDB/release admission is verified separately.' };
    }
    finally {
        control.mock.restore();
        assert.deepEqual(additionalDefinitions, before);
        assert.deepEqual(legacyAfternoonDefinitions, managed);
        before.forEach((item, i) => assert.equal(additionalDefinitions[i], item));
        managed.forEach((item, i) => assert.equal(legacyAfternoonDefinitions[i], item));
    }
}
