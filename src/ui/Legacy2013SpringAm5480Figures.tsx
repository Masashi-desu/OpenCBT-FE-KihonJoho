import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  contractSteps, existingByNewProduct, newProducts, numberJa, oldProducts, profitConstraintRows,
  spring2013AmContractCases, spring2013AmProfitInputs, spring2013AmTransitions,
} from '../core/generators/legacy-2013-spring-am-54-80-models';
import { legacy2013SpringAm5480Figures, spring2013Am5480Profiles as profiles } from '../core/generators/legacy-2013-spring-am-54-80-figures';

const cell: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.23em .55em', whiteSpace: 'nowrap' };
const table: CSSProperties = { borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' };

function figureAlt(profile: string, values: number[]) {
  return legacy2013SpringAm5480Figures.find(figure => figure.profile === profile)!.alt(values);
}

function Frame({ profile, caption, children, tableDescription }: {
  profile: string; caption: string; children: ReactNode; tableDescription?: string;
}) {
  return <figure className="managed-diagram source-figure" data-figure-profile={profile}
    role={tableDescription ? 'group' : undefined} aria-label={tableDescription ? caption : undefined}
    aria-description={tableDescription}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>
      {children}
    </div>
  </figure>;
}

function Customers({ caption, values }: BookletFigureProps) {
  const data = spring2013AmTransitions[values[0]];
  return <Frame profile={profiles.transition} caption={caption} tableDescription={figureAlt(profiles.transition, values)}>
    <table aria-label={caption} style={table}>
      <thead><tr>
        <th scope="col" aria-label="商品" />
        {['人数', ...newProducts].map(column => <th key={column} scope="col" style={cell}>{column}</th>)}
      </tr></thead>
      <tbody>
        {oldProducts.map((product, row) => <tr key={product}>
          <th scope="row" style={cell}>{product}</th>
          <td style={cell}>{numberJa(data.existing[row] * 1000)}</td>
          {data.rates[row].map((rate, column) => <td key={newProducts[column]} style={cell}>{(rate / 10).toFixed(1)}</td>)}
        </tr>)}
        <tr>
          <th scope="row" colSpan={2} style={cell}>既存顧客数</th>
          {newProducts.map((product, column) => <td key={product} style={cell}>{numberJa(existingByNewProduct(data, column))}</td>)}
        </tr>
        <tr>
          <th scope="row" colSpan={2} style={cell}>新規顧客数</th>
          {data.incoming.map((count, column) => <td key={newProducts[column]} style={cell}>{numberJa(count * 1000)}</td>)}
        </tr>
      </tbody>
    </table>
  </Frame>;
}

function Profit({ caption, values }: BookletFigureProps) {
  const rows = profitConstraintRows(spring2013AmProfitInputs[values[0]]);
  return <Frame profile={profiles.profit} caption={caption} tableDescription={figureAlt(profiles.profit, values)}>
    <table aria-label={caption} style={table}>
      <thead><tr>
        <th scope="col" aria-label="資源" />
        {['製品A', '製品B', '制約条件'].map(column => <th key={column} scope="col" style={cell}>{column}</th>)}
      </tr></thead>
      <tbody>
        {rows.map(([resource, a, b, limit]) => <tr key={resource}>
          <th scope="row" style={cell}>{resource}</th>
          <td style={cell}>{a}</td><td style={cell}>{b}</td><td style={cell}>{limit}</td>
        </tr>)}
      </tbody>
    </table>
  </Frame>;
}

function Contract({ caption, values }: BookletFigureProps) {
  const { buyer, seller } = spring2013AmContractCases[values[0]];
  const uid = useId();
  const alt = figureAlt(profiles.contract, values);
  const arrow = 'url(#' + uid + '-arrow)';
  const xPositions = [79, 178, 277, 382, 527, 632, 740, 831];
  return <Frame profile={profiles.contract} caption={caption}>
    <svg viewBox="0 0 900 205" role="img" aria-labelledby={uid + '-title'} aria-describedby={uid + '-alt'}
      style={{ display: 'block', width: 'calc(900px * var(--image-scale, 1))', maxWidth: 'none', height: 'auto' }}>
      <title id={uid + '-title'}>{caption}</title>
      <desc id={uid + '-alt'}>{alt}</desc>
      <defs><marker id={uid + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="7" markerHeight="7" orient="auto">
        <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      </marker></defs>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" fontSize="16">
        <rect x="19" y="32" width="861" height="32"/>
        <rect x="19" y="136" width="861" height="32"/>
        <text x="19" y="23" fill="currentColor" stroke="none">{buyer}社（購入元）</text>
        <text x="19" y="125" fill="currentColor" stroke="none">{seller}社（購入先）</text>
        {contractSteps.map((step, index) => {
          const x = xPositions[index];
          const [y1, y2] = step.buyerSends ? [64, 136] : [136, 64];
          const stage = 'stage' in step ? step.stage : undefined;
          return <g key={step.label} data-step={step.label} data-stage={stage} data-from={step.buyerSends ? buyer : seller}>
            <line x1={x} y1={y1} x2={x} y2={y2} markerEnd={arrow} strokeWidth={stage ? 2.1 : 1.4}/>
            <text x={x} y={step.buyerSends ? 53 : 158} textAnchor="middle" fill="currentColor" stroke="none">{step.label}</text>
            {stage && <text x={x + 10} y="106" fill="currentColor" stroke="none">{stage}</text>}
          </g>;
        })}
        <text x="798" y="192" fill="currentColor" stroke="none">時間</text>
        <line x1="838" y1="185" x2="879" y2="185" markerEnd={arrow}/>
      </g>
    </svg>
  </Frame>;
}

export const legacy2013SpringAm5480FigureRenderers: BookletFigureRenderer[] = [
  { profile: profiles.transition, component: Customers },
  { profile: profiles.profit, component: Profit },
  { profile: profiles.contract, component: Contract },
];
