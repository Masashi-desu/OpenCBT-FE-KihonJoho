import { useId, type CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2013SpringPm0913Figures, type Cell } from '../core/generators/legacy-2013-spring-pm-09-13-figures';

const cellStyle: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.18em .42em', whiteSpace: 'pre' };
const headerStyle: CSSProperties = { ...cellStyle, background: 'var(--diagram-surface)' };
const scale = (value: number) => 'calc(' + value + 'px * var(--image-scale, 1))';

function Spreadsheet({ rows }: { rows: Cell[][] }) {
  return <table style={{ borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' }}>
    <thead>
      <tr>{rows[0].map((cell, index) => <th key={index} scope="col" style={headerStyle}>{String(cell)}</th>)}</tr>
    </thead>
    <tbody>{rows.slice(1).map((row, i) => <tr key={i}>
      {row.map((entry, j) => {
        const cell = typeof entry === 'string' ? { text: entry, cols: undefined, rows: undefined } : entry;
        if (j === 0) return <th key={j} scope="row" style={headerStyle}>{cell.text}</th>;
        return <td key={j} colSpan={cell.cols} rowSpan={cell.rows} style={cellStyle}>{cell.text}</td>;
      })}
    </tr>)}</tbody>
  </table>;
}

type DrawingProps = { caption: string; alt: string };
type Panel = ReturnType<(typeof legacy2013SpringPm0913Figures)[number]['panel']>;
function LadderDrawing({ caption, alt, size, top, bottom, rungs, path }: DrawingProps & Extract<Panel, { kind: 'ladder' }>) {
  const id = useId();
  const x = (position: number) => 34 + position * 75;
  const y = (height: number) => 31 + (top - height) * 155 / (top - bottom);
  return <svg viewBox="0 0 294 220" width={scale(294)} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
    <g stroke="currentColor" fill="none">
      {Array.from({ length: size }, (_, i) => <line key={i} x1={x(i)} x2={x(i)} y1={y(top)} y2={y(bottom)} />)}
      {rungs.map(([left, right, height]) => <line key={left + ':' + height} x1={x(left)} x2={x(right)} y1={y(height)} y2={y(height)} />)}
      <polyline strokeWidth="3" points={path.map(([position, height]) => x(position) + ',' + y(height)).join(' ')} />
    </g>
    <g fill="currentColor" textAnchor="middle" fontSize="16">
      {Array.from({ length: size }, (_, i) => <g key={i}>
        <text x={x(i)} y="21">{i}</text><text x={x(i)} y="209">{i}</text>
      </g>)}
    </g>
  </svg>;
}

function ReplacementDrawing({ caption, alt }: DrawingProps) {
  const id = useId();
  return <svg viewBox="0 0 545 170" width={scale(545)} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
    <defs><pattern id={id + '-hatch'} width="7" height="7" patternUnits="userSpaceOnUse">
      <path d="M0 7 7 0" stroke="currentColor" strokeOpacity=".35" />
    </pattern></defs>
    <g stroke="currentColor" fill="none">
      <rect x="98" y="32" width="425" height="29" />
      <rect x="255" y="32" width="110" height="29" strokeDasharray="4 2" fill={'url(#' + id + '-hatch)'} />
      <rect x="255" y="104" width="110" height="29" fill={'url(#' + id + '-hatch)'} />
      <path d="M304 99V75h-8l14-10 14 10h-8v24Z" />
      <path d="M255 137q0 7 12 7h31q12 0 12 7 0-7 12-7h31q12 0 12-7" />
    </g>
    <g fill="currentColor" fontSize="15">
      <text x="15" y="23">ビット位置</text><text x="15" y="51">ビット列 α</text><text x="175" y="123">ビット列 β</text>
      <text x="98" y="23">0</text><text x="177" y="23">…</text><text x="255" y="23">p</text>
      <text x="365" y="23">p+q</text><text x="437" y="23">…</text><text x="506" y="23">31</text>
      <text x="310" y="166" textAnchor="middle">qビット</text>
    </g>
  </svg>;
}

export const legacy2013SpringPm0913FigureRenderers: BookletFigureRenderer[] =
  legacy2013SpringPm0913Figures.map(figure => ({
    profile: figure.profile,
    component: ({ values, caption }) => {
      const panel = figure.panel(values), alt = figure.alt(values);
      return <figure className="managed-diagram source-figure" data-spring-2013-language-figure={figure.profile}>
        <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={alt} style={{ color: 'var(--diagram-ink)' }}>
          {panel.kind === 'sheet' && <Spreadsheet rows={panel.rows} />}
          {panel.kind === 'code-table' && <table style={{ borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' }}>
            <thead><tr><th scope="col" style={headerStyle}>処置</th><th scope="col" style={headerStyle}>変更内容</th></tr></thead>
            <tbody>{panel.rows.map(([placement, text]) => <tr key={placement}>
              <th scope="row" style={cellStyle}>{placement}</th>
              <td style={cellStyle}><pre style={{ margin: 0, whiteSpace: 'pre' }}><code>{text}</code></pre></td>
            </tr>)}</tbody>
          </table>}
          {panel.kind === 'ladder' && <LadderDrawing {...panel} caption={caption} alt={alt} />}
          {panel.kind === 'bit-replacement' && <ReplacementDrawing caption={caption} alt={alt} />}
        </div>
        <figcaption>{caption}</figcaption>
      </figure>;
    },
  }));
