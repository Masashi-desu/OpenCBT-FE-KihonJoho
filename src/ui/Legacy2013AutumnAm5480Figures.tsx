import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2013Am5480Profiles as profile, legacy2013AutumnAm5480Figures } from '../core/generators/legacy-2013-autumn-am-54-80-figures';
import {
  autumn2013AmChargeLines, autumn2013AmFishbone, autumn2013AmReceiptRows, autumn2013AmScreenEffort,
} from '../core/generators/legacy-2013-autumn-am-54-80-models';

const cell: CSSProperties = {
  border: '1px solid var(--diagram-border)', padding: '.23em .56em', whiteSpace: 'nowrap',
};
const table: CSSProperties = { borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' };

function description(id: string, values: number[]) {
  return legacy2013AutumnAm5480Figures.find(figure => figure.profile === id)!.alt(values);
}

function Frame({ id, caption, children, tableDescription }: {
  id: string; caption: string; children: ReactNode; tableDescription?: string;
}) {
  return <figure className="managed-diagram source-figure" data-figure-profile={id}
    role={tableDescription ? 'group' : undefined} aria-label={tableDescription ? caption : undefined}
    aria-description={tableDescription}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>
      {children}
    </div>
  </figure>;
}

function Effort({ values, caption }: BookletFigureProps) {
  return <Frame id={profile.effort} caption={caption} tableDescription={description(profile.effort, values)}>
    <table aria-label={caption} style={table}>
      <caption>［画面当たりの標準作業日数］　単位 人日</caption>
      <thead><tr>
        <th scope="col" aria-label="規模と複雑度" style={{ ...cell, padding: 0 }}>
          <svg viewBox="0 0 108 52" width="108" height="52" aria-hidden="true"
            style={{ display: 'block', width: 'calc(108px * var(--image-scale, 1))', height: 'auto' }}>
            <path d="M0 0L108 52" stroke="currentColor" fill="none"/>
            <text x="82" y="16" fill="currentColor" textAnchor="middle">複雑度</text>
            <text x="26" y="45" fill="currentColor" textAnchor="middle">規模</text>
          </svg>
        </th>
        {['単純', '普通', '複雑'].map(label => <th key={label} scope="col" style={cell}>{label}</th>)}
      </tr></thead>
      <tbody>{autumn2013AmScreenEffort.map((row, i) => <tr key={i}>
        <th scope="row" style={cell}>{['小', '中', '大'][i]}</th>
        {row.map((number, j) => <td key={j} style={cell}>{(number / 10).toFixed(1)}</td>)}
      </tr>)}</tbody>
    </table>
  </Frame>;
}

function Chart({ id, values, caption, width, height, children }: BookletFigureProps & {
  id: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const label = useId();
  return <Frame id={id} caption={caption}>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={label + '-title'}
      aria-describedby={label + '-alt'}
      style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none', height: 'auto' }}>
      <title id={label + '-title'}>{caption}</title>
      <desc id={label + '-alt'}>{description(id, values)}</desc>
      <defs><marker id={label + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="7" markerHeight="7" orient="auto">
        <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      </marker></defs>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" fontSize="16">
        {children('url(#' + label + '-arrow)')}
      </g>
    </svg>
  </Frame>;
}

function Text({ x, y, children, vertical = false }: { x: number; y: number; children: ReactNode; vertical?: boolean }) {
  return <text x={x} y={y} textAnchor="middle" stroke="none" fill="currentColor"
    writingMode={vertical ? 'vertical-rl' : undefined}>{children}</text>;
}

function Charge(props: BookletFigureProps) {
  const points = autumn2013AmChargeLines[props.values[0]].map(([x, y]) => `${40 + 29 * x},${156 - 22 * y}`);
  return <Chart {...props} id={profile.charge} width={238} height={184}>{() => <>
    <path d="M40 15V156H225"/>
    <polyline points={points.join(' ')} data-charge-line={props.values[0]}/>
    <Text x={28} y={165}>0</Text><Text x={24} y={87} vertical>利用料金</Text><Text x={132} y={178}>使用量</Text>
  </>}</Chart>;
}

function Portfolio(props: BookletFigureProps) {
  return <Chart {...props} id={profile.portfolio} width={276} height={282}>{() => <>
    <rect x="65" y="41" width="174" height="174"/>
    <path d="M152 41V215M65 128H239"/>
    <Text x={152} y={29}>事業の強み（市場シェア）</Text>
    <Text x={46} y={128} vertical>事業の魅力度（市場成長率）</Text>
    <Text x={254} y={61}>高</Text><Text x={254} y={209}>低</Text>
    <Text x={75} y={238}>強</Text><Text x={229} y={238}>弱</Text>
  </>}</Chart>;
}

function Fishbone(props: BookletFigureProps) {
  const { head, branch } = autumn2013AmFishbone[props.values[0]];
  return <Chart {...props} id={profile.fishbone} width={293} height={150}>{arrow => <>
    <path d="M24 42H199" markerEnd={arrow}/>
    <path d="M63 108L122 42" markerEnd={arrow}/>
    <rect x="199" y="24" width="72" height="36" data-fishbone-head={head}/>
    <rect x="26" y="108" width="72" height="36" data-fishbone-branch={branch}/>
    <Text x={235} y={48}>{head}</Text><Text x={62} y={132}>{branch}</Text>
  </>}</Chart>;
}

function Receipt({ values, caption }: BookletFigureProps) {
  return <Frame id={profile.receipt} caption={caption} tableDescription={description(profile.receipt, values)}>
    <table aria-label={caption} style={table}>
      <colgroup span={1}/><colgroup span={1}/><colgroup span={2}/><colgroup span={1}/>
      <thead>
        <tr>
          <th rowSpan={2} scope="col" style={cell}>日付</th>
          <th rowSpan={2} scope="col" style={cell}>摘要</th>
          <th colSpan={2} scope="colgroup" style={cell}>受払個数</th>
          <th rowSpan={2} scope="col" style={cell}>単価<br/>（円）</th>
        </tr>
        <tr><th scope="col" style={cell}>受入</th><th scope="col" style={cell}>払出</th></tr>
      </thead>
      <tbody>{autumn2013AmReceiptRows(values[0]).map(row => <tr key={row.date}>
        <th scope="row" style={cell}>{row.date}</th><td style={cell}>{row.action}</td>
        <td style={cell}>{row.received}</td><td style={cell}>{row.issued}</td><td style={cell}>{row.price}</td>
      </tr>)}</tbody>
    </table>
  </Frame>;
}

export const legacy2013AutumnAm5480FigureRenderers: BookletFigureRenderer[] = [
  { profile: profile.effort, component: Effort }, { profile: profile.charge, component: Charge },
  { profile: profile.portfolio, component: Portfolio }, { profile: profile.fishbone, component: Fishbone },
  { profile: profile.receipt, component: Receipt },
];
