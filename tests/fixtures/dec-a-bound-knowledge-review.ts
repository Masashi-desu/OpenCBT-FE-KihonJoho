// Reviewed independently of the production choices, using the original IPA
// question/answer papers and the technical references listed in verification.md.
// Each accepted statement maps to its meaning before the question is graded.
import assert from "node:assert/strict";
import type { GeneratedBody } from "../../src/core/generators/definition";

type BoundKnowledgeReview = {
  targets: readonly string[];
  question: (target: string) => string;
  roles: Readonly<Record<string, readonly RegExp[]>>;
};
export const decABoundKnowledgeReview: Record<number, BoundKnowledgeReview> = {
  10: {
    targets: ["外部割込み","外部割込み","外部割込み","内部割込み","内部割込み","内部割込み"],
    question: target => `${target}の原因となるものはどれか。`,
    roles: {
      外部割込み: [/^タイマーによる時間経過の通知$/, /^入出力装置からの処理完了の通知$/, /^外部装置からの処理要求の通知$/],
      内部割込み: [/^ゼロによる除算命令の実行$/, /^存在しない命令コードの実行$/, /^ページフォールトの発生$/],
    },
  },
  16: {
    targets: ["インタプリタ","推論エンジン","コンパイラ","ローダ"],
    question: target => `${target}の説明として、適切なものはどれか。`,
    roles: {
      インタプリタ: [/^原始プログラムを、解釈しながら実行するプログラムである。$/],
      推論エンジン: [/^知識ベースの事実に規則を適用し、結論を導くプログラムである。$/],
      コンパイラ: [/^原始プログラムを、目的プログラムに翻訳するプログラムである。$/, /^原始プログラムを実行前に翻訳し、独立した目的プログラムを出力する。$/],
      ローダ: [/^実行可能なプログラムを、主記憶装置にロードするプログラムである。$/, /^実行可能なプログラムを、主記憶上の実行に必要な位置に配置する。$/],
      推論と翻訳の混同: [/^原始プログラムを、推論しながら翻訳するプログラムである。$/],
    },
  },
  19: {
    targets: ["DRAM","フラッシュメモリ","SRAM","マスクROM"],
    question: target => `${target}の特徴はどれか。`,
    roles: {
      DRAM: [/^メモリセル構造が単純なので高集積化でき、ビット単価を安くできる。$/, /^1ビットをトランジスタとコンデンサで記憶し、高密度に集積しやすい。$/],
      フラッシュメモリ: [/^電気的に書換え可能な不揮発性メモリで、消去はブロック単位で行う。$/],
      SRAM: [/^記憶セルにフリップフロップを使い、通電中はリフレッシュなしで情報を保持する。$/],
      マスクROM: [/^記憶内容を製造工程で固定し、利用者は通常の操作で書き換えられない。$/],
      // These source distractors are classified only as false for the DRAM baseline.
      DRAMの基準誤答: [
        /^書込み及び消去を一括又はブロック単位で行う。$/,
        /^データを保持するためのリフレッシュ操作又はアクセス操作が不要である。$/,
        /^電源が遮断された状態でも、記憶した情報を保持できる。$/,
      ],
    },
  },
  35: {
    targets: ["動的解析","動的解析","動的解析","静的解析","静的解析","静的解析"],
    question: target => `マルウェアの${target}に該当するものはどれか。`,
    roles: {
      動的解析: [
        /^検体をサンドボックス上で実行し、動作や外部との通信を観測する。$/,
        /^検体を隔離環境で実行し、ファイルやレジストリに対する変更を観測する。$/,
        /^検体を制御した環境で動作させ、呼び出したAPIやプロセス生成を記録する。$/,
      ],
      静的解析: [
        /^検体のハッシュ値を既知の検体のハッシュ値と照合する。$/,
        /^検体を実行せず逆コンパイルし、コードを読む。$/,
        /^実行せずファイルヘッダと拡張子を比較する。$/,
      ],
    },
  },
};
export function decABoundKnowledgeOracle(n: number, body: GeneratedBody, values: number[]) {
  const review = decABoundKnowledgeReview[n];
  const target = review.targets[values[0]];
  assert.equal(values.length, 1);
  assert(target);
  assert.deepEqual(body.prompt, [{type:"paragraph", text:review.question(target)}]);
  const options = body.choices.map(blocks => {
    assert.equal(blocks.length, 1);
    const block = blocks[0];
    assert(block.type === "paragraph");
    return block.text;
  });
  assert.equal(new Set(options).size, 4);
  const roles = options.map(text => {
    const matches = Object.entries(review.roles).filter(([,patterns]) => patterns.some(p => p.test(text)));
    assert.equal(matches.length, 1, `Q${n}: ${text}`);
    return matches[0][0];
  });
  if (n === 16 && target !== "インタプリタ" || n === 19 && target !== "DRAM")
    assert.deepEqual([...roles].sort(), [...new Set(review.targets)].sort());
  const correct = roles.flatMap((role, i) => role === target ? [i] : []);
  assert.deepEqual(correct, [body.correctIndex]);
  assert(body.explanation.startsWith(`${target}に該当するのは「${options[correct[0]]}」。`));
}
