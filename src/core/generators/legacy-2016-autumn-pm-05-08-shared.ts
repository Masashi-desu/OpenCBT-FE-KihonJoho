import type { Block } from '../types';
import { figure, p, type GeneratedBody } from './definition';

/** Source-group utilities, separate from the application-wide registry. */
export function autumn2016Pm0508Index(values: number[], maximum = 3): number {
  if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > maximum)
    throw Error('PARAMETER_CONSTRAINT');
  return values[0];
}
export const autumn2016Pm0508Figure = (number: number, kind: string, values: number[], caption: string, alt: string) =>
  figure(`legacy-2016-autumn-pm-${number}-${kind}`, values, caption, alt);
export type PmBank = { id: string; choices: Block[][] };
export type PmPart = { id: string; label?: string; bank: string; correct: number };
export function autumn2016Pm0508Body(prompt: Block[], banks: PmBank[], parts: PmPart[], explanation: string): GeneratedBody {
  const offsets = new Map<string, number>(); let offset = 0;
  for (const bank of banks) { if (offsets.has(bank.id) || !bank.choices.length) throw Error('INVALID_BANK'); offsets.set(bank.id, offset); offset += bank.choices.length; }
  return {
    prompt, choices: banks.flatMap(bank => bank.choices), explanation,
    answerParts: parts.map(part => {
      const bank = banks.find(bank => bank.id === part.bank)!;
      if (!bank || part.correct < 0 || part.correct >= bank.choices.length) throw Error('INVALID_PART');
      return { id: 'part-' + part.id, label: part.label ?? part.id,
        choiceIds: bank.choices.map((_, index) => 'choice-value-' + (offsets.get(part.bank)! + index + 1)) };
    }),
    partAnswers: parts.map(part => ({ kind: 'choice', partId: 'part-' + part.id,
      choiceId: 'choice-value-' + (offsets.get(part.bank)! + part.correct + 1) })),
  };
}
export const paragraphChoices = (choices: readonly string[]): Block[][] => choices.map(text => [p(text)]);

/** Source-local native fragments preserve labelled and unlabelled answer boxes.
 * A managed profile identifies the whole paragraph/table; data never supplies JSX. */
export const autumn2016Pm0508HasBlanks = (block: Block) => block.type === 'paragraph'
  ? /［(?:[a-f][1-3]?|空欄)］/.test(block.text)
  : block.type === 'table';
export function autumn2016Pm0508NativeBody(number: number, values: number[], body: GeneratedBody): GeneratedBody {
  const index = autumn2016Pm0508Index(values);
  return { ...body, prompt: body.prompt.map((block, position) => {
    if (!autumn2016Pm0508HasBlanks(block)) return block;
    const caption = block.type === 'table' ? block.caption : '原資料の本文・設問';
    const alt = block.type === 'paragraph' ? block.text : block.type === 'table'
      ? block.caption + '。列：' + block.columns.join('、') + '。' + block.rows.map(row => row.join('、')).join('。') : '';
    return autumn2016Pm0508Figure(number, 'source-fragment-' + (position + 1), [index], caption, alt);
  }) };
}
