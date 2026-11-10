import type { Block } from '../types';
import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import rows from './legacy-2011-autumn-am-01-26-source.json';

export const source = Object.fromEntries(rows.map(row => [row.number, row])) as Record<number, typeof rows[number]>;

export function caseIndex(values: number[], count: number, code: 'PARAMETER_CONSTRAINT' | 'FIGURE_PROFILE') {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
    !Number.isSafeInteger(item.value) || item.value < 0 || item.value >= count) {
    throw new DataError(code, '問題集の査読済み入力域を外れています。');
  }
  return item.value as number;
}

export function define(number: number, condition: string, count: number, review: string,
  build: (index: number) => GeneratedBody, answerFixed = false): GenerationDefinition {
  const { title, sourceKey } = source[number];
  return {
    source: '2011h23a-fe-am-' + number, title, sourceAnswer: sourceKey, version: '3.7.0',
    fields: [field(condition, 0, count - 1)], reference: [0], notes: variableNotes + ' ' + review,
    ...(answerFixed ? { answerVariation: 'fixed' as const } : {}),
    build: values => build(caseIndex(values, count, 'PARAMETER_CONSTRAINT')),
  };
}

export function choiceBody(prompt: string | Block[], choices: readonly (string | number)[], answer: string | number, explanation: string): GeneratedBody {
  const textChoices = choices.map(String);
  const correctIndex = textChoices.indexOf(String(answer));
  if (textChoices.length !== 4 || new Set(textChoices).size !== 4 || correctIndex < 0)
    throw new DataError('PARAMETER_CONSTRAINT', '出題条件と解答群の対応が不正です。');
  return { prompt: typeof prompt === 'string' ? [p(prompt)] : prompt, choices: strings(textChoices), correctIndex, explanation };
}
