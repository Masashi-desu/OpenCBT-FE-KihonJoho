import type { Block, PartAnswer } from '../types';
import { figure, p, type GeneratedBody } from './definition';

type AnswerBank = { id: string; choices: Block[][] };
type AnswerField = { id: string; bank: string; correct: number; label?: string };

export function spring2016Pm0508Profile<T>(values: number[], profiles: readonly T[]): T {
  const [index] = values;
  if (values.length !== 1 || !Number.isInteger(index) || index < 0 || index >= profiles.length)
    throw new Error('PARAMETER_CONSTRAINT');
  return profiles[index];
}

export const spring2016Pm0508Figure = (number: number, kind: string, values: number[], caption: string, alt: string) =>
  figure('legacy-2016-spring-pm-' + number + '-' + kind, values, caption, alt);

export const spring2016Pm0508Choices = (items: readonly (string | number)[]): Block[][] =>
  items.map(item => [p(String(item))]);

export function spring2016Pm0508Body(
  prompt: Block[],
  banks: AnswerBank[],
  fields: AnswerField[],
  explanation: string,
  unorderedPair?: [string, string],
): GeneratedBody {
  const choices: Block[][] = [];
  const idsByBank = new Map<string, string[]>();
  for (const bank of banks) {
    if (idsByBank.has(bank.id) || !bank.choices.length) throw new Error('INVALID_BANK');
    const offset = choices.length;
    choices.push(...bank.choices);
    idsByBank.set(bank.id, bank.choices.map((_, index) => 'choice-value-' + (offset + index + 1)));
  }
  const answerParts = fields.map(field => {
    const choiceIds = idsByBank.get(field.bank);
    if (!choiceIds?.[field.correct]) throw new Error('INVALID_PART');
    return { id: 'part-' + field.id, label: field.label ?? field.id, choiceIds };
  });
  const pairIds = unorderedPair?.map(id => 'part-' + id);
  const partAnswers: PartAnswer[] = [];
  for (const [index, field] of fields.entries()) {
    const part = answerParts[index];
    if (pairIds?.[0] === part.id) {
      const partner = fields.findIndex(item => 'part-' + item.id === pairIds[1]);
      if (partner < 0 || fields[partner].bank !== field.bank) throw new Error('INVALID_UNORDERED_BANK');
      partAnswers.push({ kind: 'unordered', partIds: pairIds,
        choiceIds: [part.choiceIds[field.correct], part.choiceIds[fields[partner].correct]] });
    } else if (pairIds?.[1] !== part.id) {
      partAnswers.push({ kind: 'choice', partId: part.id, choiceId: part.choiceIds[field.correct] });
    }
  }
  return { prompt, choices, answerParts, partAnswers, explanation };
}
