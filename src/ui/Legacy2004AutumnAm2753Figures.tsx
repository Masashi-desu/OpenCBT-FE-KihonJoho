import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { csvWorksheet, schoolEntityFigure } from '../core/generators/legacy-2004-autumn-am-27-53-figures';

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
        <g fill="currentColor" fontSize="16">{children}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Worksheet({ caption, values }: BookletFigureProps) {
  const { columns, rows, alt } = csvWorksheet.panel(values);
  const x = 16, y = 14, header = 39, width = 78, height = 32;
  return <Scene caption={caption} alt={alt} width={384} height={157}>
    <path d="M 16 14 H 367 V 46 H 55 V 142 H 16 Z" fill="var(--soft-surface)"/>
    <rect x={x} y={y} width={header + width * columns.length} height={height * (rows.length + 1)} fill="none" stroke="currentColor"/>
    {columns.map((column, i) => <g key={column}>
      <path d={'M ' + (x + header + width * i) + ' 14 V 142'} stroke="currentColor"/>
      <text x={x + header + width * (i + 0.5)} y={y + 22} textAnchor="middle">{column}</text>
    </g>)}
    {rows.map((row, i) => <g key={row}>
      <path d={'M 16 ' + (y + height * (i + 1)) + ' H 367'} stroke="currentColor"/>
      <text x={x + header / 2} y={y + height * (i + 1) + 22} textAnchor="middle">{row}</text>
    </g>)}
    <rect data-target="D3" x={x + header + width * 3} y={y + 3 * height} width={width} height={height}
      fill="none" stroke="currentColor" strokeWidth="3"/>
  </Scene>;
}

function School({ caption, values }: BookletFigureProps) {
  const { schemas, alt } = schoolEntityFigure.panel(values);
  return <Scene caption={caption} alt={alt} width={548} height={198}>
    {schemas.map((pairs, i) => {
      const y = i === 0 ? 39 : 115;
      return <g key={i} data-model={'ab'[i]}>
        <text x="15" y={y + 25}>({'ab'[i]})</text>
        {['教師', 'クラス', '教室'].map((entity, index) => <g key={entity}>
          <rect x={55 + 171 * index} y={y} width="91" height="40" fill="none" stroke="currentColor"/>
          <text x={100.5 + 171 * index} y={y + 25} textAnchor="middle">{entity}</text>
        </g>)}
        {pairs.map(([left, right], relation) => {
          const from = 146 + 171 * relation, end = from + 80;
          return <g key={relation} data-link={relation} data-left={left} data-right={right}>
            <path d={'M ' + from + ' ' + (y + 20) + ' H ' + end} stroke="currentColor"/>
            <text x={from + 5} y={y + 15}>{left}</text>
            <text x={end - 5} y={y + 15} textAnchor="end">{right}</text>
          </g>;
        })}
      </g>;
    })}
  </Scene>;
}

export const legacy2004AutumnAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: csvWorksheet.profile, component: Worksheet },
  { profile: schoolEntityFigure.profile, component: School },
];
