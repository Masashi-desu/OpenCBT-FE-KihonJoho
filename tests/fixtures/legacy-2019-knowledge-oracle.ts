/** Hand-reviewed proposition registry, independent of production definitions.
 * All exposed statements are recognized; an unreviewed wording fails closed.
 * Correctness is determined from the question's predicate and fact class, not
 * from build().correctIndex or a generated expected-answer snapshot.
 */
import assert from "node:assert/strict";
import type { GeneratedBody } from "../../src/core/generators/definition";
import {legacy2019KnowledgeExplanationReview} from "./legacy-2019-knowledge-explanation-review";

const registry = new Map<string, string>();
function facts(concept: string, texts: string[]) {
  for (const text of texts) { assert(!registry.has(text), `duplicate fact: ${text}`); registry.set(text, concept); }
}
facts("parallel", [
  "2系統のシステムで並列処理をすることによって性能を上げる方式である。",
  "一つの処理を分割し、2系統で分担して結果をまとめる方式である。",
  "2系統で異なる処理を同時に実行して、処理能力を高める方式である。",
]);
facts("load-sharing", [
  "2系統のシステムの負荷が均等になるように、処理を分散する方式である。",
  "到着した処理要求を2系統のシステムへ交互に割り当て、並行して処理する方式である。",
  "到着した処理要求を、その時点で負荷が小さい方の系統へ割り当てる方式である。",
]);
facts("standby", [
  "現用系と待機系の2系統のシステムで構成され、現用系に障害が生じたときに、待機系が処理を受け継ぐ方式である。",
  "現用系だけを運転し、現用系が故障したときに停止中の待機系を起動して処理を引き継ぐ方式である。",
  "待機系に実行環境を準備しておき、現用系が故障したときに切り替えて処理を引き継ぐ方式である。",
]);
facts("dual", ["一つの処理を2系統のシステムで独立に行い、結果を照合する方式である。"]);
facts("slow-sql", ["遅い処理の特定"]);
facts("external-load", ["外的要因の変化の確認"]);
facts("buffer-hit", ["キャッシュメモリのヒット率の調査"]);
facts("fragmentation", ["データの格納状況の確認"]);
facts("schedule", ["各タスクの実行順序を決定すること"]);
facts("dispatch", ["実行可能なタスクに対してプロセッサの使用権を割り当てること"]);
facts("context", ["タスクの実行に必要な情報であるコンテキストのこと"]);
facts("multitask", ["一つのプロセッサで複数のタスクを同時に実行しているかのように見せかける機能のこと"]);
facts("driver", ["PCに接続された周辺機器を制御するソフトウェア"]);
facts("installer", ["アプリケーションプログラムをPCに導入するソフトウェア"]);
facts("operation-macro", ["キーボードなどの操作手順を登録して、その操作を自動化するソフトウェア"]);
facts("malicious-software", ["他のPCに入り込んで不利益をもたらすソフトウェア"]);
facts("linguistic-document-search", [
  "キーワード検索のヒット率を高めることを目的に作成した、一種の同義語・類義語リストを用いることによって、検索漏れを防ぐ技術である。",
  "検索語を形態素に分解し、活用形を基本形にそろえて索引と照合する技術である。",
  "文書中の単語から、その単語を含む文書への対応表を作成して文書を絞り込む技術である。",
]);
facts("data-mining", [
  "蓄積されている膨大なデータを検索し、経営やマーケティングにとって必要な傾向、相関関係、パターンなどを導き出すための技術や手法である。",
  "購入履歴での同時出現頻度から、併せて購入される商品の組合せを抽出する技術である。",
  "過去の顧客データから属性と解約の関係を学習し、新たな顧客の解約傾向を推定する技術である。",
]);
facts("intent-search", [
  "データとそれに対する処理を組み合わせたオブジェクトに、認識や判断の機能を加え、利用者の検索要求に対して、その意図を判断する高度な検索技術である。",
  "利用者の過去の検索操作や閲覧履歴から嗜好を学習したエージェントが、新たな検索要求に対して条件を自律的に調整し、候補の文書を収集して関連性を判断する技術である。",
  "検索要求中の語句について、表記が異なっていても文脈や概念間の関係から意味を解析し、文書の内容との関連度によって利用者の意図に近い文書を選ぶ技術である。",
]);
facts("hash-address", ["データを特定のアルゴリズムによって変換した値を格納アドレスとして用いる、高速でスケーラビリティの高いデータ検索技術である。"]);
facts("osd-false-discrimination", [
  "ある特定の業界向けに作成されたオープンソースソフトウェアは、ソースコードを公開する範囲をその業界に限定することができる。",
  "教育向けに作成されたオープンソースソフトウェアでは、ライセンスで商用利用を禁止することができる。",
  "個人向けに作成されたオープンソースソフトウェアでは、ライセンスで企業による利用を禁止することができる。",
]);
facts("osd-false-license-scope", [
  "オープンソースソフトウェアを改変して再配布する場合、元のソフトウェアと同じ配布条件となるように、同じライセンスを適用して配布する必要がある。",
  "オープンソースソフトウェアは全てコピーレフトなので、改変版の再配布には必ず元と同じライセンスを適用する必要がある。",
  "オープンソースソフトウェアと同じ媒体で配布する、独立した別のソフトウェアにも、必ず同じライセンスを適用する必要がある。",
]);
facts("osd-false-redistribution-fee", [
  "オープンソースソフトウェアを第三者が製品として再配布する場合、オープンソースソフトウェアの開発者は第三者に対してライセンス費を請求することができる。",
  "オープンソースソフトウェアのライセンスでは、第三者が販売する複製物1個ごとに、開発者への使用料の支払を必須条件にすることができる。",
  "オープンソースソフトウェアを再配布する第三者には、配布先が何人であっても、事前に開発者から有償の再配布許可を得るよう要求できる。",
]);
facts("osd-private-modification", ["社内での利用などのようにオープンソースソフトウェアを改変しても再配布しない場合、改変部分のソースコードを公開しなくてもよい。"]);
facts("independent-selection", ["幾つかの項目について、それぞれの項目を選択するかどうかを指定する。"]);
facts("editable-selection", ["幾つかの選択項目から一つを選ぶときに、選択項目にないものはテキストボックスに入力する。"]);
facts("exclusive-selection", ["互いに排他的な幾つかの選択項目から一つを選ぶ。"]);
facts("dropdown-selection", ["特定の項目を選択することによって表示される一覧形式の項目から一つを選ぶ。"]);
facts("false-domain-restriction", [
  "関係内の属性の定義域は重複してはならない。",
  "一つの関係に含まれる全ての属性は、同じ定義域をもたなければならない。",
  "主キーに含まれる属性の定義域と、他の属性の定義域は互いに重なってはならない。",
]);
facts("false-duplicate-name", [
  "関係内の二つ以上の属性に、同じ名前を付けることができる。",
  "主キーを構成しない属性同士であれば、同じ関係内で同じ名前を付けることができる。",
  "定義域が異なれば、同じ関係内の二つの属性に同じ名前を付けることができる。",
]);
facts("false-unnamed-attribute", [
  "名前をもたない属性を定義することができる。",
  "主キーを構成しない属性には、名前を付けなくてもよい。",
  "定義域を指定すれば、名前をもたない属性を一つ定義することができる。",
]);
facts("attribute-order-invariant", ["関係内の属性の並び順に意味はなく、順番を入れ替えても同じ関係である。"]);
facts("graph", ["“ノード”、“リレーションシップ”、“プロパティ”の3要素によってノード間の関係性を表現する。"]);
facts("document", ["1件分のデータを“ドキュメント”と呼び、個々のドキュメントのデータ構造は自由であって、データを追加する都度変えることができる。"]);
facts("relation", ["集合論に基づいて、行と列から成る2次元の表で表現する。"]);
facts("key-value", ["任意の保存したいデータと、そのデータを一意に識別できる値を組みとして保存する。"]);

const predicates: Record<number, { prompts: string[]; concepts: string[]; roles: string[] }> = {
  13: { prompts: ["冗長構成におけるデュアルシステムの説明として、適切なものはどれか。"], concepts: ["dual"], roles: ["parallel", "load-sharing", "standby", "dual"] },
  15: { prompts: [..."abcd"].map(s => `アプリケーションの変更をしていないにもかかわらず、サーバのデータベース応答性能が悪化してきたので、表のような想定原因と、特定するための調査項目を検討した。調査項目${s}として、適切なものはどれか。`), concepts: ["external-load", "slow-sql", "fragmentation", "buffer-hit"], roles: ["slow-sql", "external-load", "buffer-hit", "fragmentation"] },
  16: { prompts: ["タスクのディスパッチの説明として、適切なものはどれか。", "タスクのスケジューリングの説明として、適切なものはどれか。", "マルチタスクの説明として、適切なものはどれか。"], concepts: ["dispatch", "schedule", "multitask"], roles: ["schedule", "dispatch", "context", "multitask"] },
  17: { prompts: ["デバイスドライバの説明として、適切なものはどれか。", "インストーラの説明として、適切なものはどれか。", "操作マクロの説明として、適切なものはどれか。"], concepts: ["driver", "installer", "operation-macro"], roles: ["driver", "installer", "operation-macro", "malicious-software"] },
  18: { prompts: ["データ検索時に使用される、理想的なハッシュ法の説明として、適切なものはどれか。"], concepts: ["hash-address"], roles: ["linguistic-document-search", "data-mining", "intent-search", "hash-address"] },
  20: { prompts: ["OSIによるオープンソースソフトウェアの定義に従うときのオープンソースソフトウェアに対する取扱いとして、適切なものはどれか。"], concepts: ["osd-private-modification"], roles: ["osd-false-discrimination", "osd-false-license-scope", "osd-false-redistribution-fee", "osd-private-modification"] },
  24: { prompts: ["ラジオボタン", "チェックボックス", "編集可能なコンボボックス", "ドロップダウンリスト"].map(s => `GUIの部品の一つである${s}の用途として、適切なものはどれか。`), concepts: ["exclusive-selection", "independent-selection", "editable-selection", "dropdown-selection"], roles: ["independent-selection", "editable-selection", "exclusive-selection", "dropdown-selection"] },
  26: { prompts: ["関係モデルの属性に関する説明のうち、適切なものはどれか。"], concepts: ["attribute-order-invariant"], roles: ["false-domain-restriction", "attribute-order-invariant", "false-duplicate-name", "false-unnamed-attribute"] },
  30: { prompts: ["キーバリューストア", "グラフデータベース", "ドキュメント指向データベース", "関係データベース"].map(s => `ビッグデータの処理で使われる${s}の説明として、適切なものはどれか。`), concepts: ["key-value", "graph", "document", "relation"], roles: ["graph", "document", "relation", "key-value"] },
};

export const memoryFacts = [
  { name: "DRAM", flipFlop: false, refresh: true, synchronous: false, nonvolatile: false, electricalErase: false },
  { name: "EEPROM", flipFlop: false, refresh: false, synchronous: false, nonvolatile: true, electricalErase: true },
  { name: "SDRAM", flipFlop: false, refresh: true, synchronous: true, nonvolatile: false, electricalErase: false },
  { name: "SRAM", flipFlop: true, refresh: false, synchronous: false, nonvolatile: false, electricalErase: false },
] as const;
const memoryQuestions = [
  "メモリセルにフリップフロップ回路を利用したものはどれか。",
  "メモリセルにコンデンサを利用して電荷を蓄え、リフレッシュを必要とし、外部クロックに同期しない従来型のものはどれか。",
  "メモリセルにコンデンサを利用してリフレッシュを必要とし、外部クロックに同期して動作するものはどれか。",
  "電源を切っても記憶内容を保持し、電気的に内容を消去して書き換えることができるものはどれか。",
];
const memoryPredicates = [
  (m: typeof memoryFacts[number]) => m.flipFlop,
  (m: typeof memoryFacts[number]) => m.refresh && !m.synchronous,
  (m: typeof memoryFacts[number]) => m.refresh && m.synchronous,
  (m: typeof memoryFacts[number]) => m.nonvolatile && m.electricalErase,
];

export function assertLegacy2019Knowledge(source: string, body: GeneratedBody, values: number[]) {
  assert.match(source, /^2019h31h-fe-am-/); const n = Number(source.split("-").at(-1));
  assert.equal(body.answerParts, undefined); assert.equal(body.partAnswers, undefined); assert.equal(body.choices.length, 4);
  const texts = body.choices.map(blocks => { assert.equal(blocks.length, 1); const b = blocks[0]; assert.equal(b.type, "paragraph"); return b.type === "paragraph" ? b.text : ""; });
  assert.equal(new Set(texts).size, 4); const first = body.prompt[0]; assert.equal(first.type, "paragraph");
  const prompt = first.type === "paragraph" ? first.text : ""; let matches: boolean[];
  if (n === 21) {
    assert.equal(prompt, memoryQuestions[values[0]]); assert.deepEqual(texts, ["DRAM", "EEPROM", "SDRAM", "SRAM"]);
    matches = texts.map(t => { const fact = memoryFacts.find(m => m.name === t); assert(fact); return memoryPredicates[values[0]](fact); });
  } else {
    const predicate = predicates[n]; assert(predicate, `missing independent predicate: ${source}`);
    const i = predicate.prompts.length === 1 ? 0 : values[0]; assert.equal(prompt, predicate.prompts[i]);
    const concepts = texts.map(t => { const c = registry.get(t); assert(c, `unreviewed proposition: ${t}`); return c; });
    assert.deepEqual(concepts, predicate.roles); matches = concepts.map(c => c === predicate.concepts[i]);
  }
  assert.equal(matches.filter(Boolean).length, 1, "independent facts must establish one answer");
  assert.equal(body.correctIndex, matches.findIndex(Boolean), `independent answer mismatch: ${source}/${values}`);
  const explanation = legacy2019KnowledgeExplanationReview[n]; assert(explanation);
  for(const clause of explanation.common) assert(body.explanation.includes(clause),`explanation claim missing or changed: ${source}: ${clause}`);
  if(explanation.reasons){assert(body.explanation.startsWith(explanation.reasons[values[0]]),`explanation condition mismatch: ${source}/${values}`);for(let i=0;i<explanation.reasons.length;i++)if(i!==values[0])assert(!body.explanation.includes(explanation.reasons[i]),`explanation contains another condition: ${source}/${values}`);}
  if (n === 15) {
    assert.equal(body.prompt.length, 2); const b = body.prompt[1]; assert.equal(b.type, "diagram");
    assert(b.type === "diagram" && b.scene.kind === "source_figure"); assert.equal(b.scene.profile, "legacy-2019-database-diagnosis"); assert.deepEqual(b.scene.values, values);
  } else assert.equal(body.prompt.length, 1);
}

/** In this manually authored registry the first statement for each role is the
 * original source statement. This is independent source-format evidence, not
 * a runtime snapshot copied back from a generator. */
export function legacy2019KnowledgeOriginalChoiceTexts(number: number): string[] {
  if (number === 21) return ["DRAM", "EEPROM", "SDRAM", "SRAM"];
  const rule = predicates[number]; assert(rule);
  return rule.roles.map(role => { const original = [...registry].find(([, concept]) => concept === role); assert(original); return original[0]; });
}

/** Concrete independent counterexamples to the false relation propositions. */
export function checkNamedRelationCounterexamples() {
  const attributes = ["社員番号", "上司番号", "氏名"], domains: Set<string | number>[] = [new Set([1, 2]), new Set([1, 2]), new Set(["甲", "乙"])];
  assert([...domains[0]].some(v => domains[1].has(v))); // overlap allowed, even PK vs non-key
  assert.notDeepEqual([...domains[0]], [...domains[2]]); // same domain is not required
  const rows: Record<string, string | number>[] = [{ 社員番号: 1, 上司番号: 2, 氏名: "甲" }, { 社員番号: 2, 上司番号: 2, 氏名: "乙" }];
  const perms = (a: string[]): string[][] => a.length ? a.flatMap((v, i) => perms(a.filter((_, j) => i !== j)).map(p => [v, ...p])) : [[]];
  const normalize = (order: string[]) => rows.map(r => JSON.stringify(Object.fromEntries(order.map(k => [k, r[k]]).sort(([a], [b]) => String(a).localeCompare(String(b)))))).sort();
  for (const p of perms(attributes)) assert.deepEqual(normalize(p), normalize(attributes));
  const validNames = (names: string[]) => names.every(n => n.length > 0) && new Set(names).size === names.length;
  assert(validNames(attributes)); assert(!validNames(["社員番号", "氏名", "氏名"])); assert(!validNames(["社員番号", "", "上司番号"]));
  return { permutations: 6, overlappingDomains: true, distinctDomains: true, duplicateRejected: true, unnamedRejected: true };
}
