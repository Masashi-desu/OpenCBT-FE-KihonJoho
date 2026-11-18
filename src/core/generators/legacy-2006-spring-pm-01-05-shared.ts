import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, variableNotes, type GeneratedBody } from './definition';
import {
  autumn2015PmAnswers as answers,
  autumn2015PmBank as bank,
  autumn2015PmCase as selectCase,
  autumn2015PmSingle as single,
} from './legacy-2015-autumn-pm-01-04-shared';

export { answers, bank, selectCase, single };
export const caseCount = 4;
export const marks = 'アイウエオカキクケコ';

export function define(
  number: number,
  title: string,
  sourceAnswer: string,
  input: string,
  publicNotes: string,
  review: string,
  build: (index: number) => GeneratedBody,
  options: Pick<AfternoonBookletDefinition, 'answerVariation' | 'fixedReferenceAssetIds'> = {},
): AfternoonBookletDefinition {
  return {
    source: '2006h18h-fe-pm-' + number, title, sourceAnswer, version: '3.6.0',
    fields: [field(input, 0, caseCount - 1)], reference: [0], publicNotes,
    notes: variableNotes + ' ' + review,
    build(values) { return build(selectCase(values, caseCount - 1)); },
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

export function bankBlocks(label: string, options: readonly Block[][]): Block[] {
  return [p(label), ...options.flatMap((option, index) => [p(marks[index]), ...option])];
}

export const sqlChoices = (options: readonly string[]) => options.map(value => [code(value, 'sql')]);
