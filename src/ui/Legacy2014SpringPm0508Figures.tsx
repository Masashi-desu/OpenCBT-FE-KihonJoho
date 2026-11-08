import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { q0508FigureAlt } from '../core/generators/legacy-2014-spring-pm-05-08-alt';
import { spring2014Pm0508FigureIds } from '../core/generators/legacy-2014-spring-pm-05-08-figures';
import {
  interval, q5CLinks, q5DLinks, q5Data, q5Events, q6Flows, q6SizeColumns, q6VisibleStages, q6VisibleTotals, q7Edges,
  q7VisibleSchedule, q8Cells, shaded,
} from '../core/generators/legacy-2014-spring-pm-05-08-model';
import { q0508FigureProfile } from '../core/generators/legacy-2014-spring-pm-05-08-shared';
import { q6Percentages, q6Stages, q7VerticalBank, q8Program } from '../core/generators/legacy-2014-spring-pm-05-08-source';

type Layout = BookletFigureProps & { id: string };
type Symbols = { arrow: string; start: string; hatch: string };
function Drawing({ id, values, caption, width, height, children }: Layout & {
  width: number; height: number; children: (symbols: Symbols) => ReactNode;
}) {
  const uid = useId(), arrow = uid + '-end', start = uid + '-start', hatch = uid + '-hatch';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg role="img" aria-labelledby={uid + '-title'} aria-describedby={uid + '-desc'} viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`,
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={uid + '-title'}>{caption}</title><desc id={uid + '-desc'}>{q0508FigureAlt(id, values)}</desc>
        <defs>
          {[arrow, start].map(marker => <marker key={marker} id={marker} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient={marker === start ? 'auto-start-reverse' : 'auto'}>
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
          </marker>)}
          <pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M0 5L5 0" stroke="currentColor" opacity=".4"/>
          </pattern>
        </defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.25" fontSize="15">
          {children({ arrow: `url(#${arrow})`, start: `url(#${start})`, hatch: `url(#${hatch})` })}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
const T = ({ x, y, children, center = false }: { x: number; y: number; children: ReactNode; center?: boolean }) =>
  <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={center ? 'middle' : 'start'}>{children}</text>;

type SystemBox = readonly [name: string, x: number, y: number];
type LinkPath = readonly [d: string, x: number, y: number];
const cBoxes: SystemBox[] = [['販売管理', 45, 78], ['配送管理', 389, 78], ['会計', 211, 161], ['調達管理', 45, 238], ['生産管理', 389, 238]];
const dBoxes: SystemBox[] = [['販売管理', 160, 71], ['在庫管理', 160, 360], ['会計', 357, 174], ['調達管理', 357, 268], ['生産管理', 513, 360]];
const cPaths: LinkPath[] = [
  ['M59 36v42', 14, 58], ['M79 78V36', 84, 58], ['M132 78V47H520V256H479', 161, 41],
  ['M389 90H135', 302, 83], ['M135 108h107v53', 150, 125], ['M211 170H90v-49', 110, 164],
  ['M389 108H267v53', 277, 125], ['M414 238v-54H301', 334, 178], ['M90 238v-48h121', 110, 207],
  ['M452 238V121', 457, 220], ['M389 249H135', 285, 242], ['M135 269h254', 158, 287],
];
const dPaths: LinkPath[] = [
  ['M205 71V29', 55, 55], ['M250 88h337v272', 278, 82], ['M250 110h153v64', 280, 104],
  ['M191 114v246', 198, 147], ['M172 360V114', 77, 333], ['M206 360V197h151', 225, 192],
  ['M553 360V197H447', 473, 192], ['M403 268v-51', 318, 247], ['M357 283H220v77', 256, 277],
  ['M357 305H237v55', 257, 299], ['M534 360v-66h-87', 455, 287], ['M513 368H250', 432, 363],
  ['M513 385H250', 432, 380], ['M250 401h263', 269, 396],
];
function SystemFlow(props: Layout) {
  const companyC = props.id === 'q5-c-flow';
  const boxes = companyC ? cBoxes : dBoxes, routes = companyC ? cPaths : dPaths, links = companyC ? q5CLinks : q5DLinks;
  return <Drawing {...props} width={companyC ? 810 : 650} height={companyC ? 315 : 421}>{({ arrow }) => <>
    <T x={companyC ? 70 : 205} y={24} center>顧客</T>
    {links.map(([from, to, name], i) => <g key={from + to + name} data-flow={from + '→' + to + '：' + name}>
      <path d={routes[i][0]} markerEnd={arrow}/><T x={routes[i][1]} y={routes[i][2]}>{name}</T>
    </g>)}
    {boxes.map(([name, x, y]) => <g key={name} data-system={name}>
      <rect x={x} y={y} width={90} height={43}/><T x={x + 45} y={y + 18} center>{name}</T>
      <T x={x + 45} y={y + 36} center>システム</T>
    </g>)}
    {companyC && <g>
      <T x={537} y={187}>（凡例）</T><T x={547} y={211}>AシステムからBシステムに対して，</T>
      <T x={547} y={230}>情報Cを渡すことを表す。</T>
      <rect x="547" y="250" width="95" height="30"/><rect x="707" y="250" width="95" height="30"/>
      <T x={594} y={270} center>Aシステム</T><T x={754} y={270} center>Bシステム</T>
      <path d="M642 265h65" markerEnd={arrow}/><T x={650} y={258}>情報C</T>
    </g>}
  </>}</Drawing>;
}

type RosterNode = readonly [name: string, x: number, y: number, kind: 'file' | 'small-file' | 'process' | 'media' | 'terminal' | 'document', lines: string[]];
const rosterNodes: RosterNode[] = [
  ['オンラインストレージ（入力）', 72, 36, 'small-file', ['オンライン', 'ストレージ']],
  ['電子記憶媒体（入力）', 72, 123, 'media', ['電子記憶媒体']], ['授受リスト（入力）', 72, 207, 'document', ['授受リスト']],
  ['メンテナンス用端末', 153, 269, 'terminal', ['メンテナンス用', '端末']], ['データ取込', 262, 123, 'process', ['データ取込']],
  ['エラーファイル', 262, 199, 'file', ['エラー', 'ファイル']], ['名簿マスタ', 416, 178, 'file', ['名簿マスタ']],
  ['データ整備', 287, 285, 'process', ['データ整備']], ['抽出条件テーブル', 492, 64, 'file', ['抽出条件', 'テーブル']],
  ['データ抽出', 626, 123, 'process', ['データ抽出']], ['オンラインストレージ（出力）', 786, 36, 'small-file', ['オンライン', 'ストレージ']],
  ['電子記憶媒体（出力）', 786, 123, 'media', ['電子記憶媒体']], ['授受リスト（出力）', 786, 207, 'document', ['授受リスト']],
  ['ログデータ', 626, 199, 'file', ['ログデータ']], ['料金テーブル', 492, 285, 'file', ['料金', 'テーブル']],
  ['請求書作成', 626, 285, 'process', ['請求書作成']], ['請求書', 786, 285, 'document', ['請求書']], ['請求金額', 626, 373, 'file', ['請求金額']],
];
const rosterPaths = [
  'M103 36L209 112', 'M105 123H209', 'M103 207l31 43', 'M158 245l66-102', 'M185 279l49 6', 'M262 144v26',
  'M315 125l51 40', 'M366 173l-51-40', 'M274 228l4 36', 'M306 264l60-71', 'M366 201l-56 63',
  'M466 174l107-43', 'M542 64l31 47', 'M679 112l76-76', 'M679 123h74', 'M679 133l76 74', 'M626 144v26',
  'M626 228v36', 'M542 285h31', 'M679 285h76', 'M623 306v38', 'M629 344v-38',
];
function RosterFlow(props: Layout) {
  return <Drawing {...props} width={888} height={409}>{({ arrow }) => <>
    <T x={27} y={116} center>入力</T><T x={27} y={135} center>データ</T>
    <T x={855} y={116} center>抽出</T><T x={855} y={135} center>データ</T>
    {q6Flows.map(([from, to], i) => <path key={from + to} d={rosterPaths[i]} data-flow={from + '→' + to} markerEnd={arrow}/>)}
    {rosterNodes.map(([name, x, y, kind, labels]) => {
      const width = kind === 'file' ? 100 : kind === 'process' ? 106 : 62, left = x - width / 2, right = x + width / 2;
      const inside = kind === 'process' || kind === 'file';
      return <g key={name} data-process={name}>
        {(kind === 'file' || kind === 'small-file') && <>
          <path d={`M${left} ${y - 21}v${kind === 'file' ? 48 : 35}c0 9 ${width} 9 ${width} 0V${y - 21}`}/>
          <ellipse cx={x} cy={y - 21} rx={width / 2} ry={5}/>
        </>}
        {kind === 'process' && <rect x={left} y={y - 21} width={width} height="42"/>}
        {kind === 'media' && <><path d={`M${left} ${y - 21}h${width}m-${width} 42h${width}M${left} ${y - 21}q-9 21 0 42`}/>
          <ellipse cx={right} cy={y} rx="6" ry="21"/></>}
        {kind === 'document' && <path d={`M${left} ${y + 17}v-38h${width}v38q-16-10-31 0t-31 0Z`}/>}
        {name === '請求書' && <path d={`M${left + 5} ${y - 21}v-7h${width}v39h-5m-51-39v-7h${width}v39h-5`}/>}
        {kind === 'terminal' && <path d={`M${x - 27} ${y + 19}h54v-18h-54zm8-18q-13-15 0-27h38q13 12 0 27`}/>}
        {labels.map((label, index) => <T key={label} x={x} y={y + (inside ? labels.length === 1 ? 5 : 0 : kind === 'small-file' ? 36 : 40) + index * 17} center>{label}</T>)}
      </g>;
    })}
  </>}</Drawing>;
}

function TableFrame({ caption, children }: { caption: string; children: ReactNode }) {
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <table className="detailed-figure-table" style={{ borderCollapse: 'collapse', marginInline: 'auto', minWidth: 'max-content', color: 'var(--diagram-ink)' }}>
        <caption>{caption}</caption>{children}
      </table>
    </div>
  </figure>;
}
const line = { border: '1px solid var(--diagram-ink)', padding: '0.2em 0.45em', textAlign: 'center' as const };
const hidden = { ...line, background: 'repeating-linear-gradient(135deg, transparent, transparent 4px, var(--diagram-border) 5px, transparent 6px)' };
const cell = (value: ReactNode, span?: number, rows?: number) => <td style={value === shaded ? hidden : line} colSpan={span} rowSpan={rows}>
  {value === shaded ? <span className="sr-only">{shaded}</span> : value}
</td>;
const head = (value: ReactNode, span?: number, rows?: number) => <th style={line} colSpan={span} rowSpan={rows}>{value}</th>;

function InventoryTiming({ caption, values }: Layout) {
  const { positions } = q5Data(values[0]);
  return <TableFrame caption={caption}>
    <thead><tr>{head('在庫を更新するタイミング', 2, 2)}{head('インタフェースの設定内容', 4)}</tr>
      <tr>{['品番コード', '在庫区分', '入出庫区分', '数量'].map(label => <th key={label} style={line}>{label}</th>)}</tr></thead>
    <tbody>{q5Events.map(([system, event], i) => {
      const blank = positions.findIndex(position => position === i);
      return <tr key={system + i} data-event={event}>
        {i === 0 ? head(system, undefined, 4) : i === 4 ? head(system, undefined, 2) : i > 5 ? head(system) : null}
        {i === 0 ? cell(event, undefined, 2) : i === 1 ? null : cell(event)}
        {i === 0 && cell(<>更新を行う<br/>在庫品の<br/>品番コード</>, undefined, 8)}
        {blank < 0 ? <>{cell(shaded)}{cell(shaded)}{cell(shaded)}</> : cell('［' + 'cdef'[blank] + '］', 3)}
      </tr>;
    })}</tbody>
  </TableFrame>;
}
function RosterTotals({ caption, values }: Layout) {
  const { rows, totals } = q6VisibleTotals(values[0]);
  return <TableFrame caption={caption}>
    <thead><tr>{head(<>ファンクション名<br/>╲ 処理名</>)}{q6SizeColumns.map(label => <th key={label} style={line}>{label}</th>)}</tr></thead>
    <tbody>{rows.map(row => <RosterTotalRows key={row.process} row={row}/>)}
      <tr>{head('ファンクション別開発規模合計')}{totals.map((total, i) => <td key={q6SizeColumns[i]} style={total === shaded ? hidden : line}>
        {total === shaded ? <span className="sr-only">{shaded}</span> : total}
      </td>)}{cell(shaded)}</tr>
    </tbody>
  </TableFrame>;
}
function RosterTotalRows({ row }: { row: ReturnType<typeof q6VisibleTotals>['rows'][number] }) {
  return <>
    <tr data-process={row.process}>{head(row.process, undefined, 2)}{row.count.map((value, i) => <td key={q6SizeColumns[i]} style={line}>{value}</td>)}
      {cell('╱')}{cell(row.effort, undefined, 2)}</tr>
    <tr>{row.size.map((value, i) => <td key={q6SizeColumns[i]} style={value === shaded ? hidden : line}>
      {value === shaded ? <span className="sr-only">{shaded}</span> : value}
    </td>)}{cell(row.total)}</tr>
  </>;
}
function RosterStages({ caption, values }: Layout) {
  return <TableFrame caption={caption}>
    <thead><tr>{head('工程名')}{q6Stages.map(stage => <th key={stage} style={line}>{stage}</th>)}{head('処理別工数合計（人月）', undefined, 2)}</tr>
      <tr>{head(<>工程比率<br/>╲ 処理名</>)}{q6Percentages.map((p, i) => <th key={q6Stages[i]} style={line}>{p}%</th>)}</tr></thead>
    <tbody>{q6VisibleStages(values[0]).map(row => <tr key={row.process} data-process={row.process}>{head(row.process)}
      {[...row.cells, row.effort].map((value, i) => <td key={i} style={value === shaded ? hidden : line}>
        {value === shaded ? <span className="sr-only">{shaded}</span> : value}
      </td>)}</tr>)}</tbody>
  </TableFrame>;
}
const networkPoints = [[0, 0], [32, 103], [100, 103], [168, 103], [241, 163], [241, 43], [311, 103], [381, 103],
  [450, 43], [450, 163], [520, 103], [590, 103], [660, 103]];
function ScheduleNetwork(props: Layout) {
  return <Drawing {...props} width={705} height={204}>{({ arrow }) => <>
    {q7Edges.map(([from, to, job]) => {
      const [x, y] = networkPoints[from], [tx, ty] = networkPoints[to], dx = tx - x, dy = ty - y;
      const a = Math.atan2(dy, dx), vx = Math.cos(a) * 17, vy = Math.sin(a) * 13;
      const above = job === 4 || job === 6 || job === 11;
      return <g key={job} data-activity={'No' + job}>
        <path d={`M${x + vx} ${y + vy}L${tx - vx} ${ty - vy}`} markerEnd={arrow}/>
        <T x={(x + tx) / 2 + (job === 7 ? -12 : 0)} y={(y + ty) / 2 + (above ? -10 : 21)} center>No{job}</T>
      </g>;
    })}
    {networkPoints.slice(1).map(([x, y], i) => <g key={i} data-node={i + 1}>
      <ellipse cx={x} cy={y} rx="17" ry="13"/><T x={x} y={y + 5} center>{i + 1}</T>
    </g>)}
  </>}</Drawing>;
}
function Staffing({ caption, values }: Layout) {
  return <TableFrame caption={caption}>
    <thead><tr>{head('開始時刻')}{head('作業', 4)}{head('必要人数')}</tr></thead>
    <tbody>{q7VisibleSchedule(values[0]).map(({ time, tasks, people }) => <tr key={time} data-hour={time}>
      {head(time + '時')}
      {tasks?.map((task, i) => task === -7 ? null : <td key={i} style={line} rowSpan={task === 7 ? 2 : undefined}>
        {task ? <>No{task}{task === 7 && <sup>1)</sup>}</> : null}
      </td>)}
      {time === 11 && [0, 1, 2, 3].map(i => <td key={i} style={hidden} rowSpan={6}><span className="sr-only">{shaded}</span></td>)}
      {time === 13 ? cell(people, undefined, 3) : time !== 14 && time !== 15 ? cell(people) : null}
    </tr>)}
      <tr>{cell('～～～～～～～～～～～～～～～～', 6)}</tr>
      <tr>{cell(shaded)}{cell(shaded)}{cell(shaded)}{cell(shaded)}{cell(shaded)}{cell(shaded)}</tr>
    </tbody>
  </TableFrame>;
}
function ChoiceDiagram({ id, values, caption }: Layout) {
  const vertical = id === 'q7-vertical';
  const labels = vertical ? q7VerticalBank[values[1]] : q5Data(values[0]).choices[values[1]];
  return <table style={{ borderCollapse: 'collapse', color: 'var(--diagram-ink)' }} aria-label={caption}>
    <tbody>{vertical ? labels.map((label, index) => <tr key={index}><td style={line}>{label}</td></tr>)
      : <tr>{labels.map((label, index) => <td key={index} style={line}>{label}</td>)}</tr>}</tbody>
  </table>;
}
function FreeCells(props: Layout) {
  const { active, list, label } = q8Cells(props.values[0], props.id === 'q8-initial' ? 0 : props.id === 'q8-after-alloc' ? 1 : 2);
  return <Drawing {...props} width={575} height={82}>{({ hatch }) => <>
    <T x={25} y={33} center>…</T><T x={549} y={33} center>…</T>
    {active.map((used, i) => <g key={i} data-cell={i} data-allocated={used}>
      <rect x={52 + 47 * i} y="9" width="47" height="35" fill={used ? hatch : 'none'}/><T x={76 + 47 * i} y={33} center>{i}</T>
    </g>)}
    <T x={52} y={70}>{label}：{'{' + list.map(interval).join('，') + '}'}</T>
  </>}</Drawing>;
}
function AllocProgram({ caption }: Layout) {
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption}><pre data-alloc-program="">{q8Program}</pre></div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

const drawings = {
  'q5-c-flow': SystemFlow, 'q5-d-flow': SystemFlow, 'q5-timing': InventoryTiming, 'q5-triple': ChoiceDiagram,
  'q6-flow': RosterFlow, 'q6-totals': RosterTotals, 'q6-stages': RosterStages,
  'q7-network': ScheduleNetwork, 'q7-schedule': Staffing, 'q7-vertical': ChoiceDiagram,
  'q8-initial': FreeCells, 'q8-after-alloc': FreeCells, 'q8-after-free': FreeCells, 'q8-program': AllocProgram,
};
export const legacy2014SpringPm0508FigureRenderers: BookletFigureRenderer[] = spring2014Pm0508FigureIds.map(id => {
  const Component = drawings[id as keyof typeof drawings];
  return { profile: q0508FigureProfile(id), component: props => <Component id={id} {...props}/> };
});
