import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, variableNotes, type GeneratedBody } from './definition';
import { answerBody, blockText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';

const kana = 'アイウエオカキクケコ';
type Bank = {
  slots: string;
  options: string[];
  keys: string;
  language?: string;
  section?: number;
  heading: string;
};
export type Page = { page: number; blocks: Block[]; banks?: Bank[]; banksBeforeBlocks?: Bank[] };
type LanguageCase = { pages: Page[]; explanation: string; contexts?: GeneratedBody['contexts'] };

export function numbered(lines: readonly string[], spacing: ReadonlySet<number> = new Set()): string {
  return lines.map((line, i) => (spacing.has(i + 1) ? '\n' : '') +
    String(i + 1).padStart(2) + '  ' + line).join('\n');
}

export function bank(slots: string, options: string[], keys: string, language?: string, section?: number, heading?: string): Bank {
  return { slots, options, keys, language, section, heading: heading ?? slots + 'に関する解答群' };
}

function body({ pages, explanation, contexts }: LanguageCase): GeneratedBody {
  const banks = pages.flatMap(page => [...(page.banksBeforeBlocks ?? []), ...(page.banks ?? [])]);
  const output = answerBody(pages.flatMap(page => page.blocks), banks.map(entry => {
    const keys = [...entry.keys].map(key => kana.indexOf(key));
    if (keys.length !== entry.slots.length || new Set(entry.options).size !== entry.options.length ||
        keys.some(index => index < 0 || index >= entry.options.length)) throw Error('ANSWER_CHOICES');
    const names = [...entry.slots];
    const labels = names.map(slot => entry.section ? '設問' + entry.section + (slot === 's' || slot === 't' ? '' : ' ' + slot) : slot);
    return { names, labels, options: entry.options, keys, language: entry.language } satisfies AnswerBank;
  }), explanation, contexts);
  output.answerParts?.sort((first,second)=>first.id.localeCompare(second.id));
  output.partAnswers?.sort((first,second)=>
    first.kind==='choice'&&second.kind==='choice'?first.partId.localeCompare(second.partId):0);
  return output;
}

function originalAlt({ pages }: LanguageCase): Record<number, string> {
  const transcribeBank = (entry: Bank) => [entry.heading,
    ...entry.options.map((text, index) => kana[index] + '　' + text)].join('\n');
  const sections = new Map<number, string[]>();
  for (const { page, blocks, banks = [], banksBeforeBlocks = [] } of pages) {
    const existing = sections.get(page) ?? [];
    existing.push(...banksBeforeBlocks.map(transcribeBank), ...blocks.map(blockText), ...banks.map(transcribeBank));
    sections.set(page, existing);
  }
  return Object.fromEntries([...sections].map(([page, blocks]) => [page, blocks.join('\n\n')]));
}

export function draftQuestion(number: number, title: string, input: string, sourceAnswer: string, review: string,
  draft: (index: number, original: boolean) => LanguageCase, answerVariation?: 'fixed') {
  const reference = draft(0, false);
  const fixedReferenceAssetIds = reference.contexts?.flatMap(context =>
    context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : []));
  const definition: AfternoonBookletDefinition = {
    source: '2004h16a-fe-pm-' + number, title, sourceAnswer, reference: [0], version: '3.7.0',
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
