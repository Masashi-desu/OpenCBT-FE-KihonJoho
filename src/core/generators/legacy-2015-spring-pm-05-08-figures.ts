import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';
import { legacy2015SpringPm5Definition as q5 } from './legacy-2015-spring-pm-5';
import { legacy2015SpringPm6Definition as q6 } from './legacy-2015-spring-pm-6';
import { legacy2015SpringPm7Definition as q7 } from './legacy-2015-spring-pm-7';
import { legacy2015SpringPm8Definition as q8 } from './legacy-2015-spring-pm-8';

const descriptions = new Map<string, Map<string, string>>();
for (const question of [q5, q6, q7, q8]) {
  const maximum = question.fields[0].maximum;
  for (let index = 0; index <= maximum; index++) {
    const body = question.build([index]);
    for (const block of [...body.prompt, ...body.choices.flat(), ...(body.contexts ?? []).flatMap(context => context.blocks)]) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene;
      const alternatives = descriptions.get(profile) ?? new Map<string, string>();
      const key = values.join(',');
      const existing = alternatives.get(key);
      if (existing !== undefined && existing !== block.alt)
        throw new DataError('FIGURE_PROFILE', '同じ図の入力に異なる代替説明が登録されています');
      alternatives.set(key, block.alt);
      descriptions.set(profile, alternatives);
    }
  }
}

export const legacy2015SpringPm0508Figures: BookletFigureDefinition[] = [...descriptions].map(([profile, alternatives]) => {
  const points = [...alternatives.keys()].map(key => key.split(',').map(Number));
  const domain = points[0].map((_, axis) => {
    const coordinates = points.map(point => point[axis]);
    return [Math.min(...coordinates), Math.max(...coordinates)] as const;
  });
  function description(values: number[]) {
    const value = alternatives.get(values.join(','));
    if (value === undefined) throw new DataError('FIGURE_PROFILE', '図の入力が確認済みの条件に一致しません');
    return value;
  }
  return { profile, domain, alt: description, validate: values => { description(values); } };
});
