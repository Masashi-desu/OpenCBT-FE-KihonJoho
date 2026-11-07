import { useId, type ReactNode } from 'react';
import { spring2016Pm9Figure } from '../core/generators/legacy-2016-spring-pm-9';
import { spring2016Pm10ChangeTable } from '../core/generators/legacy-2016-spring-pm-10';
import { legacy2016SpringPm0913Figures } from '../core/generators/legacy-2016-spring-pm-figures-09-13';
import type { BookletFigureRenderer, BookletFigureProps } from './booklet-figure-renderer-contract';

const ink = 'var(--diagram-ink)';
const unit = 22;
const centered = { textAnchor: 'middle' } as const;
const span = (units: number) => units * unit;

function Grid({grid, x, y, cell = unit, shade, overlay, fine = true}: {
  grid: string[]; x: number; y: number; cell?: number;
  shade?: {row: number; column: number; fill: string};
  overlay?: ReactNode; fine?: boolean;
}) {
  const width = grid[0].length * cell, height = grid.length * cell;
  return <g transform={`translate(${x}, ${y})`} data-grid-rows={grid.length} data-grid-columns={grid[0].length}>
    <rect width={width} height={height} fill="var(--diagram-surface)" stroke="currentColor" strokeWidth={1.7}/>
    {shade && <rect x={shade.column * cell} y={shade.row * cell} width={cell} height={cell} fill={shade.fill}/>}
    {grid.slice(1).map((_, i) => <path key={i} d={`M0 ${(i + 1) * cell} H${width}`} fill="none" stroke="currentColor"
      strokeDasharray={fine || (i + 1) % 2 === 0 ? undefined : '4 3'}/>)}
    {[...grid[0]].slice(1).map((_, i) => <path key={i} d={`M${(i + 1) * cell} 0 V${height}`} fill="none" stroke="currentColor"
      strokeDasharray={fine || (i + 1) % 2 === 0 ? undefined : '4 3'}/>)}
    {grid.map((row, r) => [...row].map((value, c) => value === '*' ?
      <text key={`${r}-${c}`} x={(c + 0.5) * cell} y={(r + 0.72) * cell} {...centered}>*</text> : null))}
    {overlay}
  </g>;
}

function FractalFigure({name, values, caption}: BookletFigureProps & {name: string}) {
  const patternId = useId();
  const model = spring2016Pm9Figure(name, values);
  let body: ReactNode, width: number, height: number;
  switch (model.kind) {
    case 'depth-examples': {
      width = 460; height = 230;
      const starts = [34, 92, 167, 271];
      body = <>
        <rect x={1} y={1} width={width - 2} height={height - 2} fill="none" stroke="currentColor"/>
        <text x={8} y={21}>深さ</text>
        <text x={8} y={217}>描画結果</text>
        {model.grids.map((grid, depth) => <g key={depth}>
          <text x={starts[depth] + span(grid[0].length) / 2} y={21} {...centered}>{depth}</text>
          <Grid grid={grid} x={starts[depth]} y={36} fine={depth < 2}/>
        </g>)}
      </>;
      break;
    }
    case 'replacement-rule':
      width = 455; height = 155;
      body = <>
        <text x={76} y={18} {...centered}>生成パターンの例</text>
        <text x={225} y={18} {...centered}>深さd−1の文字</text>
        <text x={379} y={18} {...centered}>深さdの文字の行列</text>
        <Grid grid={model.grid} x={54} y={43}/>
        <Grid grid={['*']} x={214} y={43}/>
        <Grid grid={[' ']} x={214} y={99}/>
        <text x={300} y={64} {...centered}>→</text>
        <text x={300} y={120} {...centered}>→</text>
        <Grid grid={model.grid} x={357} y={34}/>
        <Grid grid={['  ', '  ']} x={357} y={92}/>
      </>;
      break;
    case 'substitution-choice': {
      width = 450; height = 222;
      const left = 135, top = 32;
      body = <>
        <defs><pattern id={patternId} width={5} height={5} patternUnits="userSpaceOnUse">
          <path d="M0 5 L5 0 M-2 2 L2 -2 M3 7 L7 3" stroke="currentColor" fill="none" opacity={0.7}/>
        </pattern></defs>
        <text x={57} y={19} {...centered}>深さ2</text>
        <text x={223} y={19} {...centered}>深さ3</text>
        <Grid grid={model.before} x={13} y={top} shade={{...model.target, fill: `url(#${patternId})`}} fine={false}/>
        <Grid grid={model.after} x={left} y={top} fine={false} overlay={model.areas.map(area =>
          <rect key={area.label} data-fractal-candidate={area.label} x={span(area.column) + 1.5} y={span(area.row) + 1.5}
            width={span(area.size) - 3} height={span(area.size) - 3} rx={4} fill="none" stroke="currentColor" strokeWidth={1.8}/>)}/>
        {model.areas.map((area, i) => <g key={area.label}>
          <path d={`M${left + span(area.column + area.size)} ${top + span(area.row + 0.5 * area.size)} L409 ${58 + i * 39}`}
            stroke="currentColor" strokeDasharray="4 3" fill="none"/>
          <text x={429} y={63 + i * 39} {...centered}>{area.label}</text>
        </g>)}
      </>;
      break;
    }
    case 'new-pattern-result':
      width = 4 + span(model.grid[0].length); height = 4 + span(model.grid.length);
      body = <Grid grid={model.grid} x={2} y={2}/>;
      break;
  }
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={model.alt} fill="currentColor"
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none', color: ink }}>
        {body}
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function CobolChangeTable({values, caption}: BookletFigureProps) {
  const rows = spring2016Pm10ChangeTable(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <table style={{ textAlign: 'left', color: ink, fontSize: 'calc(1em * var(--image-scale, 1))' }}>
        <thead><tr><th scope="col">処置</th><th scope="col">変更内容</th></tr></thead>
        <tbody>{rows.map(([label, text]) => <tr key={label}>
          <th scope="row" style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>{label}</th>
          <td><pre style={{ margin: 0 }}><code>{text}</code></pre></td>
        </tr>)}</tbody>
      </table>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const fractalPrefix = 'legacy-2016-spring-pm-9-';
export const legacy2016SpringPm0913FigureRenderers: BookletFigureRenderer[] = legacy2016SpringPm0913Figures.map(({profile}) => ({
  profile,
  component: profile.startsWith(fractalPrefix)
    ? props => <FractalFigure {...props} name={profile.slice(fractalPrefix.length)}/>
    : CobolChangeTable,
}));
