/** Individually reviewed public metadata. Never strip holds or rights by regexp. */
import assert from 'node:assert/strict';
import type { MajorRecords } from './stage-2017-spring-afternoon';
import { legacyAfternoonPublicNotes } from '../src/core/generators/legacy-afternoon-public-notes';
type LimitReview = {
    before: string;
    question: string;
    answer: string;
};
const limits: Record<number, LimitReview> = {
    1: {
        before: '未登録・excluded候補。同一PDFのglobal canonical document identity/Source統合は未解決。問8のSource bytesを変更せず、未使用JIS/CASL/API付録や他大問の素材判断へ拡張しない。',
        question: '問1の原資料p5〜8の本文・図表・全解答群に限る。共通資料、JIS/CASL/API付録、他の大問へこの素材判断を拡張しない。',
        answer: '公式解答例p1の問1の5解答欄に限る。共通資料、JIS/CASL/API付録、他の大問へこの素材判断を拡張しない。',
    },
    2: {
        before: '未登録excluded。global canonical document identity/Source統合未解決。共通記法・未使用付録・他大問へ素材判断を拡張しない。',
        question: '問2の原資料p9〜12の温度モニタ、本文、図表、注記と全解答群に限る。共通記法、未使用の付録、他の大問へ素材判断を拡張しない。',
        answer: '公式解答例p1の問2の5解答欄に限る。共通記法、未使用の付録、他の大問へ素材判断を拡張しない。',
    },
    3: {
        before: '未登録excluded。global canonical document identity未解決。共通疑似言語/他問/JIS/API/CASL付録へ素材判断を広げない。',
        question: '問3の原資料p13〜16の関係表、制約、DDL、本文、全注記と解答群に限る。共通疑似言語、他問、JIS/API/CASL付録へ素材判断を広げない。',
        answer: '公式解答例p1の問3の5解答欄に限る。共通疑似言語、他問、JIS/API/CASL付録へ素材判断を広げない。',
    },
    4: {
        before: 'excluded候補。共通記法/他の大問/規格原文/CASL/言語付録をこの判断へ含めない。',
        question: '問4の原資料p17〜20の無線LANの作問図、本文、全注記と解答群に限る。共通記法、他の大問、規格原文、CASL及び言語付録をこの判断へ含めない。',
        answer: '公式解答例p1の問4の4解答欄に限る。共通記法、他の大問、規格原文、CASL及び言語付録をこの判断へ含めない。',
    },
    6: {
        before: '問6の局所準備record。共有Schema/profile/registry/App/通常Run/本物の保存/全186と配布は未受入れ。第三者素材の不存在や包括的許諾を保証しない。',
        question: '問6の原資料p27〜30の要員計画の本文、3表、式、注記と解答群に限る。第三者素材の不存在や包括的許諾を保証しない。',
        answer: '公式解答例p1の問6の6解答欄に限る。第三者素材の不存在や包括的許諾を保証しない。',
    },
    8: {
        before: '未登録・配布excludedの候補。共通記法の判断をCASL/JIS/API付録や他大問へ適用しない。',
        question: '問8の原資料p35〜40及びIPA共通疑似言語記法p3〜4に限る。共通記法の判断をCASL/JIS/API付録や他大問へ適用しない。',
        answer: '公式解答例p1の問8の7解答欄に限る。共通記法の判断をCASL/JIS/API付録や他大問へ適用しない。',
    },
};
export type PublicMetadataEdit = {
    path: string;
    before: string;
    after: string;
    reason: string;
};
export function apply2017SpringAfternoonPublicMetadata(number: number, records: MajorRecords): PublicMetadataEdit[] {
    const edits: PublicMetadataEdit[] = [], note = legacyAfternoonPublicNotes['2017h29h-fe-pm-' + number];
    assert(note, 'public modification note is missing');
    records.questions.forEach((question, qi) => {
        if (question.origin.kind === 'official_adaptation') {
            let count = 0;
            question.origin.changes.forEach((change, ci) => {
                if (change.kind !== 'wording' && change.kind !== 'numbers')
                    return;
                for (const [key, text] of [['summary', '原形式を保持して条件を変更'], ['details', note]] as const) {
                    if (change[key] !== text)
                        edits.push({ path: `/questions/${qi}/origin/changes/${ci}/${key}`, before: change[key], after: text, reason: 'reviewed_public_modification_description' });
                    change[key] = text;
                }
                count++;
            });
            assert(count > 0, 'adaptation must record its modification');
        }
        const text = `2017年度春期・旧午後問${number}。原資料と公式解答の全${question.answerParts!.length}解答欄を照合し、条件別の内容検証を記録している。本文・図表の利用条件は素材ごとの権利記録で確認し、独自解説と区別する。公式の配点や合否評価を表すものではない。`;
        if (question.review.notes !== text)
            edits.push({ path: `/questions/${qi}/review/notes`, before: question.review.notes, after: text, reason: 'public_review_scope_without_preparation_workflow_claims' });
        question.review.notes = text;
    });
    records.sources.forEach((source, si) => {
        const plan = limits[number];
        if (plan) {
            const id = number === 8 ? 'source-ipa-2017h29h-fe-pm-' : `source-ipa-2017h29h-fe-pm-${number}-`;
            if (source.id === id + 'qs' || source.id === id + 'ans') {
                const text = source.id.endsWith('-qs') ? plan.question : plan.answer;
                assert(source.limits === plan.before || source.limits === text, 'source_limits_review_required:' + source.id);
                if (source.limits !== text)
                    edits.push({ path: `/sources/${si}/limits`, before: source.limits as string, after: text, reason: 'individually_reviewed_source_scope_preserving_material_limits' });
                source.limits = text;
            }
        }
        // Detection only: do not silently remove a new status or legal restriction.
        assert(!/未登録|excluded|global canonical|共有Schema|本物の保存|未受入れ|pending/i.test(String(source.limits)), 'unreviewed_public_source_workflow_metadata:' + source.id);
    });
    return edits;
}
