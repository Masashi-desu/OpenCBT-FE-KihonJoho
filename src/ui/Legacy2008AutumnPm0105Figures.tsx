import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { flowNote, legacy2008AutumnPm0105Figures, profiles, trainingTables, underlinedKey } from '../core/generators/legacy-2008-autumn-pm-01-05-figures';
import { exampleRows, printCases } from '../core/generators/legacy-2008-autumn-pm-2-model';
import { points, stage } from '../core/generators/legacy-2008-autumn-pm-4-model';
import { musicCases, musicFields, musicKeyCounts, musicModules, musicScreenResult, screenChoices } from '../core/generators/legacy-2008-autumn-pm-5-model';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2008AutumnPm0105Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4}>{children}</g>
      </svg>
    </div>
  </figure>;
}

function Label({ x, y, children, align = 'middle', size = 14 }: { x: number; y: number; children: ReactNode; align?: 'start' | 'middle' | 'end'; size?: number }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" fontSize={size} textAnchor={align}>{children}</text>;
}
function ArrowHead({ x, y, angle }: { x: number; y: number; angle: number }) {
  const coordinate = (offset: number) => (x - 8 * Math.cos(angle + offset)) + ' ' + (y - 8 * Math.sin(angle + offset));
  return <path d={'M' + coordinate(0.45) + 'L' + x + ' ' + y + 'L' + coordinate(-0.45)}/>;
}
function Arrow({ x1, y1, x2, y2, both = false }: { x1: number; y1: number; x2: number; y2: number; both?: boolean }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return <g><line x1={x1} x2={x2} y1={y1} y2={y2}/>
    <ArrowHead x={x2} y={y2} angle={angle}/>{both && <ArrowHead x={x1} y={y1} angle={angle + Math.PI}/>}</g>;
}
function Box({ x, y, width, height, label, size = 13 }: { x: number; y: number; width: number; height: number; label: string; size?: number }) {
  const lines = label.split('|');
  return <g><rect x={x} y={y} width={width} height={height}/>
    {lines.map((line, i) => <Label key={i} x={x + width / 2} y={y + height / 2 + 4 + (i - (lines.length - 1) / 2) * (size + 1)} size={size}>{line}</Label>)}
  </g>;
}

function Topology(props: BookletFigureProps) {
  const showRoute = props.values[0] === 1, offset = showRoute ? 8 : 62;
  return <Drawing {...props} kind="topology" width={450} height={offset + 204}>
    {!showRoute && <>
      <Label x={18} y={17} align="start">〔凡例〕</Label>
      <Label x={18} y={34} align="start">○：アクセスポイント　↔：通信経路</Label>
      <Label x={18} y={51} align="start" size={13}>w，x，y，z：拠点とその拠点に対応したアクセスポイントとの接続</Label>
    </>}
    <g transform={'translate(0 ' + offset + ')'}>
      <Box x={173} y={4} width={92} height={showRoute ? 59 : 36} label={showRoute ? '' : '本社'}/>
      {showRoute && <><Label x={219} y={22}>本社</Label><Box x={186} y={29} width={67} height={27} label="ルータ"/></>}
      <Box x={19} y={99} width={70} height={34} label="支店X"/>
      <Box x={349} y={99} width={70} height={34} label="支店Z"/>
      <Box x={184} y={164} width={70} height={34} label="支店Y"/>
      <ellipse cx={219} cy={116} rx={67} ry={23}/>
      <path d={'M219 ' + (showRoute ? 63 : 40) + 'V90M219 142V164M89 116H148M290 116H349M162 106L276 127M162 127L276 106'}/>
      {[[219, 91], [152, 116], [286, 116], [219, 140]].map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r={3}/>)}
      {[[229, 81, 'w'], [122, 130, 'x'], [229, 157, 'y'], [319, 130, 'z']].map(([x, y, label]) =>
        <Label key={label} x={Number(x)} y={Number(y)} size={12}>{label}</Label>)}
      {showRoute && <g strokeWidth={2.1}>
        <path d="M92 106Q167 103 180 75Q187 61 190 52M92 117Q176 115 188 80Q194 63 197 52M346 105Q277 105 259 75Q251 63 248 52M346 117Q270 116 251 79Q246 67 241 52M205 162Q202 111 199 81L197 52M233 162Q237 112 239 78L241 52"/>
        <ArrowHead x={92} y={106} angle={Math.PI}/><ArrowHead x={92} y={117} angle={Math.PI}/>
        <ArrowHead x={346} y={105} angle={0}/><ArrowHead x={346} y={117} angle={0}/>
        <ArrowHead x={205} y={162} angle={Math.PI / 2}/><ArrowHead x={233} y={162} angle={Math.PI / 2}/>
      </g>}
    </g>
  </Drawing>;
}

function PrintExample(props: BookletFigureProps) {
  const index = props.values[0], { margin, width } = printCases[index], rows = exampleRows(index);
  const marginLabel = index === 0 ? 'Margin' : 'Margin＝' + margin;
  const widthLabel = index === 0 ? 'MaxC' : 'MaxC＝' + width;
  const left = 135, right = index === 0 ? 604 : left + width * 10 + 6;
  return <Drawing {...props} kind="printExample" width={660} height={212}>
    <path d="M18 57H630V156Q540 137 459 157Q210 187 18 156Z"/>
    <Arrow x1={21} y1={46} x2={left - 3} y2={46} both/><Label x={76} y={38}>{marginLabel}</Label>
    <Arrow x1={left + 3} y1={46} x2={right} y2={46} both/><Label x={(left + right) / 2} y={38}>{widthLabel}</Label>
    {rows.map((row, i) => <g key={i}><text x={left} y={83 + i * 24} fill="currentColor" stroke="none"
      fontFamily="monospace" fontSize={16}>{index === 0 && i === 0 ? <>
        {row.split(' … ')[0]}<tspan x={482}>…</tspan><tspan x={583}>{row.split(' … ')[1]}</tspan>
      </> : row}</text>
      {i < 3 && <text x={i === 0 ? (index === 0 ? 609 : left + width * 10 + 6) : left + row.length * 10 + 2}
        y={83 + i * 24} fill="currentColor" stroke="none" fontSize={13}>▼</text>}</g>)}
    <Label x={515} y={18} size={13}>MaxC文字印字したことによる改行</Label>
    <path d={index === 0 ? 'M610 23V67' : 'M439 21L' + (left + width * 10 + 9) + ' 68'}/>
    <Label x={342} y={183} align="start" size={13}>文字列に含まれていた改行文字による改行</Label>
    <path d={'M340 175L' + (left + rows[1].length * 10 + 12) + ' 110M340 175L' + (left + rows[2].length * 10 + 12) + ' 132'}/>
  </Drawing>;
}

function TrainingSchema(props: BookletFigureProps) {
  return <Drawing {...props} kind="trainingSchema" width={866} height={190}>
    <rect x={9} y={6} width={848} height={150}/>
    {trainingTables.map(({ name, keys, other }, i) => <text key={name} x={23} y={29 + 27 * i}
      fill="currentColor" stroke="none" fontSize={15}>
      {name}（<tspan textDecoration="underline">{keys.join('，')}</tspan>，{other.join('，')}）
    </text>)}
    <Label x={13} y={178} align="start" size={13}>{underlinedKey}</Label>
  </Drawing>;
}

function ShortestGraph(props: BookletFigureProps) {
  const { edges, state, stageNumber } = stage(props.values[0]);
  const coordinates = [[0, 0], [56, 62], [211, 62], [366, 62], [56, 146], [211, 146], [366, 146]];
  const radius = 15;
  return <Drawing {...props} kind="shortestGraph" width={426} height={196}>
    {!state && <Label x={56} y={34}>出発地</Label>}
    {edges.map(([from, to, weight]) => {
      const [x1, y1] = coordinates[from], [x2, y2] = coordinates[to], length = Math.hypot(x2 - x1, y2 - y1);
      const dx = (x2 - x1) / length, dy = (y2 - y1) / length, margin = radius + 1;
      const bold = state?.settled.includes(to) && state.predecessor[to] === from;
      const x = (x1 + x2) / 2 + (dx === 0 ? -16 : from === 5 && to === 3 ? 12 : 0);
      const y = (y1 + y2) / 2 + (dy === 0 ? -7 : from === 4 && to === 2 ? -5 : 4);
      return <g key={from + '-' + to} data-graph-edge={from + '-' + to} strokeWidth={bold ? 2.5 : 1.4}>
        <Arrow x1={x1 + dx * margin} y1={y1 + dy * margin} x2={x2 - dx * margin} y2={y2 - dy * margin}/>
        <Label x={x} y={y} size={13}>{weight}</Label>
      </g>;
    })}
    {points.map(point => {
      const [x, y] = coordinates[point], settled = state?.settled.includes(point);
      const value = state?.distances[point];
      const distance = Number.isFinite(value) ? value : '∞';
      return <g key={point} data-graph-point={point} data-settled={Boolean(settled)}>
        <circle cx={x} cy={y} r={radius}/>
        {settled && <circle cx={x} cy={y} r={radius} fill="currentColor" opacity={0.22}/>}
        <Label x={x} y={y + 5}>{point}</Label>
        {state && point > 1 && (point === 6 && stageNumber >= 5
          ? <Box x={x - 26} y={y + 20} width={52} height={20} label="b"/>
          : <Label x={x} y={y + (point <= 3 ? -23 : 31)} size={13}>{'[' + distance + ']'}</Label>)}
      </g>;
    })}
  </Drawing>;
}

function MusicRecord(props: BookletFigureProps) {
  const index = props.values[0], fields = musicFields[index], keys = musicKeyCounts[index];
  const boxes = fields.reduce<{ field: string; x: number; width: number }[]>((all, field) => {
    const last = all.at(-1), x = last ? last.x + last.width : 9;
    return [...all, { field, x, width: field.length * 15 + 20 }];
  }, []);
  const last = boxes.at(-1)!;
  return <Drawing {...props} kind="musicRecord" width={last.x + last.width + 14} height={80}>
    {boxes.map(({ field, x, width }, i) => <g key={field} data-key-field={i < keys}>
      <rect x={x} y={9} width={width} height={32}/>
      <text x={x + width / 2} y={30} textAnchor="middle" stroke="none" fill="currentColor" fontSize={14}
        textDecoration={i < keys ? 'underline' : undefined}>{field}</text>
    </g>)}
    <Label x={10} y={61} size={13} align="start">{underlinedKey}</Label>
  </Drawing>;
}

function MusicScreen(props: BookletFigureProps) {
  const appTitle = '楽曲ダウンロードシステム';
  return <Drawing {...props} kind="musicScreen" width={760} height={450}>
    <rect x={15} y={9} width={285} height={151}/><Label x={157} y={30}>{appTitle}</Label>
    <Label x={35} y={61} align="start">会員番号　12345</Label>
    <Label x={35} y={94} align="start">パスワード　************</Label>
    <Box x={30} y={112} width={104} height={28} label="ログイン"/><Box x={182} y={112} width={104} height={28} label="終了"/>
    <Arrow x1={157} y1={166} x2={157} y2={194} both/>
    <rect x={15} y={201} width={316} height={219}/><Label x={173} y={221}>{appTitle}</Label>
    <Label x={23} y={248} align="start" size={13}>検索項目</Label>
    <Label x={120} y={248} align="start" size={13}>検索内容</Label>
    <Label x={228} y={248} align="start" size={13}>検索条件</Label>
    {screenChoices.map((field, index) => <g key={field}>
      <Label x={23} y={270 + index * 21} align="start" size={12}>{field}</Label>
      <line x1={120} y1={272 + index * 21} x2={211} y2={272 + index * 21}/>
      <Box x={229} y={257 + index * 21} width={91} height={18} label={['を含む　▾', 'と等しい ▾', '　▾', '　▾', '　▾'][index]} size={11}/>
      {index < 2 && <Label x={122} y={270 + index * 21} align="start" size={12}>{index === 0 ? '情報処理' : 'i.n.f.o'}</Label>}
    </g>)}
    <Box x={29} y={379} width={100} height={25} label="検索"/>
    <Box x={207} y={379} width={112} height={25} label="ログアウト"/>
    <Label x={173} y={440}>楽曲検索画面</Label>
    <Arrow x1={339} y1={310} x2={372} y2={310} both/>
    <rect x={381} y={201} width={354} height={219}/><Label x={558} y={221}>{appTitle}</Label>
    {['楽曲番号', '曲名', '演奏者名'].map((heading, i) => <Label key={heading} x={[395, 479, 636][i]} y={248} size={13} align="start">{heading}</Label>)}
    {musicScreenResult.map(([number, title, artist], i) => <g key={number}>
      <Label x={395} y={273 + i * 23} align="start" size={12}>{number}</Label>
      <Box x={473} y={258 + i * 23} width={142} height={20} label={title} size={12}/>
      <Label x={636} y={273 + i * 23} align="start" size={12}>{artist}</Label>
    </g>)}
    {[417, 553, 659].map(x => <Label key={x} x={x} y={348}>⋮</Label>)}
    <Box x={396} y={379} width={100} height={25} label="再検索"/>
    <Label x={558} y={440}>楽曲選択画面</Label>
  </Drawing>;
}

function MusicTree(props: BookletFigureProps) {
  const coordinates: Record<string, readonly [number, number, number, number]> = {
    all: [410, 12, 83, 29], initial: [190, 72, 82, 31], main: [410, 72, 83, 31], final: [665, 72, 88, 31],
    login: [200, 130, 134, 32], download: [387, 130, 138, 32], logout: [650, 130, 128, 32],
    credential: [12, 197, 125, 42], member: [142, 197, 106, 42], password: [253, 197, 106, 42], error: [365, 197, 100, 42],
    select: [444, 266, 127, 36], downloadMain: [651, 257, 137, 52],
    searchView: [155, 343, 123, 45], songs: [285, 343, 133, 45], selectView: [425, 343, 124, 45],
    songDownload: [558, 343, 123, 45], record: [690, 343, 161, 58],
  };
  return <Drawing {...props} kind="musicTree" width={865} height={412}>
    {musicModules.filter(module => module.parent).map(({ key, parent }) => {
      const [x, y, width] = coordinates[key], [px, py, pw, ph] = coordinates[parent];
      return <line key={key} data-module-edge={parent + '-' + key} x1={px + pw / 2} y1={py + ph} x2={x + width / 2} y2={y}/>;
    })}
    {musicModules.map(({ key, label }) => {
      const [x, y, width, height] = coordinates[key];
      return <Box key={key} x={x} y={y} width={width} height={height} label={label} size={12}/>;
    })}
  </Drawing>;
}

function MusicReport(props: BookletFigureProps) {
  const { field, date, rows } = musicCases[props.values[0]];
  return <Drawing {...props} kind="musicReport" width={436} height={225}>
    <path d="M12 9H415V206Q354 186 284 208Q153 244 12 206Z"/>
    <Label x={214} y={34}>{field + '別ダウンロード件数表'}</Label>
    <Label x={399} y={58} align="end">{date}</Label>
    <Label x={34} y={83} align="start">{field}</Label>
    <Label x={264} y={83}>ダウンロード件数</Label>
    <Label x={375} y={83}>楽曲数</Label>
    {rows.map(([name, count, songCount], i) => <g key={name} data-report-row={i}>
      <Label x={34} y={107 + 18 * i} align="start" size={13}>{name}</Label>
      <Label x={305} y={107 + 18 * i} align="end" size={13}>{count}</Label>
      <Label x={391} y={107 + 18 * i} align="end" size={13}>{songCount}</Label>
    </g>)}
    {[63, 276, 377].map(x => <Label key={x} x={x} y={211}>⋮</Label>)}
  </Drawing>;
}

function MusicFlow(props: BookletFigureProps) {
  const { field } = musicCases[props.values[0]];
  const file = (x: number, y: number, label: string) => <g>
    <path d={'M' + x + ' ' + y + 'h95q-9 15 0 30h-95q-9 -15 0 -30Z'}/>
    <Label x={x + 47} y={y + 20} size={12}>{label}</Label>
  </g>;
  return <Drawing {...props} kind="musicFlow" width={880} height={184}>
    {file(17, 36, 'ファイルX')}{file(17, 89, 'ファイルY')}{file(281, 6, '［e］')}
    <Arrow x1={113} y1={51} x2={141} y2={78}/><Arrow x1={113} y1={104} x2={141} y2={78}/>
    <Arrow x1={378} y1={22} x2={407} y2={59}/>
    {Array.from({ length: 7 }, (_, i) => <g key={i}>
      <Box x={142 + 77 * i} y={59} width={59} height={38} label={'処理' + (i + 1)} size={12}/>
      <Arrow x1={202 + 77 * i} y1={78} x2={218 + 77 * i} y2={78}/>
    </g>)}
    <Box x={681} y={47} width={152} height={60} label={field + '別|ダウンロード件数表'} size={12}/>
    <Label x={15} y={151} align="start" size={13}>{'注　' + flowNote.split('。')[0] + '。'}</Label>
    <Label x={36} y={171} align="start" size={13}>{flowNote.split('。')[1] + '。'}</Label>
  </Drawing>;
}

export const legacy2008AutumnPm0105FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.topology, component: Topology },
  { profile: profiles.printExample, component: PrintExample },
  { profile: profiles.trainingSchema, component: TrainingSchema },
  { profile: profiles.shortestGraph, component: ShortestGraph },
  { profile: profiles.musicRecord, component: MusicRecord },
  { profile: profiles.musicScreen, component: MusicScreen },
  { profile: profiles.musicTree, component: MusicTree },
  { profile: profiles.musicReport, component: MusicReport },
  { profile: profiles.musicFlow, component: MusicFlow },
];
