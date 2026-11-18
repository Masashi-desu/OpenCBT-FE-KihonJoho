import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { numberFormatsFigure, registerWordsFigure } from '../core/generators/legacy-2005-spring-pm-13';

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
        <g fill="currentColor" fontSize="15">{children}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const wordWidth = 36;
function WordCells({ x, y, cells }: { x: number; y: number; cells: readonly string[] }) {
  return <g>
    <rect x={x} y={y} width={cells.length * wordWidth} height="29" fill="none" stroke="currentColor"/>
    {cells.map((word, index) => {
      const left = x + index * wordWidth;
      return <g key={index}>
        {index > 0 && <path d={'M ' + left + ' ' + y + ' v 29'} stroke="currentColor"/>}
        <text x={left + wordWidth / 2} y={y + 20} textAnchor="middle" fontFamily="monospace">{word}</text>
      </g>;
    })}
  </g>;
}

function Format({ caption, values }: BookletFigureProps) {
  const { layouts, alt } = numberFormatsFigure.panel(values);
  return <Scene caption={caption} alt={alt} width={592} height={150}>
    {layouts.map((cells, row) => {
      const x = row === 0 ? 15 : 322, left = x + wordWidth, right = x + cells.length * wordWidth;
      const middle = (left + right) / 2;
      const bracket = 'M ' + left + ' 47 q 3 10 13 10 H ' + (middle - 8) + ' q 6 0 8 7 q 2 -7 8 -7 H ' + (right - 13) + ' q 10 0 13 -10';
      return <g key={row}>
        <WordCells x={x} y={13} cells={cells}/>
        <path d={bracket} fill="none" stroke="currentColor"/>
        <text x={middle} y="81" textAnchor="middle">N文字</text>
      </g>;
    })}
    <text x="280" y="35">又は</text>
    <text x="344" y="104">N：文字数（N＞0）</text>
    <text x="344" y="124">−：負符号</text>
    <text x="344" y="144">x：数字</text>
  </Scene>;
}

function Argument({ caption, values }: BookletFigureProps) {
  const { length, digits, alt } = registerWordsFigure.panel(values);
  return <Scene caption={caption} alt={alt} width={281} height={98}>
    <WordCells x={27} y={14} cells={[String(length), ...digits.map(digit => "'" + digit + "'")]}/>
    <path d="M 45 65 V 46 M 40 51 L 45 46 L 50 51" fill="none" stroke="currentColor"/>
    <text x="45" y="86" textAnchor="middle">（GR1）</text>
  </Scene>;
}

export const legacy2005SpringPm1013FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: numberFormatsFigure.profile, component: Format },
  { profile: registerWordsFigure.profile, component: Argument },
];
