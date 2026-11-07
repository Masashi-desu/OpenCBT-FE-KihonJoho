import { Fragment, useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { ContentBlank, ContentParagraph } from './ContentText';
import { legacy2015AutumnPm0508Figures } from '../core/generators/legacy-2015-autumn-pm-05-08-figures';
import { autumn2015Pm0508BlankPattern } from '../core/generators/legacy-2015-autumn-pm-05-08-shared';
import { autumn2015Pm0508Banks as banks, autumn2015Pm0508Source as source } from '../core/generators/legacy-2015-autumn-pm-05-08-source';
import { autumn2015Pm5Decisions, type Autumn2015PmDecisionTable } from '../core/generators/legacy-2015-autumn-pm-5';
import { autumn2015Pm6Model } from '../core/generators/legacy-2015-autumn-pm-6';
import { autumn2015Pm7Pareto, autumn2015Pm7Ring, autumn2015Pm7Summary, autumn2015Pm7Tree } from '../core/generators/legacy-2015-autumn-pm-7';
import { autumn2015Pm8Rows } from '../core/generators/legacy-2015-autumn-pm-8';

const ink = 'var(--diagram-ink)';
const surface = 'var(--surface)';
const stroke = { stroke: ink, fill: 'none' };
const outline = { stroke: ink, fill: surface };

function Svg({ width, height, minimum = width, children }: { width: number; height: number; minimum?: number; children: ReactNode }) {
  return <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} fill={ink}
    style={{ display: 'block', marginInline: 'auto', width: `calc(min(100%, ${width}px) * var(--image-scale, 1))`,
      minWidth: `calc(${minimum}px * var(--image-scale, 1))`, height: 'auto', fontSize: 16 }}>{children}</svg>;
}

function Arrow({ id }: { id: string }) {
  return <defs><marker id={id} markerWidth="8" markerHeight="8" viewBox="0 0 8 8"
    refX="7" refY="4" orient="auto-start-reverse"><path d="M0 0L8 4 0 8Z" fill={ink} /></marker></defs>;
}

const arrowUrl = (id: string) => `url(#${id})`;
const heading = (columns: readonly string[]) => columns.map(column => <th key={column} scope="col">{column}</th>);
const blankSegments = (text: string) => text.split(autumn2015Pm0508BlankPattern).map((part, index) =>
  index % 2 === 0 ? part : { blank: part === '空欄' ? '' : part });

function OrderFlow() {
  const id = useId(), arrow = arrowUrl(id);
  const flow = source['q5-f1'];
  return <Svg width={670} height={300} minimum={590}>
    <Arrow id={id} />
    <path d="M128 7v20m0 220v19M358 131h22" {...stroke} strokeDasharray="3 3" />
    {['M128 27v15', 'M128 69v35', 'M128 131v24', 'M128 196v23', 'M86 175H26V56h31'].map(path =>
      <path key={path} d={path} {...stroke} markerEnd={arrow} />)}
    {['enter', 'check', 'commit'].map((name, i) => {
      const y = [43, 105, 220][i];
      return <g key={name}><rect x="58" y={y} width="140" height="26" {...outline} />
        <text x="128" y={y + 18} textAnchor="middle">{flow.nodes.find(node => node.id === name)?.text}</text></g>;
    })}
    <path d="M128 155l42 20-42 21-42-21Z" {...outline} /><text x="128" y="180" textAnchor="middle">エラー</text>
    <text x="56" y="170">あり</text><text x="135" y="211">なし</text>
    <rect x="245" y="49" width="113" height="143" {...stroke} strokeDasharray="5 3" />
    <path d="M198 118H274M254 118V74h20m-20 44v48h20M393 112h-13v38h13" {...stroke} />
    {['会員情報', '商品', '在庫'].map((name, i) => {
      const y = [74, 118, 166][i];
      return <g key={name}>
        <path d={`M281 ${y - 17}H336V${y + 17}H281c-11 0-11-34 0-34Z`} {...outline} />
        <ellipse cx="336" cy={y} rx="8" ry="17" {...outline} />
        <text x="305" y={y - 2} textAnchor="middle" fontSize="14">{name}<tspan x="305" dy="16">ファイル</tspan></text>
      </g>;
    })}
    <text x="385" y="137">{flow.frame.label}</text>
  </Svg>;
}

function FileFields() {
  const model = source['q5-t2'];
  return <><table><caption>{model.caption}</caption><thead><tr>{heading(model.columns)}</tr></thead><tbody>
    {model.rows.map(row => <tr key={row.file}><th scope="row">{row.file}</th><td>
      {row.items.map((item, i) => <Fragment key={item.text}>{i ? '，' : ''}{item.underlined ? <u>{item.text}</u> : item.text}</Fragment>)}
    </td></tr>)}
  </tbody></table><p>{model.footnote}</p></>;
}

type DecisionCell = Autumn2015PmDecisionTable['conditions'][number]['label'];
function DecisionMark({ cell }: { cell: DecisionCell }) {
  return cell === null ? null : typeof cell === 'string' ? cell.replace('—', '―') : <ContentBlank blank={cell.fieldId} />;
}

function DecisionTable({ values, id }: { values: number[]; id: 'q5-t3' | 'q5-t4' | 'q5-t6' }) {
  const model = autumn2015Pm5Decisions(values, id);
  const renderRows = (section: 'conditions' | 'actions', label: string) =>
    model[section].map((row, i) => <tr key={i}>
      {i === 0 && <th scope="rowgroup" rowSpan={model[section].length}>{label}</th>}
      <th scope="row"><DecisionMark cell={row.label} /></th>
      {row.marks.map((cell, j) => {
        const span = model.rowSpans?.find(span => span.section === section && span.column === j && i >= span.row && i < span.row + span.rowSpan);
        if (span && span.row !== i) return null;
        return <td key={j} rowSpan={span?.rowSpan} style={{ textAlign: 'center' }}><DecisionMark cell={cell} /></td>;
      })}
    </tr>);
  return <table><caption>{model.caption}</caption><thead><tr>
    <th colSpan={model.columns + 2}>{model.heading}</th>
  </tr></thead><tbody>{renderRows('conditions', '条件部')}</tbody><tbody>{renderRows('actions', '動作部')}</tbody></table>;
}

function ActionChoice({ values }: { values: number[] }) {
  return <table style={{ width: 'auto', marginInline: 'auto' }} aria-label="上から順に動作の組合せ"><tbody>
    {banks[5].e[values[1]].map((mark, i) => <tr key={i}><td style={{ minWidth: '2em', textAlign: 'center' }}>{mark.replace('—', '―')}</td></tr>)}
  </tbody></table>;
}

function Schedule({ values }: { values: number[] }) {
  const { rows } = autumn2015Pm6Model(values);
  const model = source['q6-t2'];
  return <table><caption>{model.caption}</caption><thead><tr>
    {model.columns.slice(0, 2).map(column => <th key={column} rowSpan={2} scope="col">{column}</th>)}
    <th colSpan={4} scope="colgroup">{model.columnGroups[0].text}</th>
  </tr><tr>{heading(model.columns.slice(2))}</tr></thead><tbody>
    {rows.map(row => <tr key={row.member}><th scope="row">{row.member}</th>
      <td>{row.progressPercent.approximate ? '約' : ''}{row.progressPercent.value}</td>
      {row.hoursByWeek.map((hours, i) => <td key={i}>{hours}</td>)}
    </tr>)}
  </tbody></table>;
}

function SalesSummary({ values }: { values: number[] }) {
  const model = source['q7-t3'];
  return <table><caption>{model.caption}</caption><thead><tr>
    <th rowSpan={2} scope="col">{model.rowHeader}</th>
    {model.columnGroups.map(group => <th key={group.year} colSpan={4} scope="colgroup">{group.year}年度</th>)}
  </tr><tr>{model.columnGroups.flatMap(group => group.columns.map(column => <th key={`${group.year}-${column}`} scope="col">{column}</th>))}</tr></thead>
    <tbody>{autumn2015Pm7Summary(values).map(([name, ...row]) => <tr key={name}><th scope="row">{name}</th>
      {row.map((cell, i) => <td key={i} className={cell === '網掛け' ? 'omitted-cell' : undefined}>
        {cell === '網掛け' ? <span className="sr-only">原資料で非表示の部分</span> : cell}</td>)}</tr>)}</tbody>
  </table>;
}

function useRingPatterns() {
  const id = useId(), line = `${id}-line`, dot = `${id}-dot`;
  return {
    colors: [ink, arrowUrl(line), arrowUrl(dot), ink, surface],
    patterns: <defs>
      <pattern id={line} width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill={surface} /><path d="M4 0v8" stroke={ink} />
      </pattern>
      <pattern id={dot} width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" fill={surface} /><circle cx="2" cy="2" r="0.9" fill={ink} />
        <circle cx="5.5" cy="5.5" r="0.9" fill={ink} />
      </pattern>
    </defs>,
  };
}

function ChartBlank({ field }: { field: 'b' | 'd' }) {
  const { colors, patterns } = useRingPatterns();
  return <>
    <div style={{ border: '1px solid var(--diagram-ink)', paddingBlock: '.3em', textAlign: 'center' }}><ContentBlank blank={field} /></div>
    {field === 'b' && <Svg width={335} height={43} minimum={260}>
      {patterns}{source['q7-f1'].legend.items.map(({ division }, i) => <g key={division}>
        <rect x={i * 65 + 20} y="10" width="28" height="19" fill={surface} />
        <rect x={i * 65 + 20} y="10" width="28" height="19" fill={colors[i]} fillOpacity={i === 0 ? '.45' : 1} stroke={ink} />
        <text x={i * 65 + 52} y="26">{division}</text>
      </g>)}
    </Svg>}
  </>;
}

function RingChart({ values }: { values: number[] }) {
  const { inner, outer } = autumn2015Pm7Ring(values);
  const { colors, patterns } = useRingPatterns(), center = 96;
  const point = (angle: number, radius: number) =>
    `${center + radius * Math.sin(angle * Math.PI / 180)} ${center - radius * Math.cos(angle * Math.PI / 180)}`;
  return <Svg width={192} height={192} minimum={142}>
    {patterns}
    {([[outer, 87], [inner, 54]] as const).map(([boundaries, radius]) => <g key={radius}>
      <circle cx={center} cy={center} r={radius + (radius === 54 ? 2 : 0)} fill={surface} stroke={ink} />
      {[...boundaries, 360].map((end, i) => {
        const start = boundaries[i - 1] ?? 0;
        return <path key={i} data-ring-angle={end}
          d={`M${center} ${center}L${point(start, radius)}A${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${point(end, radius)}Z`}
          stroke={ink} fill={colors[i]} fillOpacity={i === 0 ? '.45' : 1} />;
      })}
    </g>)}
  </Svg>;
}

function ParetoChart({ values }: { values: number[] }) {
  const { labels, scaled, cumulative } = autumn2015Pm7Pareto(values);
  const x = (step: number) => 39 + 33 * step;
  const y = (percent: number) => 150 - 1.22 * percent;
  return <Svg width={222} height={186} minimum={155}>
    <text x="23" y="16" textAnchor="middle">%</text>
    <path d={`M${x(0)} ${y(0)}V${y(100)}H${x(5)}V${y(0)}Z`} {...stroke} />
    {[0, 20, 40, 60, 80, 100].map(tick => <g key={tick}>
      <text x="34" y={y(tick) + 5} textAnchor="end">{tick}</text>
      <path d={`M${x(0)} ${y(tick)}h9`} {...stroke} />
    </g>)}
    {labels.map((label, i) => <g key={label}>
      <rect x={x(i)} y={y(scaled[i])} width="33" height={150 - y(scaled[i])} {...outline} />
      <text x={x(i + .5)} y="171" textAnchor="middle">{label}</text>
    </g>)}
    <polyline points={cumulative.map((value, i) => `${x(i)},${y(value)}`).join(' ')} {...stroke} strokeWidth="1.3" />
    {cumulative.slice(1).map((value, i) => <circle key={i} cx={x(i + 1)} cy={y(value)} r="2" />)}
  </Svg>;
}

const treePositions = {
  root: [24, 163], early: [466, 65], later: [466, 173], none: [466, 278],
  full: [938, 24], mostly: [938, 104], half: [938, 141], partial: [938, 216], zero: [938, 278],
} as const;

function DecisionTree({ values }: { values: number[] }) {
  const branches = autumn2015Pm7Tree(values), marker = useId();
  return <Svg width={970} height={334} minimum={825}>
    <Arrow id={marker} />
    {branches.map(({ source, target, probabilityPercent, label }) => {
      const [x1, y1] = treePositions[source], [x2, y2] = treePositions[target];
      const elbow = x1 + 51, ending = x2 - (source === 'root' ? 7 : 6);
      const topLevel = source === 'root';
      const labelX = elbow + 62;
      return <g key={target}>
        <path d={`M${x1} ${y1}H${elbow}V${y2}H${ending}`} {...stroke} markerEnd={arrowUrl(marker)} />
        <text x={elbow + 9} y={y2 - 7}>{probabilityPercent}%</text>
        {topLevel ? <text x={labelX} y={y2 - 26}>{label.slice(0, 16)}
          <tspan x={labelX} dy="19">{label.slice(16)}</tspan>
        </text> : <text x={labelX} y={y2 - 7}>{label}</text>}
      </g>;
    })}
    {source['q7-f3'].nodes.map(node => <circle key={node.id} cx={treePositions[node.id][0]} cy={treePositions[node.id][1]}
      r={node.kind === 'chance' ? 6 : 5} fill={node.kind === 'chance' ? surface : ink} stroke={ink} />)}
    <circle cx="23" cy="314" r="6" {...outline} /><text x="36" y="319">機会事象ノード</text>
    <circle cx="237" cy="314" r="5" /><text x="250" y="319">終端ノード</text>
  </Svg>;
}

function ArrayFigure({ values, id }: { values: number[]; id: 'q8-f1' | 'q8-f2' | 'q8-f3' | 'q8-f4' }) {
  const rows = autumn2015Pm8Rows(values, id), marker = useId(), arrow = arrowUrl(marker);
  const cell = 34, start = 95;
  const x = (index: number) => start + (index - 1) * cell;
  const y = (row: number) => 31 + row * (id === 'q8-f3' ? 79 : 57);
  const width = x(Math.max(...rows.map(row => row.alignToTextIndex + row.cells.length))) + 8;
  return <Svg width={width} height={y(rows.length - 1) + 45} minimum={width - 45}>
    <Arrow id={marker} />
    {rows.map((row, i) => <g key={i}>
      <text x="10" y={y(i) + 22}>{row.label}</text>
      {row.cells.map((value, j) => {
        const left = x(row.alignToTextIndex + j), top = y(i);
        return <g key={j}>
          {(id !== 'q8-f3' || i === 0) &&
            <text x={left + cell / 2} y={top - 7} textAnchor="middle" fontSize="14">{value.index}</text>}
          <rect x={left} y={top} width={cell} height="34" {...outline} />
          <text x={left + cell / 2} y={top + 23} textAnchor="middle">{typeof value.value === 'object' ? '…' : value.value}</text>
        </g>;
      })}
    </g>)}
    {id === 'q8-f3' && source[id].arrows.map(item => {
      if ('textIndex' in item) {
        const offset = item.textIndex === 8 ? (item.patternRow === 1 ? 7 : -7) : 0;
        const column = x(item.textIndex) + cell / 2 + offset, end = y(item.patternRow + 1);
        const top = y(0) + 34, crossesRow = item.patternRow === 2 && item.textIndex < 9;
        return <g key={item.label}>
          {crossesRow ? <>
            <path d={`M${column} ${top}V${y(2)}`} {...stroke} markerStart={arrow} />
            <path d={`M${column} ${y(2)}v34`} {...stroke} strokeDasharray="3 3" />
            <path d={`M${column} ${y(2) + 34}V${end}`} {...stroke} markerEnd={arrow} />
          </> : <path d={`M${column} ${top}V${end}`} {...stroke} markerStart={arrow} markerEnd={arrow} />}
          <text x={column + 3} y={end - 8} fontSize="13">{item.label}</text>
        </g>;
      }
      const top = y(item.toPatternRow + 1) + 17;
      const left = x(item.fromStartTextIndex), right = x(item.toStartTextIndex);
      return <g key={item.label}>
        <path d={`M${left} ${top - 7}v14M${left} ${top}H${right}`} {...stroke} strokeDasharray="4 3" markerEnd={arrow} />
        <text x={(left + right) / 2} y={top + 17} textAnchor="middle" fontSize="13">{item.label}</text>
      </g>;
    })}
  </Svg>;
}

function Program() {
  const lines = source['q8-program'].lines;
  return <div style={{ width: 'max-content', textAlign: 'start', fontFamily: 'monospace', lineHeight: 1.45,
    fontSize: 'calc(1em * var(--image-scale, 1))' }}>
    {lines.map((line, i) => {
      const guide = line.kind === 'ifStart' ? '▲' : line.kind === 'ifEnd' ? '▼' :
        line.kind.endsWith('Start') || line.kind === 'loopEnd' ? '■' : '・';
      return <div key={i} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        {Array.from({ length: line.depth }, (_, j) => <span key={j} aria-hidden="true"
          style={{ display: 'inline-block', width: '1.1em', alignSelf: 'stretch', borderInlineStart: `1px solid ${ink}` }} />)}
        <span aria-hidden="true" style={{ inlineSize: '1.1em' }}>{guide}</span>
        <span>{blankSegments(line.text).map((part, j) => typeof part === 'string' ? part : <ContentBlank key={j} blank={part.blank} />)}</span>
        {'labelArrow' in line && <span style={{ display: 'flex', marginInlineStart: '.5em', flex: '1', alignItems: 'center' }}>
          <span aria-hidden="true" style={{ lineHeight: 1 }}>◀</span>
          <span aria-hidden="true" style={{ borderBlockStart: `2px solid ${ink}`, minWidth: '4em', flex: 1 }} />
          <span>{line.labelArrow.label}</span>
        </span>}
      </div>;
    })}
  </div>;
}

type RenderItem = { native?: boolean; caption?: boolean; Component: (props: BookletFigureProps) => ReactNode };
const renderers: Record<string, RenderItem> = {
  '5-order-flow': { Component: OrderFlow },
  '5-file-fields': { native: true, caption: false, Component: FileFields },
  '5-decision-3': { native: true, caption: false, Component: ({ values }) => <DecisionTable values={values} id="q5-t3" /> },
  '5-decision-4': { native: true, caption: false, Component: ({ values }) => <DecisionTable values={values} id="q5-t4" /> },
  '5-decision-6': { native: true, caption: false, Component: ({ values }) => <DecisionTable values={values} id="q5-t6" /> },
  '5-action-choice': { native: true, caption: false, Component: ActionChoice },
  '6-schedule': { native: true, caption: false, Component: Schedule },
  '7-sales-summary': { native: true, caption: false, Component: SalesSummary },
  '7-ring-blank': { native: true, Component: () => <ChartBlank field="b" /> },
  '7-pareto-blank': { native: true, Component: () => <ChartBlank field="d" /> },
  '7-decision-tree': { Component: DecisionTree },
  '7-ring-choice': { caption: false, Component: RingChart },
  '7-pareto-choice': { caption: false, Component: ParetoChart },
  '8-f1': { Component: ({ values }) => <ArrayFigure values={values} id="q8-f1" /> },
  '8-f2': { Component: ({ values }) => <ArrayFigure values={values} id="q8-f2" /> },
  '8-f3': { Component: ({ values }) => <ArrayFigure values={values} id="q8-f3" /> },
  '8-f4': { Component: ({ values }) => <ArrayFigure values={values} id="q8-f4" /> },
  '8-program': { caption: false, Component: Program },
};

export const legacy2015AutumnPm0508FigureRenderers: BookletFigureRenderer[] = legacy2015AutumnPm0508Figures.map(({ profile, alt }) => {
  const kind = profile.slice('legacy-2015-autumn-pm-'.length);
  if (/^[5-8]-text-/.test(kind)) return { profile, component: ({ values }) => {
    const text = alt(values);
    return <ContentParagraph text={text} segments={blankSegments(text)} />;
  } };
  const item = renderers[kind];
  if (!item) throw new Error('FIGURE_PROFILE');
  const { Component } = item;
  return { profile, component: props => <figure className="managed-diagram source-figure" data-source-profile={kind}>
    <div className={item.native ? 'table-scroll' : 'diagram-scroll'} tabIndex={0} aria-label={props.caption}>
      {item.native ? <Component {...props} /> : <div role="img" aria-label={alt(props.values)}><Component {...props} /></div>}
    </div>
    {item.caption !== false && <figcaption>{props.caption}</figcaption>}
  </figure> };
});
