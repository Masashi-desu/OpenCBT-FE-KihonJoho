import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { memberCorrectionFigure, memberDecisionFigure } from '../core/generators/legacy-2005-autumn-pm-11';
import { bitSearchFigure, seatTableFigure } from '../core/generators/legacy-2005-autumn-pm-13';

type SceneProps = { caption: string; alt: string; width: number; height: number; children: ReactNode };

function Scene({ caption, alt, width, height, children }: SceneProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        viewBox={'0 0 ' + width + ' ' + height}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <g fontSize="15" fill="currentColor">{children}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function FlagDecision({ caption, values }: BookletFigureProps) {
  const { conditions, actions, alt } = memberDecisionFigure.panel(values);
  return <Scene caption={caption} alt={alt} width={450} height={229}>
    <rect x="12" y="11" width="426" height="203" fill="none" stroke="currentColor"/>
    <path d="M 12 40 H 438 M 12 115 H 438 M 94 40 V 214 M 302 40 V 214" stroke="currentColor"/>
    {[336, 370, 404].map(x => <path key={x} d={'M ' + x + ' 40 V 214'} stroke="currentColor"/>)}
    {[65, 90].map(y => <path key={y} d={'M 94 ' + y + ' H 438'} stroke="currentColor"/>)}
    {[140, 165, 190].map(y => <path key={y} d={'M 302 ' + y + ' H 438'} stroke="currentColor"/>)}
    <text x="225" y="31" textAnchor="middle">{caption}</text>
    <text x="27" y="84">条件部</text>
    <text x="27" y="172">動作部</text>
    <text x="198" y="172" textAnchor="middle">a</text>
    {conditions.map(([label, ...cells], row) => <g key={row}>
      <text x="104" y={58 + 25 * row}>{label}</text>
      {cells.map((cell, col) => <text key={col} x={319 + 34 * col} y={58 + 25 * row}
        textAnchor="middle">{cell}</text>)}
    </g>)}
    {actions.map((cells, row) => cells.map((cell, col) => <text key={row + ':' + col} x={319 + 34 * col}
      y={133 + 25 * row} textAnchor="middle">{cell}</text>))}
  </Scene>;
}

function ChangeTable({ caption, values }: BookletFigureProps) {
  const { rows: changes, alt } = memberCorrectionFigure.panel(values);
  const rows = [['処置', 'プログラムの変更内容'], ...changes].map(row => row.map(cell => cell.split('\n')));
  const width = 806;
  const heights = rows.map(row => 12 + 21 * Math.max(...row.map(lines => lines.length)));
  const height = 20 + heights.reduce((sum, size) => sum + size, 0);
  return <Scene caption={caption} alt={alt} width={width} height={height}>
    <rect x="12" y="9" width={width - 24} height={height - 20} fill="none" stroke="currentColor"/>
    <path d={'M 180 9 V ' + (height - 11)} stroke="currentColor"/>
    {rows.map(([procedure, program], row) => {
      const top = 9 + heights.slice(0, row).reduce((sum, size) => sum + size, 0);
      return <g key={row}>
        {row > 0 && <path d={'M 12 ' + top + ' H ' + (width - 12)} stroke="currentColor"/>}
        {procedure.map((line, i) => <text key={i} x="23" y={top + 22 + i * 21}>{line}</text>)}
        {program.map((line, i) => <text key={i} x="191" y={top + 22 + i * 21} fontFamily={row ? 'monospace' : undefined}
          xmlSpace="preserve">{line}</text>)}
      </g>;
    })}
  </Scene>;
}

function SearchExample({ caption, values }: BookletFigureProps) {
  const { first, n, params, alt } = bitSearchFigure.panel(values);
  const bitX = (index: number) => 121 + 18 * index;
  return <Scene caption={caption} alt={alt} width={512} height={163}>
    <text x="114" y="24">照合</text>
    <path d="M 159 20 H 394 M 382 14 L 394 20 L 382 26" fill="none" stroke="currentColor"/>
    <text x="113" y="51">15</text><text x="251" y="51">…</text><text x="386" y="51">0</text>
    <text x="411" y="51">ビット番号</text>
    <rect x="107" y="57" width="298" height="91" fill="none" stroke="currentColor"/>
    <path d="M 107 87 H 405 M 107 117 H 405" stroke="currentColor"/>
    <rect x={bitX(first) - 9} y="62" width={18 * n} height="21" fill="var(--selected-surface)"
      stroke="currentColor" strokeDasharray="2 1"/>
    <rect x={bitX(16 - n) - 9} y="122" width={18 * n} height="21" fill="var(--selected-surface)"
      stroke="currentColor" strokeDasharray="2 1"/>
    {params.map((word, row) => <g key={row} fontFamily="monospace">
      <text x="100" y={78 + 30 * row} textAnchor="end">{row === 0 ? '(GR1)+0' : '+' + row}</text>
      {[...word].map((bit, i) => <text key={i} x={bitX(i)} y={78 + 30 * row} textAnchor="middle">{bit}</text>)}
    </g>)}
  </Scene>;
}

function SeatTable({ caption, values }: BookletFigureProps) {
  const { groups, last, alt } = seatTableFigure.panel(values);
  return <Scene caption={caption} alt={alt} width={589} height={129}>
    <text x="14" y="29">ビット番号</text>
    <text x="126" y="29">15 … 0</text><text x="209" y="29">15 … 0</text><text x="504" y="29">15 … 0</text>
    <rect x="112" y="39" width="451" height="30" fill="none" stroke="currentColor"/>
    <path d="M 195 39 V 69 M 278 39 V 69 M 480 39 V 69" stroke="currentColor"/>
    <text x="373" y="60">…</text>
    <text x="14" y="91">座席番号</text><text x="112" y="91">0</text>
    <text x="195" y="91">16</text><text x="563" y="91" textAnchor="end">{last}</text>
    <text x="115" y="115">{groups}語</text>
    <text x="263" y="115">ビットの値　1：空席　0：予約済</text>
  </Scene>;
}

export const legacy2005AutumnPm1013FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: memberDecisionFigure.profile, component: FlagDecision },
  { profile: memberCorrectionFigure.profile, component: ChangeTable },
  { profile: bitSearchFigure.profile, component: SearchExample },
  { profile: seatTableFigure.profile, component: SeatTable },
];
