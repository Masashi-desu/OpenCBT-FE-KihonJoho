import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2010AutumnPm0913Figures as figures } from '../core/generators/legacy-2010-autumn-pm-09-13-figures';
import { type LanguagePanel, type LanguageTable } from '../core/generators/legacy-2010-autumn-pm-09-13-support';

const scaled = 'calc(1em * var(--image-scale, 1))';
const cellStyle: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.22em .48em', whiteSpace: 'pre', textAlign: 'center', verticalAlign: 'middle' };
const tableStyle: CSSProperties = { width: 'max-content', borderCollapse: 'collapse', fontSize: scaled };
const codeStyle: CSSProperties = { margin: 0, whiteSpace: 'pre', textAlign: 'left', fontSize: '1em' };
const sentenceStyle: CSSProperties = { ...cellStyle, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', width: '26em', minWidth: '15em', textAlign: 'left', verticalAlign: 'top' };

function DataTable({ data, caption }: { data: LanguageTable; caption: string }) {
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

function Svg({ caption, description, width, height, children }: {
  caption: string; description: string; width: number; height: number; children: ReactNode;
}) {
  const id = useId();
  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
    style={{ display: 'block', width: `max(100%, calc(${width}px * var(--image-scale, 1)))`,
      height: 'auto', color: 'var(--diagram-ink)' }}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{description}</desc>
    <g aria-hidden="true">{children}</g>
  </svg>;
}

function Reversal({ panel, caption, description }: { panel: Extract<LanguagePanel, { kind: 'reversal' }>; caption: string; description: string }) {
  const width = 670, height = panel.scope ? 220 : 260, left = 120, right = 620;
  const widths = panel.scope ? [panel.scope[0], panel.scope[1], 16 - panel.scope[0] - panel.scope[1]].map(value => value * (right - left) / 16)
    : panel.before.map(() => (right - left) / panel.before.length);
  const positions = widths.map((_, i) => left + widths.slice(0, i).reduce((sum, value) => sum + value, 0));
  const top = 50, bottom = height - 65, lineY = bottom - 2;
  const targetLeft = panel.scope ? positions[1] : left;
  const targetRight = panel.scope ? positions[2] : right;
  return <Svg caption={caption} description={description} width={width} height={height}>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      {panel.before.map((_, i) => <g key={i}>
        <rect x={positions[i]} y={top} width={widths[i]} height="34" fill={panel.scope && i === 1 ? 'var(--diagram-surface)' : undefined} />
        <rect x={positions[i]} y={bottom} width={widths[i]} height="34" fill={panel.scope && i === 1 ? 'var(--diagram-surface)' : undefined} />
      </g>)}
      <path d={`M${targetLeft} ${top + 34}L${targetRight} ${lineY}m-10-1 10 1-5-9 M${targetRight} ${top + 34}L${targetLeft} ${lineY}m5-9-5 9 10-1`} />
    </g>
    <g fill="currentColor" fontSize="17" textAnchor="middle">
      <text x="78" y={top + 22}>実行前</text><text x="78" y={bottom + 22}>実行後</text>
      {panel.before.map((text, i) => <g key={i}>
        <text x={positions[i] + widths[i] / 2} y={top + 22}>{text}</text>
        <text x={positions[i] + widths[i] / 2} y={bottom + 22}>{panel.after[i]}</text>
        {panel.labels && <text x={positions[i] + widths[i] / 2} y={top - 10}>{panel.labels[i]}</text>}
      </g>)}
      {panel.scope && <g><text x={left + widths[0] / 2} y={top - 12}>p{panel.segmented ? '＝' + panel.scope[0] : ''}</text>
        <text x={positions[1] + widths[1] / 2} y={top - 12}>q{panel.segmented ? '＝' + panel.scope[1] : ''}</text></g>}
    </g>
  </Svg>;
}

function Route({ panel, caption, description }: { panel: Extract<LanguagePanel, { kind: 'route' }>; caption: string; description: string }) {
  const last = panel.stopCount - 1;
  const stops = [0, 1, last - 1, last];
  const xs = [200, 340, 520, 660];
  return <Svg caption={caption} description={description} width={780} height={205}>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      {xs.map(x => <g key={x}><rect x={x - 47} y="35" width="94" height="53" /><path d={`M${x} 88v40`} /></g>)}
      <path d="M200 108H340m-8-4 8 4-8 4 M520 108H660m-8-4 8 4-8 4" />
      <path d="M340 108H520" strokeDasharray="4 5" />
    </g>
    <g fill="currentColor" fontSize="14" textAnchor="middle">
      <text x="90" y="61">到着待ち時間（分）：</text><text x="90" y="129">標準所要時間（分）：</text>
      {stops.map((stop, i) => <g key={stop}><text x={xs[i]} y="24">バス停{stop}</text>
        <text x={xs[i]} y="56">route[{stop}].</text><text x={xs[i]} y="78">wait_time</text></g>)}
      <text x="270" y="145">route[1].std_time</text><text x="590" y="145">route[{last}].std_time</text>
      <text x="430" y="69">…</text><text x="430" y="145">…</text>
    </g>
  </Svg>;
}

function BusPositions({ panel, caption, description }: { panel: Extract<LanguagePanel, { kind: 'bus-positions' }>; caption: string; description: string }) {
  const first = panel.departing - 2;
  const stops = Array.from({ length: 5 }, (_, i) => first + i);
  return <Svg caption={caption} description={description} width={720} height={205}>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M42 106H680" />
      {stops.map((_, i) => <g key={i}><rect x={100 + 120 * i} y="8" width="32" height="67" /><path d={`M${116 + 120 * i} 73v58`} /></g>)}
      <path d="M402 146h32v-10l16 14-16 14v-10h-32" />
      {[[160, 'C'], [375, 'B'], [600, 'A']].map(([x, label]) => <rect key={label} x={Number(x) - 27} y="138" width="54" height="26" />)}
    </g>
    <g fill="currentColor" fontSize="15" textAnchor="middle">
      {stops.map((stop, i) => <g key={stop}><text x={116 + 120 * i} y="22">バ</text><text x={116 + 120 * i} y="36">ス</text><text x={116 + 120 * i} y="50">停</text><text x={116 + 120 * i} y="65">{stop}</text>
        {i < 4 && <text x={176 + 120 * i} y="98">区間{stop}</text>}</g>)}
      <text x="160" y="157">バスC</text><text x="375" y="157">バスB</text><text x="600" y="157">バスA</text>
      <text x="375" y="183">発車</text><text x="160" y="201">succeeding={panel.succeeding}</text>
      <text x="375" y="201">busstop={panel.departing}</text><text x="600" y="201">preceding={panel.preceding}</text>
    </g>
  </Svg>;
}

function Formulas({ panel }: { panel: Extract<LanguagePanel, { kind: 'formulas' }> }) {
  return <div style={{ fontSize: scaled, whiteSpace: 'pre' }}>
    {panel.lines.map((line, index) => <div key={index}>{line.split(/(［[^］]*］)/).map((fragment, i) =>
      fragment.startsWith('［') ? <span key={i} style={{ display: 'inline-block', minWidth: fragment === '［網掛け］' ? '5em' : '4em',
        textAlign: 'center', border: '1px solid var(--diagram-border)', marginInline: '.15em',
        background: fragment === '［網掛け］' ? 'var(--diagram-border)' : undefined }}>{fragment === '［網掛け］' ? '\u00a0' : fragment.slice(1, -1)}</span> : fragment)}</div>)}
  </div>;
}

function visual(panel: LanguagePanel, caption: string, description: string) {
  switch (panel.kind) {
    case 'route': return <Route panel={panel} caption={caption} description={description} />;
    case 'bus-positions': return <BusPositions panel={panel} caption={caption} description={description} />;
    case 'reversal': return <Reversal panel={panel} caption={caption} description={description} />;
    case 'formulas': return <Formulas panel={panel} />;
    case 'tables': return <>{panel.note && <p style={{ margin: '0 0 .2em', fontSize: scaled }}>{panel.note}</p>}
      {panel.tables.map((table, i) => <DataTable key={i} data={table} caption={caption} />)}</>;
    case 'output': return <table style={tableStyle} aria-label={caption}><tbody><tr><td style={cellStyle}><pre style={codeStyle}><code>{panel.text}</code></pre></td></tr></tbody></table>;
  }
}

export const legacy2010AutumnPm0913FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component({ values, caption }) {
    const panel = figure.panel(values), description = figure.alt(values);
    const isTable = panel.kind === 'tables' || panel.kind === 'output' || panel.kind === 'formulas';
    return <figure className="managed-diagram source-figure" data-figure-profile={figure.profile}
      {...(isTable ? { role: 'group', 'aria-label': caption, 'aria-description': description } : {})}>
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>{visual(panel, caption, description)}</div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}));
