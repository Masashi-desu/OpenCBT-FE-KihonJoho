import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { legacy2016AutumnAm0140FigureAlt } from './legacy-2016-autumn-am-01-40-figures';
import { autumn2016NumericInputs } from './legacy-2016-autumn-am-01-40-models';
import { legacy2017AutumnDataFigureAlt, legacy2017AutumnDataProfiles } from './legacy-2017-autumn-data-figures';

export const spring2015Am0126Profiles = {
  memory: 'legacy-2015-spring-am-9-address',
  disks: 'legacy-2015-spring-am-11-disks',
  curves: 'legacy-2015-spring-am-14-response',
  logic: 'legacy-2015-spring-am-23-logic',
} as const;
export const autumn2016AddressProfile = 'legacy-2016-autumn-am-9-address';
export const autumn2017LogicProfile = legacy2017AutumnDataProfiles.logic;
export const spring2015AmAddressCases = autumn2016NumericInputs[9];

export function spring2015AmDiskColumns(mode: number) {
  return Array.from({ length: 4 }, (_, disk) =>
    Array.from({ length: 4 }, (_, row) => mode === 0 ? row * 4 + disk : row));
}

const curves = [
  '正の初期値から緩やかに増加し、使用率が1に近づくと急に立ち上がる曲線。',
  '左下から右上への正の傾きの直線。',
  '増加するが、使用率が1に近づくと傾きが小さくなる曲線。',
  '横軸に平行な水平の直線。',
];

function definition(profile: string, domain: BookletFigureDefinition['domain'],
  alt: BookletFigureDefinition['alt']): BookletFigureDefinition {
  return {
    profile, domain, alt,
    validate(values) {
      if (values.length !== domain.length || domain.some(([min, max], i) =>
        !Number.isSafeInteger(values[i]) || values[i] < min || values[i] > max)) throw Error('FIGURE_DOMAIN');
    },
  };
}

const f = spring2015Am0126Profiles;
export const legacy2015SpringAm0126Figures: BookletFigureDefinition[] = [
  definition(f.memory, [[0, spring2015AmAddressCases.length - 1]], ([index]) =>
    legacy2016AutumnAm0140FigureAlt(autumn2016AddressProfile, spring2015AmAddressCases[index])),
  definition(f.disks, [[0, 1]], ([mode]) =>
    '上に制御装置、下に左からデータディスク1〜4が並び、それぞれ縦線で接続する。' +
    spring2015AmDiskColumns(mode).map((rows, index) =>
      'ディスク' + (index + 1) + 'は上から' + rows.map(value => 'b' + value).join('、') + '。').join('') +
    'ディスク間には行と同じ高さに点線を示す。'),
  definition(f.curves, [[0, 3]], ([index]) =>
    '横軸はCPU使用率、縦軸は平均応答時間。横軸の0と1を示し、1に縦の点線を引く。' + curves[index]),
  definition(f.logic, [[0, 1], [0, 4]], values => values[0] === 1 && values[1] === 4
    ? 'X＝A＋B。＋は論理和。' : legacy2017AutumnDataFigureAlt(autumn2017LogicProfile, values)),
];

export function spring2015Am0126Diagram(profile: string, values: number[], caption: string) {
  const definition = legacy2015SpringAm0126Figures.find(d => d.profile === profile);
  if (!definition) throw Error('FIGURE_PROFILE');
  definition.validate(values);
  return figure(profile, values, caption, definition.alt(values));
}
