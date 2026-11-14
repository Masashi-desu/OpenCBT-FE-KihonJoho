import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';
import { deliverySchemas, sqlCases } from './legacy-2007-autumn-pm-2-model';
import { decimalDigits, formatCases } from './legacy-2007-autumn-pm-4-model';
import { newSaleFlow, relatedFlowNotes, relatedSaleFlow, saleSchema } from './legacy-2007-autumn-pm-5-model';

export const profiles = {
  delivery: 'legacy-2007-autumn-pm-2-delivery',
  'delivery-schema': 'legacy-2007-autumn-pm-2-schema',
  bathtub: 'legacy-2007-autumn-pm-3-bathtub',
  format: 'legacy-2007-autumn-pm-4-format',
  'sale-product': 'legacy-2007-autumn-pm-5-product',
  'sale-details': 'legacy-2007-autumn-pm-5-details',
  'sale-new': 'legacy-2007-autumn-pm-5-new',
  'sale-related': 'legacy-2007-autumn-pm-5-related',
} as const;
export type FigureKind = keyof typeof profiles;
type SchemaRow = { name: string; fields: readonly string[]; keys: number };
function schemaAlt(schemas: readonly SchemaRow[]) {
  return schemas.map(({name, fields, keys}) =>
    name + '：' + fields.join('、') + '。下線のキー項目は' + fields.slice(0, keys).join('、') + '。').join('');
}
const descriptors: Record<FigureKind, { count: number; alt: (index: number) => string }> = {
  delivery: { count: 4, alt: index => {
    const { center, otherCenter, offices } = sqlCases[index];
    const centers = [center, otherCenter].sort();
    return centers[0] + 'と' + centers[1] + 'の集配センタは双方向に移送する。' +
      centers[0] + 'は' + offices.slice(0,3).join('、') + 'の3支店と、' + centers[1] + 'は' +
      offices.slice(3).join('、') + 'の2支店と双方向に移送する。各支店の矢印は下の破線で区切られた管轄地区へ伸びる。注　破線の区画は，各支店の受けもつ管轄地区を示す。';
  } },
  'delivery-schema': { count: 1, alt: () => schemaAlt(deliverySchemas) },
  bathtub: { count: 1, alt: () => '縦軸は故障頻度、横軸は導入からの経過時間。縦軸の低い位置に省略の波線。初期故障期間は急減から安定へ向かい、偶発故障期間は横ばい、摩耗故障期間は上に向かって増加する。' },
  format: { count: 4, alt: index => {
    const { start, base, examples } = formatCases[index];
    return 'Float，Num，Out[]（添字' + start + '始まり）の6例。' + examples.map(([value, digits]) =>
      value.replace('-', '−') + '，' + digits + '：' + [...decimalDigits(value, base, digits)].join('｜')).join('。') + '。';
  } },
  'sale-product': { count: 1, alt: () => schemaAlt(saleSchema.slice(0,1)) },
  'sale-details': { count: 1, alt: () => schemaAlt(saleSchema.slice(1)) },
  'sale-new': { count: 4, alt: index => newSaleFlow(index).map(lines => lines.join('')).join('→') +
    '。購入表・購入明細表は購入実績の抽出へ、商品表は商品カテゴリの抽出と登録商品の抽出へ、中間表 A は新規登録商品の表示にも入力される。' },
  'sale-related': { count: 4, alt: index => relatedSaleFlow(index).map(lines => lines.join('')).join('→') +
    '。購入表・購入明細表は購入番号の抽出へ、購入明細表は同時購入商品の抽出へ、検索した商品コードは検索した商品の削除へ、商品表は関連商品の抽出へ入力される。［b］・［d］と入力した会員 ID は図の削除手順へ入力される。' +
    relatedFlowNotes.map(lines => lines.join('')).join('') },
};
export const legacy2007AutumnPm0105Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as FigureKind[]).map(kind => {
  const { count, alt } = descriptors[kind];
  return {
    profile: profiles[kind], domain: [[0, count - 1]],
    validate(values) { autumn2015PmCase(values, count - 1); },
    alt(values) { return alt(autumn2015PmCase(values, count - 1)); },
  };
});
export function draw(kind: FigureKind, index: number, caption: string) {
  const { count, alt } = descriptors[kind];
  autumn2015PmCase([index], count - 1);
  return { ...figure(profiles[kind], [index], caption, alt(index)), captionPresentation: 'accessible' as const };
}
