import { DataError } from './errors';
import { bookletFigureExtensions } from './booklet-figure-extensions';
export { bookletFigureExtensions };

export type BookletFigureDefinition = {
  readonly profile: string;
  readonly domain: readonly (readonly [number, number])[];
  readonly validate: (values: number[]) => void;
  readonly alt: (values: number[]) => string;
};
export type BookletFigureExtension = {
  readonly scope: string;
  readonly figures: readonly BookletFigureDefinition[];
};

function denseArray(value: unknown): value is unknown[] {
  if (!Array.isArray(value) || Reflect.ownKeys(value).length !== value.length + 1) return false;
  for (let i = 0; i < value.length; i++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, i);
    if (!descriptor || !('value' in descriptor)) return false;
  }
  return true;
}

export function validateBookletFigureExtensions(entries: readonly BookletFigureExtension[]) {
  const scopes = new Set<string>(), profiles = new Set<string>();
  const figures: BookletFigureDefinition[] = [];
  for (const entry of entries) {
    const section = /^20\d{2}-(?:spring|autumn|special)-(am|pm)$/.exec(entry.scope)?.[1];
    if (!section || scopes.has(entry.scope) || !entry.figures.length)
      throw new DataError('FIGURE_PROFILE', '問題集の図登録が空又は重複しています');
    scopes.add(entry.scope);
    const suffixPattern = section === 'am'
      ? /^(?:[1-9]|[1-7]\d|80)-[a-z0-9]+(?:-[a-z0-9]+)*$/
      : /^(?:[1-9]|1[0-3])-[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const prefix = `legacy-${entry.scope}-`;
    for (const figure of entry.figures) {
      if (figure.profile.length > 200 || !figure.profile.startsWith(prefix) || !suffixPattern.test(figure.profile.slice(prefix.length)) || profiles.has(figure.profile) ||
        !denseArray(figure.domain) ||
        figure.domain.some(pair => !denseArray(pair) || pair.length !== 2 || !pair.every(Number.isSafeInteger) || pair[0] > pair[1]) ||
        typeof figure.validate !== 'function' || typeof figure.alt !== 'function')
        throw new DataError('FIGURE_PROFILE', '図と問題集・入力域の対応が不正です');
      profiles.add(figure.profile);
      figures.push(figure);
    }
  }
  return figures;
}
export const additionalBookletFigures = validateBookletFigureExtensions(bookletFigureExtensions);
export const additionalBookletFigureDomains = Object.fromEntries(additionalBookletFigures.map(figure => [figure.profile, figure.domain]));
export function additionalBookletFigure(profile: string) {
  return additionalBookletFigures.find(figure => figure.profile === profile);
}

export function readBookletFigure(figure: BookletFigureDefinition, values: readonly number[]): string {
  if (!denseArray(values) || values.length !== figure.domain.length || values.some((value, i) =>
    !Number.isSafeInteger(value) || value < figure.domain[i][0] || value > figure.domain[i][1]))
    throw new DataError('FIGURE_PROFILE', '図の値が登録された入力域と一致しません');
  figure.validate([...values]);
  const alt = figure.alt([...values]);
  if (typeof alt !== 'string' || !alt.trim()) throw new DataError('FIGURE_PROFILE', '図の代替説明がありません');
  return alt;
}
