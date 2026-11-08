import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import rows from './legacy-2014-autumn-am-01-26-source.json';

export const source = Object.fromEntries(rows.map(row => [row.number, row])) as Record<number, typeof rows[number]>;
export const marks = 'アイウエ';

export function define(number: number, label: string, count: number, review: string, build: (i: number) => GeneratedBody): GenerationDefinition {
  const row = source[number];
  return {
    source: '2014h26a-fe-am-' + number, title: row.title, sourceAnswer: row.sourceKey,
    version: '3.2.0', fields: [field(label, 0, count - 1)], reference: [0], notes: variableNotes + ' ' + review,
    build(values) {
      if (!Array.isArray(values) || values.length !== 1 || Reflect.ownKeys(values).length !== 2)
        throw Error('PARAMETER_CONSTRAINT');
      const value = Object.getOwnPropertyDescriptor(values, '0');
      if (!value || !('value' in value) || !Number.isSafeInteger(value.value) || value.value < 0 || value.value >= count)
        throw Error('PARAMETER_CONSTRAINT');
      return build(value.value);
    },
  };
}

export function text(n: number, index: number, prompt: string, correctIndex: number, explanation: string, options = source[n].choices): GeneratedBody {
  return { prompt: [p(index === 0 ? source[n].prompt : prompt)], choices: strings(options), correctIndex, explanation };
}

export function contexts(n: number, label: string, prompts: readonly string[], correct: readonly number[], explanations: readonly string[]) {
  return define(n, label, correct.length, '原の四択と問いの方向を保つ。各出題条件は原の概念又は判定条件に直接対応する。', i =>
    text(n, i, prompts[i], correct[i], explanations[i]));
}

export function numeric(n: number, index: number, prompt: string, answer: number, alternatives: readonly number[], explanation: string,
  format: (value: number) => string = String): GeneratedBody {
  const ordered = [...alternatives].sort((a, b) => a - b).map(format);
  const options = index === 0 ? source[n].choices : ordered;
  const correct = options.indexOf(format(answer));
  if (correct < 0 || new Set(options).size !== 4) throw Error('PARAMETER_CONSTRAINT');
  return text(n,index,prompt,correct,explanation,options);
}
