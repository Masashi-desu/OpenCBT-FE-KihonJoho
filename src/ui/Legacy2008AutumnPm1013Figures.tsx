import React, { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2008AutumnPm1013Figures as figures } from '../core/generators/legacy-2008-autumn-pm-10-13-figures';
import type { LanguagePanel } from '../core/generators/legacy-2008-autumn-pm-10-13-support';

function CipherSteps({ panel, caption, profile }: {
  panel: Extract<LanguagePanel, { kind: 'cipher-steps' }>;
  caption: string;
  profile: string;
}) {
  const id = useId();
  const { rowStep, columnStep } = panel;
  const diagrams = [
    { title: '③ 2文字が同一の場合', routes: [[4, 1, 4 + columnStep, 1 + rowStep, '◇', '◆']] },
    { title: '④ 2文字が同じ行にある場合', routes: [[3, 1, 3 + columnStep, 1, '○', '●'], [6, 1, 6 + columnStep, 1, '□', '■']] },
    { title: '⑤ 2文字が同じ列にある場合', routes: [[4, 1, 4, 1 + rowStep, '○', '●'], [4, 3 - (rowStep + 1), 4, 3 - (rowStep + 1) + rowStep, '□', '■']] },
    { title: '⑥ その他の場合', routes: [[3, 1, 6, 1, '○', '●'], [6, 3, 3, 3, '□', '■']] },
  ] as const;
  // Keep the same-column example at two distinct, in-range row pairs for both directions.
  const sameColumnRoutes = rowStep > 0
    ? [[4, 0, 4, 1, '○', '●'], [4, 2, 4, 3, '□', '■']] as const
    : [[4, 1, 4, 0, '○', '●'], [4, 3, 4, 2, '□', '■']] as const;
  return <figure className="managed-diagram source-figure" style={{ position: 'relative', minWidth: 0 }}>
    <div className="diagram-scroll" data-figure-profile={profile} tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox="0 0 596 326" role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(596px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-description'}>{panel.alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L8 4L0 8Z" fill="currentColor" /></marker></defs>
        <g aria-hidden="true" fontSize="14" fill="currentColor">
          {diagrams.map(({ title, routes }, i) => <g key={title} transform={`translate(${i % 2 * 292 + 6} ${Math.floor(i / 2) * 134 + 4})`}>
            <text x="2" y="15">ctbl［行］［列］</text>
            <text x="87" y="15" textAnchor="middle">0</text><text x="161" y="15" textAnchor="middle">…</text>
            <text x="250" y="15" textAnchor="middle">22</text>
            {[0, 2, 3, 4, 5, 6, 7, 9].map(column => <g key={column}>{[0, 1, 2, 3].map(row =>
              <rect key={row} x={78 + column * 18} y={21 + row * 18} width="18" height="18" stroke="currentColor" fill="none" />)}</g>)}
            {[0, 1, 2, 3].map(row => <text key={row} x="73" y={34 + row * 18} textAnchor="end">{row}</text>)}
            {(i === 2 ? sameColumnRoutes : routes).map(([column, row, toColumn, toRow, before, after]) => {
              const x = 87 + column * 18, y = 30 + row * 18, tx = 87 + toColumn * 18, ty = 30 + toRow * 18;
              const xDelta = tx - x, yDelta = ty - y;
              const length = Math.hypot(xDelta, yDelta);
              const shiftX = xDelta / length * 7, shiftY = yDelta / length * 7;
              return <g key={before}>
                <path d={`M${x + shiftX} ${y + shiftY}L${tx - shiftX} ${ty - shiftY}`} stroke="currentColor" fill="none" markerEnd={`url(#${id}-arrow)`} />
                <text x={x} y={y + 5} textAnchor="middle">{before}</text>
                <text x={tx} y={ty + 5} textAnchor="middle">{after}</text>
              </g>;
            })}
            <text x="78" y="112">{title}</text>
          </g>)}
          <text x="83" y="272">◇：平文の1，2文字目　◆：1，2文字目の換字の結果</text>
          <text x="83" y="293">○：平文の1文字目　　●：1文字目の換字の結果</text>
          <text x="83" y="314">□：平文の2文字目　　■：2文字目の換字の結果</text>
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const cell = { border: '1px solid currentColor', whiteSpace: 'pre', padding: '0.08em 0.25em', minWidth: '1.15em' } as const;
const tableStyle = { width: 'max-content', borderCollapse: 'collapse', textAlign: 'center' } as const;
const sourceCode = { margin: 0, fontSize: '1em', fontFamily: 'monospace', whiteSpace: 'pre', textAlign: 'start' } as const;

function HtmlPanel({ panel, caption, profile }: {
  panel: Exclude<LanguagePanel, { kind: 'cipher-steps' }>;
  caption: string;
  profile: string;
}) {
  const mapping = profile.endsWith('-numeric-enumeration');
  return <figure className="managed-diagram source-figure" style={{ position: 'relative', minWidth: 0, maxWidth: '100%' }}>
    <div className="diagram-scroll" data-figure-profile={profile} role="group" tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'} aria-description={panel.alt}
      style={{ fontSize: 'calc(16px * var(--image-scale, 1))', color: 'var(--diagram-ink)' }}>
      {panel.kind === 'output' ? <table style={tableStyle} aria-label={caption}>
        <tbody><tr><td style={{ ...cell, padding: '0.25em 0.5em', textAlign: 'start' }}>
          <pre style={sourceCode}>{panel.text}</pre>
        </td></tr></tbody>
      </table> :
        <div style={{ display: mapping ? 'flex' : 'grid', alignItems: 'center', width: 'max-content', gap: '0.6em' }}>
          {panel.tables.map(({ label, headings, rows, codeColumns }, tableIndex) =>
            <React.Fragment key={tableIndex}>
              {mapping && tableIndex === 1 && <span aria-hidden="true">変換 →</span>}
              <table style={tableStyle} aria-label={label ?? caption}>
                {label && <caption>{label}</caption>}
                {headings && <thead><tr>{headings.map((heading, column) => <th key={column} scope="col" style={cell}>{heading}</th>)}</tr></thead>}
                <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, column) =>
                  <td key={column} style={cell}>{codeColumns?.includes(column) ? <pre style={sourceCode}>{value}</pre> : value}</td>)}</tr>)}</tbody>
              </table>
            </React.Fragment>)}
        </div>}
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2008AutumnPm1013FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component: ({ values, caption }: BookletFigureProps) => {
    const panel = figure.panel(values);
    return panel.kind === 'cipher-steps' ? <CipherSteps panel={panel} caption={caption} profile={figure.profile} /> :
      <HtmlPanel panel={panel} caption={caption} profile={figure.profile} />;
  },
}));
