import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { legacy2015AutumnAm5480Knowledge as knowledge } from './legacy-2015-autumn-am-54-80-knowledge';
import { legacy2015AutumnAm5480Source as source } from './legacy-2015-autumn-am-54-80-source';
import { legacy2015AutumnAm5480Tables as tables } from './legacy-2015-autumn-am-54-80-tables';

export const legacy2015AutumnAm5480Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const n = Number(number);
  const table = tables[n];
  const content = knowledge[n];
  const notes = table?.notes ?? content?.notes;
  if (!notes) throw new Error(`Missing generation notes for 2015 autumn morning Q${n}`);
  return {
    source: `2015h27a-fe-am-${n}`,
    title: original.title,
    sourceAnswer: original.key,
    version: '3.2.0',
    fields: [field('caseIndex', 0, 3)],
    reference: [0],
    notes: variableNotes + ' 参照入力0と可変条件3件を全列挙して原資料，独立した全択の事実表又は別解法と照合する。' + notes,
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isInteger(index) || index < 0 || index > 3) {
        throw new Error('PARAMETER_CONSTRAINT');
      }
      if (table) return table.build(index);
      if (!content) throw new Error(`Missing knowledge for 2015 autumn morning Q${n}`);
      if (index === 0) {
        return {
          prompt: [p(original.prompt)],
          choices: strings([...original.choices]),
          correctIndex: 'アイウエ'.indexOf(original.key),
          explanation: content.originalExplanation,
        };
      }
      const variant = content.variants[index - 1];
      return {
        prompt: [p(variant.prompt)],
        choices: strings(variant.choices ?? [...original.choices]),
        correctIndex: variant.correctIndex,
        explanation: variant.explanation,
      };
    },
  };
});
