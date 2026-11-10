import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2012Am5480Profiles as profiles, legacy2012AutumnAm5480Figures as figures } from '../core/generators/legacy-2012-autumn-am-54-80-figures';
import { investments, profitSeries, quantities, scatterCases, scatterPoints, sellingProbabilities } from '../core/generators/legacy-2012-autumn-am-54-80-models';

const cell: CSSProperties = {
  border: '1px solid var(--diagram-border)', padding: '.25em .55em', whiteSpace: 'nowrap', textAlign: 'center',
};
const table: CSSProperties = { borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' };
const years = [0, 1, 2, 3, 4, 5];

function Frame({ profile, caption, alt, children }: {
  profile: string; caption: string; alt?: string; children: ReactNode;
}) {
  return <figure className="managed-diagram source-figure" data-figure-profile={profile}
    role={alt ? 'group' : undefined} aria-label={alt ? caption : undefined} aria-description={alt}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>
      {children}
    </div>
  </figure>;
}

function Investment({ caption, values }: BookletFigureProps) {
  const [index] = values;
  return <Frame profile={profiles.investment} caption={caption} alt={figures[0].alt(values)}>
    <div style={{ display: 'grid', gap: '.75em', width: 'max-content' }}>
      {profitSeries[index].map((profits, i) => {
        const name = '案件' + 'abcd'[i];
        return <table key={name} aria-label={name} data-investment-case={'abcd'[i]} style={table}>
          <caption style={{ textAlign: 'left' }}>{name}</caption>
          <thead><tr><th scope="col" style={cell}>年目</th>
            {years.map(year => <th scope="col" key={year} style={cell}>{year}</th>)}
          </tr></thead>
          <tbody>
            <tr><th scope="row" style={cell}>利益</th><td style={cell} aria-label="空欄" />
              {profits.map((profit, year) => <td key={year} style={cell}>{profit}</td>)}
            </tr>
            <tr><th scope="row" style={cell}>投資額</th><td style={cell}>{investments[i]}</td>
              {years.slice(1).map(year => <td key={year} style={cell} aria-label="空欄" />)}
            </tr>
          </tbody>
        </table>;
      })}
    </div>
  </Frame>;
}

function Sales({ caption, values }: BookletFigureProps) {
  const rows = sellingProbabilities(values[0]);
  return <Frame profile={profiles.sales} caption={caption} alt={figures[1].alt(values)}>
    <table aria-label={caption} data-sales-probabilities style={table}>
      <colgroup span={2}/><colgroup span={4}/>
      <thead>
        <tr><td colSpan={2} /><th colSpan={4} scope="colgroup" style={cell}>販売個数</th></tr>
        <tr><td colSpan={2} />{quantities.map(value => <th key={value} scope="col" style={cell}>{value}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => <tr key={quantities[i]}>
          {i === 0 && <th rowSpan={rows.length} scope="rowgroup" style={cell}>仕入個数</th>}
          <th scope="row" style={cell}>{quantities[i]}</th>
          {row.map((value, j) => <td key={quantities[j]} style={cell}
            aria-label={value === null ? '該当なし' : undefined}>{value === null ? '―' : value + '％'}</td>)}
        </tr>)}
      </tbody>
    </table>
  </Frame>;
}

const ticks = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25];
const majorTicks = [-20, -10, 0, 10, 20];
const xAt = (x: number) => 177 + 5.15 * x;
const yAt = (y: number) => 141 - 5.15 * y;
const numberText = (value: number) => String(value).replace('-', '−');

function Scatter({ caption, values }: BookletFigureProps) {
  const id = useId();
  const points = scatterPoints(values[0], values[1]);
  const { axes } = scatterCases[values[0]];
  return <Frame profile={profiles.scatter} caption={caption}>
    <svg viewBox={axes ? "0 0 354 308" : "0 0 354 282"} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
      data-scatter-option={values[1]} style={{ display: 'block', width: 'calc(354px * var(--image-scale, 1))', maxWidth: 'none', height: 'auto' }}>
      <title id={id + '-title'}>{caption}</title>
      <desc id={id + '-description'}>{figures[2].alt(values)}</desc>
      <g stroke="currentColor" strokeWidth={1.2}>
        <path d={`M ${xAt(-29)} ${yAt(0)} H ${xAt(29)} M ${xAt(0)} ${yAt(-24)} V ${yAt(24)}`} />
        {ticks.map(tick => <path key={tick} d={`M ${xAt(tick)} ${yAt(0)} v -5`} />)}
        {ticks.filter(tick => Math.abs(tick) <= 20).map(tick => <path key={tick} d={`M ${xAt(0)} ${yAt(tick)} h 5`} />)}
        {majorTicks.map(tick => <path key={tick}
          d={`M ${xAt(tick)} ${yAt(-24)} v -4 M ${xAt(-29)} ${yAt(tick)} h 4`} />)}
      </g>
      <g fill="currentColor" fontSize={12}>
        {axes && <text x={12} y={13} data-scatter-axis="y">{axes[1]}</text>}
        {axes && <text x={342} y={301} textAnchor="end" data-scatter-axis="x">{axes[0]}</text>}
        {majorTicks.map(tick => <text key={tick} x={xAt(tick)} y={yAt(-24) + 14} textAnchor="middle">
          {numberText(tick)}
        </text>)}
        {majorTicks.map(tick =>
          <text key={tick} x={xAt(-29) - 3} y={yAt(tick) + 4} textAnchor="end">{numberText(tick)}</text>)}
        {points.map(([x, y]) => <circle key={`${x},${y}`} cx={xAt(x)} cy={yAt(y)} r={3.2} data-point={`${x},${y}`} />)}
      </g>
    </svg>
  </Frame>;
}

export const legacy2012AutumnAm5480FigureRenderers = [
  { profile: profiles.investment, component: Investment },
  { profile: profiles.sales, component: Sales },
  { profile: profiles.scatter, component: Scatter },
] as const satisfies readonly BookletFigureRenderer[];
