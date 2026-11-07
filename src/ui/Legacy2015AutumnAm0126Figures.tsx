import { useId, type ReactNode } from 'react';
import { DecemberAFigure } from './DecemberAFigure';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  profiles, logicAlt, logicCases, memoryAlt, memoryCases, memoryLabels,
} from '../core/generators/legacy-2015-autumn-am-01-26-figures';

function ArrayFigure({ values, caption }: BookletFigureProps) {
  return <DecemberAFigure profile="dec-a-array" values={values} caption={caption}
    panelTitleMode="2019-autumn-am-9" />;
}

function Picture({ title, alt, viewBox, children }: {
  title: string; alt: string; viewBox: string; children: ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" role="group" tabIndex={0}
      aria-label="問題の図。幅が足りない場合は左右にスクロールできます。">
      <svg className="source-figure-svg" viewBox={viewBox} role="img"
        aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}>
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{alt}</desc>
        <g aria-hidden="true">{children}</g>
      </svg>
    </div>
    <figcaption>{title}</figcaption>
  </figure>;
}

function MemoryFigure({ values, caption }: BookletFigureProps) {
  const sizes = memoryCases[values[0]];
  const boundaries = [25, 176, 267, 481, 695];
  return <Picture title={caption} alt={memoryAlt(values)} viewBox="0 0 720 125">
    {sizes.map((size, i) => {
      const start = boundaries[i], end = boundaries[i + 1], center = (start + end) / 2;
      return <g key={i} data-memory-section={i} data-size-kb={size}>
        <rect x={start} y={23} width={end - start} height={53} fill="var(--diagram-surface)" />
        <text x={center} y={55} textAnchor="middle" style={{ fontSize: 16 }}>{memoryLabels[i]}</text>
        <text x={center} y={102} textAnchor="middle" style={{ fontSize: 16 }}>{size}kバイト</text>
      </g>;
    })}
  </Picture>;
}

type Gate = (typeof logicCases)[number][number];
function GateSymbol({ x, y, gate }: { x: number; y: number; gate: Gate }) {
  const outputBubble = gate !== 'AND';
  const shape = gate === 'NOR'
    ? 'M0 -21 Q22 -23 44 0 Q22 23 0 21 Q15 0 0 -21 Z'
    : 'M0 -21 H22 A22 21 0 0 1 22 21 H0 Z';
  return <g transform={`translate(${x}, ${y})`} data-gate={gate}>
    <path d={shape} fill="var(--diagram-surface)" />
    {outputBubble && <circle cx={49} cy={0} r={5} fill="var(--diagram-surface)" data-inversion="true" />}
  </g>;
}

function LogicFigure({ values, caption }: BookletFigureProps) {
  const [upper, lower, last] = logicCases[values[0]];
  const attach = (gate: Gate, x: number) => x + (gate === 'NOR' ? 7 : 0);
  const leave = (gate: Gate, x: number) => x + (gate === 'AND' ? 44 : 54);
  return <Picture title={caption} alt={logicAlt(values)} viewBox="0 0 370 180">
    <g fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path data-wire="A-top" d={`M44 39 H${attach(upper, 83)}`} />
      <path data-wire="B-top" d={`M44 57 H${attach(upper, 83)}`} />
      <path data-wire="C-bottom" d={`M44 119 H${attach(lower, 83)}`} />
      <path data-wire="D-bottom" d={`M44 137 H${attach(lower, 83)}`} />
      <path data-wire="top-output" d={`M${leave(upper, 83)} 48 H180 V70 H${attach(last, 226)}`} />
      <path data-wire="bottom-output" d={`M${leave(lower, 83)} 128 H194 V88 H${attach(last, 226)}`} />
      <path data-wire="output-X" d={`M${leave(last, 226)} 79 H319`} />
      <GateSymbol x={83} y={48} gate={upper} />
      <GateSymbol x={83} y={128} gate={lower} />
      <GateSymbol x={226} y={79} gate={last} />
    </g>
    <g fill="currentColor" stroke="none" style={{ fontSize: 16 }}>
      <text x={24} y={44}>A</text><text x={24} y={62}>B</text>
      <text x={24} y={124}>C</text><text x={24} y={142}>D</text>
      <text x={326} y={84}>X</text>
    </g>
  </Picture>;
}

export const legacy2015AutumnAm0126FigureRenderers: BookletFigureRenderer[] = [
  { profile: profiles.array, component: ArrayFigure },
  { profile: profiles.memory, component: MemoryFigure },
  { profile: profiles.logic, component: LogicFigure },
];
