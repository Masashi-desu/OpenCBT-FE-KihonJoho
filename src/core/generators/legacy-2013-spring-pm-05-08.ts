import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, table, variableNotes } from './definition';
import { autumn2015PmAnswers, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { spring2013PmPageAssetId, spring2013PmReference } from './legacy-2013-spring-pm-materials';
import {
  spring2013Pm0508Banks, spring2013Pm0508BankLabels, spring2013Pm0508Pages, spring2013Pm0508PageRanges,
  type Spring2013Pm0508Bank,
} from './legacy-2013-spring-pm-05-08-source';
import {
  spring2013Pm0508Drawings, spring2013Pm0508Figure, spring2013Pm5RecordLayouts, type Spring2013Pm0508Drawing,
} from './legacy-2013-spring-pm-05-08-figures';
import {
  spring2013Pm5Date, spring2013Pm5Employees, spring2013Pm5Input, spring2013Pm5Payroll,
  spring2013Pm6Review, spring2013Pm6TeamCases, spring2013Pm6WeekCases, spring2013Pm6WeekSizes,
  spring2013Pm7Forecasts, spring2013Pm7Market, spring2013Pm7Sales, spring2013Pm8Evaluate, spring2013Pm8Input,
} from './legacy-2013-spring-pm-05-08-model';

const notation = '共通に使用される擬似言語の記述形式';
const notationPages = [3, 4];
const marks = 'アイウエオカキク';
export const spring2013Pm0508OfficialKeys = {
  5: ['エ', 'カ', 'オ', 'ア', 'オ', 'エ', 'イ', 'オ'],
  6: ['エ', 'ウ', 'ア', 'ウ', 'エ'],
  7: ['アエキ', 'ウ', 'ア', 'オ', 'エ', 'イ'],
  8: ['ウ', 'オ', 'カ', 'ア', 'イ', 'ア', 'ウ'],
} as const;
type Major = keyof typeof spring2013Pm0508OfficialKeys;

const bankOrder = {
  5: ['5ad', '5bc', '5efg', '5s3'],
  6: ['6ab', '6c', '6d', '6e'],
  7: ['7s1', '7a', '7b', '7c', '7de'],
  8: ['8ab', '8cd', '8ef', '8g'],
} as const;
const banksForSlots = {
  5: [0, 1, 1, 0, 2, 2, 2, 3],
  6: [0, 0, 1, 2, 3],
  7: [0, 1, 2, 3, 4, 4],
  8: [0, 0, 1, 1, 2, 2, 3],
} as const;

const salaryColumns = spring2013Pm5Employees.map(name => '社員 ' + name);
const comma = (value: number) => value.toLocaleString('ja-JP');
const display = (value: number | string) => typeof value === 'number' ? comma(value) : value;
function answers(major: Major, keys: readonly (number | readonly number[])[]) {
  const choices = bankOrder[major].map(id => spring2013Pm0508Banks[id].map((text): Block[] => [
    id === '5s3' ? table('歩合給の組合せ', salaryColumns, [text.split('｜')])
      : id === '8ab' || id === '8cd' || id === '8g' ? code(text) : p(text),
  ]));
  return autumn2015PmAnswers(choices, keys.map((key, index) => {
    const bank = banksForSlots[major][index];
    if (typeof key !== 'number') {
      if (major !== 7 || index !== 0 || key.length !== 3 || new Set(key).size !== 3 || key.some(i => !choices[bank][i]))
        throw Error('PARAMETER_CONSTRAINT');
      return { ids: ['s1-choice-1', 's1-choice-2', 's1-choice-3'], labels: ['設問1', '設問1・選択2', '設問1・選択3'], bank, correct: key };
    }
    if (!choices[bank][key]) throw Error('PARAMETER_CONSTRAINT');
    if (major === 5 && index === 7) return autumn2015PmSingle('s3', '設問3', bank, key);
    const name = 'abcdefgh'[major === 7 ? index - 1 : index];
    return autumn2015PmSingle(name, name, bank, key);
  }));
}

const criteriaColumns = ['品質管理指標', '基準値', '許容範囲'];
const panels: Readonly<Record<string, (variant: number) => Block>> = {
  '5-processes': () => table('表1 各処理の説明', ['処理', '番号', '内容'], [
    ['契約マスタ更新処理（日次）', '処理1', '異動ファイルから異動年月日が［a］であるレコードを処理対象として抽出する。'],
    ['契約マスタ更新処理（日次）', '処理2', '処理1で抽出した結果を［b］の昇順に整列して，中間ファイルT1に出力する。'],
    ['契約マスタ更新処理（日次）', '処理3', 'T1と旧契約マスタを，証券番号をキーとして突き合わせ，処理をして，新契約マスタに出力する。この処理をT1と旧契約マスタが最終レコードに達するまで繰り返す。'],
    ['歩合給計算処理（月次）', '処理4', '契約マスタから［c］が［d］であるレコードを処理対象として抽出する。'],
    ['歩合給計算処理（月次）', '処理5', '処理4で抽出した結果を社員IDの昇順に整列して，中間ファイルT2に出力する。'],
    ['歩合給計算処理（月次）', '処理6', '社員ごとの担当契約数及び月払保険料の合計を求めて歩合給を計算し，歩合給ファイルにレコードを追加する。'],
  ]),
  '5-master-records': variant => table('表2 2013年5月1日時点の契約マスタ（抜粋）', [...spring2013Pm5RecordLayouts['5-master-layout'].fields],
    spring2013Pm5Input(variant).policies.map(row => row.map(display))),
  '5-change-records': variant => table('表3 2013年4月30日の異動ファイル（抜粋）', [...spring2013Pm5RecordLayouts['5-change-layout'].fields],
    spring2013Pm5Input(variant).events.map(row => [spring2013Pm5Date, ...row.map(display)])),
  '6-design-criteria': () => table('表1 内部設計工程での品質管理指標の計画値', criteriaColumns, [
    ['設計レビュー時間', '3.0時間／kステップ', '基準値の1.0～1.2倍'],
    ['摘出欠陥数', '4.0件／kステップ', '基準値の0.9～1.1倍'],
  ]),
  '6-code-criteria': () => table('表2 プログラミング工程での品質管理指標の計画値', criteriaColumns, [
    ['コードレビューでの摘出欠陥数', '6.0件／kステップ', '基準値の0.9～1.1倍'],
  ]),
  '6-design-actual': variant => table('表3 各チームの分担総規模及び内部設計工程終了時点の品質管理指標の実績値',
    ['チーム', '分担総規模（kステップ）', '設計レビュー時間（時間）', '摘出欠陥数（件）'],
    spring2013Pm6TeamCases[variant].map((row, i) => ['PQRS'[i], ...row.map(String)])),
  '6-self-actual': variant => {
    const cases = spring2013Pm6WeekCases[variant];
    const total = cases.reduce((sum, n) => sum + n, 0);
    return table('表4 Yさんのプログラミング工程でのセルフレビューの実績値', ['週', '第1週', '第2週', '第3週', '第4週', '合計'],
      [['レビュー規模（kステップ）', ...spring2013Pm6WeekSizes.map(size => (size / 2).toFixed(1)), '9.0'],
        ['摘出欠陥数（件数）', ...cases.map(String), String(total)]]);
  },
  '7-market-sales': variant => {
    const { cQuantity, cRevenue } = spring2013Pm7Sales(variant);
    return table('表1 2010年と2011年のC国における年間販売数量と年間売上金額', ['項目', '2010年', '2011年'],
      [['年間販売数量（百万箱）', ...cQuantity.map(String)], ['年間売上金額（億米ドル）', ...cRevenue.map(n => (n / 10).toFixed(1))]]);
  },
  '7-forecast': variant => {
    const rows = spring2013Pm7Forecasts[variant];
    return table('表2 E国の将来の1人当たりGDP，人口及び清涼飲料の1箱当たりの平均単価の予測', ['項目', '2011年', '2015年', '2020年'],
      [['1人当たりGDP（千米ドル）', ...rows.map(row => (row[0] / 10).toFixed(1))],
        ['人口（百万人）', ...rows.map(row => (row[1] / 10).toFixed(1))],
        ['1箱当たり平均単価（米ドル）', ...rows.map(row => String(row[2]))]]);
  },
  '8-action-table': () => table('表1 特売のレコードの取扱い', ['購入[]の状態', '特売.数量 ＝ 0', '特売.数量 ＞ 0'],
    [['購入[] 中にその特売のレコードが存在する', '処理①', '処理②'],
      ['購入[] 中にその特売のレコードが存在しない', '処理③', '処理④']]),
};
function panel(id: string, variant: number): Block {
  if (Object.hasOwn(panels, id)) return panels[id](variant);
  if (Object.hasOwn(spring2013Pm0508Drawings, id)) return spring2013Pm0508Figure(id as Spring2013Pm0508Drawing, variant);
  throw Error('SOURCE_FORMAT');
}

function renderPrompt(major: Major, variant: number): Block[] {
  const [first, last] = spring2013Pm0508PageRanges[major];
  const result: Block[] = [];
  for (let page: number = first; page <= last; page++) {
    const lines = spring2013Pm0508Pages[page].split('\n');
    if (page === 35) lines[lines.length - 1] += 'にした。';
    if (page === 36) lines.shift();
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      if (line.startsWith('§')) result.push(panel(line.slice(1), variant));
      else result.push(p(line));
    }
  }
  return result;
}

function pageDescription(page: number) {
  return spring2013Pm0508Pages[page].split('\n').map(line => {
    if (line.startsWith('#')) {
      const id = line.slice(1) as Spring2013Pm0508Bank;
      const header = id === '5s3' ? ['解答群', salaryColumns.join('｜')]
        : [id === '7s1' ? '解答群' : spring2013Pm0508BankLabels[id]];
      return [...header, ...spring2013Pm0508Banks[id].map((value, i) => marks[i] + '　' + value)].join('\n');
    }
    if (!line.startsWith('§')) return line;
    const block = panel(line.slice(1), 0);
    if (block.type === 'diagram') return block.caption + '\n' + block.alt;
    if (block.type === 'table') return [block.caption, block.columns.join('｜'),
      ...block.rows.map(row => row.map(cell => cell || '（空白）').join('｜'))].join('\n');
    throw Error('SOURCE_FORMAT');
  }).join('\n\n');
}
export function spring2013Pm0508OriginalPageAlt(major: Major): Record<number, string> {
  const [first, last] = spring2013Pm0508PageRanges[major];
  return Object.fromEntries(Array.from({ length: last - first + 1 }, (_, i) => [first + i, pageDescription(first + i)]));
}
const sourceAnswer = (major: Major) => spring2013Pm0508OfficialKeys[major].join('／');

const q5: AfternoonBookletDefinition = {
  source: '2013h25h-fe-pm-5', title: '社員の歩合給決定処理', sourceAnswer: sourceAnswer(5),
  reference: [0], version: '3.7.0', fields: [field('契約開始日と4月末の月払保険料の組合せ', 0, 5)],
  notes: variableNotes + ' 物理・印刷23–28頁。契約マスタのキー・終了契約を削除しない条件、異動ファイルの前日抽出、証券番号による整列と突合せ、満了と終了の区別、月初の処理順、歩合給の単位と3か月連続の要件を保持。新契約成立日と月払保険料を変え、2割増と基礎給0円の例外を分ける。a～gの契約処理は原ファイル仕様に依存するため固定。設問3の元の2×3の組合せを固定順で保持する。',
  publicNotes: '契約マスタの突合せと歩合給の規則を保ち，担当契約の成立日と新契約の月払保険料を変更しました。',
  build(values) {
    const variant = selectCase(values, 6), payroll = spring2013Pm5Payroll(variant);
    const last = spring2013Pm0508Banks['5s3'].indexOf(payroll.map(row => comma(row.paid) + '円').join('｜') as typeof spring2013Pm0508Banks['5s3'][number]);
    return {
      prompt: renderPrompt(5, variant),
      ...answers(5, [3, 5, 4, 0, 4, 3, 1, last]),
      explanation: [
        '日次処理では前日発生分を抽出し，旧契約マスタと同じ証券番号の昇順に並べる。月次処理では終了年月日が空白の契約だけを抽出する。終了行はマスタに残るが，担当契約数にも月払保険料合計にも加えない。',
        'T1が終端又は旧契約マスタ側の証券番号の方が小さい場合は，旧レコードをそのまま出力して旧マスタだけを読み進める。両方の証券番号が等しければ旧レコードに異動を適用して両方を進める。旧マスタが終端又はT1側の証券番号の方が小さい場合は，新契約を作ってT1だけを進める。',
        ...payroll.map(row => row.employee + 'は更新後に担当契約' + row.active + '件，月払保険料合計' + comma(row.premium) +
          '円。5件ごとに10,000円，50,000円ごとに5,000円で，基礎額は' + comma(row.base) + '円。' +
          '2・3・4月のうち新契約を成立させた月は' + row.months.filter(month => month >= '2013/02' && month <= '2013/04')
            .map(month => Number(month.slice(-2)) + '月').join('、') + '。' +
          (row.continuous ? row.base ? '3か月連続なので基礎額を1.2倍する。' : '3か月連続で基礎額が0円なので5,000円を支給する。'
            : '連続しないので基礎額をそのまま支給する。') + '支給額は' + comma(row.paid) + '円。'),
      ].join('\n'),
    };
  },
};

const q6: AfternoonBookletDefinition = {
  source: '2013h25h-fe-pm-6', title: 'ソフトウェア開発の品質管理', sourceAnswer: sourceAnswer(6),
  reference: [0], version: '3.7.0', fields: [field('各チームと4週のレビュー実績', 0, 3)],
  notes: variableNotes + ' 物理・印刷29–33頁。見積りと実ステップ、内部設計の3名以上、セルフ・ペアの順、許容範囲とリーダ判断を保持。表3の実績と表4の摘出件数を変え、両指標の判定・合計・週別の上下を独立に計算。許容範囲の端点を含め、目標件数にはコードレビュー上限／下限を厳密に超える最小整数を使用。原と同桁、同じステップ精度、7〜11件の同順。週ごとの増減と範囲判定の択が重複しない組合せだけを許す。',
  publicNotes: 'レビューの許容範囲と合否判定の規則を保ち，各チームの実績と週ごとの摘出欠陥数を変更しました。',
  build(values) {
    const variant = selectCase(values, 4), result = spring2013Pm6Review(variant);
    const teamIndex = (teams: string[]) => spring2013Pm0508Banks['6ab'].findIndex(text => text === teams.join('と'));
    const target = result.weeks.flatMap((row, i) => row.required === null ? [] : [
      '第' + (i + 1) + '週はセルフレビューの' + (row.lower ? '下限未満' : '上限超過') +
      '。コードレビューの' + (row.lower ? '下限' : '上限') + 'は' + ((row.lower ? 27 : 33) * row.size / 10).toFixed(1) +
      '件で，これを超える最小整数' + row.required + '件から実績' + row.defects + '件を引くと' + row.remaining + '件。',
    ]);
    return {
      prompt: renderPrompt(6, variant),
      ...answers(6, [teamIndex(result.accepted), teamIndex(result.rejected), result.totalOutcome, result.weekOutcome, result.remaining - 7]),
      explanation: [
        '内部設計は1kステップ当たり3.0～3.6時間かつ3.6～4.4件なら両指標が範囲内。' +
          result.teams.map(row => row.team + 'は時間が範囲' + (row.hoursIn ? '内' : '外') + '，件数が範囲' +
            (row.defectsIn ? '内' : '外')).join('。') + '。両方が範囲内なのは' + result.accepted.join('と') +
          '，両方が範囲外なのは' + result.rejected.join('と') + '。片方だけ範囲外の場合は両方が外れた判定と区別する。',
        'セルフレビューは1kステップ当たり2.4～3.6件。全体' + (result.totals[0] / 2).toFixed(1) + 'kステップの実績は' +
          result.totals[1] + '件で，' + spring2013Pm0508Banks['6c'][result.totalOutcome] + '。週ごとには' +
          result.weeks.map((row, i) => '第' + (i + 1) + '週 ' + row.defects + '÷' + (row.size / 2).toFixed(1) +
            '（' + (row.lower ? '下限未満' : row.upper ? '上限超過' : '範囲内') + '）').join('、') +
          'となるため，' + spring2013Pm0508Banks['6d'][result.weekOutcome] + '。',
        ...target, 'ペアレビューで必要な摘出欠陥数は合計' + result.remaining + '件。',
      ].join('\n'),
    };
  },
};

const q7: AfternoonBookletDefinition = {
  source: '2013h25h-fe-pm-7', title: '市場分析と需要予測', sourceAnswer: sourceAnswer(7),
  reference: [0], version: '3.7.0', fields: [field('各国の販売数量とE国の予測表', 0, 3)],
  notes: variableNotes + ' 物理・印刷34–37頁。図は2002～2011年、縦軸0～200・20刻み・百万箱、A～Eの記号・順序を保持。原図の点は読取概数、C国の2010・2011は表1と一致。8択から3つ、順不同の単一解答群。年別総計・順位・期間総量・比率と増加量を独立に区別。C国の数量減・米ドル売上増、年単位換算は維持してa～cは固定。E国の式・単位・年・選択肢順を維持し、GDP、人口、単価を変更。丸めで順位又は増減を決めず、原と同じ桁で計算する。',
  publicNotes: '市場グラフと需要予測式の形式を保ち，各国の販売数量とE国の需要予測に使う値を変更しました。',
  build(values) {
    const variant = selectCase(values, 4), result = spring2013Pm7Market(variant);
    const { cQuantity, cRevenue } = spring2013Pm7Sales(variant);
    const trueIndices = result.truth.flatMap((isTrue, i) => isTrue ? [i] : []);
    const countryUp = result.upCountries.flatMap((up, i) => up ? ['ABCDE'[i] + '国'] : []);
    const price = cRevenue.map((value, i) => (10 * value / cQuantity[i]).toFixed(2));
    return {
      prompt: renderPrompt(7, variant),
      ...answers(7, [trueIndices, 2, 0, 4, result.volumeDirection, result.revenueDirection]),
      explanation: [
        '図1で5か国の各年の値を合計すると，年の順に' + result.totals.join('、') + '百万箱' +
          (variant === 0 ? '（図からの概数）' : '') + '。順位に変動があった年は' + result.rankChanges.join('年、') + '年。' +
          'A～E国の期間販売数量の合計は' + result.countryTotals.join('、') + '百万箱，2002年から2011年までの増加量は' +
          result.deltas.join('、') + '百万箱。最終年÷初年で伸び率を比べる。D国は' +
          (result.truth[5] ? '2008～2011年に毎年増え，伸び率が最も低い。' : '2008～2011年の毎年増加と最低伸び率の両条件を満たさない。') +
          '期間中に毎年増えたのは' + countryUp.join('、') + '。これらを照合すると適切なのは' + trueIndices.map(i => marks[i]).join('、') + '。',
        'C国の販売数量が' + cQuantity[0] + 'から' + cQuantity[1] + '百万箱へ減る一方，米ドル換算した平均単価は約' +
          price[0] + 'から' + price[1] + '米ドルへ上がる。インフレ・増税による値上げ，所得増による高価格帯へのシフト，' +
          '米ドルに対する現地通貨高なら平均単価を押し上げ得る。商品数・購入頻度・購入量の変化だけでは平均単価の上昇を説明できず，' +
          '円との為替レートも米ドルへの換算を直接決めない。',
        '需要予測式にGDPと人口を代入すると，E国の年間販売数量は2011年・2015年・2020年の順に' +
          result.forecasts.map(row => (row.volume / 10).toFixed(1)).join('、') + '百万箱。各年の1箱当たり平均単価を掛けると年間売上金額は' +
          result.forecasts.map(row => (row.revenue / 10).toFixed(1)).join('、') + '百万米ドル。' +
          'したがって販売数量は「' + spring2013Pm0508Banks['7de'][result.volumeDirection] + '」，' +
          '売上金額は「' + spring2013Pm0508Banks['7de'][result.revenueDirection] + '」。',
      ].join('\n'),
    };
  },
};

const q8: AfternoonBookletDefinition = {
  source: '2013h25h-fe-pm-8', title: '選択型特売の値引き処理', sourceAnswer: sourceAnswer(8),
  reference: [0], version: '3.7.0', fields: [field('購入数量と特売の品番', 0, 3)],
  fixedReferenceAssetIds: notationPages.map(spring2013PmPageAssetId),
  answerVariation: 'fixed',
  notes: variableNotes + ' 物理・印刷38–43頁、共通疑似言語は3–4頁。添字1始まり、品番順ポインタ・末尾0、物理格納順、対象配列の昇順、初期数量0、整数商、点線枠、追加の連結、既存行の数量が同じ場合の更新、無効行を物理的に残す削除を保持。図1～4の購入数・特売品番で中間、先頭、末尾、特売なしを作り、各値と網掛けを同期。検索と更新の契約、分岐、空欄、解答群の意味が固定されるため正答は固定。品番順・配列順を替えて正答を変える案は原アルゴリズムを変えるため採用しない。',
  publicNotes: '購入表・特売表と疑似言語の空欄を保ち，購入数量と特売品番を変更しました。',
  build(values) {
    const variant = selectCase(values, 4), { rows, head, promo } = spring2013Pm8Input(variant);
    const result = spring2013Pm8Evaluate(rows, head, promo);
    const example = result.count > 0 ? '新規行' + result.rows.length + 'のptrは' + result.rows.at(-1)!.ptr +
      'で，実行後のptr起点は' + result.head + '。値引額は' + result.count * promo.price + '円。' : '商が0なので特売の行は追加しない。';
    return {
      prompt: renderPrompt(8, variant), contexts: [spring2013PmReference(notation, notationPages)],
      ...answers(8, [2, 4, 5, 0, 1, 0, 2]),
      explanation: [
        '検索中は購入配列の添字を増やさず，購入[K].ptrをたどってKを進める。対象配列は品番順に格納されているのでTを1増やす。' +
          '一致時は数量を転記して両方進め，購入の品番が小さければKだけ，大きければTだけを進める。',
        '計算部は対象別の数量' + result.targets.join('、') + 'を合計し，' + promo.designated + 'で割った整数の商' + result.count +
          'を特売の数量にする。' + example,
        '追加するときは，前の行のptr又はptr起点を新しい購入行数（新規行の添字）にする。新規行のptrには探索停止時のKを入れ，後続行又は0へつなぐ。',
        '特売行が既にあり数量が正なら処理②で数量と金額を更新し，数量が同じときも実行する。既存行があり数量が0なら処理①で削除する。' +
          'そのとき前のptr又はptr起点へ購入[K].ptrを代入する。配列上の行は消さず，連結から外す。' +
          '既存行がなければ，数量0の処理③は何もせず，正の処理④は新規追加となる。',
      ].join('\n'),
    };
  },
};

export const legacy2013SpringPm05To08Definitions: readonly AfternoonBookletDefinition[] = [q5, q6, q7, q8];
