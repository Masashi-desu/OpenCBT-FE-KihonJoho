import type { Block } from '../types';
import { figure, p, table } from './definition';
import { autumn2015PmAnswers, autumn2015PmCase, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { q0508FigureAlt, spring2014Pm0508Captions } from './legacy-2014-spring-pm-05-08-alt';
import { spring2014Pm0508Banks, spring2014Pm0508Pages } from './legacy-2014-spring-pm-05-08-source';
import {
  q5Add, q5Interface, q6Functions, q6Productivity, q7WorkTable, q8AllocTable, q8FreeTable,
} from './legacy-2014-spring-pm-05-08-model';

export const q0508Case = (values: number[]) => autumn2015PmCase(values, 2);
export const q0508FigureProfile = (id: string) => 'legacy-2014-spring-pm-' + id.slice(1);
export function q0508Figure(id: string, values: number[]) {
  return figure(q0508FigureProfile(id), values, spring2014Pm0508Captions[id], q0508FigureAlt(id, values));
}

export function q0508Prompt(from: number, to: number, input: number, change: (line: string, page: number) => string = line => line) {
  const tables = {
    'q5-add': q5Add, 'q5-interface': q5Interface, 'q6-functions': q6Functions(input), 'q6-productivity': q6Productivity,
    'q7-work': q7WorkTable(input), 'q8-alloc-table': q8AllocTable, 'q8-free-table': q8FreeTable(input),
  };
  const blocks: Block[] = [];
  for (let page = from; page <= to; page++) {
    for (const line of spring2014Pm0508Pages[page]) {
      if (line.startsWith('#')) continue;
      if (line.startsWith('§')) {
        const id = line.slice(1), entry = tables[id as keyof typeof tables];
        blocks.push(entry ? table(entry.caption, entry.columns, entry.rows) : q0508Figure(id, [input]));
      } else {
        const text = change(line, page);
        if (text) blocks.push(p(text));
      }
    }
  }
  return blocks;
}

type Bank = string | readonly string[] | Block[][];
export function q0508Answers(banks: Bank[], letters: string, mapping: readonly number[], keys: readonly number[],
  unordered?: { bank: number; correct: readonly number[] }) {
  const choices = banks.map(bank => {
    const values = typeof bank === 'string' ? spring2014Pm0508Banks[bank] : bank;
    return values.map(value => typeof value === 'string' ? [p(value)] : value);
  });
  const answers = [...letters].map((letter, i) => autumn2015PmSingle(letter, letter, mapping[i], keys[i]));
  if (unordered) answers.push({ ids: ['s3-1', 's3-2'], labels: ['設問3（1つ目）', '設問3（2つ目）'], ...unordered });
  return autumn2015PmAnswers(choices, answers);
}
