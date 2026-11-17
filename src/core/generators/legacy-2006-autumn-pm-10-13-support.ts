import type { Block } from '../types';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, figure, variableNotes, type GeneratedBody } from './definition';
import { answerBody, blockText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';

export const languageCases = 4;
const kana = 'アイウエオカキクケコサシスセソ';
type Bank = { section: number; fields: string; options: string[]; keys: string; language?: string; label?: string };
type Page = { page: number; blocks: Block[]; banks?: Bank[]; bankAfter?: number[]; continuesParagraph?: boolean };
type Draft = { pages: Page[]; explanation: string; contexts?: GeneratedBody['contexts'] };

export function page(page: number, blocks: Block[], banks?: Bank[], bankAfter?: number[], continuesParagraph?: boolean): Page {
  return { page, blocks, banks, bankAfter, continuesParagraph };
}
export function bank(section: number, fields: string, options: string[], keys: string, language?: string): Bank {
  return { section, fields, options, keys, language };
}
export function standaloneBank(section: number, options: string[], key: string, language?: string): Bank {
  return { ...bank(section, String(section), options, key, language), label: '解答群' };
}

function bankText(bank: Bank) {
  const names = [...bank.fields].join('，');
  return [bank.label ?? names + 'に関する解答群',
    ...bank.options.map((option, i) => kana[i] + ' ' + option)].join('\n');
}

function originalAlt(pages: readonly Page[]) {
  return Object.fromEntries(pages.map(({ page, blocks, banks = [], bankAfter }) => {
    const texts = banks.map(bankText);
    if (!bankAfter) return [page, [...blocks.map(blockText), ...texts].join('\n\n')];
    if (bankAfter.length !== banks.length || bankAfter.some(index => index < -1 || index >= blocks.length))
      throw Error('SOURCE_FORMAT');
    const after = (index: number) => texts.filter((_, i) => bankAfter[i] === index);
    return [page, [...after(-1), ...blocks.flatMap((block, i) => [blockText(block), ...after(i)])].join('\n\n')];
  }));
}

function buildBody({ pages, contexts, explanation }: Draft, orderedFields: string) {
  const banks = pages.flatMap(page => page.banks ?? []);
  const prompt: Block[] = [];
  for (const { blocks, continuesParagraph } of pages) {
    const first = blocks[0], previous = prompt.at(-1);
    if (continuesParagraph && previous?.type === 'paragraph' && first?.type === 'paragraph') {
      prompt[prompt.length - 1] = { ...previous, text: previous.text + first.text };
      prompt.push(...blocks.slice(1));
    } else prompt.push(...blocks);
  }
  const body = answerBody(prompt, banks.map(bank => {
    const keys = [...bank.keys].map(key => kana.indexOf(key));
    if (bank.options.length !== new Set(bank.options).size || bank.fields.length !== keys.length ||
        keys.some(key => key < 0 || key >= bank.options.length))
      throw Error('ANSWER_CHOICES');
    const names = [...bank.fields];
    return { names, labels: names.map(id => '設問' + bank.section + (/[0-9]/.test(id) ? '' : ' ' + id)),
      options: bank.options, keys, language: bank.language } satisfies AnswerBank;
  }), explanation, contexts);
  const order = [...orderedFields].map(id => 'part-' + id);
  const parts = body.answerParts!, answers = body.partAnswers!;
  if (order.length !== parts.length || order.some(id => !parts.some(part => part.id === id)))
    throw Error('SOURCE_FORMAT');
  parts.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  answers.sort((a, b) => order.indexOf(a.kind === 'choice' ? a.partId : '') - order.indexOf(b.kind === 'choice' ? b.partId : ''));
  return body;
}

export function createLanguageDefinition(number: number, title: string, input: string, fields: string, sourceAnswer: string,
  review: string, draft: (index: number, original: boolean) => Draft, options: Pick<AfternoonBookletDefinition, 'fixedReferenceAssetIds' | 'answerVariation'> = {}) {
  const definition: AfternoonBookletDefinition = {
    source: '2006h18a-fe-pm-' + number, title, sourceAnswer, version: '3.7.0',
    fields: [field(input, 0, languageCases - 1)], reference: [0],
    notes: variableNotes + ' ' + review, publicNotes: review,
    build: values => buildBody(draft(selectCase(values, languageCases), false), fields),
    ...options,
  };
  return { definition, original: () => buildBody(draft(0, true), fields), originalPageAlt: () => originalAlt(draft(0, true).pages) };
}

type Components = { kind:'components'; lists:readonly (readonly [string,readonly (readonly [string,number])[]])[]; alt:string };
type SourceTable = { kind:'table'; columns:string[]; rows:string[][]; codeColumn:number; hideHeadings?:boolean; alt:string };
type ProgramOutput = { kind:'output'; text:string; alt:string };
type Format = { kind:'format'; fields: readonly {text:string;width:number}[]; grouping?:string; alt:string };
type Bits = { kind:'bits'; source:string; target:string; width:number; prefix:number; pattern?:string; replacement?:string; alt:string };
export type LanguagePanel = Components | SourceTable | ProgramOutput | Format | Bits;

export function numbered(language:string,first:number,contents:string) {
  let next=first;
  return code(contents.split('\n').map(text=>text.startsWith('\t')
    ? '     '+text.slice(1) : String(next++).padStart(3)+'  '+text).join('\n'),language);
}

export function languageFigure<T extends LanguagePanel>(number: number, suffix: string, caption: string, build: (index: number) => T) {
  const profile = 'legacy-2006-autumn-pm-' + number + '-' + suffix;
  const domain = [[0, languageCases - 1]] as const;
  const validate = (values: number[]) => { selectCase(values, languageCases); };
  const panel = (values: number[]) => build(selectCase(values, languageCases));
  const alt = (values: number[]) => panel(values).alt;
  const definition = { profile, domain, validate, alt } satisfies BookletFigureDefinition;
  return { ...definition, panel, block: (i: number) => figure(profile, [i], caption, alt([i])) };
}
