import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, variableNotes, type GeneratedBody } from './definition';
import { autumn2015PmAnswers, autumn2015PmBank, autumn2015PmCase, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';

export { autumn2015PmAnswers as answers, autumn2015PmBank as bank, autumn2015PmSingle as single };
export const marks = 'アイウエオカキクケコ';

export function define(
  number: number, title: string, sourceAnswer: string, input: string, count: number, publicNotes: string,
  review: string, build: (index: number) => GeneratedBody,
): AfternoonBookletDefinition {
  return {
    source: '2013h25a-fe-pm-' + number, title, sourceAnswer, version: '3.2.0',
    fields: [field(input, 0, count - 1)], reference: [0], publicNotes, notes: variableNotes + ' ' + review,
    build(values) { return build(autumn2015PmCase(values, count - 1)); },
  };
}

export function table(caption: string, columns: readonly string[], rows: readonly (readonly (string | number)[])[]): Block {
  return { type: 'table', caption, columns: [...columns], rows: rows.map(row => row.map(String)) };
}

export function code(language: string, text: string): Block {
  return { type: 'code', language, text };
}

export function pageAlt(pages: readonly Block[][], first: number): Record<number, string> {
  return Object.fromEntries(pages.map((blocks, index) => [first + index, blocks.map(block => {
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'code') return block.text;
    if (block.type === 'diagram') return block.caption + '\n' + block.alt;
    if (block.type === 'table') return block.caption + '\n' + [block.columns, ...block.rows].map(row => row.join('｜')).join('\n');
    throw Error('ORIGINAL_PAGE_ALT');
  }).join('\n')]));
}

export function choicesInOrder(title: string, captions: string[], blocks: Block[]) {
  return [p(title), ...blocks.flatMap((block, i) => [p(captions[i]), block])];
}
