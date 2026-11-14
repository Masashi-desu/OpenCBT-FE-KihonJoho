import { DataError } from '../errors';
import type { Block } from '../types';
import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import sourceRows from './legacy-2007-autumn-am-01-26-source.json';

export const source = Object.fromEntries(sourceRows.map(row => [row.number, row])) as Record<number, typeof sourceRows[number]>;

export function finiteIndex(values: number[], count: number, code: 'PARAMETER_CONSTRAINT' | 'FIGURE_PROFILE') {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
      !Number.isSafeInteger(item.value) || item.value < 0 || item.value >= count) {
    throw new DataError(code, '問題集の査読済み入力域を外れています。');
  }
  return item.value as number;
}

export function define(number: number, label: string, count: number, review: string,
  build: (index: number) => GeneratedBody, answerFixed = false): GenerationDefinition {
  const { title, sourceKey } = source[number];
  return {
    source: '2007h19a-fe-am-' + number,
    title,
    fields: [field(label, 0, count - 1)],
    reference: [0],
    sourceAnswer: sourceKey,
    version: '3.7.0',
    notes: variableNotes + ' ' + review,
    ...(answerFixed ? { answerVariation: 'fixed' as const } : {}),
    build: values => build(finiteIndex(values, count, 'PARAMETER_CONSTRAINT')),
  };
}

export function body(prompt: string | Block[], choices: Block[][], correctIndex: number, explanation: string): GeneratedBody {
  if (choices.length !== 4 || new Set(choices.map(choice => JSON.stringify(choice))).size !== 4 ||
      !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= choices.length) {
    throw new DataError('PARAMETER_CONSTRAINT', '出題条件と解答群の対応が不正です。');
  }
  return { prompt: typeof prompt === 'string' ? [p(prompt)] : prompt, choices, correctIndex, explanation };
}

export function textBody(prompt: string | Block[], choices: readonly (number | string)[], correctIndex: number, explanation: string) {
  return body(prompt, strings(choices.map(String)), correctIndex, explanation);
}

export function latex(text: string, alt: string): Block {
  return { type: 'formula', text, alt, format: 'latex' };
}
