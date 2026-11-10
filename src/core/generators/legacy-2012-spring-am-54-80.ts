import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { spring2012Am5480Calculations as calculations } from './legacy-2012-spring-am-54-80-calculations';
import { spring2012Am5480Knowledge as knowledge } from './legacy-2012-spring-am-54-80-knowledge';
import { spring2012Am5480Source as source } from './legacy-2012-spring-am-54-80-source';

export const legacy2012SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const questionNumber = Number(number);
  const modeled = calculations[questionNumber as keyof typeof calculations];
  const reviewed = knowledge[questionNumber];
  const count = modeled?.count ?? reviewed.variants.length + 1;
  return {
    source: '2012h24h-fe-am-' + number,
    title: original.title,
    sourceAnswer: original.key,
    version: '3.7.0',
    fields: [field(modeled?.name ?? '問いの対象・判断条件', 0, count - 1)],
    reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (modeled?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= count)
        throw new DataError('PARAMETER_CONSTRAINT', '2012年度春期旧午前の入力が範囲外です');
      if (modeled) return modeled.build(index);
      const scenario = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return {
        prompt: scenario.prompt.split('\n').map(p),
        choices: strings([...(scenario.choices ?? original.choices)]),
        correctIndex: scenario.correctIndex,
        explanation: scenario.explanation,
      };
    },
  };
});
