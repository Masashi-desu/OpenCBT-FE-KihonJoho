import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { audienceTimeline } from '../core/generators/legacy-2004-autumn-pm-11';
import { clockFormatFigure, extendedClockFormatFigure, relayArgumentsFigure } from '../core/generators/legacy-2004-autumn-pm-13';

function Scene({ caption, alt, width, height, children }: {
  caption: string; alt: string; width: number; height: number; children: ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        viewBox={'0 0 ' + width + ' ' + height}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <g fill="currentColor" fontSize="15">{children}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Timeline({ caption, values }: BookletFigureProps) {
  const { channels, headings, segments, alt } = audienceTimeline.panel(values);
  const x = (slot: number) => 128 + slot * 84;
  const y = (row: number) => 52 + row * 28;
  return <Scene caption={caption} alt={alt} width={680} height={139}>
    <text x={9} y={23}>チャンネル</text>
    <path d="M 91 35 H 659 M 91 125 H 659" stroke="currentColor"/>
    {headings.map((heading, slot) => <g key={slot}>
      <text x={x(slot)} y={23} textAnchor="middle">{heading.slice(0, 2)}:{heading.slice(2)}:00</text>
      <path d={'M ' + x(slot) + ' 35 V 125'} stroke="currentColor" strokeDasharray="3 3"/>
    </g>)}
    {channels.map((channel, row) => <text key={channel} x="45" y={y(row) + 5} textAnchor="middle">{channel}</text>)}
    {segments.map(([row, start, end]) => <g key={start}>
      <path d={'M ' + x(start) + ' ' + y(row) + ' H ' + x(end)} stroke="currentColor" strokeWidth="3"/>
      <circle cx={x(start)} cy={y(row)} r="3"/>
      <circle cx={x(end)} cy={y(row)} r="3"/>
    </g>)}
  </Scene>;
}

function TimeCells({ caption, values, extended = false }: BookletFigureProps & { extended?: boolean }) {
  const { digits, alt } = (extended ? extendedClockFormatFigure : clockFormatFigure).panel(values);
  const cell = 35, start = 14;
  return <Scene caption={caption} alt={alt} width={digits.length * cell + start * 2} height={51}>
    <rect x={start} y="11" width={digits.length * cell} height="30" fill="none" stroke="currentColor"/>
    {digits.map((digit, index) => <g key={index}>
      {index > 0 && <path d={'M ' + (start + index * cell) + ' 11 V 41'} stroke="currentColor"/>}
      <text x={start + (index + 0.5) * cell} y="31" textAnchor="middle" fontFamily="monospace">{digit}</text>
    </g>)}
  </Scene>;
}

function ExtendedTimeCells(props: BookletFigureProps) {
  return <TimeCells {...props} extended/>;
}

function Arguments({ caption, values }: BookletFigureProps) {
  const { teams, offsets, alt } = relayArgumentsFigure.panel(values);
  const start = 106, between = 302, end = 498;
  return <Scene caption={caption} alt={alt} width={524} height={174}>
    <text x={start + 8} y="22">0</text><text x={between - 14} y="22">5</text>
    <text x={between + 8} y="22">6</text><text x={end - 29} y="22">11</text>
    <rect x={start} y="29" width={end - start} height="128" fill="none" stroke="currentColor"/>
    <path d={'M ' + between + ' 29 V 157'} stroke="currentColor"/>
    {[1, 2, 0, teams].map((team, row) => <g key={team}>
      {row > 0 && <path d={'M ' + start + ' ' + (29 + row * 32) + ' H ' + end} stroke="currentColor"/>}
      <text x={start - 10} y={51 + row * 32} textAnchor="end">{
        row === 0 ? '（GR1）＋0' : row === 2 ? '⋮' : '＋' + offsets[row === 1 ? 1 : 2]}</text>
      <text x={start + 15} y={51 + row * 32}>{team ? 'チーム' + team + 'のスタート時刻' : '⋮'}</text>
      <text x={between + 15} y={51 + row * 32}>{team ? 'チーム' + team + 'のゴール時刻' : '⋮'}</text>
    </g>)}
  </Scene>;
}

export const legacy2004AutumnPm1013FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: audienceTimeline.profile, component: Timeline },
  { profile: clockFormatFigure.profile, component: TimeCells },
  { profile: extendedClockFormatFigure.profile, component: ExtendedTimeCells },
  { profile: relayArgumentsFigure.profile, component: Arguments },
];
