import { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { figureDescription, figureNames, figureProfile, shiftFigure, statisticsChanges,
  type FigureName } from '../core/generators/legacy-2005-autumn-pm-06-09-figures';
import { selectCase } from '../core/generators/legacy-2016-autumn-pm-09-13-support';

function Statistics({ values, caption }: BookletFigureProps) {
  const index = selectCase(values, 4);
  return <div className="table-wrap" role="region" aria-label={caption} tabIndex={0}>
    <table>
      <caption>{caption}</caption>
      <thead><tr><th scope="col">位置</th><th scope="col">プログラムの変更内容</th></tr></thead>
      <tbody>{statisticsChanges(index).map(([position, instructions]) => <tr key={position}>
        <th scope="row">{position}</th><td><pre style={{ margin: 0, textAlign: 'left' }}>{instructions}</pre></td>
      </tr>)}</tbody>
    </table>
  </div>;
}

type ShiftName = Exclude<FigureName, '7-statistics'>;
const bitSpacing = 23;
const start = 134;
const end = start + 16 * bitSpacing;
const canvas = 630;

function BitRow({ label, bits, y }: { label: string; bits: string; y: number }) {
  return <g>
    <text x={110} y={y + 22} textAnchor="end">{label}</text>
    <rect x={start} y={y} width={end - start} height={30} fill="none" stroke="currentColor" />
    {[...bits].map((bit, column) => {
      const x = start + (column + 0.5) * bitSpacing;
      return <g key={column} textAnchor="middle">
        <text x={x} y={y - 6}>{15 - column}</text>
        <text x={x} y={y + 22}>{bit}</text>
      </g>;
    })}
    <text x={end + 8} y={y - 6}>（ビット番号）</text>
  </g>;
}

function Shift({ name, values, caption }: BookletFigureProps & { name: ShiftName }) {
  const index = selectCase(values, 4);
  const titleId = useId();
  const descriptionId = useId();
  const { data, mask, arrowLabel } = shiftFigure(name, index);
  const arrowY = name === '9-shift-mask' ? 188 : 89;
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={titleId} aria-describedby={descriptionId}
        viewBox={'0 0 ' + canvas + ' 212'} fontSize={15} fontFamily="inherit" fill="currentColor"
        style={{ display: 'block', width: 'calc(' + canvas + 'px * var(--image-scale, 1))',
          maxWidth: 'none', height: 'auto', marginInline: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={titleId}>{caption}</title>
        <desc id={descriptionId}>{figureDescription(name, index)}</desc>
        <BitRow label="対象データ" bits={data} y={34} />
        <BitRow label="マスク" bits={mask} y={131} />
        <text x={start} y={arrowY + 5}>{arrowLabel}</text>
        <path d={`M350 ${arrowY}H${end}m-7 -5 7 5 -7 5`} strokeWidth="2" stroke="currentColor" fill="none" />
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2005AutumnPm0609FigureRenderers: readonly BookletFigureRenderer[] =
  figureNames.map(name => ({
    profile: figureProfile(name),
    component: name === '7-statistics' ? Statistics : props => <Shift {...props} name={name} />,
  }));
