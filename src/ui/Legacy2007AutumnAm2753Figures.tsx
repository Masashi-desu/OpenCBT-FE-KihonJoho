import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { chartCases, chartLabels, drawingAlt, profile, projectActivities, projectCases,
  projectEdges } from '../core/generators/legacy-2007-autumn-am-27-53-figures';

function Frame({ caption, alt, width, height, children }: { caption: string; alt: string; width: number; height: number; children: ReactNode }) {
  const title = useId();
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
    <svg role="img" aria-labelledby={title} aria-describedby={title + '-description'} viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', width: `max(calc(${width}px * var(--image-scale, 1)), 100%)`, maxWidth: 'none',
        height: 'auto', color: 'var(--diagram-ink)' }}>
      <title id={title}>{caption}</title><desc id={title + '-description'}>{alt}</desc>
      {children}
    </svg>
  </div></figure>;
}

function Directory({ caption }: BookletFigureProps) {
  const levels = Array.from({ length: 4 }, (_, depth) => Array.from({ length: 2 ** depth }, (_, index) => ({
    x: (index + 0.5) * 512 / 2 ** depth, y: 29 + 53 * depth, label: depth === 0 ? 'ルート' : index % 2 === 0 ? 'A' : 'B',
  })));
  return <Frame caption={caption} alt={drawingAlt('directory', 0)} width={512} height={211}>
    <g stroke="currentColor" strokeWidth="1.55">
      {levels.slice(1).map((level, depth) => level.map((node, index) => {
        const root = levels[depth][Math.floor(index / 2)];
        return <line key={`${depth}-${index}`} x1={root.x} y1={root.y + 7} x2={node.x} y2={node.y - 15} />;
      }))}
    </g>
    <g fill="currentColor" fontSize="16" textAnchor="middle">
      {levels.map((level, depth) => level.map((node, index) =>
        <text key={`${depth}-${index}`} x={node.x} y={node.y}>{node.label}</text>))}
    </g>
  </Frame>;
}

function Availability({ caption }: BookletFigureProps) {
  return <Frame caption={caption} alt={drawingAlt('availability', 0)} width={490} height={201}>
    <g fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M24 100H110M110 53V147M110 53H140M110 147H140M226 53H256M226 147H256M256 53V147M256 100H286M370 100H457" />
      <rect x="140" y="30" width="86" height="46" /><rect x="140" y="124" width="86" height="46" />
      <rect x="286" y="77" width="84" height="46" />
    </g>
    <g fill="currentColor" fontSize="19" textAnchor="middle" dominantBaseline="middle">
      <text x="183" y="53">A</text><text x="183" y="147">B</text><text x="328" y="100">C</text>
    </g>
  </Frame>;
}

function Tip({ id }: { id: string }) {
  return <defs><marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8"
    orient="auto"><path d="M0 1 8 5 0 9" fill="none" stroke="currentColor" strokeWidth="1.6" /></marker></defs>;
}
const link = (id: string) => `url(#${id})`;
function Chart({ caption, values }: BookletFigureProps) {
  const tip = useId();
  const { found, pending, open } = chartCases[values[0]];
  const paths = [found, pending, open];
  const x = (index: number) => 54 + index * 56;
  const y = (value: number) => 274 - value * 2.25;
  return <Frame caption={caption} alt={drawingAlt('control-chart', values[0])} width={667} height={321}>
    <Tip id={tip} />
    <g fill="none" stroke="currentColor" strokeWidth="1.55">
      <path d="M54 274H618" markerEnd={link(tip)} /><path d="M54 274V24" markerEnd={link(tip)} />
      <path d="M620 274V24" markerEnd={link(tip)} />
      {paths.map((path, index) => <polyline key={chartLabels[index]} data-series={chartLabels[index]}
        points={path.map((point, index) => [x(index), y(point)].join(',')).join(' ')} />)}
    </g>
    <g fill="currentColor" fontSize="16">
      <text x="28" y="109" style={{ writingMode: 'vertical-rl' }}>テスト項目数</text>
      <text x="645" y="109" style={{ writingMode: 'vertical-rl' }}>バグ数</text>
      <text x="581" y="299">時間</text>
      {paths.map((path, index) => <text key={chartLabels[index]} x="454" y={y(path.at(-1)!) - (index === 2 ? 7 : 2)}>{chartLabels[index]}</text>)}
    </g>
  </Frame>;
}

const projectNodes = [[36, 118], [150, 118], [264, 54], [264, 182], [420, 54], [420, 182], [548, 118]] as const;
const labelOffsets = [[0, -11], [-17, -7], [-7, -10], [-10, -5], [-6, -11], [-6, -11], [13, -13], [2, -12]] as const;
function ArrowDiagram({ caption, values }: BookletFigureProps) {
  const tip = useId();
  const { days } = projectCases[values[0]];
  return <Frame caption={caption} alt={drawingAlt('arrow-diagram', values[0])} width={622} height={311}>
    <Tip id={tip} />
    <g fill="none" stroke="currentColor" strokeWidth="1.55">
      {projectEdges.map(([start, end, number]) => {
        const [x1, y1] = projectNodes[start], [x2, y2] = projectNodes[end];
        const length = Math.hypot(x2 - x1, y2 - y1);
        const fraction = 13 / length, a = (x2 - x1) * fraction, b = (y2 - y1) * fraction;
        return <line key={`${start}-${end}`} data-activity={number === -1 ? 'ダミー' : projectActivities[number]}
          x1={x1 + a} y1={y1 + b} x2={x2 - a} y2={y2 - b} markerEnd={link(tip)} strokeDasharray={number < 0 ? '4 4' : undefined} />;
      })}
      {projectNodes.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="13" />)}
      <circle cx="432" cy="244" r="10" /><circle cx="537" cy="244" r="10" />
      <path d="M442 244H527" markerEnd={link(tip)} />
      <path d="M422 278H473" markerEnd={link(tip)} strokeDasharray="4 4" />
    </g>
    <g fill="currentColor" fontSize="15" textAnchor="middle">
      {projectEdges.map(([start, end, number]) => {
        if (number === -1) return null;
        const [x1, y1] = projectNodes[start], [x2, y2] = projectNodes[end];
        const [dx, dy] = labelOffsets[number];
        const x = (x1 + x2) / 2, y = (y1 + y2) / 2, vertical = x1 === x2;
        return <g key={number}><text x={x + dx} y={y + dy}>{projectActivities[number]}</text>
          <text x={vertical ? x - dx + 6 : x + dx} y={vertical ? y + dy : y + dy + (number === 1 || number === 6 ? 36 : 26)}>{days[number]}</text></g>;
      })}
      <text x="432" y="222">凡例</text><text x="482" y="236">作業名</text>
      <text x="482" y="261">標準日数</text><text x="532" y="283">ダミー作業</text>
    </g>
  </Frame>;
}

export const legacy2007AutumnAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profile('directory'), component: Directory },
  { profile: profile('availability'), component: Availability },
  { profile: profile('control-chart'), component: Chart },
  { profile: profile('arrow-diagram'), component: ArrowDiagram },
];
