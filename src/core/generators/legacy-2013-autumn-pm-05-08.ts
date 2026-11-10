import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, table, variableNotes } from './definition';
import { autumn2015PmAnswers, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { autumn2013PmPageAssetId, autumn2013PmReference } from './legacy-2013-autumn-pm-materials';
import { autumn2013Pm0508Banks, autumn2013Pm0508Pages, autumn2013Pm0508PageRanges } from './legacy-2013-autumn-pm-05-08-source';
import { autumn2013Pm0508Drawings, autumn2013Pm0508Figure, type Autumn2013Pm0508Drawing } from './legacy-2013-autumn-pm-05-08-figures';
import {
  autumn2013Pm5Tests, shortCircuitSkips, autumn2013Pm6Work, autumn2013Pm6BalancedPlan,
  autumn2013Pm7Stocks, autumn2013Pm7Total, autumn2013Pm8Inputs, autumn2013Pm8Compress,
} from './legacy-2013-autumn-pm-05-08-model';

const notation = '共通に使用される擬似言語の記述形式';
const notationPages = [3, 4];
const marks = 'アイウエオカキクケコ';

export const autumn2013Pm0508OfficialKeys = {
  5: 'ウキアエカオイオ', 6: 'イアアウキア', 7: 'エエウイイア', 8: 'アエイエエカ',
} as const;

type Major = keyof typeof autumn2013Pm0508OfficialKeys;
const bankOrder = {
  5: ['5ab', '5cdef', '5gh'],
  6: ['6a', '6b', '6c', '6d', '6e', '6f'],
  7: ['7a', '7b', '7c', '7d', '7e', '7f'],
  8: ['8a', '8b', '8c', '8d', '8e', '8f'],
} as const;
const banksForSlots = {
  5: [0, 0, 1, 1, 1, 1, 2, 2],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5],
  8: [0, 1, 2, 3, 4, 5],
} as const;

function bank(id: string, variant: number): readonly string[] {
  if (id === '6c' && variant) {
    const { remaining, remainingHours, commonRate, uniqueRate } = autumn2013Pm6Work(variant);
    const swapped = commonRate === uniqueRate ? 10 * 8 * 5 : remaining * commonRate;
    return [remaining * 8, remainingHours, remaining * 10, swapped].sort((a, b) => a - b).map(String);
  }
  if (id === '7e' && variant) {
    const { k, l } = autumn2013Pm7Stocks[variant];
    const kStock = autumn2013Pm7Total(k), lStock = autumn2013Pm7Total(l);
    return [Math.round(kStock.original / 2), kStock.after, lStock.after, lStock.original].map(String);
  }
  return autumn2013Pm0508Banks[id];
}

function answers(major: Major, variant: number, keys: readonly number[]) {
  const choices = bankOrder[major].map(id => bank(id, variant).map((text, index): Block[] =>
    [id === '6e' ? autumn2013Pm0508Figure('6-schedule-option', index)
      : /^8[a-e]$/.test(id) ? code(text) : p(text)]));
  const parts = keys.map((key, index) => {
    const name = 'abcdefgh'[index];
    const bankIndex = banksForSlots[major][index];
    if (!choices[bankIndex][key]) throw Error('PARAMETER_CONSTRAINT');
    return autumn2015PmSingle(name, name, bankIndex, key);
  });
  return autumn2015PmAnswers(choices, parts);
}

const argumentColumns = ['引数名', 'データ型', '入力／出力', '意味'];
const conversionColumns = ['引数／返却値', 'データ型', '意味'];
function panel(id: string, variant: number): Block {
  if (id === '6-actual') {
    const { actualCounts, hours } = autumn2013Pm6Work(variant);
    return table('表2 内部設計工程の開始から2週間が経過した時点での実績値', ['実績', '第1週', '第2週'],
      [['実績本数', ...actualCounts.map(String)], ['実績工数', ...hours.map(String)]]);
  }
  if (id === '6-balanced') return table('表4 テストを並行して実施する作業計画', ['週', '第3週', '第4週', '第5週', '第6週'],
    [['計画本数', ...autumn2013Pm6BalancedPlan.map(String)]]);
  if (id === '8-compress-arguments') return table('Compress の引数の仕様', argumentColumns, [
    ['Plaindata[]', '文字型', '入力', '圧縮前の文字列が格納されている1次元配列'],
    ['Plength', '整数型', '入力', '圧縮前の文字列の長さ（1以上）'],
    ['Compresseddata[]', '文字型', '出力', '圧縮後の文字列が格納される1次元配列'],
    ['Clength', '整数型', '出力', '圧縮後の文字列の長さ'],
  ]);
  if (id === '8-decompress-arguments') return table('Decompress の引数の仕様', argumentColumns, [
    ['Compresseddata[]', '文字型', '入力', '復元前の文字列が格納されている1次元配列'],
    ['Clength', '整数型', '入力', '復元前の文字列の長さ（1以上）'],
    ['Plaindata[]', '文字型', '出力', '復元後の文字列が格納される1次元配列'],
    ['Plength', '整数型', '出力', '復元後の文字列の長さ'],
  ]);
  if (id === '8-int-arguments') return table('IntToAlphabet の引数と返却値の仕様', conversionColumns,
    [['引数', '整数型', '整数1～26の値'], ['返却値', '文字型', '引数に対応した英字']]);
  if (id === '8-letter-arguments') return table('AlphabetToInt の引数と返却値の仕様', conversionColumns,
    [['引数', '文字型', '英字A～Zの文字'], ['返却値', '整数型', '引数に対応した整数の値']]);
  if (!Object.hasOwn(autumn2013Pm0508Drawings, id)) throw Error('SOURCE_FORMAT');
  return autumn2013Pm0508Figure(id as Autumn2013Pm0508Drawing, id === '5-test-cases' || id === '7-stock-table' ? variant : 0);
}

function textFor(line: string, variant: number) {
  if (line.includes('{{stockL}}')) return line.replace('{{stockL}}', String(autumn2013Pm7Total(autumn2013Pm7Stocks[variant].l).after));
  if (line.includes('{{compressionInput}}')) return line.replace('{{compressionInput}}', autumn2013Pm8Inputs[variant]);
  return line;
}

function renderPrompt(major: Major, variant: number): Block[] {
  const [first, last] = autumn2013Pm0508PageRanges[major];
  // Rejoin the three exact continuations split by a physical page break.
  const continuations: Readonly<Record<number, number>> = { 29: 30, 30: 31, 37: 38 };
  const result: Block[] = [];
  for (let page = first; page <= last; page++) {
    const lines = autumn2013Pm0508Pages[page].split('\n');
    if ([30, 31, 38].includes(page)) lines.shift();
    const next = continuations[page];
    if (next) lines[lines.length - 1] += autumn2013Pm0508Pages[next].split('\n')[0];
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      if (line.startsWith('§')) result.push(panel(line.slice(1), variant));
      else result.push(p(textFor(line, variant)));
    }
  }
  return result;
}

function pageDescription(page: number) {
  const lines = autumn2013Pm0508Pages[page].split('\n').map(line => {
    if (line.startsWith('#')) {
      const bankId = line.slice(1);
      const name = bankId.slice(1);
      const slots = name === 'ab' ? 'a，b' : name === 'cdef' ? 'c～f' : name === 'gh' ? 'g，h' : name;
      return [slots + 'に関する解答群', ...bank(bankId, 0).map((value, i) => marks[i] + '　' + value)].join('\n');
    }
    if (!line.startsWith('§')) return textFor(line, 0);
    const block = panel(line.slice(1), 0);
    if (block.type === 'diagram') return block.caption + '\n' + block.alt;
    if (block.type === 'table') return [block.caption, block.columns.join('｜'), ...block.rows.map(row => row.join('｜'))].join('\n');
    throw Error('SOURCE_FORMAT');
  });
  return lines.join('\n\n');
}

export function autumn2013Pm0508OriginalPageAlt(major: Major): Record<number, string> {
  const [first, last] = autumn2013Pm0508PageRanges[major];
  return Object.fromEntries(Array.from({ length: last - first + 1 }, (_, index) => {
    const page = first + index;
    return [page, pageDescription(page)];
  }));
}

const sourceAnswer = (number: Major) => [...autumn2013Pm0508OfficialKeys[number]].join('／');

const q5: AfternoonBookletDefinition = {
  source: '2013h25a-fe-pm-5', title: 'ソフトウェアのテスト設計', sourceAnswer: sourceAnswer(5),
  reference: [0], version: '3.7.0', fields: [field('短絡評価の2組のテストデータ', 0, 2)],
  fixedReferenceAssetIds: notationPages.map(autumn2013PmPageAssetId),
  notes: variableNotes + ' 物理・印刷23–27頁。共通疑似言語は物理3–4頁。短絡の左から右・確定時終了、exit、図2のノード番号・制御線、図3の網掛けとS/E、S＝E−N＋2、共有解答群と選択順を保持。表1のa・b・c・dが各閾値の等号・直前・直後を通り，短絡対象が変わる三つの組合せを使用。処理の具体的副作用を仮定せず，図の分岐を検証する。',
  publicNotes: 'プログラムと制御フローグラフの形式を保ち，短絡評価をたどる二つのテストデータを変更しました。',
  build(values) {
    const variant = selectCase(values, 3);
    const skipped = autumn2013Pm5Tests[variant].map(shortCircuitSkips);
    const keys = skipped.map(values => autumn2013Pm0508Banks['5ab'].indexOf(values.length
      ? values.join('と') + 'が評価されない' : '全ての単独条件が評価される'));
    const detail = skipped.map((values, i) => 'テストケース' + '①②'[i] + 'では，' + (values.length
      ? values.join('と') + 'を評価しない。' : 'a・b・c・dの単独条件をすべて評価する。')).join('');
    return {
      prompt: renderPrompt(5, variant),
      contexts: [autumn2013PmReference(notation, notationPages)],
      ...answers(5, variant, [...keys, 0, 3, 5, 4, 1, 4]),
      explanation: [
        detail + ' or の左辺が真なら右辺bを評価せず，and の左辺が偽なら右辺dを評価しない。',
        '図3では，②の後が③なのでc＝③。④の偽側から進み次に⑦へ入るのは⑥なのでd＝⑥。二つ目の複数条件が偽のときの処理は⑩なのでe＝⑩，⑦の真側で⑨と⑩へ分かれる単独条件は⑧なのでf＝⑧。',
        '分岐網羅のためには，x＞10が最初から偽の場合，ループに入り二つ目の複数条件が真でexitする場合，及び同条件が偽で繰返しへ戻る場合が必要。ループに入る二例で一つ目の複数条件の真偽を分けるので，最少3例となる。図3のエッジは17本，ノードはS・Eを含め13個であり，17−13＋2＝6。',
      ].join('\n'),
    };
  },
};

const q6: AfternoonBookletDefinition = {
  source: '2013h25a-fe-pm-6', title: 'プロジェクトの実績管理', sourceAnswer: sourceAnswer(6),
  reference: [0], version: '3.7.0', fields: [field('内部設計の第1・2週実績と実績工数', 0, 2)],
  notes: variableNotes + ' 物理・印刷28–31頁。第2週は固有のみ，第1週は共通30本と残りの固有。両週で種別別生産性が一定，1日8時間・週5日・10人，仕掛なし，複数メンバ可，週3に共通10本を保持。計画差は同じ総数120本を分母に百分率の差として比較。標準工数8に対し共通のみ・両方・固有のみが遅い実績3条件。残り工数誤答には計画値継続・種別取り違え・プログラミング工数転用を用い，原表と同桁の整数人時。週3への前倒し・固定計画表と週順を保持。',
  publicNotes: '計画表・工程の順序・作業時間の制約を保ち，内部設計の実績本数と工数を変更しました。',
  build(values) {
    const variant = selectCase(values, 3);
    const work = autumn2013Pm6Work(variant);
    const a = bank('6a', variant).indexOf(String(Math.round(work.difference)));
    const c = bank('6c', variant).indexOf(String(work.remainingHours));
    const d = bank('6d', variant).indexOf(String(work.saving));
    const e = bank('6e', variant).indexOf(work.fastest.join('｜'));
    const f = bank('6f', variant).indexOf(String(work.spread));
    return {
      prompt: renderPrompt(6, variant),
      ...answers(6, variant, [a, work.category, c, d, e, f]),
      explanation: [
        '2週末の本数差は100−' + work.actualCounts.reduce((a, b) => a + b, 0) + '本。総数120本に対する比率差は約' +
          Math.round(work.difference) + 'ポイント。第2週は固有だけで' + work.hours[1] + '÷' + work.actualCounts[1] + '＝' +
          work.uniqueRate + '人時／本。第1週の' + work.hours[0] + '人時から固有の工数を引いて共通30本で割ると' +
          work.commonRate + '人時／本。計画は8人時／本なので，生産性が低いのは' + autumn2013Pm0508Banks['6b'][work.category] +
          'である。残りは固有' + work.remaining + '本で，' + work.remaining + '×' + work.uniqueRate + '＝' + work.remainingHours + '人時となる。',
        '変更後は30×8＋90×9＝' + work.revisedHours + '人時。1,200人時との差は' + work.saving + '人時。第3週に共通10本を済ませると残りの共通は20本。第4週は400人時から20×8を引いた240人時で固有26本，合計46本。第5週は固有44本，第6週は残り20本。',
        '表4では，第4週は共通20本と固有18本で322人時，第5・6週は固有36本ずつで各324人時。最大の差は' + work.spread + '人時。',
      ].join('\n'),
    };
  },
};

const q7: AfternoonBookletDefinition = {
  source: '2013h25a-fe-pm-7', title: '販売管理システムの見直しを伴う業務改善', sourceAnswer: sourceAnswer(7),
  reference: [0], version: '3.7.0', fields: [field('5営業所の二商品の在庫数と需要比率', 0, 2)],
  notes: variableNotes + ' 物理・印刷32–36頁。営業担当による翌日配送と目的，受発注と在庫減算の時差，定量発注，集中物流，原要求／効果の各空欄を保持。二商品で回転・安全在庫の各合計を等しくし，営業所ごとの実数と需要比率の偏りを変える。指定近似√0.1/0.2/0.3/0.9を使い，小数第1位だけ四捨五入する。数値択の役割は集約前の半分，K，L，集約前在庫。K合計の網掛けとL提示値を保持し，fは二商品を同じ条件で比較する範囲として解説する。',
  publicNotes: '現状と改善案、在庫集約の算出式を保ち，営業所別の在庫数と需要比率を変更しました。',
  build(values) {
    const variant = selectCase(values, 3);
    const { k, l } = autumn2013Pm7Stocks[variant];
    const first = autumn2013Pm7Total(k), second = autumn2013Pm7Total(l);
    const e = bank('7e', variant).indexOf(String(first.after));
    return {
      prompt: renderPrompt(7, variant),
      ...answers(7, variant, [3, 3, 2, 1, e, 0]),
      explanation: [
        '営業担当から物流担当へ注文内容を電子的に伝え，受注処理と在庫の減算を同時に行う。発注点・発注量の設定を物流担当へ移す目的は，メーカへまとめて発注すること。営業担当の訪問と配送は従来どおりであり，集約で受発注処理・在庫管理の時間が減るのは事務担当である。',
        'KとLは集約前に回転在庫が' + first.turnover + '，安全在庫が' + first.safety + 'で等しい。Kの平方根の合計は' +
          (first.denominator / 100).toFixed(2) + 'なので，' + first.turnover + '＋' + first.safety + '÷' +
          (first.denominator / 100).toFixed(2) + 'を小数第1位で四捨五入すると' + first.after + '。Lの分母は' +
          (second.denominator / 100).toFixed(2) + '，集約後は' + second.after + '。この比較では，需要比率が均一に近いKの方が分母が大きく，在庫削減効果が高い。',
      ].join('\n'),
    };
  },
};

const q8: AfternoonBookletDefinition = {
  source: '2013h25a-fe-pm-8', title: '文字列の圧縮', sourceAnswer: sourceAnswer(8),
  reference: [0], version: '3.7.0', fields: [field('圧縮後に復元する英字列', 0, 3)],
  fixedReferenceAssetIds: notationPages.map(autumn2013PmPageAssetId),
  notes: variableNotes + ' 物理・印刷37–44頁。共通疑似言語は物理3–4頁。5図，4表，Compress/Decompressの字下げ・継続行・制御線・空行，αの点線枠，5個の式／文の空欄を保持。英字A～Z，0始まり，長さ1以上，距離4～26，一致長4～26，比較文字列は圧縮位置に重ならず，長さ同じなら近い方，単文字と3文字制御列を同じ処理で扱う。設問2の英字列を4つ変更し，α実行回数を5～8回に変化させる。',
  publicNotes: '圧縮と復元の疑似言語、空欄、圧縮の例を保ち，設問2で処理を追う英字列を変更しました。',
  build(values) {
    const variant = selectCase(values, 4);
    const { chunks, literals } = autumn2013Pm8Compress(autumn2013Pm8Inputs[variant]);
    const f = bank('8f', variant).indexOf(String(literals));
    return {
      prompt: renderPrompt(8, variant),
      contexts: [autumn2013PmReference(notation, notationPages)],
      ...answers(8, variant, [0, 3, 1, 3, 3, f]),
      explanation: [
        'aは比較文字位置が0以上であること。bはその位置Pindex−DistanceからFitnum文字進めた文字。各距離の照合が終わったらcでDistanceを1増やす。制御列を格納した場合はdで置換したMaxfitnum文字を飛ばす。',
        'eは復元済みのPlaindataのPindex−StartからFitcnt番目の文字。復元側では制御列を読むと距離と長さを用いて既出の文字を復元し，αは実行しない。',
        '指定列を圧縮すると ' + chunks.join('') + ' となる。圧縮列を角括弧で区切ると ' +
          chunks.map(chunk => chunk.startsWith('$') ? '［' + chunk + '］' : chunk).join('') +
          '。制御列以外の文字をそのまま写すαは' + literals + '回実行される。',
      ].join('\n'),
    };
  },
};

export const legacy2013AutumnPm05To08Definitions = [q5, q6, q7, q8] as const;
