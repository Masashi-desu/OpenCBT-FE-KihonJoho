import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  dummy, multiplicityAt, orderAlt, orderFields, profiles2011AutumnAm2753 as profiles, projectAlt, projectAt, projectEdges, relationAlt,
} from '../core/generators/legacy-2011-autumn-am-27-53-figures';

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
          <marker id={id + '-arrow'} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto-start-reverse" markerUnits="strokeWidth">
            <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="currentColor"/>
          </marker>
        </defs>
        {children(`url(#${id}-arrow)`)}
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function OrderRecord({values,caption}:BookletFigureProps) {
  return <Panel caption={caption} description={orderAlt(values)} width={623} height={100}>
    {()=> <g aria-hidden="true" fill="currentColor" fontSize="17">
      <text x="22" y="24">注文データ</text>
      {orderFields.map(([name,type],i)=> <g key={name} transform={`translate(${15+i*118} 30)`}>
        <rect width="118" height="56" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <text x="59" y="22" textAnchor="middle">{name}</text>
        <text x="59" y="43" textAnchor="middle">{'（'+type+'）'}</text>
      </g>)}
    </g>}
  </Panel>;
}

function Multiplicity({values,caption}:BookletFigureProps) {
  const [left,right]=multiplicityAt(values);
  return <Panel caption={caption} description={relationAlt(values)} width={410} height={95}>
    {()=> <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="32" y="20" width="99" height="44"/>
        <rect x="279" y="20" width="99" height="44"/>
        <path d="M131 42H279"/>
      </g>
      <g fill="currentColor" fontSize="17">
        <text x="81.5" y="48" textAnchor="middle">納品</text>
        <text x="328.5" y="48" textAnchor="middle">請求</text>
        <text x="140" y="64" textAnchor="start">{left}</text>
        <text x="270" y="64" textAnchor="end">{right}</text>
      </g>
    </g>}
  </Panel>;
}

const nodes = [[42,137],[147,57],[170,221],[313,57],[334,221],[447,137]] as const;
const labels = [
  {name:[84,85],days:[102,118]}, {name:[111,151],days:[89,183]},
  {name:[172,117],days:[145,140]}, {name:[230,42],days:[230,85]},
  {name:[245,120],days:[230,153]}, {name:[251,208],days:[251,246]},
  {name:[391,82],days:[371,116]}, {name:[386,161],days:[405,193]},
] as const;
const radius=19;

function arrowBetween(from:number,to:number) {
  const [x,y]=nodes[from-1], [endX,endY]=nodes[to-1];
  const distance=Math.hypot(endX-x,endY-y);
  const dx=(endX-x)/distance, dy=(endY-y)/distance;
  return `M${x+dx*radius} ${y+dy*radius}L${endX-dx*(radius+1)} ${endY-dy*(radius+1)}`;
}

function EarliestNode({values,caption}:BookletFigureProps) {
  const days=projectAt(values);
  return <Panel caption={caption} description={projectAlt(values)} width={707} height={270}>
    {arrow=> <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {nodes.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={radius}/>)}
        {projectEdges.map(({label,from,to})=><path key={label} d={arrowBetween(from,to)} markerEnd={arrow}/>)}
        <path d={arrowBetween(dummy.from,dummy.to)} strokeDasharray="5 4" markerEnd={arrow}/>
        <circle cx="530" cy="181" r="15"/>
        <circle cx="665" cy="181" r="15"/>
        <path d="M545 181H649" markerEnd={arrow}/>
        <path d="M515 233H565" strokeDasharray="5 4" markerEnd={arrow}/>
      </g>
      <g fill="currentColor" fontSize="16" textAnchor="middle">
        {nodes.map(([x,y],i)=><text key={i} x={x} y={y+5}>{i+1}</text>)}
        {projectEdges.map(({label},i)=><g key={label}>
          <text x={labels[i].name[0]} y={labels[i].name[1]}>{label}</text>
          <text x={labels[i].days[0]} y={labels[i].days[1]}>{days[i]}</text>
        </g>)}
        <text x="534" y="151">凡例</text>
        <text x="597" y="172">作業名</text>
        <text x="597" y="205">所要日数</text>
        <text x="629" y="239">：ダミー作業</text>
      </g>
    </g>}
  </Panel>;
}

export const legacy2011AutumnAm2753FigureRenderers:readonly BookletFigureRenderer[]=[
  {profile:profiles.order,component:OrderRecord},
  {profile:profiles.relation,component:Multiplicity},
  {profile:profiles.project,component:EarliestNode},
];
