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
  renderedOptions?: Block[][];
};
export type Page = { page: number; blocks: Block[]; banks?: Bank[]; altPrefix?: string; banksAfter?: number[] };
export type LanguageCase = { pages: Page[]; explanation: string; contexts?: GeneratedBody['contexts'] };

export function bank(slots: string, options: string[], keys: string, language?: string, section?: number, heading?: string): Bank {
  return { slots, options, keys, language, section, heading: heading ?? slots + 'に関する解答群' };
}

export function body({ pages, explanation, contexts }: LanguageCase): GeneratedBody {
  const banks = pages.flatMap(page => page.banks ?? []);
  const output = answerBody(pages.flatMap(page => page.blocks), banks.map(entry => {
    const keys = [...entry.keys].map(key => kana.indexOf(key));
    if (keys.length !== entry.slots.length || new Set(entry.options).size !== entry.options.length ||
        keys.some(index => index < 0 || index >= entry.options.length)) throw Error('ANSWER_CHOICES');
    const names = [...entry.slots];
    const labels = names.map(slot => entry.section ? '設問' + entry.section + (slot === 's' || slot === 't' ? '' : ' ' + slot) : slot);
    return { names, labels, options: entry.options, keys, language: entry.language } satisfies AnswerBank;
  }), explanation, contexts);
  let offset = 0;
  for (const bank of banks) {
    if (bank.renderedOptions) {
      if (bank.renderedOptions.length !== bank.options.length) throw Error('ANSWER_CHOICES');
      output.choices.splice(offset, bank.options.length, ...bank.renderedOptions);
    }
    offset += bank.options.length;
  }
  return output;
}

export function originalAlt({ pages }: LanguageCase): Record<number, string> {
  const transcribeBank = (entry: Bank) => [entry.heading,
    ...entry.options.map((text, index) => kana[index] + '　' + text)].join('\n');
  return Object.fromEntries(pages.map(({ page, blocks, banks = [], altPrefix, banksAfter }) => {
    const text = blocks.map(blockText);
    const banksInOrder = banks.map(transcribeBank);
    const ordered = banksAfter ? text.flatMap((item,i)=>[item,
      ...banksInOrder.filter((_,bankIndex)=>banksAfter[bankIndex]===i+1)]) : [...text, ...banksInOrder];
    return [page, [...(altPrefix ? [altPrefix] : []), ...ordered].join('\n\n')];
  }));
}

export function draftQuestion(number: number, title: string, input: string, sourceAnswer: string, review: string,
  draft: (index: number, original: boolean) => LanguageCase, answerVariation?: 'fixed') {
  const reference = draft(0, false);
  const fixedReferenceAssetIds = reference.contexts?.flatMap(context =>
    context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : []));
  const definition: AfternoonBookletDefinition = {
    source: '2006h18a-fe-pm-' + number, title, sourceAnswer, reference: [0], version: '3.7.0',
    fields: [field(input, 0, 3)], notes: variableNotes + ' ' + review, publicNotes: review,
    build: values => body(draft(selectCase(values, 4), false)),
    ...(answerVariation ? { answerVariation } : {}),
    ...(fixedReferenceAssetIds?.length ? { fixedReferenceAssetIds } : {}),
  };
  return {
    definition,
    original: () => body(draft(0, true)),
    originalPageAlt: () => originalAlt(draft(0, true)),
  };
}
