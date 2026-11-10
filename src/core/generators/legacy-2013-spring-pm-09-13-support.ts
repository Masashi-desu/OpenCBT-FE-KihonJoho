import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, variableNotes, type GeneratedBody } from './definition';
import { answerBody, blockText, choiceBankText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';

export const caseCount = 4;
const kana = 'アイウエオカキクケコ';
export type Bank = {
  slots: readonly (readonly [string, number])[];
  options: string[];
  keys: string;
  language?: string;
};
export type Page = { page: number; blocks: Block[]; banks?: Bank[]; bankAfter?: number[] };
export type Draft = {
  pages: Page[];
  explanation: string;
  contexts?: GeneratedBody['contexts'];
};

export function page(page: number, blocks: Block[], banks?: Bank[], bankAfter?: number[]): Page {
  return { page, blocks, banks, bankAfter };
}

export function bank(section: number, ids: string, options: string[], keys: string, language?: string): Bank {
  return { slots: [...ids].map(id => [id, section]), options, keys, language };
}

const partLabel = ([id, section]: readonly [string, number]) => '設問' + section + (/[0-9]/.test(id) ? '' : ' ' + id);

export function originalAlt(pages: readonly Page[]) {
  return Object.fromEntries(pages.map(({ page, blocks, banks = [], bankAfter }) => {
    const captions = banks.map(({ slots, options }) => /[0-9]/.test(slots[0][0])
      ? choiceBankText('', options).replace('に関する解答群', '解答群')
      : choiceBankText(slots.map(([id]) => id).join('，'), options));
    if (!bankAfter) return [page, [...blocks.map(blockText), ...captions].join('\n\n')];
    if (bankAfter.length !== banks.length || bankAfter.some(index => index < -1 || index >= blocks.length))
      throw Error('SOURCE_FORMAT');
    const choicesAfter = (index: number) => captions.filter((_, i) => bankAfter[i] === index);
    return [page, [...choicesAfter(-1), ...blocks.flatMap((block, i) => [blockText(block), ...choicesAfter(i)])].join('\n\n')];
  }));
}

function buildBody({ pages, contexts, explanation }: Draft, orderedSlots: string) {
  const banks = pages.flatMap(page => page.banks ?? []);
  const body = answerBody(pages.flatMap(page => page.blocks), banks.map(({ slots, options, keys, language }): AnswerBank => {
    const choiceKeys = [...keys].map(key => kana.indexOf(key));
    if (options.length !== new Set(options).size || slots.length !== choiceKeys.length ||
        choiceKeys.some(key => key < 0 || key >= options.length))
      throw Error('ANSWER_CHOICES');
    return { names: slots.map(([id]) => id), labels: slots.map(partLabel), options, keys: choiceKeys, language };
  }), explanation, contexts);
  const order = [...orderedSlots].map(id => 'part-' + id);
  const parts = body.answerParts!, answers = body.partAnswers!;
  if (order.length !== parts.length || order.some(id => !parts.some(part => part.id === id)))
    throw Error('SOURCE_FORMAT');
  parts.sort((left, right) => order.indexOf(left.id) - order.indexOf(right.id));
  answers.sort((left, right) => {
    if (left.kind !== 'choice' || right.kind !== 'choice') throw Error('SOURCE_FORMAT');
    return order.indexOf(left.partId) - order.indexOf(right.partId);
  });
  return body;
}

export function createLanguageDefinition(
  number: number,
  title: string,
  input: string,
  orderedSlots: string,
  sourceAnswer: string,
  review: string,
  draft: (index: number) => Draft,
  fixedReferenceAssetIds?: readonly string[],
) {
  const definition: AfternoonBookletDefinition = {
    source: '2013h25h-fe-pm-' + number,
    title, sourceAnswer, version: '3.7.0',
    fields: [field(input, 0, caseCount - 1)],
    reference: [0],
    notes: variableNotes + ' ' + review,
    publicNotes: review,
    build: values => buildBody(draft(selectCase(values, caseCount)), orderedSlots),
    ...(fixedReferenceAssetIds ? { fixedReferenceAssetIds } : {}),
  };
  return { definition, originalPageAlt: () => originalAlt(draft(0).pages) };
}
