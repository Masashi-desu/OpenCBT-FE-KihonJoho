import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import { autumn2015Pm0508Banks as banks, autumn2015Pm0508Source as source } from './legacy-2015-autumn-pm-05-08-source';
import {
  autumn2015Pm0508Body as body, autumn2015Pm0508Choices as choices, autumn2015Pm0508Figure as figure,
  autumn2015Pm0508Index as index, autumn2015Pm0508Prompt as prompt, autumn2015PmNumber as format,
} from './legacy-2015-autumn-pm-05-08-shared';

const policies = [
  { bands: [10, 20], rates: [10, 15, 20], fee: 5000, floorDays: 0, defaultDays: 7, separateNeedsDate: false },
  { bands: [8, 16], rates: [5, 10, 15], fee: 4000, floorDays: 1, defaultDays: 7, separateNeedsDate: false },
  { bands: [12, 24], rates: [10, 20, 25], fee: 6000, floorDays: 2, defaultDays: 10, separateNeedsDate: true },
  { bands: [15, 30], rates: [10, 15, 25], fee: 6000, floorDays: 3, defaultDays: 10, separateNeedsDate: true },
] as const;
type DecisionCell = string | null | { readonly kind: 'blank'; readonly fieldId: string; readonly segment?: number };
export type Autumn2015PmDecisionTable = {
  readonly caption: string;
  readonly heading: string;
  readonly columns: number;
  readonly conditions: readonly { readonly label: DecisionCell; readonly marks: readonly DecisionCell[] }[];
  readonly actions: readonly { readonly label: string; readonly marks: readonly DecisionCell[] }[];
  readonly rowSpans?: readonly { readonly section: string; readonly row: number; readonly column: number; readonly rowSpan: number; readonly fieldId: string }[];
};

export function autumn2015Pm5Model(values: number[]) {
  const profile = index(values, policies.length), policy = policies[profile];
  const floor = policy.floorDays ? '処理日の' + policy.floorDays + '日後' : '処理日';
  const defaultDate = policy.defaultDays === 7 ? '1週間後' : policy.defaultDays + '日後';
  const bounds = policy.bands.map(amount => amount + '万円');
  const bank = [
    '希望納期＞' + floor, '希望納期≦' + floor, ...banks[5].abcd.slice(2),
  ];
  return { profile, policy, floor, defaultDate, bounds, bank, eIndex: policy.separateNeedsDate ? 3 : 1 };
}

export function autumn2015Pm5Decisions(values: number[], id: 'q5-t3' | 'q5-t4' | 'q5-t6'): Autumn2015PmDecisionTable {
  const m = autumn2015Pm5Model(values);
  if (id === 'q5-t3') return {
    ...source[id],
    actions: source[id].actions.map((row, i) => i === 1 ? { ...row, label: '希望納期に処理日の' + m.defaultDate + 'の日付を設定する' } : row),
  };
  if (id === 'q5-t6') {
    const [low, high] = m.bounds;
    const labels = ['無料会員である', '累計購入額＜' + low, low + '≦累計購入額＜' + high, '累計購入額≧' + high];
    return {
      ...source[id],
      conditions: source[id].conditions.map((row, i) => ({ ...row, label: labels[i] })),
      actions: source[id].actions.map((row, i) => i === 3 ? row : { ...row, label: '注文額から' + m.policy.rates[i] + '%を割り引く' }),
    };
  }
  return source[id];
}

const cellText = (cell: DecisionCell) => cell === null ? '未記入' : typeof cell === 'string' ? cell : '［' + cell.fieldId + '］';
const decisionAlt = (model: Autumn2015PmDecisionTable) =>
  model.heading + '。条件部：' + model.conditions.map(row => cellText(row.label) + '：' + row.marks.map(cellText).join('、')).join('。') +
  '。動作部：' + model.actions.map(row => row.label + '：' + row.marks.map(cellText).join('、')).join('。') +
  (model.rowSpans ? '。空欄eは左から第5列の動作部の下3行を覆う。' : '。');

export function autumn2015Pm5Discounts(values: number[]) {
  const m = autumn2015Pm5Model(values), [low, high] = m.bounds, [a, b, c] = m.policy.rates;
  const pct = (rate: number) => '注文額から' + rate + '%を割り引く';
  return {
    columns: ['会員区分＼累計購入額', low + '未満', low + '以上' + high + '未満', high + '以上'],
    rows: [
      ['無料会員', 'なし', pct(a), pct(b) + '・送料無料'],
      ['有料会員', pct(a), pct(b) + '・送料無料', pct(c) + '・送料無料'],
    ],
  };
}

function build(values: number[]) {
  const m = autumn2015Pm5Model(values), discount = autumn2015Pm5Discounts(values);
  const blocks = prompt(5, values, id => {
    switch (id) {
      case 'q5-f1':
        return figure(5, 'order-flow', values, source[id].caption,
          '入力処理→確定前処理→エラー判定。ありなら入力処理へ戻り、なしなら注文確定処理へ進む。確定前処理は破線枠内の会員情報ファイル・商品ファイル・在庫ファイルを参照する。');
      case 'q5-t1':
        return table(source[id].caption, [...source[id].columns], source[id].rows.map(row => [row.item + (row.required ? '（注1）' : ''), row.meaning]));
      case 'q5-t2':
        return figure(5, 'file-fields', values, source[id].caption, source[id].rows.map(row =>
          row.file + '：' + row.items.map(item => item.text + (item.underlined ? '（下線）' : '')).join('、')).join('。') + '。' + source[id].footnote);
      case 'q5-t3':
      case 'q5-t4':
      case 'q5-t6': {
        const decision = autumn2015Pm5Decisions(values, id);
        return figure(5, 'decision-' + id.slice(-1), values, decision.caption, decisionAlt(decision));
      }
      case 'q5-t5':
        return table(source[id].caption, discount.columns, discount.rows);
      default: throw new Error('SOURCE_FORMAT');
    }
  }, text => {
    const updated = text.replace('処理日という）の1週間後', '処理日という）の' + m.defaultDate)
      .replace('希望納期が処理日以前', '希望納期が' + m.floor + '以前').replace('年会費5,000円', '年会費' + format(m.policy.fee) + '円');
    if (!m.policy.separateNeedsDate || !text.startsWith('(4)')) return updated;
    return '(4) 請求先区分が“指定する”であって，請求先情報又は希望納期の入力がなかった場合は，項目関連エラーとする。希望納期の入力の有無は(2)で日付を設定する前の状態で判定する。';
  });
  const footnote = blocks.findIndex(block => block.type === 'table' && block.caption === source['q5-t1'].caption);
  blocks.splice(footnote + 1, 0, { type: 'paragraph', text: source['q5-t1'].footnote });
  return body(blocks, [
    { id: 'abcd', choices: choices(m.bank) },
    { id: 'e', choices: banks[5].e.map((row, option) => [
      figure(5, 'action-choice', [...values, option], '動作の組合せ', '上から' + row.map(mark => mark === 'X' ? '実行' : '実行しない').join('、') + '。'),
    ]) },
    { id: 's2', choices: choices(banks[5].s2) },
  ], [
    ...[2, 0, 4, 6].map((correct, i) => ({ id: 'abcd'[i], bank: 'abcd', correct })),
    { id: 'e', bank: 'e', correct: m.eIndex }, { id: 's2', label: '設問2', bank: 's2', correct: 4 },
  ],
  '表3では，まず希望納期の入力の有無（a）を確かめる。入力されていれば，希望納期が' + m.floor +
  'より後かどうか（b）を判定し，同じ日やそれ以前ならエラーとする。cは請求先を指定するか，dは請求先情報の入力があるかを判定する。' +
  'eの列は必須項目がそろい，納期は未入力で，請求先を指定し請求先情報は入力されている。既定日として処理日の' + m.defaultDate + 'を設定した後，' +
  (m.policy.separateNeedsDate
    ? '入力時に納期が空欄だったので項目関連エラーにして戻る。コピー・在庫取得は実行しない。'
    : '項目関連エラーはなく，宛先のコピーをせずに在庫数を取得する。') +
  '在庫数が注文数と等しい場合は不足ではない。表6では直近1年間の過去の累計購入額は' + m.bounds.join('又は') +
  'で区切った3区分のいずれか一つにだけ該当する。会員区分2通りと掛けて成立は6規則，残りの16−6＝10規則は発生しない。今回の注文額は累計に含めない。ANDは論理積であり，全条件が真のときに成り立つ。');
}

export const legacy2015AutumnPm5Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-5', title: '決定表を用いた注文機能の設計',
  version: '3.7.0', reference: [0], fields: [field('納期・請求先・割引の条件', 0, policies.length - 1)],
  sourceAnswer: 'ウ／ア／オ／キ／イ／オ',
  notes: '物理p21–25、6欄。a〜d共有8択、eは縦3マス6択、設問2は7択。エラー時後続なし、日付比較・既定日、請求先コピー、等数の在庫、累計の過去分のみ、三帯の境界・決定表の未記入を保持。4条件は納期の下限・既定日・指定請求先の納期必須・割引の額区分と料金を同じ本文と表へバインドする。eの項目関連エラー動作も変わる。全表条件を独立した逐次処理で照合し、同値候補を拒否する。',
  publicNotes: '原問の決定表・入力とエラーの処理を保ち，納期や請求先の条件，会員区分別の割引額区分を変更しました。',
  build,
};
