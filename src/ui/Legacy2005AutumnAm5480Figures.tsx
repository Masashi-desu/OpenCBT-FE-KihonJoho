import { useId, type ReactNode } from 'react';
import type { BookletFigureRenderer, BookletFigureProps } from './booklet-figure-renderer-contract';
import {
  autumn2005Am5480Profile, autumn2005AmRoute, autumn2005AmScatter, legacy2005AutumnAm5480Figures,
} from '../core/generators/legacy-2005-autumn-am-54-80-figures';

type GraphicProps = BookletFigureProps & {
  width: number;
  height: number;
  figureName: '57-network' | '77-scatter';
  children: ReactNode;
};

function Graphic({ width, height, figureName, caption, values, children }: GraphicProps) {
  const id = useId(), title = id + '-title', description = id + '-desc';
  const profile = autumn2005Am5480Profile(figureName);
  const definition = legacy2005AutumnAm5480Figures.find(item => item.profile === profile)!;
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" data-figure-profile={profile} tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={title} aria-describedby={description} className="diagram-svg"
        viewBox={`0 0 ${width} ${height}`} width={width} height={height}
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, height: 'auto', maxWidth: 'none' }}>
        <title id={title}>{caption}</title><desc id={description}>{definition.alt(values)}</desc>{children}
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Network(props: BookletFigureProps) {
  const { start, branches } = autumn2005AmRoute(props.values[0]);
  const node = (text: string, x: number, y: number) => <g>
    <rect x={x} y={y} width="82" height="33" fill="var(--surface)" stroke="currentColor" />
    <text x={x + 41} y={y + 21} textAnchor="middle" fill="currentColor">{text}</text>
  </g>;
  const lan = (offset: number, left: number, right: number, baseline: number) => <g stroke="currentColor">
    <path d={`M ${left - 49} ${baseline} H ${right + 49}`} strokeWidth="2.5" />
    <path d={`M ${left} ${offset} V ${baseline} M ${right} ${offset} V ${baseline}`} />
    {[left - 47, left, right, right + 47].map(x => <rect key={x} x={x - 3} y={baseline - 3} width="6" height="6" fill="currentColor" />)}
  </g>;
  return <Graphic {...props} width={603} height={224} figureName="57-network">
    <g fontSize="16">
      <path d="M 222 111 L 388 53 M 222 111 L 388 154" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <text x="278" y="65" fill="currentColor">専用線</text><text x="278" y="174" fill="currentColor">専用線</text>
      {node('端末' + start, 17, 95)}{node('ルータ' + start, 140, 95)}{lan(128, 58, 181, 151)}
      {branches.map((label, index) => {
        const top = 36 + 101 * index;
        return <g key={label}>
          {node('ルータ' + label, 388, top)}{node('端末' + label, 504, top)}
          {lan(top + 33, 429, 545, top + 57)}
        </g>;
      })}
    </g>
  </Graphic>;
}

function Scatter(props: BookletFigureProps) {
  const points = autumn2005AmScatter(props.values[0]);
  return <Graphic {...props} width={356} height={267} figureName="77-scatter">
    <g fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M 44 222 V 22 M 44 222 H 334 M 39 30 L 44 22 L 49 30 M 326 217 L 334 222 L 326 227" />
    </g>
    <g fontSize="15" fill="currentColor" fontStyle="italic">
      <text x="27" y="27">y</text><text x="330" y="242">x</text><text x="31" y="241">0</text>
    </g>
    <g fill="currentColor">{points.map(([x, y]) => <circle key={`${x}-${y}`} cx={44 + 3.01 * x} cy={222 - 2.18 * y}
      data-x={x} data-y={y} r="3" />)}</g>
  </Graphic>;
}

export const legacy2005AutumnAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: autumn2005Am5480Profile('57-network'), component: Network },
  { profile: autumn2005Am5480Profile('77-scatter'), component: Scatter },
];
