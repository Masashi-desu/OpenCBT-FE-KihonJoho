import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  addressCases, circuitCases, flowCases, hashCases, legacy2013SpringAm0126Figures, logicChoices,
  postfixFrames, spring2013Am0126Profiles as profiles, treeCases, treeEdges, umlCases, type LogicGate,
} from '../core/generators/legacy-2013-spring-am-01-26-figures';

function Figure({ profile, caption, values, width, height, children }: BookletFigureProps & {
  profile: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId(), definition = legacy2013SpringAm0126Figures.find(item => item.profile === profile)!;
  const alternative = definition.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        data-source-figure={profile} style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alternative}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={8} markerHeight={8} orient="auto">
          <path d="M1 1L8 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.4}/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} fontSize={14}>
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
  </figure>;
}

function Text({ x, y, start, children }: { x: number; y: number; start?: boolean; children: ReactNode }) {
  return <text x={x} y={y} textAnchor={start ? 'start' : 'middle'} fill="currentColor" stroke="none">{children}</text>;
}

const treeLocations: Record<number, readonly [number, number]> = {
  1:[30,176], 2:[93,126], 3:[145,176], 4:[144,76], 5:[195,126], 6:[219,26],
  7:[246,126], 8:[294,76], 9:[275,226], 10:[306,176], 11:[338,226], 12:[352,126],
  13:[376,226], 14:[408,176], 15:[440,226],
};
function Tree(props: BookletFigureProps) {
  const { target } = treeCases[props.values[0]];
  return <Figure {...props} profile={profiles.tree} width={470} height={250}>{() => <>
    {treeEdges.map(([from,to]) => <line key={to} x1={treeLocations[from][0]} y1={treeLocations[from][1]}
      x2={treeLocations[to][0]} y2={treeLocations[to][1]} data-tree-edge={from + '-' + to}/>)}
    {Object.entries(treeLocations).map(([value,[x,y]]) => <g key={value} data-tree-node={value} data-tree-target={Number(value) === target}>
      <circle cx={x} cy={y} r={14} strokeWidth={Number(value) === target ? 3 : 1.5} fill="var(--diagram-surface)"/>
      <Text x={x} y={y + 5}>{value}</Text>
    </g>)}
  </>}</Figure>;
}

function Postfix(props: BookletFigureProps) {
  const frames = postfixFrames(props.values[0]), bottom = frames[0].length * 23 + 28;
  const stackWidth = frames[0].length > 5 ? 105 : 88, stride = stackWidth + 34;
  return <Figure {...props} profile={profiles.postfix} width={frames.length * stride + 12} height={bottom + 12}>{arrow => <>
    {frames.map((stack, frame) => {
      const x = 9 + frame * stride;
      return <g key={frame} data-stack-frame={stack.join(',')}>
        <path d={'M' + x + ' 12V' + bottom + 'h' + stackWidth + 'V12'}/>
        {stack.map((item, level) => {
          const y = bottom - (level + 1) * 23;
          return <g key={level}><path d={'M' + x + ' ' + y + 'h' + stackWidth}/><Text x={x + stackWidth / 2} y={y + 17}>{item}</Text></g>;
        })}
        {frame + 1 < frames.length && <path d={'M' + (x + stackWidth + 6) + ' ' + (bottom - 31) + 'h21'} markerEnd={arrow}/>}
      </g>;
    })}
  </>}</Figure>;
}

function HashArray(props: BookletFigureProps) {
  const divisor = hashCases[props.values[0]][1];
  const positions = [0, 1, 2, '⋮', divisor - 2, divisor - 1];
  const heights = [24, 24, 24, 39, 24, 24];
  let y = 28;
  return <Figure {...props} profile={profiles.hash} width={190} height={200}>{() => <>
    <Text x={41} y={19}>位置</Text><Text x={119} y={19}>配列</Text>
    {positions.map((position, i) => {
      const height = heights[i], top = y;
      y += height;
      return <g key={position} data-array-position={position}>
        <rect x={65} y={top} width={108} height={height}/>
        <Text x={41} y={top + height / 2 + 5}>{position}</Text>
        {position === '⋮' && <Text x={119} y={top + height / 2 + 5}>⋮</Text>}
      </g>;
    })}
  </>}</Figure>;
}

function DivisionFlow(props: BookletFigureProps) {
  const { dividend, divisor, quotient, remainder } = flowCases[props.values[0]];
  return <Figure {...props} profile={profiles.flow} width={420} height={283}>{arrow => <>
    <rect x={115} y={10} width={130} height={29} rx={14}/><Text x={180} y={30}>開始</Text>
    <path d="M180 39V64"/>
    <rect x={115} y={64} width={130} height={49}/>
    <Text x={180} y={84}>{quotient + ' ← 0'}</Text><Text x={180} y={104}>{remainder + ' ← ' + dividend}</Text>
    <path d="M180 113V145"/>
    <path d="M115 168L180 145L245 168L180 191Z"/>
    <Text x={180} y={173}>{remainder + ' ＜ ' + divisor}</Text>
    <path d="M245 168H339V214"/><Text x={268} y={161}>Yes</Text>
    <rect x={278} y={214} width={122} height={29} rx={14}/><Text x={339} y={234}>終了</Text>
    <path d="M180 191V213"/><Text x={197} y={207}>No</Text>
    <rect x={115} y={213} width={130} height={49}/>
    <Text x={180} y={233}>{remainder + ' ← ' + remainder + ' − ' + divisor}</Text>
    <Text x={180} y={253}>{quotient + ' ← ' + quotient + ' ＋ 1'}</Text>
    <path d="M180 262V273H73V132H180" markerEnd={arrow}/>
  </>}</Figure>;
}

function Addressing(props: BookletFigureProps) {
  const model = addressCases[props.values[0]], { address, target, kind } = model;
  return <Figure {...props} profile={profiles.address} width={530} height={244}>{arrow => <>
    <Text x={62} y={29}>命令部</Text><Text x={162} y={29}>アドレス部</Text>
    <rect x={12} y={36} width={100} height={28}/><rect x={112} y={36} width={100} height={28}/>
    <Text x={161} y={55}>{address}</Text>
    <circle cx={181} cy={50} r={2.5} fill="currentColor"/>
    <Text x={375} y={38}>アドレス</Text><Text x={465} y={23}>主記憶</Text>
    <path d="M413 30H517V225Q489 237 465 225Q441 213 413 225Z"/>
    <path d="M413 77H517M413 103H517M413 151H517M413 177H517"/>
    <Text x={465} y={59}>⋮</Text><Text x={465} y={131}>⋮</Text><Text x={465} y={207}>⋮</Text>
    {kind === 'indirect' && <>
      <Text x={395} y={95}>{address}</Text><Text x={465} y={95}>{target}</Text>
      <circle cx={488} cy={89} r={2.5} fill="currentColor"/>
      <path d="M181 50Q181 89 231 89H371" markerEnd={arrow}/>
      <path d="M488 89Q488 121 452 121H285Q259 121 259 144Q259 164 285 164H371" markerEnd={arrow}/>
    </>}
    {kind === 'direct' && <path d="M181 50V119Q181 164 224 164H371" markerEnd={arrow}/>}
    {'register' in model && <>
      <Text x={113} y={111}>{model.register}</Text><rect x={30} y={118} width={167} height={30}/>
      <Text x={113} y={138}>{target - address}</Text>
      <path d="M181 50H271V144" markerEnd={arrow}/><path d="M197 134H223V164H252" markerEnd={arrow}/>
      <circle cx={271} cy={164} r={18}/><Text x={271} y={169}>＋</Text>
      <path d="M289 164H371" markerEnd={arrow}/>
    </>}
    <Text x={395} y={169}>{target}</Text><Text x={465} y={169}>データ</Text>
  </>}</Figure>;
}

function Cache(props: BookletFigureProps) {
  return <Figure {...props} profile={profiles.cache} width={290} height={145}>{() => <>
    <rect x={12} y={12} width={120} height={121}/><Text x={36} y={33}>CPU</Text>
    <rect x={27} y={39} width={105} height={72}/>
    <Text x={79} y={58}>キャッシュ</Text><Text x={79} y={78}>メモリ</Text><Text x={79} y={99}>256kバイト</Text>
    <path d="M132 73H158"/><rect x={158} y={12} width={120} height={121}/>
    <Text x={218} y={57}>主記憶</Text><Text x={218} y={98}>256Mバイト</Text>
  </>}</Figure>;
}

function Gate({ x, y, kind }: { x: number; y: number; kind: LogicGate }) {
  const andShape = kind === 'AND' || kind === 'NAND', inverted = kind === 'NAND' || kind === 'NOR';
  return <g transform={'translate(' + x + ' ' + y + ')'} data-gate-kind={kind}>
    <path d={andShape ? 'M0 -16H22A23 16 0 0 1 22 16H0Z' : 'M0 -16Q28 -19 45 0Q28 19 0 16Q9 0 0 -16Z'}
      fill="var(--diagram-surface)"/>
    {!andShape && <path d="M-9 -8H4M-9 8H4"/>}
    {kind === 'XOR' && <path d="M-7 -17Q2 0 -7 17"/>}
    {inverted && <circle cx={49} cy={0} r={4} fill="var(--diagram-surface)"/>}
  </g>;
}
const outputX = (x: number, kind: LogicGate) => x + (kind === 'NAND' || kind === 'NOR' ? 53 : 45);

function Circuit(props: BookletFigureProps) {
  const [first, upper, lower, last] = circuitCases[props.values[0]];
  return <Figure {...props} profile={profiles.circuit} width={413} height={159}>{() => <>
    <Text x={23} y={72}>A</Text><Text x={23} y={88}>B</Text><Text x={387} y={80}>Y</Text>
    <path d="M32 67H85M32 83H85M64 67V26H172M64 83V124H172"/>
    <path d={'M' + outputX(85, first) + ' 75H151V42H172M151 75V108H172'}/>
    <path d={'M' + outputX(172, upper) + ' 34H247V67H278M' + outputX(172, lower) + ' 116H247V83H278'}/>
    <path d={'M' + outputX(278, last) + ' 75H373'}/>
    <circle cx={64} cy={67} r={2.5} fill="currentColor"/><circle cx={64} cy={83} r={2.5} fill="currentColor"/>
    <circle cx={151} cy={75} r={2.5} fill="currentColor"/>
    <Gate x={85} y={75} kind={first}/><Gate x={172} y={34} kind={upper}/>
    <Gate x={172} y={116} kind={lower}/><Gate x={278} y={75} kind={last}/>
  </>}</Figure>;
}

function GateChoice(props: BookletFigureProps) {
  const kind = logicChoices[props.values[0]];
  return <Figure {...props} profile={profiles.gate} width={127} height={65}>{() => <>
    <Text x={17} y={29}>A</Text><Text x={17} y={45}>B</Text><Text x={111} y={37}>Y</Text>
    <path d="M25 24H42M25 40H42"/>
    <Gate x={42} y={32} kind={kind}/><path d={'M' + outputX(42, kind) + ' 32H100'}/>
  </>}</Figure>;
}

function Uml(props: BookletFigureProps) {
  const { participation, department, key } = umlCases[props.values[0]];
  const firstLine = key.length > 21 ? 'プロジェクト・社員・プロジェクト' : key;
  const secondLine = key.slice(firstLine.length);
  return <Figure {...props} profile={profiles.uml} width={606} height={277}>{() => <>
    <rect x={194} y={15} width={126} height={44}/><Text x={257} y={34}>プロジェクト内</Text><Text x={257} y={51}>役割分担</Text>
    <rect x={199} y={126} width={116} height={46}/><Text x={257} y={145}>プロジェクト</Text><Text x={257} y={163}>参画</Text>
    <rect x={15} y={131} width={113} height={36}/><Text x={72} y={154}>プロジェクト</Text>
    <rect x={211} y={230} width={92} height={36}/><Text x={257} y={253}>社員</Text>
    <rect x={439} y={230} width={100} height={36}/><Text x={489} y={253}>部門</Text>
    <path d="M257 59V126M128 149H199M257 172V230M303 248H439"/>
    <Text x={245} y={77}>1</Text><Text x={238} y={121}>0..*</Text>
    <Text x={138} y={168}>1</Text><Text x={178} y={168}>0..*</Text>
    <Text x={282} y={190}>{participation}</Text><Text x={273} y={225}>1</Text>
    <Text x={325} y={266}>1..*</Text><Text x={416} y={266}>{department}</Text><Text x={372} y={242}>所属する▶</Text>
    <path d="M315 126L341 71" strokeDasharray="4 3"/>
    <path d="M341 26H582L596 38V101H341Z M582 26V38H596"/>
    <Text x={350} y={48} start>制約：</Text><Text x={350} y={69} start>{firstLine}</Text>
    {secondLine && <Text x={350} y={89} start>{secondLine}</Text>}
  </>}</Figure>;
}

export const legacy2013SpringAm0126FigureRenderers: BookletFigureRenderer[] = [
  { profile: profiles.tree, component: Tree },
  { profile: profiles.postfix, component: Postfix },
  { profile: profiles.hash, component: HashArray },
  { profile: profiles.flow, component: DivisionFlow },
  { profile: profiles.address, component: Addressing },
  { profile: profiles.cache, component: Cache },
  { profile: profiles.circuit, component: Circuit },
  { profile: profiles.gate, component: GateChoice },
  { profile: profiles.uml, component: Uml },
];
