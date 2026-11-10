import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  autumn2013Am0126Profiles, flowTerms, legacy2013AutumnAm0126Figures, logicalGates, vennRegions,
} from '../core/generators/legacy-2013-autumn-am-01-26-figures';

function Figure({ profile, caption, values, width, height, children }: BookletFigureProps & {
  profile: string; width: number; height: number; children: (id: string) => ReactNode;
}) {
  const id = useId(), definition = legacy2013AutumnAm0126Figures.find(item => item.profile === profile)!;
  definition.validate(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        data-source-figure={profile} style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{definition.alt(values)}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} fontSize={14}>
          {children(id)}
        </g>
      </svg>
    </div>
  </figure>;
}

function Text({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}

const vennCircles = [[100, 48], [78, 78], [122, 78]] as const;
const vennLabels = [[100, 42], [72, 82], [128, 82]] as const;

function Venn(props: BookletFigureProps) {
  const regions = vennRegions[props.values[0]];
  const radius = 29;
  return <Figure {...props} profile={autumn2013Am0126Profiles.venn} width={200} height={132}>{id => {
    const clip = (index: number, included: string) => id + '-venn-' + index + '-' + included;
    return <>
      <defs>
        <pattern id={id + '-shade'} width={4} height={4} patternUnits="userSpaceOnUse">
          <path d="M-1 1L1 -1M0 4L4 0M3 5L5 3" stroke="currentColor" strokeOpacity={0.65} strokeWidth={0.8}/>
        </pattern>
        {vennCircles.map(([x, y], i) => <clipPath key={i} id={clip(i, '1')}>
          <circle cx={x} cy={y} r={radius}/>
        </clipPath>)}
        {vennCircles.map(([x, y], i) => <clipPath key={i} id={clip(i, '0')}>
          <path clipRule="evenodd" d={'M8 8H192V124H8Z M' + (x - radius) + ' ' + y +
            'a' + radius + ' ' + radius + ' 0 1 0 ' + (radius * 2) + ' 0a' + radius + ' ' + radius + ' 0 1 0 ' + (-radius * 2) + ' 0z'}/>
        </clipPath>)}
      </defs>
      <rect x={8} y={8} width={184} height={116} fill="var(--diagram-surface)"/>
      {regions.map(region => <g key={region} clipPath={'url(#' + clip(0, region[0]) + ')'}>
        <g clipPath={'url(#' + clip(1, region[1]) + ')'}>
          <rect x={8} y={8} width={184} height={116} stroke="none" data-venn-region={region}
            clipPath={'url(#' + clip(2, region[2]) + ')'} fill={'url(#' + id + '-shade)'}/>
        </g>
      </g>)}
      {vennCircles.map(([x, y], i) => <g key={i}>
        <circle cx={x} cy={y} r={radius}/><Text x={vennLabels[i][0]} y={vennLabels[i][1]}>{'ABC'[i]}</Text>
      </g>)}
    </>;
  }}</Figure>;
}

function Flow(props: BookletFigureProps) {
  return <Figure {...props} profile={autumn2013Am0126Profiles.flow} width={555} height={315}>{id => {
    const arrow = 'url(#' + id + '-join)';
    return <>
      <defs><marker id={id + '-join'} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={8} markerHeight={8} orient="auto">
        <path d="M1 1L8 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.4}/>
      </marker></defs>
      <g data-flow-diagram="left">
        <path d="M109 9V38M109 106V131M109 171V218"/>
        <path d="M17 72L109 38L201 72L109 106Z" fill="var(--diagram-surface)"/>
        <Text x={109} y={77}>{flowTerms[props.values[0]]}</Text>
        <path d="M201 72H227V192H109" markerEnd={arrow} data-flow-branch="left-no-skip"/>
        <Text x={213} y={66}>No</Text><Text x={126} y={122}>Yes</Text>
        <rect x={17} y={131} width={184} height={40} fill="var(--diagram-surface)" data-flow-process="left"/>
        <Text x={109} y={156}>処理</Text>
      </g>
      <g data-flow-diagram="right">
        <path d="M401 9V38M401 106V138M401 204V238M401 278V305"/>
        <path d="M312 72L401 38L490 72L401 106Z" fill="var(--diagram-surface)"/><Text x={401} y={77}>P</Text>
        <path d="M312 171L401 138L490 171L401 204Z" fill="var(--diagram-surface)"/><Text x={401} y={176}>Q</Text>
        <path d="M490 72H526V217H401" markerEnd={arrow} data-flow-branch="a-shortcut-to-process"/>
        <path d="M312 171H268V289H401" markerEnd={arrow} data-flow-branch="b-bypass-process"/>
        <rect x={488} y={44} width={33} height={23} fill="var(--diagram-surface)"/><Text x={504} y={60}>a</Text>
        <rect x={270} y={143} width={33} height={23} fill="var(--diagram-surface)"/><Text x={286} y={159}>b</Text>
        <rect x={312} y={238} width={178} height={40} fill="var(--diagram-surface)" data-flow-process="right"/>
        <Text x={401} y={263}>処理</Text>
      </g>
    </>;
  }}</Figure>;
}

function Gate(props: BookletFigureProps) {
  const gate = logicalGates[props.values[0]];
  const curved = gate === 'OR' || gate === 'NOR', inverted = gate === 'NAND' || gate === 'NOR';
  return <Figure {...props} profile={autumn2013Am0126Profiles.gate} width={160} height={62}>{() =>
    <g data-gate-kind={gate}>
      <Text x={18} y={25}>A</Text><Text x={18} y={43}>B</Text><Text x={144} y={34}>X</Text>
      <path d={'M28 21H' + (curved ? 56 : 51) + 'M28 39H' + (curved ? 56 : 51) +
        'M' + (inverted ? 102 : 95) + ' 30H134'}/>
      <path d={curved ? 'M51 11Q78 9 95 30Q78 51 51 49Q63 30 51 11Z' : 'M51 11H76A19 19 0 0 1 76 49H51Z'}
        fill="var(--diagram-surface)"/>
      {inverted && <circle cx={98.5} cy={30} r={3.5} fill="var(--diagram-surface)" data-output-inversion="true"/>}
    </g>
  }</Figure>;
}

export const legacy2013AutumnAm0126FigureRenderers: BookletFigureRenderer[] = [
  { profile: autumn2013Am0126Profiles.venn, component: Venn },
  { profile: autumn2013Am0126Profiles.flow, component: Flow },
  { profile: autumn2013Am0126Profiles.gate, component: Gate },
];
