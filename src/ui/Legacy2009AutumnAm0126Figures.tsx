import { useId, type ReactNode } from 'react';
import { bitLabel, legacy2009AutumnAm0126Figures, profiles, stripeRows } from '../core/generators/legacy-2009-autumn-am-01-26-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };

function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId();
  const profile = profiles[kind];
  const alt = legacy2009AutumnAm0126Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4} fontSize={15}>{children}</g>
      </svg>
    </div>
  </figure>;
}

function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle">{children}</text>;
}

function Striping(props: BookletFigureProps) {
  const rows = stripeRows(props.values[0]);
  const disks = rows[0].length;
  const width = 92 * disks;
  const controller = width / 2;
  const x = (disk: number) => 46 + 92 * disk;
  const rowHeight = 30;
  const top = 80;
  return <Drawing {...props} kind="striping" width={width} height={top + rowHeight * rows.length + 52}>
    <rect x={x(0) - 28} y={10} width={x(disks - 1) - x(0) + 56} height={30}/>
    <Label x={controller} y={31}>制御装置</Label>
    {rows[0].map((_, disk) => <g key={disk} data-disk={disk + 1}>
      <path d={`M${x(disk)} 40V${top}`}/>
      <rect x={x(disk) - 28} y={top} width={56} height={rowHeight * rows.length}/>
      {rows.map((row, i) => {
        const y = top + i * rowHeight;
        return <g key={i}>
          {i > 0 && <path d={`M${x(disk) - 28} ${y}H${x(disk) + 28}`}/>}
          {disk < disks - 1 && <path strokeDasharray="4 4" d={`M${x(disk) + 28} ${y}H${x(disk + 1) - 28}`}/>}
          <Label x={x(disk)} y={y + 20}>{bitLabel(row[disk])}</Label>
        </g>;
      })}
      {disk < disks - 1 && <path strokeDasharray="4 4"
        d={`M${x(disk) + 28} ${top + rowHeight * rows.length}H${x(disk + 1) - 28}`}/>}
      <Label x={x(disk)} y={top + rowHeight * rows.length + 20}>データ</Label>
      <Label x={x(disk)} y={top + rowHeight * rows.length + 40}>{'ディスク' + (disk + 1)}</Label>
    </g>)}
  </Drawing>;
}

function Availability(props: BookletFigureProps) {
  return <Drawing {...props} kind="availability" width={328} height={137}>
    <path d="M18 68H52V37H93M52 68V100H93M151 37H191V100H151M191 68H218M276 68H310"/>
    <rect x={93} y={21} width={58} height={32}/><Label x={122} y={42}>A</Label>
    <rect x={93} y={84} width={58} height={32}/><Label x={122} y={105}>B</Label>
    <rect x={218} y={52} width={58} height={32}/><Label x={247} y={73}>C</Label>
  </Drawing>;
}

function Directory(props: BookletFigureProps) {
  const nodes = [
    ['ルート', 180, 26], ['A', 104, 88], ['B', 260, 88], ['A', 70, 146], ['B', 137, 146],
    ['A', 227, 146], ['B', 293, 146], ['A', 37, 204], ['A', 105, 204], ['B', 171, 204],
  ] as const;
  const branches = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 8], [4, 9]];
  return <Drawing {...props} kind="directory" width={330} height={220}>
    {branches.map(([parent, child]) => <path key={child} d={`M${nodes[parent][1]} ${nodes[parent][2] + 5}L${nodes[child][1]} ${nodes[child][2] - 15}`}/>)}
    {nodes.map(([label, x, y]) => <Label key={x + '-' + y} x={x} y={y}>{label}</Label>)}
  </Drawing>;
}

function Gate(props: BookletFigureProps) {
  return <Drawing {...props} kind="gate" width={277} height={106}>
    <rect x={88} y={14} width={101} height={78}/>
    <path d="M41 36H88M41 69H88M189 53H236"/>
    <Label x={26} y={42}>A</Label><Label x={26} y={75}>B</Label><Label x={251} y={59}>X</Label>
  </Drawing>;
}

function Adder(props: BookletFigureProps) {
  return <Drawing {...props} kind="adder" width={277} height={136}>
    <rect x={87} y={12} width={103} height={111}/>
    <Label x={139} y={73}>全加算器</Label>
    <path d="M41 36H87M41 68H87M41 100H87"/>
    <path d="M190 45H236M190 91H236"/>
    <Label x={26} y={42}>x</Label><Label x={26} y={74}>y</Label><Label x={26} y={106}>z</Label>
    <Label x={251} y={51}>c</Label><Label x={251} y={97}>s</Label>
  </Drawing>;
}

export const legacy2009AutumnAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.striping, component: Striping }, { profile: profiles.availability, component: Availability },
  { profile: profiles.directory, component: Directory }, { profile: profiles.gate, component: Gate },
  { profile: profiles.adder, component: Adder },
];
