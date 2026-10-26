import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { admit2017SpringAfternoonMajor, inventory2017SpringAfternoon, check2017SpringAfternoonRelease, checkFile, AfternoonStageError, same2017SpringAfternoonCodePins, spring2017AfternoonLearningPayload, type BookletCandidate, type ReleaseReceipt } from '../scripts/stage-2017-spring-afternoon';
import { pm7Records } from '../scripts/import-legacy-2017-pm7';
import { pm6Records } from '../scripts/import-legacy-2017-pm6';
import { contentHash } from '../src/core/hash';
test('13大問の不足を1〜13すべて列挙しpartialを登録済みや完成候補と扱わない', async () => { const r = await inventory2017SpringAfternoon([]); assert.equal(r.preparedMajors, 0); assert.equal(r.normalAppRegistered, 0); assert.equal(r.rows.length, 13); assert.equal(r.status, 'incomplete'); assert.deepEqual(r.issues.filter(s => s.startsWith('missing_major:')), Array.from({ length: 13 }, (_, i) => 'missing_major:' + (i + 1))); assert(r.issues.includes('official_packet_missing')); assert(r.rows.every(row => !row.normalAppRegistered)); });
test('admissionは学習内容とrightsを保持し公開metadataの全変更を差分で説明する', async () => { const { records } = await pm7Records(), before = structuredClone(records), r = await admit2017SpringAfternoonMajor({ number: 7, prepared: records, assetsRoot: '/unused-until-whole-booklet-evidence-gate' }); assert.deepEqual(records, before); assert(r.admitted.questions.every(q => q.distribution === 'included' && !q.choiceShuffleAllowed)); assert.equal(r.admitted.templates[0].originalContentSha256, await contentHash(r.admitted.questions[1])); assert.notEqual(r.admitted.templates[0].originalContentSha256, records.templates[0].originalContentSha256); for (let i = 0; i < 2; i++)
    assert.deepEqual(spring2017AfternoonLearningPayload(r.admitted.questions[i]), spring2017AfternoonLearningPayload(records.questions[i])); assert.deepEqual(r.admitted.rights, records.rights); const restored = structuredClone(r.admitted); for (const change of [...r.changes].reverse()) {
    const keys = change.path.slice(1).split('/');
    let row: any = restored;
    for (const key of keys.slice(0, -1))
        row = row[key];
    assert.deepEqual(row[keys.at(-1)!], change.after);
    row[keys.at(-1)!] = structuredClone(change.before);
} assert.deepEqual(restored, records); assert(r.changes.some(c => c.path.includes('/origin/changes/'))); assert(r.changes.some(c => c.path.includes('/review/notes'))); });
test('未確認の素材条件・他大問への偽装・古い基準hashは候補へ流さない', async () => { const { records } = await pm7Records(); const uncertain = structuredClone(records); uncertain.rights[0].uses.adaptation = 'unknown'; await assert.rejects(admit2017SpringAfternoonMajor({ number: 7, prepared: uncertain, assetsRoot: '/unused' })); await assert.rejects(admit2017SpringAfternoonMajor({ number: 8, prepared: records, assetsRoot: '/unused' })); const stale = structuredClone(records); stale.templates[0].originalContentSha256 = '0'.repeat(64); await assert.rejects(admit2017SpringAfternoonMajor({ number: 7, prepared: stale, assetsRoot: '/unused' })); });
test('空のcandidateや検査名だけのreceiptからrelease成功を作れない', async () => { const candidate: BookletCandidate = { sources: [], rights: [], assets: [], questions: [], templates: [], sets: [], exams: [] }, receipt = { candidateSHA256: await contentHash(candidate), checks: {}, codePins: [], assetsRoot: '/unused' } as unknown as ReleaseReceipt; await assert.rejects(check2017SpringAfternoonRelease(candidate, receipt), error => error instanceof AfternoonStageError && error.issues.includes('release_incomplete_booklet') && error.issues.includes('release_check_missing:npmCheck')); });
test('素材pinは実bytesと長さを検査し撮影や転送後の改変を拒否する', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-stage-pin-'));
    try {
        const file = path.join(dir, 'bytes.txt');
        fs.writeFileSync(file, 'abc');
        const pin = { path: file, sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', byteLength: 3 };
        assert.equal((await checkFile(pin)).toString(), 'abc');
        fs.writeFileSync(file, 'abd');
        await assert.rejects(checkFile(pin));
    }
    finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
test('code pinsは必要集合とexact一致し欠落・余分・変更・重複を成功扱いしない', () => { const a = { path: '/runtime/a.ts', sha256: 'a'.repeat(64), byteLength: 1 }, b = { path: '/runtime/b.ts', sha256: 'b'.repeat(64), byteLength: 2 }, expected = [a, b]; assert(same2017SpringAfternoonCodePins([b, a], expected)); for (const actual of [[a], [a, b, { path: '/unrelated/c.ts', sha256: 'c'.repeat(64), byteLength: 3 }], [{ ...a, sha256: 'f'.repeat(64) }, b], [a, a]])
    assert.equal(same2017SpringAfternoonCodePins(actual, expected), false); });
test('公開metadataは個別範囲と法的限界を残し、新たな未確認条件を自動で上書きしない', async () => { const { records } = await pm6Records(), r = await admit2017SpringAfternoonMajor({ number: 6, prepared: records, assetsRoot: '/unused' }); for (const source of r.admitted.sources)
    assert(String(source.limits).includes('第三者素材の不存在や包括的許諾を保証しない')); assert.deepEqual(r.admitted.rights, records.rights); const held = structuredClone(records); held.sources[0].limits = String(held.sources[0].limits) + ' 新たな素材の権利条件が未確認。'; await assert.rejects(admit2017SpringAfternoonMajor({ number: 6, prepared: held, assetsRoot: '/unused' }), /source_limits_review_required/); });
test('releaseでもp74全面又は未承認cropを拒否しcandidate gateの迂回を認めない', async () => {
    const { records } = await pm7Records(), asset = structuredClone(records.assets[0]);
    asset.attribution.sourceRefs[0].locator.page = 74;
    const candidate: BookletCandidate = { sources: [], rights: [], assets: [asset], questions: [], templates: [], sets: [], exams: [] };
    const receipt = { candidateSHA256: await contentHash(candidate), checks: {}, codePins: [], assetsRoot: '/unused' } as unknown as ReleaseReceipt;
    await assert.rejects(check2017SpringAfternoonRelease(candidate, receipt), error => error instanceof AfternoonStageError && error.issues.includes('release_unapproved_jis_page74_material:' + asset.id));
});
