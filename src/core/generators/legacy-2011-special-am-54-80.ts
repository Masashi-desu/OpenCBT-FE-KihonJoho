import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { special2011Am5480Calculations as calculations } from './legacy-2011-special-am-54-80-calculations';
import { special2011Am5480Knowledge as knowledge } from './legacy-2011-special-am-54-80-knowledge';
import { special2011Am5480Source as source } from './legacy-2011-special-am-54-80-source';

export const legacy2011SpecialAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const modeled = calculations[Number(number)];
  const reviewed = knowledge[Number(number)];
  return {
    source: '2011h23tokubetsu-fe-am-' + number,
    title: original.title, sourceAnswer: original.key, version: '3.7.0',
    fields: [field(modeled?.name ?? '問いの対象・判断条件', 0, 3)],
    reference: [0],
    // The four historical lifecycle categories remain the same for every business scenario.
    ...(number === '58' ? { answerVariation: 'fixed' as const } : {}),
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (modeled?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2011年度特別試験旧午前の入力が範囲外です');
      if (modeled) return modeled.build(index);
      const scenario = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return { prompt: [p(scenario.prompt)], choices: strings([...scenario.choices]),
        correctIndex: scenario.correctIndex, explanation: scenario.explanation };
    },
  };
});
