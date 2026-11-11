import type { CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2010SpringPm0913Figures as figures } from '../core/generators/legacy-2010-spring-pm-09-13-figures';
import { type LanguagePanel, type LanguageTable } from '../core/generators/legacy-2010-spring-pm-09-13-support';

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
      const changeCode = headers[ci] === 'プログラムの変更内容';
      const style = headers[ci] === '説明' || headers[ci] === '意味' ? sentenceStyle : cellStyle;
      return <td key={ci} style={style} {...spans}>{changeCode ? <pre style={codeStyle}><code>{text}</code></pre> : text}</td>;
    })}</tr>)}</tbody>
  </table>;
}

function visual(panel: LanguagePanel, caption: string) {
  switch (panel.kind) {
    case 'tables': return <>{panel.tables.map((table, i) => <DataTable key={i} data={table} caption={caption} />)}
      {panel.note && <p style={{ margin: '.25em 0', fontSize: scaled }}>{panel.note}</p>}</>;
    case 'output': return <table style={tableStyle} aria-label={caption}><tbody><tr>
      <td style={cellStyle}><pre style={codeStyle}><code>{panel.text}</code></pre></td>
    </tr></tbody></table>;
  }
}

export const legacy2010SpringPm0913FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
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
