import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { canteenAlt, floatAlt, inlineAlt, optimizationAlt, profiles, transferAlt } from '../core/generators/legacy-2012-spring-pm-01-04-figures';
import { canteenTables, floatingData, optimizedPrograms, optimizerData, transferData } from '../core/generators/legacy-2012-spring-pm-01-04-models';

function Drawing({ caption, alt, profile, width, height, children }: {
  caption: string; alt: string; profile: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.25"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} fontSize={15}>
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Label({ x, y, left = false, children }: { x: number; y: number; left?: boolean; children: ReactNode }) {
  return <text x={x} y={y} textAnchor={left ? 'start' : 'middle'} fill="currentColor" stroke="none">{children}</text>;
}

function FloatBits({ caption, values }: BookletFigureProps) {
  const [index, item] = values, layout = item === 0;
  const concrete = floatingData(index).bitWords[item - 1];
  const labels = Array.from({ length: layout ? 11 : 15 }, (_, i) => 31 - i);
  const right = layout ? 586 : 648;
  const x = (i: number) => 24 + i * 32;
  return <Drawing profile={profiles.float} caption={caption} alt={floatAlt(values)} width={layout ? 690 : 658} height={layout ? 100 : 72}>{() => <>
    <rect x={8} y={25} width={right - 8} height={layout ? 65 : 34}/>
    <path d={'M40 25V' + (layout ? 90 : 59) + 'M296 25V' + (layout ? 90 : 59)}/>
    {labels.map((number, i) => <g key={number} data-float-bit={number} data-bit-value={concrete?.[i]}>
      <Label x={x(i)} y={17}>{number}</Label>
      {!layout && <Label x={x(i)} y={47}>{concrete[i]}</Label>}
    </g>)}
    <Label x={layout ? 444 : 543} y={17}>⋯</Label>
    <Label x={right - 16} y={17}>0</Label>
    {layout ? <>
      <Label x={24} y={44}>符</Label><Label x={24} y={63}>号</Label><Label x={24} y={82}>部</Label>
      <Label x={165} y={52}>指数部</Label><Label x={165} y={77}>（8ビット）</Label>
      <Label x={444} y={52}>仮数部</Label><Label x={444} y={77}>（23ビット）</Label>
      <Label x={590} y={17} left>（ビット番号）</Label>
    </> : <>
      <Label x={543} y={47}>⋯</Label>
      <g data-float-bit="0" data-bit-value={concrete[31]}><Label x={right - 16} y={47}>{concrete[31]}</Label></g>
    </>}
  </>}</Drawing>;
}

const codeDisplay = { margin: 0, textAlign: 'left', fontFamily: 'monospace', whiteSpace: 'pre',
  fontSize: 'calc(15px * var(--image-scale, 1))', lineHeight: 1.5 } as const;

function OptimizationStages({ caption }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure" data-source-figure={profiles.optimize} role="group" aria-label={caption} aria-description={optimizationAlt()}>
    <div className="table-scroll" tabIndex={0}>
      <table aria-label={caption} style={{ width: 'max-content' }}>
        <thead><tr><th scope="col">最適化の方法</th><th scope="col">プログラム1の変換</th></tr></thead>
        <tbody>{optimizedPrograms.map((program, i) => <tr key={i} data-optimizer-stage={i + 1}>
          <th scope="row">{'①②③'[i]}</th><td><pre style={codeDisplay}>{program}</pre></td>
        </tr>)}</tbody>
      </table>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function InlinePanel({ panel, index }: { panel: string; index: number }) {
  const dashed = { border: '1px dashed var(--diagram-ink)' };
  const lines = panel.split('\n');
  if (index === 0) {
    const [assignment, call] = lines[2].split('func');
    return <>{lines.slice(0, 2).join('\n') + '\n' + assignment}
      <span style={dashed}>{'func' + call}</span>{'\n' + lines[3]}</>;
  }
  if (index === 1 || index === 2) {
    return <>{lines.slice(0, 2).join('\n')}
      <span style={{ ...dashed, display: 'block', paddingInline: '0.2em' }}>{lines.slice(2, -1).join('\n')}</span>
      {lines.at(-1)}</>;
  }
  return panel;
}

function InlineSteps({ caption, values }: BookletFigureProps) {
  const { panels, func, argument } = optimizerData(values[0]);
  const box = { ...codeDisplay, border: '1px solid var(--diagram-ink)', padding: '0.55em', background: 'var(--diagram-surface)' };
  return <figure className="managed-diagram source-figure" data-source-figure={profiles.inline} role="group" aria-label={caption} aria-description={inlineAlt(values)}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <div style={{ width: 'max-content', color: 'var(--diagram-ink)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4em' }}>
          {panels.map((panel, index) => <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4em' }}>
            {index > 0 && <span aria-label={'変換' + index} style={{ paddingTop: '1.7em', whiteSpace: 'nowrap' }}>{'①②③'[index - 1]} →</span>}
            <pre data-inline-stage={index} style={box}><InlinePanel panel={panel} index={index}/></pre>
          </div>)}
        </div>
        <div style={{ width: 'max-content', marginTop: '0.7em' }}>
          <p style={{ textAlign: 'left', margin: '0 0 0.3em 4em', fontSize: 'calc(15px * var(--image-scale, 1))' }}>
            ↗ func({argument})のインライン展開
          </p>
          <pre data-inline-function="func" style={box}>{func}</pre>
        </div>
      </div>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Canteen({ caption, values }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure" data-source-figure={profiles.canteen} role="group" aria-label={caption} aria-description={canteenAlt(values)}>
    {canteenTables(values[0], values[1] === 1).map(item => <div className="table-scroll" tabIndex={0} key={item.title}>
      <table aria-label={item.title} style={{ width: 'max-content', fontSize: 'calc(15px * var(--image-scale, 1))' }}>
        <caption>{item.title}</caption>
        <thead><tr>{item.columns.map((name, index) => <th key={name} scope="col" style={{ whiteSpace: 'nowrap' }}>
          {item.keyColumns.includes(index) ? <u data-primary-key="true">{name}</u> : name}
        </th>)}</tr></thead>
        <tbody>{item.rows.map((row, index) => <tr key={index}>{row.map((text, column) =>
          <td key={column} style={{ whiteSpace: 'nowrap' }}>{text}</td>)}</tr>)}</tbody>
      </table>
    </div>)}
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Transfer({ caption, values }: BookletFigureProps) {
  const { tx, ack, gap } = transferData(values[0]), enlarged = values[1] === 1;
  const a = 152, b = 477, boxWidth = 16, length = enlarged ? 390 : 379;
  const packetA = enlarged ? a - boxWidth : a - boxWidth / 2, packetB = enlarged ? b : b - boxWidth / 2;
  const ackA = enlarged ? a : a - boxWidth / 2, ackB = enlarged ? b - boxWidth : b - boxWidth / 2;
  const sends = enlarged ? [53, 82, 165, 194, 277, 306] : [52, 170, 288];
  const receives = enlarged ? [94, 123, 206, 235, 318] : [103, 221];
  const ackSends = enlarged ? [112, 140, 224, 252] : [129, 248];
  const ackReceives = enlarged ? [153, 181, 265, 293] : [158, 276];
  return <Drawing profile={profiles.transfer} caption={caption} alt={transferAlt(values)} width={680} height={length}>{arrow => <>
    <Label x={a} y={19}>端末A</Label><Label x={b} y={19}>端末B</Label>
    <path d={'M' + a + ' 26V' + (length - 9) + 'M' + b + ' 26V' + (length - 9)}/>
    {sends.map((y, i) => {
      const complete = i < receives.length, endX = complete ? (enlarged ? b - 3 : b - 9) : b - 65;
      const startY = y + 11, endY = complete ? receives[i] : startY + 34;
      const center = (a + endX) / 2, midY = (startY + endY) / 2 - 8;
      return <g key={i} data-transfer-packet={i + 1}>
        <rect data-packet-side="A" x={packetA} y={y} width={boxWidth} height={24} fill="var(--diagram-surface)"/>
        {complete && <rect data-packet-side="B" x={packetB} y={endY - 11} width={boxWidth} height={24} fill="var(--diagram-surface)"/>}
        <path d={'M' + (a + (enlarged ? 4 : 11)) + ' ' + startY + 'L' + endX + ' ' + endY} markerEnd={complete ? arrow : undefined}/>
        <g transform={'rotate(6 ' + center + ' ' + midY + ')'}><Label x={center} y={midY}>{'パケット(' + (i + 1) + ')'}</Label></g>
      </g>;
    })}
    {ackSends.map((y, i) => {
      const dest = ackReceives[i], center = (a + b) / 2, midY = (y + dest) / 2 - 8;
      return <g key={i} data-transfer-ack={i + 1}>
        <rect data-ack-side="B" x={ackB} y={y - 3} width={boxWidth} height={6} fill="currentColor"/>
        <rect data-ack-side="A" x={ackA} y={dest - 3} width={boxWidth} height={6} fill="currentColor"/>
        <path d={'M' + (ackB - 3) + ' ' + y + 'L' + (ackA + boxWidth + 3) + ' ' + dest} markerEnd={arrow}/>
        <g transform={'rotate(-6 ' + center + ' ' + midY + ')'}><Label x={center} y={midY}>{'ACK(' + (i + 1) + ')'}</Label></g>
      </g>;
    })}
    {(enlarged ? [[77, 82, gap]] : [[52, 76, tx], [155, 161, ack], [279, 288, gap]]).map(([top, bottom, time], i) =>
      <g key={i} data-duration={time}>
        <path d={'M121 ' + top + 'H' + (enlarged ? 133 : 141) + 'M121 ' + bottom + 'H' + (enlarged ? 133 : 141) + 'M127 ' + (top - 12) + 'V' + top} markerEnd={arrow}/>
        <path d={'M127 ' + (bottom + 13) + 'V' + bottom} markerEnd={arrow}/>
        <Label x={13} y={(top + bottom) / 2 + 5} left>{time}ミリ秒</Label>
      </g>)}
    <rect x={503} y={length - 71} width={12} height={19} fill="var(--diagram-surface)"/>
    <Label x={524} y={length - 56} left>パケットの送受信</Label>
    <rect x={503} y={length - 36} width={12} height={6} fill="currentColor"/>
    <Label x={524} y={length - 30} left>ACKの送受信</Label>
  </>}</Drawing>;
}

export const legacy2012SpringPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.float, component: FloatBits },
  { profile: profiles.optimize, component: OptimizationStages },
  { profile: profiles.inline, component: InlineSteps },
  { profile: profiles.canteen, component: Canteen },
  { profile: profiles.transfer, component: Transfer },
];
