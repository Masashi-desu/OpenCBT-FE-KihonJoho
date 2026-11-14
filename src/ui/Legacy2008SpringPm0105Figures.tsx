import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2008SpringPm0105Figures, listDrawing, matchSpans, profiles } from '../core/generators/legacy-2008-spring-pm-01-05-figures';
import { matchCases } from '../core/generators/legacy-2008-spring-pm-2-model';
import { backupCases } from '../core/generators/legacy-2008-spring-pm-3-model';
import { interimAFields, interimBFields, productFields, reportHeaders, saleCases, saleFields, saleFlowSteps } from '../core/generators/legacy-2008-spring-pm-5-model';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2008SpringPm0105Figures.find(item => item.profile === profile)!.alt(values);
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
function ArrowHead({ x, y, direction = 'down' }: { x: number; y: number; direction?: 'down' | 'up' | 'right' | 'left' }) {
  const angle = { down: 90, up: -90, right: 0, left: 180 }[direction];
  return <path d="M-7 -4L0 0L-7 4Z" fill="currentColor" transform={'translate(' + x + ' ' + y + ') rotate(' + angle + ')'}/>;
}

function Match(props: BookletFigureProps) {
  const index = props.values[0], { text, pattern } = matchCases[index], startX = 124, width = 24;
  const cells = (value: string, y: number) => [...value].map((character, i) =>
    <g key={i}><rect x={startX + width * i} y={y} width={width} height={31}/>
      <Label x={startX + width * i + width / 2} y={y + 20}>{character}</Label></g>);
  return <Drawing {...props} kind="match" width={startX + text.length * width + 24} height={126}>
    <Label x={114} y={49} align="end">SourceText：</Label>
    <Label x={114} y={107} align="end">Pattern：</Label>
    {[...'①②③④⑤⑥'].map((label, i) => <Label key={label} x={startX + width * i + width / 2} y={20}>{label}</Label>)}
    {cells(text, 27)}{cells(pattern, 85)}
    {matchSpans(index).map(({ start, overlaps }) => {
      const x = startX + start * width + 3, end = x + pattern.length * width - 6;
      return <g key={start} data-match-position={start + 1} data-overlaps={overlaps}>
        <path d={'M' + x + ' 52H' + end}/>{overlaps && <path d={'M' + x + ' 55H' + end}/>}
      </g>;
    })}
  </Drawing>;
}

function Backup(props: BookletFigureProps) {
  const id = useId(), { total, size } = backupCases[props.values[0]], quantity = (size / 10).toFixed(1) + 'Gバイト';
  const layers = ['土曜日', '金曜日', '木曜日', '水曜日', '火曜日', '月曜日', '共通'];
  const offsets = [31, 13, 37, 13, 20, 36, 0];
  const texture = 'url(#' + id + '-grid)';
  return <Drawing {...props} kind="backup" width={460} height={282}>
    <defs><pattern id={id + '-grid'} width={4} height={4} patternUnits="userSpaceOnUse"><path d="M0 4L4 0M-2 2L2 -2M2 6L6 2" strokeWidth={0.55}/></pattern></defs>
    <Label x={112} y={116} align="end">全体{total}Gバイト</Label>
    <path d="M123 29H115V228H123"/>
    {layers.map((label, i) => {
      const y = 25 + i * 29;
      return <g key={label} data-update-layer={label}>
        <path d={'M125 ' + y + 'q62 -11 124 0v29q-62 11 -124 0Z'}/>
        <rect x={126 + offsets[i]} y={y + 9} width={i === 6 ? 122 : 64} height={12} fill={texture}/>
        <Label x={260} y={y + 19} align="start">{label === '共通' ? '共通ファイル（' + quantity + '）' : label + 'ファイル群'}</Label>
      </g>;
    })}
    <path d="M125 25q62 11 124 0"/>
    <Label x={15} y={267} align="start">注　網掛けの部分は，更新領域（{quantity}）を表す。</Label>
  </Drawing>;
}

function ListDiagram(props: BookletFigureProps) {
  const { base, stage, first, next, strings } = listDrawing(props.values[0]);
  const positions = strings.map((_, i) => 100 + 79 * i);
  return <Drawing {...props} kind="list" width={476} height={stage === 0 ? 165 : 140}>
    {stage === 0 && <g transform="translate(17 7)">
      <Label x={27} y={14}>Listsize</Label><rect x={4} y={20} width={45} height={21}/><Label x={27} y={35}>{strings.length}</Label>
    </g>}
    <g transform={'translate(0 ' + (stage === 0 ? 55 : 18) + ')'}>
      <Label x={82} y={20} align="end" size={12}>Listの添字：</Label>
      {strings.map((value, i) => {
        const x = positions[i], target = next[i] === -1 ? null : positions[next[i] - base];
        const forward = next[i] === i + base + 1;
        return <g key={value} data-list-index={i + base} data-next={next[i]}>
          <Label x={x + 23} y={20}>{i + base}</Label><rect x={x} y={27} width={45} height={44}/>
          <path d={'M' + x + ' 49h45'}/>
          <Label x={x + 23} y={43}>{next[i]}</Label><Label x={x + 23} y={65}>{value}</Label>
          {target !== null && <>{forward ? <path d={'M' + (x + 45) + ' 38H' + target}/> : next[i] > i + base
            ? <path d={'M' + (x + 45) + ' 38h9V26H' + (target - 7) + 'V38H' + target}/>
            : <path d={'M' + (x + 45) + ' 38h12V104H' + (target - 11) + 'V38H' + target}/>}
            <ArrowHead x={target} y={38} direction="right"/>
            <circle cx={x + 45} cy={38} r={2} fill="currentColor"/></>}
        </g>;
      })}
      <Label x={48} y={60}>First</Label><rect x={26} y={65} width={45} height={22}/><Label x={48} y={81}>{first}</Label>
      <path d={'M71 76L' + positions[first - base] + ' 46'}/><ArrowHead x={positions[first - base]} y={46} direction="right"/>
    </g>
  </Drawing>;
}

function Record({ x, y, fields, keys = 0 }: { x: number; y: number; fields: string[]; keys?: number }) {
  const width = 86;
  return <g>
    <rect x={x} y={y} width={fields.length * width} height={29}/>
    {fields.map((field, i) => <g key={field}>
      {i > 0 && <path d={'M' + (x + i * width) + ' ' + y + 'v29'}/>}
      <text x={x + (i + 0.5) * width} y={y + 20} fill="currentColor" stroke="none" textAnchor="middle" fontSize={13}
        textDecoration={i < keys ? 'underline' : undefined}>{field}</text>
    </g>)}
  </g>;
}
function SaleRecord(props: BookletFigureProps) {
  return <Drawing {...props} kind="saleRecord" width={565} height={67}>
    <Record x={20} y={6} fields={saleFields(props.values[0])} keys={2}/>
    <Label x={20} y={56} align="start">注　下線はキー項目を表す。</Label>
  </Drawing>;
}
function ProductRecord(props: BookletFigureProps) {
  return <Drawing {...props} kind="productRecord" width={390} height={67}>
    <Record x={20} y={6} fields={productFields} keys={1}/>
    <Label x={20} y={56} align="start">注　下線はキー項目を表す。</Label>
  </Drawing>;
}
function InterimRecords(props: BookletFigureProps) {
  return <Drawing {...props} kind="interimRecords" width={390} height={125}>
    <Label x={20} y={19} align="start">中間ファイルA</Label>
    <Record x={20} y={25} fields={interimAFields}/>
    <Label x={20} y={80} align="start">中間ファイルB</Label>
    <Record x={20} y={86} fields={interimBFields}/>
  </Drawing>;
}
function SaleReport(props: BookletFigureProps) {
  const index = props.values[0], { date, from, to, group, rows } = saleCases[index];
  const columns = [52, 137, 255, 361, 454];
  return <Drawing {...props} kind="saleReport" width={520} height={220}>
    <path d="M13 12H507V199C351 171 193 225 13 199Z"/>
    <Label x={492} y={33} align="end">{date}</Label>
    <Label x={244} y={49} size={16}>販売構成一覧</Label>
    <Label x={492} y={72} align="end">集計期間　{from}〜{to}</Label>
    <Label x={492} y={93} align="end">集計種別　{group}</Label>
    {[reportHeaders(index), ...rows, columns.map(() => '⋮')].map((row, i) => row.map((value, j) =>
      <Label key={i + '-' + j} x={columns[j]} y={116 + i * 18} size={13}>{value}</Label>))}
  </Drawing>;
}

type FlowKind = 'task' | 'entry' | 'file' | 'value' | 'terminal';
function FlowBox({ x, y, width, label, kind = 'task' }: { x: number; y: number; width: number; label: string; kind?: FlowKind }) {
  const height = 28;
  const sticker = kind === 'file' ? 'M8 0H' + width + 'q-7 14 0 28H8q-15 -14 0 -28Z'
    : kind === 'value' ? 'M14 0H' + width + 'l-14 28H0Z'
    : kind === 'entry' ? 'M0 10L' + width + ' 0v28H0Z' : null;
  return <g transform={'translate(' + x + ' ' + y + ')'}>
    {sticker ? <path d={sticker}/> : <rect x={0} y={0} width={width} height={height} rx={kind === 'terminal' ? 14 : 0}/>}
    <Label x={width / 2} y={19} size={13}>{label}</Label>
  </g>;
}
function SaleFlow(props: BookletFigureProps) {
  const kinds: FlowKind[] = ['terminal', 'entry', 'value', 'task', 'value', 'task', 'task', 'file', 'task', 'file',
    'task', 'task', 'file', 'task', 'task', 'file', 'task', 'task', 'terminal'];
  const middle = 266, slotWidth = 164, left = middle - slotWidth / 2;
  const first = 12, step = 42;
  return <Drawing {...props} kind="saleFlow" width={576} height={first + step * 19}>
    <rect x={26} y={first + step * 4 - 7} width={438} height={step * 6} rx={14} strokeDasharray="4 3"/>
    <path d="M541 285H467"/><ArrowHead x={467} y={285} direction="left"/><Label x={552} y={291}>α</Label>
    {saleFlowSteps.map((label, i) => {
      const y = first + i * step;
      return <g key={label}>
        {i > 0 && <path d={'M' + middle + ' ' + (y - step + 28) + 'V' + y}/>}
        <FlowBox x={left} y={y} width={slotWidth} label={label} kind={kinds[i]}/>
      </g>;
    })}
    {[
      [3, '販売ファイル', 'file'], [6, '商品ファイル', 'file'], [8, '利用者指定値', 'value'],
      [16, '中間ファイルD', 'file'], [17, '利用者指定値', 'value'],
    ].map(([row, label, kind]) => {
      const y = first + Number(row) * step;
      return <g key={row}><FlowBox x={32} y={y} width={118} label={String(label)} kind={kind as FlowKind}/>
        <path d={'M150 ' + (y + 14) + 'H' + left}/></g>;
    })}
    <FlowBox x={32} y={first + 12 * step} width={118} label="中間ファイルD" kind="file"/>
    <path d={'M' + left + ' ' + (first + 11 * step + 28) + 'L' + 92 + ' ' + (first + 12 * step)}/>
    {[[5, '商品コードの昇順'], [10, '［a］の昇順'], [13, '［b］の降順']].map(([row, label]) => {
      const y = first + Number(row) * step + 14;
      return <g key={row}><path d={'M348 ' + y + 'h17v-13m0 13v13'}/>
        <Label x={376} y={y + 5} align="start" size={13}>{label}に並べ替える。</Label></g>;
    })}
  </Drawing>;
}
function SaleExtension(props: BookletFigureProps) {
  const mid = 249;
  return <Drawing {...props} kind="saleExtension" width={576} height={365}>
    <FlowBox x={169} y={15} width={160} label="抽出した販売データ" kind="value"/>
    <FlowBox x={17} y={56} width={141} label="利用者指定値" kind="value"/>
    <path d="M150 70H249M249 43V83"/>
    <path d="M249 83L317 110L249 137L181 110Z"/><rect x={219} y={99} width={60} height={21}/>
    <Label x={mid} y={115} size={13}>d</Label>
    <path d="M317 110H478V178M249 137V155"/>
    <Label x={344} y={103} size={13}>Yes</Label><Label x={263} y={151} align="start" size={13}>No</Label>
    <FlowBox x={172} y={155} width={154} label="整列1"/>
    <FlowBox x={172} y={195} width={154} label="商品ファイルとの突合せ"/>
    <FlowBox x={31} y={195} width={119} label="商品ファイル" kind="file"/>
    <FlowBox x={172} y={235} width={154} label="中間ファイルA" kind="file"/>
    <FlowBox x={172} y={275} width={154} label="集計項目の選択"/>
    <FlowBox x={17} y={275} width={141} label="利用者指定値" kind="value"/>
    <FlowBox x={407} y={178} width={142} label="［c］"/>
    <path d="M249 183v12m0 28v12m0 28v12M150 209h22M153 289h19M249 303v28M478 206V319H249"/>
    <FlowBox x={172} y={331} width={154} label="中間ファイルB" kind="file"/>
  </Drawing>;
}
const components = {
  match: Match, backup: Backup, list: ListDiagram, saleRecord: SaleRecord, productRecord: ProductRecord,
  saleReport: SaleReport, interimRecords: InterimRecords, saleFlow: SaleFlow, saleExtension: SaleExtension,
};
export const legacy2008SpringPm0105FigureRenderers: readonly BookletFigureRenderer[] = (Object.keys(profiles) as Kind[])
  .map(kind => ({ profile: profiles[kind], component: components[kind] }));
