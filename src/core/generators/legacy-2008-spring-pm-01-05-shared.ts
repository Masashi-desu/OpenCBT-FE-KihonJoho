import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, variableNotes, type GeneratedBody } from './definition';
import { autumn2015PmAnswers, autumn2015PmBank, autumn2015PmCase, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';

export { autumn2015PmAnswers as answers, autumn2015PmBank as bank, autumn2015PmSingle as single };
export const marks = 'アイウエオカキクケコ';
export function define(number: number, title: string, sourceAnswer: string, input: string, publicNotes: string,
  review: string, build: (index: number) => GeneratedBody,
  options: Pick<AfternoonBookletDefinition, 'answerVariation' | 'fixedReferenceAssetIds'> = {},
): AfternoonBookletDefinition {
  return {
    source: '2008h20h-fe-pm-' + number, title, sourceAnswer, version: '3.2.0',
    fields: [field(input, 0, 3)], reference: [0], publicNotes, notes: variableNotes + ' ' + review,
    build(values) { return build(autumn2015PmCase(values, 3)); },
    ...options,
  };
}

export function pageAlt(pages: readonly Block[][], first: number): Record<number, string> {
  return Object.fromEntries(pages.map((blocks, index) => [first + index, blocks.map(block => {
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'code') return block.text;
    if (block.type === 'formula') return block.alt;
    if (block.type === 'diagram') return block.caption + '\n' + block.alt;
    if (block.type === 'table') return block.caption + '\n' + [block.columns, ...block.rows].map(row => row.join('｜')).join('\n');
    throw Error('ORIGINAL_PAGE_ALT');
  }).join('\n')]));
}

export const format = (value: number) => value.toLocaleString('en-US');
export function bankBlocks(label: string, options: readonly Block[][]): Block[] {
  return [p(label), ...options.flatMap((option, index) => [p(marks[index]), ...option])];
}
