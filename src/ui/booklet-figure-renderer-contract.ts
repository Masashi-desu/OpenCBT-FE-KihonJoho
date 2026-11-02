import type { ComponentType } from 'react';
import { DataError } from '../core/errors';
import { additionalBookletFigures, type BookletFigureExtension } from '../core/booklet-figure-extension-contract';
import { bookletFigureRenderers } from './booklet-figure-renderers';

export type BookletFigureProps = { values: number[]; caption: string };
export type BookletFigureRenderer = { readonly profile: string; readonly component: ComponentType<BookletFigureProps> };
export type BookletFigureRendererExtension = { readonly scope: string; readonly renderers: readonly BookletFigureRenderer[] };

/** The render inventory and semantic inventory must be a bijection, rather
 * than accepting a registered profile with no display or an unvalidated view. */
export function validateBookletFigureRenderers(entries: readonly BookletFigureRendererExtension[], figures: readonly Pick<BookletFigureExtension, 'scope' | 'figures'>[]) {
  const expected = figures.flatMap(entry => entry.figures.map(figure => ({ scope: entry.scope, profile: figure.profile })));
  const renderers: BookletFigureRenderer[] = [], seen = new Set<string>(), scopes = new Set<string>();
  for (const entry of entries) {
    if (scopes.has(entry.scope) || !entry.renderers.length) throw new DataError('FIGURE_PROFILE', '図の描画登録が空又は重複しています');
    scopes.add(entry.scope);
    for (const renderer of entry.renderers) {
      if (seen.has(renderer.profile) || !expected.some(figure => figure.scope === entry.scope && figure.profile === renderer.profile) || typeof renderer.component !== 'function')
        throw new DataError('FIGURE_PROFILE', '図の描画と意味の登録が一致しません');
      seen.add(renderer.profile);
      renderers.push(renderer);
    }
  }
  if (seen.size !== expected.length || expected.some(figure => !seen.has(figure.profile)))
    throw new DataError('FIGURE_PROFILE', '図に対応する描画登録がありません');
  return renderers;
}

// Reconstruct ownership from the profile namespace, checked by the core gate.
const grouped = new Map<string, typeof additionalBookletFigures>();
for (const figure of additionalBookletFigures) {
  const scope = figure.profile.match(/^legacy-(20\d{2}-(?:spring|autumn|special)-pm)-/)![1];
  grouped.set(scope, [...(grouped.get(scope) ?? []), figure]);
}
const renderers = validateBookletFigureRenderers(bookletFigureRenderers, [...grouped].map(([scope, figures]) => ({ scope, figures })));
export function bookletFigureComponent(profile: string) {
  return renderers.find(renderer => renderer.profile === profile)?.component;
}
