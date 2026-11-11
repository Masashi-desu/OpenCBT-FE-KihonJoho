import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import source from './legacy-2010-spring-am-27-53-source.json';

export type QuestionNumber = 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 |
  41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53;

export const original = <T extends QuestionNumber>(number: T) => source[String(number) as `${T}`];

export function finite2010SpringAm2753(number: QuestionNumber, input: string, count: number, notes: string,
  build: (index: number) => GeneratedBody, fixedAnswer = false): GenerationDefinition {
  const { title, key } = original(number);
  return {
    source: '2010h22h-fe-am-' + number,
    title,
    fields: [field(input, 0, count - 1)],
    reference: [0],
    sourceAnswer: key,
    version: '3.7.0',
    notes: variableNotes + ' ' + notes,
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

export type KnowledgeScenario = { prompt: string; correctIndex: number; explanation: string; choices?: string[] };

export function knowledge2010SpringAm2753(number: QuestionNumber, input: string, notes: string,
  baselineExplanation: string, variants: KnowledgeScenario[], fixedAnswer = false): GenerationDefinition {
  const source = original(number);
  const cases: KnowledgeScenario[] = [
    { prompt: source.prompt, correctIndex: 'アイウエ'.indexOf(source.key), explanation: baselineExplanation },
    ...variants,
  ];
  return finite2010SpringAm2753(number, input, cases.length, notes, index => {
    const { prompt, correctIndex, explanation, choices = source.choices } = cases[index];
    return { prompt: [p(prompt)], choices: strings(choices), correctIndex, explanation };
  }, fixedAnswer);
}

export const grouped = (value: number) => value.toLocaleString('en-US');
