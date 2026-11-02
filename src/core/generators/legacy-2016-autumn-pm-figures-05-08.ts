import type { Block } from '../types';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2016Pm0508HasBlanks, autumn2016Pm0508Index } from './legacy-2016-autumn-pm-05-08-shared';
import { autumn2016Pm5ClassAlt, autumn2016Pm5SequenceAlt, autumn2016Pm5RawBody } from './legacy-2016-autumn-pm-5';
import { autumn2016Pm6GraphAlt, autumn2016Pm6RawBody } from './legacy-2016-autumn-pm-6';
import { autumn2016Pm7ForecastAlt, autumn2016Pm7RawBody } from './legacy-2016-autumn-pm-7';
import { autumn2016Pm8ProgramAlt, autumn2016Pm8RawBody } from './legacy-2016-autumn-pm-8';

const descriptions: Record<string, (values: number[]) => string> = {
  'legacy-2016-autumn-pm-5-assets': () => '図1。商品名は全てオブジェクト指向設計。商品コード1、著者試験太郎の2冊を資産管理番号1と2で識別し、商品コード2、著者情報花子の1冊を資産管理番号3で識別する。商品コードと資産管理番号の値にはそれぞれ下線。',
  'legacy-2016-autumn-pm-5-classes': autumn2016Pm5ClassAlt,
  'legacy-2016-autumn-pm-5-sequence': autumn2016Pm5SequenceAlt,
  'legacy-2016-autumn-pm-6-quality-graph': autumn2016Pm6GraphAlt,
  'legacy-2016-autumn-pm-7-forecast': autumn2016Pm7ForecastAlt,
  'legacy-2016-autumn-pm-8-program': () => autumn2016Pm8ProgramAlt(),
  'legacy-2016-autumn-pm-8-detail-program': () => autumn2016Pm8ProgramAlt(true),
};
const rawBodies = [autumn2016Pm5RawBody, autumn2016Pm6RawBody, autumn2016Pm7RawBody, autumn2016Pm8RawBody];
const nativeFragments = new Map<string, { number: number; position: number }>();
for (const [index, build] of rawBodies.entries()) for (const [position, block] of build([0]).prompt.entries()) {
  if (!autumn2016Pm0508HasBlanks(block)) continue;
  const profile = `legacy-2016-autumn-pm-${index + 5}-source-fragment-${position + 1}`;
  nativeFragments.set(profile, { number: index + 5, position });
  descriptions[profile] = values => { const fragment = autumn2016Pm0508NativeFragment(profile, values).block; return fragment.type === 'paragraph' ? fragment.text : fragment.type === 'table' ? fragment.caption + '。列：' + fragment.columns.join('、') + '。' + fragment.rows.map(row => row.join('、')).join('。') : ''; };
}
export function autumn2016Pm0508NativeFragment(profile: string, values: number[]): { number: number; block: Block } {
  autumn2016Pm0508Index(values); const entry = nativeFragments.get(profile); if (!entry) throw Error('PARAMETER_CONSTRAINT');
  return { number: entry.number, block: rawBodies[entry.number - 5](values).prompt[entry.position] };
}
export const autumn2016Pm0508NativeProfiles = [...nativeFragments.keys()];
export const legacy2016AutumnPm0508Figures: BookletFigureDefinition[] = Object.entries(descriptions).map(([profile, describe]) => ({
  profile, domain: [[0, 3]], validate(values) { autumn2016Pm0508Index(values); },
  alt(values) { autumn2016Pm0508Index(values); return describe(values); },
}));
export function autumn2016Pm0508FigureAlt(profile: string, values: number[]) {
  autumn2016Pm0508Index(values);
  if (!Object.hasOwn(descriptions, profile)) throw Error('PARAMETER_CONSTRAINT');
  return descriptions[profile](values);
}
