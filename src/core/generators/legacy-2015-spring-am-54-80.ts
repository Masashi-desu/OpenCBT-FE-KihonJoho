import { field, p, strings, variableNotes, type GenerationDefinition, type GeneratedBody } from './definition';
import { legacy2016AutumnAm4180Definitions } from './legacy-2016-autumn-am-41-80';
import { legacy2017BusinessNativeDefinitions } from './legacy-2017-business';
import { legacy2018ReviewedKnowledgeDefinitions } from './legacy-2018-knowledge-reviewed';
import { legacy2019AutumnRemainingAmDefinitions } from './legacy-2019-autumn-remaining-am';
import { legacy2019StrategyDefinitions } from './legacy-2019-strategy';
import { spring2015Am5480Calculations } from './legacy-2015-spring-am-54-80-calculations';
import { spring2015Am5480Condition } from './legacy-2015-spring-am-54-80-figures';
import { spring2015Am5480Knowledge } from './legacy-2015-spring-am-54-80-knowledge';
import { spring2015Am5480Source } from './legacy-2015-spring-am-54-80-source';

const reviewed = [
  ...legacy2016AutumnAm4180Definitions, ...legacy2017BusinessNativeDefinitions, ...legacy2018ReviewedKnowledgeDefinitions,
  ...legacy2019AutumnRemainingAmDefinitions, ...legacy2019StrategyDefinitions,
];
type Reuse = { canonical: string; cases: number[]; choiceOrder?: number[] };
const reuse: Partial<Record<number, Reuse>> = {
  62: { canonical: '2016h28a-fe-am-63', cases: [0, 1, 2, 3] },
  69: { canonical: '2016h28a-fe-am-67', cases: [0, 1, 2, 3] },
  70: { canonical: '2018h30h-fe-am-70', cases: [0, 1, 2, 3] },
  71: { canonical: '2019r01a-fe-am-69', cases: [0, 1] },
  73: { canonical: '2017h29h-fe-am-73', cases: [0, 1, 2, 3], choiceOrder: [0, 2, 1, 3] },
  75: { canonical: '2019h31h-fe-am-75', cases: [0, 1, 2, 3] },
  77: { canonical: '2018h30h-fe-am-75', cases: [2, 0, 1, 3] },
};

function reuseBody(binding: Reuse, index: number): GeneratedBody {
  const definition = reviewed.find(candidate => candidate.source === binding.canonical);
  if (!definition) throw new Error('GENERATOR_REF');
  const { prompt, choices, correctIndex, explanation } = definition.build([binding.cases[index]]);
  const order = binding.choiceOrder ?? [0, 1, 2, 3];
  if (correctIndex === undefined || !order.includes(correctIndex) ||
    prompt.some(block => block.type !== 'paragraph') ||
    choices.some(option => option.length !== 1 || option[0].type !== 'paragraph')) throw new Error('SOURCE_FORMAT');
  return { prompt, choices: order.map(i => choices[i]), correctIndex: order.indexOf(correctIndex), explanation };
}

export const legacy2015SpringAm5480Definitions: GenerationDefinition[] = Object.entries(spring2015Am5480Source).map(([number, original]) => {
  const n = Number(number);
  const calculation = spring2015Am5480Calculations[n], reused = reuse[n], knowledge = spring2015Am5480Knowledge[n];
  const count = calculation?.count ?? reused?.cases.length ?? (knowledge?.variants.length ?? 0) + 1;
  if (count < 2) throw new Error('GENERATOR_REF');
  const originalBody = (explanation: string): GeneratedBody => ({
    prompt: [p(original.prompt)], choices: strings(original.choices), correctIndex: 'アイウエ'.indexOf(original.key), explanation,
  });
  const notes = calculation?.notes ?? (reused ?
    '先行系列 ' + reused.canonical + ' の同型四択の対象・条件を再利用。基準の原本文・原選択肢・正答・画像・出典を2015春の冊子へ対応付け、他年度の付属資料は引き継がない。' +
      (n === 73 ? ' 旧系列とはイとウの順が異なるため、原の順序へ対応を付け直す。' : '') :
    knowledge.notes);
  return {
    source: '2015h27h-fe-am-' + n, title: original.title, sourceAnswer: original.key, version: '3.2.0',
    fields: [field('対象・条件', 0, count - 1)], reference: [0],
    notes: variableNotes + ' 原資料PDF p.' + original.page + '。' + notes,
    build(values) {
      const index = spring2015Am5480Condition(values, count);
      if (calculation) return calculation.build(index);
      if (reused) {
        const body = reuseBody(reused, index);
        return index === 0 ? originalBody(body.explanation) : body;
      }
      if (index === 0) return originalBody(knowledge.explanation);
      const variant = knowledge.variants[index - 1];
      return { prompt: [p(variant.prompt)], choices: strings(variant.choices ?? original.choices),
        correctIndex: variant.correctIndex, explanation: variant.explanation };
    },
  };
});
