import type { Attribution, Question, Run, Selection } from "../../src/core/types";
import { refOf } from "../../src/core/types";
import { fixture } from "../fixtures";
import { prepareRun } from "../../src/core/session";
import { contentHash } from "../../src/core/hash";

// Synthetic persistence/grading fixture. No IPA question body is reused and
// this is never added to public/data or counted as an imported exam question.
const own: Attribution = { origin: "original", sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: ["codex"] };
export function compoundQuestion(): Question {
  const ids = ["choice-one", "choice-two", "choice-three"];
  return {
    schemaVersion: "3.0.0", id: "question-test-compound", revision: 1, lifecycle: "active", subject: "B",
    learning: { area: "algorithm", tags: [], topics: ["検証用"], keywords: ["複数解答"] },
    origin: { kind: "original", sourceRefs: [], derivedFrom: [], changes: [], isModified: false, modificationBasis: "none",
      independentCreationNotes: "採点・保存・表示の自動検証用に作成した架空の解答欄。学習コンテンツとして配布しない。" },
    contributors: [{ actorId: "codex", role: "author" }], contexts: [], contextRefs: [],
    prompt: { attribution: own, blocks: [{ type: "paragraph", text: "検証用：aは2、bとcは1と3を順不同で選ぶ。fは正解なしの扱いを検証する。" }] },
    choices: ids.map((id, i) => ({ id, content: { attribution: own, blocks: [{ type: "paragraph", text: String(i + 1) }] } })),
    answerParts: ["part-a", "part-b", "part-c", "part-f"].map((id, i) => ({ id, label: ["設問1 a", "設問2 b", "設問2 c", "設問3 f"][i], choiceIds: [...ids] })),
    correctAnswer: { attribution: own, parts: [
      { kind: "choice", partId: "part-a", choiceId: "choice-two" },
      { kind: "unordered", partIds: ["part-b", "part-c"], choiceIds: ["choice-one", "choice-three"] },
      { kind: "no_correct_answer", partId: "part-f", reason: "採点処理の検証用に設けた正解なしの欄" },
    ] },
    explanation: { attribution: own, blocks: [{ type: "paragraph", text: "架空の検証条件に従い、aと順不同の二欄を評価する。fは採点の分母に含めない。" }] },
    assetRefs: [], choiceShuffleAllowed: false, distribution: "included",
    review: { checkedOn: "2026-10-19", reviewerIds: ["codex"],
      checks: { publication: "pass", terms: "pass", thirdParty: "pass", transcription: "pass", answer: "pass", explanation: "pass" },
      notes: "自動テスト内だけで作成する架空データ。実在する公式問題の査読又は配布確認ではない。" },
  };
}
export async function compoundRun(practice = false, at = 100000): Promise<Run> {
  const selection: Selection = { subject: "B", kind: "annual", year: 2026, mode: practice ? "practice" : "study", size: "public", bindingMode: "original_data" };
  const run = await prepareRun(fixture(), selection, {}, at), q = compoundQuestion();
  run.bundle.questions.push(q);
  run.set.questionRefs = [refOf(q)];
  run.set.generationBindings = [];
  run.exam.questionCount = 1;
  run.issued = [q]; run.instances = [];
  run.session.currentIndex = 0;
  run.session.entries = [{ questionRef: refOf(q), issuedContent: {
    bindingPerformed: false, isModified: false, originKind: "original", contentSha256: await contentHash(q),
  }, choiceOrder: q.choices.map(c => c.id), reviewFlag: false, revealed: false }];
  return run;
}
