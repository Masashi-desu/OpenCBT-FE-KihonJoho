import type { Block } from '../types';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, figure, variableNotes, type GeneratedBody } from './definition';
import { answerBody, blockText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';

export const autumnLanguageCases = 4;
const kana = 'アイウエオカキクケコサシスセソ';
export type Bank = {
  section: number;
  blanks: string;
  options: readonly string[];
  keys: string;
  language?: string;
  ownLabel?: string;
  format?: (value: string) => Block[];
};
type SourcePage = { physical: number; blocks: Block[]; banks?: readonly Bank[]; bankAfter?: number };
type PageDraft = { pages: SourcePage[]; explanation: string; contexts?: GeneratedBody['contexts'] };

export function bank(section: number, blanks: string, options: readonly string[], keys: string, language?: string): Bank {
  return { section, blanks, options, keys, language };
}
export function page(physical: number, blocks: Block[], banks?: readonly Bank[], bankAfter?: number): SourcePage {
  return { physical, blocks, banks, bankAfter };
}
function readBank(bank: Bank): string {
  return [bank.ownLabel ?? [...bank.blanks].join('，') + 'に関する解答群',
    ...bank.options.map((option, index) => kana[index] + ' ' + option)].join('\n');
}

function originalAlt(pages: readonly SourcePage[]) {
  const result: Record<number, string> = {};
  for (const { physical, blocks, banks = [], bankAfter } of pages) {
    const texts = blocks.map(blockText);
    texts.splice(bankAfter ?? texts.length, 0, ...banks.map(readBank));
    result[physical] = [result[physical], ...texts].filter(Boolean).join('\n\n');
  }
  return result;
}

function body(draft: PageDraft, ordered: string): GeneratedBody {
  const banks = draft.pages.flatMap(page => page.banks ?? []);
  const generated = answerBody(draft.pages.flatMap(page => page.blocks), banks.map(b => {
    const names = [...b.blanks];
    const keys = [...b.keys].map(key => kana.indexOf(key));
    if (b.options.length !== new Set(b.options).size || keys.length !== names.length ||
      keys.some(key => key < 0 || key >= b.options.length))
      throw Error('解答群と正答の対応を確認してください');
    return { names, labels: names.map(name => [b.section ? '設問' + b.section : '設問', /[a-z]/.test(name) ? name : ''].filter(Boolean).join(' ')),
      options: [...b.options], keys, language: b.language } satisfies AnswerBank;
  }), draft.explanation, draft.contexts);
  let offset = 0;
  for (const bank of banks) {
    const format = bank.format;
    if (format) bank.options.forEach((value, index) => { generated.choices[offset + index] = format(value); });
    offset += bank.options.length;
  }
  const expected = [...ordered].map(id => 'part-' + id);
  const parts = generated.answerParts!, answers = generated.partAnswers!;
  if (expected.length !== parts.length || expected.some(id => !parts.some(part => part.id === id)))
    throw Error('解答欄の順序を確認してください');
  parts.sort((a, b) => expected.indexOf(a.id) - expected.indexOf(b.id));
  answers.sort((a, b) => expected.indexOf(a.kind === 'choice' ? a.partId : '') - expected.indexOf(b.kind === 'choice' ? b.partId : ''));
  return generated;
}

export function autumnLanguageQuestion(
  number: number, title: string, input: string, ordered: string, sourceAnswer: string,
  review: string, draft: (index: number, original: boolean) => PageDraft,
  options: Pick<AfternoonBookletDefinition, 'fixedReferenceAssetIds' | 'answerVariation'> = {},
) {
  const definition: AfternoonBookletDefinition = {
    source: '2005h17a-fe-pm-' + number, title, sourceAnswer, version: '3.7.0',
    fields: [field(input, 0, autumnLanguageCases - 1)], reference: [0],
    notes: variableNotes + ' ' + review, publicNotes: review,
    build: values => body(draft(selectCase(values, autumnLanguageCases), false), ordered),
    ...options,
  };
  return { definition, original: () => body(draft(0, true), ordered), originalPageAlt: () => originalAlt(draft(0, true).pages) };
}

export function numbered(language: string, first: number, text: string) {
  let next = first;
  return code(text.split('\n').map(line => line.startsWith('\t')
    ? '     ' + line.slice(1) : String(next++).padStart(3) + '  ' + line).join('\n'), language);
}

export function autumnLanguageFigure<T extends { alt: string }>(
  number: number, suffix: string, caption: string, build: (index: number) => T,
) {
  const profile = 'legacy-2005-autumn-pm-' + number + '-' + suffix;
  const domain = [[0, autumnLanguageCases - 1]] as const;
  const validate = (values: number[]) => { selectCase(values, autumnLanguageCases); };
  const panel = (values: number[]) => build(selectCase(values, autumnLanguageCases));
  const alt = (values: number[]) => panel(values).alt;
  const definition = { profile, domain, validate, alt } satisfies BookletFigureDefinition;
  return { ...definition, panel, block: (index: number) => figure(profile, [index], caption, alt([index])) };
}

export function changeTableFigure(number: number, rows: (index: number) => [string, string][]) {
  return autumnLanguageFigure(number, 'program-changes', 'プログラムの変更内容', index => {
    const cells = rows(index);
    return { rows: cells, alt: ['処置｜プログラムの変更内容', ...cells.map(row => row.join('｜'))].join('\n') };
  });
}
