import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawingAlt, profile, type FigureName } from '../core/generators/legacy-2007-spring-pm-06-09-figures';
import { bitExamples, boardCases, boardInstruction, shownSquares } from '../core/generators/legacy-2007-spring-pm-06-09-model';

type Props = BookletFigureProps & { name: FigureName };
const canvas: CSSProperties = { width: 'max-content', fontSize: 'calc(1em * var(--image-scale, 1))', marginInline: 'auto', color: 'var(--diagram-ink)' };
const table: CSSProperties = { borderCollapse: 'collapse' };
const cell: CSSProperties = { border: '1px solid currentColor', padding: '.42em .75em', textAlign: 'center', fontWeight: 'normal' };
const mono: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', whiteSpace: 'pre', margin: 0 };

function Frame({ name, caption, values, children }: Props & { children: ReactNode }) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption}
    aria-description={drawingAlt(name, values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <div style={canvas}>{children}</div>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
const coordinates = [[48,267],[149,267],[251,267],[355,267],[455,267],
  [455,174],[355,174],[251,174],[149,174],[48,112],[251,63],[355,63],[455,63]] as const;
function Board(props: Props) {
  const id = useId() + '-arrow';
  const index = props.values[0], { figures } = boardCases[index];
  const coordinate = (cell: number) => coordinates[shownSquares.findIndex(square => square === cell)];
  const link = 'url(#' + id + ')';
  return <Frame {...props}><svg role="img" aria-label={props.caption} viewBox="0 0 510 303"
    style={{ width: '33em', maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
    <defs><marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 1 8 5 0 9" stroke="currentColor" fill="none" strokeWidth="1.5" />
    </marker></defs>
    <g fill="none" stroke="currentColor" strokeWidth="1.6">
      {shownSquares.slice(1).map((square, i) => {
        const prior = shownSquares[i], [x1,y1] = coordinate(prior), [x2,y2] = coordinate(square);
        const dx = x2-x1, dy = y2-y1;
        const pad = Math.min(dx === 0 ? Infinity : 41 / Math.abs(dx), dy === 0 ? Infinity : 21 / Math.abs(dy));
        return <line key={square} x1={x1+pad*dx} y1={y1+pad*dy} x2={x2-pad*dx} y2={y2-pad*dy}
          markerEnd={link} strokeDasharray={prior === 9 ? '4 5' : undefined} />;
      })}
      {shownSquares.map(square => {
        const [x,y] = coordinate(square);
        return <g key={square}><rect x={x-40} y={y-19} width="80" height="38" />
          {(square === 0 || square === 23) && <rect x={x-37} y={y-16} width="74" height="32" />}</g>;
      })}
      {figures.map((square,i) => {
        const [x,y] = coordinate(square), px=x-27, py=y-19;
        return <path key={i} d={`M${px-7} ${py} l3 -7 h8 l3 7 M${px} ${py-7} v-25 l18 4 -18 5`} />;
      })}
    </g>
    <g fill="currentColor" textAnchor="middle" fontSize="14">
      {shownSquares.map(square => {
        const [x,y]=coordinate(square), note=boardInstruction(index,square);
        return <g key={square}><text x={x} y={y+(note?-2:5)}>{square}</text>{note&&<text x={x} y={y+14}>{note}</text>}</g>;
      })}
      <text x="48" y="238">ふりだし</text><text x="455" y="31">上がり</text>
      {figures.map((square,i) => {
        const [x,y]=coordinate(square);
        return <text key={i} x={x+13} y={y-49} fontSize="12">プレーヤ{i+1}の駒</text>;
      })}
    </g>
  </svg></Frame>;
}
function RecordFormat(props: Props) {
  return <Frame {...props}><table style={table} aria-label={props.caption}><thead><tr>
    <th scope="col" style={cell}>地区コード<br />6けた</th><th scope="col" style={cell}>候補者名<br />20けた</th>
    <th scope="col" style={cell}>得票数<br />9けた</th>
  </tr></thead></table></Frame>;
}
function Output(props: Props) {
  return <Frame {...props}><pre style={{ ...mono, border: '1px solid currentColor', padding: '.55em .7em' }}>
    <code>{drawingAlt(props.name, props.values[0])}</code>
  </pre></Frame>;
}
function Bits(props: Props) {
  const sample=bitExamples(props.values[0]), marked=props.name==='9-asymmetric';
  const bits=marked?sample.asymmetric:sample.symmetric;
  return <Frame {...props}><div style={{ display:'grid',gridTemplateColumns:'repeat(16, 1.3em)',fontFamily:mono.fontFamily }}>
    {[...bits].map((bit,i)=><span key={i} style={{padding:'.25em .35em',borderBlock:'1px solid currentColor',
      ...(i===0?{borderInlineStart:'1px solid currentColor'}:{}),
      ...(i===7?{borderInlineEnd:'1px dashed currentColor'}:{}),
      ...(i===15?{borderInlineEnd:'1px solid currentColor'}:{})}}>{bit}</span>)}
    {marked && [...bits].map((_,i)=><span key={i}>{sample.markers.includes(i)?'▲':''}</span>)}
  </div></Frame>;
}
const components = {
  '6-course': Board,'7-record': RecordFormat,'7-output': Output,'8-output': Output,'9-symmetric': Bits,'9-asymmetric': Bits,
} satisfies Record<FigureName,(props:Props)=>ReactNode>;
export const legacy2007SpringPm0609FigureRenderers: readonly BookletFigureRenderer[] = (Object.keys(components) as FigureName[])
  .map(name=>{ const Component=components[name];return {profile:profile(name),component:props=><Component {...props} name={name}/>}; });
