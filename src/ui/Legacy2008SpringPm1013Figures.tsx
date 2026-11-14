import React, { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2008SpringPm1013Figures as figures } from '../core/generators/legacy-2008-spring-pm-10-13-figures';
import type { LanguagePanel } from '../core/generators/legacy-2008-spring-pm-10-13-support';

function FractionDiagram({ panel, caption }: { panel: Extract<LanguagePanel, { kind: 'fraction' }>; caption: string }) {
  const title = useId(), description = useId(), marker = useId();
  const radixPoint = panel.digits.indexOf('.');
  const at = (column: number) => 25 + column * 16;
  const prefix = at(radixPoint + 1);
  const firstCycle = at(radixPoint + 1 + panel.n);
  const secondCycle = at(radixPoint + 1 + panel.n + panel.k);
  return <svg viewBox="0 0 430 96" role="img" aria-labelledby={title} aria-describedby={description}
    style={{ display: 'block', width: 'calc(430px * var(--image-scale, 1))', height: 'auto' }}>
    <title id={title}>{caption}</title>
    <desc id={description}>{panel.alt}</desc>
    <defs><marker id={marker} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L6 3L0 6Z" fill="currentColor" />
    </marker></defs>
    <g aria-hidden="true" fill="currentColor" fontSize="16">
      {[...panel.digits].map((symbol, i) => <text key={i} x={at(i)} y="24" textAnchor="middle">{symbol}</text>)}
      <text x="351" y="57">循環節</text>
      <text x="103" y="88">循環節を除く小数部</text>
    </g>
    <g aria-hidden="true" stroke="currentColor" fill="none">
      <path d={`M340 52H${firstCycle}V30`} markerEnd={`url(#${marker})`} />
      <path d={`M${secondCycle} 52V30`} markerEnd={`url(#${marker})`} />
      <path d={`M94 83H${prefix}V30`} markerEnd={`url(#${marker})`} />
    </g>
  </svg>;
}

const cell = { border: '1px solid currentColor', padding: '0.08em 0.25em', whiteSpace: 'pre' } as const;
const table = { width: 'max-content', borderCollapse: 'collapse', textAlign: 'center' } as const;
const code = { margin: 0, fontFamily: 'monospace', fontSize: '1em', whiteSpace: 'pre', textAlign: 'start' } as const;

function Records({ inputs, outputs, caption }: { inputs: string[]; outputs: string[]; caption: string }) {
  const rows = inputs.length ? inputs : outputs;
  const categories = ['最大値', '最小値', '平均値'];
  return <table style={table} aria-label={caption}>
    <tbody>{rows.map((row, i) => <tr key={i}>
      {inputs.length > 0 && <th scope="row">レコード{i + 1}</th>}
      {[...row].map((character, column) => <td key={column} style={cell}>{character}</td>)}
      {!inputs.length && <th scope="row">←{categories[i]}</th>}
    </tr>)}</tbody>
  </table>;
}

function LanguageFigure({ panel, caption, profile }: { panel: LanguagePanel; caption: string; profile: string }) {
  const html = (panel: Exclude<LanguagePanel, {kind: 'fraction'}>) => {
    if (panel.kind === 'records') return <Records {...panel} caption={caption} />;
    if (panel.kind === 'output') return <table style={table} aria-label={caption}>
      <tbody><tr><td style={cell}><pre style={code}>{panel.text}</pre></td></tr></tbody>
    </table>;
    return panel.tables.map(({ headings, label, rows, codeColumns }, i) => <table key={i} style={table} aria-label={label ?? caption}>
      {headings && <thead><tr>{headings.map(heading => <th key={heading} style={cell} scope="col">{heading}</th>)}</tr></thead>}
      <tbody>{rows.map((row, j) => <tr key={j}>{row.map((value, column) =>
        <td key={column} style={cell}>{codeColumns?.includes(column) ? <pre style={code}>{value}</pre> : value}</td>)}</tr>)}</tbody>
    </table>);
  };
  return <figure className="managed-diagram source-figure" style={{ position: 'relative', minWidth: 0, maxWidth: '100%' }}>
    <div className="diagram-scroll" data-figure-profile={profile} role="group" tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'} aria-description={panel.alt}
      style={{ fontSize: 'calc(16px * var(--image-scale, 1))', color: 'var(--diagram-ink)' }}>
      {panel.kind === 'fraction' ? <FractionDiagram panel={panel} caption={caption} /> : html(panel)}
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2008SpringPm1013FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component: ({ values, caption }: BookletFigureProps) => <LanguageFigure panel={figure.panel(values)} caption={caption} profile={figure.profile} />,
}));
