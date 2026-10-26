/** Whole-booklet staging only. No main/public/catalog writes, merging or deployment. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import type { Bundle, Question, SetRecord, Exam, Source, SourceRef } from '../src/core/types';
import { refOf } from '../src/core/types';
import { contentHash, sha256 } from '../src/core/hash';
import { schema } from '../src/core/validation';
import { validateSourceFormat } from '../src/core/generation-formats';
import { apply2017SpringAfternoonPublicMetadata } from './stage-2017-spring-afternoon-public-metadata';
export const spring2017Afternoon = { id: '2017h29h-fe-pm', questionSHA256: '7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8', questionBytes: 13923067, answerSHA256: '7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b', answerBytes: 202195, numbers: Array.from({ length: 13 }, (_, i) => i + 1) };
export const correctedQ12Crop = { png: 'd57ee1019fda6c5e9752f681e0a2dcaa0c4f856c299f73a4aa1b02c22b2916e0', webp: '6ed2179c9f0ee9b5a8ed0253df7923b5c5949a6b5a9e867b81b4a7236d73c49a' };
/** ANS1 independently read in ledger 3d6f78f964722111e851bc6432043eb14921123b800f4759cff46f0e62fee51e. */
export const spring2017OfficialAnswerLabels = ['エイウアオ', 'イエイイエ', 'アエアアア', 'ウアアイ', 'イカウイウ', 'エアウウウオ', 'ウアウカエイアケ', 'イオキイイカア', 'カキエイイアイ', 'ウイエアエエア', 'アエアエアウウ', 'オウイエアオ', 'イアウウイエ'];
export type MajorRecords = Pick<Bundle, 'sources' | 'rights' | 'assets' | 'questions' | 'templates'>;
export type FilePin = {
    path: string;
    sha256: string;
    byteLength: number;
};
export type MajorReview = {
    status: 'pass';
    number: number;
    recordsSha256: string;
    questionPaperSHA256: string;
    answerPaperSHA256: string;
    reviewerIds: string[];
    checks: {
        transcription: 'pass';
        materials: 'pass';
        independentSemantics: 'pass';
        display: 'pass';
    };
    evidence: FilePin[];
    codePins: FilePin[];
};
export type MajorInput = {
    number: number;
    prepared: MajorRecords;
    assetsRoot: string;
    review?: MajorReview;
};
export type OfficialPacket = {
    questionPaper: FilePin;
    answerPaper: FilePin;
    covers: {
        page: 1 | 2;
        file: FilePin;
    }[];
    acquisition: FilePin;
    review: {
        status: 'pass';
        checkedOn: string;
        questionPaperSHA256: string;
        answerPaperSHA256: string;
        reviewedPages: number[];
        reviewerIds: string[];
        evidence: FilePin[];
    };
    correctedQ12Crop: FilePin;
};
export type BookletCandidate = MajorRecords & Pick<Bundle, 'sets' | 'exams'>;
export type AdmissionChange = {
    number: number;
    path: string;
    before: unknown;
    after: unknown;
    reason: string;
};
export class AfternoonStageError extends Error {
    constructor(public issues: string[]) { super(issues.join('\n')); this.name = 'AfternoonStageError'; }
}
export async function checkFile(pin: FilePin, options: { allowEmpty?: boolean } = {}) {
    if (!pin || !path.isAbsolute(pin.path) || !Number.isSafeInteger(pin.byteLength) || pin.byteLength < (options.allowEmpty ? 0 : 1) || !/^[a-f0-9]{64}$/.test(pin.sha256))
        throw new AfternoonStageError(['invalid_file_pin']);
    const b = fs.readFileSync(pin.path);
    if (b.byteLength !== pin.byteLength || await sha256(b) !== pin.sha256)
        throw new AfternoonStageError(['file_hash_mismatch:' + pin.path]);
    return b;
}
const tree = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? tree(path.join(dir, entry.name)) : [path.resolve(dir, entry.name)]);
/** A review cannot remain valid after a non-reference generator/UI/oracle edit. */
export async function requiredMajorCodePins(number: number) {
    const source = tree('src'), scripts = tree('scripts').filter(p => path.dirname(p) === path.resolve('scripts')), tests = tree('tests'), schemas = tree('docs/public/schemas');
    const owned = new RegExp('(?:legacy-2017-pm' + number + '(?:[.-])|Legacy2017Pm' + number + '(?:[A-Z.]|$))'), shared = new Set(['src/core/generation.ts', 'src/core/source-figures.ts', 'src/core/validation.ts', 'src/core/generators/definition.ts', 'src/core/generators/index.ts', 'src/core/generators/legacy-afternoon-definitions.ts', 'src/core/generators/legacy-afternoon-binding.ts', 'src/core/legacy-afternoon-figures.ts', 'src/ui/Content.tsx', 'src/ui/SourceFigure.tsx', 'src/ui/AnswerChoices.tsx', 'src/ui/LegacyAfternoonFigure.tsx', 'src/ui/LegacyAfternoonCode.tsx', 'src/core/generators/legacy-afternoon-public-notes.ts', 'src/core/generators/legacy-afternoon-study-terms.ts', 'src/ui/StudyTerms.tsx', 'src/core/study-terms.ts', 'src/ui/style.css', 'src/ui/tokens.css', 'src/ui/ContentText.tsx', 'src/ui/tableChoiceName.ts', 'src/ui/MaterialViewer.tsx', 'src/ui/scrollbars.ts', 'src/generated/validators.js', 'scripts/stage-2017-spring-afternoon-public-metadata.ts'].map(p => path.resolve(p)));
    const paths = [...new Set([...source, ...scripts, ...tests, ...schemas].filter(p => owned.test(path.basename(p)) || shared.has(p) || p.startsWith(path.resolve('docs/public/schemas') + path.sep)))].sort();
    return Promise.all(paths.map(async (p) => { const b = fs.readFileSync(p); return { path: p, byteLength: b.byteLength, sha256: await sha256(b) }; }));
}
export function same2017SpringAfternoonCodePins(actual: FilePin[] | undefined, required: FilePin[]) {
    if (!Array.isArray(actual) || actual.length !== required.length || new Set(actual.map(p => p.path)).size !== required.length)
        return false;
    const byPath = new Map(actual.map(p => [p.path, p]));
    return required.every(p => { const row = byPath.get(p.path); return row?.sha256 === p.sha256 && row.byteLength === p.byteLength; });
}
export function required2017SpringAfternoonReleaseCodePaths() { return [...new Set([...tree('src'), ...tree('tests'), ...tree('docs/public/schemas'), ...tree('public'), ...tree('scripts'), ...tree('.github/workflows'), ...['index.html', 'package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json', 'AGENTS.md', 'README.md'].map(p => path.resolve(p))])].sort(); }
export async function required2017SpringAfternoonReleaseCodePins() { return Promise.all(required2017SpringAfternoonReleaseCodePaths().map(async (p) => { const bytes = fs.readFileSync(p); return { path: p, sha256: await sha256(bytes), byteLength: bytes.length }; })); }
export async function spring2017AfternoonReviewRequests(inputs: MajorInput[]) {
    return Promise.all(inputs.map(async (input) => ({
        status: "pending", number: input.number, recordsSha256: await contentHash(input.prepared),
        questionPaperSHA256: spring2017Afternoon.questionSHA256, answerPaperSHA256: spring2017Afternoon.answerSHA256,
        reviewerIds: [], checks: { transcription: "pending", materials: "pending", independentSemantics: "pending", display: "pending" },
        evidence: [], codePins: await requiredMajorCodePins(input.number),
        scope: "Review request only. A reviewer must inspect current proof before issuing a pass receipt; application admission is separate."
    })));
}
const originalId = (n: number) => 'question-ipa-2017h29h-fe-pm-' + n, baseId = (n: number) => 'question-template-source-2017h29h-fe-pm-' + n, templateId = (n: number) => 'template-source-2017h29h-fe-pm-' + n;
function checkMajorShape(input: MajorInput) {
    const { number: n, prepared: p } = input;
    if (!spring2017Afternoon.numbers.includes(n))
        throw new AfternoonStageError(['unexpected_major:' + n]);
    for (const k of ['sources', 'rights', 'assets', 'questions', 'templates'] as const)
        if (!Array.isArray(p[k]))
            throw new AfternoonStageError(['missing_records:' + n + ':' + k]);
    assert.equal(p.questions.length, 2);
    assert.equal(p.templates.length, 1);
    const original = p.questions.find(q => q.id === originalId(n)), base = p.questions.find(q => q.id === baseId(n)), template = p.templates[0];
    assert(original && base);
    assert.equal(original.origin.kind, 'official_reprint');
    assert.equal(base.origin.kind, 'official_adaptation');
    assert.deepEqual(base.origin.derivedFrom, [refOf(original)]);
    assert.equal(template.id, templateId(n));
    assert.deepEqual(template.baseQuestionRef, refOf(base));
    assert.equal(template.generatorRef.id, 'generator-source-2017h29h-fe-pm-' + n);
    assert.equal(template.distribution, 'excluded');
    for (const q of [original, base]) {
        assert.equal(q.distribution, 'excluded');
        assert.equal(q.choiceShuffleAllowed, false);
        assert.equal(q.subject, 'B');
        assert(q.answerParts?.length);
        assert(q.origin.sourceRefs.length > 0);
        assert(q.origin.sourceRefs.every(r => r.locator.year === 2017 && r.locator.period === '春期' && r.locator.timeSlot === '午後' && r.locator.questionNumber === String(n)));
        schema('question', q);
    }
    const actualLabels = original.answerParts!.map(part => { const answer = original.correctAnswer.parts!.find(a => a.kind === 'choice' && a.partId === part.id); assert(answer?.kind === 'choice'); const index = part.choiceIds.indexOf(answer.choiceId); assert(index >= 0); return 'アイウエオカキクケコサシスセソ'[index]; }).join('');
    assert.equal(actualLabels, spring2017OfficialAnswerLabels[n - 1], 'official ANS1 labels Q' + n);
    for (const [k, rows] of Object.entries(p))
        if (k !== 'questions')
            for (const row of rows)
                schema(k === 'rights' ? 'rights' : k.slice(0, -1), row);
    if (!p.rights.length || p.rights.some(r => Object.values(r.uses).some(use => use !== 'allowed') || !['none_identified', 'cleared'].includes(r.thirdParty.status)))
        throw new AfternoonStageError(['unverified_material_rights:' + n]);
    const sourceIds = new Set(p.sources.map(s => s.id)), rightsIds = new Set(p.rights.map(r => r.id));
    for (const q of p.questions) {
        assert(q.origin.sourceRefs.every(ref => sourceIds.has(ref.sourceId)));
        assert(q.prompt.attribution.rightsRefs.every(id => rightsIds.has(id) || id === 'rights-original'));
    }
    return { original, base, template };
}
export function spring2017AfternoonLearningPayload(question: Question) {
    const { id, revision, lifecycle, subject, learning, contexts, contextRefs, prompt, choices, answerParts, correctAnswer, explanation, assetRefs, choiceShuffleAllowed } = question;
    return { id, revision, lifecycle, subject, learning, contexts, contextRefs, prompt, choices, answerParts, correctAnswer, explanation, assetRefs, choiceShuffleAllowed };
}
/** Admission metadata changes are explicit; original/prepared learning payload stays intact. */
export async function admit2017SpringAfternoonMajor(input: MajorInput) {
    const { base } = checkMajorShape(input);
    assert.equal(input.prepared.templates[0].originalContentSha256, await contentHash(base));
    const admitted = structuredClone(input.prepared), changes: AdmissionChange[] = [];
    for (let i = 0; i < admitted.questions.length; i++) {
        changes.push({ number: input.number, path: '/questions/' + i + '/distribution', before: 'excluded', after: 'included', reason: 'whole_booklet_candidate_only' });
        admitted.questions[i].distribution = 'included';
    }
    admitted.templates[0].distribution = 'included';
    changes.push({ number: input.number, path: '/templates/0/distribution', before: 'excluded', after: 'included', reason: 'whole_booklet_candidate_only' });
    changes.push(...apply2017SpringAfternoonPublicMetadata(input.number, admitted).map(change => ({ number: input.number, ...change })));
    for (const question of admitted.questions) {
        const before = input.prepared.questions.find(q => q.id === question.id)!;
        assert.deepEqual(spring2017AfternoonLearningPayload(question), spring2017AfternoonLearningPayload(before), 'admission must not change question/choice/answer/explanation material');
    }
    assert.deepEqual(admitted.rights, input.prepared.rights, 'admission cannot waive material rights or holds');
    assert.deepEqual(admitted.assets, input.prepared.assets, 'admission cannot replace reviewed source assets');
    const hash = await contentHash(admitted.questions.find(q => q.id === baseId(input.number))!);
    changes.push({ number: input.number, path: '/templates/0/originalContentSha256', before: admitted.templates[0].originalContentSha256, after: hash, reason: 'included_base_exact_content_hash' });
    admitted.templates[0].originalContentSha256 = hash;
    validateSourceFormat(admitted.questions.find(q => q.id === baseId(input.number))!, admitted.templates[0]);
    return { admitted, changes };
}
async function checkMajorEvidence(input: MajorInput, packet?: OfficialPacket) {
    const issues: string[] = [];
    try {
        checkMajorShape(input);
    }
    catch (error) {
        issues.push('major_shape:' + input.number + ':' + String(error));
        return issues;
    }
    const review = input.review;
    if (!review || review.status !== 'pass' || review.number !== input.number || !review.reviewerIds.length || review.questionPaperSHA256 !== spring2017Afternoon.questionSHA256 || review.answerPaperSHA256 !== spring2017Afternoon.answerSHA256 || !['transcription', 'materials', 'independentSemantics', 'display'].every(key => review.checks?.[key as keyof MajorReview['checks']] === 'pass') || !review.evidence.length)
        issues.push('review_missing_or_incomplete:' + input.number);
    else {
        if (review.recordsSha256 !== await contentHash(input.prepared))
            issues.push('stale_review_records:' + input.number);
        if (!same2017SpringAfternoonCodePins(review.codePins, await requiredMajorCodePins(input.number)))
            issues.push('stale_review_code:' + input.number);
        for (const pin of review.evidence)
            try {
                await checkFile(pin);
            }
            catch (error) {
                issues.push('review_evidence:' + input.number + ':' + String(error));
            }
    }
    for (const asset of input.prepared.assets) {
        const actual = path.resolve(input.assetsRoot, asset.path);
        if (!actual.startsWith(path.resolve(input.assetsRoot) + path.sep)) {
            issues.push('asset_path_escape:' + input.number);
            continue;
        }
        try {
            await checkFile({ path: actual, sha256: asset.sha256, byteLength: asset.byteLength });
        }
        catch (error) {
            issues.push('asset:' + input.number + ':' + String(error));
        }
        if (asset.attribution.sourceRefs.some(ref => ref.locator.page === 74) && (!packet || asset.sha256 !== correctedQ12Crop.webp || asset.width !== 1432 || asset.height !== 1240))
            issues.push('unapproved_jis_page74_material:' + input.number + ':' + asset.id);
    }
    return issues;
}
async function checkPacket(packet?: OfficialPacket) {
    const issues: string[] = [];
    if (!packet)
        return ['official_packet_missing'];
    if (packet.questionPaper.sha256 !== spring2017Afternoon.questionSHA256 || packet.questionPaper.byteLength !== spring2017Afternoon.questionBytes || packet.answerPaper.sha256 !== spring2017Afternoon.answerSHA256 || packet.answerPaper.byteLength !== spring2017Afternoon.answerBytes)
        issues.push('official_document_identity');
    if (JSON.stringify(packet.covers.map(c => c.page)) !== '[1,2]')
        issues.push('official_cover_pages');
    if (packet.correctedQ12Crop?.sha256 !== correctedQ12Crop.png)
        issues.push('corrected_q12_crop_pin_missing');
    const r = packet.review;
    if (!r || r.status !== 'pass' || !/^\d{4}-\d{2}-\d{2}$/.test(r.checkedOn) || r.questionPaperSHA256 !== spring2017Afternoon.questionSHA256 || r.answerPaperSHA256 !== spring2017Afternoon.answerSHA256 || JSON.stringify(r.reviewedPages) !== '[1,2]' || !r.reviewerIds.length || !r.evidence.length)
        issues.push('booklet_cover_review_missing');
    for (const p of [packet.questionPaper, packet.answerPaper, packet.acquisition, packet.correctedQ12Crop, ...packet.covers.map(c => c.file), ...(r?.evidence ?? [])])
        try {
            await checkFile(p);
        }
        catch (error) {
            issues.push('official_packet:' + String(error));
        }
    return issues;
}
export async function inventory2017SpringAfternoon(inputs: MajorInput[], packet?: OfficialPacket) {
    const issues = await checkPacket(packet), numbers = inputs.map(i => i.number);
    if (new Set(numbers).size !== numbers.length)
        issues.push('duplicate_major_inputs');
    const rows = [];
    for (const n of spring2017Afternoon.numbers) {
        const item = inputs.find(i => i.number === n);
        if (!item) {
            rows.push({ number: n, prepared: false, rightsConfirmed: false, assetsVerified: false, reviewVerified: false, normalAppRegistered: false, issues: ['missing_major:' + n] });
            issues.push('missing_major:' + n);
            continue;
        }
        const local = await checkMajorEvidence(item, packet), shapeValid = !local.some(x => x.startsWith('major_shape')), reviewVerified = shapeValid && Boolean(item.review) && !local.some(x => x.includes('review'));
        rows.push({ number: n, prepared: true, preparedRightsFlagsAllowed: shapeValid && !local.some(x => x.includes('rights')), rightsConfirmed: reviewVerified && !local.some(x => x.includes('rights') || x.includes('jis')), assetsVerified: shapeValid && !local.some(x => x.startsWith('asset')), reviewVerified, normalAppRegistered: false, preparedRecordsSha256: await contentHash(item.prepared), issues: local });
        issues.push(...local);
    }
    for (const n of numbers)
        if (!spring2017Afternoon.numbers.includes(n))
            issues.push('unexpected_major:' + n);
    return { scope: spring2017Afternoon.id, expectedMajors: 13, preparedMajors: rows.filter(r => r.prepared).length, normalAppRegistered: 0, rows, issues, status: issues.length ? 'incomplete' : 'content_ready_for_candidate', wholePre2023ReadinessUnchanged: true };
}
function policyRef(page: number): SourceRef { return { sourceId: 'source-ipa-2017h29h-fe-pm-booklet', locator: { section: '平成29年度 春期 基本情報技術者試験 午後 表紙・問題選択方法', page, year: 2017, period: '春期', exam: '基本情報技術者試験', subject: '旧制度・午後', timeSlot: '午後' } }; }
export async function build2017SpringAfternoonCandidate(inputs: MajorInput[], packet: OfficialPacket) {
    const inventory = await inventory2017SpringAfternoon(inputs, packet);
    if (inventory.issues.length)
        throw new AfternoonStageError(inventory.issues);
    const candidate: BookletCandidate = { sources: [], rights: [], assets: [], questions: [], templates: [], sets: [], exams: [] }, changes: AdmissionChange[] = [];
    for (const input of [...inputs].sort((a, b) => a.number - b.number)) {
        const result = await admit2017SpringAfternoonMajor(input);
        for (const k of ['sources', 'rights', 'assets', 'questions', 'templates'] as const)
            (candidate[k] as unknown[]).push(...result.admitted[k]);
        changes.push(...result.changes);
    }
    const bookletSource: Source = { schemaVersion: '3.0.0', id: 'source-ipa-2017h29h-fe-pm-booklet', title: '平成29年度 春期 基本情報技術者試験 午後 表紙・問題選択方法', publisher: '独立行政法人情報処理推進機構（IPA）', url: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf', sha256: spring2017Afternoon.questionSHA256, checkedOn: packet.review.checkedOn, type: 'official_problem', availability: 'officially_published', dateNote: '原資料は2017年度春期の試験冊子。掲載ページの更新日を添付PDFの公開日と断定せず、取得確認日はcheckedOnで示す。', scope: 'QS原表紙p1〜2とANS原本の照合による13大問の選択方式と150分。', sections: ['p1 表紙・時間', 'p2 問題選択・解答方法'], facts: ['13:00〜15:30、150分。問1・8必須、問2〜7から4、問9〜13から1。', '公式紙面の選択超過時ははじめの規定数。本アプリは超過を開始前に防ぎ、不正な保存値を黙って切り捨てない。'], supports: ['annual-sets', 'random-mix', 'answer-validation'], limits: '表紙に基づく方式と時間の出典。個別問題・言語資料・第三者素材の権利確認は各Source/Rightに分ける。' };
    candidate.sources.push(bookletSource);
    const originals = spring2017Afternoon.numbers.map(n => refOf(candidate.questions.find(q => q.id === originalId(n))!)), bases = spring2017Afternoon.numbers.map(n => refOf(candidate.questions.find(q => q.id === baseId(n))!));
    const exam = (mode: 'study' | 'practice', mix: boolean): Exam => ({ schemaVersion: '3.0.0', id: 'exam-2017-spring-pm-' + (mix ? 'mix-' : '') + mode, revision: 1, title: '2017年度 春期・旧午後 ' + (mix ? 'ランダムミックス ' : '') + (mode === 'study' ? '学習・復習' : '時間付き練習'), subject: 'B', mode, questionCount: mode === 'study' ? 13 : 7, ...(mode === 'practice' ? { timeLimitSeconds: 9000, practiceScope: 'public_subset' as const } : {}), questionOrder: 'set', choiceOrder: 'fixed', duplicatePolicy: mix ? 'instance_unique' : 'lineage_unique', shortagePolicy: 'block' });
    candidate.exams = [exam('study', false), exam('practice', false), exam('study', true), exam('practice', true)];
    const annual: SetRecord = { schemaVersion: '3.0.0', id: 'set-annual-2017-spring-pm', revision: 1, title: '2017年度 春期・午後', subject: 'B', distribution: 'included', questionRefs: originals, examConfigRefs: candidate.exams.slice(0, 2).map(e => ({ id: e.id, revision: e.revision })), generationBindings: [], questionSelection: { requiredQuestionRefs: [originals[0], originals[7]], optionalGroups: [{ id: 'general', label: '問2〜7から4問', questionRefs: originals.slice(1, 7), choose: 4 }, { id: 'language', label: '問9〜13から1問', questionRefs: originals.slice(8), choose: 1 }], sourceRefs: [policyRef(1), policyRef(2)], excessPolicy: 'paper_order' } };
    const mix: SetRecord = { schemaVersion: '3.0.0', id: 'set-mix-2017-spring-pm', revision: 1, title: '2017年度 春期・旧午後 ランダムミックス', subject: 'B', distribution: 'included', questionRefs: bases, examConfigRefs: candidate.exams.slice(2).map(e => ({ id: e.id, revision: e.revision })), generationBindings: bases.map((questionRef, i) => ({ questionRef, templateRef: { id: templateId(i + 1), revision: 1 } })) };
    candidate.sets = [annual, mix];
    for (const [k, rows] of Object.entries(candidate)) {
        assert.equal(new Set(rows.map(row => row.id)).size, rows.length, 'duplicate ' + k);
        for (const row of rows)
            schema(k === 'rights' ? 'rights' : k.slice(0, -1), row);
    }
    assert.equal(candidate.questions.length, 26);
    assert.equal(candidate.templates.length, 13);
    assert.equal(candidate.questions.filter(q => q.origin.kind === 'official_reprint').reduce((n, q) => n + q.answerParts!.length, 0), 78);
    return { candidate, changes, inventory, candidateSHA256: await contentHash(candidate), status: 'candidate_pending_normal_app_release_gate' };
}
/** Required global coverage references; the current-format pool filters PM separately. */
export async function spring2017AfternoonGlobalMixPatch(existing: SetRecord, candidate: BookletCandidate) {
    assert.equal(existing.id, 'set-mix-b');
    assert.equal(candidate.templates.length, 13);
    const after = structuredClone(existing), appended = [];
    for (const n of spring2017Afternoon.numbers) {
        const q = candidate.questions.find(q => q.id === baseId(n)), t = candidate.templates.find(t => t.id === templateId(n));
        assert(q && t);
        assert(!after.questionRefs.some(r => r.questionId === q.id));
        assert(!after.generationBindings.some(b => b.templateRef.id === t.id));
        const questionRef = refOf(q), binding = { questionRef, templateRef: { id: t.id, revision: t.revision } };
        after.questionRefs.push(questionRef);
        after.generationBindings.push(binding);
        appended.push(binding);
    }
    schema('set', after);
    return { setId: existing.id, beforeSHA256: await contentHash(existing), afterSHA256: await contentHash(after), before: structuredClone(existing), after, appended, meaning: 'coverage bookkeeping; old PM must remain excluded from the current subject-B sampling pool' };
}
export const spring2017ReleaseChecks = ['npmCheck', 'annualStudy13', 'annualPractice75Selections7At9000', 'randomMix', 'searchBookmarks', 'answerGrading', 'saveResumeHistory', 'sourceLicenseDisplay', 'visualLightDarkMobile', 'existingCurrentAnd2022Regression'] as const;
export type ReleaseReceipt = {
    candidateSHA256: string;
    checks: Record<typeof spring2017ReleaseChecks[number], {
        status: 'pass';
        evidence: FilePin[];
    }>;
    codePins: FilePin[];
    assetsRoot: string;
};
export async function check2017SpringAfternoonRelease(candidate: BookletCandidate, receipt: ReleaseReceipt) {
    const issues: string[] = [];
    if (receipt.candidateSHA256 !== await contentHash(candidate))
        issues.push('stale_release_candidate');
    if (candidate.questions.length !== 26 || candidate.templates.length !== 13 || spring2017Afternoon.numbers.some(n => !candidate.questions.some(q => q.id === originalId(n) && q.distribution === 'included') || !candidate.questions.some(q => q.id === baseId(n) && q.distribution === 'included') || !candidate.templates.some(t => t.id === templateId(n) && t.distribution === 'included')))
        issues.push('release_incomplete_booklet');
    for (const [k, rows] of Object.entries(candidate)) {
        if (new Set(rows.map(row => row.id)).size !== rows.length)
            issues.push('release_duplicate_ids:' + k);
        for (const row of rows)
            try {
                schema(k === 'rights' ? 'rights' : k.slice(0, -1), row);
            }
            catch (error) {
                issues.push('release_schema:' + k + ':' + String(error));
            }
    }
    for (const q of candidate.questions)
        if (q.choiceShuffleAllowed)
            issues.push('release_unfixed_choice_order:' + q.id);
    for (const t of candidate.templates) {
        const base = candidate.questions.find(q => q.id === t.baseQuestionRef.questionId);
        if (!base || await contentHash(base) !== t.originalContentSha256)
            issues.push('release_template_hash:' + t.id);
        else
            try {
                validateSourceFormat(base, t);
            }
            catch (error) {
                issues.push('release_source_format:' + t.id + ':' + String(error));
            }
    }
    if (candidate.rights.some(r => Object.values(r.uses).some(use => use !== 'allowed') || !['none_identified', 'cleared'].includes(r.thirdParty.status)))
        issues.push('release_unverified_rights');
    for (const asset of candidate.assets)
        if (asset.attribution.sourceRefs.some(ref => ref.locator.page === 74) && (asset.sha256 !== correctedQ12Crop.webp || asset.width !== 1432 || asset.height !== 1240))
            issues.push('release_unapproved_jis_page74_material:' + asset.id);
    const annual = candidate.sets.find(set => set.id === 'set-annual-2017-spring-pm'), policy = annual?.questionSelection;
    if (!annual || annual.questionRefs.length !== 13 || JSON.stringify(policy?.requiredQuestionRefs.map(ref => ref.questionId)) !== JSON.stringify([originalId(1), originalId(8)]) || JSON.stringify(policy?.optionalGroups.map(group => ({ choose: group.choose, ids: group.questionRefs.map(ref => ref.questionId) }))) !== JSON.stringify([{ choose: 4, ids: [2, 3, 4, 5, 6, 7].map(originalId) }, { choose: 1, ids: [9, 10, 11, 12, 13].map(originalId) }]))
        issues.push('release_selection_policy');
    for (const mix of [false, true])
        for (const mode of ['study', 'practice'] as const) {
            const e = candidate.exams.find(exam => exam.id === 'exam-2017-spring-pm-' + (mix ? 'mix-' : '') + mode);
            if (!e || e.questionCount !== (mode === 'study' ? 13 : 7) || e.timeLimitSeconds !== (mode === 'study' ? undefined : 9000) || e.choiceOrder !== 'fixed')
                issues.push('release_exam_config:' + mode + ':' + mix);
        }
    if (!receipt.assetsRoot || !path.isAbsolute(receipt.assetsRoot))
        issues.push('release_assets_root_missing');
    else
        for (const a of candidate.assets)
            try {
                const actual = path.resolve(receipt.assetsRoot, a.path);
                assert(actual.startsWith(path.resolve(receipt.assetsRoot) + path.sep), 'release_asset_path_escape:' + a.id);
                await checkFile({ path: actual, sha256: a.sha256, byteLength: a.byteLength });
            }
            catch (error) {
                issues.push('release_asset:' + String(error));
            }
    if (!receipt.codePins.length)
        issues.push('release_code_pins_missing');
    else if (!same2017SpringAfternoonCodePins(receipt.codePins, await required2017SpringAfternoonReleaseCodePins()))
        issues.push('release_code_changed_or_incomplete');
    for (const pin of receipt.codePins)
        try {
            // Code inventories include the empty GitHub Pages .nojekyll marker.
            // Source papers, assets and review evidence keep the nonempty gate.
            await checkFile(pin, { allowEmpty: true });
        }
        catch (error) {
            issues.push('release_code_changed:' + String(error));
        }
    for (const key of spring2017ReleaseChecks) {
        const check = receipt.checks[key];
        if (!check || check.status !== 'pass' || !check.evidence.length) {
            issues.push('release_check_missing:' + key);
            continue;
        }
        for (const pin of check.evidence)
            try {
                await checkFile(pin);
            }
            catch (error) {
                issues.push('release_evidence:' + key + ':' + String(error));
            }
    }
    if (issues.length)
        throw new AfternoonStageError(issues);
    return { scope: spring2017Afternoon.id, status: 'release_checks_pass', candidateSHA256: receipt.candidateSHA256, majors: 13, normalOriginals: 13, templates: 13, broaderPre2023Readiness: 'separate_unchanged_not_claimed_complete', pushPerformed: false };
}
/** All imports are from the fixed managed source path, never supplied code. */
export async function load2017SpringAfternoonMajor(number: number, metadataPath: string | undefined, assetsRoot: string, review?: MajorReview): Promise<MajorInput> {
    if (!spring2017Afternoon.numbers.includes(number))
        throw new AfternoonStageError(['unexpected_major:' + number]);
    const m = await import(pathToFileURL(path.resolve('scripts/import-legacy-2017-pm' + number + '.ts')).href);
    let result;
    if (number === 6)
        result = await m.pm6Records();
    else if (number === 7)
        result = await m.pm7Records();
    else {
        assert(metadataPath);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')), rendered = metadata.rendered ?? metadata, evidence = JSON.parse(fs.readFileSync('scripts/source-evidence/ipa-pre-2023.json', 'utf8')), collection = metadata.collection ?? evidence.collections.find((c: {
            id: string;
        }) => c.id === spring2017Afternoon.id);
        result = await m['legacy2017Pm' + number + 'Records']({ collection, rendered });
    }
    return { number, prepared: result.bundle ?? result.records, assetsRoot: path.resolve(assetsRoot), ...(review ? { review } : {}) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const [mode, manifestName, outName] = process.argv.slice(2);
    assert(['inventory', 'candidate', 'release-check'].includes(mode));
    assert(manifestName && outName);
    const root = path.resolve('output'), out = path.resolve(outName);
    assert(out.startsWith(root + path.sep) && !fs.existsSync(out), 'fresh_ignored_output_required');
    const manifest = JSON.parse(fs.readFileSync(manifestName, 'utf8'));
    fs.mkdirSync(out, { recursive: true });
    try {
        if (mode === 'release-check') {
            const candidate = JSON.parse(fs.readFileSync(manifest.candidatePath, 'utf8')), receipt = JSON.parse(fs.readFileSync(manifest.receiptPath, 'utf8')), result = await check2017SpringAfternoonRelease(candidate, receipt);
            fs.writeFileSync(path.join(out, 'release-gate.json'), JSON.stringify(result, null, 2) + '\n');
            console.log(result);
        }
        else {
            const inputs: MajorInput[] = [], loadIssues: string[] = [];
            for (const row of manifest.majors ?? [])
                try {
                    const review = row.reviewPath ? JSON.parse(fs.readFileSync(row.reviewPath, 'utf8')) : undefined;
                    inputs.push(await load2017SpringAfternoonMajor(row.number, row.metadataPath, row.assetsRoot, review));
                }
                catch (error) {
                    loadIssues.push('load_major:' + row.number + ':' + String(error));
                }
            const packet = manifest.officialPacketPath ? JSON.parse(fs.readFileSync(manifest.officialPacketPath, 'utf8')) : undefined, inventory = await inventory2017SpringAfternoon(inputs, packet);
            inventory.issues.push(...loadIssues);
            if (loadIssues.length)
                inventory.status = 'incomplete';
            fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
            fs.writeFileSync(path.join(out, 'prepared-records.json'), JSON.stringify(inputs.map(({ number, prepared }) => ({ number, prepared })), null, 2) + '\n');
            fs.writeFileSync(path.join(out, 'review-requests.json'), JSON.stringify(await spring2017AfternoonReviewRequests(inputs), null, 2) + '\n');
            if (mode === 'inventory') {
                console.log({ scope: inventory.scope, prepared: inventory.preparedMajors, issues: inventory.issues.length, status: inventory.status });
                if (inventory.issues.length)
                    process.exitCode = 1;
            }
            else {
                if (inventory.issues.length)
                    throw new AfternoonStageError(inventory.issues);
                assert(manifest.globalMixSetPath, 'global_set_mix_b_input_required');
                const result = await build2017SpringAfternoonCandidate(inputs, packet);
                const mix = JSON.parse(fs.readFileSync(manifest.globalMixSetPath, 'utf8')), patch = await spring2017AfternoonGlobalMixPatch(mix, result.candidate);
                fs.mkdirSync(path.join(out, 'assets'));
                for (const input of inputs)
                    for (const asset of input.prepared.assets) {
                        const bytes = await checkFile({ path: path.resolve(input.assetsRoot, asset.path), sha256: asset.sha256, byteLength: asset.byteLength }), target = path.resolve(out, asset.path);
                        assert(target.startsWith(path.resolve(out, 'assets') + path.sep));
                        if (fs.existsSync(target))
                            assert.equal(await sha256(fs.readFileSync(target)), asset.sha256, 'asset path collision');
                        else
                            fs.writeFileSync(target, bytes);
                    }
                for (const [k, v] of Object.entries(result))
                    fs.writeFileSync(path.join(out, k + '.json'), JSON.stringify(v, null, 2) + '\n');
                fs.writeFileSync(path.join(out, 'global-mix-b-patch.json'), JSON.stringify(patch, null, 2) + '\n');
                console.log({ scope: inventory.scope, originals: 13, templates: 13, candidateSHA256: result.candidateSHA256, status: result.status });
            }
        }
    }
    catch (error) {
        const issues = error instanceof AfternoonStageError ? error.issues : [String(error)];
        fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ scope: spring2017Afternoon.id, status: 'incomplete', issues, noPublicWrites: true }, null, 2) + '\n');
        console.error({ status: 'incomplete', issues });
        process.exitCode = 1;
    }
}
