import { useId } from 'react';
import {
  spring2015Am54Alt, spring2015Am54Durations, spring2015Am54Profile,
  spring2015Am5480Condition, spring2015Am64Profile,
} from '../core/generators/legacy-2015-spring-am-54-80-figures';
import { Legacy2017AutumnPlanningFigure } from './Legacy2017AutumnPlanningFigures';
import { legacy2017AutumnPlanningProfile } from '../core/generators/legacy-2017-autumn-planning-model';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

const nodes = [[24, 142], [134, 142], [244, 142], [354, 142], [464, 142], [574, 142], [189, 220], [291, 72]];
const activities = [
  { name: 'A', path: 'M38 142H119', label: [79, 138], days: [79, 158] },
  { name: 'B', path: 'M148 142H229', label: [189, 138], days: [189, 158] },
  { name: 'C', path: 'M258 142H339', label: [299, 138], days: [299, 158] },
  { name: 'D', path: 'M368 142H449', label: [409, 138], days: [409, 158] },
  { name: 'E', path: 'M142 154L180 208', label: [169, 166], days: [145, 193] },
  { name: 'F', path: 'M138 128L162 39H327L351 128', label: [244, 35], days: [244, 55] },
  { name: 'G', path: 'M252 130L282 84', label: [262, 98], days: [283, 119] },
  { name: 'H', path: 'M249 156L273 224H437L459 156', label: [354, 220], days: [354, 240] },
  { name: 'I', path: 'M478 142H559', label: [519, 138], days: [519, 158] },
];
const dummyPaths = ['M198 208L235 154', 'M301 82L344 132'];

function ArrowNetwork({ values, caption }: BookletFigureProps) {
  const arrow = useId();
  const durations = spring2015Am54Durations[spring2015Am5480Condition(values, spring2015Am54Durations.length)];
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption}>
      <svg viewBox="0 0 598 360" role="img" aria-labelledby={arrow + '-title'} aria-describedby={arrow + '-description'}
        style={{ display: 'block', width: 'calc(598px * var(--image-scale, 1))', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={arrow + '-title'}>{caption}</title>
        <desc id={arrow + '-description'}>{spring2015Am54Alt(values)}</desc>
        <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 1L7 4L0 7" stroke="currentColor" fill="none"/>
        </marker></defs>
        <g fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          {nodes.map(([cx, cy]) => <circle key={cx + '-' + cy} cx={cx} cy={cy} r="14"/>)}
          {activities.map(({ name, path }) => <path key={name} data-activity={name} d={path} markerEnd={'url(#' + arrow + ')'}/>)}
          {dummyPaths.map(path => <path key={path} data-dummy="true" d={path} strokeDasharray="5 4" markerEnd={'url(#' + arrow + ')'}/>)}
          <circle cx="466" cy="286" r="14"/><circle cx="574" cy="286" r="14"/>
          <path d="M480 286H559" markerEnd={'url(#' + arrow + ')'}/>
          <path d="M445 337H494" strokeDasharray="5 4" markerEnd={'url(#' + arrow + ')'}/>
        </g>
        <g fill="currentColor" textAnchor="middle" aria-hidden="true">
          {activities.map(({ name, label, days }, index) => <g key={name}>
            <text x={label[0]} y={label[1]}>{name}</text><text x={days[0]} y={days[1]}>{durations[index]}</text>
          </g>)}
          <text x="24" y="181">開始</text><text x="574" y="181">終了</text>
          <text x="466" y="252">凡例</text>
          <text x="520" y="280">作業名</text><text x="520" y="310">作業日数</text>
          <text x="548" y="342">：ダミー作業</text>
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2015SpringAm5480Renderers: BookletFigureRenderer[] = [
  { profile: spring2015Am54Profile, component: ArrowNetwork },
  { profile: spring2015Am64Profile, component: props => <Legacy2017AutumnPlanningFigure
    {...props} profile={legacy2017AutumnPlanningProfile}/> },
];
