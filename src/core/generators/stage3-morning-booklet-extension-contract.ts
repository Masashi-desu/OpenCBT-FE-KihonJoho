import { DataError } from '../errors';
import type { Question } from '../types';
import type { GenerationDefinition } from './definition';
import { morningBookletExtensions } from './stage3-morning-booklet-extensions';

type MorningBooklet = {
  readonly taskId: string;
  readonly definitions: readonly GenerationDefinition[];
  readonly isCommonContext: (question: Question, context: Question['contexts'][number]) => boolean;
};
export type MorningBookletExtension = { readonly scope: string; readonly booklet: MorningBooklet };
type MorningIdentity = {
  collectionId: string;
  year: number;
  officialYear: string;
  period: '春期' | '秋期' | '特別';
};

function identify(scope: string): MorningIdentity {
  const match = /^(20\d{2})-(spring|autumn|special)-am$/.exec(scope);
  if (!match) throw new DataError('GENERATOR_REF', '旧午前の問題集識別子が不正です');
  const year = Number(match[1]);
  const term = match[2];
  if (year < 2001 || year > 2019 || (term === 'special' && year !== 2011))
    throw new DataError('GENERATOR_REF', '旧午前の年度・期が範囲外です');
  const reiwa = year === 2019 && term === 'autumn';
  const era = reiwa ? 'r01' : `h${String(year - 1988).padStart(2, '0')}`;
  const period = term === 'spring' ? '春期' : term === 'autumn' ? '秋期' : '特別';
  const edition = term === 'spring' ? 'h' : term === 'autumn' ? 'a' : 'tokubetsu';
  return { collectionId: `${year}${era}${edition}-fe-am`, year,
    officialYear: reiwa ? '令和元年度' : `平成${year - 1988}年度`, period };
}

export function validateMorningBookletExtensions(entries: readonly MorningBookletExtension[], retainedCollections: readonly string[] = []) {
  const reserved = new Set(retainedCollections);
  const booklets = new Map<string, MorningIdentity & MorningBooklet>();
  for (const { scope, booklet } of entries) {
    const identity = identify(scope);
    const { collectionId } = identity;
    if (reserved.has(collectionId) || booklets.has(collectionId) || !booklet.definitions.length ||
      !/^S3-\d{3}$/.test(booklet.taskId) || typeof booklet.isCommonContext !== 'function')
      throw new DataError('GENERATOR_REF', '旧午前の登録が不正、空又は重複しています');
    const prefix = `${collectionId}-`;
    let previous = 0;
    for (const definition of booklet.definitions) {
      const number = Number(definition.source.slice(prefix.length));
      if (!definition.source.startsWith(prefix) || !Number.isInteger(number) || number <= previous || number > 80 ||
          definition.source !== prefix + number || !definition.notes.trim())
        throw new DataError('GENERATOR_REF', '旧午前の生成器と問題集の対応が不正です');
      previous = number;
    }
    booklets.set(collectionId, { ...identity, ...booklet });
  }
  return booklets;
}

const booklets = validateMorningBookletExtensions(morningBookletExtensions, ['2016h28h-fe-am', '2016h28a-fe-am', '2015h27a-fe-am']);
export const additionalStage3MorningDefinitions = [...booklets.values()].flatMap(booklet => booklet.definitions);
export const additionalStage3MorningBooklet = (collectionId: string) => booklets.get(collectionId);
export function isAdditionalStage3MorningSource(source: string): boolean {
  const match = /^(.+-fe-am)-(?:[1-9]|[1-7]\d|80)$/.exec(source);
  return match !== null && booklets.has(match[1]);
}
export function isAdditionalStage3MorningCommonContext(question: Question, context: Question['contexts'][number]): boolean {
  for (const booklet of booklets.values()) if (booklet.isCommonContext(question, context)) return true;
  return false;
}
