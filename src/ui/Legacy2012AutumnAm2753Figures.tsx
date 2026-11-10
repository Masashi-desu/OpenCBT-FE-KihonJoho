import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  autumn2012Am2753Profiles, autumn2012Cryptogram, autumn2012CryptogramAlt,
  autumn2012ProjectAlt, autumn2012ProjectDurations, autumn2012ProjectEdges,
} from '../core/generators/legacy-2012-autumn-am-27-53-figures';

function Panel({ caption, description, width, height, children }: {
  caption: string;
  description: string;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`,
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{description}</desc>
        <defs>
          <marker id={id + '-arrow'} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="currentColor"/>
          </marker>
        </defs>
        {children(`url(#${id}-arrow)`)}
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function Cryptogram({ values, caption }: BookletFigureProps) {
  const { sender, recipient, plaintext, ciphertext } = autumn2012Cryptogram(values);
  return <Panel caption={caption} description={autumn2012CryptogramAlt(values)} width={768} height={281}>
    {arrow => <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M52 21H290L272 66H34ZM488 21H726L708 66H470Z"/>
        <rect x="67" y="110" width="190" height="48"/>
        <rect x="503" y="110" width="190" height="48"/>
        <path d="M52 215H290L272 267H34ZM488 215H726L708 267H470Z"/>
        <ellipse cx="383" cy="241" rx="73" ry="21"/>
        <path d="M162 66V109" markerEnd={arrow}/>
        <path d="M162 158V214" markerEnd={arrow}/>
        <path d="M280 241H309" markerEnd={arrow}/>
        <path d="M456 241H478" markerEnd={arrow}/>
        <path d="M598 215V159" markerEnd={arrow}/>
        <path d="M598 110V67" markerEnd={arrow}/>
      </g>
      <g fill="currentColor" textAnchor="middle" fontSize="15">
        <text x="162" y="49">{'“' + plaintext + '”'}</text>
        <text x="598" y="49">{'“' + plaintext + '”'}</text>
        <text x="38" y="139">{sender + 'さん'}</text>
        <text x="473" y="139">{recipient + 'さん'}</text>
        <text x="162" y="139">鍵Kによって暗号化</text>
        <text x="598" y="130">{recipient + 'さんの秘密鍵'}</text>
        <text x="598" y="149">によって復号</text>
        <text x="162" y="247">{'“' + ciphertext + '”'}</text>
        <text x="598" y="247">{'“' + ciphertext + '”'}</text>
        <text x="383" y="247">ネットワーク</text>
      </g>
    </g>}
  </Panel>;
}

const nodes = [[57, 61], [168, 164], [271, 61], [372, 164], [471, 61]] as const;
const offset = [
  { title: [164, 51], duration: [164, 84] },
  { title: [120, 108], duration: [96, 127] },
  { title: [206, 106], duration: [234, 128] },
  { title: [371, 51], duration: [371, 84] },
  { title: [270, 153], duration: [270, 185] },
  { title: [410, 106], duration: [436, 127] },
] as const;
const radius = 16;

function trimmedEdge(from: number, to: number) {
  const [x, y] = nodes[from], [endX, endY] = nodes[to];
  const distance = Math.hypot(endX - x, endY - y);
  const dx = (endX - x) / distance, dy = (endY - y) / distance;
  return `M${x + dx * radius} ${y + dy * radius}L${endX - dx * (radius + 1)} ${endY - dy * (radius + 1)}`;
}

function Project({ values, caption }: BookletFigureProps) {
  const durations = autumn2012ProjectDurations(values);
  return <Panel caption={caption} description={autumn2012ProjectAlt(values)} width={705} height={206}>
    {arrow => <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {nodes.map(([x, y]) => <circle key={x} cx={x} cy={y} r={radius}/>)}
        {autumn2012ProjectEdges.map(({ label, from, to }) =>
          <path key={label} d={trimmedEdge(from, to)} markerEnd={arrow}/>)}
        <circle cx="552" cy="132" r="16"/>
        <circle cx="670" cy="132" r="16"/>
        <path d="M568 132H653" markerEnd={arrow}/>
      </g>
      <g fill="currentColor" textAnchor="middle" fontSize="16">
        {autumn2012ProjectEdges.map(({ label }, i) => <g key={label}>
          <text x={offset[i].title[0]} y={offset[i].title[1]}>{label}</text>
          <text x={offset[i].duration[0]} y={offset[i].duration[1]}>{durations[i]}</text>
        </g>)}
        <text x="550" y="94">凡例</text>
        <text x="611" y="123">作業名</text>
        <text x="611" y="156">所要日数</text>
      </g>
    </g>}
  </Panel>;
}

export const legacy2012AutumnAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: autumn2012Am2753Profiles.cryptogram, component: Cryptogram },
  { profile: autumn2012Am2753Profiles.project, component: Project },
];
