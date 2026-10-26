/** Numeric conditions only. The 16-bit representation and the source's marking rules stay fixed. */
export function legacy2017Pm9Model(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 7) throw Error("PARAMETER_CONSTRAINT");
  const upper = [1, 2, 3, 1, 2, 3, 1, 2][value];
  const lower = [3, 5, 6, 4, 6, 7, 5, 7][value];
  const high = 1 << (15 - upper), low = 1 << (15 - lower), work = high | low;
  // QS45 Figure3's fixed geography: Gifu/Shiga/Nara are the inland prefectures.
  // These are the very questions whose answers Figure4 grades; changing their
  // correct bits independently would contradict that source premise.
  const correct = [0x4000, 0x1000, 0x0800];
  const submitted = [
    [0x0800,0x0800,0x5000], [0x1000,0x1000,0x4800],
    [0x4000,0x4000,0x1800], [0x1000,0x1000,0x6000],
    [0x0800,0x0800,0x4000], [0x1000,0x1000,0x0800],
    [0x4000,0x4000,0x1000], [0x1000,0x1000,0x4000],
  ][value];
  let sumC = 0, sumE = 0;
  for (let i = 0; i < 3; i++) {
    sumC |= correct[i];
    if (popcount(submitted[i]) === 1) sumE |= submitted[i];
  }
  const score = popcount(sumC & sumE);
  const f = [[0, 0, score], [0, 0, 3], [0, score, 0], [0, score, 2], [score, 0, 0], [score, 0, 2]];
  const g = [0, submitted[0], submitted[2], submitted[0] | submitted[2]];
  return {work, d: [low, high, work - 1, low | (high << 1)], correct, submitted, sumC, sumE, score, f, g};
}
function popcount(n: number) { let c = 0; for (let x = n; x !== 0; x &= x - 1) c++; return c; }
export function legacy2017Pm9Bits(n: number) {
  const s = n.toString(2).padStart(16, "0");
  const byte=(part:string)=>part==='00000000'?'0…0':part==='11111111'?'1…1':part.slice(0,4)+' '+part.slice(4);
  return byte(s.slice(0,8))+' '+byte(s.slice(8));
}
export const legacy2017Pm9Abc = ["2", "3", "ansC[i]", "ansC[i] & ansE[i]", "ansC[i] | ansE[i]", "ansE[i]", "type[i]", "type[i] + 1"];
export const legacy2017Pm9E = ["演算子&&と&とは実行する演算の内容が同じなので、正しい結果を返す", "演算子&&はビットごとの論理積を求めることはしないので、誤った結果を返す", "変数workには実行前の値が保持されたまま変わらないので、無限ループになる"];
export const legacy2017Pm9Profiles = ["legacy-2017-pm9-mark-sheet", "legacy-2017-pm9-bit-layout", "legacy-2017-pm9-unordered-example", "legacy-2017-pm9-marking-trace", "legacy-2017-pm9-result-options", "legacy-2017-pm9-abc-bank", "legacy-2017-pm9-d-bank", "legacy-2017-pm9-e-bank", "legacy-2017-pm9-g-bank"] as const;
export function legacy2017Pm9Figure(profile: string, values: number[]) {
  if (values.length !== 1 || !legacy2017Pm9Profiles.includes(profile as typeof legacy2017Pm9Profiles[number])) throw Error("PARAMETER_CONSTRAINT");
  const m = legacy2017Pm9Model(values[0]);
  const i = legacy2017Pm9Profiles.indexOf(profile as typeof legacy2017Pm9Profiles[number]);
  const captions = ["図1 問題と受験者の解答の例", "図2 正答及び受験者の解答の格納形式と格納例", "図3 順不同形式の問題、正答及び受験者の解答の例", "図4 関数markingに渡された配列の内容及び採点結果", "fに関する解答群", "a〜cに関する解答群", "dに関する解答群", "eに関する解答群", "gに関する解答群"];
  const bank = [legacy2017Pm9Abc, m.d.map(legacy2017Pm9Bits), legacy2017Pm9E, m.g.map(legacy2017Pm9Bits)][i - 5];
  const alts = [
    "問11の選択肢a・b・cのうちcにマーク。問12の選択肢a・b・c・d・eのうちbとdにマーク。問題の全文と選択肢は図内に表示。",
    "正答と受験者の解答を左右の2図で示す。各図の問12の5マークから対応する格納bitへ点線を結ぶ。unsigned int型の16bitを左の最上位からa、b、c、d、e、残りの順に対応させる。ansC[11]は正答bとe、ansE[11]は受験者の解答bとd。",
    "問21〜23は、次の府県のうち、海に面していない府県を三つ選ぶ問題。共通解答群は大阪・岐阜・京都・滋賀・奈良・兵庫・三重。正答は順にb・d・e、受験者の解答はe・b・dにマーク。",
    "3行の配列添字は20、21、22。typeは11、12、13。ansCは" + m.correct.map(legacy2017Pm9Bits).join("、") + "。ansEは" + m.submitted.map(legacy2017Pm9Bits).join("、") + "。mark[20]〜mark[22]の3値をまとめた空欄fを右に置く。",
    "ア〜カの六つの選択肢は、それぞれ縦3セル。上からmark[20]、mark[21]、mark[22]の順。" + m.f.map((row, i) => "アイウエオカ"[i] + "：" + row.join("、")).join("。"),
  ];
  return {caption: captions[i], alt: i < 5 ? alts[i] : captions[i] + "。" + bank.map((s, j) => "アイウエオカキク"[j] + " " + s).join("。"), model: m, bank};
}
