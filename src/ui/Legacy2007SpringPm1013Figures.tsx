import React from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import type { LanguagePanel as Panel } from '../core/generators/legacy-2007-spring-pm-10-13-support';
import { legacy2007SpringPm1013Figures as figures } from '../core/generators/legacy-2007-spring-pm-10-13-figures';

const tableStyle = { borderCollapse: 'collapse', width: 'max-content', whiteSpace: 'nowrap' } as const;
const cellStyle = { border: '1px solid currentColor', padding: '0.17em 0.4em', textAlign: 'center' } as const;
const codeStyle = { margin: 0, fontFamily: 'monospace', fontSize: '1em', whiteSpace: 'pre' } as const;

function Bitmap({ panel }: { panel: Extract<Panel, { kind: 'bitmap' }> }) {
  const arrow = React.useId();
  const elements = ['要素0','要素1','要素2','要素3','要素4','…','要素' + (panel.count - 1)];
  return <svg className="diagram-svg" viewBox="0 0 690 172" width="690" height="172" style={{ display: 'block', maxWidth: 'none' }} aria-hidden="true">
    <defs><marker id={arrow} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 8 4 L 0 8 Z" fill="currentColor" />
    </marker></defs>
    <g fill="none" stroke="currentColor">
      <rect x="97" y="12" width="532" height="33" />
      {panel.bits.map((_, i) => <path key={i} d={`M ${97 + (i+1) * 29} 12 v 33`} strokeDasharray="4 3" />)}
      <rect x="97" y="98" width="560" height="34" />
      {elements.slice(0,-1).map((_, i) => <path key={i} d={`M ${97 + (i+1)*80} 98 v 34`} />)}
      {[0,1,2].map(i => <path key={i} d={`M ${110 + i * 29} 45 L ${137 + i * 80} 78`} markerEnd={'url(#' + arrow + ')'} />)}
      <path d="M 97 136 q 0 8 15 8 h 15 q 10 0 10 5 q 0 -5 10 -5 h 15 q 15 0 15 -8" />
    </g>
    <g fill="currentColor" fontSize="15" textAnchor="middle">
      <text x="49" y="34">管理領域</text><text x="49" y="120">要素領域</text>
      {panel.bits.map((bit,i) => <text key={i} x={111 + i*29} y="34">{bit}</text>)}<text x="594" y="34">…</text>
      {panel.bits.slice(0,5).map((bit,i) => <text key={i} x={137 + i*80} y="92">{bit ? '（使用中）' : '（未使用）'}</text>)}
      {elements.map((label,i) => <text key={i} x={137 + i*80} y="120">{label}</text>)}
      <text x="137" y="168">{panel.width}語</text>
    </g>
  </svg>;
}

function RecordFormat({ panel }: { panel: Extract<Panel, { kind: 'formats' }> }) {
  const hasPupils = panel.fields.some(field => field.text.startsWith('学年'));
  const header = hasPupils ? <tr><td rowSpan={2} style={cellStyle}>{panel.fields[0].text}</td>
    <td rowSpan={2} style={cellStyle}>{panel.fields[1].text}</td><th colSpan={2} style={cellStyle}>在校児童</th>
    <th colSpan={2} style={cellStyle}>在校児童</th><td rowSpan={2} style={cellStyle}>…</td></tr> : null;
  const fields = hasPupils ? panel.fields.slice(2,6) : panel.fields;
  return <table style={{ ...tableStyle, whiteSpace: 'pre-line' }}>
    <tbody>{header}<tr>{fields.map((field,i) => <td key={i} style={{ ...cellStyle,
      minWidth: field.columns >= 13 ? '7em' : '2.4em' }}>{field.text}</td>)}</tr>
      {panel.repeat && <tr><td colSpan={2}></td><td colSpan={panel.fields.length-2}
        style={{ textAlign: 'center', borderTop: '1px solid currentColor' }}>{panel.repeat}</td></tr>}</tbody>
  </table>;
}

function LanguageFigure({ caption, values, figure }: BookletFigureProps & { figure: typeof figures[number] }) {
  const panel: Panel = figure.panel(values);
  return <figure className="managed-diagram source-figure" style={{ minWidth: 0, maxWidth: '100%' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption || 'プログラムの変更内容'} aria-description={panel.alt}
      data-figure-profile={figure.profile} style={{ color: 'var(--diagram-ink)', fontSize: 'calc(16px * var(--image-scale, 1))' }}>
      {panel.kind === 'bitmap' ? <Bitmap panel={panel} /> : panel.kind === 'formats' ? <RecordFormat panel={panel} /> :
        panel.kind === 'table' ? <table style={tableStyle}>
          {!panel.hideHeadings && <thead><tr>{panel.columns.map(column => <th key={column} scope="col" style={cellStyle}>{column}</th>)}</tr></thead>}
          <tbody>{panel.rows.map((row,i) => <tr key={i}>{row.map((cell,j) => <td key={j} style={{ ...cellStyle, minWidth: '1.7em' }}>
            {j === panel.codeColumn ? <pre style={codeStyle}>{cell}</pre> : cell}</td>)}</tr>)}</tbody>
        </table> : <pre style={{ ...codeStyle, padding: '0.25em 0.5em', border: '1px solid currentColor', width: 'max-content' }}>{panel.text}</pre>}
    </div>
    {figure.profile.startsWith('legacy-2007-spring-pm-12-') && <figcaption>{caption}</figcaption>}
  </figure>;
}

export const legacy2007SpringPm1013FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile, component: props => <LanguageFigure {...props} figure={figure} />,
}));
