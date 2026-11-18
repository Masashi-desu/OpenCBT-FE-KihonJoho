import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { dictionaryFigure, dictionaryView, autocompleteFigure, autocompleteChanges } from '../core/generators/legacy-2006-spring-pm-10';
import { trainReport, countedTrip, timeTableChanges } from '../core/generators/legacy-2006-spring-pm-11';
import { solitaireCardLabel, solitaireFigure } from '../core/generators/legacy-2006-spring-pm-12';

type SceneProps = { caption: string; alt: string; width: number; height: number; children: (arrow: string) => ReactNode };

function Scene({ caption, alt, width, height, children }: SceneProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        viewBox={'0 0 ' + width + ' ' + height}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" orient="auto"
          refX="9" refY="5" markerWidth="8" markerHeight="8">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
        </marker></defs>
        <g fontSize="15" fill="currentColor">{children('url(#' + id + '-arrow)')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Dictionary({ caption, values }: BookletFigureProps) {
  const { roots, alt } = dictionaryFigure.panel(values);
  type Letter = typeof roots[number];
  const items: { node: Letter; path: string; column: number; depth: number; following: boolean; replacing?: number }[] = [];
  let rightmost = 0, deepest = 0;
  function place(siblings: readonly Letter[], prefix: string, depth: number, firstColumn: number): number {
    let column = firstColumn;
    for (const [index, node] of siblings.entries()) {
      const path = prefix + node.letter;
      const item = { node, path, column, depth, following: node.children.length !== 0,
        replacing: undefined as number | undefined };
      items.push(item);
      deepest = Math.max(depth, deepest);
      rightmost = Math.max(column, rightmost);
      column = node.children.length ? place(node.children, path, depth + 1, column) : column + 1;
      if (index + 1 < siblings.length) item.replacing = column;
    }
    return column;
  }
  place(roots, '', 0, 0);
  const xFor = (column: number) => 40 + 178 * column;
  const yFor = (depth: number) => 47 + 96 * depth;
  const legendY = yFor(deepest) + 106;
  return <Scene caption={caption} alt={alt} width={xFor(rightmost) + 164} height={legendY + 63}>
    {arrow => <>
      <path d="M 161 18 H 57 V 46" fill="none" stroke="currentColor" markerEnd={arrow}/>
      <text x="167" y="23">p_root</text>
      {items.map(({ node, path, column, depth, following, replacing }) => {
        const x = xFor(column), y = yFor(depth);
        return <g key={path} data-dictionary-path={path}>
          <rect x={x} y={y} width="100" height="40" fill="none" stroke="currentColor"/>
          <path d={'M ' + (x + 50) + ' ' + y + ' v 40 M ' + x + ' ' + (y + 20) + ' h 100'}
            stroke="currentColor" fill="none"/>
          <g fontSize="14" textAnchor="middle">
            <text x={x + 25} y={y + 15}>{node.letter}</text>
            {replacing === undefined && <text x={x + 75} y={y + 15}>NULL</text>}
            {!following && <text x={x + 25} y={y + 35}>NULL</text>}
            {!node.translation && <text x={x + 75} y={y + 35}>NULL</text>}
          </g>
          {replacing !== undefined && <path d={'M ' + (x + 73) + ' ' + (y + 10) + ' H ' + xFor(replacing)}
            stroke="currentColor" fill="none" markerEnd={arrow}/>}
          {following && <path d={'M ' + (x + 25) + ' ' + (y + 30) + ' V ' + yFor(depth + 1)}
            stroke="currentColor" fill="none" markerEnd={arrow}/>}
          {node.translation && <>
            <path d={'M ' + (x + 75) + ' ' + (y + 30) + ' V ' + (y + 56)}
              stroke="currentColor" fill="none" markerEnd={arrow}/>
            <rect x={x + 29} y={y + 56} width="123" height="25" fill="none" stroke="currentColor"/>
            <text x={x + 90} y={y + 74} textAnchor="middle">{node.translation}</text>
          </>}
        </g>;
      })}
      <text x="42" y={legendY - 12}>LETTER</text>
      <rect x="40" y={legendY} width="143" height="43" fill="none" stroke="currentColor"/>
      <path d={'M 111 ' + legendY + ' v 43 M 40 ' + (legendY + 21) + ' h 143'} stroke="currentColor"/>
      <text x="50" y={legendY + 16}>c</text><text x="120" y={legendY + 16}>other</text>
      <text x="50" y={legendY + 38}>follow</text><text x="120" y={legendY + 38}>trans</text>
    </>}
  </Scene>;
}

function SearchView({ caption, values }: BookletFigureProps) {
  const panel = dictionaryView.panel(values);
  const fields = [
    { value: panel.translation, label: '訳語表示領域', y: 22, height: 86 },
    { value: panel.view, label: '検索語入力領域', y: 116, height: 28 },
  ];
  return <Scene caption={caption} alt={panel.alt} width={585} height={164}>
    {arrow => <>
      <rect x="17" y="14" width="307" height="138" fill="none" stroke="currentColor"/>
      {fields.map(({ value, label, y, height }) => <g key={label}>
        <rect x="25" y={y} width="291" height={height} fill="none" stroke="currentColor"/>
        <text x="42" y={y + 20}>{value}</text>
        <path d={'M 425 ' + (y + height / 2) + ' H 316'} stroke="currentColor" markerEnd={arrow}/>
        <text x="437" y={y + height / 2 + 5}>{label}</text>
      </g>)}
    </>}
  </Scene>;
}

function CompletionView({ caption, values }: BookletFigureProps) {
  const panel = autocompleteFigure.panel(values);
  return <Scene caption={caption} alt={panel.alt} width={584} height={119}>
    {arrow => panel.rows.map(([input, completed], i) => {
      const y = 13 + i * 50;
      return <g key={input} fontFamily="monospace">
        <rect x="20" y={y} width="224" height="31" fill="none" stroke="currentColor"/>
        <rect x="335" y={y} width="226" height="31" fill="none" stroke="currentColor"/>
        <text x="34" y={y + 20}>{input}</text><text x="350" y={y + 20}>{completed}</text>
        <path d={'M 261 ' + (y + 16) + ' H 317'} stroke="currentColor" markerEnd={arrow}/>
      </g>;
    })}
  </Scene>;
}

function Report({ caption, values, figure }: BookletFigureProps & { figure: typeof trainReport | typeof countedTrip }) {
  const panel = figure.panel(values);
  const width = 678, height = 45 + 25 * panel.rows.length;
  const x = (column: number) => 162 + 90 * column;
  return <Scene caption={caption} alt={panel.alt} width={width} height={height}>
    {() => <g fontFamily="monospace">
      <rect x="9" y="10" width={width - 18} height={height - 20} fill="none" stroke="currentColor"/>
      <text x="22" y="32">TIME</text>
      {panel.sectionNames.map((name, i) => <text key={name} x={x(i)} y="32" textAnchor="middle">{name}</text>)}
      {panel.rows.map((row, i) => {
        const y = 57 + 25 * i;
        return <g key={i}>
          <text x="22" y={y}>{row.title}</text><text x="77" y={y}>{row.way}</text>
          {row.cells.map(({ label, highlight }, j) => <g key={j}>
            {highlight && <rect x={x(j) - 41} y={y - 15} width="82" height="21" fill="var(--selected-surface)"
              stroke="currentColor" strokeDasharray="2 1" data-counted-section={panel.sectionNames[j]}/>}
            <text x={x(j)} y={y} textAnchor="middle">{label}</text>
          </g>)}
        </g>;
      })}
    </g>}
  </Scene>;
}

function ChangeTable({ caption, values, figure }: BookletFigureProps & { figure: typeof autocompleteChanges }) {
  const panel = figure.panel(values);
  const width = 804;
  const rows = [['処置', 'プログラムの変更内容'], ...panel.rows]
    .map(row => row.map(cell => cell.split('\n')));
  const heights = rows.map(row => 12 + 21 * Math.max(...row.map(lines => lines.length)));
  const height = 20 + heights.reduce((sum, size) => sum + size, 0);
  return <Scene caption={caption} alt={panel.alt} width={width} height={height}>
    {() => <>
      <rect x="12" y="9" width={width - 24} height={height - 20} fill="none" stroke="currentColor"/>
      <path d={'M 180 9 V ' + (height - 11)} stroke="currentColor"/>
      {rows.map(([procedure, program], row) => {
        const top = 9 + heights.slice(0, row).reduce((sum, size) => sum + size, 0);
        return <g key={row} data-program-row={row}>
          {row > 0 && <path d={'M 12 ' + top + ' H ' + (width - 12)} stroke="currentColor"/>}
          {procedure.map((line, i) => <text key={i} x="23" y={top + 22 + i * 21}>{line}</text>)}
          {program.map((line, i) => <text key={i} x="191" y={top + 22 + i * 21} fontFamily={row ? 'monospace' : undefined}
            xmlSpace="preserve">{line}</text>)}
        </g>;
      })}
    </>}
  </Scene>;
}

function Solitaire({ caption, values }: BookletFigureProps) {
  const panel = solitaireFigure.panel(values), step = panel.width * 37 + 56;
  return <Scene caption={caption} alt={panel.alt} width={3 * step - 16} height={253}>
    {arrow => panel.boards.map((board, stage) => {
      const x0 = 12 + (stage === 3 ? 48 : stage * step);
      const y0 = stage === 3 ? 159 : 17;
      const boardRows = Math.ceil(board.values.length / panel.width);
      const center = y0 + 20 + 20 * (boardRows - 1);
      return <g key={stage} aria-hidden="true" data-solitaire-stage={stage + 1}>
        {stage < 2 && <path d={'M ' + (x0 + panel.width * 37) + ' ' + center + ' h 41'}
          stroke="currentColor" markerEnd={arrow}/>}
        {stage === 3 && <path d={'M ' + (x0 - 50) + ' ' + center + ' h 40'}
          stroke="currentColor" markerEnd={arrow}/>}
        {board.values.map((rank, i) => {
          const x = x0 + 37 * (i % panel.width), y = y0 + 42 * Math.floor(i / panel.width);
          const selected = board.chosen?.includes(i), other = board.alternatives.some(pair => pair.includes(i));
          return <g key={i} data-position={i} data-card={rank} data-pair={selected ? 'selected' : other ? 'alternative' : undefined}>
            <rect x={x} y={y} width="31" height="35" stroke="currentColor"
              fill={selected ? 'currentColor' : other ? 'var(--selected-surface)' : 'var(--surface)'}
              strokeDasharray={other && !selected ? '2 1' : undefined}/>
            <text x={x + 15.5} y={y + 24} fontSize="20" textAnchor="middle"
              fill={selected ? 'var(--surface)' : 'currentColor'}>{solitaireCardLabel(rank)}</text>
          </g>;
        })}
      </g>;
    })}
  </Scene>;
}

export const legacy2006SpringPm1013FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: dictionaryFigure.profile, component: Dictionary },
  { profile: dictionaryView.profile, component: SearchView },
  { profile: autocompleteFigure.profile, component: CompletionView },
  { profile: autocompleteChanges.profile, component: props => <ChangeTable {...props} figure={autocompleteChanges}/> },
  { profile: trainReport.profile, component: props => <Report {...props} figure={trainReport}/> },
  { profile: countedTrip.profile, component: props => <Report {...props} figure={countedTrip}/> },
  { profile: timeTableChanges.profile, component: props => <ChangeTable {...props} figure={timeTableChanges}/> },
  { profile: solitaireFigure.profile, component: Solitaire },
];
