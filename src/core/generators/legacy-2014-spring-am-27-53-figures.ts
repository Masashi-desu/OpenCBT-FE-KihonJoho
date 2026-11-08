import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const am2753Profiles = {
  schema: 'legacy-2014-spring-am-28-sql-schema',
  uml: 'legacy-2014-spring-am-46-uml',
  work: 'legacy-2014-spring-am-52-work-breakdown',
  path: 'legacy-2014-spring-am-53-critical-path',
} as const;

export const spring2014SqlSchema = [
  { name: '商品', columns: [['商品番号', true], ['商品名', false], ['単価', false]] },
  { name: '在庫', columns: [['倉庫番号', true], ['商品番号', true], ['在庫数', false]] },
] as const;
export const spring2014UmlLinks = [
  { related: 0, superClass: 0 }, { related: 2, superClass: 0 }, { related: 0, superClass: 2 },
] as const;
export const spring2014WorkLabels = [
  { root: 'システム開発', topLeft: '企画プロセス', topMiddle: '要件定義プロセス',
    lowerLeft: ['プロセス開始', 'の準備'], lowerRight: ['利害関係者', '要件の定義'] },
  { root: '事業拠点の移転', topLeft: '移転準備', topMiddle: '機器移設',
    lowerLeft: ['旧拠点から', '機器を搬出'], lowerRight: ['新拠点に', '機器を設置'] },
  { root: '社内研修の開催', topLeft: '開催準備', topMiddle: '当日の運営',
    lowerLeft: ['受講者の', '受付'], lowerRight: ['実習機材の', '点検'] },
] as const;

export const spring2014PathNodes = [[35, 111], [131, 111], [228, 28], [228, 112], [325, 112], [325, 195],
  [422, 29], [422, 112], [518, 112]] as const;
const sourceEdges = [
  ['A', 0, 1, 2, 86, 106, 86, 130], ['B', 1, 2, 3, 179, 68, 188, 84], ['C', 1, 3, 3, 183, 106, 183, 130],
  ['D', 3, 2, 1, 220, 78, 235, 78], ['E', 2, 4, 1, 279, 66, 270, 83], ['F', 3, 4, 3, 276, 107, 276, 130],
  ['G', 3, 5, 4, 282, 154, 271, 172], ['H', 4, 6, 3, 370, 66, 382, 85], ['I', 4, 7, 2, 375, 107, 375, 130],
  ['J', 5, 7, 2, 365, 154, 376, 173], ['K', 6, 8, 2, 472, 67, 463, 86], ['L', 7, 8, 3, 470, 107, 470, 130],
] as const;
type Activity = typeof sourceEdges[number][0];
const changes: readonly Partial<Record<Activity, number>>[] = [{}, { B: 7, I: 3 }, { D: 5, H: 4 }, { F: 5, I: 3 }];
export const spring2014PathActivities = (input: number) =>
  sourceEdges.map(([label, from, to, original, labelX, labelY, daysX, daysY]) =>
    ({ label, from, to, days: changes[input][label] ?? original, labelX, labelY, daysX, daysY }));

export const am2753FigureAlt: Record<keyof typeof am2753Profiles, (values: number[]) => string> = {
  schema: () => '「商品」表は商品番号（下線、主キー）、商品名、単価の3列。「在庫」表は倉庫番号（下線）と商品番号（下線）の組が主キーで、在庫数の列が続く。',
  uml: ([input]) => {
    const { related, superClass } = spring2014UmlLinks[input];
    return '上段左・上段右・下段左に空欄の長方形がある。上段右と' + (related === 0 ? '上段左' : '下段左') +
      'を実線で結ぶ。上段左と下段左を結ぶ実線の白抜き三角の矢印は' + (superClass === 0 ? '上段左' : '下段左') + 'を向く。';
  },
  work: ([input]) => {
    const labels = spring2014WorkLabels[input];
    return '最上段は「' + labels.root + '」。中段に「' + labels.topLeft + '」と「' + labels.topMiddle +
      '」があり、右に枝と省略記号。「' + labels.topLeft + '」の下には縦の破線。「' + labels.topMiddle +
      '」の下に「' + labels.lowerLeft.join('') + '」と「' + labels.lowerRight.join('') +
      '」、右に枝と省略記号。「' + labels.lowerRight.join('') + '」の下には縦の破線。中段・下段ともに接続線の右端は破線。';
  },
  path: ([input]) => '凡例は円と円を結ぶ矢印の上に作業名、下に所要日数。節点番号は代替説明用。' +
    spring2014PathActivities(input).map(({ label, from, to, days }) => '節点' + from + 'から' + to + 'へ' + label + '（' + days + '日）').join('、') + '。',
};
export const legacy2014SpringAm27To53Figures: BookletFigureDefinition[] =
  (Object.entries(am2753Profiles) as [keyof typeof am2753Profiles, string][]).map(([kind, profile]) => {
    const count = kind === 'schema' ? 1 : kind === 'path' ? changes.length : 3;
    return {
      profile, domain: [[0, count - 1]], alt: am2753FigureAlt[kind],
      validate(values) {
        if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= count)
          throw Error('FIGURE_DOMAIN');
      },
    };
  });
