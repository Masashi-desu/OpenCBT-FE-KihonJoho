import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2012SpringAm5480Figures as figures, spring2012Am5480Profiles as profiles } from '../core/generators/legacy-2012-spring-am-54-80-figures';
import { accounts, breakEvenCases, incomeCases, procurementSteps, productionRows, subtotalAfter } from '../core/generators/legacy-2012-spring-am-54-80-models';

const diagramTextScale = 'calc(1em * var(--image-scale, 1))';
const cell: CSSProperties = {
  border: '1px solid var(--diagram-border)', padding: '.25em .55em', whiteSpace: 'nowrap', textAlign: 'center',
};

function Frame({ profile, caption, alt, children }: { profile: string; caption: string; alt: string; children: ReactNode }) {
  return <figure className="managed-diagram source-figure" data-figure-profile={profile}
    role="group" aria-label={caption} aria-description={alt}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>
      {children}
    </div>
  </figure>;
}

function Procurement({ caption, values }: BookletFigureProps) {
  return <Frame profile={profiles.procurement} caption={caption} alt={figures[0].alt(values)}>
    <ol aria-label={caption} style={{ padding: 0, margin: '.25em 0', listStyle: 'none', fontSize: diagramTextScale, width: 'max-content' }}>
      {procurementSteps.map((step, index) => <li key={step} data-procurement-step={'abcd'[index]}
        style={{ display: 'grid', gridTemplateColumns: '6em 20em', columnGap: '.75em', alignItems: 'center' }}>
        <span style={{ border: '1px solid var(--diagram-border)', padding: '.5em', textAlign: 'center' }}>{'abcd'[index]}</span>
        <span>{step}</span>
        {index < procurementSteps.length - 1 && <span aria-hidden="true" style={{ textAlign: 'center' }}>↓</span>}
      </li>)}
    </ol>
  </Frame>;
}

function Production({ caption, values }: BookletFigureProps) {
  return <Frame profile={profiles.production} caption={caption} alt={figures[1].alt(values)}>
    <table aria-label={caption} style={{ borderCollapse: 'collapse', fontSize: diagramTextScale }}>
      <thead><tr>{['生産方式', 'a', 'b', 'c', 'd'].map(label => <th key={label} scope="col" style={cell}>{label}</th>)}</tr></thead>
      <tbody>{productionRows.map(([label, ...entries]) => <tr key={label}>
        <th scope="row" style={cell}>{label}</th>
        {entries.map((entry, index) => <td key={'abcd'[index]} style={cell}>{entry}</td>)}
      </tr>)}</tbody>
    </table>
  </Frame>;
}

const incomeCell: CSSProperties = { textAlign: 'left', padding: '.18em .45em', whiteSpace: 'nowrap' };

function Income({ caption, values }: BookletFigureProps) {
  const amounts = incomeCases[values[0]];
  return <Frame profile={profiles.income} caption={caption} alt={figures[2].alt(values)}>
    <div style={{ width: 'max-content', fontSize: diagramTextScale }}>
      <div style={{ textAlign: 'right' }}>単位　百万円</div>
      <div style={{ border: '1px solid var(--diagram-border)', padding: '.45em 1em' }}>
        <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
          <caption style={{ fontWeight: 600, textDecoration: 'underline', padding: '.25em' }}>{caption}</caption>
          <tbody>{accounts.map(([section, label], index) => {
            const account = <tr key={section} data-account={section}>
              <th scope="row" style={incomeCell}>{section}．{label}</th>
              <td style={{ ...incomeCell, textAlign: 'right' }}>{amounts[index].toLocaleString('ja-JP')}</td>
            </tr>;
            if (!subtotalAfter.some(position => position === index)) return account;
            return [account, <tr key={section + '-blank'} data-hidden-subtotal={section}>
              <td /><td style={{ ...incomeCell, borderTop: '1px solid var(--diagram-border)' }}>
                <span aria-label="数値は明示していない" role="img"
                  style={{ display: 'block', height: '.65em', width: '3.8em', border: '1px solid var(--diagram-border)' }} />
              </td>
            </tr>];
          })}</tbody>
        </table>
      </div>
    </div>
  </Frame>;
}

function BreakEven({ caption, values }: BookletFigureProps) {
  const id = useId();
  const { threshold, fixed } = breakEvenCases[values[0]];
  const verticalLabelX = 4;
  const x0 = 46;
  const y0 = 196;
  const intersection = { x: 152, y: 92 };
  const xEnd = 211;
  const revenueY = y0 - (y0 - intersection.y) * (xEnd - x0) / (intersection.x - x0);
  return <Frame profile={profiles.breakEven} caption={caption} alt={figures[3].alt(values)}>
    <div style={{ display: 'flex', gap: '.6em', width: 'max-content' }}>
      {fixed.map((fixedCost, company) => {
        const name = 'AB'[company] + '社';
        const costStartY = y0 - (y0 - intersection.y) * fixedCost / threshold;
        const costEndY = costStartY + (intersection.y - costStartY) * (xEnd - x0) / (intersection.x - x0);
        const panel = id + '-' + company;
        return <svg key={name} viewBox="0 0 244 220" role="img" aria-labelledby={panel + '-title'}
          aria-describedby={panel + '-description'}
          data-break-even-company={name} data-fixed-cost={fixedCost} data-threshold={threshold}
          style={{ display: 'block', width: 'calc(244px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none' }}>
          <title id={panel + '-title'}>{`${name}の損益分岐点`}</title>
          <desc id={panel + '-description'}>{`横軸は売上高，縦軸は収益・費用。${name}の収益線は原点を通り，費用線の縦軸切片は固定費${fixedCost}。二直線は売上高${threshold}，収益・費用${threshold}で交わる。`}</desc>
          <g fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d={`M${x0} 24 V${y0} H234`} />
            <path data-revenue-line="" d={`M${x0} ${y0} L${xEnd} ${revenueY}`} />
            <path data-cost-line="" d={`M${x0} ${costStartY} L${xEnd} ${costEndY}`} />
            <path d={`M${x0} ${intersection.y} H${intersection.x} V${y0}`} />
            <path d="M138 78 L150 90 M145 88 L150 90 L148 84" />
          </g>
          <g fill="currentColor" fontSize="13">
            <text x="130" y="19" textAnchor="middle">{name}</text>
            <text x={verticalLabelX} y="37">収<tspan x={verticalLabelX} dy="13">益</tspan><tspan x={verticalLabelX} dy="13">・</tspan><tspan x={verticalLabelX} dy="13">費</tspan><tspan x={verticalLabelX} dy="13">用</tspan></text>
            <text x={x0 - 3} y={y0 + 14} textAnchor="end">0</text>
            <text x={x0 - 3} y={intersection.y + 4} textAnchor="end">{threshold}</text>
            <text x={x0 - 3} y={costStartY + 4} textAnchor="end">{fixedCost}</text>
            <text x={intersection.x} y={y0 + 14} textAnchor="middle">{threshold}</text>
            <text x="233" y={y0 + 14} textAnchor="end">売上高</text>
            <text x="63" y="80">損益分岐点</text>
            <text x={xEnd - 9} y={revenueY - 4} textAnchor="end">収益</text>
            <text x={xEnd - 3} y={costEndY + 15} textAnchor="end">費用</text>
          </g>
        </svg>;
      })}
    </div>
  </Frame>;
}

export const legacy2012SpringAm5480FigureRenderers = [
  { profile: profiles.procurement, component: Procurement },
  { profile: profiles.production, component: Production },
  { profile: profiles.income, component: Income },
  { profile: profiles.breakEven, component: BreakEven },
] as const satisfies readonly BookletFigureRenderer[];
