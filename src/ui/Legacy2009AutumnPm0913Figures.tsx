import React, { type CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2009AutumnPm0913Figures as figures } from '../core/generators/legacy-2009-autumn-pm-09-13-figures';
import { type LanguagePanel, type LanguageTable } from '../core/generators/legacy-2009-autumn-pm-09-13-support';

const scaled = 'calc(1em * var(--image-scale, 1))';
const cellStyle: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.22em .48em', whiteSpace: 'pre', textAlign: 'center', verticalAlign: 'middle' };
const tableStyle: CSSProperties = { width: 'max-content', borderCollapse: 'collapse', fontSize: scaled };
const codeStyle: CSSProperties = { margin: 0, whiteSpace: 'pre', textAlign: 'left', fontSize: '1em' };
const sentenceStyle: CSSProperties = { ...cellStyle, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', width: '26em', minWidth: '15em', textAlign: 'left', verticalAlign: 'top' };

function DataTable({ data, caption }: { data: LanguageTable; caption: string }) {
  const { headers, rows, merges = [], showHeaders = true } = data;
  return <table aria-label={data.caption ?? caption} style={tableStyle}>
    {data.caption && <caption>{data.caption}</caption>}
    {showHeaders && <thead><tr>{headers.map((text, i) => {
      const merge = merges.find(merge => merge.row === -1 && i >= merge.column && i < merge.column + merge.colSpan);
      if (merge && i !== merge.column) return null;
      return <th key={i} scope={merge ? 'colgroup' : 'col'} colSpan={merge?.colSpan} style={cellStyle}>{text}</th>;
    })}</tr></thead>}
    <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((text, ci) => {
      const merge = merges.find(({ row, column, rowSpan, colSpan }) => ri >= row && ri < row + rowSpan && ci >= column && ci < column + colSpan);
      if (merge && (ri !== merge.row || ci !== merge.column)) return null;
      const spans = merge ? { rowSpan: merge.rowSpan, colSpan: merge.colSpan } : {};
      if (ci === 0 && (showHeaders || rows.length > 1))
        return <th key={ci} scope={merge && merge.rowSpan > 1 ? 'rowgroup' : 'row'} style={cellStyle} {...spans}>{text}</th>;
      const changeCode = headers[ci] === '変更内容';
      const style = headers[ci] === '説明' || headers[ci] === '意味' ? sentenceStyle : cellStyle;
      return <td key={ci} style={style} {...spans}>{changeCode ? <pre style={codeStyle}><code>{text}</code></pre> : text}</td>;
    })}</tr>)}</tbody>
  </table>;
}

function BitDiagram({ diagram }: { diagram: 'replacement' | 'register' }) {
  const style = (width: number): CSSProperties => ({
    display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, color: 'var(--diagram-ink)',
  });
  if (diagram === 'register') {
    return <svg aria-hidden="true" viewBox="0 0 246 105" style={style(246)}>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="60" y="31" width="168" height="30" /><path d="M138 31V61 M60 68Q61 75 69 75H130Q138 75 138 68" />
      </g>
      <rect x="60" y="31" width="78" height="30" fill="currentColor" opacity=".25" />
      <g fill="currentColor" fontSize="15" textAnchor="middle">
        <text x="38" y="51">GR0</text><text x="99" y="21">ビット列B</text><text x="183" y="51">0…0</text><text x="99" y="93">qビット</text>
      </g>
    </svg>;
  }
  const labels = ['第1語', '…', '第i語', '第（i＋1）語', '…', '第n語'];
  return <svg aria-hidden="true" viewBox="0 0 718 229" style={style(718)}>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="109" y="47" width="582" height="35" />
      {labels.slice(1).map((label, i) => <path key={i + label} d={`M${206 + i * 97} 47V82`} strokeDasharray="3 2" />)}
      <path d="M109 89q0 7 8 7h239q8 0 8 -7M364 153V83l-5 8m5-8 5 8M434 153V83l-5 8m5-8 5 8" />
      <rect x="364" y="153" width="70" height="30" />
      <path d="M364 190q0 7 8 7h54q8 0 8 -7" />
    </g>
    <g fill="currentColor" fontSize="15" textAnchor="middle">
      <rect x="364" y="47" width="70" height="35" opacity=".25" />
      <rect x="364" y="153" width="70" height="30" opacity=".25" />
      {labels.map((label, i) => <text key={i + label} x={157 + 97 * i} y="34">{label}</text>)}
      <text x="60" y="69">ビット列A</text><text x="236" y="115">pビット</text>
      <text x="314" y="174">ビット列B</text><text x="399" y="217">qビット</text>
    </g>
  </svg>;
}

function RankDigits({ digits }: { digits: string }) {
  const labels = ['出社可能な場合0，出社不可能な場合1', '先々月ペナルティ順位', '前日までの割当回数', '経験順位'];
  const anchors = [40, 88, 152, 216];
  return <svg aria-hidden="true" viewBox="0 0 570 187" style={{
    display: 'block', width: 'calc(570px * var(--image-scale, 1))', color: 'var(--diagram-ink)',
  }}>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="24" y="15" width="224" height="34" />
      {[56, 120, 184].map(x => <path key={x} d={`M${x} 15V49`} />)}
      {[88, 152, 216].map(x => <path key={x} d={`M${x} 15V49`} strokeDasharray="2 2" />)}
      {anchors.map((x, i) => <path key={x} d={`M${x} 50v${118 - i * 29}H270M${x - 4} 57l4-7 4 7`} />)}
    </g>
    <g fill="currentColor" fontSize="16">
      {[...digits].map((value, i) => <text key={i} x={40 + i * 32} y="38" textAnchor="middle">{value}</text>)}
      {labels.map((label, i) => <text key={label} x="274" y={173 - i * 29}>{label}</text>)}
    </g>
  </svg>;
}

function visual(panel: LanguagePanel, caption: string) {
  switch (panel.kind) {
    case 'tables': return <>{panel.tables.map((table, i) => <DataTable key={i} data={table} caption={caption} />)}
      {panel.note && <p style={{ margin: '.25em 0', fontSize: scaled }}>{panel.note}</p>}</>;
    case 'digits': return <RankDigits digits={panel.digits} />;
    case 'bits': return <BitDiagram diagram={panel.diagram} />;
    case 'output': return <table style={tableStyle} aria-label={caption}><tbody><tr>
      <td style={cellStyle}><pre style={codeStyle}><code>{panel.text}</code></pre></td>
    </tr></tbody></table>;
  }
}

export const legacy2009AutumnPm0913FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
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
