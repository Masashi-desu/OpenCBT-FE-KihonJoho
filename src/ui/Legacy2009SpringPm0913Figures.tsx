import React, { type CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2009SpringPm0913Figures as figures } from '../core/generators/legacy-2009-spring-pm-09-13-figures';
import type { LanguagePanel, LanguageTable } from '../core/generators/legacy-2009-spring-pm-09-13-support';

const scaled = 'calc(1em * var(--image-scale, 1))';
const cell: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.22em .48em', whiteSpace: 'pre', textAlign: 'center' };
const tableStyle: CSSProperties = { width: 'max-content', borderCollapse: 'collapse', fontSize: scaled };
const codeStyle: CSSProperties = { margin: 0, whiteSpace: 'pre', textAlign: 'left', fontSize: '1em' };
const shaded: CSSProperties = { ...cell, background: 'var(--soft-surface)' };
const svgStyle = (width: number): CSSProperties => ({
  display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', color: 'var(--diagram-ink)',
});

function DataTable({ data, caption }: { data: LanguageTable; caption: string }) {
  const { headers, rows, shaded: blanks = [], codeColumns = [], rowHeaders } = data;
  return <table aria-label={caption} style={tableStyle}>
    <thead><tr>{headers.map((text, column) => <th key={column} scope="col" style={cell}>{text}</th>)}</tr></thead>
    <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((text, column) => {
      if (rowHeaders && column === 0) return <th key={column} scope="row" style={cell}>{text}</th>;
      const omitted = blanks.some(([r, c]) => r === rowIndex && c === column);
      return <td key={column} style={omitted ? shaded : cell} data-unused-cell={omitted || undefined}
        aria-label={omitted ? 'データなし' : undefined}>
        {codeColumns.includes(column) ? <pre style={codeStyle}><code>{text}</code></pre> : text}
      </td>;
    })}</tr>)}</tbody>
  </table>;
}

function Tree({ nodes }: Extract<LanguagePanel, { kind: 'tree' }>) {
  return <svg aria-hidden="true" viewBox="0 0 577 313" style={svgStyle(577)}>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      {nodes.map((node, i) => node.parent === undefined ? null : <line key={i}
        x1={nodes[node.parent].x} y1={nodes[node.parent].y} x2={node.x} y2={node.y} />)}
      {nodes.map((node, i) => node.kind === 'directory'
        ? <ellipse key={i} cx={node.x} cy={node.y} rx="28" ry="14" fill="var(--diagram-surface)" />
        : <rect key={i} x={node.x - 55} y={node.y - 14} width="110" height="28" fill="var(--diagram-surface)" />)}
      <ellipse cx="46" cy="33" rx="22" ry="11" /><rect x="24" y="52" width="44" height="21" />
    </g>
    <g fill="currentColor" fontSize="14">
      {nodes.map((node, i) => <text key={i} x={node.x} y={node.y + 5} textAnchor="middle">{node.label}</text>)}
      <text x="24" y="15">（凡例）</text><text x="75" y="38">：ディレクトリ</text>
      <text x="75" y="68">：ファイル</text><text x="398" y="44">←ルートディレクトリ</text>
    </g>
  </svg>;
}

const x = (column: number) => 185 + column * 32;
const y = (row: number) => 27 + row * 53;

function GapGuide({ start, end, from, to }: { start: number; end: number; from: number; to: number }) {
  return <line x1={x(start)} y1={y(from) + 32} x2={x(end)} y2={y(to)}
    stroke="currentColor" strokeDasharray="3 3" fill="none" />;
}

function GapDiagram({ rows, mark, mode }: Extract<LanguagePanel, { kind: 'gap' }>) {
  const height = mode === 'overview' ? 162 : mode === 'cursor' ? 82 : 194;
  const limit = mode === 'overview' ? rows[0].before.length : mode === 'cursor' ? rows[0].before.length + rows[0].after.length : 3;
  const left = rows[0].before.length, right = rows[1]?.before.length ?? 0, gap = rows[0].gap;
  const from = right > left ? left + gap : right;
  const to = right > left ? left : right + gap;
  const moved = Math.abs(right - left);
  return <svg aria-hidden="true" viewBox={'0 0 602 ' + height} style={svgStyle(602)}>
    <g fill="currentColor" fontSize="14" textAnchor="middle">
      {Array.from({ length: limit + 1 }, (_, index) => <text key={index} x={x(index)} y="19">
        {(mode === 'insert' || mode === 'delete') && index === limit ? '…' : index}
      </text>)}
      {(mode === 'overview' || mode === 'cursor') && <text x="110" y="19">オフセット値 →</text>}
    </g>
    {mode === 'overview' && mark !== undefined && <>
      <GapGuide start={mark} end={mark} from={0} to={1} /><GapGuide start={mark} end={mark + rows[1].gap} from={0} to={1} />
    </>}
    {(mode === 'insert' || mode === 'delete') && <>
      <GapGuide start={from} end={to} from={0} to={1} /><GapGuide start={from + moved} end={to + moved} from={0} to={1} />
      {mode === 'insert' && <><GapGuide start={right} end={right} from={1} to={2} /><GapGuide start={right + 1} end={right + 1} from={1} to={2} /></>}
    </>}
    {rows.map((row, index) => {
      const labels = [...row.before, ...Array.from({ length: row.gap }, (_, i) => i === Math.floor(row.gap / 2) ? '…' : ''), ...row.after];
      const start = row.before.length;
      return <g key={index}>
        {row.gap > 0 && <rect x={x(start)} y={y(index)} width={row.gap * 32} height="32" fill="currentColor" opacity=".16" />}
        <rect x={x(0)} y={y(index)} width={labels.length * 32} height="32" fill="none" stroke="currentColor" strokeWidth="1.6" />
        {labels.map((label, column) => <g key={column}>
          {column > 0 && <line x1={x(column)} y1={y(index)} x2={x(column)} y2={y(index) + 32} stroke="currentColor" strokeDasharray="3 2" />}
          <text x={x(column) + 16} y={y(index) + 22} fill="currentColor" fontSize="16" textAnchor="middle">{label}</text>
        </g>)}
        {mode !== 'cursor' && <text x={x(0) - 10} y={y(index) + 21} fill="currentColor" fontSize="13" textAnchor="end">
          {mode === 'overview' && index === 1
            ? <><tspan x={x(0) - 10} dy="-8">② ギャップバッファ</tspan><tspan x={x(0) - 10} dy="16">（配列buffer）</tspan></>
            : row.label}
        </text>}
        {mode === 'overview' && index === 1 && <>
          <path d={'M' + x(start) + ' 114v9h' + row.gap * 32 + 'v-9 M' + x(start) + ' 113l-30 25'}
            fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x={x(start + row.gap / 2)} y="138" fill="currentColor" fontSize="14" textAnchor="middle">gapSize</text>
          <text x={x(start) - 34} y="152" fill="currentColor" fontSize="14">gapOffset</text>
        </>}
      </g>;
    })}
    {mode === 'cursor' && mark !== undefined &&
      <path d={'M' + x(mark) + ' 26v35m-5-35h10m-10 35h10'} fill="none" stroke="currentColor" strokeWidth="3" />}
  </svg>;
}

function visual(panel: LanguagePanel, caption: string) {
  switch (panel.kind) {
    case 'tables': return <>{panel.tables.map((table, index) => <DataTable key={index} data={table} caption={caption} />)}
      {panel.note && <p style={{ margin: '.25em 0', fontSize: scaled }}>注　{panel.note}</p>}</>;
    case 'tree': return <Tree {...panel} />;
    case 'gap': return <GapDiagram {...panel} />;
    case 'output': return <table style={tableStyle} aria-label={caption}><tbody><tr>
      <td style={cell}><pre style={codeStyle}><code>{panel.text}</code></pre></td>
    </tr></tbody></table>;
  }
}

export const legacy2009SpringPm0913FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component({ values, caption }) {
    return <figure className="managed-diagram source-figure" data-figure-profile={figure.profile}
      role="group" aria-label={caption} aria-description={figure.alt(values)}>
      <div className="table-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
        {visual(figure.panel(values), caption)}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}));
