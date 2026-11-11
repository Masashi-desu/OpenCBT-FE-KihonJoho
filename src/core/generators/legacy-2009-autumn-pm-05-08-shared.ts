import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, variableNotes, type GeneratedBody } from './definition';
import { autumn2015PmAnswers, autumn2015PmCase, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';

export const collection = '2009h21a-fe-pm';
export const cases = 4;
export const keys = { 5: 'アエカカアイオ', 6: 'オエウアエア', 7: 'アアアアウイイ', 8: 'イイエイエ' } as const;
export type Major = keyof typeof keys;
type Option = string | Block;
export type Banks = readonly (readonly Option[])[];
type BankMarker = { bank: number; heading: string };
export type Page = readonly [number, readonly (Block | BankMarker)[]];
export const bankAt = (bank: number, heading: string): BankMarker => ({ bank, heading });
export const indexOfCase = (values: number[]) => autumn2015PmCase(values, cases - 1);

export function pairedAnswers(banks: Banks, mapping: readonly number[], positions: readonly number[], unordered = false) {
  const content = banks.map(bank => bank.map(option => [typeof option === 'string' ? p(option) : option]));
  const parts = mapping.map((bank, i) => {
    const label = String.fromCharCode(97 + i);
    return autumn2015PmSingle(label, label, bank, positions[i]);
  });
  if (!unordered) return autumn2015PmAnswers(content, parts);
  const [f, g] = parts.slice(5);
  return autumn2015PmAnswers(content, [...parts.slice(0, 5),
    { ids: [...f.ids, ...g.ids], labels: [...f.labels, ...g.labels], bank: f.bank, correct: [...f.correct, ...g.correct] }]);
}

export function readPrompt(pages: readonly Page[]): Block[] {
  return pages.flatMap(([, entries]) => entries.filter((entry): entry is Block => !('bank' in entry)));
}

function readBlock(block: Block): string {
  switch (block.type) {
    case 'paragraph': case 'code': return block.text;
    case 'list': return block.items.join('。');
    case 'diagram': return block.caption + '。' + block.alt;
    case 'table': return block.caption + '。' + block.columns.join('，') + '。' + block.rows.map(row => row.join('，')).join('。');
    default: throw Error('SOURCE_FORMAT');
  }
}

export function pageAlt(pages: readonly Page[], banks: Banks) {
  return Object.fromEntries(pages.map(([number, entries]) => [number, entries.map(entry =>
    'bank' in entry
      ? entry.heading + '。' + banks[entry.bank].map((option, i) =>
        'アイウエオカキクケコ'[i] + '　' + (typeof option === 'string' ? option : readBlock(option))).join('。')
      : readBlock(entry),
  ).join('\n')]));
}

export function common(major: Major, title: string, condition: string, notes: string, publicNotes: string, build: (values: number[]) => GeneratedBody): AfternoonBookletDefinition {
  return {
    source: collection + '-' + major, title, sourceAnswer: Array.from(keys[major]).join('／'),
    reference: [0], version: '3.7.0', fields: [field(condition, 0, cases - 1)],
    notes: variableNotes + ' ' + notes, publicNotes, build,
  };
}

export const pseudoPages = [3, 4] as const;
export const pseudoAssets = pseudoPages.map(page => 'asset-ipa-' + collection + '-p' + String(page).padStart(3, '0'));
export function pseudoReference(): NonNullable<GeneratedBody['contexts']>[number] {
  const title = '共通に使用される擬似言語の記述形式';
  return {
    title, presentation: 'text_figure',
    blocks: pseudoPages.map((page, i) => ({ type: 'image', assetId: pseudoAssets[i],
      caption: title + '（印刷p.' + page + '／PDF p.' + page + '）' })),
  };
}
