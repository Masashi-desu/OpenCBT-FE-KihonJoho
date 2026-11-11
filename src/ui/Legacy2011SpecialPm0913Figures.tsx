import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2011SpecialPm0913Figures as figures } from '../core/generators/legacy-2011-special-pm-09-13-figures';
import { type LanguagePanel, type Table, wordBits } from '../core/generators/legacy-2011-special-pm-09-13-support';

const scaled = 'calc(1em * var(--image-scale, 1))';
const cellStyle: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.22em .48em', whiteSpace: 'pre', textAlign: 'center', verticalAlign: 'middle' };
const tableStyle: CSSProperties = { width: 'max-content', borderCollapse: 'collapse', fontSize: scaled };
const codeStyle: CSSProperties = { margin: 0, whiteSpace: 'pre', textAlign: 'left', fontSize: '1em' };
const sentenceStyle: CSSProperties = { ...cellStyle, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', width: '26em', minWidth: '15em', textAlign: 'left', verticalAlign: 'top' };

function DataTable({ data, caption }: { data: Table; caption: string }) {
  const { headers, rows, merges = [], showHeaders = true } = data;
  return <table aria-label={data.caption ?? caption} style={tableStyle}>
    {data.caption && <caption>{data.caption}</caption>}
    {showHeaders && <thead><tr>{headers.map((text, i) => <th key={i} scope="col" style={cellStyle}>{text}</th>)}</tr></thead>}
    <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((text, ci) => {
      const merge = merges.find(({ row, column, rowSpan, colSpan }) => ri >= row && ri < row + rowSpan && ci >= column && ci < column + colSpan);
      if (merge && (ri !== merge.row || ci !== merge.column)) return null;
      const spans = merge ? { rowSpan: merge.rowSpan, colSpan: merge.colSpan } : {};
      if (ci === 0 && (showHeaders || rows.length > 1))
        return <th key={ci} scope={merge && merge.rowSpan > 1 ? 'rowgroup' : 'row'} style={cellStyle} {...spans}>{text}</th>;
      const changeCode = headers[ci] === '変更内容';
      const style = headers[ci] === '説明' ? sentenceStyle : cellStyle;
      return <td key={ci} style={style} {...spans}>{changeCode ? <pre style={codeStyle}><code>{text}</code></pre> : text}</td>;
    })}</tr>)}</tbody>
  </table>;
}

function Svg({ caption, description, width, height, children, compact = false, bitmap = false }: {
  caption: string; description: string; width: number; height: number; children: ReactNode; compact?: boolean; bitmap?: boolean;
}) {
  const id = useId();
  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
    className={bitmap ? 'legacy-2011-special-pm-bitmap' : undefined}
    style={{ display: 'block', width: compact ? `min(100%, calc(${width}px * var(--image-scale, 1)))` : `max(100%, calc(${width}px * var(--image-scale, 1)))`,
      height: 'auto', color: 'var(--diagram-ink)' }}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{description}</desc>
    <g aria-hidden="true">{children}</g>
  </svg>;
}

function Seats({ panel, caption, description }: { panel: Extract<LanguagePanel, { kind: 'seats' }>; caption: string; description: string }) {
  const width = 650, height = 462, firstY = 73, gap = 34, seatWidth = 23, center = 331;
  const leftEdge = (letters: string) => center - gap - letters.length * seatWidth;
  const firstX = leftEdge(panel.rows[0].before) + seatWidth / 2;
  const markedIndex = panel.rows.findIndex(row => row.row === panel.marked.row);
  const markX = leftEdge(panel.rows[markedIndex].before) + (panel.marked.number - 0.5) * seatWidth;
  const markY = firstY + 30 * markedIndex;
  return <Svg caption={caption} description={description} width={width} height={height}>
    <g stroke="currentColor" strokeWidth="1.5" fill="none">
      <path d="M151 48L88 119V424H565V119L511 48" />
      <rect x="151" y="20" width="360" height="28" />
      <path d={`M${firstX - 58},54L${firstX},${firstY}m-7-7 7 7-10 1`} />
      <path d={`M${markX + 103},${markY + 30}H${markX}V${markY + 24}m-4 7 4-7 4 7`} />
    </g>
    <g fill="currentColor" fontSize="16" textAnchor="middle">
      <text x={center} y="40">{panel.stage}</text>
      <text x={firstX - 64} y="49">{panel.rows[0].row}列1番</text>
      <text x={markX + 140} y={markY + 35}>{panel.marked.row}列{panel.marked.number}番</text>
      {panel.rows.map(({ row, before, after }, i) => {
        const y = firstY + 30 * i;
        if (row === '⋮') return <g key={i}><text x="171" y={y + 18}>⋮</text><text x="493" y={y + 18}>⋮</text></g>;
        const left = leftEdge(before);
        return <g key={i}>
          <text x={left - 22} y={y + 17}>{row}列</text>
          {[...before, ...after].map((letter, number) => {
            const x = number < before.length ? left + number * seatWidth : center + gap + (number - before.length) * seatWidth;
            const emphasized = (i === 0 && number === 0) || (row === panel.marked.row && number + 1 === panel.marked.number);
            return <g key={number}><rect x={x} y={y} width={seatWidth} height="23" fill="none" stroke="currentColor" strokeWidth={emphasized ? 3 : 1} />
              <text x={x + seatWidth / 2} y={y + 17}>{letter}</text></g>;
          })}
          <path d={`M${center - gap},${y}H${center + gap}M${center - gap},${y + 23}H${center + gap}`} stroke="currentColor" strokeDasharray="5 4" />
          <text x={center} y={y + 17}>…</text>
        </g>;
      })}
    </g>
  </Svg>;
}

function BitmapPanel({ panel, caption, description }: { panel: Extract<LanguagePanel, { kind: 'bitmaps' }>; caption: string; description: string }) {
  const grid = panel.axes ? 256 : 156, step = grid / 16;
  const originY = panel.axes ? 38 : 2;
  const width = panel.axes ? 704 : grid + 4, height = panel.axes ? 333 : grid + 4;
  const gridLines = Array.from({ length: 17 }, (_, i) => `M${step * i},0V${grid} M0,${step * i}H${grid}`).join(' ');
  return <Svg caption={caption} description={description} width={width} height={height} compact={!panel.axes} bitmap>
    {panel.pictures.map(({ label, words }, i) => {
      const originX = panel.axes ? 80 + 362 * i : 2;
      return <g key={i} transform={`translate(${originX} ${originY})`}>
        <rect width={grid} height={grid} fill="var(--visual-2011-special-bitmap-zero)" />
        {words.flatMap((word, y) => [...wordBits(word)].map((bit, x) => bit === '1'
          ? <rect key={`${y}-${x}`} x={x * step} y={y * step} width={step} height={step} data-bit-dot={`${y}:${x}`} fill="var(--visual-2011-special-bitmap-one)" /> : null))}
        <path d={gridLines} stroke="var(--visual-2011-special-bitmap-one)" strokeWidth=".6" fill="none" />
        {panel.scope && <rect width={panel.scope * step} height={panel.scope * step}
          fill="none" stroke="var(--visual-2011-special-bitmap-boundary)" strokeWidth="3" />}
        {panel.axes && <g fill="currentColor" fontSize="15">
          <text x="-55" y="-14">ビット</text><text x="0" y="-14">15</text>
          <text x={step * 4} y="-14">…</text><text x={step * 7} y="-14">8</text>
          <text x={step * 11} y="-14">…</text><text x={step * 15} y="-14">0</text>
          <g textAnchor="end">
            <text x="-6" y={step * 0.75}>{i ? '(GR2)' : '(GR1)'}+0</text>
            <text x="-6" y={step * 1.75}>+1</text><text x="-6" y={step * 2.75}>+2</text>
            <text x="-6" y={step * 4.75}>⋮</text><text x="-6" y={step * 7.75}>+7</text>
            <text x="-6" y={step * 11.75}>⋮</text><text x="-6" y={step * 15.75}>+15</text>
          </g>
          <text x={grid / 2} y={grid + 26} textAnchor="middle">{label.split('（')[0]}</text>
        </g>}
      </g>;
    })}
    {panel.axes && <path d="M352 163h55m-9-5 9 5-9 5" fill="none" stroke="currentColor" strokeWidth="1.8" />}
  </Svg>;
}

function visual(panel: LanguagePanel, caption: string, description: string) {
  switch (panel.kind) {
    case 'seats': return <Seats panel={panel} caption={caption} description={description} />;
    case 'bitmaps': return <BitmapPanel panel={panel} caption={caption} description={description} />;
    case 'tables': return <>{panel.note && <p style={{ margin: '0 0 .2em', fontSize: scaled }}>{panel.note}</p>}
      {panel.tables.map((table, i) => <DataTable key={i} data={table} caption={caption} />)}</>;
    case 'output': return <table style={tableStyle} aria-label={caption}><tbody><tr><td style={cellStyle}><pre style={codeStyle}><code>{panel.text}</code></pre></td></tr></tbody></table>;
  }
}

export const legacy2011SpecialPm0913FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component({ values, caption }) {
    const panel = figure.panel(values), description = figure.alt(values);
    const content = visual(panel, caption, description);
    if (panel.kind === 'bitmaps' && !panel.axes)
      return <span data-figure-profile={figure.profile}>{content}</span>;
    const isTable = panel.kind === 'tables' || panel.kind === 'output';
    return <figure className="managed-diagram source-figure" data-figure-profile={figure.profile}
      {...(isTable ? { role: 'group', 'aria-label': caption, 'aria-description': description } : {})}>
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>{content}</div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}));
