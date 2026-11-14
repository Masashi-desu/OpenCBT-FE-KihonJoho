import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2007AutumnPm0105Figures, profiles, type FigureKind } from '../core/generators/legacy-2007-autumn-pm-01-05-figures';
import { deliverySchemas, sqlCases } from '../core/generators/legacy-2007-autumn-pm-2-model';
import { decimalDigits, formatCases } from '../core/generators/legacy-2007-autumn-pm-4-model';
import { newSaleFlow, relatedFlowNotes, relatedSaleFlow, saleSchema } from '../core/generators/legacy-2007-autumn-pm-5-model';

type DrawingProps = BookletFigureProps & { kind: FigureKind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2007AutumnPm0105Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4}>{children}</g>
      </svg>
    </div>
  </figure>;
}
type LabelProps = { x: number; y: number; children: ReactNode; size?: number; anchor?: 'start' | 'middle'; underline?: boolean };
function Label({ x, y, children, size = 15, anchor = 'middle', underline }: LabelProps) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={anchor} fontSize={size}
    textDecoration={underline ? 'underline' : undefined}>{children}</text>;
}
function Box({ x, y, w, h, lines, rx }: { x: number; y: number; w: number; h: number; lines: readonly string[]; rx?: number }) {
  return <g><rect x={x} y={y} width={w} height={h} rx={rx}/>
    {lines.map((line, i) => <Label key={i} x={x + w / 2} y={y + h / 2 + 5 + (i - (lines.length - 1) / 2) * 17}>{line}</Label>)}
  </g>;
}
function Delivery(props: BookletFigureProps) {
  const { center, otherCenter, offices } = sqlCases[props.values[0]];
  const centers = [center, otherCenter].sort(), points = [116, 236, 356, 476, 596];
  const arrowId = useId(), marker = `url(#${arrowId})`;
  return <Drawing {...props} kind="delivery" width={680} height={382}>
    <defs>
      <marker id={arrowId} viewBox="0 0 9 9" refX={8} refY={4.5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
        <path d="M1 1L8 4.5L1 8" fill="none" stroke="currentColor"/>
      </marker>
    </defs>
    {centers.map((name, i) => <Box key={name} x={178 + 300 * i} y={18} w={115} h={55} lines={['集配センタ', name]}/>)}
    <path d="M294 45H476" markerStart={marker} markerEnd={marker}/>
    {offices.map((office, index) => {
      const x = points[index], from = index < 3 ? 236 - (1 - index) * 30 : 536 + (index - 3.5) * 55;
      return <g key={office}>
        <Box x={x - 50} y={147} w={100} h={52} lines={['支店', office]}/>
        <path d={`M${from} 74L${x} 145`} markerStart={marker} markerEnd={marker}/>
        <path d={`M${x} 201V286`} markerStart={marker} markerEnd={marker}/>
      </g>;
    })}
    <path d="M110 243H665L572 328H17ZM220 243L129 328M331 243L240 328M442 243L352 328M553 243L463 328"
      strokeDasharray="6 4"/>
    <Label x={16} y={355} anchor="start">注　破線の区画は，各支店の受けもつ管轄地区を示す。</Label>
    <Label x={340} y={376}>図1　配達品移送時の支店と集配センタの関係</Label>
  </Drawing>;
}

type Schema = { name: string; fields: readonly string[]; keys: number };
function SchemaCells({ schema, x, y, widths }: { schema: Schema; x: number; y: number; widths: readonly number[] }) {
  let left = x;
  return <g>
    <Label x={x} y={y - 9} anchor="start">{schema.name}</Label>
    {schema.fields.map((field, index) => {
      const width = widths[index], start = left;
      left += width;
      const groups = /^(受付支店|依頼元|届け先)(.+)$/.exec(field);
      const lines = groups ? [groups[1], groups[2]] : [field];
      return <g key={field}><rect x={start} y={y} width={width} height={46}/>
        {lines.map((line, i) => <Label key={i} x={start + width / 2} y={y + 28 + (i - (lines.length - 1) / 2) * 16}
          size={14} underline={index < schema.keys}>{line}</Label>)}
      </g>;
    })}
  </g>;
}
function DeliverySchema(props: BookletFigureProps) {
  return <Drawing {...props} kind="delivery-schema" width={805} height={285}>
    <SchemaCells schema={deliverySchemas[0]} x={8} y={29} widths={[100, 110]}/>
    <SchemaCells schema={deliverySchemas[1]} x={239} y={29} widths={[100, 155]}/>
    <SchemaCells schema={deliverySchemas[2]} x={8} y={113} widths={[80, 80, 84, 94, 79, 80, 94, 79, 79]}/>
    <SchemaCells schema={deliverySchemas[3]} x={8} y={196} widths={[80, 92, 99, 82]}/>
    <Label x={402} y={273}>図2　関係データベースの構造</Label>
  </Drawing>;
}
function Bathtub(props: BookletFigureProps) {
  const arrow = useId(), marker = `url(#${arrow})`;
  return <Drawing {...props} kind="bathtub" width={595} height={220}>
    <defs><marker id={arrow} viewBox="0 0 9 9" refX={8} refY={4.5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
      <path d="M1 1L8 4.5L1 8" fill="none" stroke="currentColor"/>
    </marker></defs>
    <path d="M54 160H566" markerEnd={marker}/><path d="M54 160V10" markerEnd={marker}/>
    <path d="M45 143Q50 137 55 143T66 143M45 148Q50 142 55 148T66 148"/>
    <path d="M54 46C72 116 123 134 196 134H410C448 132 499 81 540 46" strokeWidth={2}/>
    {[196,410,540].map(x => <path key={x} d={`M${x} 11V160`} strokeDasharray="5 4"/>)}
    {['M55 34H195', 'M197 34H409', 'M411 34H539'].map(path =>
      <path key={path} d={path} markerStart={marker} markerEnd={marker}/>)}
    <Label x={124} y={24}>初期故障期間</Label><Label x={302} y={24}>偶発故障期間</Label><Label x={478} y={24}>摩耗故障期間</Label>
    {[...'故障頻度'].map((text, i) => <Label key={text} x={29} y={25 + 16 * i}>{text}</Label>)}
    <Label x={473} y={180}>導入からの経過時間</Label><Label x={305} y={208}>図　バスタブ曲線</Label>
  </Drawing>;
}

function Format(props: BookletFigureProps) {
  const { base, start, examples } = formatCases[props.values[0]];
  return <Drawing {...props} kind="format" width={495} height={350}>
    <Label x={75} y={23}>Float</Label><Label x={155} y={23}>Num</Label><Label x={318} y={23}>Out[]</Label>
    {Array.from({ length: 8 }, (_, i) => <Label key={i} x={220 + 28 * i} y={43}>{i === 7 ? '…' : start + i}</Label>)}
    {examples.map(([input, digits], i) => {
      const y = 51 + i * 45, output = decimalDigits(input, base, digits);
      return <g key={i}>
        <Label x={75} y={y + 19}>{input.replace('-', '−')}</Label><Label x={155} y={y + 19}>{digits}</Label>
        <rect x={206} y={y} width={224} height={30}/>
        {Array.from({ length: 8 }, (_, j) => <g key={j}>
          {j > 0 && <path d={`M${206 + 28 * j} ${y}v30`}/>}
          <Label x={220 + 28 * j} y={y + 20}>{output[j] ?? ''}</Label>
        </g>)}
      </g>;
    })}
    <Label x={247} y={333}>図　FloatFormat の変換例</Label>
  </Drawing>;
}
function Product(props: BookletFigureProps) {
  return <Drawing {...props} kind="sale-product" width={510} height={127}>
    <SchemaCells schema={saleSchema[0]} x={12} y={28} widths={[94, 83, 106, 86, 91]}/>
    <Label x={12} y={94} anchor="start">注　下線はキー項目を表す。</Label>
    <Label x={255} y={119}>図1　商品表のレコード様式</Label>
  </Drawing>;
}
function Details(props: BookletFigureProps) {
  return <Drawing {...props} kind="sale-details" width={690} height={127}>
    <SchemaCells schema={saleSchema[1]} x={12} y={28} widths={[86, 91, 78, 91]}/>
    <SchemaCells schema={saleSchema[2]} x={392} y={28} widths={[86, 93, 87]}/>
    <Label x={12} y={94} anchor="start">注　下線はキー項目を表す。</Label>
    <Label x={345} y={119}>図2　購入表と購入明細表のレコード様式</Label>
  </Drawing>;
}

type InputShape = { step: number; labels: readonly string[]; kind?: 'data' | 'blank'; offset?: number };
function Steps({ steps, inputs, notes, caption }: {
  steps: string[][]; inputs: readonly InputShape[]; notes?: readonly (readonly string[])[]; caption: string;
}) {
  const x = 200, width = 156, row = 69;
  const heightAt = (step: number) => step === 0 || step === steps.length - 1 ? 28 : step === 1 && notes ? 55 : 43;
  return <g>
    {steps.slice(0, -1).map((_, i) => {
      const bottom = 12 + i * row + heightAt(i);
      return <path key={i} d={`M${x + width / 2} ${bottom}V${12 + (i + 1) * row}`}/>;
    })}
    {steps.map((lines, i) => {
      const y = 12 + i * row, h = heightAt(i), last = i === steps.length - 1;
      if (i === 0 || last) return <Box key={i} x={x} y={y} w={width} h={h} lines={lines} rx={14}/>;
      if (i % 2 === 0) return <Box key={i} x={x} y={y} w={width} h={h} lines={lines}/>;
      return <g key={i}>
        <path d={`M${x + 12} ${y}H${x + width}L${x + width - 12} ${y + h}H${x}Z`} fill="none" />
        {lines.map((label, j) => <Label key={label} x={x + width / 2} y={y + h / 2 + 5 + (j - (lines.length - 1) / 2) * 15}>{label}</Label>)}
      </g>;
    })}
    {inputs.map(({ step, labels, kind, offset = 0 }, i) => {
      const y = 12 + step * row + heightAt(step) / 2, top = y - 25 + offset, cx = 145, textX = 72;
      return <g key={i}>
        <path d={`M${cx - 7} ${top + 25}H170V${y}H${x}`}/>
        {kind === 'data' ? <path d={`M20 ${top}H145L130 ${top + 50}H7Z`}/> :
          <path d={`M20 ${top}H145Q131 ${top + 25} 145 ${top + 50}H20Q6 ${top + 25} 20 ${top}Z`}/>}
        {kind === 'blank' && <rect x={28} y={top + 10} width={105} height={30} strokeWidth={2.5}/>}
        {labels.map((label, j) => <Label key={label} x={textX} y={top + 30 + (j - (labels.length - 1) / 2) * 16}>{label}</Label>)}
      </g>;
    })}
    {notes?.map((lines, i) => {
      const y = 12 + (2 + 2 * i) * row, sy = y + 21, tone = lines.length * 15;
      return <g key={i}>
        <path d={`M356 ${sy}H383`} strokeDasharray="3 3"/><path d={`M396 ${sy - tone / 2}H383V${sy + tone / 2}H396`}/>
        {lines.map((line, j) => <Label key={line} x={394} y={sy + 4 + (j - (lines.length - 1) / 2) * 15} size={13} anchor="start">{line}</Label>)}
      </g>;
    })}
    <Label x={notes ? 302 : 224} y={steps.length * row - 1}>{caption}</Label>
  </g>;
}
function NewSale(props: BookletFigureProps) {
  const steps = newSaleFlow(props.values[0]);
  return <Drawing {...props} kind="sale-new" width={460} height={steps.length * 69 + 12}>
    <Steps steps={steps} caption="図3　新規登録商品の表示機能" inputs={[
      { step: 2, labels: ['購入表'], offset: -28 }, { step: 2, labels: ['購入明細表'], offset: 28 },
      { step: 4, labels: ['商品表'] }, { step: 6, labels: ['商品表'] }, { step: 8, labels: ['中間表 A'], kind: 'data' },
    ]}/>
  </Drawing>;
}
function RelatedSale(props: BookletFigureProps) {
  const steps = relatedSaleFlow(props.values[0]);
  return <Drawing {...props} kind="sale-related" width={636} height={steps.length * 69 + 12}>
    <Steps steps={steps} caption="図4　検索した商品に関連する商品の表示機能" notes={relatedFlowNotes} inputs={[
      { step: 2, labels: ['購入表'], offset: -28 }, { step: 2, labels: ['購入明細表'], offset: 28 },
      { step: 4, labels: ['購入明細表'] }, { step: 6, labels: ['検索した', '商品コード'], kind: 'data' },
      { step: 8, labels: ['商品表'] }, { step: 10, labels: ['b'], kind: 'blank', offset: -57 },
      { step: 10, labels: ['d'], kind: 'blank' }, { step: 10, labels: ['入力した', '会員 ID'], kind: 'data', offset: 57 },
    ]}/>
  </Drawing>;
}

export const legacy2007AutumnPm0105FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.delivery, component: Delivery },
  { profile: profiles['delivery-schema'], component: DeliverySchema },
  { profile: profiles.bathtub, component: Bathtub },
  { profile: profiles.format, component: Format },
  { profile: profiles['sale-product'], component: Product },
  { profile: profiles['sale-details'], component: Details },
  { profile: profiles['sale-new'], component: NewSale },
  { profile: profiles['sale-related'], component: RelatedSale },
];
