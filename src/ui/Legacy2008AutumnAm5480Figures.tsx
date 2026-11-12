import React, { useId, type ReactNode } from 'react';
import {
  customerData, customerDataFigure, fifoFigure, fifoTransactions, firewallFigure, firewallServices,
  invoiceChoiceFigures, invoiceInput, invoiceInputFigure, invoiceRelations,
} from '../core/generators/legacy-2008-autumn-am-54-80-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function Frame({ profile, caption, description, children, quietCaption = false }: {
  profile: string;
  caption: string;
  description?: string;
  children: ReactNode;
  quietCaption?: boolean;
}) {
  return <figure className="managed-diagram source-figure" style={{ maxWidth: '100%', minWidth: 0, position: 'relative' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} data-figure-profile={profile}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'} aria-description={description}
      style={{ maxWidth: '100%', overflowX: 'auto' }}>
      {children}
    </div>
    <figcaption className={quietCaption ? 'sr-only' : undefined}>{caption}</figcaption>
  </figure>;
}

const tableStyle = {
  width: 'max-content',
  borderCollapse: 'collapse',
  color: 'var(--diagram-ink)',
  fontSize: 'calc(16px * var(--image-scale, 1))',
  textAlign: 'center',
} as const;
const cellStyle = { border: '1px solid currentColor', padding: '0.18em 0.45em', whiteSpace: 'nowrap', position: 'relative' } as const;

function RelationRow({ columns, primaryKey, description }: { columns: string[]; primaryKey: string[]; description: string }) {
  return <table aria-label={description} style={{ ...tableStyle, marginBlock: '0.45em' }}>
    <tbody><tr>{columns.map(column => <td style={cellStyle} key={column}>
      {primaryKey.includes(column) ? <><u>{column}</u><span className="sr-only">（主キーの項目）</span></> : column}
    </td>)}</tr></tbody>
  </table>;
}

function InvoiceInput({ values, caption }: BookletFigureProps) {
  const { header, repeated } = invoiceInput(values[0]);
  return <Frame profile={invoiceInputFigure.profile} caption={caption} description={invoiceInputFigure.alt(values)}>
    <div style={{ width: 'max-content', color: 'var(--diagram-ink)', fontSize: 'calc(16px * var(--image-scale, 1))' }}>
      <table aria-label="伝票の基本項目と繰返し" style={tableStyle}>
        <tbody>
          <tr>
            {header.columns.map(column => <td style={cellStyle} key={column}>
              {header.key.includes(column) ? <><u>{column}</u><span className="sr-only">（主キーの項目）</span></> : column}
            </td>)}
            {['#1', '#2', '#3', '…', '#n'].map(label => <td key={label} style={cellStyle}>{label}</td>)}
          </tr>
          <tr aria-hidden="true"><td colSpan={5} /><td colSpan={5} style={{ textAlign: 'center' }}>
            <svg viewBox="0 0 250 22" width="100%" height="1.38em" preserveAspectRatio="none" style={{ display: 'block' }}>
              <path d="M1 1q24 28 49 0q25 28 50 0q25 28 50 0q25 28 50 0q25 28 49 0" stroke="currentColor" fill="none" />
            </svg>繰返し
          </td></tr>
        </tbody>
      </table>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35em' }}>
        <span aria-hidden="true">#1〜#n：</span>
        <RelationRow columns={repeated} primaryKey={[]} description="#1から#nまでの各繰返し明細" />
      </div>
    </div>
  </Frame>;
}

function RelationChoices({ values, caption, position }: BookletFigureProps & { position: number }) {
  const relations = invoiceRelations(values[0])[position];
  const figure = invoiceChoiceFigures[position];
  return <Frame profile={figure.profile} caption={caption} description={figure.alt(values)} quietCaption>
    {relations.map(({ columns, key }, index) => <RelationRow key={index} columns={columns} primaryKey={key} description={'関係' + (index + 1)} />)}
  </Frame>;
}

function CustomerData({ values, caption }: BookletFigureProps) {
  return <Frame profile={customerDataFigure.profile} caption={caption} description={customerDataFigure.alt(values)} quietCaption>
    {customerData(values[0]).map(({ title, columns }) => <table key={title} style={{ ...tableStyle, marginBlockEnd: '0.9em' }}>
      <caption style={{ textAlign: 'start' }}>{title}</caption>
      <thead><tr>{columns.map(column => <th key={column} scope="col" style={{ ...cellStyle, fontWeight: 'normal' }}>{column}</th>)}</tr></thead>
    </table>)}
  </Frame>;
}

function Firewall({ values, caption }: BookletFigureProps) {
  const id = useId();
  return <Frame profile={firewallFigure.profile} caption={caption} quietCaption>
    <svg viewBox="0 0 420 207" role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
      style={{ display: 'block', width: 'calc(420px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
      <title id={id + '-title'}>{caption}</title>
      <desc id={id + '-description'}>{firewallFigure.alt(values)}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.25">
        <ellipse cx="104" cy="26" rx="76" ry="19" />
        <rect x="29" y="66" width="151" height="34" />
        <rect x="216" y="16" width="197" height="92" strokeDasharray="3 2" />
        <rect x="224" y="34" width="103" height="31" />
        <rect x="334" y="34" width="72" height="31" />
        <rect x="6" y="127" width="196" height="70" strokeDasharray="3 2" />
        <rect x="40" y="151" width="33" height="25" />
        <rect x="134" y="151" width="33" height="25" />
        <path d="M104 45V66M180 83H397M275 65V83M370 65V83M104 100V136M19 136H189M57 136V151M150 136V151" />
      </g>
      <g aria-hidden="true" fill="currentColor" fontSize="14" textAnchor="middle">
        <text x="104" y="31">インターネット</text>
        <text x="104" y="88">ファイアウォール</text>
        <text x="275.5" y="54" fontSize="12">{firewallServices[values[0]].server}</text>
        <text x="370" y="54" fontSize="12">DNSサーバ</text>
        <text x="386" y="101">DMZ</text>
        <text x="56.5" y="169">PC</text><text x="104" y="169">…</text><text x="150.5" y="169">PC</text>
        <text x="104" y="192">企業内ネットワーク</text>
      </g>
    </svg>
  </Frame>;
}

function Inventory({ values, caption }: BookletFigureProps) {
  return <Frame profile={fifoFigure.profile} caption={caption} description={fifoFigure.alt(values)} quietCaption>
    <table style={tableStyle} aria-label={caption}>
      <thead><tr>{['日付', '商品Aの取引内容', '個数（個）', '単価（円）'].map(column =>
        <th scope="col" style={cellStyle} key={column}>{column}</th>)}</tr></thead>
      <tbody>{fifoTransactions(values[0]).map(({ day, type, quantity, price }) => <tr key={day}>
        <td style={cellStyle}>{day}</td><td style={cellStyle}>{type}</td><td style={cellStyle}>{quantity}</td>
        <td style={cellStyle}>{price === undefined ? <>
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M0 100 100 0" fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke" />
          </svg><span className="sr-only">斜線（該当なし）</span>
        </> : price}</td>
      </tr>)}</tbody>
    </table>
  </Frame>;
}

export const legacy2008AutumnAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: invoiceInputFigure.profile, component: InvoiceInput },
  ...invoiceChoiceFigures.map(({ profile }, position) => ({
    profile, component: (props: BookletFigureProps) => <RelationChoices {...props} position={position} />,
  })),
  { profile: customerDataFigure.profile, component: CustomerData },
  { profile: firewallFigure.profile, component: Firewall },
  { profile: fifoFigure.profile, component: Inventory },
];
