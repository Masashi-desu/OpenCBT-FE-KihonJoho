import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  autumn2016AddressProfile, autumn2017LogicProfile,
  legacy2015SpringAm0126Figures, spring2015Am0126Profiles as profiles, spring2015AmAddressCases, spring2015AmDiskColumns,
} from '../core/generators/legacy-2015-spring-am-01-26-figures';
import { Legacy2016AutumnAm0140Figures } from './Legacy2016AutumnAm0140Figures';
import { Legacy2017AutumnDataFigure } from './Legacy2017AutumnDataFigures';

function Drawing({ profile, values, caption, width, height, children }: BookletFigureProps & {
  profile: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  const def = legacy2015SpringAm0126Figures.find(figure => figure.profile === profile)!;
  def.validate(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-description'}>{def.alt(values)}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.3"/>
        </marker></defs>
        <g aria-hidden="true" stroke="currentColor" fill="none" strokeWidth="1.5">{children('url(#' + id + '-arrow)')}</g>
      </svg>
    </div>
  </figure>;
}

function Text({ x, y, children, align = 'middle' }: {
  x: number; y: number; children: ReactNode; align?: 'middle' | 'start';
}) {
  return <text x={x} y={y} textAnchor={align} fontSize="18" stroke="none" fill="currentColor">{children}</text>;
}

function Disks(props: BookletFigureProps) {
  return <Drawing {...props} profile={profiles.disks} width={552} height={263}>{() => <>
    <rect x="24" y="16" width="504" height="34"/>
    <Text x={276} y={39}>制御装置</Text>
    {spring2015AmDiskColumns(props.values[0]).map((column,i) => {
      const x=24+i*134;
      return <g key={x} data-disk={i+1}>
        <path d={`M${x+51} 50V81`}/>
        <rect x={x} y="81" width="102" height="136"/>
        {[1,2,3].map(j=><path key={j} d={`M${x} ${81+34*j}H${x+102}`}/>)}
        {i<3&&[0,1,2,3,4].map(j=><path key={j} d={`M${x+104} ${81+34*j}H${x+132}`} strokeDasharray="2 3"/>)}
        {column.map((bit,row)=><g key={row} data-disk-bit={bit}>
          <Text x={x+51} y={104+34*row}>b<tspan fontSize="13" baselineShift="sub">{bit}</tspan></Text>
        </g>)}
        <Text x={x+51} y={235}>データ</Text>
        <Text x={x+51} y={255}>ディスク{i+1}</Text>
      </g>;
    })}
  </>}</Drawing>;
}

const curve = [
  'M66 157C105 156 154 146 188 122C211 105 220 66 223 19',
  'M66 151L222 20',
  'M66 159C114 98 157 32 222 23',
  'M66 142H222',
];
function Response(props: BookletFigureProps) {
  const index = props.values[0];
  return <Drawing {...props} profile={profiles.curves} width={346} height={218}>{arrow => <>
    <path d="M58 179V15" markerEnd={arrow}/><path d="M58 179H253" markerEnd={arrow}/>
    <path d="M229 20V179" strokeDasharray="3 4"/>
    <path d={curve[index]} data-response-curve={index} strokeWidth="2"/>
    {Array.from('平均応答時間',(character,i)=><Text key={i} x={33} y={37+18*i}>{character}</Text>)}
    <Text x={58} y={203}>0</Text><Text x={229} y={203}>1</Text>
    <Text x={246} y={204} align="start">CPU使用率</Text>
  </>}</Drawing>;
}

function Logic(props: BookletFigureProps) {
  if (props.values[0] === 1 && props.values[1] === 4) {
    return <Drawing {...props} profile={profiles.logic} width={235} height={47}>{() =>
      <Text x={14} y={30} align="start">X＝A＋B</Text>
    }</Drawing>;
  }
  return <Legacy2017AutumnDataFigure {...props} profile={autumn2017LogicProfile}/>;
}

export const legacy2015SpringAm0126Renderers: BookletFigureRenderer[] = [
  { profile: profiles.memory, component: ({ values: [index], caption }) =>
    <Legacy2016AutumnAm0140Figures values={[...spring2015AmAddressCases[index]]} caption={caption} profile={autumn2016AddressProfile}/> },
  { profile: profiles.disks, component: Disks },
  { profile: profiles.curves, component: Response },
  { profile: profiles.logic, component: Logic },
];
