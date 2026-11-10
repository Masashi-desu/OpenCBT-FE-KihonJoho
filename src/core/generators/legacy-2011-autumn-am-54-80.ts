import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { autumn2011Am5480Calculations as calculations } from './legacy-2011-autumn-am-54-80-calculations';
import { autumn2011Am5480Knowledge as knowledge } from './legacy-2011-autumn-am-54-80-knowledge';
import { autumn2011Am5480Source as source } from './legacy-2011-autumn-am-54-80-source';

export const legacy2011AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const questionNumber = Number(number);
  const modeled = calculations[questionNumber as keyof typeof calculations];
  const reviewed = knowledge[questionNumber];
  return {
    source: '2011h23a-fe-am-' + number,
    title: original.title, sourceAnswer: original.key, version: '3.7.0',
    fields: [field(modeled?.name ?? '問いの対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (modeled?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2011年度秋期旧午前の入力が範囲外です');
      if (modeled) return modeled.build(index);
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
