import { DataError } from '../errors';
import type { GenerationDefinition } from './definition';
import { bookletExtensions } from './afternoon-booklet-extensions';

export type AfternoonBookletDefinition = GenerationDefinition & {
  /** User-facing modification notice, separate from development review notes. */
  readonly publicNotes: string;
  /** Reviewed, fixed language/errata references only; never generated images. */
  readonly fixedReferenceAssetIds?: readonly string[];
};
export type AfternoonBookletExtension = {
  readonly scope: string;
  readonly definitions: readonly AfternoonBookletDefinition[];
};

export function collectionForAfternoonScope(scope: string): string {
  const match = /^(20\d{2})-(spring|autumn|special)-pm$/.exec(scope);
  if (!match) throw new DataError('GENERATOR_REF', '旧午後の問題集識別子が不正です');
  const year = Number(match[1]);
  if (year < 2001 || year > 2019 || (match[2] === 'special' && year !== 2011))
    throw new DataError('GENERATOR_REF', '旧午後の年度が範囲外です');
  const term = ({ spring: 'h', autumn: 'a', special: 'tokubetsu' } as Record<string, string>)[match[2]];
  const era = year === 2019 && match[2] !== 'spring' ? 'r01' : 'h' + String(year - 1988).padStart(2, '0');
  return `${year}${era}${term}-fe-pm`;
}

/** Code-owned registrations may append a reviewed subset. They grant neither
 * catalog admission nor permission to publish any material. */
export function validateAfternoonBookletExtensions(entries: readonly AfternoonBookletExtension[], retainedSources: readonly string[] = []) {
  const scopes = new Set<string>(), sources = new Set<string>(retainedSources);
  const definitions: AfternoonBookletDefinition[] = [];
  for (const entry of entries) {
    const collection = collectionForAfternoonScope(entry.scope);
    if (scopes.has(entry.scope) || !entry.definitions.length)
      throw new DataError('GENERATOR_REF', '旧午後の登録が空又は重複しています');
    scopes.add(entry.scope);
    let previous = 0;
    for (const definition of entry.definitions) {
      const prefix = collection + '-', number = Number(definition.source.slice(prefix.length));
      if (!definition.source.startsWith(prefix) || !Number.isInteger(number) || number <= previous || number > 13 ||
        definition.source !== prefix + number || sources.has(definition.source) || !definition.notes.trim() ||
        typeof definition.publicNotes !== 'string' || !definition.publicNotes.trim())
        throw new DataError('GENERATOR_REF', '旧午後の生成器と問題集の対応が不正です');
      const assets = definition.fixedReferenceAssetIds ?? [];
      if (new Set(assets).size !== assets.length || assets.some(id => !id.startsWith('asset-ipa-' + collection + '-') || !/^[a-z0-9-]+$/.test(id)))
        throw new DataError('SOURCE_MATERIAL', '旧午後の固定資料と問題集が一致しません');
      previous = number;
      sources.add(definition.source);
      definitions.push(definition);
    }
  }
  return definitions;
}

export const additionalAfternoonDefinitions = validateAfternoonBookletExtensions(bookletExtensions);
export const additionalAfternoonPublicNotes: Readonly<Record<string, string>> = Object.fromEntries(
  additionalAfternoonDefinitions.map(definition => [definition.source, definition.publicNotes]),
);
export function additionalAfternoonFixedAssets(source: string): readonly string[] | undefined {
  return additionalAfternoonDefinitions.find(definition => definition.source === source)?.fixedReferenceAssetIds;
}
