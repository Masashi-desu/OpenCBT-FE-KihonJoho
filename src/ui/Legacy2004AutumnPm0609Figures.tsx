import React, { useId, type ReactNode } from 'react';
import { description, exampleCells, figureNames, profile, type FigureName } from '../core/generators/legacy-2004-autumn-pm-06-09-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function Figure({ name, values, caption, width, height, children }: BookletFigureProps & {
  name: FigureName;
  width: number;
  height: number;
  children: ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure" style={{ maxWidth: '100%', minWidth: 0, position: 'relative' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}
      style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-description'}>{description(name, values[0])}</desc>
        <g aria-hidden="true" fill="currentColor" fontSize="15" textAnchor="middle">{children}</g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function RecordLayout(props: BookletFigureProps) {
  return <Figure {...props} name="7-record-layout" width={465} height={86}>
    <g fill="none" stroke="currentColor">
      <rect x="6" y="8" width="453" height="70" />
      <path d="M103 8V78M285 8V78M103 34H285M194 34V78" />
    </g>
    <text x="55" y="39">申込番号<tspan x="55" dy="20">5けた</tspan></text>
    <text x="194" y="26">研修番号</text>
    <text x="149" y="52">内容区分<tspan x="149" dy="18">1けた</tspan></text>
    <text x="239" y="52">開催区分<tspan x="239" dy="18">2けた</tspan></text>
    <text x="372" y="39">その他<tspan x="372" dy="20">42けた</tspan></text>
  </Figure>;
}

function StringLayout(props: BookletFigureProps) {
  return <Figure {...props} name="9-input-layout" width={426} height={100}>
    <g fill="none" stroke="currentColor">
      <path d="M8 11H218M8 49H218M8 11V49M63 11V49" />
      <path d="M218 11H263V49H218" strokeDasharray="4 3" />
      <path d="M34 76V57L30 63M34 57L38 63M79 76V57L75 63M79 57L83 63" />
      <path d="M115 11V20M115 40V49M166 11V20M166 40V49M218 11V20M218 40V49" />
    </g>
    <text x="36" y="27">文字<tspan x="36" dy="16">列長</tspan></text>
    <text x="143" y="37">文 字 列</text>
    <text x="34" y="93">（GR1）</text><text x="101" y="93">（GR1）＋1</text>
    <text x="344" y="35">（文字列長＞0）</text>
  </Figure>;
}

function SpaceExample(props: BookletFigureProps) {
  const [before, after] = exampleCells(props.values[0]);
  const left = 72, step = 29;
  const arrowX = left + (before.length * step) / 2;
  return <Figure {...props} name="9-space-example" width={552} height={145}>
    {[[before, 10, '実行前'], [after, 81, '実行後']].map(([value, y, heading]) => {
      const cells = value as string[];
      const top = y as number;
      return <g key={String(heading)}>
        <text x="30" y={top + 20}>{heading}</text>
        {cells.map((cell, column) => <g key={column}>
          <rect x={left + column * step} y={top} width={step} height="30" fill="none" stroke="currentColor" />
          <text x={left + (column + 0.5) * step} y={top + 20}>{cell}</text>
        </g>)}
      </g>;
    })}
    <path d={'M' + (arrowX - 4) + ' 48h8v12h6l-10 12-10-12h6Z'} stroke="currentColor" fill="none" />
    <text x="8" y="134" textAnchor="start">注　△は空白を示す。</text>
  </Figure>;
}
const components = { '7-record-layout': RecordLayout, '9-input-layout': StringLayout, '9-space-example': SpaceExample };
export const legacy2004AutumnPm0609FigureRenderers: readonly BookletFigureRenderer[] = figureNames.map(name => ({
  profile: profile(name), component: components[name],
}));
