import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  autumn2014Pm0508PageAlt, q5DiagramAlt, q5Directory, q5OrganizationTree, q5TraversalCells,
  q5TraversalExamples, q8Example, q8GraphAlt, q8Matches, q8Program, type Point,
} from '../core/generators/legacy-2014-autumn-pm-05-08-source';
import { q0508FigureProfile } from '../core/generators/legacy-2014-autumn-pm-05-08-shared';
import { q8ChoiceGraphs } from '../core/generators/legacy-2014-autumn-pm-8';

type DrawingProps = {
  caption: string; description: string; width: number; height: number; showCaption?: boolean;
  children: (symbols: { arrow: string; triangle: string; shade: string }) => ReactNode;
};
function Drawing({ caption, description, width, height, showCaption = true, children }: DrawingProps) {
  const id = useId(), arrow = id + '-arrow', triangle = id + '-triangle', shade = id + '-shade';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'} viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{description}</desc>
        <defs>
          <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
          </marker>
          <marker id={triangle} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" orient="auto">
            <path d="M1 1L11 6L1 11Z" fill="none" stroke="currentColor"/>
          </marker>
          <pattern id={shade} width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M0 5L5 0" stroke="currentColor" opacity=".4"/>
          </pattern>
        </defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" fontSize="15">
          {children({ arrow: `url(#${arrow})`, triangle: `url(#${triangle})`, shade: `url(#${shade})` })}
        </g>
      </svg>
    </div>
    <figcaption className={showCaption ? undefined : "sr-only"}>{caption}</figcaption>
  </figure>;
}
const T = ({ x, y, children, align = 'start', italic = false }: {
  x: number; y: number; children: ReactNode; align?: 'start' | 'middle'; italic?: boolean;
}) => <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={align} fontStyle={italic ? 'italic' : undefined}>{children}</text>;

function ClassBox({ x, y, width = 144, name, attributes = [], operations = [], shade, abstract = false, isInterface = false }: {
  x: number; y: number; width?: number; name?: string; attributes?: string[]; operations?: string[];
  shade?: string; abstract?: boolean; isInterface?: boolean;
}) {
  const header = isInterface ? 42 : 28, attrHeight = Math.max(1, attributes.length) * 20 + 8, opHeight = Math.max(1, operations.length) * 20 + 8;
  const attrTop = y + header, opTop = attrTop + attrHeight;
  return <g data-uml-class={name}>
    <rect x={x} y={y} width={width} height={header + attrHeight + opHeight}/>
    {shade && <rect x={x} y={y} width={width} height={header} stroke="none" fill={shade}/>}
    <path d={`M${x} ${attrTop}h${width}M${x} ${opTop}h${width}`}/>
    {isInterface && <T x={x + width / 2} y={y + 16} align="middle">≪interface≫</T>}
    {name && <T x={x + width / 2} y={y + (isInterface ? 35 : 20)} align="middle">{name}</T>}
    {attributes.map((value, i) => <T key={value} x={x + 10} y={attrTop + 20 * i + 20}>{value}</T>)}
    {operations.map((value, i) => <T key={value} x={x + 10} y={opTop + 20 * i + 20} italic={abstract}>{value}</T>)}
  </g>;
}

function Directory({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={q5DiagramAlt['q5-ui']} width={730} height={365}>{() => <>
    <rect x="12" y="12" width="706" height="341"/><T x={365} y={35} align="middle">【社員検索画面】</T>
    <rect x="24" y="47" width="326" height="294"/><rect x="362" y="47" width="344" height="294"/>
    <path d="M362 72h344M546 47v294M603 47v294M666 47v294"/>
    {['名前', '内線', '職位', '…'].map((label, i) => <T key={label} x={[454, 575, 633, 686][i]} y={65} align="middle">{label}</T>)}
    {q5OrganizationTree.map(([label, depth, symbol], i) => {
      const x = 36 + depth * 22, y = 66 + i * 22;
      const selected = label === '金融システム部';
      return <g key={label} data-tree-depth={depth} data-selected={selected || undefined}>
        {depth > 0 && <path d={`M${x - 13} ${y - 20}v15h12`} strokeDasharray="2 2"/>}
        <rect x={x} y={y - 12} width="14" height="14"/><T x={x + 7} y={y - 1} align="middle">{symbol}</T>
        <path d={`M${x + 14} ${y - 5}h10`} strokeDasharray="2 2"/>
        {selected && <rect x={x + 26} y={y - 15} width="119" height="20"/>}
        <T x={x + 28} y={y}>{label}</T>
      </g>;
    })}
    {q5Directory.map(([name, extension, position], i) => <g key={name}>
      <T x={370} y={92 + i * 23}>{name}</T><T x={575} y={92 + i * 23} align="middle">{extension}</T>
      <T x={634} y={92 + i * 23} align="middle">{position}</T>
    </g>)}
  </>}</Drawing>;
}

function AnalysisDiagram({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={q5DiagramAlt['q5-analysis']} width={580} height={250}>{({ arrow, triangle, shade }) => <>
    <ClassBox x={16} y={22} width={115} shade={shade}/><ClassBox x={242} y={22} width={116} name="［a］"/>
    <ClassBox x={120} y={160} width={115} shade={shade}/><ClassBox x={357} y={160} width={115} name="［b］"/>
    <path data-uml-dependency="" d="M131 66H242" strokeDasharray="6 4" markerEnd={arrow}/>
    <path d="M177 160v-30h237v30"/><path data-uml-generalization="" d="M300 130V106" markerEnd={triangle}/>
    <path data-uml-aggregation="" d="M358 66H550V202H486M472 202l7 -5l7 5l-7 5Z"/>
    <T x={365} y={57}>［c］</T><T x={492} y={194}>［d］</T>
  </>}</Drawing>;
}
function Legend({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={q5DiagramAlt['q5-legend']} width={405} height={253}>{({ arrow, triangle }) => <>
    {[['A', 22, 12], ['B', 264, 12], ['C', 22, 144], ['D', 264, 144]].map(([name, x, y]) =>
      <ClassBox key={name} x={Number(x)} y={Number(y)} width={101} name={'クラス' + name} attributes={['属性']} operations={['操作']} abstract={name === 'A'}/>)}
    <path d="M264 58H123" strokeDasharray="6 4" markerEnd={arrow}/>
    <path d="M73 144V96" markerEnd={triangle}/>
    <path d="M123 184H250M250 184l7 -5l7 5l-7 5Z"/>
    <path d="M123 216H264" strokeDasharray="6 4" markerEnd={arrow}/>
    <T x={129} y={175}>1..*</T><T x={245} y={175}>1</T><T x={197} y={210} align="middle">≪create≫</T>
  </>}</Drawing>;
}
function ListDiagram({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={q5DiagramAlt['q5-list']} width={251} height={185}>{() =>
    <ClassBox x={17} y={11} width={217} name="組織エントリリスト" attributes={['elements', 'size']} operations={['count', 'add', 'remove', 'item']}/>
  }</Drawing>;
}
function Traversal({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={q5DiagramAlt['q5-traversal']} width={645} height={205}>{({ arrow, shade }) => <>
    {q5TraversalExamples.map(({ label, forward, skipped }, i) => {
      const x = 15 + (i % 2) * 316, y = 17 + (i > 1 ? 94 : 0);
      return <g key={label} data-traversal={i}>
        {q5TraversalCells.map((value, j) => <g key={value}>
          <rect x={x + j * 73} y={y} width="73" height="26" fill={skipped.includes(j) ? shade : 'none'}/>
          <T x={x + j * 73 + 36} y={y + 18} align="middle">{value}</T>
          <T x={x + j * 73 + 36} y={y + 44} align="middle">{j + 1}</T>
        </g>)}
        <path d={forward ? `M${x} ${y + 50}h292` : `M${x + 292} ${y + 50}h-292`} markerEnd={arrow} strokeDasharray="7 4"/>
        <T x={x + 146} y={y + 72} align="middle">{label}</T>
      </g>;
    })}
  </>}</Drawing>;
}
const listOps = ['count', 'add', 'remove', 'item', 'createIterator'], iteratorOps = ['first', 'isDone', 'currentItem'];
function IteratorDiagram({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={q5DiagramAlt['q5-iterator']} width={605} height={430}>{({ arrow, triangle }) => <>
    <ClassBox x={32} y={15} width={175} name="List" operations={listOps} abstract isInterface/>
    <ClassBox x={390} y={15} width={175} name="Iterator" operations={iteratorOps} abstract isInterface/>
    <ClassBox x={32} y={232} width={175} name="BaseList" attributes={['elements', 'size']} operations={listOps}/>
    <ClassBox x={390} y={272} width={175} name="BaseIterator" attributes={['currentPosition', 'list']} operations={iteratorOps}/>
    <path d="M119 232V193M477 272V153" strokeDasharray="6 4" markerEnd={triangle} data-uml-realization=""/>
    <path d="M207 305H390" strokeDasharray="6 4" markerEnd={arrow} data-uml-creation=""/><T x={298} y={296} align="middle">≪create≫</T>
    <path d="M207 338H374M374 338l8 -5l8 5l-8 5Z" data-uml-aggregation=""/>
  </>}</Drawing>;
}

function Grid({ width, height, edges, path, x, y, arrow }: {
  width: number; height: number; edges: readonly Point[]; path?: readonly Point[];
  x: number; y: number; arrow: string;
}) {
  const step = 33, px = (i: number) => x + step * i, py = (i: number) => y - step * i;
  return <g data-edit-graph="">
    {Array.from({ length: width + 1 }, (_, i) =>
      <path key={'x' + i} d={`M${px(i)} ${py(0)}V${py(height)}`}/>)}
    {Array.from({ length: height + 1 }, (_, i) =>
      <path key={'y' + i} d={`M${px(0)} ${py(i)}H${px(width)}`}/>)}
    <path d={`M${px(width) + 4} ${py(0)}h21`} strokeDasharray="3 3" markerEnd={arrow}/>
    <path d={`M${px(0)} ${py(height) - 4}v-22`} strokeDasharray="3 3" markerEnd={arrow}/>
    {edges.map(([i, j]) => <path key={i + ',' + j} data-edge-x={i} data-edge-y={j}
      d={`M${px(i)} ${py(j)}L${px(i + 1)} ${py(j + 1)}`}/>)}
    {path?.slice(1).map(([i, j], k) => <path key={k} data-shortest-path="" data-step-from={path[k].join(',')} data-step-to={i + ',' + j}
      d={`M${px(path[k][0])} ${py(path[k][1])}L${px(i)} ${py(j)}`}
      strokeWidth="2.8" markerEnd={arrow}/>)}
    {Array.from({ length: width }, (_, i) => <T key={'x' + i} x={px(i + 1)} y={py(0) + 18} align="middle">{i + 1}</T>)}
    {Array.from({ length: height }, (_, i) => <T key={'y' + i} x={px(0) - 13} y={py(i + 1) + 5} align="middle">{i + 1}</T>)}
    <circle cx={px(0)} cy={py(0)} r="3" fill="currentColor"/><circle cx={px(width)} cy={py(height)} r="3" fill="currentColor"/>
    <T x={px(0) - 37} y={py(0) + 17}>(0, 0)</T>
    <T x={px(width) + 7} y={py(height) + 4}>({width}, {height})</T>
    <T x={px(width) + 32} y={py(0) + 4}>x</T><T x={px(0) - 4} y={py(height) - 33}>y</T>
  </g>;
}

function EditOperations({ caption }: BookletFigureProps) {
  const alt = autumn2014Pm0508PageAlt[41].split('\n\n').find(p => p.startsWith('図1　文字列'))!;
  return <Drawing caption={caption} description={alt} width={631} height={167}>{() => <>
    <rect x="12" y="12" width="607" height="142"/>
    {q8Example.operations.map(([from, to, action], i) => <g key={i} data-edit-operation={i + 1} data-edit-result={to}>
      <T x={24} y={37 + 26 * i}>{from}</T><T x={111} y={37 + 26 * i}>→</T><T x={147} y={37 + 26 * i}>{to}</T>
      <T x={230} y={37 + 26 * i}>（{action}）</T><T x={542} y={37 + 26 * i}>操作{i + 1}</T>
    </g>)}
  </>}</Drawing>;
}
function EditExample({ caption }: BookletFigureProps) {
  const alt = autumn2014Pm0508PageAlt[42].split('\n\n').find(p => p.startsWith('図2　Str1'))!;
  const edges = q8Matches(q8Example.from, q8Example.to), path = q8Example.path.map(([x, y]): Point => [x, y]);
  return <Drawing caption={caption} description={alt} width={731} height={277}>{({ arrow }) => <>
    <Grid width={7} height={6} edges={edges} x={50} y={243} arrow={arrow}/>
    <Grid width={7} height={6} edges={edges} path={path} x={411} y={243} arrow={arrow}/>
  </>}</Drawing>;
}
function EditProgram({ caption }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption}><pre data-edit-program="">{q8Program}</pre></div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}
function choiceRenderer(index: number) {
  return function EditChoice({ values, caption }: BookletFigureProps) {
    const edges = q8ChoiceGraphs(values)[index];
    return <Drawing caption={caption} description={q8GraphAlt(5, 6, edges)} width={283} height={275} showCaption={false}>{({ arrow }) =>
      <Grid width={5} height={6} edges={edges} x={49} y={243} arrow={arrow}/>
    }</Drawing>;
  };
}

export const legacy2014AutumnPm0508FigureRenderers: BookletFigureRenderer[] = [
  { profile: q0508FigureProfile('q5-ui'), component: Directory },
  { profile: q0508FigureProfile('q5-analysis'), component: AnalysisDiagram },
  { profile: q0508FigureProfile('q5-legend'), component: Legend },
  { profile: q0508FigureProfile('q5-list'), component: ListDiagram },
  { profile: q0508FigureProfile('q5-traversal'), component: Traversal },
  { profile: q0508FigureProfile('q5-iterator'), component: IteratorDiagram },
  { profile: q0508FigureProfile('q8-operations'), component: EditOperations },
  { profile: q0508FigureProfile('q8-example'), component: EditExample },
  { profile: q0508FigureProfile('q8-program'), component: EditProgram },
  ...Array.from({ length: 5 }, (_, i) => ({ profile: q0508FigureProfile('q8-choice-' + i), component: choiceRenderer(i) })),
];
