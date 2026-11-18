import React, { useId, type ReactNode } from 'react';
import type { BookletFigureDefinition } from '../core/booklet-figure-extension-contract';
import {
  adderCells, adderGroup, exampleFigure, inputExamples, newsFlowFigure, positionsFigure, recordFields, recordFigure, statesFigure,
} from '../core/generators/legacy-2004-spring-pm-01-05-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function Figure({ definition, values, caption, width, height, children }: BookletFigureProps & {
  definition: BookletFigureDefinition;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure" style={{ maxWidth: '100%', minWidth: 0, position: 'relative' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}
      style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-description'}>{definition.alt(values)}</desc>
        <defs><marker id={id + '-arrow'} orient="auto" markerWidth="6" markerHeight="6" refX="6" refY="3">
          <path d="M0 0L6 3L0 6Z" fill="currentColor" />
        </marker></defs>
        <g aria-hidden="true" fill="currentColor" fontSize="15">{children('url(#' + id + '-arrow)')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function AdderExample(props: BookletFigureProps) {
  const [c, x, y] = inputExamples[props.values[0]], value = c + x + y;
  return <Figure {...props} definition={exampleFigure} width={382} height={149}>{arrow => <>
    {[c, x, y, value % 2].map((bit, i) => <text key={i} x="49" y={21 + i * 23}>{bit}</text>)}
    <text x="29" y="90">{value >> 1}</text><text x="13" y="67">＋</text>
    <path d="M15 73H67" fill="none" stroke="currentColor" />
    {adderGroup.slice(0, 3).map((label, i) => <g key={label}>
      <path d={'M93 ' + (16 + i * 23) + 'H68'} fill="none" stroke="currentColor" markerEnd={arrow} />
      <text x="103" y={21 + i * 23}>{label}</text>
    </g>)}
    <path d="M55 118V95M35 139V95" fill="none" stroke="currentColor" markerEnd={arrow} />
    <text x="63" y="118">{adderGroup[3]}</text><text x="43" y="140">{adderGroup[4]}</text>
  </>}</Figure>;
}

function CarryStates(props: BookletFigureProps) {
  return <Figure {...props} definition={statesFigure} width={510} height={174}>{arrow => <>
    <g stroke="currentColor" fill="none">
      <path d="M166 72C122 10 74 37 74 88C74 141 128 144 168 100" markerEnd={arrow} />
      <path d="M340 72C385 10 432 37 432 88C432 141 378 144 338 100" markerEnd={arrow} />
      <path d="M205 72Q255 15 320 72" markerEnd={arrow} /><path d="M321 103Q260 157 207 103" markerEnd={arrow} />
      <circle cx="187" cy="87" r="21" /><circle cx="338" cy="87" r="21" />
      <path d="M187 29V63" markerEnd={arrow} strokeWidth="4" />
    </g>
    <text x="176" y="91">q₀</text><text x="330" y="91">q₁</text>
    <text x="244" y="41">11/0</text><text x="245" y="155">00/1</text>
    {['00/0', '01/1', '10/1'].map((label, i) => <text key={label} x="24" y={73 + i * 18}>{label}</text>)}
    {['01/0', '10/0', '11/1'].map((label, i) => <text key={label} x="446" y={73 + i * 18}>{label}</text>)}
  </>}</Figure>;
}

function BitPositions(props: BookletFigureProps) {
  const slots = adderCells(props.values[0]);
  return <Figure {...props} definition={positionsFigure} width={491} height={133}>{() => <>
    {slots.map((slot, i) => <text key={i} x={48 + i * 42} y="20" textAnchor="middle">{slot}</text>)}
    <text x="332" y="20">添字（ビット番号）</text>
    {['x', 'y', 's'].map((label, row) => <g key={label}>
      <text x="8" y={44 + 35 * row}>{label}</text>
      {slots.map((slot, i) => <rect key={i} x={27 + i * 42} y={27 + 35 * row} width="42" height="27"
        fill="none" stroke="currentColor" strokeDasharray={slot === '…' ? '4 3' : undefined} />)}
    </g>)}
    <path d="M325 27q10 0 10 8v16q0 7 7 8q-7 0-7 8v17q0 8-10 8" fill="none" stroke="currentColor" />
    <text x="348" y="61">入力</text><text x="348" y="116">結果</text>
  </>}</Figure>;
}

function NewsRecord(props: BookletFigureProps) {
  const cells = recordFields(props.values[0], props.values[1]);
  const chunks = cells.map(label => label === '画像ファイルのアドレス' ? ['画像ファイル', 'のアドレス'] :
    ['前回利用年月日', '前回利用時刻', '抽出開始年月日', '抽出開始時刻'].includes(label) ? [label.slice(0, 4), label.slice(4)] : [label]);
  let x = 6;
  const boxes = chunks.map(lines => {
    const width = Math.max(57, Math.max(...lines.map(line => Array.from(line).reduce((sum, char) => sum + (/^[\x00-\x7f]$/.test(char) ? 9 : 15), 0))) + 22);
    const box = { x, width, lines };
    x += width;
    return box;
  });
  return <Figure {...props} definition={recordFigure} width={x + 6} height={68}>{() => boxes.map(({ x, width, lines }, i) => <g key={i}>
    <rect x={x} y="6" width={width} height="54" fill="none" stroke="currentColor" />
    {lines.map((line, row) => <text key={row} x={x + width / 2} y={lines.length === 1 ? 38 : 30 + row * 18} textAnchor="middle">{line}</text>)}
  </g>)}</Figure>;
}

function NewsFlow(props: BookletFigureProps) {
  const stages = [['利用者の', '要求情報'], ['要求受付処理'], ['一時', 'ファイルA'], ['ニュース抽出処理'], ['一時', 'ファイルB'],
    ['ニュース整列処理'], ['一時', 'ファイルC'], ['結果出力処理'], ['抽出結果']];
  const fileOutline = (x: number, y: number, width: number) =>
    'M' + x + ' ' + y + 'h' + width + 'q11 18 0 36h-' + width + 'q-11 -18 0 -36m' + width + ' 0q-11 18 0 36';
  return <Figure {...props} definition={newsFlowFigure} width={426} height={518}>{() => <>
    {Array.from({ length: 8 }, (_, i) => {
      const from = i * 58 + 40;
      const connector = i === 0 || i === 7 ? 'M109 ' + from + 'l-4 12 10-3-6 13' : 'M109 ' + from + 'v22';
      return <path key={from} d={connector} fill="none" stroke="currentColor" />;
    })}
    {stages.map((lines, index) => {
      const y = index * 58 + 4;
      return <g key={index}>
        {index === 0 ? <path d={'M48 ' + y + 'H184l-15 36H33Z'} fill="none" stroke="currentColor" /> :
          index === 8 ? <rect x="48" y={y} width="122" height="36" rx="18" fill="none" stroke="currentColor" /> :
          index % 2 === 0 ? <path d={fileOutline(57, y, 104)} fill="none" stroke="currentColor" /> :
          <rect x="30" y={y} width="158" height="36" fill="none" stroke="currentColor" />}
        {lines.map((line, row) => <text key={row} x="109" y={y + (lines.length === 1 ? 23 : 15 + 16 * row)} textAnchor="middle">{line}</text>)}
      </g>;
    })}
    {['利用者', 'ニュース'].map((label, index) => {
      const y = 62 + index * 116;
      return <g key={label}>
        <path d={'M188 ' + (y + 18) + 'H237'} fill="none" stroke="currentColor" />
        <path d={fileOutline(242, y, 114)} fill="none" stroke="currentColor" />
        <text x="299" y={y + 14} textAnchor="middle">{label}<tspan x="299" dy="16">ファイル</tspan></text>
      </g>;
    })}
  </>}</Figure>;
}

export const legacy2004SpringPm0105FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: exampleFigure.profile, component: AdderExample },
  { profile: statesFigure.profile, component: CarryStates },
  { profile: positionsFigure.profile, component: BitPositions },
  { profile: recordFigure.profile, component: NewsRecord },
  { profile: newsFlowFigure.profile, component: NewsFlow },
];
