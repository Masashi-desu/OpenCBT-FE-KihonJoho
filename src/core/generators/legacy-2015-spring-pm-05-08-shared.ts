import type { Block } from '../types';
import { DataError } from '../errors';
import { figure, p } from './definition';
import { spring2015Pm0508Prose } from './legacy-2015-spring-pm-05-08-source';

export { spring2016Pm0508Body as spring2015Pm0508Body, spring2016Pm0508Choices as spring2015Pm0508Choices } from './legacy-2016-spring-pm-05-08-shared';

type Number = keyof typeof spring2015Pm0508Prose;
type Structure = Extract<(typeof spring2015Pm0508Prose)[Number][number], readonly ['structure', string]>[1];
type Diagram = Extract<Block, { type: 'diagram' }>;
export type Spring2015Pm0508Figure = Diagram & { scene: Extract<Diagram['scene'], { kind: 'source_figure' }> };

export function spring2015Pm0508Index(values: readonly number[], length: number): number {
  if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= length)
    throw new DataError('PARAMETER_CONSTRAINT', '問題条件の番号が範囲外です');
  return values[0];
}

export function spring2015Pm0508Figure(number: Number, suffix: string, values: number[], caption: string, alt: string) {
  return figure('legacy-2015-spring-pm-' + number + '-' + suffix, values, caption, alt) as Spring2015Pm0508Figure;
}

export const spring2015Pm0508BlankPattern = /［([a-g]|空欄)］/g;

export function spring2015Pm0508Prompt(
  number: Number,
  values: number[],
  renderStructure: (id: Structure) => Block,
  rewrite: (text: string) => string = text => text,
): Block[] {
  return spring2015Pm0508Prose[number].map(([kind, value], index) => {
    if (kind === 'structure') return renderStructure(value);
    const text = rewrite(value);
    if (/［(?:[a-g]|空欄)］/.test(text)) return spring2015Pm0508Figure(number, 'text-' + index, values, '原資料の設問', text);
    if (text.startsWith('〔') && text.endsWith('〕')) return { type: 'heading', level: 3, text };
    return p(text);
  });
}

export const spring2015PmNumber = (value: number) => value.toLocaleString('ja-JP');
