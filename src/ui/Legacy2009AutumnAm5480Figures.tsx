import React, { useId, type ReactNode } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  compositionRows, contractCases, contractFigure,
  factoryFigure, factoryRows, integerText, inventoryNames, products, requirementsCases, requirementsFigure,
  scatterCases, scatterFigure,
} from '../core/generators/legacy-2009-autumn-am-54-80-figures';

type FigureText = { caption: string; description: string; profile: string };
type IndexedFigure = FigureText & { index: number };

function Svg({ caption, description, profile, width, height, children }: FigureText & {
  width: number; height: number; children: ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" data-figure-profile={profile} tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img"
        aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={`${id}-title`}>{caption}</title><desc id={`${id}-description`}>{description}</desc>
        <g aria-hidden="true">{children}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Tables({ caption, description, profile, children }: FigureText & { children: ReactNode }) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={description}>
    <div className="table-scroll" data-figure-profile={profile} tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      {children}
    </div>
  </figure>;
}

function Factory({ index, ...text }: IndexedFigure) {
  return <Tables {...text}>
    <table style={{ minWidth: 'calc(468px * var(--image-scale, 1))' }}>
      <caption>{text.caption}</caption>
      <thead><tr><th aria-label="項目" />{products.map(product => <th key={product} scope="col">{product}</th>)}</tr></thead>
      <tbody>{factoryRows(index).map(([name, ...values]) =>
        <tr key={name}><th scope="row">{name}</th>{values.map((value, i) => <td key={products[i]}>{value}</td>)}</tr>)}</tbody>
    </table>
  </Tables>;
}

function Requirements({ index, ...text }: IndexedFigure) {
  return <Tables {...text}>
    <div style={{ display: 'flex', width: 'max-content', alignItems: 'start', gap: '1.5rem' }}>
      <table style={{ minWidth: 'calc(260px * var(--image-scale, 1))' }}>
        <caption>構成表（単位 個）</caption>
        <colgroup span={1} /><colgroup span={3} />
        <thead>
          <tr><th scope="col" rowSpan={2}>品名</th><th scope="colgroup" colSpan={3}>構成部品</th></tr>
          <tr>{inventoryNames.slice(1).map(part => <th key={part} scope="col">{part}</th>)}</tr>
        </thead>
        <tbody>{compositionRows(index).map(([item, ...counts]) =>
          <tr key={item}><th scope="row">{item}</th>{counts.map((count, i) => <td key={inventoryNames[i + 1]}>{count}</td>)}</tr>)}</tbody>
      </table>
      <table style={{ minWidth: 'calc(150px * var(--image-scale, 1))' }}>
        <caption>在庫表（単位 個）</caption>
        <thead><tr><th scope="col">品名</th><th scope="col">在庫量</th></tr></thead>
        <tbody>{requirementsCases[index].stock.map((count, item) =>
          <tr key={inventoryNames[item]}><th scope="row">{inventoryNames[item]}</th><td>{integerText(count)}</td></tr>)}</tbody>
      </table>
    </div>
  </Tables>;
}

function Scatter({ index, ...text }: IndexedFigure) {
  return <Svg {...text} width={330} height={257}>
    <path d="M30 21V231H315M24 32 30 21l6 11m269 193 10 6-10 6" fill="none" stroke="currentColor" strokeWidth="2" />
    <g fill="currentColor" fontSize="17">
      <text x="12" y="27">y</text><text x="303" y="251">x</text><text x="18" y="251">0</text>
      {scatterCases[index].map(([x, y]) => <circle key={x + ':' + y} cx={30 + x} cy={231 - y} r="3.2" />)}
    </g>
  </Svg>;
}

const companyLeft = [8, 210, 412];
function ContractChain({ index, ...text }: IndexedFigure) {
  const { order, links } = contractCases[index];
  return <Svg {...text} width={522} height={124}>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      {companyLeft.map(x => <rect key={x} x={x} y="14" width="102" height="46" />)}
      {companyLeft.slice(0, 2).map((x, i) => {
        const left = x + 102, right = companyLeft[i + 1];
        return <path key={x} d={`M${left} 37H${right}m-8 -5 8 5-8 5M${left + 8} 32l-8 5 8 5`} />;
      })}
    </g>
    <g fill="currentColor" textAnchor="middle" dominantBaseline="middle" fontSize="16">
      {order.map((company, i) => <g key={company}>
        <text x={companyLeft[i] + 51} y={company === 'A' ? 28 : 38}>{company}社</text>
        {company === 'A' && <text x={companyLeft[i] + 51} y="47">（発注元）</text>}
      </g>)}
      {links.map((link, i) => {
        const center = companyLeft[i] + 152;
        return <g key={i}>
          <text x={center} y="52">{link.kind}</text>
          {index !== 0 && link.kind === '派遣契約' && <>
            <text x={center} y="78">派遣元：{link.employer}社</text>
            <text x={center} y="100">派遣先：{link.client}社</text>
          </>}
        </g>;
      })}
    </g>
  </Svg>;
}

export const legacy2009AutumnAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: factoryFigure.profile, component({ values, caption }) {
    return <Factory index={values[0]} caption={caption} profile={factoryFigure.profile} description={factoryFigure.alt(values)} />;
  } },
  { profile: requirementsFigure.profile, component({ values, caption }) {
    return <Requirements index={values[0]} caption={caption} profile={requirementsFigure.profile} description={requirementsFigure.alt(values)} />;
  } },
  { profile: scatterFigure.profile, component({ values, caption }) {
    return <Scatter index={values[0]} caption={caption} profile={scatterFigure.profile} description={scatterFigure.alt(values)} />;
  } },
  { profile: contractFigure.profile, component({ values, caption }) {
    return <ContractChain index={values[0]} caption={caption} profile={contractFigure.profile} description={contractFigure.alt(values)} />;
  } },
];
