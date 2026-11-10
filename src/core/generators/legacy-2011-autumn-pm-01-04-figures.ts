import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { adcModel, networkModel, organizationCases, organizationRelations, riskClasses, riskModel, riskNames, vulnerabilities }
  from './legacy-2011-autumn-pm-01-04-models';

export const profiles = {
  wave: 'legacy-2011-autumn-pm-1-sampling-quantization',
  adcCodes: 'legacy-2011-autumn-pm-1-sample-codes',
  organization: 'legacy-2011-autumn-pm-2-organization-tree',
  relations: 'legacy-2011-autumn-pm-2-relation-tables',
  network: 'legacy-2011-autumn-pm-3-network-topology',
  ipAddresses: 'legacy-2011-autumn-pm-3-ip-addresses',
  riskTables: 'legacy-2011-autumn-pm-4-risk-tables',
} as const;

export function waveAlt([index, kind]: number[]) {
  const { levels } = adcModel(index);
  const source = '横軸は時間t，縦軸は電圧v。t0〜t10を等間隔dで配置する。連続波形上の×が標本点。' +
    (kind ? '左図に波形，右図に同じ波形と電圧尺度v0〜v7，軸の省略，vmaxを示す。v0とv1の差は刻み幅q。' :
      '時刻に対応する点のラベルはv(t0)からv(t10)。');
  return source + '波形はt1とt2の付近の山を越えてt3で低くなり，t5付近で更に高い山を作る。その後，t9付近まで下がってからt10へ上がる。' +
    (kind ? '右図の各時刻の○は左から' + levels.map(level => 'v' + level).join('，') + 'にある。' : '');
}

export function codesAlt([index]: number[]) {
  const row = adcModel(index).codeRow;
  return '時刻｜' + row.map((_, i) => 't' + i).join('｜') + '\n符号｜' + row.map(value => value || '網掛け').join('｜');
}

export function organizationAlt([index, expanded]: number[]) {
  const { company, departments, sections } = organizationCases[index];
  return '一番上の' + company + 'から' + departments.join('，') + 'に接続する。' +
    (expanded ? departments.map((name, i) => name + 'には' + sections[i].join('と') + 'が属する。').join('') : '');
}

export function relationsAlt([index, group]: number[]) {
  return organizationRelations(index, group).map(item => [
    item.name, item.columns.map((name, i) => name + (i === 0 ? '（下線）' : '')).join('｜'),
    ...(item.row.length ? [item.row.join('｜')] : []),
  ].join('\n')).join('\n');
}

export function networkAlt([index]: number[]) {
  const [backboneA, backboneB, routerA, routerB, web1] = networkModel(index).ports;
  return '破線で囲まれた社内と，上部の社外インターネットがファイアウォールで接続される。' +
    'ファイアウォールの右にDMZ（メールサーバ・DNSサーバ・社外公開用Webサーバ），下に基幹ネットワーク。' +
    '基幹ネットワークから2台のルータを介してネットワークAとBにつながる。ネットワークAには社内システムWebサーバ1と2，Bには複数の業務用PC。' +
    'A側のルータの基幹ネットワーク側が' + backboneA + '，ネットワークA側が' + routerA +
    '。B側のルータの基幹ネットワーク側が' + backboneB + '，ネットワークB側が' + routerB +
    '。社内システムWebサーバ1は' + web1 + '。';
}

export function ipsAlt([index]: number[]) {
  const { candidates } = networkModel(index);
  return [candidates.slice(0, 5), candidates.slice(5)].map(row => row.join('｜')).join('\n');
}

type ExcerptRow = {
  asset?: string; assetSpan?: number; kind?: string; span?: number;
  marker?: string; hazard?: number; value?: string; outline?: 'first' | 'middle' | 'last';
  integrity?: number; valueOfAsset?: string;
};
export const excerptRows: readonly ExcerptRow[] = [
  { asset: 'サーバX', kind: '機密性', span: 3, assetSpan: 8, marker: '' },
  { hazard: 3, value: '［a］' },
  { marker: '' },
  { asset: '', kind: '完全性', span: 4, hazard: 0, outline: 'first', integrity: 0 },
  { hazard: 1, outline: 'middle', integrity: 1 },
  { hazard: 3, outline: 'last', integrity: 2 },
  { marker: '' },
  { asset: '', kind: '可用性', span: 1, marker: '' },
  { asset: 'サーバY', kind: '機密性', span: 3, assetSpan: 6, marker: '' },
  { hazard: 1, value: '［b］' },
  { marker: '' },
  { asset: '', kind: '完全性', span: 2, hazard: 0, value: '［c］' },
  { marker: '' },
  { asset: '', kind: '可用性', span: 1, marker: '', valueOfAsset: '［d］' },
];

export function risksAlt([index, kind]: number[]) {
  const { ratings, acceptable, integrity } = riskModel(index);
  if (kind === 0) return '脅威（種類｜値）｜脆弱性（種類｜値）\n' +
    riskNames.map((name, i) => [name, ratings[i][0], vulnerabilities[i], ratings[i][1]].join('｜')).join('\n');
  if (kind === 1) return riskClasses.map((name, i) => name + '｜' + acceptable[i]).join('\n');
  return '列は情報資産（名称，価値の分類・値），脅威（内容・値），脆弱性（内容・値），リスク（値）。' +
    '省略と網掛けを含む。Xの機密性・なりすましのリスクは［a］，完全性のウイルス感染・不正アクセス・なりすましの値はそれぞれ' +
    integrity.join('，') + 'で，これら3値が破線で囲まれる。Xの可用性は省略。Yの機密性・不正アクセスのリスクは［b］，' +
    '完全性・ウイルス感染のリスクは［c］，可用性の資産価値は［d］。';
}

const rows = [
  { profile: profiles.wave, domain: [[0, 3], [0, 1]], alt: waveAlt },
  { profile: profiles.adcCodes, domain: [[0, 3]], alt: codesAlt },
  { profile: profiles.organization, domain: [[0, 3], [0, 1]], alt: organizationAlt },
  { profile: profiles.relations, domain: [[0, 3], [0, 3]], alt: relationsAlt },
  { profile: profiles.network, domain: [[0, 3]], alt: networkAlt },
  { profile: profiles.ipAddresses, domain: [[0, 3]], alt: ipsAlt },
  { profile: profiles.riskTables, domain: [[0, 3], [0, 2]], alt: risksAlt },
] satisfies Array<Omit<BookletFigureDefinition, 'validate'>>;

export const legacy2011AutumnPm0104Figures: BookletFigureDefinition[] = rows.map(row => ({
  ...row,
  validate(values) {
    if (!Array.isArray(values) || values.length !== row.domain.length || Reflect.ownKeys(values).length !== values.length + 1)
      throw Error('FIGURE_PROFILE');
    for (const [index, [min, max]] of row.domain.entries()) {
      const item = Object.getOwnPropertyDescriptor(values, String(index));
      if (!item || !('value' in item) || !Number.isInteger(item.value) || item.value < min || item.value > max)
        throw Error('FIGURE_PROFILE');
    }
  },
}));

export function draw(kind: keyof typeof profiles, values: number[], caption: string) {
  const definition = legacy2011AutumnPm0104Figures.find(item => item.profile === profiles[kind])!;
  definition.validate(values);
  return figure(definition.profile, values, caption, definition.alt(values));
}
