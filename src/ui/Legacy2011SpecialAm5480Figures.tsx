import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  capacityColumns, capacityFigure, capacityRows, demandFigure, demandLines, growthShareFigure, inspectionColumns, inspectionFigure, inspectionRows,
  inventoryColumns, inventoryFigure, inventoryRows, organizationFigure, tariffChoiceFigures,
} from '../core/generators/legacy-2011-special-am-54-80-figures';
import { matrixCells, organizationCases, tariffFigures } from '../core/generators/legacy-2011-special-am-54-80-models';

const ink = 'var(--diagram-ink)';
const plotStyle: CSSProperties = { display: 'block', width: 'min(100%, calc(232px * var(--image-scale, 1)))', height: 'auto', color: ink };
const matrixStyle: CSSProperties = { display: 'block', width: 'min(100%, calc(380px * var(--image-scale, 1)))', height: 'auto', color: ink };
const organizationStyle: CSSProperties = { display: 'block', width: 'max(100%, calc(600px * var(--image-scale, 1)))', height: 'auto', color: ink };
const demandLineStyle: CSSProperties = { marginBottom: '14px' };
const tableStyle: CSSProperties = { borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))', width: 'auto' };
const cellStyle: CSSProperties = {
  border: '1px solid var(--diagram-border)', padding: '.28em .55em', whiteSpace: 'nowrap', textAlign: 'center',
};

type FigureText = { caption: string; description: string };
function Svg({ caption, description, viewBox, style, children }: FigureText & {
  viewBox: string; style: CSSProperties; children: ReactNode;
}) {
  const id = useId();
  return <svg viewBox={viewBox} style={style} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}>
    <title id={`${id}-title`}>{caption}</title>
    <desc id={`${id}-desc`}>{description}</desc>
    <g aria-hidden="true">{children}</g>
  </svg>;
}

function Plot({ index, choice, ...text }: FigureText & { index: number; choice: number }) {
  const points = tariffFigures(index)[choice].map(([x, y]) => `${35 + x * 1.72},${145 - y * 1.30}`).join(' ');
  return <Svg {...text} viewBox="0 0 212 168" style={plotStyle}>
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M35 12V145H207" />
      <polyline points={points} />
    </g>
    <g fill="currentColor" fontSize="13" textAnchor="middle">
      <text x="18" y="70" writingMode="vertical-rl">利用料金</text>
      <text x="29" y="158">0</text>
      <text x="121" y="160">使用量</text>
    </g>
  </Svg>;
}

function Matrix(text: FigureText) {
  return <Svg {...text} viewBox="0 0 380 270" style={matrixStyle}>
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="75" y="35" width="274" height="182" />
      <path d="M212 35v182M75 126h274 M60 196V50m-5 10 5-10 5 10 M92 233h237m-12-5 12 5-12 5" />
    </g>
    <g fill="currentColor" fontSize="17" textAnchor="middle">
      <text x="27" y="88" writingMode="vertical-rl">市場成長率</text>
      <text x="60" y="37">高</text>
      <text x="60" y="217">低</text>
      <text x="85" y="239">小</text>
      <text x="342" y="239">大</text>
      <text x="212" y="259">市場占有率</text>
      {matrixCells.map(({ label, highGrowth, highShare }) =>
        <text key={label} x={highShare ? 280 : 143} y={highGrowth ? 86 : 178}>{label}</text>)}
    </g>
  </Svg>;
}

function Organization({ index, ...text }: FigureText & { index: number }) {
  const { nodes, links } = organizationCases[index];
  return <Svg {...text} viewBox={`0 0 660 ${index === 0 ? 154 : 225}`} style={organizationStyle}>
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      {links.map(([parent, child]) => {
        const from = nodes.find(node => node.id === parent)!;
        const to = nodes.find(node => node.id === child)!;
        const top = from.y + 17, bottom = to.y - 17, joint = (top + bottom) / 2;
        const d = index === 3 && parent !== 'leader'
          ? `M ${from.x},${top} L ${to.x},${bottom}`
          : `M ${from.x},${top} V ${joint} H ${to.x} V ${bottom}`;
        return <path d={d} key={`${parent}-${child}`} />;
      })}
      {nodes.map(({ id, x, y }) => <rect key={id} x={x - 47} y={y - 17} width="94" height="34" />)}
    </g>
    <g fill="currentColor" fontSize="15" textAnchor="middle" dominantBaseline="middle">
      {nodes.map(({ id, label, x, y }) => <text key={id} x={x} y={y}>{label}</text>)}
    </g>
  </Svg>;
}

function InventoryHeader() {
  return <thead>
    <tr>
      <th scope="col" rowSpan={2} style={cellStyle}>{inventoryColumns[0]}</th>
      <th scope="col" rowSpan={2} style={cellStyle}>{inventoryColumns[1]}</th>
      <th scope="colgroup" colSpan={2} style={cellStyle}>受払個数</th>
      <th scope="col" rowSpan={2} style={cellStyle}>{inventoryColumns[4]}</th>
    </tr>
    <tr>{inventoryColumns.slice(2, 4).map(label => <th scope="col" key={label} style={cellStyle}>{label}</th>)}</tr>
  </thead>;
}
function DataTable({ columns, rows, caption, inventory = false }: {
  columns: readonly string[]; rows: readonly (readonly string[])[]; caption: string; inventory?: boolean;
}) {
  return <table aria-label={caption} style={tableStyle}>
    {inventory ? <InventoryHeader /> : <thead><tr>{columns.map(label => <th scope="col" key={label} style={cellStyle}>{label}</th>)}</tr></thead>}
    <tbody>{rows.map(([label, ...entries]) => <tr key={label}>
      <th scope="row" style={cellStyle}>{label}</th>
      {entries.map((value, i) => value === '／'
        ? <td key={i} style={{ ...cellStyle, position: 'relative' }} aria-label="対象外">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M0 100L100 0" stroke="currentColor" vectorEffect="non-scaling-stroke" />
          </svg>
        </td>
        : <td key={i} style={cellStyle}>{value}</td>)}
    </tr>)}</tbody>
  </table>;
}

function frame(profile: string, caption: string, content: ReactNode, description?: string) {
  return <figure className="managed-diagram source-figure" data-figure-profile={profile}
    {...(description ? { role: 'group', 'aria-label': caption, 'aria-description': description } : {})}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: ink }}>{content}</div>
  </figure>;
}
function tableRenderer(
  definition: typeof capacityFigure,
  columns: readonly string[],
  rows: (index: number) => string[][],
  inventory = false,
): BookletFigureRenderer {
  return {
    profile: definition.profile,
    component({ values, caption }) {
      return frame(definition.profile, caption,
        <DataTable columns={columns} rows={rows(values[0])} caption={caption} inventory={inventory} />, definition.alt(values));
    },
  };
}

export const legacy2011SpecialAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  ...tariffChoiceFigures.map((definition, choice) => ({
    profile: definition.profile,
    component({ values, caption }: BookletFigureProps) {
      return <span data-figure-profile={definition.profile}>
        <Plot index={values[0]} choice={choice} caption={caption} description={definition.alt(values)} />
      </span>;
    },
  })),
  {
    profile: growthShareFigure.profile,
    component({ values, caption }) {
      return frame(growthShareFigure.profile, caption, <Matrix caption={caption} description={growthShareFigure.alt(values)} />);
    },
  },
  {
    profile: demandFigure.profile,
    component({ values, caption }) {
      const [first, second, third] = demandLines(values[0]);
      return <div data-figure-profile={demandFigure.profile} role="group" aria-label={caption} aria-description={demandFigure.alt(values)}>
        <ol role="list" style={{ listStyle: 'none', paddingInlineStart: 0, marginBlock: 0 }}>
          <li><p style={demandLineStyle}>{first}</p></li>
          <li><p style={demandLineStyle}>{second}</p></li>
          <li><p style={demandLineStyle}>{third}<span style={{ display: 'inline-block', textAlign: 'center', minInlineSize: '4em', border: '1px solid var(--diagram-border)', marginInline: '.35em' }}>a</span>個になる。</p></li>
        </ol>
      </div>;
    },
  },
  tableRenderer(capacityFigure, capacityColumns, capacityRows),
  {
    profile: organizationFigure.profile,
    component({ values, caption }) {
      return frame(organizationFigure.profile, caption,
        <Organization index={values[0]} caption={caption} description={organizationFigure.alt(values)} />);
    },
  },
  tableRenderer(inspectionFigure, inspectionColumns, inspectionRows),
  tableRenderer(inventoryFigure, inventoryColumns, inventoryRows, true),
];
