import { useId, type ReactNode } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  customerCases, customerTransitionFigure, evaluationCases, evaluationNames, existingProducts, integerText, newProducts,
  portfolioCases, portfolioFigure, portfolioQuadrants, procurementFigure, procurementLetters, rateText, retainedCustomers,
  weightedEvaluationFigure,
} from '../core/generators/legacy-2010-spring-am-54-80-figures';

type FigureText = { caption: string; description: string; profile: string };
function ScrollFigure({ caption, profile, children }: Omit<FigureText, 'description'> & { children: ReactNode }) {
  return <div className="diagram-scroll" data-figure-profile={profile} tabIndex={0} aria-label={caption + "。幅が足りない場合は左右にスクロールできます。"}>{children}</div>;
}

function Svg({ caption, description, profile, viewBox, width, children }: FigureText & {
  viewBox: string; width: number; children: ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <ScrollFigure caption={caption} profile={profile}>
    <svg viewBox={viewBox} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}
      style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, height: 'auto', color: 'var(--diagram-ink)' }}>
      <title id={`${id}-title`}>{caption}</title>
      <desc id={`${id}-desc`}>{description}</desc>
      <g aria-hidden="true">{children}</g>
    </svg>
    </ScrollFigure>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function TableFigure({ caption, description, profile, children }: FigureText & { children: ReactNode }) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={description}>
    <div className="table-scroll" data-figure-profile={profile} tabIndex={0}
      aria-label={caption + "。幅が足りない場合は左右にスクロールできます。"}>
      <table style={{ minWidth: 'calc(480px * var(--image-scale, 1))' }}>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  </figure>;
}

function Evaluation({ index, ...text }: FigureText & { index: number }) {
  const { weights, scores } = evaluationCases[index];
  return <TableFigure {...text}>
    <colgroup span={2} />
    <colgroup span={4} />
    <thead>
      <tr><th scope="col" rowSpan={2}>評価項目</th><th scope="col" rowSpan={2}>評価項目の重み</th><th scope="colgroup" colSpan={4}>改善案</th></tr>
      <tr>{[1, 2, 3, 4].map(plan => <th scope="col" key={plan}>案{plan}</th>)}</tr>
    </thead>
    <tbody>{evaluationNames.map((name, i) => <tr key={name}>
      <th scope="row">{name}</th><td>{weights[i]}</td>{scores[i].map((score, j) => <td key={j}>{score}</td>)}
    </tr>)}</tbody>
  </TableFigure>;
}

const processLabels = [['提案評価方法', 'の決定'], ...procurementLetters.map(letter => [letter])];
const processBoxes = [10, 163, 283, 403, 523];
function Procurement(text: FigureText) {
  return <Svg {...text} viewBox="0 0 626 82" width={626}>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      {processBoxes.map((x, i) => <rect key={i} x={x} y="16" width={i === 0 ? 115 : 85} height="50" />)}
      {processBoxes.slice(1).map((x, i) => <path key={i} d={`M${processBoxes[i] + (i === 0 ? 115 : 85)} 41H${x - 1}m-8 -5 8 5-8 5`} />)}
    </g>
    <g fill="currentColor" fontSize="15" textAnchor="middle" dominantBaseline="middle">
      {processLabels.map((lines, i) => lines.map((line, j) =>
        <text x={processBoxes[i] + (i === 0 ? 57.5 : 42.5)} y={lines.length === 1 ? 41 : 32 + 18 * j} key={line}>{line}</text>))}
    </g>
  </Svg>;
}

function Portfolio({ index, ...text }: FigureText & { index: number }) {
  const { verticalHighOnTop, horizontalHighOnLeft } = portfolioCases[index];
  const quadrants = portfolioQuadrants(index);
  const positions = [[136, 61], [262, 61], [136, 128], [262, 128]] as const;
  return <Svg {...text} viewBox="0 0 356 200" width={356}>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M73 28H325V162H73ZM199 28V162M73 95H325" />
      <rect x="9" y="72" width="22" height="46" /><rect x="174" y="174" width="50" height="22" />
    </g>
    <g fill="currentColor" fontSize="16" textAnchor="middle" dominantBaseline="middle">
      <text x="20" y="95">a</text><text x="199" y="186">b</text>
      <text x="55" y="53">{verticalHighOnTop ? '高' : '低'}</text><text x="55" y="137">{verticalHighOnTop ? '低' : '高'}</text>
      <text x="99" y="186">{horizontalHighOnLeft ? '高' : '低'}</text><text x="303" y="186">{horizontalHighOnLeft ? '低' : '高'}</text>
      {quadrants.map((label, i) => <text key={label} x={positions[i][0]} y={positions[i][1]}>{label}</text>)}
    </g>
  </Svg>;
}

function Customers({ index, ...text }: FigureText & { index: number }) {
  const { population, rates, newCustomers } = customerCases[index];
  return <TableFigure {...text}>
    <thead><tr><th scope="col" aria-label="現在の商品" /><th scope="col">人数</th>
      {newProducts.map(name => <th scope="col" key={name}>{name}</th>)}</tr></thead>
    <tbody>
      {existingProducts.map((name, i) => <tr key={name}><th scope="row">{name}</th><td>{integerText(population[i])}</td>
        {rates[i].map((rate, j) => <td key={j}>{rateText(rate)}</td>)}</tr>)}
      <tr><th scope="row" colSpan={2}>既存顧客人数</th>{newProducts.map((name, i) => <td key={name}>{integerText(retainedCustomers(index, i))}</td>)}</tr>
      <tr><th scope="row" colSpan={2}>新規顧客人数</th>{newCustomers.map((count, i) => <td key={i}>{integerText(count)}</td>)}</tr>
    </tbody>
  </TableFigure>;
}

export const legacy2010SpringAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: weightedEvaluationFigure.profile, component({ values, caption }) {
    return <Evaluation index={values[0]} caption={caption} profile={weightedEvaluationFigure.profile} description={weightedEvaluationFigure.alt(values)} />;
  } },
  { profile: procurementFigure.profile, component({ values, caption }) {
    return <Procurement caption={caption} profile={procurementFigure.profile} description={procurementFigure.alt(values)} />;
  } },
  { profile: portfolioFigure.profile, component({ values, caption }) {
    return <Portfolio index={values[0]} caption={caption} profile={portfolioFigure.profile} description={portfolioFigure.alt(values)} />;
  } },
  { profile: customerTransitionFigure.profile, component({ values, caption }) {
    return <Customers index={values[0]} caption={caption} profile={customerTransitionFigure.profile} description={customerTransitionFigure.alt(values)} />;
  } },
];
