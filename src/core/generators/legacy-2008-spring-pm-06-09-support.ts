import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, variableNotes, type GeneratedBody } from './definition';
import { answerBody, blockText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';

const kana = 'アイウエオカキク';
export type Bank = {
  slots: string;
  options: string[];
  keys: string;
  language?: string;
  section?: number;
  heading: string;
};
export type Page = { page: number; blocks: Block[]; banks?: Bank[]; altPrefix?: string; firstBanksAfter?: number };
export type LanguageCase = { pages: Page[]; explanation: string; contexts?: GeneratedBody['contexts'] };

export function bank(slots: string, options: string[], keys: string, language?: string, section?: number, heading?: string): Bank {
  return { slots, options, keys, language, section, heading: heading ?? slots + 'に関する解答群' };
}

export function body({ pages, explanation, contexts }: LanguageCase): GeneratedBody {
  return answerBody(pages.flatMap(page => page.blocks), pages.flatMap(page => page.banks ?? []).map(entry => {
    const keys = [...entry.keys].map(key => kana.indexOf(key));
    if (keys.length !== entry.slots.length || new Set(entry.options).size !== entry.options.length ||
        keys.some(index => index < 0 || index >= entry.options.length)) throw Error('ANSWER_CHOICES');
    const names = [...entry.slots];
    const labels = names.map(slot => entry.section ? '設問' + entry.section + ' ' + slot : slot);
    return { names, labels, options: entry.options, keys, language: entry.language } satisfies AnswerBank;
  }), explanation, contexts);
}

export function originalAlt({ pages }: LanguageCase): Record<number, string> {
  const transcribeBank = (entry: Bank) => [entry.heading,
    ...entry.options.map((text, index) => kana[index] + '　' + text)].join('\n');
  return Object.fromEntries(pages.map(({ page, blocks, banks = [], altPrefix, firstBanksAfter }) => {
    const text = blocks.map(blockText);
    const banksInOrder = banks.map(transcribeBank);
    const ordered = firstBanksAfter === undefined ? [...text, ...banksInOrder] : [
      ...text.slice(0, firstBanksAfter), banksInOrder[0], ...text.slice(firstBanksAfter), ...banksInOrder.slice(1),
    ];
    return [page, [...(altPrefix ? [altPrefix] : []), ...ordered].join('\n\n')];
  }));
}

export function draftQuestion(number: number, title: string, input: string, sourceAnswer: string, review: string,
  draft: (index: number, original: boolean) => LanguageCase) {
  const reference = draft(0, false);
  const fixedReferenceAssetIds = reference.contexts?.flatMap(context =>
    context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : []));
  const definition: AfternoonBookletDefinition = {
    source: '2008h20h-fe-pm-' + number, title, sourceAnswer, reference: [0], version: '3.7.0',
    fields: [field(input, 0, 3)], notes: variableNotes + ' ' + review, publicNotes: review,
    build: values => body(draft(selectCase(values, 4), false)),
    ...(fixedReferenceAssetIds?.length ? { fixedReferenceAssetIds } : {}),
  };
  return {
    definition,
    original: () => body(draft(0, true)),
    originalPageAlt: () => originalAlt(draft(0, true)),
  };
}
