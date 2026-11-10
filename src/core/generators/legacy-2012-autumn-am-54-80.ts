import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { autumn2012Am5480Calculations as calculations } from './legacy-2012-autumn-am-54-80-calculations';
import { autumn2012Am5480Knowledge as knowledge } from './legacy-2012-autumn-am-54-80-knowledge';
import { autumn2012Am5480Source as source } from './legacy-2012-autumn-am-54-80-source';

export const legacy2012AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const n = Number(number), finite = calculations[n as keyof typeof calculations], reviewed = knowledge[n];
  const count = finite?.count ?? reviewed.variants.length + 1;
  return {
    source: '2012h24a-fe-am-' + number, title: original.title, sourceAnswer: original.key, version: '3.7.0',
    fields: [field(finite?.name ?? '問いの対象・判断条件', 0, count - 1)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (finite?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= count)
        throw new DataError('PARAMETER_CONSTRAINT', '2012年度秋期旧午前の入力が範囲外です');
      if (finite) return finite.build(index);
      const scenario = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return {
        prompt: [p(scenario.prompt)], choices: strings([...(scenario.choices ?? original.choices)]),
        correctIndex: scenario.correctIndex, explanation: scenario.explanation,
      };
    },
  };
});
