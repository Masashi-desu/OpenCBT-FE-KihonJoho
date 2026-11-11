import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2010SpringPm0104Figures, profiles, relationChoices, requirementRows } from '../core/generators/legacy-2010-spring-pm-01-04-figures';
import { cacheDirectory, cacheExample, cacheTimeline } from '../core/generators/legacy-2010-spring-pm-01-04-cache';
import { relations, teacherNote } from '../core/generators/legacy-2010-spring-pm-01-04-database';
import { capacities, probabilities, trafficTable } from '../core/generators/legacy-2010-spring-pm-01-04-queue';
import { exampleTree, firstTrees, secondTrees, type Tree } from '../core/generators/legacy-2010-spring-pm-01-04-syntax';

type Kind = keyof typeof profiles;
type CanvasProps = BookletFigureProps & { kind: Kind; width: number; height: number; captionAbove?: true; hiddenCaption?: true; children: (arrow: string) => ReactNode };
function Canvas({ kind, caption, values, width, height, hiddenCaption, captionAbove, children }: CanvasProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2010SpringPm0104Figures.find(item => item.profile === profile)!.alt(values);
  const size = 'calc(' + width + 'px * var(--image-scale, 1))';
  const figcaption = <figcaption style={{ width: 'min(100%, ' + size + ')' }}>{caption}</figcaption>;
  return <figure className="managed-diagram source-figure">
    {captionAbove && !hiddenCaption && figcaption}
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: size, height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={9} markerHeight={9} markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M1 1L8 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.4}/>
        </marker></defs>
        <g fill="none" stroke="currentColor" strokeWidth={1.4} fontSize={15} aria-hidden="true">
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
    {!captionAbove && !hiddenCaption && figcaption}
  </figure>;
}

function Text({ x, y, align = 'middle', children }: { x: number; y: number; align?: 'start' | 'end' | 'middle'; children: ReactNode }) {
  return <text x={x} y={y} textAnchor={align} fill="currentColor" stroke="none">{children}</text>;
}
function RectText({ x, y, width, height, label }: { x: number; y: number; width: number; height: number; label: string }) {
  return <><rect x={x} y={y} width={width} height={height}/>
    {label.split('\n').map((text, i, lines) =>
      <Text key={i} x={x + width / 2} y={y + height / 2 + (i - (lines.length - 1) / 2) * 21 + 5}>{text}</Text>)}</>;
}
function CacheLayer(props: BookletFigureProps) {
  return <Canvas {...props} kind="cacheLayer" width={640} height={246}>{arrow => <>
    <ellipse cx={220} cy={42} rx={80} ry={26}/><Text x={220} y={48}>CPU</Text>
    <RectText x={130} y={112} width={180} height={36} label="キャッシュメモリ"/>
    <RectText x={130} y={196} width={180} height={36} label="主記憶"/>
    <path d="M220 71V109" markerStart={arrow} markerEnd={arrow}/>
    <path d="M220 151V193" markerStart={arrow} markerEnd={arrow}/>
    <Text x={330} y={95} align="start">語単位で転送（高速）</Text>
    <Text x={330} y={177} align="start">ブロック単位で転送（低速）</Text>
  </>}</Canvas>;
}
const directoryColumns = ['ブロック番号', '順位', 'フラグ'];
const directoryWidths = [140, 100, 100];
function Directories({ rows, x, y, h }: { rows: string[][]; x: number; y: number; h: number }) {
  return <g>
    {directoryColumns.map((column, j) => {
      const offset = directoryWidths.slice(0, j).reduce((sum, width) => sum + width, x);
      return <Text key={column} x={offset + directoryWidths[j] / 2} y={y - 10}>{column}</Text>;
    })}
    {rows.map((row, i) => {
      const rowY = y + i * h;
      return <g key={i}><Text x={x - 10} y={rowY + h / 2 + 6} align="end">{'ディレクトリ' + (i + 1)}</Text>
        {row.map((value, j) => {
          const offset = directoryWidths.slice(0, j).reduce((sum, width) => sum + width, x), width = directoryWidths[j];
          const blank = value.startsWith('［');
          return <g key={j}>
            <rect x={offset} y={rowY} width={width} height={h}/>
            {blank && <rect x={offset + 18} y={rowY + 6} width={width - 36} height={h - 12} strokeWidth={2}/>}
            <Text x={offset + width / 2} y={rowY + h / 2 + 6}>{blank ? value.slice(1, -1) : value}</Text>
          </g>;
        })}
      </g>;
    })}
  </g>;
}
function CacheExample(props: BookletFigureProps) {
  const entries = cacheExample(props.values[0]);
  return <Canvas {...props} kind="cacheExample" width={885} height={258}>{arrow => <>
    <Text x={320} y={25}>ディレクトリ部</Text><Text x={684} y={25}>データ部</Text>
    <Directories rows={entries.map(({ block, rank, flag }) => [block, rank, flag].map(String))} x={150} y={69} h={43}/>
    {entries.map(({ block }, i) => {
      const rowY = 49 + i * 62, middle = rowY + 31;
      return <g key={i}>
        <path d={'M490 ' + (90.5 + i * 43) + 'L603 ' + middle} markerEnd={arrow}/>
        <RectText x={610} y={rowY} width={152} height={62} label={block ? 'ブロック番号' + block + 'の\n主記憶の内容' : '未使用'}/>
        <path d={'M769 ' + (rowY + 4) + 'q10 0 10 12v4q0 11 8 11q-8 0-8 11v4q0 12-10 12'}/>
        <Text x={795} y={middle + 5} align="start">{'バッファ' + (i + 1)}</Text>
      </g>;
    })}
  </>}</Canvas>;
}
function DirectorySnapshot(props: BookletFigureProps & { kind: 'cacheAfterLoad' | 'cacheAfterStore'; at: 0 | 6 }) {
  return <Canvas {...props} width={566} height={185}>{() =>
    <Directories rows={cacheDirectory(props.values[0], props.at)} x={150} y={35} h={45}/>
  }</Canvas>;
}
function CacheTimeline(props: BookletFigureProps) {
  const x = 132, y = 14, h = 34, addressWidth = 104, cell = 103, end = x + addressWidth + 6 * cell, body = y + 2 * h;
  const rows = cacheTimeline(props.values[0]);
  return <Canvas {...props} kind="cacheTimeline" width={875} height={647} captionAbove>{() => <>
    <RectText x={x} y={y} width={addressWidth} height={2 * h} label={'実行命令\nの番地'}/>
    {[0, 1, 2].map(i => {
      const offset = x + addressWidth + i * cell * 2;
      return <g key={i}>
        <RectText x={offset} y={y} width={2 * cell} height={h} label={'ディレクトリ' + (i + 1)}/>
        <RectText x={offset} y={y + h} width={cell} height={h} label="ブロック番号"/>
        <RectText x={offset + cell} y={y + h} width={cell} height={h} label="フラグ"/>
      </g>;
    })}
    {rows.map(({ address, cells }, i) => {
      const top = body + i * h;
      return <g key={i}>
        <RectText x={x} y={top} width={addressWidth} height={h} label={address}/>
        {cells.map((pair, j) => {
          const offset = x + addressWidth + j * 2 * cell;
          if (pair.length === 1) return <g key={j} data-cache-blank={pair[0].slice(1, -1)}>
            <rect x={offset} y={top} width={2 * cell} height={h}/>
            <rect x={offset + 11} y={top + 6} width={2 * cell - 22} height={h - 12} strokeWidth={2}/>
            <Text x={offset + cell} y={top + 22}>{pair[0].slice(1, -1)}</Text>
          </g>;
          if (!pair.length) return <g key={j}>
            <rect x={offset} y={top} width={2 * cell} height={h} fill="currentColor" opacity={0.15}/>
            <rect x={offset} y={top} width={cell} height={h}/>
            <rect x={offset + cell} y={top} width={cell} height={h}/>
          </g>;
          return <g key={j}>
            <RectText x={offset} y={top} width={cell} height={h} label={pair[0]}/>
            <RectText x={offset + cell} y={top} width={cell} height={h} label={pair[1]}/>
          </g>;
        })}
      </g>;
    })}
    {[2, 9].map((row, i) => {
      const first = body + row * h, middle = first + 3.5 * h, bottom = first + 7 * h;
      return <g key={row}>
        <path d={'M124 ' + (first + 3) + 'q-10 0-10 10V' + (middle - 10) + 'q0 10-8 10q8 0 8 10V' + (bottom - 13) + 'q0 10 10 10'}/>
        <Text x={22} y={middle - 4} align="start">{(i + 1) + '回目の'}</Text>
        <Text x={22} y={middle + 17} align="start">ループ</Text>
      </g>;
    })}
    <path d={'M' + end + ' ' + y + 'V' + (body + rows.length * h)}/>
  </>}</Canvas>;
}

type TreeNode = { x: number; y: number; text: string; children: TreeNode[] };
function placeTree(tree: Tree) {
  let leaves = 0;
  const layout = (item: Tree, depth: number): TreeNode => {
    const y = 29 + depth * 52;
    if (typeof item === 'string') return { x: 58 + leaves++ * 65, y, text: item, children: [] };
    const left = layout(item[1], depth + 1), right = layout(item[2], depth + 1);
    return { x: (left.x + right.x) / 2, y, text: item[0], children: [left, right] };
  };
  return layout(tree, 0);
}
function TreeDrawing({ node }: { node: TreeNode }) {
  return <g>
    <Text x={node.x} y={node.y + 5}>{node.text}</Text>
    {node.children.map((child, i) => <g key={i}>
      <path d={'M' + (node.x + (i ? 11 : -11)) + ' ' + (node.y + 10) + 'L' + child.x + ' ' + (child.y - 10)}/>
      <TreeDrawing node={child}/>
    </g>)}
  </g>;
}
function TreeFigure(props: BookletFigureProps & { kind: 'treeWalk' | 'firstTree' | 'secondTree'; tree: Tree }) {
  const walk = props.kind === 'treeWalk';
  return <Canvas {...props} width={386} height={walk ? 171 : 270} hiddenCaption={walk ? undefined : true}>{arrow => <>
    <TreeDrawing node={placeTree(props.tree)}/>
    {walk && <>
      <path d="M112 34C93 58 66 88 45 118S54 153 75 124" markerEnd={arrow}/>
      <path d="M78 123C103 96 104 154 129 144C145 138 136 111 119 102" markerEnd={arrow}/>
      <path d="M119 102C100 72 132 51 152 73C177 105 207 94 205 74C202 58 184 48 170 37" markerEnd={arrow}/>
    </>}
  </>}</Canvas>;
}
function StackColumn({ x, values }: { x: number; values: string[] }) {
  return <g>
    <path d={'M' + x + ' 22V143H' + (x + 106) + 'V22'}/>
    {values.map((value, i) => {
      const y = 143 - (values.length - i) * 34;
      return <g key={i}><path d={'M' + x + ' ' + y + 'h106'}/><Text x={x + 53} y={y + 23}>{value}</Text></g>;
    })}
  </g>;
}
function Stack(props: BookletFigureProps) {
  const push = props.values[0] === 0;
  return <Canvas {...props} kind="stack" width={466} height={165} hiddenCaption>{arrow => <>
    <StackColumn x={44} values={push ? ['y', 'z'] : ['x', 'y', 'z']}/>
    <StackColumn x={290} values={push ? ['x', 'y', 'z'] : ['y＋x', 'z']}/>
    <Text x={220} y={43}>{push ? 'push(x)' : 'add'}</Text>
    <path d="M158 59H282" markerEnd={arrow}/>
  </>}</Canvas>;
}

type Relation = typeof relationChoices[number];
const relationWidth = (columns: string[]) => columns.map(column => Math.max(75, column.length * 16 + 16));
function RelationDrawing({ relation, x, y }: { relation: Relation; x: number; y: number }) {
  const widths = relationWidth(relation.columns);
  return <g>
    <Text x={x} y={y - 11} align="start">{relation.name}</Text>
    {relation.columns.map((column, i) => {
      const offset = widths.slice(0, i).reduce((sum, width) => sum + width, x), width = widths[i];
      return <g key={column} data-primary-key={i < relation.keys}>
        <RectText x={offset} y={y} width={width} height={35} label={column}/>
        {i < relation.keys && <path d={'M' + (offset + 10) + ' ' + (y + 28) + 'h' + (width - 20)}/>}
      </g>;
    })}
  </g>;
}
function Database(props: BookletFigureProps) {
  return <Canvas {...props} kind="database" width={780} height={315}>{() => <>
    <RelationDrawing relation={relations.students} x={30} y={34}/>
    <RelationDrawing relation={relations.history} x={30} y={118}/>
    <Text x={31} y={177} align="start">{teacherNote}</Text>
    <RelationDrawing relation={relations.teachers} x={30} y={228}/>
  </>}</Canvas>;
}
function RelationFigure(props: BookletFigureProps) {
  const relation = relationChoices[props.values[0]], width = relationWidth(relation.columns).reduce((sum, cell) => sum + cell, 52);
  return <Canvas {...props} kind="relation" width={width} height={86} hiddenCaption>{() =>
    <RelationDrawing relation={relation} x={22} y={33}/>
  }</Canvas>;
}
function Requirements(props: BookletFigureProps) {
  const rows = requirementRows(props.values[0]), heights = [45, 45, 61, 45, 45];
  const x = 20, left = 653, right = 135;
  return <Canvas {...props} kind="requirements" width={830} height={266} captionAbove>{() => <>
    {rows.map(([label, value], i) => {
      const y = heights.slice(0, i).reduce((sum, height) => sum + height, 8), height = heights[i];
      const lines = i === 2 ? ['動画1本の平均再生時間（再生時間は指数分布に従い，', '動画の再生時間と送信時間は等しいものとする）'] : [label];
      return <g key={label}>
        <rect x={x} y={y} width={left} height={height}/>
        <RectText x={x + left} y={y} width={right} height={height} label={value}/>
        {lines.map((line, lineIndex) => <Text key={line} x={x + 10}
          y={y + height / 2 + (lineIndex - (lines.length - 1) / 2) * 20 + 5} align="start">{line}</Text>)}
      </g>;
    })}
  </>}</Canvas>;
}
function Queue(props: BookletFigureProps) {
  const x = 17, y = 10, axisWidth = 95, cell = 66, h = 34, start = x + axisWidth, body = y + 2 * h;
  return <Canvas {...props} kind="queue" width={856} height={340} captionAbove>{() => <>
    <rect x={x} y={y} width={axisWidth} height={2 * h}/>
    <RectText x={start} y={y} width={cell * probabilities.length} height={h} label="P（％）"/>
    {probabilities.map((p, i) => <RectText key={p} x={start + i * cell} y={y + h} width={cell} height={h} label={String(p)}/>)}
    <RectText x={x} y={body} width={44} height={h * capacities.length} label={'n\n（本）'}/>
    {capacities.map((n, i) => {
      const top = body + i * h;
      return <g key={n}>
        <RectText x={x + 44} y={top} width={axisWidth - 44} height={h} label={String(n)}/>
        {trafficTable[i].map((traffic, j) => <g key={j} data-traffic={traffic.toFixed(1)}>
          <rect x={start + j * cell} y={top} width={cell} height={h} fill="currentColor" opacity={0.14}/>
          <RectText x={start + j * cell} y={top} width={cell} height={h} label={traffic.toFixed(1)}/>
        </g>)}
      </g>;
    })}
  </>}</Canvas>;
}

export const legacy2010SpringPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.cacheLayer, component: CacheLayer }, { profile: profiles.cacheExample, component: CacheExample },
  { profile: profiles.cacheAfterLoad, component: props => <DirectorySnapshot {...props} kind="cacheAfterLoad" at={0}/> },
  { profile: profiles.cacheAfterStore, component: props => <DirectorySnapshot {...props} kind="cacheAfterStore" at={6}/> },
  { profile: profiles.cacheTimeline, component: CacheTimeline },
  { profile: profiles.treeWalk, component: props => <TreeFigure {...props} kind="treeWalk" tree={exampleTree}/> },
  { profile: profiles.firstTree, component: props => <TreeFigure {...props} kind="firstTree" tree={firstTrees[props.values[0]]}/> },
  { profile: profiles.secondTree, component: props => <TreeFigure {...props} kind="secondTree" tree={secondTrees[props.values[0]]}/> },
  { profile: profiles.stack, component: Stack }, { profile: profiles.database, component: Database },
  { profile: profiles.relation, component: RelationFigure }, { profile: profiles.requirements, component: Requirements },
  { profile: profiles.queue, component: Queue },
];
