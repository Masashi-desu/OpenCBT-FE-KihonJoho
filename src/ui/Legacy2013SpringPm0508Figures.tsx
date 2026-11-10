import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  spring2013Pm0508Drawings, spring2013Pm0508Profile, spring2013Pm5RecordLayouts,
  spring2013Pm8PurchaseColumns, spring2013Pm8PurchaseFigure, spring2013Pm8SpecialColumns, spring2013Pm8SpecialFigure,
  type Spring2013Pm0508Drawing,
} from '../core/generators/legacy-2013-spring-pm-05-08-figures';
import { spring2013Pm7Sales, spring2013Pm7Years } from '../core/generators/legacy-2013-spring-pm-05-08-model';
import {
  spring2013Pm8AddCondition, spring2013Pm8Declarations, spring2013Pm8Program, spring2013Pm8UpdateProgram,
} from '../core/generators/legacy-2013-spring-pm-05-08-programs';

type Props = BookletFigureProps & { id: Spring2013Pm0508Drawing };
const ink = 'var(--diagram-ink)';
const color = { color: ink };
const gridCell = { border: '1px solid ' + ink, padding: '0.3em 0.55em', textAlign: 'center' as const };
const tableStyle = { ...color, borderCollapse: 'collapse' as const, minWidth: 'max-content',
  fontSize: 'calc(0.9em * var(--image-scale, 1))' };

function TableFigure({ id, values, caption, children, visibleCaption = true }: Props & { children: ReactNode; visibleCaption?: boolean }) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption}
    aria-description={spring2013Pm0508Drawings[id].alt(values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      {children}
    </div>
    <figcaption className={visibleCaption ? undefined : 'sr-only'}>{caption}</figcaption>
  </figure>;
}
function Drawing({ id, values, caption, width, height, children }: Props & { width: number; height: number; children: (arrow: string) => ReactNode }) {
  const uid = useId(), arrow = uid + '-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg role="img" aria-labelledby={uid + '-title'} aria-describedby={uid + '-desc'} viewBox={`0 0 ${width} ${height}`}
        style={{ ...color, display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none', height: 'auto' }}>
        <title id={uid + '-title'}>{caption}</title>
        <desc id={uid + '-desc'}>{spring2013Pm0508Drawings[id].alt(values[0])}</desc>
        <defs><marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.25" fontSize="15">
          {children(`url(#${arrow})`)}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Label({ x, y, children, anchor = 'middle' }: {
  x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end';
}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={anchor}>{children}</text>;
}

function RecordLayout(props: Props & { id: keyof typeof spring2013Pm5RecordLayouts }) {
  const { fields, keyCount } = spring2013Pm5RecordLayouts[props.id];
  return <TableFigure {...props}>
    <div style={{ width: 'max-content', marginInline: 'auto', ...color }}>
      <table style={tableStyle} aria-label={props.caption}><tbody><tr>{fields.map((name, i) =>
        <td key={name} style={gridCell}>{i < keyCount ? <u data-key-field="">{name}</u> : name}</td>)}
      </tr></tbody></table>
      <div>注記　下線はキー項目を表す。</div>
    </div>
  </TableFigure>;
}
function FileNode({ x, y, label, file }: { x: number; y: number; label: string; file: boolean }) {
  const width = 105, height = 38;
  const lines = label.split('\n');
  return <g transform={`translate(${x} ${y})`}>
    {file ? <path d={`M0 0H${width}q-10 19 0 ${height}H0q-10-19 0-${height}Z`}/> : <rect width={width} height={height}/>}
    {lines.map((line, i) => <Label key={line} x={width / 2} y={lines.length === 1 ? 24 : 16 + i * 16}>{line}</Label>)}
  </g>;
}
function Workflow(props: Props) {
  const update = props.id === '5-update-workflow';
  const names = update ? ['処理1', '処理2', 'T1', '処理3', '新契約\nマスタ']
    : ['処理4', '処理5', 'T2', '処理6', '歩合給\nファイル'];
  return <Drawing {...props} width={610} height={126}>{() => <>
    <FileNode x={18} y={12} label={update ? '異動\nファイル' : '契約\nマスタ'} file/>
    <path d="M70.5 50v20"/>
    {update && <><FileNode x={378} y={12} label={'旧契約\nマスタ'} file/><path d="M430.5 50v20"/></>}
    {names.map((name, i) => {
      const file = i === 2 || i === 4, x = 18 + i * 120;
      return <g key={name}>
        {i > 0 && <path d={`M${x - 15 - (i === 3 ? 5 : 0)} 89H${x - (file ? 5 : 0)}`}/>}
        <FileNode x={x} y={70} label={name} file={file}/>
      </g>;
    })}
  </>}</Drawing>;
}

function MergeFlow(props: Props) {
  const center = 384, width = 246;
  const node = (x: number, y: number, label: string, shape: 'rect' | 'round' | 'blank' | 'loop' | 'loop-end' = 'rect', height = 33) => {
    const left = x - width / 2;
    return <g data-flow-node={label}>
      {shape === 'loop'
        ? <path d={`M${left} ${y + 10}l10-10h${width - 20}l10 10v${height - 10}h-${width}Z`}/>
        : shape === 'loop-end'
          ? <path d={`M${left} ${y}h${width}v${height - 10}l-10 10h-${width - 20}l-10-10Z`}/>
          : <rect x={left} y={y} width={width} height={height} rx={shape === 'round' ? height / 2 : 0}/>}
      {shape === 'blank' && <rect x={left + 6} y={y + 6} width={width - 12} height={height - 12} strokeWidth="2.3"/>}
      {label.split('\n').map((line, i, lines) => <Label key={line} x={x} y={y + height / 2 + 4 - 8 * (lines.length - 1) + i * 16}>{line}</Label>)}
    </g>;
  };
  const diamond = (y: number, label: string, height = 52) => <g data-flow-decision={label}>
    <path d={`M${center} ${y}l123 ${height / 2}-123 ${height / 2}-123-${height / 2}Z`}/>
    {label.split('\n').map((line, i, lines) => <Label key={line} x={center} y={y + height / 2 + 5 - 8 * (lines.length - 1) + i * 16}>{line}</Label>)}
  </g>;
  const readT1 = 'T1から1レコードを読み込む', readOld = '旧契約マスタから1レコードを読み込む';
  return <Drawing {...props} width={768} height={667}>{arrow => <g fontSize="13">
    {node(center, 10, '開始', 'round')}{node(center, 52, readT1)}{node(center, 94, readOld)}
    {node(center, 136, '突合せ\n（旧契約マスタ＝EOF）かつ\n（T1＝EOF）', 'loop', 59)}
    {diamond(207, 'T1 ≠ EOF')}{diamond(275, '旧契約マスタ ≠ EOF')}
    {diamond(343, 'T1の証券番号：\n旧契約マスタの証券番号', 76)}
    <path d="M384 43v9m0 33v9m0 33v9m0 59v12m0 52v16m0 52v16m0 76v21m0 33v8m0 33v15m0 33v16m0 33v11"/>
    <path d="M261 233H127v207m380-139h134v139M507 381h134"/>
    <path d="M261 381H127" markerEnd={arrow}/>
    <Label x={252} y={224} anchor="end">No</Label><Label x={390} y={271} anchor="start">Yes</Label>
    <Label x={511} y={292} anchor="start">No</Label><Label x={390} y={340} anchor="start">Yes</Label>
    <Label x={250} y={373} anchor="end">＞</Label><Label x={515} y={373} anchor="start">＜</Label>
    <Label x={391} y={434} anchor="start">＝</Label>
    {node(127, 440, 'e', 'blank')}{node(center, 440, 'f', 'blank')}{node(641, 440, 'g', 'blank')}
    {node(center, 481, readT1)}{node(641, 481, readT1)}{node(center, 529, readOld)}
    <path d="M127 473v48H384m257-48v8"/>
    <path d="M641 514v58H384" markerEnd={arrow}/>
    {node(center, 578, '突合せ', 'loop-end')}{node(center, 622, '終了', 'round')}
  </g>}</Drawing>;
}

type Marker = 0 | 1 | 2 | 3 | 4;
function ChartMark({ x, y, index }: { x: number; y: number; index: Marker }) {
  const solid = 'currentColor', open = 'var(--diagram-surface)';
  if (index === 1) return <rect x={x - 4.5} y={y - 4.5} width="9" height="9" fill={open}/>;
  if (index === 2) return <circle cx={x} cy={y} r="5" fill={solid}/>;
  if (index === 4) return <path d={`M${x} ${y - 6}l6 10h-12Z`} fill={solid}/>;
  return <path d={`M${x} ${y - 5}l5 5-5 5-5-5Z`} fill={index === 0 ? solid : open}/>;
}
function MarketChart(props: Props) {
  const { rows } = spring2013Pm7Sales(props.values[0]);
  const x = (yearIndex: number) => 62 + yearIndex * 58;
  const y = (volume: number) => 366 - volume * 1.65;
  return <Drawing {...props} width={730} height={419}>{() => <>
    <Label x={32} y={23} anchor="start">百万箱</Label>
    <rect x="48" y={y(200)} width="550" height={y(0) - y(200)}/>
    {Array.from({ length: 11 }, (_, index) => index * 20).map(value => <g key={value} fontSize="13">
      {value > 0 && value < 200 && <path d={`M48 ${y(value)}H598`} strokeDasharray="4 3"/>}
      <Label x={44} y={y(value) + 4} anchor="end">{value}</Label>
    </g>)}
    {spring2013Pm7Years.map((year, i) => <g key={year} fontSize="13">
      <path d={`M${x(i)} 366v-8`}/><Label x={x(i)} y={386}>{year}</Label>
    </g>)}
    <Label x={619} y={386}>年</Label>
    {rows.map((row, i) => <g key={i} data-market-series={'ABCDE'[i]}>
      <polyline points={row.map((value, j) => `${x(j)},${y(value)}`).join(' ')}/>
      {row.map((value, j) => <ChartMark key={j} x={x(j)} y={y(value)} index={i as Marker}/>)}
    </g>)}
    <rect x="615" y="104" width="92" height="147"/>
    {rows.map((_, i) => <g key={i}>
      <path d={`M625 ${122 + i * 27}h29`}/><ChartMark x={639} y={122 + i * 27} index={i as Marker}/>
      <Label x={664} y={127 + i * 27} anchor="start">{'ABCDE'[i]}国</Label>
    </g>)}
  </>}</Drawing>;
}

function RecordTable({ columns, rows, label, continuation = false }: {
  columns: readonly string[]; rows: { values: readonly string[]; changed?: readonly number[]; rowLabel: string }[];
  label: string; continuation?: boolean;
}) {
  return <table style={tableStyle} aria-label={label}>
    <thead><tr><th scope="col" aria-label="添字・変数名"/>{columns.map(column => <th key={column} scope="col" style={gridCell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map(({ values, changed = [], rowLabel }) => <tr key={rowLabel}>
      <th scope="row" style={{ paddingInlineEnd: '0.5em', textAlign: 'end' }}>{rowLabel}</th>
      {values.map((value, i) => <td key={i} data-changed={changed.includes(i) || undefined} style={{
        ...gridCell, textAlign: columnAlignment(columns[i]), ...(changed.includes(i) ? { background: 'var(--selected-surface)' } : {}),
      }}>{value}</td>)}
    </tr>)}
    {continuation && <tr><th scope="row">⋮</th>{columns.map(column => <td key={column} style={gridCell}/>)}</tr>}
    </tbody>
  </table>;
}
const columnAlignment = (name: string) => name === '品名' ? 'start' : 'end';

function Scalar({ name, value, changed = false }: { name: string; value: number; changed?: boolean }) {
  return <div>
    <div>{name}</div>
    <div data-changed={changed || undefined} style={{ ...gridCell, textAlign: 'end',
      ...(changed ? { background: 'var(--selected-surface)' } : {}) }}>{value}</div>
  </div>;
}
const recordsLayout = {
  display: 'grid', gridTemplateColumns: 'max-content max-content', justifyContent: 'center',
  alignItems: 'center', columnGap: '1em', rowGap: '0.6em', width: 'max-content', marginInline: 'auto', ...color,
};
const scalarLayout = { display: 'grid', gap: '0.45em' };

function Purchases(props: Props) {
  const { head, headChanged, length, lengthChanged, rows } = spring2013Pm8PurchaseFigure(props.values[0], props.id === '8-purchases-after');
  return <TableFigure {...props}>
    <div style={recordsLayout}>
      <div style={scalarLayout}>
        <Scalar name="ptr起点" value={head} changed={headChanged}/>
        <Scalar name="購入行数" value={length} changed={lengthChanged}/>
      </div>
      <RecordTable columns={spring2013Pm8PurchaseColumns} rows={rows.map((row, i) => ({ ...row, rowLabel: '購入[' + (i + 1) + ']' }))}
        label="購入[]のレコード" continuation/>
    </div>
  </TableFigure>;
}
function Specials(props: Props) {
  const { designated, length, targets, special, countChanged } = spring2013Pm8SpecialFigure(props.values[0], props.id === '8-special-after');
  return <TableFigure {...props}>
    <div style={recordsLayout}>
      <div style={scalarLayout}>
        <Scalar name="指定数量" value={designated}/>
        <Scalar name="対象行数" value={length}/>
      </div>
      <RecordTable columns={['品番', '数量']} rows={targets.map(({ code, count }, i) => ({
        rowLabel: '対象[' + (i + 1) + ']', values: [String(code), String(count)], changed: count ? [1] : [],
      }))} label="対象[]のレコード" continuation/>
      <div aria-hidden="true"/>
      <RecordTable columns={spring2013Pm8SpecialColumns}
        rows={[{ rowLabel: '特売', values: special, changed: countChanged ? [3] : [] }]} label="特売のレコード"/>
    </div>
  </TableFigure>;
}

function markedBlanks(text: string) {
  return text.split(/(［[a-dg]］)/).map((part, i) => /^［[a-dg]］$/.test(part)
    ? <span key={i} className="source-code-blank" data-source-blank={part[1]} aria-label={'空欄' + part[1]}>{part[1]}</span>
    : part);
}
const codeStyle = {
  whiteSpace: 'pre' as const, minWidth: 'max-content', textAlign: 'start' as const,
  color: ink, fontSize: 'calc(1em * var(--image-scale, 1))',
};
function ControlLane({ symbol, hasFollowingText }: { symbol: string; hasFollowingText: boolean }) {
  const start = symbol === '▲' || symbol === '■' && hasFollowingText;
  const end = symbol === '▼' || symbol === '■' && !hasFollowingText;
  const terminal = symbol === '■' || symbol === '▲' || symbol === '▼';
  return <span aria-hidden="true" data-control-symbol={symbol} style={{ display: 'inline-block', width: '1.25em', position: 'relative', textAlign: 'center' }}>
    <span style={{ position: 'absolute', insetInlineStart: '50%', top: start ? '50%' : 0, bottom: end ? '50%' : 0, borderInlineStart: '1px solid ' + ink }}/>
    {symbol === '├' && <span style={{ position: 'absolute', insetInlineStart: '20%', insetInlineEnd: 0, top: '50%', borderTop: '1px solid ' + ink }}/>}
    {terminal ? symbol : '\u00a0'}
  </span>;
}
function Program(props: Props) {
  const text = props.id === '8-declarations' ? spring2013Pm8Declarations
    : props.id === '8-program' ? spring2013Pm8Program
      : props.id === '8-add-condition' ? spring2013Pm8AddCondition : spring2013Pm8UpdateProgram;
  const controls = props.id === '8-program' || props.id === '8-update-program';
  return <TableFigure {...props} visibleCaption={false}>
    <pre style={codeStyle} data-source-program={props.id}>{controls ? text.split('\n').map((line, i) => {
      const prefix = line.match(/^(?:[│├▲▼■](?: |$))+/)?.[0] ?? '';
      const text = line.slice(prefix.length);
      const dashed = props.id === '8-program' && text === '特売.数量 > 0';
      return <span key={i} data-program-line={i + 1} data-control-prefix={prefix.trimEnd()} style={{ display: 'block' }}>
        {[...prefix.trimEnd()].filter(symbol => symbol !== ' ').map((symbol, lane) =>
          <ControlLane key={lane} symbol={symbol} hasFollowingText={text.length > 0}/>)}
        {dashed ? <span data-source-dashed="" style={{ border: '1px dashed ' + ink, paddingInline: '0.18em' }}>{text}</span>
          : markedBlanks(text)}{line === '' && '\u00a0'}
      </span>;
    }) : text}</pre>
  </TableFigure>;
}

const components: Record<Spring2013Pm0508Drawing, (props: Props) => ReactNode> = {
  '5-master-layout': props => <RecordLayout {...props} id="5-master-layout"/>,
  '5-change-layout': props => <RecordLayout {...props} id="5-change-layout"/>,
  '5-pay-layout': props => <RecordLayout {...props} id="5-pay-layout"/>,
  '5-update-workflow': Workflow, '5-pay-workflow': Workflow, '5-merge-flow': MergeFlow,
  '7-market-chart': MarketChart,
  '8-declarations': Program, '8-purchases-before': Purchases, '8-special-before': Specials,
  '8-purchases-after': Purchases, '8-special-after': Specials, '8-program': Program,
  '8-add-condition': Program, '8-update-program': Program,
};
export const legacy2013SpringPm0508FigureRenderers: BookletFigureRenderer[] =
  (Object.keys(components) as Spring2013Pm0508Drawing[]).map(id => {
    const Component = components[id];
    return { profile: spring2013Pm0508Profile(id), component: props => <Component {...props} id={id}/> };
  });
