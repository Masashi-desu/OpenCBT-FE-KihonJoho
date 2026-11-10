import { createElement, useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  autumn2013Pm0508Drawings, autumn2013Pm0508Profile, autumn2013Pm5FlowLabels,
  autumn2013Pm7StockRows, autumn2013Pm8ExamplePlain, type Autumn2013Pm0508Drawing,
} from '../core/generators/legacy-2013-autumn-pm-05-08-figures';
import {
  autumn2013Pm5FlowEdges, autumn2013Pm5Tests, autumn2013Pm6DesignPlan, autumn2013Pm6ProgrammingPlan,
} from '../core/generators/legacy-2013-autumn-pm-05-08-model';
import { autumn2013Pm0508Banks } from '../core/generators/legacy-2013-autumn-pm-05-08-source';
import {
  autumn2013Pm8DecompressSignature, autumn2013Pm8DecompressHead,
  autumn2013Pm8Alpha, autumn2013Pm8DecompressTail,
} from '../core/generators/legacy-2013-autumn-pm-05-08-programs';

type FigureProps = BookletFigureProps & { id: Autumn2013Pm0508Drawing };
type SvgParts = { arrow: string; hatch: string };
function Drawing({ id, values, caption, width, height, children }: FigureProps & {
  width: number; height: number; children: (parts: SvgParts) => ReactNode;
}) {
  const uid = useId(), arrow = uid + '-arrow', hatch = uid + '-hatch';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg role="img" aria-labelledby={uid + '-title'} aria-describedby={uid + '-desc'} viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`,
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={uid + '-title'}>{caption}</title>
        <desc id={uid + '-desc'}>{autumn2013Pm0508Drawings[id].alt(values[0])}</desc>
        <defs>
          <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
          </marker>
          <pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M0 5L5 0" stroke="currentColor" opacity=".45"/>
          </pattern>
        </defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.25" fontSize="15">
          {children({ arrow: `url(#${arrow})`, hatch: `url(#${hatch})` })}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Text({ x, y, children, center = false }: { x: number; y: number; children: ReactNode; center?: boolean }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={center ? 'middle' : 'start'}>{children}</text>;
}

function Conditions(props: FigureProps) {
  return <Drawing {...props} width={460} height={108}>{() => <>
    <Text x={25} y={26}>例</Text>
    <Text x={126} y={26} center>（a＞b）</Text>
    <Text x={220} y={26} center>and</Text>
    <Text x={314} y={26} center>（a＜c）</Text>
    <path d="M85 32q0 7 10 7h20q9 0 11 6 2-6 11-6h20q10 0 10-7M273 32q0 7 10 7h20q9 0 11 6 2-6 11-6h20q10 0 10-7"/>
    <Text x={126} y={62} center>単独条件</Text><Text x={314} y={62} center>単独条件</Text>
    <path d="M85 69q0 7 10 7h112q10 0 13 6 3-6 13-6h112q10 0 10-7"/>
    <Text x={220} y={103} center>複数条件</Text>
  </>}</Drawing>;
}

const flowCoordinates: Readonly<Record<string, readonly [number, number]>> = {
  S: [225, 27], '1': [225, 79], '2': [225, 132], c: [225, 185],
  upper: [225, 238], middle: [225, 291], d: [290, 291],
  '7': [225, 344], e: [153, 344], left: [85, 344],
  f: [225, 397], '9': [225, 450], E: [339, 450],
};
const flowRoutes = [
  'M225 45v16', 'M225 97v17', 'M243 79h96v353', 'M225 150v17', 'M225 203v17', 'M207 185h-42v106h42',
  'M243 238h47v35', 'M225 256v17', 'M225 309v17', 'M290 309v35h-47',
  'M207 344h-36', 'M225 362v17', 'M225 415v17', 'M207 397h-54v-35', 'M135 344h-32',
  'M85 326V79h122', 'M243 450h78',
];

function Flow(props: FigureProps) {
  return <Drawing {...props} width={545} height={511}>{({ arrow, hatch }) => <>
    {autumn2013Pm5FlowEdges.map(([from, to], i) =>
      <path key={i} d={flowRoutes[i]} markerEnd={arrow} data-flow-edge={from + '→' + to}/>)}
    {Object.entries(flowCoordinates).map(([id, [x, y]]) => {
      const label = autumn2013Pm5FlowLabels[id], blank = /^[cdef]$/.test(id), shaded = label.startsWith('網掛け');
      return <g key={id} data-flow-node={id} data-flow-shaded={shaded || undefined}>
        <circle cx={x} cy={y} r="18" fill={shaded ? hatch : 'none'}/>
        {blank && <rect x={x - 13} y={y - 9} width="26" height="18"/>}
        {!shaded && <Text x={x} y={y + 5} center>{blank ? id : label}</Text>}
      </g>;
    })}
    <rect x="375" y="285" width="134" height="91"/>
    <Text x={386} y={306}>凡例</Text>
    <circle cx="400" cy="328" r="11"/><Text x={425} y={334}>ノード</Text>
    <path d="M413 351h-25" markerEnd={arrow}/><Text x={425} y={356}>エッジ</Text>
    <Text x={69} y={492}>注記　網掛けの部分は表示していない。</Text>
  </>}</Drawing>;
}

const lineCell = { border: '1px solid var(--diagram-ink)', padding: '0.3em 0.55em', textAlign: 'center' as const };
const tableStyle = {
  borderCollapse: 'collapse' as const, color: 'var(--diagram-ink)', marginInline: 'auto',
  minWidth: 'max-content', fontSize: 'calc(0.9em * var(--image-scale, 1))',
};
function ScrollFigure({ id, values, caption, children, visibleCaption = true }: FigureProps & {
  children: ReactNode; visibleCaption?: boolean;
}) {
  const alt = autumn2013Pm0508Drawings[id].alt(values[0]);
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={alt}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      {children}
    </div>
    <figcaption className={visibleCaption ? undefined : 'sr-only'}>{caption}</figcaption>
  </figure>;
}

function TestCases(props: FigureProps) {
  return <ScrollFigure {...props}><table style={tableStyle} aria-label={props.caption}>
    <thead><tr><th style={{ border: 'none' }}/><th scope="colgroup" colSpan={5} style={lineCell}>テストデータ</th></tr>
      <tr>{['変数', 'x', 'a', 'b', 'c', 'd'].map(name => <th scope="col" style={lineCell} key={name}>{name}</th>)}</tr></thead>
    <tbody>{autumn2013Pm5Tests[props.values[0]].map((row, i) => <tr key={i} data-test-case={i + 1}>
      <th scope="row" style={lineCell}>テストケース{'①②'[i]}</th>
      {row.map((value, j) => <td style={lineCell} key={j}>{value}</td>)}
    </tr>)}</tbody>
  </table></ScrollFigure>;
}

const weeks = ['第1週', '第2週', '第3週', '第4週', '第5週', '第6週'];
function WorkPlan(props: FigureProps) {
  const plan = (title: string, start: number, counts: readonly number[], rate: number) => {
    const cells = (scale: number) => weeks.map((week, i) => <td key={week} style={lineCell}>
      {counts[i - start] === undefined ? '' : (counts[i - start] * scale).toLocaleString('ja-JP')}
    </td>);
    return <>
      <tr><th style={lineCell} scope="rowgroup" rowSpan={3}>{title}</th><th scope="row" style={lineCell}>線表</th>
        <td colSpan={7} style={{ ...lineCell, padding: 0 }}>
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            <span style={{ gridColumn: (start + 1) + ' / span ' + counts.length, display: 'flex', alignItems: 'center' }}>
              <span>‹</span><span style={{ flexGrow: 1, borderTop: '1px solid var(--diagram-ink)' }} /><span>›</span>
            </span>
          </div>
        </td></tr>
      <tr><th scope="row" style={lineCell}>計画本数</th>{cells(1)}<td style={lineCell}>120</td></tr>
      <tr><th scope="row" style={lineCell}>計画工数</th>{cells(rate)}<td style={lineCell}>{(120 * rate).toLocaleString('ja-JP')}</td></tr>
    </>;
  };
  return <ScrollFigure {...props}><table style={tableStyle} aria-label={props.caption} data-project-plan="">
    <thead><tr><th scope="col" style={lineCell}>工程</th><th scope="col" style={lineCell} aria-label="項目"/>
      {[...weeks, '合計'].map(week => <th key={week} scope="col" style={lineCell}>{week}</th>)}</tr></thead>
    <tbody>{plan('内部設計', 0, autumn2013Pm6DesignPlan, 8)}</tbody>
    <tbody>{plan('プログラミング', 2, autumn2013Pm6ProgrammingPlan, 10)}</tbody>
  </table></ScrollFigure>;
}

function ShortPlan(props: FigureProps) {
  return <ScrollFigure {...props}><table style={tableStyle} aria-label={props.caption}>
    <thead><tr>{['週', ...weeks.slice(2)].map(week => <th key={week} scope="col" style={lineCell}>{week}</th>)}</tr></thead>
    <tbody><tr><th scope="row" style={lineCell}>計画本数</th><td style={lineCell}>10</td>
      <td style={lineCell} colSpan={3}><span className="source-code-blank" aria-label="空欄e">e</span></td></tr></tbody>
  </table></ScrollFigure>;
}

function ScheduleOption(props: FigureProps) {
  const values = autumn2013Pm0508Banks['6e'][props.values[0]].split('｜');
  return <ScrollFigure {...props} visibleCaption={false}><table style={tableStyle} aria-label={props.caption}>
    <tbody><tr>{values.map((value, index) => <td key={index} style={lineCell} data-schedule-week={index + 4}>{value}</td>)}</tr></tbody>
  </table></ScrollFigure>;
}

function StockTable(props: FigureProps) {
  const rows = autumn2013Pm7StockRows(props.values[0]);
  return <ScrollFigure {...props}><table style={tableStyle} aria-label={props.caption}>
    <thead>
      <tr><th style={lineCell} rowSpan={3} aria-label="営業所"/><th style={lineCell} scope="colgroup" colSpan={3}>商品K</th>
        <th style={lineCell} scope="colgroup" colSpan={3}>商品L</th></tr>
      <tr>{['K', 'L'].map(group => [
        <th key={group + 'stock'} scope="colgroup" style={lineCell} colSpan={2}>在庫数</th>,
        <th key={group + 'ratio'} scope="col" style={lineCell} rowSpan={2}>需要比率</th>,
      ])}</tr>
      <tr>{['K', 'L'].flatMap(group => ['回転在庫数', '安全在庫数'].map(name =>
        <th key={group + name} scope="col" style={lineCell}>{name}</th>))}</tr>
    </thead>
    <tbody>{rows.map(([office, ...values]) => <tr key={office} data-stock-office={office}>
      <th style={lineCell} scope="row">{office}</th>
      {values.map((value, i) => value === '網掛け'
        ? <td key={i} style={lineCell} aria-label="網掛けの部分は表示していない">
          <span aria-hidden="true" style={{ opacity: .4, letterSpacing: '.12em' }}>░░░</span>
        </td>
        : <td key={i} style={lineCell}>{value}</td>)}
    </tr>)}</tbody>
  </table></ScrollFigure>;
}

function StockFormula(props: FigureProps) {
  const math = createElement;
  const sum = () => math('munderover', null, math('mo', null, '∑'), math('mtext', null, 'i＝1'), math('mi', null, 'N'));
  const term = (label: string, root = false) => math('mrow', null, sum(),
    root ? math('msqrt', null, math('mtext', null, label)) : math('mtext', null, label));
  return <ScrollFigure {...props} visibleCaption={false}>
    {math('math', { display: 'block', style: { color: 'var(--diagram-ink)', fontSize: 'calc(1em * var(--image-scale, 1))' }, 'aria-label': autumn2013Pm0508Drawings['7-stock-formula'].alt() },
      math('mtext', null, '総在庫数'), math('mo', null, '＝'), term('拠点iの回転在庫数'), math('mo', null, '＋'),
      math('mfrac', null, term('拠点iの安全在庫数'), term('拠点iの需要比率', true)))}
  </ScrollFigure>;
}

const textX = (index: number) => 202 + 21 * index;
function Letters({ text, y }: { text: string; y: number }) {
  return <g data-compression-letters={text} style={{ fontFamily: 'ui-monospace, monospace' }}>
    {[...text].map((char, index) => <Text key={index} x={textX(index)} y={y} center>{char}</Text>)}
  </g>;
}
function Annotation({ index, text, y, arrow, offset = 0 }: { index: number; text: string; y: number; arrow: string; offset?: number }) {
  const x = textX(index);
  return <g data-annotation={text} data-character-position={index + 1}>
    <Text x={x + offset} y={y} center>{text}</Text>
    <path d={`M${x + offset} ${y + 5}L${x} ${y + 30}`} markerEnd={arrow}/>
  </g>;
}
function Example(props: FigureProps) {
  return <Drawing {...props} width={560} height={146}>{({ arrow }) => <>
    <Text x={12} y={32}>圧縮前の文字列：</Text><Text x={12} y={53}>（Plaindata）</Text>
    <Letters text={autumn2013Pm8ExamplePlain} y={32}/>
    <path d={`M${textX(6) - 8} 38H${textX(9) + 8}M${textX(10) - 8} 38H${textX(15) + 8}`}/>
    <Text x={textX(8) - 11} y={56} center>（s1）</Text><Text x={textX(13) - 11} y={56} center>（s2）</Text>
    <path d={`M${textX(6) + 3} 43L${textX(6) - 6} 96M${textX(10)} 42L${textX(9)} 96`} markerEnd={arrow}/>
    <Text x={12} y={110}>圧縮後の文字列：</Text><Text x={12} y={131}>（Compresseddata）</Text>
    <Letters text="ABCDEF$FD$JF" y={110}/>
    <path d={`M${textX(6) - 8} 116H${textX(8) + 8}M${textX(9) - 8} 116H${textX(11) + 8}`} strokeDasharray="3 2"/>
    <Text x={textX(7)} y={137} center>（s1′）</Text><Text x={textX(10)} y={137} center>（s2′）</Text>
  </>}</Drawing>;
}

function Comparison(props: FigureProps) {
  const first = props.id === '8-first-compress-position';
  const compare = props.id === '8-first-comparison-position';
  const search = props.id === '8-comparison-search';
  return <Drawing {...props} width={560} height={first ? 102 : 154}>{({ arrow }) => <>
    <Text x={12} y={86}>圧縮前の文字列：</Text>
    <Letters text={autumn2013Pm8ExamplePlain} y={86}/>
    {first && <Annotation index={4} text="最初の圧縮文字位置" y={41} arrow={arrow}/>}
    {compare && <>
      <Annotation index={0} text="最初の比較文字位置" y={41} arrow={arrow} offset={-30}/>
      <Annotation index={4} text="圧縮文字位置" y={41} arrow={arrow} offset={30}/>
      <path d={`M${textX(4)} 93v26H${textX(0)}V95`} markerEnd={arrow}/>
      <circle cx={textX(4)} cy="119" r="3" fill="currentColor"/>
      <Text x={textX(2)} y={139} center>4文字前</Text>
    </>}
    {search && <>
      <Text x={textX(1)} y={22} center>比較文字位置</Text>
      {['p₃', 'p₂', 'p₁'].map((text, index) => <Annotation key={text} index={index} text={text} y={41} arrow={arrow}/>)}
      <Annotation index={6} text="圧縮文字位置" y={41} arrow={arrow}/>
      <path d={`M${textX(0) - 8} 93H${textX(3) + 8}M${textX(6) - 8} 93H${textX(9) + 8}`}/>
    </>}
    {!first && !compare && !search && <>
      <Annotation index={10} text="圧縮文字位置" y={41} arrow={arrow}/>
      {[[0, 5, 's0'], [6, 9, 's1'], [10, 15, 's2']].map(([from, to, label]) =>
        <g key={label}><path d={`M${textX(Number(from)) - 8} 92H${textX(Number(to)) + 8}`}/>
          <Text x={(textX(Number(from)) + textX(Number(to))) / 2} y={109} center>（{label}）</Text></g>)}
      <path d={`M${textX(10)} 94v35H${textX(0)}V95`} markerEnd={arrow}/>
      <circle cx={textX(10)} cy="129" r="3" fill="currentColor"/>
      <Text x={textX(5)} y={149} center>10文字前</Text>
    </>}
  </>}</Drawing>;
}

function markedBlanks(text: string) {
  return text.split(/(［[a-e]］)/).map((part, i) => /^［[a-e]］$/.test(part)
    ? <span key={i} className="source-code-blank" data-source-blank={part[1]} aria-label={'空欄' + part[1]}>{part[1]}</span>
    : part);
}
const codeStyle = {
  whiteSpace: 'pre' as const, minWidth: 'max-content', textAlign: 'start' as const,
  color: 'var(--diagram-ink)', fontSize: 'calc(1em * var(--image-scale, 1))',
};
function Program(props: FigureProps) {
  const isDecompress = props.id === '8-decompress-program';
  return <ScrollFigure {...props} visibleCaption={props.id.startsWith('5-')}>
    <pre style={codeStyle} data-source-program={props.id}>{isDecompress ? <>
      {autumn2013Pm8DecompressSignature + '\n' + autumn2013Pm8DecompressHead + '\n'}
      <span data-alpha-region="" aria-label="αの部分" style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'top' }}>
        <span style={{ display: 'inline-block', border: '1px dashed var(--diagram-ink)' }}>{autumn2013Pm8Alpha}</span>
        <span aria-hidden="true"> ← α</span>
      </span>{'\n'}{markedBlanks(autumn2013Pm8DecompressTail)}
    </> : markedBlanks(autumn2013Pm0508Drawings[props.id].alt(props.values[0]))}</pre>
  </ScrollFigure>;
}

const components: Record<Autumn2013Pm0508Drawing, (props: FigureProps) => ReactNode> = {
  '5-condition': Conditions, '5-program-example': Program, '5-program-numbered': Program, '5-test-cases': TestCases, '5-control-flow': Flow,
  '6-work-plan': WorkPlan, '6-short-plan': ShortPlan, '6-schedule-option': ScheduleOption,
  '7-stock-formula': StockFormula, '7-stock-table': StockTable,
  '8-compression-example': Example, '8-first-compress-position': Comparison, '8-first-comparison-position': Comparison,
  '8-comparison-search': Comparison, '8-longest-reference': Comparison,
  '8-compress-signature': Program, '8-compress-program': Program, '8-decompress-program': Program,
};

export const legacy2013AutumnPm0508FigureRenderers: BookletFigureRenderer[] =
  (Object.keys(components) as Autumn2013Pm0508Drawing[]).map(id => {
    const Component = components[id];
    return { profile: autumn2013Pm0508Profile(id), component: props => <Component {...props} id={id} /> };
  });
