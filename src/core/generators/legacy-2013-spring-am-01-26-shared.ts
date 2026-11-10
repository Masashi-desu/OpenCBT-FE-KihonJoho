import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import rows from './legacy-2013-spring-am-01-26-source.json';

export const source = Object.fromEntries(rows.map(row => [row.number, row])) as Record<number, typeof rows[number]>;
export const marks = 'アイウエ';

export function validIndex(values: number[], count: number, error: string): number {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
    !Number.isSafeInteger(item.value) || item.value < 0 || item.value >= count)
    throw Error(error);
  return item.value;
}

export function define(number: number, condition: string, count: number, review: string,
  build: (index: number) => GeneratedBody, answerFixed = false): GenerationDefinition {
  const { title, sourceKey } = source[number];
  return {
    source: '2013h25h-fe-am-' + number, title, sourceAnswer: sourceKey, version: '3.7.0',
    fields: [field(condition, 0, count - 1)], reference: [0], notes: variableNotes + ' ' + review,
    ...(answerFixed ? { answerVariation: 'fixed' as const } : {}),
    build: values => build(validIndex(values, count, 'PARAMETER_CONSTRAINT')),
  };
}

export function textBody(prompt: string, choices: readonly string[], correctIndex: number, explanation: string): GeneratedBody {
  return { prompt: [p(prompt)], choices: strings([...choices]), correctIndex, explanation };
}

type KnowledgeCase = { prompt: string; correctIndex: number; explanation: string; choices?: string[] };
export function knowledge(number: number, condition: string, review: string,
  referenceExplanation: string, variants: readonly KnowledgeCase[]): GenerationDefinition {
  const row = source[number];
  const cases = [{ prompt: row.prompt, correctIndex: marks.indexOf(row.sourceKey), explanation: referenceExplanation }, ...variants];
  return define(number, condition, cases.length, review, index => {
    const item = cases[index];
    return textBody(item.prompt, item.choices ?? row.choices, item.correctIndex, item.explanation);
  });
}
