import type { Block } from '../types';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, figure, variableNotes, type GeneratedBody } from './definition';
import { answerBody, blockText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';

export const languageCases = 4;
const kana = 'アイウエオカキクケコサシスセソ';
type Bank = { section: number; fields: string; options: string[]; keys: string; language?: string; figures?: Block[]; label?: string };
type Page = { page: number; blocks: Block[]; banks?: Bank[]; bankAfter?: number[]; continuesParagraph?: boolean };
type Draft = { pages: Page[]; explanation: string; contexts?: GeneratedBody['contexts']; unordered?: string };

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

function buildBody({ pages, contexts, explanation, unordered }: Draft, orderedFields: string) {
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
  let offset = 0;
  for (const bank of banks) {
    bank.figures?.forEach((block, i) => { body.choices[offset + i] = [block]; });
    offset += bank.options.length;
  }
  const order = [...orderedFields].map(id => 'part-' + id);
  const parts = body.answerParts!, answers = body.partAnswers!;
  if (order.length !== parts.length || order.some(id => !parts.some(part => part.id === id)))
    throw Error('SOURCE_FORMAT');
  parts.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  answers.sort((a, b) => order.indexOf(a.kind === 'choice' ? a.partId : '') - order.indexOf(b.kind === 'choice' ? b.partId : ''));
  if (unordered) {
    const members = [...unordered].map(id => 'part-' + id);
    const chosen = members.map(id => {
      const answer = answers.find(candidate => candidate.kind === 'choice' && candidate.partId === id);
      if (answer?.kind !== 'choice') throw Error('ANSWER_CHOICES');
      return answer.choiceId;
    });
    body.partAnswers = [...answers.filter(answer => answer.kind !== 'choice' || !members.includes(answer.partId)),
      { kind: 'unordered', partIds: members, choiceIds: chosen }];
  }
  return body;
}

export function createLanguageDefinition(number: number, title: string, input: string, fields: string, sourceAnswer: string,
  review: string, draft: (index: number, original: boolean) => Draft, options: Pick<AfternoonBookletDefinition, 'fixedReferenceAssetIds' | 'answerVariation'> = {}) {
  const definition: AfternoonBookletDefinition = {
    source: '2009h21a-fe-pm-' + number, title, sourceAnswer, version: '3.7.0',
    fields: [field(input, 0, languageCases - 1)], reference: [0],
    notes: variableNotes + ' ' + review, publicNotes: review,
    build: values => buildBody(draft(selectCase(values, languageCases), false), fields),
    ...options,
  };
  return { definition, original: () => buildBody(draft(0, true), fields), originalPageAlt: () => originalAlt(draft(0, true).pages) };
}

type Merge = { row: number; column: number; rowSpan: number; colSpan: number };
export type LanguageTable = { headers: string[]; rows: string[][]; caption?: string; merges?: Merge[]; showHeaders?: boolean };
export type LanguagePanel =
  | { kind: 'tables'; tables: readonly LanguageTable[]; note?: string }
  | { kind: 'output'; text: string; note?: string }
  | { kind: 'bits'; diagram: 'replacement' | 'register' }
  | { kind: 'digits'; digits: string };

function panelAlt(panel: LanguagePanel) {
  switch (panel.kind) {
    case 'tables': return panel.tables.map(table => [table.caption, table.showHeaders === false ? '' : table.headers.join('｜'), ...table.rows.map(row => row.join('｜'))]
      .filter(Boolean).join('\n')).join('\n\n') + (panel.note ? '\n注 ' + panel.note : '');
    case 'digits': return panel.digits + 'の7けた。先頭の' + panel.digits[0]
      + 'は出社可能なら0、出社不可能なら1。続く' + panel.digits.slice(1, 3)
      + 'は先々月ペナルティ順位、' + panel.digits.slice(3, 5)
      + 'は前日までの割当回数、' + panel.digits.slice(5) + 'は経験順位。';
    case 'bits': return panel.diagram === 'replacement'
      ? 'ビット列A：第1語，…，第i語，第（i＋1）語，…，第n語。左端からpビットの直後の網掛け部分が置換え対象で，図では第i語と第（i＋1）語にまたがる。下側のビット列B（qビット）から，置換え対象の両端へ上向きの矢印が延びる。'
      : 'GR0の左端qビットに網掛けでビット列Bを置き，右側の残りは0…0で埋める。';
    case 'output': return panel.text + (panel.note ? '\n注 ' + panel.note : '');

  }
}
export type LanguageFigure = BookletFigureDefinition & { panel: (values: number[]) => LanguagePanel; block: (index: number) => Block };
export function languageFigure(number: number, suffix: string, caption: string, build: (index: number) => LanguagePanel): LanguageFigure {
  const profile = `legacy-2009-autumn-pm-${number}-${suffix}`;
  const domain = [[0, languageCases - 1]] as const;
  const validate = (values: number[]) => { selectCase(values, languageCases); };
  const panel = (values: number[]) => build(selectCase(values, languageCases));
  const alt = (values: number[]) => panelAlt(panel(values));
  return { profile, domain, validate, alt, panel, block: index => figure(profile, [index], caption, alt([index])) };
}
