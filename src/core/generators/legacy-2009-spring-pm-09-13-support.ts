import type { Block } from '../types';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, figure, variableNotes, type GeneratedBody } from './definition';
import { answerBody, blockText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';

export const languageCases = 4;
const kana = 'アイウエオカキクケコサシスセソ';
type Bank = { section: number; fields: string; options: string[]; keys: string; language?: string; label?: string };
type Page = { page: number; blocks: Block[]; banks?: Bank[]; bankAfter?: number[] };
type Draft = { pages: Page[]; explanation: string; contexts?: GeneratedBody['contexts'] };

export function page(page: number, blocks: Block[], banks?: Bank[], bankAfter?: number[]): Page {
  return { page, blocks, banks, bankAfter };
}
export function bank(section: number, fields: string, options: string[], keys: string, language?: string): Bank {
  return { section, fields, options, keys, language };
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
  const prompt = pages.flatMap(page => page.blocks);
  const body = answerBody(prompt, banks.map(bank => {
    const keys = [...bank.keys].map(key => kana.indexOf(key));
    if (bank.options.length !== new Set(bank.options).size || bank.fields.length !== keys.length ||
        keys.some(key => key < 0 || key >= bank.options.length))
      throw Error('ANSWER_CHOICES');
    const names = [...bank.fields];
    return { names, labels: names.map(id => '設問' + (bank.section || '') + ' ' + id),
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
    source: '2009h21h-fe-pm-' + number, title, sourceAnswer, version: '3.7.0',
    fields: [field(input, 0, languageCases - 1)], reference: [0],
    notes: variableNotes + ' ' + review, publicNotes: review,
    build: values => buildBody(draft(selectCase(values, languageCases), false), fields),
    ...options,
  };
  return { definition, original: () => buildBody(draft(0, true), fields), originalPageAlt: () => originalAlt(draft(0, true).pages) };
}

export type LanguageTable = {
  headers: string[]; rows: string[][]; codeColumns?: number[]; rowHeaders?: boolean;
  shaded?: readonly (readonly [number, number])[];
};
export type LanguagePanel =
  | { kind: 'tables'; tables: readonly LanguageTable[]; note?: string }
  | { kind: 'output'; text: string; note?: string }
  | { kind: 'gap'; rows: readonly { label: string; before: string; after: string; gap: number }[]; mark?: number; mode: 'overview' | 'insert' | 'delete' | 'cursor' }
  | { kind: 'tree'; nodes: readonly { label: string; x: number; y: number; kind: 'directory' | 'file'; parent?: number }[] };

function panelAlt(panel: LanguagePanel) {
  switch (panel.kind) {
    case 'tables': return panel.tables.map(table => [table.headers.join('｜'), ...table.rows.map(row => row.join('｜'))]
      .filter(Boolean).join('\n')).join('\n\n') + (panel.note ? '\n注 ' + panel.note : '');
    case 'gap': return panel.rows.map(row => row.label + '：'
      + (row.gap > 0 ? row.before + '［網掛けのギャップ］' + row.after : row.before + row.after)).join('。')
      + (panel.mark === undefined ? '' : '。オフセット' + panel.mark + 'の位置に'
        + (panel.mode === 'cursor' ? 'カーソル' : 'gapOffsetの指示') + 'がある。');
    case 'tree': return '凡例：楕円はディレクトリ，四角形はファイル。/はルートディレクトリ。\n'
      + panel.nodes.slice(1).map(node => panel.nodes[node.parent!].label + 'の直下に'
        + (node.kind === 'directory' ? 'ディレクトリ' : 'ファイル') + node.label).join('。') + '。';
    case 'output': return panel.text + (panel.note ? '\n注 ' + panel.note : '');

  }
}
export type LanguageFigure = BookletFigureDefinition & { panel: (values: number[]) => LanguagePanel; block: (index: number, captionOverride?: string) => Block };
export function languageFigure(number: number, suffix: string, caption: string, build: (index: number) => LanguagePanel): LanguageFigure {
  const profile = `legacy-2009-spring-pm-${number}-${suffix}`;
  const domain = [[0, languageCases - 1]] as const;
  const validate = (values: number[]) => { selectCase(values, languageCases); };
  const panel = (values: number[]) => build(selectCase(values, languageCases));
  const alt = (values: number[]) => panelAlt(panel(values));
  return { profile, domain, validate, alt, panel, block: (index, captionOverride = caption) => figure(profile, [index], captionOverride, alt([index])) };
}
