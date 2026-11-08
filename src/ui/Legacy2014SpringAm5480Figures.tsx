import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2014SpringAm5480Figures, spring2014Am5480Profiles as profile, spring2014AmWeightedCriteria } from '../core/generators/legacy-2014-spring-am-54-80-figures';
import { spring2014AmCases, spring2014AmEscrowLabels, spring2014AmProfitLoss, spring2014AmScatter } from '../core/generators/legacy-2014-spring-am-54-80-models';

const cell:CSSProperties = {border:'1px solid var(--diagram-border)',padding:'.23em .56em',whiteSpace:'nowrap'};
const table:CSSProperties = {borderCollapse:'collapse',fontSize:'calc(1em * var(--image-scale, 1))'};
const labels=['案1','案2','案3','案4'];

function Frame({id,caption,children,tableValues}:{id:string;caption:string;children:ReactNode;tableValues?:number[]}) {
  const description=tableValues===undefined?undefined:
    legacy2014SpringAm5480Figures.find(figure=>figure.profile===id)!.alt(tableValues);
  return <figure className="managed-diagram source-figure" data-figure-profile={id}
    role={description===undefined?undefined:'group'} aria-label={description===undefined?undefined:caption}
    aria-description={description}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{color:'var(--diagram-ink)'}}>
      {children}
    </div>
  </figure>;
}

function Weighted({values,caption}:BookletFigureProps) {
  const [weights,scores]=spring2014AmCases.weighted[values[0]];
  const weightCell={...cell,borderInlineEnd:'3px double var(--diagram-border)'};
  return <Frame id={profile.weighted} caption={caption} tableValues={values}><table aria-label={caption} style={table}>
    <colgroup span={1}/><colgroup span={1}/><colgroup span={4}/>
    <thead>
      <tr><th rowSpan={2} scope="col" style={cell}>評価項目</th><th rowSpan={2} scope="col" style={weightCell}>評価項目の<br/>重み</th>
        <th colSpan={4} scope="colgroup" style={cell}>改善案</th></tr>
      <tr>{labels.map(label=><th key={label} scope="col" style={cell}>{label}</th>)}</tr>
    </thead>
    <tbody>{scores.map((row,i)=><tr key={i}>
      <th scope="row" style={cell}>{spring2014AmWeightedCriteria[i]}</th><td style={weightCell}>{weights[i]}</td>
      {row.map((score,j)=><td key={j} style={cell}>{score}</td>)}
    </tr>)}</tbody>
  </table></Frame>;
}

function Svg({id,values,caption,width,height,children}:BookletFigureProps&{
  id:string;width:number;height:number;children:(arrow:string)=>ReactNode;
}) {
  const label=useId(),definition=legacy2014SpringAm5480Figures.find(figure=>figure.profile===id)!;
  return <Frame id={id} caption={caption}>
    <svg viewBox={'0 0 '+width+' '+height} role="img" aria-labelledby={label+'-title'} aria-describedby={label+'-alt'}
      style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto'}}>
      <title id={label+'-title'}>{caption}</title><desc id={label+'-alt'}>{definition.alt(values)}</desc>
      <defs><marker id={label+'-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      </marker></defs>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" fontSize="16">
        {children('url(#'+label+'-arrow)')}
      </g>
    </svg>
  </Frame>;
}
function Text({x,y,children}:{x:number;y:number;children:ReactNode}) {
  return <text x={x} y={y} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}
function Escrow(props:BookletFigureProps) {
  const paths=['M137 213H356','M440 159L353 67','M140 67L62 159','M137 183H356','M407 159L322 67','M168 67L90 159'];
  const labels=[[244,236],[488,101],[91,104],[247,176],[347,141],[148,141]];
  return <Svg {...props} id={profile.escrow} width={604} height={252}>{arrow=><>
    <rect x="112" y="8" width="268" height="59" fill="var(--diagram-surface)"/><Text x={246} y={42}>エスクローサービス会社</Text>
    <rect x="24" y="159" width="113" height="71" fill="var(--diagram-surface)"/><Text x={80.5} y={199}>売り手</Text>
    <rect x="356" y="159" width="113" height="71" fill="var(--diagram-surface)"/><Text x={412.5} y={199}>買い手</Text>
    {paths.map((path,i)=><g key={i} data-transaction-step={i+1}>
      <path d={path} markerEnd={arrow} markerStart={i===0?arrow:undefined}/>
      <Text x={labels[i][0]} y={labels[i][1]}>{spring2014AmEscrowLabels[i]}{i===0?'売買の成立':i===1?'商品代金の払込み':''}</Text>
    </g>)}
  </>}</Svg>;
}
function Scatter(props:BookletFigureProps) {
  const dots=spring2014AmScatter(props.values[0]);
  return <Svg {...props} id={profile.scatter} width={278} height={210}>{arrow=><>
    <path d="M26 180H265" markerEnd={arrow}/><path d="M26 180V9" markerEnd={arrow}/>
    <Text x={23} y={199}>0</Text><Text x={248} y={199}>x</Text><Text x={11} y={26}>y</Text>
    {dots.map(([x,y],i)=><circle key={i} cx={26+x} cy={180-y} r="2.7" fill="currentColor" stroke="none" data-scatter-point={x+','+y}/>)}
  </>}</Svg>;
}
function ProfitLoss({values,caption}:BookletFigureProps) {
  const m=spring2014AmProfitLoss(values[0]);
  const number={...cell,textAlign:'end' as const};
  const groupName={...cell,verticalAlign:'top'};
  const groupTotal={...number,verticalAlign:'bottom'};
  const variable={...cell,borderBottom:'none'};
  const fixed={...cell,borderTop:'none'};
  return <Frame id={profile.profitLoss} caption={caption} tableValues={values}><table aria-label={caption} style={table}>
    <caption style={{textAlign:'end'}}>単位 百万円</caption>
    <thead><tr>{['項目','内訳','金額'].map(key=><th key={key} scope="col" style={cell}>{key}</th>)}</tr></thead>
    <tbody>
      <tr><th scope="row" style={cell}>売上高</th><td style={cell}/><td style={number}>{m.sales}</td></tr>
      <tr><th rowSpan={2} style={groupName}>売上原価</th><td style={variable}>変動費　{m.productionVariable}</td><td rowSpan={2} style={groupTotal}>{m.production}</td></tr>
      <tr><td style={fixed}>固定費　{m.productionFixed}</td></tr>
      <tr><th scope="row" style={cell}>売上総利益</th><td style={cell}/><td style={number}>{m.gross}</td></tr>
      <tr><th rowSpan={2} style={groupName}>販売費・一般管理費</th><td style={variable}>変動費　{m.sellingVariable}</td><td rowSpan={2} style={groupTotal}>{m.selling}</td></tr>
      <tr><td style={fixed}>固定費　{m.sellingFixed}</td></tr>
      <tr><th scope="row" style={cell}>営業利益</th><td style={cell}/><td style={number}>{m.net}</td></tr>
    </tbody>
  </table></Frame>;
}
export const legacy2014SpringAm5480Renderers:BookletFigureRenderer[] = [
  {profile:profile.weighted,component:Weighted},{profile:profile.escrow,component:Escrow},
  {profile:profile.scatter,component:Scatter},{profile:profile.profitLoss,component:ProfitLoss},
];
