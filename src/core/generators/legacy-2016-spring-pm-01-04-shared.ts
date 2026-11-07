import type { Block } from '../types';
import { p, type GeneratedBody } from './definition';

export const spring2016PmMarks = 'アイウエオカキクケコ';

export function spring2016PmCase(values: number[], maximum = 3): number {
  if (!Array.isArray(values) || values.length !== 1 || Reflect.ownKeys(values).length !== 2) {
    throw Error('PARAMETER_CONSTRAINT');
  }
  const descriptor = Object.getOwnPropertyDescriptor(values, '0');
  if (!descriptor || !('value' in descriptor) || !Number.isInteger(descriptor.value) ||
    descriptor.value < 0 || descriptor.value > maximum) {
    throw Error('PARAMETER_CONSTRAINT');
  }
  return descriptor.value;
}

export function spring2016PmBank(label: string, choices: readonly string[]): Block[] {
  return [p(label), ...choices.map((choice, index) => p(spring2016PmMarks[index] + '　' + choice))];
}

export function spring2016PmParts(
  groups: readonly (readonly Block[][])[],
  parts: readonly { id: string; label?: string; group: number; correct: number }[],
): Pick<GeneratedBody, 'choices' | 'answerParts' | 'partAnswers'> {
  const choices: Block[][] = [];
  const choiceIds = groups.map(group => group.map(choice => {
    choices.push(choice);
    return 'choice-value-' + choices.length;
  }));
  return {
    choices,
    answerParts: parts.map(part => ({
      id: 'part-' + part.id, label: part.label ?? part.id, choiceIds: choiceIds[part.group],
    })),
    partAnswers: parts.map(part => ({
      kind: 'choice', partId: 'part-' + part.id, choiceId: choiceIds[part.group][part.correct],
    })),
  };
}
