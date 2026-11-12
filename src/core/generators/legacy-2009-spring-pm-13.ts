import { code, p, table } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-spring-pm-09-13-support';
import { spring2009PmPageAssetId, spring2009PmReference } from './legacy-2009-spring-pm-materials';

const originalSales = [
  [1000, 1100, 2300, 1200, 1500, 1200], [500, 1500, 800, 50, 40, 20], [500, 600, 500, 400, 500, 1200],
  [2000, 2000, 2000, 2000, 2000, 2000], [400, 1000, 400, 30, 40, 60], [300, 400, 500, 600, 700, 800],
  [1000, 1500, 1200, 1600, 1400, 1800], [600, 1000, 800, 70, 50, 40], [200, 500, 1000, 500, 800, 1000],
];
const balancedM1 = [
  [450, 1230, 700, 260, 830, 420],
  [520, 1510, 850, 240, 630, 410],
  [430, 1237, 760, 210, 560, 370],
];
const cases = [
  { selected: 1, capacity: 3000, margin: 20, productFirst: false, amounts: originalSales },
  { selected: 0, capacity: 3200, margin: 10, productFirst: true, amounts: originalSales.map((row, i) => i % 3 === 0 ? balancedM1[i / 3] : row.map((n, month) => n + i * 4 + month + 1)) },
  { selected: 2, capacity: 2300, margin: 25, productFirst: false, amounts: originalSales.map((row, i) => row.map((n, month) => n + (i + 1) * (month + 2))) },
  { selected: 1, capacity: 3100, margin: 30, productFirst: true, amounts: originalSales.map((row, i) => row.map((n, month) => n + (i + 4) * (month + 1))) },
];
const count = (value: number) => value.toLocaleString('en-US');
const months = ['3月', '4月', '5月', '6月', '7月', '8月', '9月'];
export function productionRows(index: number) {
  const { selected, capacity, margin, amounts } = cases[index];
  const sales = months.slice(1).map((_, month) => amounts[selected][month] + amounts[selected + 3][month] + amounts[selected + 6][month]);
  const neededStock = sales.map(quantity => Math.ceil(quantity * (100 + margin) / 100));
  const carry = [0];
  const neededProduction = neededStock.map((stock, month) => {
    const needed = Math.max(stock - carry[month], 0);
    if (month < 5) carry.push(carry[month] + needed - sales[month]);
    return needed;
  });
  const advanced = [0, 0, 0, 0, 0, 0, 0];
  const planned = [0, 0, 0, 0, 0, 0];
  for (let month = 5; month >= 0; month--) {
    const required = neededProduction[month] + advanced[month + 1];
    planned[month] = Math.min(required, capacity);
    advanced[month] = required - planned[month];
  }
  return { sales, neededStock, carry, neededProduction, advanced, planned };
}

const sales = languageFigure(13, 'monthly-sales-worksheet', '図1 月別販売計画を記録したワークシート“販売計画”の例', index => {
  const { productFirst, amounts } = cases[index];
  const first = productFirst ? '商品名' : '拠点名', second = productFirst ? '拠点名' : '商品名';
  return { kind: 'tables', tables: [{ headers: ['', ...'ABCDEFGH'], rows: [
    ['1', first, second, ...months.slice(1).map(month => month + '計画量')],
    ...amounts.map((row, position) => {
      const base = 'P' + (Math.floor(position / 3) + 1), product = 'M' + (position % 3 + 1);
      return [String(position + 2), ...(productFirst ? [product, base] : [base, product]), ...row.map(count)];
    }),
  ], rowHeaders: true }] };
});
const planning = languageFigure(13, 'monthly-production-worksheet', '図2 月別生産計画作成後のワークシート“生産計画”の例', index => {
  const { sales, neededStock, carry, neededProduction, advanced, planned } = productionRows(index);
  const { selected, capacity } = cases[index];
  return { kind: 'tables', tables: [{
    headers: ['', ...'ABCDEFGHIJ'], rows: [
      ['1', '商品名', '最大月産量', '', ...months],
      ['2', 'M' + (selected + 1), count(capacity), '販売計画量', '', ...sales.map(count)],
      ['3', '', '', '必要在庫量', ...neededStock.map(count), ''],
      ['4', '', '', '繰越在庫量', ...carry.map(count), ''],
      ['5', '', '', '必要生産量', ...neededProduction.map(count), ''],
      ['6', '', '', '繰上生産量', ...advanced.map(count)],
      ['7', '', '', '計画生産量', ...planned.map(count), ''],
    ],
    rowHeaders: true,
    shaded: [[0, 3], [1, 4], ...[2, 3, 4, 5, 6].flatMap(row => [[row, 1], [row, 2]] as const),
      ...[2, 3, 4, 6].map(row => [row, 10] as const)],
  }], note: '網掛けの部分には，データは入らない。' };
});
export const q13Figures = [sales, planning];

const formula = (expression: string) => code(expression, 'text');
const inventoryOptions = ['D3 + D4 - D5', 'D3 + D4 - E2', 'D3 + D5 - D4', 'D3 + D5 - E2', 'D4 + D5 - D3', 'D4 + D5 - E2'];
const compareInventory = ['D3 ≦ D4', 'D3 ≧ D4', 'D3 < 0', 'D3 ≧ 0', 'D4 < 0', 'D4 ≧ 0'];
const bringForward = ['I5 + J6', 'I5 + J6 - I7', 'I7 + J6', 'I7 + J6 - I5'];
const compareCapacity = ['I5 + J6 ≦ $B2', 'I5 + J6 > $B2', 'I5 ≦ $B2', 'I5 > $B2', 'J6 ≦ $B2', 'J6 > $B2'];
const sheetPages = [65, 66, 67];

export const q13 = createLanguageDefinition(13, '表計算：月別販売計画から月別生産計画を作る', '商品名列・商品別販売数量・余裕率・最大月産量', 'abcdefg',
  'aエ bイ cエ dカ eア fイ gア',
  '販売計画表と生産計画表、横への式の複写、在庫の切上げ、前月への不足分繰上げを維持。商品名の列、販売量、余裕率と最大月産量を変更し、照合範囲と計算式を反映する。',
  index => {
    const { selected, margin, productFirst } = cases[index];
    const product = 'M' + (selected + 1);
    const extra = String(margin / 100);
    const factor = String(1 + margin / 100);
    const first = productFirst ? 'A' : 'B', third = productFirst ? 'B' : 'H';
    const range = (column: string) => column + '2〜' + column + '10';
    const ranges = [range(first), range('C'), range(third), range('$' + first), range('$C'), range('$' + third)];
    const rounded = ['切上げ(E2) * ' + extra, '切上げ(E2) * ' + factor, '切上げ(E2 * ' + extra + ')', '切上げ(E2 * ' + factor + ')'];
    return {
      contexts: [spring2009PmReference('表計算ソフトの機能・用語', sheetPages)],
      pages: [
        page(54, [
          p('問13 次の表計算及びワークシートの説明を読んで，設問に答えよ。'),
          p('〔表計算の説明〕'),
          p('E社は，3種類の商品M1〜M3を自社で生産し，3か所の販売拠点P1〜P3で販売している。販売する商品は，前月までに生産したものである。'),
          p('（1）E社では，各販売拠点で2月に立てた4〜9月の半年分の商品ごとの月別販売計画を基に，次の①及び②に従って3〜8月の半年分の月別生産計画を作成している。'),
          p('① 過去の経験から，販売計画量以上に売れる月があるので，各月の在庫量は，翌月の販売計画量に' + margin + '％の余裕を加えた数量とする。'),
          p('② 商品ごとに1か月間に生産できる最大の数量（以下，最大月産量という）が決まっているので，前月にすべてを生産できない場合がある。その場合，不足分は前々月までに生産するように計画する。'),
          p('（2）各販売拠点で2月に立てた4〜9月の半年分の商品ごとの月別販売計画は，表計算ソフトのワークシート“販売計画”に1行ずつ入力する。そのワークシートの例を図1に示す。'),
          sales.block(index),
          p('（3）図1のワークシート“販売計画”を基に，商品' + product + 'について3〜8月の半年分の月別生産計画を作成したワークシート“生産計画”の例を図2に示す。'),
        ]),
        page(55, [
          planning.block(index, '図2 商品' + product + 'の月別生産計画作成後のワークシート“生産計画”の例'),
          p('（4）一つの商品についての月別生産計画の作成は，次の手順で行う。'),
          p('① 4〜9月の期間について，E社全体での月ごとの販売計画量を求める。'),
          p('② 3〜8月の期間について，月ごとに新たに必要となる商品の数量（以下，必要生産量という）を，最大月産量を考慮せずに求める。'),
          p('③ 3〜8月の各月における必要生産量を確保するために，最大月産量を考慮して，月ごとに生産する商品の数量（以下，計画生産量という）を求める。'),
          p('（5）各月の必要生産量の求め方は，次のとおりである。'),
          p('必要生産量は，当月の必要在庫量から繰越在庫量を差し引いた数量である。ただし，繰越在庫量が必要在庫量以上ある場合は，商品の生産は必要ないので0となる。'),
          p('① 必要在庫量は最低限もつ必要がある在庫の量で，翌月の販売計画量の' + (100 + margin) + '％とする。'),
          p('② 繰越在庫量とは，前月の繰越在庫量と必要生産量の合計から，当月の販売計画量を差し引いた数量である。なお，3月の繰越在庫量は0である。'),
          p('（6）各月の計画生産量の求め方は，次のとおりである。'),
          p('計画生産量は，当月の必要生産量と翌月の繰上生産量の合計である。ただし，この数量が最大月産量を超える場合は，計画生産量は最大月産量とする。'),
          p('繰上生産量とは，当月の必要生産量と翌月の繰上生産量の合計から，当月の計画生産量を差し引いた数量である。'),
          p('（7）ワークシート“生産計画”で用いる関数を表に示す。'),
        ]),
        page(56, [
          table('表 ワークシート“生産計画”で用いる関数', ['書式', '説明'], [
            ['照合合計（照合値，照合範囲，対応範囲）', '照合範囲のセルにおいて，照合値と等しい値をもつセルをすべて探し出す。そして，照合値と等しい値をもつセルの相対位置と同じ位置にある対応範囲のセルの値（数値）を合計して返す。'],
            ['切上げ（実数値）', '実数値の小数点以下を切り上げた整数を返す。'],
          ]),
          p('〔ワークシート：生産計画〕'), p('ワークシート“生産計画”の作成方法は，次のとおりである。'),
          p('（1）セルA2に，商品名としてM1〜M3のいずれかを入力する。'),
          p('（2）セルB2に，セルA2の商品の最大月産量を入力する。'),
          p('（3）セルE2〜J2に，4〜9月の販売計画量を計算するための式を入力する。これを実行するために，セルE2に次の式を入力し，セルF2〜J2に複写する。複数のワークシート間でデータを参照する場合には“ワークシート名！セル”又は“ワークシート名！セル範囲”という形式で指定する。'),
          formula('照合合計($A2, 販売計画!［a］, 販売計画!［b］)'),
          p('（4）セルD3〜I3に，3〜8月の必要在庫量（小数点以下切上げ）を計算するための式を入力する。これを実行するために，セルD3に次の式を入力し，セルE3〜I3に複写する。'),
          formula('［c］'),
          p('（5）セルD4に，3月の繰越在庫量として0を入力する。セルE4〜I4に，4〜8月の繰越在庫量を計算するための式を入力する。これを実行するために，セルE4に次の式を入力し，セルF4〜I4に複写する。'),
          formula('［d］'),
          p('（6）セルD5〜I5に，3〜8月の必要生産量を計算するための式を入力する。これを実行するために，セルD5に次の式を入力し，セルE5〜I5に複写する。'),
          formula('IF(［e］, 0, D3 - D4)'),
          p('（7）セルJ6に，9月の繰上生産量として0を入力する。セルD6〜I6に，3〜8月の繰上生産量を計算するための式を入力する。これを実行するために，セルI6に次の式を入力し，セルD6〜H6に複写する。'),
          formula('［f］'),
        ]),
        page(57, [
          p('（8）セルD7〜I7に，3〜8月の計画生産量を計算するための式を入力する。これを実行するために，セルI7に次の式を入力し，セルD7〜H7に複写する。'),
          formula('IF(［g］, I5 + J6, $B2)'),
          p('設問 ワークシート“生産計画”の説明中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(0, 'ab', ranges, 'エイ', 'text'),
          bank(0, 'c', rounded, 'エ', 'text'), bank(0, 'd', inventoryOptions, 'カ', 'text'),
          bank(0, 'e', compareInventory, 'ア', 'text'), bank(0, 'f', bringForward, 'イ', 'text'),
          bank(0, 'g', compareCapacity, 'ア', 'text'),
        ]),
      ],
      explanation: 'a：商品名が入る' + first + '列は右に複写しても動かないように列だけ絶対参照にする。b：販売量は4月のC列から始め，右へ複写するたびに翌月の列へ動かす。'
        + 'c：翌月の販売計画量を' + factor + '倍してから小数点以下を切り上げる。d：前月の繰越と必要生産量を足し，当月の販売計画量を引く。'
        + 'e：必要在庫量が繰越在庫量以下なら追加で作る必要はない。f：当月の必要生産量と翌月からの繰上げを足し，当月に実際に計画する量を引く。'
        + 'g：当月の必要分と翌月の繰上げを合わせた量が最大月産量以下ならその量を，超えるなら最大月産量を選ぶ。',
    };
  }, { fixedReferenceAssetIds: sheetPages.map(spring2009PmPageAssetId) });
