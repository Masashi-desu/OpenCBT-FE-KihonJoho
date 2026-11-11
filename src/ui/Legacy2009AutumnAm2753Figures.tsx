import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawingAlt, encryptionCases, profile, projectCases } from '../core/generators/legacy-2009-autumn-am-27-53-figures';

type DrawingId = Parameters<typeof drawingAlt>[0];

function Figure({ id, values, caption, width, height, children }: BookletFigureProps & {
  id: DrawingId;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
}) {
  const base = useId();
  const title = base + '-title';
  const description = base + '-description';
  const arrow = base + '-arrow';
  const alt = drawingAlt(id, values[0]);
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={title} aria-describedby={description}
        style={{ color: 'var(--diagram-ink)', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none', height: 'auto', display: 'block', marginInline: 'auto' }}>
        <title id={title}>{caption}</title>
        <desc id={description}>{alt}</desc>
        <defs><marker id={arrow} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M1 1L8 4.5L1 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker></defs>
        <g fontSize="16">{children('url(#' + arrow + ')')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle">{children}</text>;
}

function Encryption(props: BookletFigureProps) {
  const { sender, receiver, message, ciphertext } = encryptionCases[props.values[0]];
  return <Figure {...props} id="42-encryption" width={800} height={275}>{arrow => <>
    <Label x={150} y={27}>{sender + 'さん'}</Label>
    <Label x={650} y={27}>{receiver + 'さん'}</Label>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M43 46H270L257 91H30ZM543 46H770L757 91H530Z" />
      <rect x="33" y="120" width="234" height="56" />
      <rect x="533" y="120" width="234" height="56" />
      <path d="M43 205H270L257 250H30ZM543 205H770L757 250H530Z" />
      <ellipse cx="400" cy="227" rx="83" ry="25" />
      <g markerEnd={arrow}>
        <path d="M150 91V120" /><path d="M150 176V205" /><path d="M264 227H317" />
        <path d="M483 227H537" /><path d="M650 205V176" /><path d="M650 120V91" />
      </g>
    </g>
    <Label x={150} y={74}>{'“' + message + '”'}</Label>
    <Label x={650} y={74}>{'“' + message + '”'}</Label>
    <Label x={150} y={154}>鍵Kによって暗号化</Label>
    <Label x={650} y={144}>{receiver + 'さんの秘密鍵'}</Label>
    <Label x={650} y={165}>によって復号</Label>
    <Label x={150} y={233}>{'“' + ciphertext + '”'}</Label>
    <Label x={650} y={233}>{'“' + ciphertext + '”'}</Label>
    <Label x={400} y={233}>ネットワーク</Label>
  </>}</Figure>;
}

const projectNodes = [
  [52, 147], [174, 147], [306, 147], [442, 147], [578, 147], [706, 147],
  [244, 222], [374, 71],
] as const;

const jobs = [
  { name: 'A', path: 'M68 147H158', label: [113, 147] },
  { name: 'B', path: 'M190 147H290', label: [240, 147] },
  { name: 'C', path: 'M322 147H426', label: [374, 147] },
  { name: 'D', path: 'M458 147H562', label: [510, 147] },
  { name: 'E', path: 'M185 159L233 210', label: [194, 198] },
  { name: 'F', path: 'M174 131V26H442V131', label: [308, 26] },
  { name: 'G', path: 'M317 135L363 83', label: [324, 101] },
  { name: 'H', path: 'M306 163V257H578V163', label: [445, 257] },
  { name: 'I', path: 'M594 147H690', label: [642, 147] },
] as const;

function Project(props: BookletFigureProps) {
  const days = projectCases[props.values[0]];
  return <Figure {...props} id="51-project" width={764} height={337}>{arrow => <>
    {jobs.map(({ name, path, label: [x, y] }, index) =>
      <g key={name} data-work={name}>
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow} />
        <Label x={x} y={y - 8}>{name}</Label>
        <Label x={x} y={y + 20}>{days[index]}</Label>
      </g>)}
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <g strokeDasharray="5 4" markerEnd={arrow}>
        <path d="M254 210L296 159" />
        <path d="M385 83L431 135" />
        <path d="M464 308H533" />
      </g>
      {projectNodes.map(([x, y]) => <circle key={x} cx={x} cy={y} r="16" />)}
      <circle cx="215" cy="308" r="12" /><circle cx="359" cy="308" r="12" />
      <path d="M227 308H347" markerEnd={arrow} />
    </g>
    <Label x={52} y={188}>開始</Label>
    <Label x={706} y={188}>終了</Label>
    <Label x={170} y={314}>凡例</Label>
    <Label x={287} y={299}>作業名</Label>
    <Label x={287} y={329}>作業日数</Label>
    <Label x={602} y={314}>ダミー作業</Label>
  </>}</Figure>;
}

export const legacy2009AutumnAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profile('42-encryption'), component: Encryption },
  { profile: profile('51-project'), component: Project },
];
