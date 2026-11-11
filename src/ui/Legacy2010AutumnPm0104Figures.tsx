import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2010AutumnPm0104Figures, profiles } from '../core/generators/legacy-2010-autumn-pm-01-04-figures';
import { crcCase, digits, divideBits, normalizedTables, rawDatabaseRows, thermometerCase } from '../core/generators/legacy-2010-autumn-pm-01-04-models';

type Kind = keyof typeof profiles;
type CanvasProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: (arrow: string) => ReactNode };
function Canvas({ kind, values, caption, width, height, children }: CanvasProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2010AutumnPm0104Figures.find(figure => figure.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0}
    aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
      aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
      style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
      <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
      <defs><marker id={id + '-arrow'} viewBox="0 0 12 12" refX={10} refY={6} markerUnits="userSpaceOnUse"
        markerWidth={12} markerHeight={12} orient="auto-start-reverse">
        <path d="M1 1L10 6L1 11" fill="none" stroke="currentColor" strokeWidth={1.5}/></marker></defs>
      <g fill="none" stroke="currentColor" strokeWidth={1.4} fontSize={15} aria-hidden="true">{children('url(#' + id + '-arrow)')}</g>
    </svg>
  </div><figcaption>{caption}</figcaption></figure>;
}
function Text({ x, y, align = 'middle', children }: { x: number; y: number; align?: 'start' | 'end' | 'middle'; children: ReactNode }) {
  return <text x={x} y={y} textAnchor={align} fill="currentColor" stroke="none">{children}</text>;
}
function Box({ x, y, width = 130, label, height = 45 }: { x: number; y: number; width?: number; label: string; height?: number }) {
  return <><rect x={x} y={y} width={width} height={height} fill="var(--diagram-surface)"/>
    {label.split('\n').map((line, i, lines) => <Text key={i} x={x + width / 2} y={y + height / 2 + (i - (lines.length - 1) / 2) * 21 + 5}>{line}</Text>)}</>;
}
const outlines = [
  '20,8 60,8 68,15 60,22 20,22 12,15',
  '62,25 69,18 76,25 76,59 69,66 62,59',
  '62,75 69,68 76,75 76,109 69,116 62,109',
  '20,112 60,112 68,119 60,126 20,126 12,119',
  '4,75 11,68 18,75 18,109 11,116 4,109',
  '4,25 11,18 18,25 18,59 11,66 4,59',
  '20,60 60,60 68,67 60,74 20,74 12,67',
];
function Digit({ x, y, digit }: { x: number; y: number; digit: number }) {
  return <g transform={'translate(' + x + ' ' + y + ')'} data-digit={digit}>
    {outlines.map((points, i) => <polygon key={i} data-segment={'abcdefg'[i]} data-on={digits[digit].includes('abcdefg'[i])}
      points={points} fill={digits[digit].includes('abcdefg'[i]) ? 'currentColor' : 'var(--diagram-surface)'}/>)}
    <circle cx={88} cy={120} r={6} fill="var(--diagram-surface)"/>
  </g>;
}
function wireRoutes(y: number) {
  return [
    'V' + (y - 13) + 'H700V' + (y + 46),
    'V' + (y - 2) + 'H770V' + (y + 80) + 'H736',
    'V' + (y + 9) + 'H783V' + (y + 130) + 'H736',
    'V' + (y + 183) + 'H700V' + (y + 164),
    'V' + (y + 130) + 'H664',
    'V' + (y + 80) + 'H664',
    'V' + (y + 105) + 'H672',
    'V' + (y + 224) + 'H748V' + (y + 164),
  ];
}
function Thermometer(props: BookletFigureProps) {
  const { demo, interval } = thermometerCase(props.values[0]);
  return <Canvas {...props} kind="thermometer" width={930} height={665}>{arrow => <>
    <path d="M220 40V585M150 70H220M150 170H220M150 500H220M220 325H300" strokeWidth={2.5}/>
    <Box x={20} y={48} label="CPU"/><Box x={20} y={130} height={80} label={'タイマ\n（' + interval + '秒間隔で\n割り込む）'}/>
    <Box x={20} y={355} label="温度検出器"/><Box x={20} y={478} label="A/D変換器"/>
    <path d="M85 400V475" markerEnd={arrow}/><Text x={220} y={615}>バス</Text>
    <rect x={300} y={45} width={110} height={560} fill="var(--diagram-surface)"/><Text x={355} y={30}>出力ポート</Text>
    {[0, 1].map(group => { const y = group ? 355 : 85, offset = group ? 0 : 8; return <g key={group}>
      {wireRoutes(y).map((route, i) => { const rowY = y + i * 29, elbowX = 450 + i * 19;
        return <g key={i}><Text x={380} y={rowY + 5} align="end">{7 - i + offset}</Text>
          <path data-output-bit={7 - i + offset} d={'M410 ' + rowY + 'H' + elbowX + route}/>
        </g>; })}
      <Digit x={660} y={y + 38} digit={Number(demo[group])}/>
      <Text x={790} y={y + 86} align="start">{group ? '下位' : '上位'}けたの</Text>
      <Text x={790} y={y + 109} align="start">7セグメントLED</Text>
    </g>; })}
    <Text x={670} y={605} align="start">凡例</Text><rect x={680} y={620} width={24} height={8} fill="var(--diagram-surface)"/>
    <circle cx={722} cy={624} r={4}/><Text x={739} y={630} align="start">消灯</Text>
    <rect x={680} y={644} width={24} height={8} fill="currentColor"/><circle cx={722} cy={648} r={4} fill="currentColor"/>
    <Text x={739} y={654} align="start">点灯</Text>
  </>}</Canvas>;
}
function DigitOnly(props: BookletFigureProps) {
  return <Canvas {...props} kind="digit" width={200} height={175}>{() => <Digit x={45} y={15} digit={thermometerCase(props.values[0]).digit}/>}</Canvas>;
}
function Interrupt(props: BookletFigureProps) {
  return <Canvas {...props} kind="interrupt" width={650} height={605}>{arrow => <>
    <rect x={220} y={10} width={160} height={40} rx={20}/><Text x={300} y={36}>開始</Text>
    <Box x={220} y={75} width={160} label="GR ← 1"/><Box x={220} y={145} width={160} label="［a］"/>
    <Box x={220} y={215} width={160} label="［b］"/>
    <path d="M300 285L395 335L300 385L205 335Z"/><Text x={300} y={341}>GR ＝ 0</Text>
    <Box x={220} y={410} width={160} label={'INPUT ' + thermometerCase(props.values[0]).ports[2]}/>
    <Box x={220} y={480} width={160} label="CALL DISPLAY"/>
    <rect x={220} y={550} width={160} height={40} rx={20}/><Text x={300} y={576}>終了</Text>
    {[[50, 75], [120, 145], [190, 215], [260, 285], [385, 410], [455, 480], [525, 550]].map(([from, to]) =>
      <path key={from} d={'M300 ' + from + 'V' + to} markerEnd={arrow}/>)}
    <path d="M205 335H115V237H218" markerEnd={arrow}/><Text x={160} y={323}>Yes</Text>
    <Text x={324} y={403}>No</Text>
    {[['A/D変換開始', 173], ['A/D変換中？', 341], ['変換データ読込み', 438], ['LED表示', 508]].map(([text, y]) =>
      <Text key={text} x={420} y={Number(y)} align="start">{text}</Text>)}
  </>}</Canvas>;
}
function Register(props: BookletFigureProps & { kind: 'bcd' | 'shapeWord' }) {
  const labels = props.kind === 'bcd' ? ['0000', '上位けたBCD', '0000', '下位けたBCD'] : ['上位けたの形状データ', '下位けたの形状データ'];
  const size = 720 / labels.length;
  return <Canvas {...props} width={800} height={110}>{() => <>
    {labels.map((label, i) => <Box key={label + i} x={45 + i * size} y={38} width={size} height={45} label={label}/>)}
  </>}</Canvas>;
}
function Relation({ x, y, columns, keys }: { x: number; y: number; columns: string[]; keys: number }) {
  const widths = columns.map(column => Math.max(90, column.length * 17 + 24));
  let offset = x;
  return <>{columns.map((column, i) => { const start = offset, width = widths[i]; offset += width;
    return <g key={column}><Box x={start} y={y} width={width} height={40} label={column}/>
      {i < keys && <path d={'M' + (start + 9) + ' ' + (y + 33) + 'H' + (start + width - 9)}/>}</g>; })}</>;
}
function Database(props: BookletFigureProps) {
  return <Canvas {...props} kind="database" width={1020} height={245}>{() => <>
    <Relation x={30} y={20} columns={rawDatabaseRows[0]} keys={1}/>
    <path d="M740 40C915 75 20 70 20 100Q20 112 70 120"/>
    <Relation x={70} y={120} columns={rawDatabaseRows[1]} keys={0}/>
    <path d="M703 164V174H829V164M766 174V185"/>
    <Text x={766} y={210}>繰返し項目</Text>
  </>}</Canvas>;
}
function Normalization(props: BookletFigureProps) {
  const positions = [[25, 45], [25, 145], [345, 145], [570, 145], [25, 255]];
  return <Canvas {...props} kind="normalization" width={1050} height={320}>{() => <>
    {normalizedTables.map(({ title, columns, keys }, i) => <g key={title}>
      <Text x={positions[i][0]} y={positions[i][1] - 12} align="start">{title}</Text>
      <Relation x={positions[i][0]} y={positions[i][1]} columns={columns} keys={keys}/>
    </g>)}
  </>}</Canvas>;
}
function Bits({ text, x, y, start = 0 }: { text: string; x: number; y: number; start?: number }) {
  return <>{[...text].map((bit, i) => <Box key={i} x={x + (i + start) * 28 + (i + start >= 8 ? 12 : 0)} y={y} width={28} height={30} label={bit}/>)}</>;
}
function Crc(props: BookletFigureProps) {
  const { demo, mask } = crcCase(props.values[0]), { rows } = divideBits(demo + '00', mask);
  const width = 850, cellX = 290;
  return <Canvas {...props} kind="crc" width={width} height={570}>{arrow => <>
    <Text x={402} y={24}>符号計算対象のビット列</Text><path d="M290 44V35H514V44"/>
    <Text x={595} y={38} align="start">右端に2ビットの0を付加</Text>
    {rows.map((row, i) => <g key={i}>
      <Bits text={row.value} x={cellX} y={55 + i * 120}/>
      {i < rows.length - 1 && <>
        <Bits text={mask} x={cellX} start={rows[i + 1].position} y={102 + i * 120}/>
        <Text x={cellX + (rows[i + 1].position + 3) * 28 + 12} y={124 + i * 120} align="start">← マスク</Text>
        <path d={'M275 ' + (69 + i * 120) + 'H253V' + (189 + i * 120) + 'H287'} markerEnd={arrow}/>
        <Text x={150} y={125 + i * 120}>XORを取る</Text>
      </>}
    </g>)}
    <path d={'M235 16L' + (cellX + rows[1].position * 28 + 14) + ' 52'} markerEnd={arrow}/>
    <Text x={212} y={17} align="end">最も左にある1の位置p</Text>
    <path d="M290 462V478H514V462M514 478V492"/><Text x={402} y={517}>すべて0になるまで繰り返す。</Text>
    <path d="M526 462V477H582V462M554 477V498"/><Text x={570} y={523} align="start">符号</Text>
  </>}</Canvas>;
}
function AuthenticationNetwork(props: BookletFigureProps) {
  return <Canvas {...props} kind="authenticationNetwork" width={930} height={300}>{() => <>
    <rect x={260} y={20} width={440} height={185}/><Text x={480} y={44}>認証サイト</Text>
    <Box x={280} y={70} width={115} height={55} label={'認証\nサーバA'}/>
    <Box x={417} y={70} width={125} height={55} label={'鍵データ\nベースD'}/>
    <Box x={565} y={70} width={120} height={55} label={'チケット発行\nサーバT'}/>
    <path d="M338 125V170H625V125M479 125V170M480 170V225M220 40V265M740 40V265M220 225H740" strokeWidth={2}/>
    {[0, 1, 2].map((i) => <g key={i}>
      <Box x={60} y={35 + i * 90} width={120} height={45} label={['C₁', 'C₂', 'Cₘ'][i]}/>
      <path d={'M180 ' + (57 + i * 90) + 'H220M740 ' + (57 + i * 90) + 'H780'}/>
      <Box x={780} y={35 + i * 90} width={120} height={45} label={['S₁', 'S₂', 'Sₙ'][i]}/>
    </g>)}
    <Text x={120} y={208}>⋮</Text><Text x={840} y={208}>⋮</Text>
    <Text x={120} y={290}>クライアント群</Text><Text x={840} y={290}>APサーバ群</Text>
  </>}</Canvas>;
}
function AuthenticationFlow(props: BookletFigureProps) {
  return <Canvas {...props} kind="authenticationFlow" width={940} height={460}>{arrow => <>
    <rect x={180} y={20} width={650} height={135}/><Text x={500} y={45}>認証サイト</Text>
    <Box x={200} y={70} width={135} height={60} label={'認証\nサーバA'}/>
    <Box x={440} y={70} width={135} height={60} label={'鍵データ\nベースD'}/>
    <Box x={680} y={70} width={135} height={60} label={'チケット発行\nサーバT'}/>
    <path d="M335 86H440M680 86H575"/><path d="M440 112H335" markerEnd={arrow}/><path d="M575 112H680" markerEnd={arrow}/>
    <Text x={388} y={72}>通信R</Text><Text x={627} y={72}>通信R</Text>
    <Box x={105} y={325} width={155} height={65} label={'クライアント\nC'}/>
    <Box x={755} y={325} width={140} height={65} label={'APサーバ\nS'}/>
    <Text x={43} y={355}>利用者</Text>
    <circle cx={85} cy={341} r={6}/><path d="M85 347V365M77 353H93M85 365L77 376M85 365L93 376"/>
    <path d="M125 325L235 132" markerEnd={arrow}/><Text x={125} y={230}>通信①</Text>
    <path d="M262 132L155 325" markerEnd={arrow}/><Text x={259} y={259}>通信②</Text>
    <path d="M260 345H717V132" markerEnd={arrow}/><Text x={665} y={228}>通信③</Text>
    <path d="M744 132V371H262" markerEnd={arrow}/><Text x={802} y={260}>通信④</Text>
    <path d="M185 391V433H825V392" markerEnd={arrow}/><Text x={490} y={421}>通信⑤</Text>
  </>}</Canvas>;
}
export const legacy2010AutumnPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.thermometer, component: Thermometer }, { profile: profiles.digit, component: DigitOnly },
  { profile: profiles.interrupt, component: Interrupt },
  { profile: profiles.bcd, component: props => <Register {...props} kind="bcd"/> },
  { profile: profiles.shapeWord, component: props => <Register {...props} kind="shapeWord"/> },
  { profile: profiles.database, component: Database }, { profile: profiles.normalization, component: Normalization },
  { profile: profiles.crc, component: Crc }, { profile: profiles.authenticationNetwork, component: AuthenticationNetwork },
  { profile: profiles.authenticationFlow, component: AuthenticationFlow },
];
