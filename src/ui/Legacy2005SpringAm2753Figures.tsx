import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { defectFigure, entities, relationFigure, seriesLabels, type Entity, type Series } from '../core/generators/legacy-2005-spring-am-27-53-figures';

type SceneProps = {
  caption: string; alt: string; width: number; height: number;
  children: (arrow: string) => ReactNode;
};

function Scene({ caption, alt, width, height, children }: SceneProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        viewBox={'0 0 ' + width + ' ' + height}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <defs>
          <marker id={id + '-arrow'} viewBox="0 0 10 10" orient="auto-start-reverse" refX="9" refY="5" markerWidth="8" markerHeight="8">
            <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor"/>
          </marker>
        </defs>
        <g fill="currentColor" fontSize="16">{children('url(#' + id + '-arrow)')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const entityLocations: Record<Entity, [number, number]> = {
  product: [100, 230], supplier: [300, 230], orderLine: [100, 350],
  order: [300, 350], delivery: [500, 350], deliveryLine: [700, 350],
};

const forwardPaths: Record<string, string> = {
  'product:supplier': 'M 154 230 H 246',
  'supplier:product': 'M 246 230 H 154',
  'product:orderLine': 'M 100 248 V 332',
  'product:deliveryLine': 'M 100 212 V 185 H 700 V 332',
  'supplier:order': 'M 300 248 V 332',
  'supplier:delivery': 'M 354 230 H 500 V 332',
  'order:orderLine': 'M 246 350 H 154',
  'orderLine:order': 'M 154 350 H 246',
  'order:delivery': 'M 354 350 H 446',
  'delivery:deliveryLine': 'M 554 350 H 646',
  'orderLine:deliveryLine': 'M 100 368 V 395 H 700 V 368',
};

function Relations({ caption, values }: BookletFigureProps) {
  const { edges, alt } = relationFigure.panel(values);
  const legends = [
    ['エンティティAのデータ1個に対して，エンティティBのデータが',
      'n個（n≧0）対応し，エンティティBのデータ1個に対して，',
      'エンティティAのデータが1個対応する。'],
    ['エンティティAのデータ1個に対して，エンティティBのデータが',
      'n個（n≧0）対応し，エンティティBのデータ1個に対して，',
      'エンティティAのデータがm個（m≧0）対応する。'],
  ];
  return <Scene caption={caption} alt={alt} width={810} height={422}>
    {arrow => <>
      <text x="22" y="25">〔表記法〕</text>
      {legends.map((lines, row) => {
        const y = 64 + 67 * row;
        return <g key={row}>
          <rect x="46" y={y - 18} width="62" height="36" fill="none" stroke="currentColor"/>
          <rect x="190" y={y - 18} width="62" height="36" fill="none" stroke="currentColor"/>
          <text x="77" y={y + 6} textAnchor="middle">A</text><text x="221" y={y + 6} textAnchor="middle">B</text>
          <path d={'M 108 ' + y + ' H 190'} stroke="currentColor" markerStart={row ? arrow : undefined} markerEnd={arrow}/>
          {lines.map((text, line) => <text key={line} x="273" y={y - 16 + line * 20}>{text}</text>)}
        </g>;
      })}
      <text x="22" y="178">〔E-R図〕</text>
      {edges.map(({ from, to, twoWay }) => <path key={from + ':' + to} d={forwardPaths[from + ':' + to]}
        data-from={entities[from]} data-to={entities[to]} data-cardinality={twoWay ? 'many-many' : 'one-many'}
        fill="none" stroke="currentColor" strokeWidth="1.5" markerStart={twoWay ? arrow : undefined} markerEnd={arrow}/>)}
      {(Object.entries(entityLocations) as [Entity, [number, number]][]).map(([entity, [x, y]]) => <g key={entity}>
        <rect x={x - 54} y={y - 18} width="108" height="36" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <text x={x} y={y + 6} textAnchor="middle">{entities[entity]}</text>
      </g>)}
    </>}
  </Scene>;
}

function BugChart({ caption, values }: BookletFigureProps) {
  const { series, alt } = defectFigure.panel(values);
  const origin = 281;
  const labelY = (value: number, key: Series) => origin - value * 2.3 - (key === 'unresolved' ? 8 : 9);
  return <Scene caption={caption} alt={alt} width={683} height={321}>
    {arrow => <>
      <path d="M 93 281 V 37" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>
      <path d="M 93 281 H 635" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>
      <text x="632" y="308" textAnchor="end">時間</text>
      <text x="60" y="169" transform="rotate(-90 60 169)" textAnchor="middle">テスト項目数・バグ数</text>
      {(Object.keys(seriesLabels) as Series[]).map(key => {
        const points = series[key].map((value, i) => [115 + i * 53, origin - value * 2.3]);
        const path = points.slice(1).reduce((result, [x, y], index) => {
          const [previousX, previousY] = points[index], mid = (previousX + x) / 2;
          return result + ' C ' + mid + ' ' + previousY + ', ' + mid + ' ' + y + ', ' + x + ' ' + y;
        }, 'M ' + points[0].join(' '));
        const labelEarlier = key === 'untested' && series.untested.at(-1) === series.unresolved.at(-1);
        const labelValue = series[key].at(labelEarlier ? -3 : -1)!;
        return <g key={key}>
          <path d={path} data-series={key} data-counts={series[key].join(',')} fill="none" stroke="currentColor" strokeWidth="1.7"/>
          <text x={labelEarlier ? 395 : 494} y={labelY(labelValue, key)}>{seriesLabels[key]}</text>
        </g>;
      })}
    </>}
  </Scene>;
}

export const legacy2005SpringAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: relationFigure.profile, component: Relations },
  { profile: defectFigure.profile, component: BugChart },
];
