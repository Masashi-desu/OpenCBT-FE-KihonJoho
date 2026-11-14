import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import source from './legacy-2007-autumn-am-27-53-source.json';

type SourceQuestion = { page: number; key: string; title: string; prompt: string; choices: string[]; detail?: string };
const records: Record<string, SourceQuestion> = source;
export const original = (number: number) => records[String(number)];

export function finite(number: number, condition: string, notes: string, build: (index: number) => GeneratedBody): GenerationDefinition {
  const { title, key } = original(number);
  return {
    source: '2007h19a-fe-am-' + number, title, sourceAnswer: key, reference: [0], version: '3.7.0',
    fields: [field(condition, 0, 3)], notes: variableNotes + ' ' + notes,
    build: values => build(selectCase(values, 4)),
  };
}

type Case = readonly [prompt: string, index: number, explanation: string, options?: readonly string[]];
export function knowledge(number: number, condition: string, notes: string, explanation: string, cases: readonly Case[]) {
  const source = original(number);
  const variants: readonly Case[] = [[source.prompt, 'アイウエ'.indexOf(source.key), explanation], ...cases];
  return finite(number, condition, notes, index => {
    const [stem, correctIndex, explanation, options = source.choices] = variants[index];
    return { prompt: [p(stem)], choices: strings([...options]), correctIndex, explanation };
  });
}
