import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { bitSegments, legacy2011SpecialPm0104Figures, originalLockTimes, profiles, routeUpdateRows,
  transactionLockRows, transactionUpdateRows } from '../core/generators/legacy-2011-special-pm-01-04-figures';
import { routingCase } from '../core/generators/legacy-2011-special-pm-01-04-models';

type Profile = typeof profiles[keyof typeof profiles];
type CanvasProps = BookletFigureProps & {
  profile: Profile;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
};

function Canvas({ values, caption, profile, width, height, children }: CanvasProps) {
  const id = useId();
  const alt = legacy2011SpecialPm0104Figures.find(figure => figure.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 12 12" refX={10} refY={6} markerUnits="userSpaceOnUse"
          markerWidth={12} markerHeight={12} orient="auto-start-reverse">
          <path d="M1 1L10 6L1 11" fill="none" stroke="currentColor" strokeWidth={1.5}/>
        </marker></defs>
        <g fill="none" stroke="currentColor" strokeWidth={1.45} fontSize={15} aria-hidden="true">
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
  </figure>;
}

function Text({ x, y, align = 'middle', children }: { x: number; y: number; align?: 'start' | 'middle' | 'end'; children: ReactNode }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={align}>{children}</text>;
}

function Instruction(props: BookletFigureProps) {
  const unit = 39, offset = 78, width = unit * 16;
  const locate = (bit: number) => offset + (15 - bit) * unit;
  return <Canvas {...props} profile={profiles.instruction} width={830} height={167}>{() => <>
    <Text x={12} y={29} align="start">1語目</Text>
    <Text x={12} y={112} align="start">2語目</Text>
    <Text x={713} y={31} align="start">（ビット番号）</Text>
    <Text x={713} y={114} align="start">（ビット番号）</Text>
    {[15, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(bit =>
      <Text key={bit} x={locate(bit) + unit / 2} y={32}>{bit}</Text>)}
    {bitSegments.map(({ label, first, last }) => {
      const x = locate(first), w = (first - last + 1) * unit;
      return <g key={first} data-first-bit={first} data-last-bit={last}>
        <rect x={x} y={39} width={w} height={49}/>
        {first === 3 ? <>
          <Text x={x + unit / 2} y={59}>0</Text><Text x={x + unit * 1.5} y={59}>0</Text>
          <Text x={x + w / 2} y={78}>未使用領域</Text>
        </> : <Text x={x + w / 2} y={69}>{label}</Text>}
      </g>;
    })}
    <Text x={locate(15) + unit / 2} y={114}>15</Text>
    <Text x={locate(0) + unit / 2} y={114}>0</Text>
    <rect x={offset} y={121} width={width} height={34}/><Text x={offset + width / 2} y={144}>adr</Text>
  </>}</Canvas>;
}

function Process({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={10} fill="var(--diagram-surface)"/>;
}

function Queue({ x, y, names = [15, 128, 160], ellipsis = true }: { x: number; y: number; names?: number[]; ellipsis?: boolean }) {
  return <g>
    <rect x={x} y={y - 20} width={180} height={40}/>
    {names.map(n => <Process key={n} x={x + n} y={y}/>)}
    {ellipsis && <Text x={x + 77} y={y + 5}>…</Text>}
  </g>;
}

function SchedulingQueues(props: BookletFigureProps) {
  const [kind] = props.values;
  if (kind === 2) return <Canvas {...props} profile={profiles.queues} width={565} height={273}>{arrow => <>
    <Process x={39} y={117}/><Text x={39} y={94}>到着</Text><Text x={92} y={106}>登録</Text>
    <path d="M49 117H144M144 117V46H165M144 117H165M144 117V196H165" markerEnd={arrow}/>
    <Text x={255} y={19}>待ち行列</Text>
    {[46, 117, 196].map((y, i) => <g key={y}>
      <Queue x={165} y={y} names={i === 0 ? [15, 128, 160] : i === 1 ? [128, 160] : [160]} ellipsis={i === 0}/>
      <Text x={255} y={y + 37}>（優先度{[10, 9, 1][i]}）</Text>
      <path d={'M345 ' + y + 'H365'} markerEnd={arrow}/>
    </g>)}
    <Text x={255} y={166}>⋮</Text>
    <path d="M365 46V196M365 117H446" markerEnd={arrow}/>
    <Text x={402} y={107}>取出し</Text><Process x={456} y={117}/><Text x={456} y={94}>実行</Text>
    <path d="M466 117H530" markerEnd={arrow}/><Text x={548} y={122}>終了</Text>
    <path d="M456 127V249H88V117" markerEnd={arrow}/><Text x={270} y={267}>中断</Text>
  </>}</Canvas>;
  return <Canvas {...props} profile={profiles.queues} width={540} height={kind ? 145 : 105}>{arrow => <>
    <Process x={36} y={49}/><Text x={36} y={25}>到着</Text><Text x={89} y={40}>登録</Text>
    <path d="M46 49H143" markerEnd={arrow}/>
    <Queue x={143} y={49}/><Text x={233} y={22}>待ち行列</Text><Text x={233} y={88}>（実行可能状態）</Text>
    <path d="M323 49H397" markerEnd={arrow}/><Text x={356} y={40}>取出し</Text>
    <Process x={407} y={49}/><Text x={407} y={25}>実行</Text><Text x={407} y={82}>（実行状態）</Text>
    <path d="M417 49H490" markerEnd={arrow}/><Text x={511} y={54}>終了</Text>
    {kind === 1 && <><path d="M407 59V113H88V49" markerEnd={arrow}/><Text x={245} y={135}>中断</Text></>}
  </>}</Canvas>;
}

function TransactionSteps(props: BookletFigureProps) {
  return <Canvas {...props} profile={profiles.updateSteps} width={710} height={165}>{() => <>
    {transactionUpdateRows(props.values[0]).map((rows, i) => {
      const x = 7 + i * 350;
      return <g key={i} data-transaction={'T' + (i + 1)}>
        <Text x={x + 169} y={21}>トランザクション T{i + 1} の処理順序</Text>
        <rect x={x} y={30} width={338} height={118}/>
        {rows.map((line, lineIndex) => <Text key={line} x={x + 8} y={53 + 24 * lineIndex} align="start">{line}</Text>)}
      </g>;
    })}
  </>}</Canvas>;
}

function LockTimeline(props: BookletFigureProps) {
  const left = 58, scale = 8;
  return <Canvas {...props} profile={profiles.lockTimeline} width={570} height={205}>{arrow => <>
    <Text x={536} y={22}>時間</Text>
    {originalLockTimes.map(([begin, request], i) => {
      const y = 44 + 46 * i, x = left + begin * scale;
      return <g key={i} data-lock-transaction={'T' + (i + 3)} data-request={request}>
        <Text x={x - 16} y={y + 5} align="end">T{i + 3}</Text>
        <path d={'M' + x + ' ' + y + 'H545'} markerEnd={arrow}/>
        <circle cx={x} cy={y} r={5.5} fill="currentColor"/>
        <circle cx={left + request * scale} cy={y} r={5.5} fill="var(--diagram-surface)"/>
      </g>;
    })}
  </>}</Canvas>;
}

function LockSteps(props: BookletFigureProps) {
  const rows = transactionLockRows(props.values[0]);
  return <Canvas {...props} profile={profiles.lockSteps} width={670} height={390}>{arrow => <>
    <rect x={8} y={8} width={644} height={373}/>
    {rows.map((row, i) => {
      const y = 31 + 28 * i;
      return 'step' in row ?
        <g key={i} data-transaction-step={row.step}><Text x={20} y={y + 5} align="start">{row.step}</Text></g> :
        <g key={i} data-insertion-position={row.position}><path d={'M535 ' + y + 'H246'} markerEnd={arrow} strokeWidth={3}/>
          <Text x={560} y={y + 6}>{row.position}</Text></g>;
    })}
  </>}</Canvas>;
}

function Networks(props: BookletFigureProps) {
  const { subnet, ip } = routingCase(props.values[0]), xs = [90, 298, 505, 718], ys = [171, 218, 110];
  return <Canvas {...props} profile={profiles.networks} width={825} height={309}>{arrow => <>
    {xs.map((x, i) => <g key={x} data-subnet={subnet(i)}>
      <Text x={x} y={24}>ネットワーク{'ABCD'[i]}</Text><Text x={x} y={44}>{subnet(i)}</Text>
      <path d={'M' + x + ' 59V263'} strokeWidth={3}/><path d={'M' + (x - 9) + ' 60h18M' + (x - 9) + ' 262h18'} strokeWidth={6}/>
    </g>)}
    {ys.map((y, i) => {
      const x = (xs[i] + xs[i + 1]) / 2;
      return <g key={y} data-network-router={i + 1} data-ip-left={ip(i, i)} data-ip-right={ip(i, i + 1)}>
        <path d={'M' + xs[i] + ' ' + y + 'H' + xs[i + 1]}/>
        <rect x={x - 19} y={y - 9} width={38} height={18} fill="var(--diagram-surface)"/>
        <Text x={x} y={y - 15}>ルータ{i + 1}</Text>
        <Text x={x - 25} y={y + 20} align="end">{ip(i, i)}</Text>
        <Text x={x + 25} y={y + 20} align="start">{ip(i, i + 1)}</Text>
      </g>;
    })}
    <Text x={104} y={87} align="start">ルータ1のネットワーク</Text><Text x={104} y={106} align="start">B側のIPアドレス</Text>
    <path d="M219 113L249 163" markerEnd={arrow}/>
    <Text x={100} y={223} align="start">ルータ1のネットワーク</Text><Text x={100} y={243} align="start">A側のIPアドレス</Text>
    <path d="M174 208L156 191" markerEnd={arrow}/>
    <Text x={12} y={292} align="start">注　{subnet(0)}は，ネットワークアドレス{subnet(0).slice(0, -3)}とサブネットマスク255.255.255.0を表す。</Text>
  </>}</Canvas>;
}

function RouteTable({ x, y, rows, compare = false, mark = false }: {
  x: number; y: number; rows: string[][]; compare?: boolean; mark?: boolean;
}) {
  const widths = [164, 146, 51], total = widths.reduce((a, b) => a + b);
  const height = 42 + rows.length * 29;
  return <g>
    <rect x={x} y={y} width={total} height={height}/>
    <path d={'M' + (x + widths[0]) + ' ' + y + 'v' + height + 'M' + (x + widths[0] + widths[1]) + ' ' + y + 'v' + height}/>
    <Text x={x + 82} y={y + 16}>送信先ネット</Text><Text x={x + 82} y={y + 34}>ワークアドレス</Text>
    <Text x={x + 237} y={y + 16}>転送先ルータ</Text><Text x={x + 237} y={y + 34}>のIPアドレス</Text>
    {compare && <Text x={x + 335} y={y + 16}>更新</Text>}<Text x={x + 335} y={y + 34}>距離</Text>
    {rows.map((row, i) => <g key={row[0]}>
      <path d={'M' + x + ' ' + (y + 42 + 29 * i) + 'h' + total}/>
      {row.map((value, j) => <Text key={j} x={x + [82, 237, 335][j]} y={y + 62 + 29 * i}>{value}</Text>)}
    </g>)}
    {mark && <rect x={x + 161} y={y + height - 32} width={152} height={35} strokeDasharray="4 3"/>}
  </g>;
}

function RouteUpdate(props: BookletFigureProps) {
  const { start, receive, compared, reflected } = routeUpdateRows(props.values[0]);
  return <Canvas {...props} profile={profiles.routeUpdate} width={885} height={762}>{arrow => <>
    <Text x={253} y={25}>ルータ1のテーブル</Text>
    <Text x={10} y={55} align="start">起動</Text><Text x={10} y={74} align="start">直後</Text>
    <RouteTable x={65} y={38} rows={start}/>
    <path d="M100 151V225" markerEnd={arrow}/>
    <Text x={10} y={254} align="start">更新</Text><Text x={10} y={273} align="start">処理</Text>
    <RouteTable x={65} y={235} rows={start}/>
    <rect x={65} y={335} width={361} height={26} strokeDasharray="4 3"/>
    <path d="M100 370V494" markerEnd={arrow}/>
    <Text x={10} y={520} align="start">反映</Text><Text x={10} y={539} align="start">直後</Text>
    <RouteTable x={65} y={506} rows={reflected} mark/>
    <path d="M402 657H302V637" markerEnd={arrow}/>
    <Text x={410} y={663} align="start">ルータ2のネットワークBのIPアドレス</Text>
    <rect x={514} y={38} width={102} height={26}/><Text x={565} y={56}>ルータ2</Text>
    <path d="M565 65V105" markerEnd={arrow} strokeDasharray="5 4"/><Text x={594} y={83}>（1）</Text>
    <Text x={690} y={104}>受信した経路制御情報</Text>
    <RouteTable x={514} y={117} rows={receive}/>
    <path d="M843 225V254" markerEnd={arrow}/><Text x={785} y={246}>（2）①</Text>
    <RouteTable x={514} y={264} rows={compared} compare/>
    <path d="M511 307H428" markerStart={arrow} markerEnd={arrow}/><Text x={469} y={298}>（2）②</Text>
    <path d="M511 349H428" markerEnd={arrow}/><Text x={469} y={374}>（2）③</Text>
    {[
      '（1）ルータ2はネットワークB及びCに',
      '　ブロードキャストで経路制御情報を送信する。',
      '（2）ルータ1はルータ2の経路制御情報を受信する。',
      '　① 距離に1を加え，更新距離とする。',
      '　② 送信先ネットワークアドレスが一致するものは',
      '　　更新距離と距離を比較する。この例では更新距離の',
      '　　方が大きいので，ルータ1のテーブルには反映されない。',
      '　③ 送信先ネットワークアドレスが一致するものが',
      '　　ないものは追加する。',
    ].map((line, i) => <Text key={line} x={464} y={403 + 23 * i} align="start">{line}</Text>)}
    <Text x={10} y={725} align="start">注　（1），（2）①〜③は〔テーブルの更新手順〕の（1），（2）①〜③を表す。</Text>
  </>}</Canvas>;
}

export const legacy2011SpecialPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.instruction, component: Instruction }, { profile: profiles.queues, component: SchedulingQueues },
  { profile: profiles.updateSteps, component: TransactionSteps }, { profile: profiles.lockTimeline, component: LockTimeline },
  { profile: profiles.lockSteps, component: LockSteps }, { profile: profiles.networks, component: Networks },
  { profile: profiles.routeUpdate, component: RouteUpdate },
];
