import type { Block } from '../types';
import { p, figure } from './definition';
import { spring2016Pm0508Body as body, spring2016Pm0508Choices as choices } from './legacy-2016-spring-pm-05-08-shared';
import { autumn2014Pm0508Banks as banks, autumn2014Pm0508Pages as pages } from './legacy-2014-autumn-pm-05-08-source';

export { body, choices };
export const choiceBank = (id: string) => ({ id: id.slice(1), choices: choices(banks[id]) });
export function selectInput<T>(values: readonly number[], profiles: readonly T[]) {
  const [index] = values;
  if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= profiles.length)
    throw new Error('PARAMETER_CONSTRAINT');
  return profiles[index];
}
export function answerField(id: string, bank: string, value: string | number, options = banks[bank]) {
  const correct = options.indexOf(value);
  if (correct < 0 || options.lastIndexOf(value) !== correct) throw new Error('PARAMETER_CONSTRAINT');
  return { id, bank: bank.slice(1), correct, ...(id === '1' ? { label: '設問1' } : {}) };
}

export function promptPages(first: number, last: number, structure: (id: string) => Block | undefined,
  rewrite: (text: string) => string = text => text): Block[] {
  const blocks: Block[] = [];
  for (let page = first; page <= last; page++) {
    for (const token of pages[page]) {
      if (token.startsWith('#')) continue;
      if (token.startsWith('§')) {
        const block = structure(token.slice(1));
        if (block) blocks.push(block);
      } else {
        const text = rewrite(token);
        blocks.push(text.startsWith('〔') && text.endsWith('〕') ? { type: 'heading', level: 3, text } : p(text));
      }
    }
  }
  return blocks;
}
export const q0508FigureProfile = (id: string) => 'legacy-2014-autumn-pm-' + id.slice(1);
export const q0508Figure = (id: string, values: number[], caption: string, alt: string): Block =>
  id.startsWith('q8-choice-')
    ? { ...figure(q0508FigureProfile(id), values, caption, alt), captionPresentation: 'accessible' } as Block
    : figure(q0508FigureProfile(id), values, caption, alt);
