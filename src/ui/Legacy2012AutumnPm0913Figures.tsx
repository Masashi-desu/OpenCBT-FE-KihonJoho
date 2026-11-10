import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2012AutumnPm0913Figures, type RecordCell } from '../core/generators/legacy-2012-autumn-pm-09-13-figures';

const size = (pixels: number) => 'calc(' + pixels + 'px * var(--image-scale, 1))';
const cell: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.18em .44em', whiteSpace: 'pre' };
const head: CSSProperties = { ...cell, background: 'var(--diagram-surface)' };
const tableStyle: CSSProperties = { fontSize: 'calc(.95em * var(--image-scale, 1))', width: 'max-content' };
const pre: CSSProperties = { margin: 0, whiteSpace: 'pre' };
type DrawingProps = { caption: string; alt: string };

function Drawing({ caption, alt, width, height, children }: DrawingProps & {
  width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
    style={{ display: 'block', width: size(width), maxWidth: 'none', height: 'auto' }}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
    <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
    </marker></defs>
    {children('url(#' + id + '-arrow)')}
  </svg>;
}
function DrawText({ x, y, children, left = false }: { x: number; y: number; children: ReactNode; left?: boolean }) {
  return <text x={x} y={y} textAnchor={left ? 'start' : 'middle'} fill="currentColor" stroke="none">{children}</text>;
}

function PointerDrawing({ tiers, ...text }: DrawingProps & { tiers: readonly (readonly string[])[] }) {
  const offsets = [32, 119, 242];
  return <Drawing {...text} width={555} height={340}>{arrow => <g aria-hidden="true" fill="none" stroke="currentColor" fontSize="14">
    <DrawText x={24} y={21} left>添字</DrawText><DrawText x={94} y={21}>win_list</DrawText>
    {[0, 1, 2, 3, 4, 5].map((index) => {
      const y = 36 + index * 29;
      return <g key={index}>
        <DrawText x={41} y={y + 19}>{index}</DrawText><rect x="63" y={y} width="65" height="29"/>
      </g>;
    })}
    {[0, 1, 5].map((tier, i) => {
      const y = offsets[i];
      const tableY = y + 16;
      const start = 50 + tier * 29;
      return <g key={tier} data-lottery-tier={tier + 1}>
        <path d={`M94 ${start}H154L214 ${tableY + 14}`} markerEnd={arrow}/>
        <DrawText x={248} y={y}>{tier + 1}等の番号表</DrawText>
        <DrawText x={458} y={y}>{tier + 1}等の当選番号</DrawText>
        {[...tiers[i], 'NULL'].map((value, j) => {
          const rowY = tableY + j * 24;
          return <g key={j}>
            <rect x="215" y={rowY} width="70" height="24"/>
            <DrawText x={198} y={rowY + 17}>{j}</DrawText>
            {value === 'NULL' ? <DrawText x={250} y={rowY + 17}>NULL</DrawText> : <>
              <path d={`M250 ${rowY + 12}H407`} markerEnd={arrow}/>
              <DrawText x={458} y={rowY + 17}>“{value}”</DrawText>
            </>}
          </g>;
        })}
      </g>;
    })}
    <DrawText x={248} y={221}>⋮</DrawText>
  </g>}</Drawing>;
}

type Point = { x: number; y: number; id: number; label: boolean };
const cityOutline = [
  [0.38, 2.45], [1.48, 1.75], [2.51, 1.14], [3.12, 1.57], [3.87, 1.48], [4.32, 2.15],
  [4.87, 3.15], [5.75, 3.26], [6.72, 3.16], [7.73, 2.72], [8.09, 1.76], [8.54, 1.61], [8.89, .66],
  [9.2, .96], [9.58, 1.78], [9.76, 2.46], [9.46, 3.65], [9.2, 4.15], [8.74, 4.29],
  [8.27, 5.03], [8.26, 5.74], [8.79, 6.02], [9.38, 6.27], [9.74, 6.96], [9.72, 8.59],
  [9.82, 9.48], [9.16, 9.68], [8.09, 9.39], [7.32, 8.86], [6.69, 8.46], [5.92, 7.94],
  [4.39, 7.75], [3.15, 7.51], [2.41, 7.1], [1.66, 6.63], [.96, 6.99], [.34, 6.91],
  [.1, 6.03], [.23, 5.22], [.35, 4.52], [.46, 3.51], [.25, 2.93],
];
function MeshDrawing({ points, ...text }: DrawingProps & { points: Point[] }) {
  const px = (x: number) => 33 + x * 37, py = (y: number) => 28 + y * 37;
  const ticks = Array.from({ length: 11 }, (_, i) => i);
  return <Drawing {...text} width={445} height={445}>{arrow => <g aria-hidden="true" fontSize="14">
    <g fill="none" stroke="currentColor">
      <path d={`M${px(0)} ${py(0)}H420`} markerEnd={arrow}/>
      <path d={`M${px(0)} ${py(0)}V419`} markerEnd={arrow}/>
      {points.map(point => <rect key={point.id} x={px(point.x)} y={py(point.y)} width="37" height="37"/>)}
      <polygon points={cityOutline.map(([x,y]) => px(x) + ',' + py(y)).join(' ')} strokeWidth="2"/>
    </g>
    {ticks.map(tick => <g key={tick}>
      <path d={`M${px(tick)} 25v6M30 ${py(tick)}h6`} stroke="currentColor"/>
      <DrawText x={px(tick)} y={20}>{tick}</DrawText>
      <DrawText x={18} y={py(tick) + 5}>{tick}</DrawText>
    </g>)}
    <DrawText x={431} y={33}>x</DrawText><DrawText x={32} y={434}>y</DrawText>
    <DrawText x={px(5)} y={py(5.65)}>S市</DrawText>
    {points.filter(point => point.label).map(point =>
      <DrawText key={point.id} x={px(point.x + .5)} y={py(point.y + .45)}>{point.id}</DrawText>)}
  </g>}</Drawing>;
}
function Spreadsheet({ rows }: { rows: string[][] }) {
  return <table style={tableStyle}>
    <thead><tr>{rows[0].map((value, i) => <th key={i} scope="col" style={head}>{value}</th>)}</tr></thead>
    <tbody>{rows.slice(1).map(([row, ...values]) => <tr key={row}>
      <th scope="row" style={head}>{row}</th>
      {values.map((value, i) => <td key={i} style={cell}>{value}</td>)}
    </tr>)}</tbody>
  </table>;
}
function RecordLayout({ cells }: { cells: readonly RecordCell[] }) {
  return <table style={tableStyle}>
    <thead>
      {cells.some(c => c.group) && <tr>
        <th colSpan={2} style={cell}></th><th scope="colgroup" colSpan={3} style={head}>個人情報</th><th style={cell}></th>
      </tr>}
      <tr>{cells.map(c => <th key={c.label} scope="col" style={{ ...head, minWidth: size(Math.max(84, c.width * 6)) }}>{c.label}</th>)}</tr>
    </thead>
    <tbody><tr>{cells.map(c => <td key={c.label} style={cell}>{c.width}桁</td>)}</tr></tbody>
  </table>;
}

export const legacy2012AutumnPm0913FigureRenderers: BookletFigureRenderer[] =
  legacy2012AutumnPm0913Figures.map(figure => ({
    profile: figure.profile,
    component: ({ values, caption }) => {
      const panel = figure.panel(values), alt = figure.alt(values);
      return <figure className="managed-diagram source-figure" data-autumn-2012-language-figure={figure.profile}>
        <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={alt} style={{ color: 'var(--diagram-ink)' }}>
          {panel.kind === 'pointers' && <PointerDrawing tiers={panel.tiers} caption={caption} alt={alt}/>}
          {panel.kind === 'record' && <RecordLayout cells={panel.cells}/>}
          {panel.kind === 'program-changes' && <table style={tableStyle}>
            <thead><tr><th scope="col" style={head}>処置</th><th scope="col" style={head}>変更内容</th></tr></thead>
            <tbody>{panel.rows.map(([placement, text]) => <tr key={placement}>
              <th scope="row" style={cell}>{placement}</th><td style={cell}><pre style={pre}><code>{text}</code></pre></td>
            </tr>)}</tbody>
          </table>}
          {panel.kind === 'output' && <table style={tableStyle}><tbody><tr><td style={cell}><pre style={pre}><code>{panel.text}</code></pre></td></tr></tbody></table>}
          {panel.kind === 'mesh' && <MeshDrawing points={panel.points} caption={caption} alt={alt}/>}
          {panel.kind === 'sheet' && <Spreadsheet rows={panel.rows}/>}
        </div>
        <figcaption>{caption}</figcaption>
      </figure>;
    },
  }));
