import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { addresses, cacheRows, gateKinds, legacy2011AutumnAm0126Figures, profiles2011AutumnAm0126 as profiles,
  rotationCopies, routeCases, stackCases, taskEdges, taskStates } from '../core/generators/legacy-2011-autumn-am-01-26-figures';

type DiagramProps = BookletFigureProps & { profile: string };
const alt = ({ profile, values }: DiagramProps) => legacy2011AutumnAm0126Figures.find(figure => figure.profile === profile)!.alt(values);

function Canvas({ profile, width, height, caption, values, children }: DiagramProps & {
  width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId(), arrowId = id + '-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt({ profile, caption, values })}</desc>
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX={9} refY={5} markerUnits="userSpaceOnUse"
            markerWidth={11} markerHeight={11} orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.25}/>
          </marker>
        </defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.55} fontSize={15}>
          {children('url(#' + arrowId + ')')}
        </g>
      </svg>
    </div>
  </figure>;
}

function Label({ x, y, children, left = false }: { x: number; y: number; children: ReactNode; left?: boolean }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={left ? 'start' : 'middle'}>{children}</text>;
}

function FixedPoint(props: BookletFigureProps) {
  return <Canvas {...props} profile={profiles.fixedPoint} width={482} height={135}>{arrow => <>
    {Array.from({ length: 8 }, (_, index) => {
      const x = 20 + 54 * index;
      return <g key={index} data-point-bit={7 - index}>
        <rect x={x} y={39} width={54} height={42}/>
        <Label x={x + 27} y={29}>{7 - index}</Label>
      </g>;
    })}
    <path d="M236 110V82" markerEnd={arrow} data-point-between="4-3"/>
    <Label x={236} y={128}>小数点位置</Label>
  </>}</Canvas>;
}

function Stacks(props: BookletFigureProps) {
  const { top } = stackCases[props.values[0]];
  return <Canvas {...props} profile={profiles.stacks} width={490} height={241}>{() => <>
    {[60, 307].map((x, stack) => <g key={stack} data-stack={stack + 1}>
      <path d={'M' + x + ' 20V198H' + (x + 115) + 'V20'}/>
      {Array.from({ length: 4 }, (_, index) => {
        const y = 51 + 37 * index;
        return <g key={index} data-stack-value={stack ? undefined : top[index]}>
          <path d={'M' + x + ' ' + y + 'h115'} strokeDasharray={stack ? '2 2' : undefined}/>
          {stack === 0 && <Label x={x + 57.5} y={y + 25}>{top[index]}</Label>}
        </g>;
      })}
      <Label x={x + 57.5} y={224}>スタック{stack + 1}</Label>
    </g>)}
  </>}</Canvas>;
}

function Rotation(props: BookletFigureProps) {
  const copies = rotationCopies(props.values[0]), firstLoop = 104 + 21 * (copies.length - 1);
  return <Canvas {...props} profile={profiles.rotation} width={638} height={firstLoop + 212}>{() => <>
    <path d={'M181 21V' + (firstLoop + 186)}/>
    <g fill="var(--diagram-surface)">
      <rect x={25} y={14} width={312} height={36} rx={18}/>
      <rect x={25} y={61} width={312} height={32 + 21 * (copies.length - 1)}/>
      <path d={'M25 ' + (firstLoop + 11) + 'l11 -11h290l11 11v44H25z'}/>
      <rect x={25} y={firstLoop + 66} width={312} height={43}/>
      <rect x={139} y={firstLoop + 72} width={84} height={29}/>
      <path d={'M25 ' + (firstLoop + 120) + 'h312v32l-11 11H36l-11-11z'}/>
      <rect x={25} y={firstLoop + 174} width={312} height={36} rx={18}/>
    </g>
    <Label x={181} y={37}>開始</Label>
    {copies.map((copy, index) => <g key={copy} data-copy-index={index}><Label x={181} y={82 + 21 * index}>{copy}</Label></g>)}
    <Label x={181} y={firstLoop + 21}>ループ</Label>
    <g data-loop-initial="n-1" data-loop-step="-1" data-loop-end="0">
      <Label x={181} y={firstLoop + 42}>i：n−1，−1，0</Label>
    </g>
    <Label x={181} y={firstLoop + 92}>a</Label>
    <Label x={181} y={firstLoop + 146}>ループ</Label>
    <Label x={181} y={firstLoop + 197}>終了</Label>
    <Label x={351} y={firstLoop + 17} left>（注）ループにおける条件は，</Label>
    <Label x={395} y={firstLoop + 39} left>変数名：初期値，増分，終値</Label>
    <Label x={395} y={firstLoop + 61} left>を示す。</Label>
  </>}</Canvas>;
}

function Addressing(props: BookletFigureProps) {
  const { mode, operand, effective, register } = addresses[props.values[0]];
  const first = mode === 'indirect' ? 111 : 0, second = 184;
  return <Canvas {...props} profile={profiles.addressing} width={624} height={258}>{arrow => <>
    <rect x={20} y={45} width={260} height={33}/>
    <path d="M150 45v33"/>
    <Label x={85} y={35}>命令部</Label><Label x={215} y={35}>アドレス部</Label>
    <g data-address-operand={operand}><Label x={212} y={67}>{operand}</Label></g>
    <circle cx={246} cy={62} r={2.7} fill="currentColor"/>
    <path d="M490 45H598V224Q571 237 544 225Q517 213 490 224Z"/>
    <Label x={544} y={35}>主記憶</Label><Label x={459} y={35}>アドレス</Label>
    <Label x={544} y={74}>⋮</Label><Label x={544} y={211}>⋮</Label>
    {mode === 'indirect' ? <>
      <path d={'M490 ' + (first - 17) + 'h108M490 ' + (first + 15) + 'h108'}/>
      <path d={'M246 62V77Q246 ' + first + ' 285 ' + first + 'H437'} markerEnd={arrow}/>
      <Label x={465} y={first + 5}>{operand}</Label>
      <g data-memory-pointer={effective}><Label x={544} y={first + 5}>{effective}</Label></g>
      <circle cx={564} cy={first} r={2.7} fill="currentColor"/>
      <path d={'M564 ' + first + 'q0 18 -23 18H366q-35 0 -35 29t36 26H437'} markerEnd={arrow}/>
      <Label x={544} y={157}>⋮</Label>
    </> : register ? <>
      <rect x={20} y={119} width={260} height={35}/><Label x={150} y={111}>{register}</Label>
      <g data-address-register={register} data-register-value={effective - operand}>
        <Label x={213} y={142}>{effective - operand}</Label>
      </g>
      <circle cx={246} cy={136} r={2.7} fill="currentColor"/>
      <path d="M246 62H317L351 91" markerEnd={arrow}/>
      <path d="M246 136H316L351 111" markerEnd={arrow}/>
      <circle cx={364} cy={102} r={15}/><Label x={364} y={108}>＋</Label>
      <path d={'M379 102H397Q420 102 420 127V162Q420 ' + second + ' 437 ' + second + 'H446'} markerEnd={arrow}/>
    </> : <path d={'M246 62V110Q246 ' + second + ' 305 ' + second + 'H437'} markerEnd={arrow}/>}
    <path d={'M490 ' + (second - 17) + 'h108M490 ' + (second + 15) + 'h108'}/>
    <g data-effective-address={effective}>
      <Label x={465} y={second + 5}>{effective}</Label><Label x={544} y={second + 5}>データ</Label>
    </g>
  </>}</Canvas>;
}

function CacheTable(props: BookletFigureProps) {
  const profile = profiles.cache;
  return <figure className="managed-diagram source-figure" data-source-figure={profile} role="group"
    aria-label={props.caption} aria-description={alt({ ...props, profile })}>
    <div className="table-scroll" tabIndex={0} aria-label={props.caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <table aria-label={props.caption} style={{ minWidth: 'max-content', fontSize: 'calc(15px * var(--image-scale, 1))' }}>
        <thead>
          <tr><th rowSpan={2} aria-label="構成"/><th colSpan={3} scope="colgroup">キャッシュメモリ</th><th scope="colgroup">主記憶</th></tr>
          <tr><th scope="col">有無</th><th scope="col">アクセス時間（ナノ秒）</th><th scope="col">ヒット率（％）</th><th scope="col">アクセス時間（ナノ秒）</th></tr>
        </thead>
        <tbody>{cacheRows(props.values[0]).map(([name, ...cells]) =>
          <tr key={name} data-cache-config={name}><th scope="row">{name}</th>{cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>
        )}</tbody>
      </table>
    </div>
  </figure>;
}

function Routes(props: BookletFigureProps) {
  const { origin, via, dest } = routeCases[props.values[0]];
  return <Canvas {...props} profile={profiles.routes} width={570} height={167}>{() => <>
    <path d="M112 118H456" data-route={origin + '-' + dest}/>
    <path d="M111 104L251 53" strokeDasharray="6 5" data-route={via + '-' + dest}/>
    <path d="M319 53L458 104" strokeDasharray="6 5" data-route={origin + '-' + via}/>
    {[[dest, 65, 118], [via, 285, 43], [origin, 505, 118]].map(([text, x, y]) =>
      <g key={text} data-site={text}>
        <ellipse cx={x} cy={y} rx={49} ry={24} fill="var(--diagram-surface)"/>
        <Label x={Number(x)} y={Number(y) + 6}>{text}</Label>
      </g>)}
  </>}</Canvas>;
}

const transitionPaths = ['M11 121H69', 'M202 101L249 66', 'M274 67L224 104', 'M342 66L392 105', 'M378 121H237', 'M382 43H440'];
function TaskStates(props: BookletFigureProps) {
  const locations = [[151, 121], [295, 43], [462, 121]] as const;
  return <Canvas {...props} profile={profiles.task} width={570} height={170}>{arrow => <>
    {taskEdges.map(([from, to], index) =>
      <path key={index} d={transitionPaths[index]} markerEnd={arrow} data-state-transition={from + '-' + to}/>)}
    {locations.map(([x, y], index) => <g key={x}>
      <ellipse cx={x} cy={y} rx={index === 2 ? 80 : 82} ry={21} fill="var(--diagram-surface)"/>
      <Label x={x} y={y + 5}>{taskStates[index + 1]}</Label>
    </g>)}
  </>}</Canvas>;
}

function Gate(props: BookletFigureProps) {
  const kind = gateKinds[props.values[0]], and = kind === 'and' || kind === 'nand', inverted = kind === 'nand' || kind === 'nor';
  const output = and ? 102 : 109;
  return <Canvas {...props} profile={profiles.gate} width={188} height={92}>{() => <>
    <g data-gate={kind}>
      <path d={'M34 34H' + (and ? 55 : 60) + 'M34 58H' + (and ? 55 : 60)}/>
      <path d={and ? 'M55 24H80A22 22 0 0 1 80 68H55Z' : 'M52 24Q88 20 109 46Q88 72 52 68Q69 46 52 24Z'}/>
      {inverted && <circle cx={output + 5} cy={46} r={5} data-output-inverted="true"/>}
      <path d={'M' + (output + (inverted ? 10 : 0)) + ' 46H155'}/>
      <Label x={21} y={39}>A</Label><Label x={21} y={63}>B</Label><Label x={168} y={51}>X</Label>
    </g>
  </>}</Canvas>;
}

export const legacy2011AutumnAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.fixedPoint, component: FixedPoint }, { profile: profiles.stacks, component: Stacks },
  { profile: profiles.rotation, component: Rotation }, { profile: profiles.addressing, component: Addressing },
  { profile: profiles.cache, component: CacheTable }, { profile: profiles.routes, component: Routes },
  { profile: profiles.task, component: TaskStates }, { profile: profiles.gate, component: Gate },
];
