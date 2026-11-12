import React, { useId, type ReactNode } from 'react';
import type { BookletFigureDefinition } from '../core/booklet-figure-extension-contract';
import {
  activityEdges, clinicChoiceFigures, clinicChoices, clinicSchema, clinicSchemaFigure, connectionThreats,
  criticalPathFigure, databaseLinkFigure, dependencyFigure, functionalDependencies, qualityChart,
  qualityChoiceFigures, salesAxisFigure,
} from '../core/generators/legacy-2008-spring-am-54-80-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function Frame({ definition, values, caption, children, quiet = false, relation = false }: BookletFigureProps & {
  definition: BookletFigureDefinition;
  children: ReactNode;
  quiet?: boolean;
  relation?: boolean;
}) {
  return <figure className="managed-diagram source-figure" style={{ maxWidth: '100%', minWidth: 0, position: 'relative' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} data-figure-profile={definition.profile}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}
      aria-description={relation ? definition.alt(values) : undefined} style={{ maxWidth: '100%', overflowX: 'auto' }}>
      {children}
    </div>
    <figcaption className={quiet ? 'sr-only' : undefined}>{caption}</figcaption>
  </figure>;
}

function Drawing({ definition, values, caption, width, height, quiet, children }: BookletFigureProps & {
  definition: BookletFigureDefinition;
  width: number;
  height: number;
  quiet?: boolean;
  children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <Frame definition={definition} values={values} caption={caption} quiet={quiet}>
    <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
      style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
      <title id={id + '-title'}>{caption}</title><desc id={id + '-description'}>{definition.alt(values)}</desc>
      <defs><marker id={id + '-arrow'} orient="auto" markerWidth="6" markerHeight="6" refX="6" refY="3">
        <path d="M0 0L6 3L0 6Z" fill="currentColor" />
      </marker></defs>
      <g aria-hidden="true">{children('url(#' + id + '-arrow)')}</g>
    </svg>
  </Frame>;
}

function Dependencies(props: BookletFigureProps) {
  const centers: Record<string, [number, number]> = {
    a: [34, 94], b: [150, 48], c: [150, 98], d: [150, 150], e: [150, 193],
    f: [302, 29], g: [302, 76], h: [302, 123],
  };
  return <Drawing {...props} definition={dependencyFigure} width={348} height={216}>{arrow => <>
    <rect x="122" y="23" width="57" height="102" fill="none" stroke="currentColor" />
    {functionalDependencies(props.values[0]).map(({ left, right }) => {
      const [fromX, fromY] = left.length === 2 ? [163, 116] : centers[left[0]];
      const [toX, toY] = centers[right];
      return <path key={left.join('') + right} d={'M' + (fromX + 16) + ' ' + fromY + ' L' + (toX - 17) + ' ' + toY}
        fill="none" stroke="currentColor" markerEnd={arrow} />;
    })}
    {Object.entries(centers).map(([name, [x, y]]) => <g key={name}>
      <rect x={x - 16} y={y - 14} width="32" height="28" fill="none" stroke="currentColor" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fill="currentColor">{name}</text>
    </g>)}
  </>}</Drawing>;
}

const keyWords = { primary: '主キーの項目', foreign: '外部キーの項目', both: '主キーと外部キーの項目' };
function RelationTables({ position, ...props }: BookletFigureProps & { position?: number }) {
  const definition = position === undefined ? clinicSchemaFigure : clinicChoiceFigures[position];
  const relations = position === undefined ? clinicSchema : [clinicChoices[position]];
  return <Frame {...props} definition={definition} relation quiet>
    {relations.map(({ name, columns }) => <table key={name ?? position}
      style={{ width: 'max-content', marginBlock: '0.45em', borderCollapse: 'collapse',
        color: 'var(--diagram-ink)', fontSize: 'calc(16px * var(--image-scale, 1))' }}>
      {name && <caption style={{ textAlign: 'start' }}>{name}</caption>}
      <tbody><tr>{columns.map(({ label, key }) => <td key={label}
        style={{ border: '1px solid currentColor', padding: '0.18em 0.45em 0.28em', whiteSpace: 'nowrap', position: 'relative' }}>
        <span style={key && key !== 'primary' ? { borderBottom: '1px dashed currentColor', paddingBottom: '0.12em' } : undefined}>
          {key === 'primary' || key === 'both' ? <u>{label}</u> : label}
        </span>
        {key && <span className="sr-only">（{keyWords[key]}）</span>}
      </td>)}</tr></tbody>
    </table>)}
  </Frame>;
}

function DatabaseLink(props: BookletFigureProps) {
  const target = [210, 264, 322, 276][props.values[0]];
  const threat = connectionThreats[props.values[0]];
  return <Drawing {...props} definition={databaseLinkFigure} width={430} height={208}>{arrow => <>
    <g fill="none" stroke="currentColor">
      <rect x="10" y="9" width="165" height="118" /><rect x="255" y="9" width="165" height="118" />
      <rect x="24" y="36" width="137" height="28" /><rect x="269" y="36" width="137" height="28" />
      <rect x="24" y="80" width="137" height="38" /><rect x="269" y="80" width="137" height="38" />
      <path d="M92 64v16M337 64v16M92 118v28h245v-28" />
      <rect x="70" y="181" width="280" height="23" />
      <path d={'M210 181 L' + target + ' ' + (props.values[0] === 2 ? 118 : 147)}
        strokeDasharray="4 2" markerEnd={arrow} />
    </g>
    <g fill="currentColor" fontSize="13" textAnchor="middle">
      <text x="92" y="27">クライアント</text><text x="337" y="27">サーバ</text>
      <text x="92" y="55">アプリケーション</text><text x="337" y="55">データベース</text>
      {[92, 337].map(x => <text key={x} x={x} y="95">データベース<tspan x={x} dy="15">接続プログラム</tspan></text>)}
      <text x="210" y="197">{threat}</text>
    </g>
  </>}</Drawing>;
}

function SalesAxis(props: BookletFigureProps) {
  return <Drawing {...props} definition={salesAxisFigure} width={356} height={238}>{arrow => <>
    <g fill="none" stroke="currentColor">
      <path d="M63 187H327" markerEnd={arrow} /><path d="M63 187V15" markerEnd={arrow} />
      <path d="M63 100h243M184 23v164" strokeDasharray="3 2" />
    </g>
    <g fill="currentColor" fontSize="15" textAnchor="middle">
      <text x="122" y="66">領域A</text><text x="245" y="66">領域B</text>
      <text x="122" y="147">領域C</text><text x="245" y="147">領域D</text>
      <text x="189" y="216">年間取引実績金額</text>
      <text transform="translate(29 112) rotate(-90)">年間購買推定金額</text>
      <text x="63" y="12" fontSize="12">多い</text><text x="336" y="208" fontSize="12">多い</text>
    </g>
  </>}</Drawing>;
}

const activityCoordinates = [[0, 0], [34, 111], [193, 33], [88, 187], [167, 111], [287, 111], [365, 187], [460, 111]];
function Activities(props: BookletFigureProps) {
  return <Drawing {...props} definition={criticalPathFigure} width={491} height={227}>{arrow => <>
    {activityEdges(props.values[0]).map(({ name, from, to, days }) => {
      const [ax, ay] = activityCoordinates[from], [bx, by] = activityCoordinates[to];
      const length = Math.hypot(bx - ax, by - ay);
      const dx = (bx - ax) / length, dy = (by - ay) / length;
      return <g key={from + ':' + to}>
        <path d={'M' + (ax + 14 * dx) + ' ' + (ay + 14 * dy) + ' L' + (bx - 15 * dx) + ' ' + (by - 15 * dy)}
          fill="none" stroke="currentColor" markerEnd={arrow} strokeDasharray={name ? undefined : '4 2'} />
        {name && <text x={(ax + bx) / 2 + 14 * dy} y={(ay + by) / 2 - 10 * dx}
          fill="currentColor" fontSize="15" textAnchor="middle">{name}（{days}）</text>}
      </g>;
    })}
    {activityCoordinates.slice(1).map(([x, y], i) => <g key={i}>
      <circle cx={x} cy={y} r="14" fill="none" stroke="currentColor" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fill="currentColor">{i + 1}</text>
    </g>)}
    <path d="M272 209h32" fill="none" stroke="currentColor" strokeDasharray="4 2" markerEnd={arrow} />
    <text x="314" y="213" fontSize="13" fill="currentColor">ダミー作業</text>
  </>}</Drawing>;
}

function QualityChoice({ position, ...props }: BookletFigureProps & { position: number }) {
  const { bars, line, labels } = qualityChart(props.values[0], position);
  const maxBar = labels.length ? bars.reduce((sum, count) => sum + count, 0) : Math.max(...bars) * 1.22;
  const linePoints = line.map((relativeHeight, i) => (29 + 188 * i / (line.length - 1)) + ',' + (132 - relativeHeight));
  return <Drawing {...props} definition={qualityChoiceFigures[position]} width={239} height={159} quiet>{() => <>
    <g stroke="currentColor" fill="none">
      <path d="M25 132V14M25 132H229" />
      {bars.map((bar, i) => <rect key={i} x={29 + 37.6 * i} y={132 - 100 * bar / maxBar} width="37.6" height={100 * bar / maxBar} />)}
      <polyline points={linePoints.join(' ')} />
    </g>
    <g fill="currentColor" fontSize="12" textAnchor="middle">
      {labels.map((label, i) => <text key={label} x={47.8 + 37.6 * i} y="149">{label}</text>)}
    </g>
  </>}</Drawing>;
}

export const legacy2008SpringAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: dependencyFigure.profile, component: Dependencies },
  { profile: clinicSchemaFigure.profile, component: RelationTables },
  ...clinicChoiceFigures.map(({ profile }, position) => ({
    profile, component: (props: BookletFigureProps) => <RelationTables {...props} position={position} />,
  })),
  { profile: databaseLinkFigure.profile, component: DatabaseLink },
  { profile: salesAxisFigure.profile, component: SalesAxis },
  { profile: criticalPathFigure.profile, component: Activities },
  ...qualityChoiceFigures.map(({ profile }, position) => ({
    profile, component: (props: BookletFigureProps) => <QualityChoice {...props} position={position} />,
  })),
];
