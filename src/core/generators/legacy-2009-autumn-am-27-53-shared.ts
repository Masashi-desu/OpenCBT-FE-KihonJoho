import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import source from './legacy-2009-autumn-am-27-53-source.json';

type SourceQuestion = { page: number; key: string; title: string; prompt: string; choices: string[]; detail?: string };
const sourceQuestions: Record<string, SourceQuestion> = source;
export const original = (number: number): SourceQuestion => sourceQuestions[String(number)];

export function finite(number: number, condition: string, count: number, review: string,
  build: (index: number) => GeneratedBody, fixedAnswer = false): GenerationDefinition {
  const { title, key } = original(number);
  return {
    source: '2009h21a-fe-am-' + number,
    title,
    fields: [field(condition, 0, count - 1)],
    reference: [0],
    sourceAnswer: key,
    version: '3.7.0',
    notes: variableNotes + ' ' + review,
    ...(fixedAnswer ? { answerVariation: 'fixed' as const } : {}),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= count) {
        throw new DataError('PARAMETER_CONSTRAINT', '指定条件が候補の範囲外です。');
      }
      return build(index);
    },
  };
}

type KnowledgeCase = readonly [prompt: string, answer: number, explanation: string, choices?: readonly string[]];
export function knowledge(number: number, condition: string, review: string, originalExplanation: string,
  variations: readonly KnowledgeCase[], fixedAnswer = false) {
  const source = original(number);
  const cases: readonly KnowledgeCase[] = [
    [source.prompt, 'アイウエ'.indexOf(source.key), originalExplanation],
    ...variations,
  ];
  return finite(number, condition, cases.length, review, index => {
    const [prompt, correctIndex, explanation, choices = source.choices] = cases[index];
    return { prompt: [p(prompt)], choices: strings([...choices]), correctIndex, explanation };
  }, fixedAnswer);
}
