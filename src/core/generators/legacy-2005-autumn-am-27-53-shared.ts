import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import source from './legacy-2005-autumn-am-27-53-source.json';

type SourceQuestion = { title: string; prompt: string; choices: string[] };
const records: Record<string, SourceQuestion> = source;
export const original = (number: number) => records[String(number)];

export function finite(number: number, condition: string, sourceAnswer: string, notes: string,
  build: (index: number) => GeneratedBody): GenerationDefinition {
  const { title } = original(number);
  return {
    source: '2005h17a-fe-am-' + number, title, sourceAnswer, reference: [0], version: '3.7.0',
    fields: [field(condition, 0, 3)], notes: variableNotes + ' ' + notes,
    build: values => build(selectCase(values, 4)),
  };
}

type Case = readonly [prompt: string, key: number, explanation: string, choices?: readonly string[]];

export function knowledge(number: number, condition: string, sourceAnswer: string, notes: string,
  explanation: string, cases: readonly [Case, Case, Case], answerVariation?: GenerationDefinition['answerVariation']): GenerationDefinition {
  const source = original(number);
  const variants: readonly Case[] = [[source.prompt, 'アイウエ'.indexOf(sourceAnswer), explanation], ...cases];
  const definition = finite(number, condition, sourceAnswer, notes, index => {
    const [stem, correctIndex, reason, choices = source.choices] = variants[index];
    return { prompt: [p(stem)], choices: strings([...choices]), correctIndex, explanation: reason };
  });
  return { ...definition, ...(answerVariation ? { answerVariation } : {}) };
}
