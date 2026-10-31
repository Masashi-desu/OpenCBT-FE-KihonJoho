// Effective public roots are shared by the existing synchronous registry and
// future explicit composition callers. Preserve construction order and wrappers.
import { knowledgeDefinitions } from "./knowledge";
import { subjectADefinitions } from "./subject-a";
import { subjectBDefinitions } from "./subject-b";
import { securityDefinitions } from "./security";
import { april2022Definitions } from "./sample-2022-april";
import { decemberProgramDefinitions } from "./sample-2022-dec-programs";
import { decemberScenarioDefinitions } from "./sample-2022-dec-scenarios";
import { decemberADefinitions } from "./sample-2022-dec-a";
import { withCorrections } from "./corrections";
import { subjectAFormatDefinitions } from "./subject-a-formats";
import {
  calculationSources,
  calculationNotes,
  checkCalculationInputs,
} from "./calculation-options";

const restoredDeclarations = new Set([
  "2023-b-5",
  "2024-b-5",
  "2025-b-4",
  "2025-b-5",
  "2026-b-1",
  "2026-b-5",
]);
const wordingRevisedSources = new Set([
  "2023-a-2",
  "2023-a-6",
  "2023-a-10",
  "2023-a-11",
  "2023-a-13",
  "2024-a-10",
  "2024-a-19",
  "2025-a-13",
  "2025-a-16",
  "2025-a-17",
  "2026-a-1",
  "2026-a-8",
  "2026-a-9",
  "2026-a-11",
  "2026-a-15",
  "2026-a-18",
  "2023-b-1",
  "2023-b-2",
  "2023-b-3",
  "2023-b-4",
  "2023-b-5",
  "2023-b-6",
  "2024-b-1",
  "2024-b-2",
  "2024-b-3",
  "2024-b-4",
  "2024-b-5",
  "2024-b-6",
  "2025-b-3",
  "2025-b-4",
  "2025-b-5",
  "2026-b-1",
  "2026-b-4",
  "2026-b-5",
]);

// These revisions remove answer cues or restore the source's example choices.
const knowledgeQualityNotes: Record<string, string> = {
  "2024-a-5": " 定義を前提として具体例を選ぶ原形式を維持し、四つの選択肢を独自のWebサービス利用事例にした。入出力の連結・画面への組込み・データの統合・部分更新を区別する。",
  "2024-a-10": " 攻撃名から有効な対策を選ぶ。正答の方針を先に示す目的の補足を出題本文から除いた。",
  "2025-a-1": " 用語から説明を選ぶ。事前学習・強化学習・検索拡張生成の定義や実施段階を前置きせず、ファインチューニングの事前学習済みモデルという原前提だけを保持する。",
  "2026-a-11": " 発生した問題から対策を選ぶ。問題の状況を維持し、テストやレビューなど解法を先に示す補足目的を除いた。",
  "2026-a-12": " グラフの使い方を選ぶ。表示量をそのまま読める独自の対象名を累積フロー図・ガントチャートへ置き換え、各グラフの軸・表示方法・用途を区別する。",
};

export const effectivePublicDefinitions = [
  ...knowledgeDefinitions,
  ...subjectADefinitions,
  ...subjectAFormatDefinitions,
  ...subjectBDefinitions,
  ...securityDefinitions,
  ...april2022Definitions,
  ...decemberProgramDefinitions,
  ...decemberScenarioDefinitions,
  ...decemberADefinitions,
]
  .map(withCorrections)
  .map((d) =>
    calculationSources.includes(d.source)
      ? {
          ...d,
          version: "3.3.0" as const,
          notes: d.notes + calculationNotes,
          build(values: number[]) {
            checkCalculationInputs(d.source, values);
            return d.build(values);
          },
        }
      : { ...d, version: "3.2.0" as const },
  )
  .map(d => wordingRevisedSources.has(d.source) ? { ...d, version: "3.4.0" as const } : d)
  .map(d => knowledgeQualityNotes[d.source]
    ? { ...d, version: "3.5.0" as const, notes: d.notes + knowledgeQualityNotes[d.source] }
    : d)
  .map(d => restoredDeclarations.has(d.source)
    ? {
        ...d,
        version: "3.6.0" as const,
        notes: d.notes + " 原問題で宣言している変数を、要素数や作業値の数値置換・宣言の省略で失わない。",
      }
    : d);
if (
  new Set(effectivePublicDefinitions.map((d) => d.source)).size !==
  effectivePublicDefinitions.length
)
  throw Error("Duplicate source generator");
