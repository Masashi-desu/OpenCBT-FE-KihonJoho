import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { spring2013Am5480Calculations as calculations } from './legacy-2013-spring-am-54-80-calculations';
import { spring2013Am5480Knowledge as knowledge } from './legacy-2013-spring-am-54-80-knowledge';
import { spring2013Am5480Source as source } from './legacy-2013-spring-am-54-80-source';

export const legacy2013SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const n = Number(number);
  const finite = calculations[n as keyof typeof calculations];
  const reviewed = knowledge[n];
  const count = finite?.count ?? reviewed.variants.length + 1;
  return {
    source: '2013h25h-fe-am-' + number,
    title: original.title,
    sourceAnswer: original.key,
    version: '3.2.0',
    fields: [field(finite?.name ?? '問いの対象・判断条件', 0, count - 1)],
    reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (finite?.notes ?? reviewed.notes),
    build(values) {
      const index = selectCase(values, count);
      if (finite) return finite.build(index);
      const scenario = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return {
        prompt: [p(scenario.prompt)],
        choices: strings(scenario.choices ?? original.choices),
        correctIndex: scenario.correctIndex,
        explanation: scenario.explanation,
      };
    },
  };
});
