import { type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawingAlt, entryText, modificationCode, profile, type FigureName } from '../core/generators/legacy-2007-autumn-pm-06-09-figures';
import { healthCases, healthFields, parityCases, queueIllustration } from '../core/generators/legacy-2007-autumn-pm-06-09-model';

type Props = BookletFigureProps & { name: FigureName };
const canvas: CSSProperties = { width: 'max-content', fontSize: 'calc(1em * var(--image-scale, 1))', marginInline: 'auto', color: 'var(--diagram-ink)' };
const table: CSSProperties = { borderCollapse: 'collapse' };
const cell: CSSProperties = { border: '1px solid currentColor', padding: '.35em .52em', textAlign: 'center', fontWeight: 'normal' };
const mono: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', whiteSpace: 'pre', margin: 0 };

function Frame({ name, caption, values, children }: Props & { children: ReactNode }) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption}
    aria-description={drawingAlt(name, values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <div style={canvas}>{children}</div>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Records(props: Props) {
  const master = props.name === '7-master';
  const years = healthCases[props.values[0]].years;
  const records = master ? ['診断結果（1年前）', '診断結果（2年前）'] : ['今年度の診断結果'];
  return <Frame {...props}>
    <table style={table} aria-label={props.caption}>
      <thead><tr><th rowSpan={2} scope="col" style={cell}>従業員番号<br />6けた</th>
        {records.map(record => <th scope="colgroup" key={record} colSpan={healthFields.length} style={cell}>{record}</th>)}
        {master && <td rowSpan={2} aria-hidden="true" style={cell}>…</td>}
      </tr><tr>{records.flatMap(record => healthFields.map(([label, digits]) =>
        <th scope="col" key={record + label} style={cell}>{label}<br />{digits}</th>))}</tr></thead>
    </table>
    {master && <div style={{ textAlign: 'right' }}>診断結果を{years}回繰返し</div>}
  </Frame>;
}
function Change(props: Props) {
  return <Frame {...props}><table style={table} aria-label={props.caption}>
    <thead><tr><th scope="col" style={cell}>処置</th><th scope="col" style={cell}>プログラムの変更内容</th></tr></thead>
    <tbody><tr><td style={cell}>［c］<br />に追加</td>
      <td style={cell}><pre style={{ ...mono, textAlign: 'left' }}><code>{modificationCode(props.values[0]).join('\n')}</code></pre></td></tr></tbody>
  </table></Frame>;
}
function Insert(props: Props) {
  const { before, after, inserted, comparisons } = queueIllustration(props.values[0]);
  const stack = (entries: typeof before, label: string) => <div>
    <div>先頭</div>
    <table style={table} aria-label={label}><tbody>{entries.map(entry =>
      <tr key={entry.label}><td style={cell}>{entryText(entry)}</td></tr>)}</tbody></table>
    <div>末尾</div>
  </div>;
  const insertion = after.findIndex(entry => entry.label === inserted.label);
  return <Frame {...props}><div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content max-content max-content',
    alignItems: 'start', gap: '.25em 1em' }}>
    <div style={{ gridColumn: 1, marginBlockStart: '2.7em' }}>
      <div>要素：重み</div>
      <div style={{ marginBlockStart: '.8em' }}>挿入する要素の重みと合計の比較</div>
      {comparisons.map(formula => <div key={formula}>{formula}</div>)}
    </div>
    <div style={{ gridColumn: 2 }}>
      <div>挿入する要素</div>
      <div style={{ border: '1px solid currentColor', width: 'max-content', padding: '.35em .52em', marginInline: 'auto' }}>{entryText(inserted)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '.22em' }}>
        <span aria-hidden="true" style={{ display: 'inline-block', width: '1em', height: (1.65 + insertion * 2.12) + 'em',
          borderInlineStart: '1px solid currentColor', borderBlockEnd: '1px solid currentColor', position: 'relative' }}>
          <span style={{ position: 'absolute', insetInlineEnd: '-.25em', insetBlockEnd: '-.58em' }}>›</span>
        </span>
        {stack(before, '挿入前')}
      </div>
    </div>
    <span aria-hidden="true" style={{ gridColumn: 3, fontSize: '1.8em', marginBlockStart: '2.1em' }}>⟶</span>
    <div style={{ gridColumn: 4, marginBlockStart: '2.7em' }}>{stack(after, '挿入後')}</div>
  </div></Frame>;
}
function Output(props: Props) {
  return <Frame {...props}><pre style={{ ...mono, border: '1px solid currentColor', padding: '.55em 1em', minWidth: '3.7em' }}>
    <code>{drawingAlt(props.name, props.values[0])}</code>
  </pre></Frame>;
}
function Parity(props: Props) {
  const rows = parityCases[props.values[0]].rows;
  const labels = ['語0', '語1', '語2', '語3', '⋮', '語N−1', '語N'];
  const displayRows = [...rows.slice(0, 4), '⋮⋮⋮⋮⋮', ...rows.slice(4)];
  return <Frame {...props}>
    <table style={table} aria-label={props.caption}>
      <thead><tr><th scope="col" style={cell}>ビット番号</th>
        {['15', '14', '13', '…', '0'].map(label => <th style={cell} scope="col" key={label}>{label}</th>)}
        <td style={{ paddingInlineStart: '.65em' }} aria-hidden="true" />
      </tr></thead>
      <tbody>{displayRows.map((row, i) =>
        <tr key={labels[i]}>
          <th scope="row" style={cell}>{i === 0 ? '（GR2）→ ' : ''}{labels[i]}</th>
          {[...row].map((value, column) =>
            <td key={column} style={{
              ...cell, minWidth: column === 3 ? '5em' : '2em',
              ...(column === 0 && i < 6 ? { position: 'relative' as const } : {}),
              ...(column === 2 ? { background: 'var(--diagram-surface)', boxShadow: 'inset 0 0 0 1px currentColor' } : {}),
            }}>{value}{column === 0 && i < 6 && <span aria-hidden="true" style={{
              position: 'absolute', insetInline: '.16em', insetBlockStart: i === 0 ? '.12em' : '-1px',
              insetBlockEnd: i === 5 ? '.12em' : '-1px', borderInline: '1px dashed currentColor',
              ...(i === 0 ? { borderBlockStart: '1px dashed currentColor' } : {}),
              ...(i === 5 ? { borderBlockEnd: '1px dashed currentColor' } : {}),
            }} />}</td>)}
          {i === 0 && <td rowSpan={6} style={{ paddingInlineStart: '.65em', borderInlineStart: '1px solid currentColor' }}>ブロック</td>}
          {i === 6 && <td style={{ paddingInlineStart: '.65em' }}>← 水平パリティ</td>}
        </tr>)}</tbody>
    </table>
    <div>左端の破線列：パリティビット</div>
    {props.values[0] !== 0 && <div>この例で省略した中間の語は全ビットが0。</div>}
  </Frame>;
}
const components = {
  '7-master': Records, '7-year': Records, '7-change': Change, '8-insert': Insert, '8-output': Output, '9-parity': Parity,
} satisfies Record<FigureName, (props: Props) => ReactNode>;

export const legacy2007AutumnPm0609FigureRenderers: readonly BookletFigureRenderer[] = (Object.keys(components) as FigureName[])
  .map(name => {
    const Component = components[name];
    return { profile: profile(name), component: props => <Component {...props} name={name} /> };
  });
