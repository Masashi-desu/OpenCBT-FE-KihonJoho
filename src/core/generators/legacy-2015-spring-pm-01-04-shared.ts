import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, variableNotes, type GeneratedBody } from './definition';
import {
  autumn2015PmAnswers as answers, autumn2015PmBank as bank, autumn2015PmCase as selectCase, autumn2015PmSingle as single,
} from './legacy-2015-autumn-pm-01-04-shared';
export { answers, bank, single };

export function sqlBank(items: readonly string[]) {
  return [p('解答群'), ...items.flatMap((item, i) => [p('アイウエ'[i]), code(item, 'sql')])];
}

export function define(
  number: number,
  title: string,
  sourceAnswer: string,
  input: string,
  count: number,
  publicNotes: string,
  review: string,
  build: (index: number) => GeneratedBody,
  answerVariation?: 'fixed',
): AfternoonBookletDefinition {
  return {
    source: '2015h27h-fe-pm-' + number,
    title, sourceAnswer, version: '3.2.0', fields: [field(input, 0, count - 1)], reference: [0],
    notes: variableNotes + ' ' + review,
    publicNotes,
    ...(answerVariation ? { answerVariation } : {}),
    build(values) { return build(selectCase(values, count - 1)); },
  };
}

export function originalPageAlt(pages: Block[][], firstPhysicalPage: number) {
  return Object.fromEntries(pages.map((blocks, index) => [index + firstPhysicalPage, blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
      case 'code': return block.text;
      case 'diagram': return block.caption + '\n' + block.alt;
      case 'table': return block.caption + '\n' + [block.columns, ...block.rows].map(row => row.join('／')).join('\n');
      default: throw Error('ORIGINAL_PAGE_ALT');
    }
  }).join('\n')]));
}
