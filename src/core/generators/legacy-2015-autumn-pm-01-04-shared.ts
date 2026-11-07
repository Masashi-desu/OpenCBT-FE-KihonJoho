import type { Block, PartAnswer } from '../types';
import { p, type GeneratedBody } from './definition';

const marks = 'アイウエオカキクケコ';

export function autumn2015PmCase(values: number[], maximum: number): number {
  if (!Array.isArray(values) || values.length !== 1 || Reflect.ownKeys(values).length !== 2) {
    throw Error('PARAMETER_CONSTRAINT');
  }
  const input = Object.getOwnPropertyDescriptor(values, '0');
  if (!input || !('value' in input) || !Number.isInteger(input.value) || input.value < 0 || input.value > maximum) {
    throw Error('PARAMETER_CONSTRAINT');
  }
  return input.value;
}

export function autumn2015PmBank(label: string, choices: readonly (string | number)[]): Block[] {
  return [p(label), ...choices.map((choice, index) => p(marks[index] + '　' + choice))];
}

type Answer = { ids: readonly string[]; labels: readonly string[]; bank: number; correct: readonly number[] };

export function autumn2015PmAnswers(
  banks: readonly Block[][][],
  answers: readonly Answer[],
): Pick<GeneratedBody, 'choices' | 'answerParts' | 'partAnswers'> {
  const choices: Block[][] = [];
  const choiceIds = banks.map(bank => bank.map(choice => {
    choices.push(choice);
    return 'choice-value-' + choices.length;
  }));
  const answerParts: NonNullable<GeneratedBody['answerParts']> = [];
  const partAnswers: PartAnswer[] = [];
  for (const answer of answers) {
    const ids = answer.ids.map(id => 'part-' + id);
    const group = choiceIds[answer.bank];
    for (const [index, id] of ids.entries()) {
      answerParts.push({ id, label: answer.labels[index], choiceIds: group });
    }
    const correctIds = answer.correct.map(index => group[index]);
    partAnswers.push(ids.length === 1
      ? { kind: 'choice', partId: ids[0], choiceId: correctIds[0] }
      : { kind: 'unordered', partIds: ids, choiceIds: correctIds });
  }
  return { choices, answerParts, partAnswers };
}

export function autumn2015PmSingle(id: string, label: string, bank: number, correct: number): Answer {
  return { ids: [id], labels: [label], bank, correct: [correct] };
}
