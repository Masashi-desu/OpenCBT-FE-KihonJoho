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
const programNotationNotes: Record<string, string> = {
  "2023-b-1": " 正の平方根の整数部分・除算の余りを原問と同じ疑似言語で表し、注記とαの行を保持する。",
  "2023-b-3": " 基準値の添字は原問と同じ除算の商で表し、変数の宣言と代入を分ける。",
  "2023-b-5": " 原問の項を列記した分数、平方根の表記、変数宣言・初期化、aとbの組合せの9択を保持する。分子の走査添字と順序だけを変更する8入力。",
  "2024-b-5": " 原問に倣って関連度Lxyを添字付きの分数で示し、表とA・Bの計算例を同じ注文データから作る。式のNは全注文数。リフトの解答群は原問の計数候補3種類と配列の2通りの対応を保持する。",
  "2025-b-5": " 原問に倣って表の列・行の意味と網掛けの注記を表示し、dataの行・列ごとの和と総数を使う式を疑似言語に保持する。",
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
    : d)
  .map(d => programNotationNotes[d.source]
    ? { ...d, version: "3.7.0" as const, notes: d.notes + programNotationNotes[d.source] }
    : d);
if (
  new Set(effectivePublicDefinitions.map((d) => d.source)).size !==
  effectivePublicDefinitions.length
)
  throw Error("Duplicate source generator");
