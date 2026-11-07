import type { Block } from '../types';
import { DataError } from '../errors';
import { figure, p } from './definition';
import { autumn2015Pm0508Prose } from './legacy-2015-autumn-pm-05-08-source';

export { spring2016Pm0508Body as autumn2015Pm0508Body, spring2016Pm0508Choices as autumn2015Pm0508Choices } from './legacy-2016-spring-pm-05-08-shared';

export type Autumn2015Pm0508Number = keyof typeof autumn2015Pm0508Prose;
export type Autumn2015Pm0508Structure = Extract<(typeof autumn2015Pm0508Prose)[Autumn2015Pm0508Number][number], readonly ['structure', string]>[1];
export type Autumn2015Pm0508Figure = Extract<Block, { type: 'diagram' }> & { scene: Extract<Extract<Block, {type: 'diagram'}>['scene'], { kind: 'source_figure' }> };

export function autumn2015Pm0508Index(values: readonly number[], length: number): number {
  if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= length)
    throw new DataError('PARAMETER_CONSTRAINT', '問題条件の番号が範囲外です');
  return values[0];
}

export function autumn2015Pm0508Figure(number: Autumn2015Pm0508Number, suffix: string, values: number[], caption: string, alt: string) {
  return figure('legacy-2015-autumn-pm-' + number + '-' + suffix, values, caption, alt) as Autumn2015Pm0508Figure;
}

export const autumn2015Pm0508BlankPattern = /［([a-f]|空欄)］/g;

export function autumn2015Pm0508Prompt(
  number: Autumn2015Pm0508Number,
  values: number[],
  renderStructure: (id: Autumn2015Pm0508Structure) => Block,
  rewrite: (text: string) => string = text => text,
): Block[] {
  return autumn2015Pm0508Prose[number].map(([kind, value], index) => {
    if (kind === 'structure') return renderStructure(value);
    const text = rewrite(value);
    if (/［(?:[a-f]|空欄)］/.test(text))
      return autumn2015Pm0508Figure(number, 'text-' + index, values, '原資料の設問', text);
    if (text.startsWith('〔') && text.endsWith('〕')) return { type: 'heading', level: 3, text };
    return p(text);
  });
}

export const autumn2015PmNumber = (value: number) => value.toLocaleString('ja-JP');
