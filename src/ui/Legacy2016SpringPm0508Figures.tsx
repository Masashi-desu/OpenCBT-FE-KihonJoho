import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2016SpringPm0508Figures } from '../core/generators/legacy-2016-spring-pm-figures-05-08';
import { spring2016Pm5Model, spring2016Pm5StoreFields } from '../core/generators/legacy-2016-spring-pm-5';
import { spring2016Pm7Example, spring2016Pm7Model } from '../core/generators/legacy-2016-spring-pm-7';
import { spring2016Pm8Cells, spring2016Pm8Model, type Spring2016Pm8Snapshot } from '../core/generators/legacy-2016-spring-pm-8';

const ink = 'var(--diagram-ink)';
const surface = 'var(--surface)';
const shaded = 'var(--selected-surface)';
const outline = { stroke: ink, fill: surface };
const stroke = { stroke: ink, fill: 'none' };

function SourceSvg({ width, height, children, minWidth = 440 }: { width: number; height: number; children: ReactNode; minWidth?: number }) {
  return <svg aria-hidden="true" viewBox={'0 0 ' + width + ' ' + height}
    style={{ display: 'block', width: 'max(calc(' + minWidth + 'px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))',
      height: 'auto', color: ink, fontSize: 16 }} fill={ink}>{children}</svg>;
}

function RecordLayout({ fields }: { fields: readonly string[] }) {
  const width = fields.length * 124;
  return <SourceSvg width={width} height={44} minWidth={Math.min(width, 650)}>
    {fields.map((text, i) => <g key={text}>
      <rect x={i * 124 + 1} y="2" width="122" height="37" {...outline} />
      <text x={i * 124 + 62} y="26" textAnchor="middle">{text}</text>
    </g>)}
  </SourceSvg>;
}

type Message = [from: number, to: number, y: number, label?: string, response?: boolean];
const participants = ['利用者', 'ブラウザ', 'Webサーバ', 'ファイルサーバ'];
const lifelineX = [116, 290, 474, 680];
function Sequence({ app, refresh }: { app: boolean; refresh: boolean }) {
  const update = 'お気に入り数に1加えることを要求';
  const id = useId().replace(/:/g, '');
  const messages: Message[] = app ? [
    [0, 1, 86, 'URL指定'], [1, 2, 98], [2, 1, 116, '', true], [1, 3, 137],
    [3, 1, 156, '', true], [1, 0, 177, '', true],
    [0, 1, 245, '市区町村名を入力し，検索実行ボタンを押す'], [1, 1, 274, '画面生成'], [1, 0, 313, '', true],
    [0, 1, 379, 'お気に入りボタンを押す'], [1, 3, 405, update], [3, 1, 428, '', true],
    [1, 1, 451, '画面生成'], [1, 0, 487, '', true],
  ] : [
    [0, 1, 86, 'URL指定'], [1, 2, 98], [2, 1, 143, '', true], [1, 0, 155, '', true],
    [0, 1, 245, '市区町村名を入力し，検索実行ボタンを押す'], [1, 2, 256], [2, 3, 267],
    [3, 2, 284, '', true], [2, 2, 300, '画面生成'], [2, 1, 330, '', true], [1, 0, 340, '', true],
    [0, 1, 379, 'お気に入りボタンを押す'], [1, 2, 394], [2, 3, 415, update],
    [3, 2, 435, '', true], [2, 2, 451, '画面生成'], [2, 1, 485, '', true], [1, 0, 497, '', true],
  ];
  const arrow = 'url(#' + id + ')';
  return <SourceSvg width={770} height={525} minWidth={640}>
    <defs><marker id={id} markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0 0L7 3 0 6Z" fill={ink} />
    </marker></defs>
    {participants.map((name, i) => <g key={name}>
      <rect x={lifelineX[i] - 68} y="4" width="136" height="33" {...outline} />
      <text x={lifelineX[i]} y="26" textAnchor="middle">{name}</text>
      <path d={'M' + lifelineX[i] + ' 37V513'} {...stroke} strokeDasharray="4 4" />
    </g>)}
    {[[72, 184], [217, 345], [363, 502]].map(([from, to], i) => <g key={from}>
      <text x="12" y={from + 16}>処理{'ABC'[i]}</text>
      {lifelineX.map((x, actor) => {
        const points = messages.filter(([a, b, y]) => (a === actor || b === actor) && y >= from && y <= to).map(([, , y]) => y);
        return points.length ? <rect key={x} x={x - 4} y={Math.min(...points) - 2} width="8" height={Math.max(...points) - Math.min(...points) + 4} {...outline} /> : null;
      })}
    </g>)}
    {messages.map(([from, to, y, label, response]) => {
      const x1 = lifelineX[from], x2 = lifelineX[to], x = (x1 + x2) / 2;
      const search = label?.startsWith('市区町村');
      const favorite = label === update;
      return <g key={y} data-pm-sequence={participants[from] + '→' + participants[to]}>
        <path d={from === to ? 'M' + (x1 + 4) + ' ' + y + 'h28v18h-27' : 'M' + x1 + ' ' + y + 'H' + x2}
          {...stroke} markerEnd={arrow} strokeDasharray={response ? '4 4' : undefined} />
        {label && <text x={from === to ? x + 36 : x} y={from === to ? y + 15 : y - (search || favorite ? 25 : 7)}
          textAnchor={from === to ? 'start' : 'middle'} fontSize={14}>
          {search ? <><tspan x={x}>市区町村名を入力し，</tspan><tspan x={x} dy="17">検索実行ボタンを押す</tspan></>
            : favorite ? <><tspan x={x}>お気に入り数に1加えることを要求</tspan>{refresh && <tspan x={x} dy="17">し，最新の特売情報も要求</tspan>}</>
              : label}
        </text>}
      </g>;
    })}
  </SourceSvg>;
}

function PurchaseExample({ repeat }: { repeat: boolean }) {
  return <SourceSvg width={585} height={270}>
    <path d="M72 208V45m-5 8 5-8 5 8M72 208h329m-8-5 8 5-8 5" {...stroke} />
    <text x="11" y="32">購入回数</text><text x="166" y="54">延べ購入回数は16回</text>
    {repeat && <rect x="84" y="63" width="307" height="109" fill={shaded} />}
    <rect x="84" y="63" width="307" height="139" rx="12" strokeDasharray="7 4" {...stroke} />
    {Array.from({ length: 5 }, (_, i) => <text key={i} x="20" y={192 - i * 27}>{i + 1}回目</text>)}
    {spring2016Pm7Example.map((count, i) => <g key={i}>
      {Array.from({ length: count }, (_, j) => <circle key={j} cx={107 + i * 51} cy={188 - j * 27} r="9" {...outline} />)}
      <circle cx={107 + i * 51} cy="220" r="5" {...outline} />
      <path d={'M' + (102 + i * 51) + ' 249v-15m10 15v-15m-15 8v-13h20v13'} {...stroke} />
    </g>)}
    {repeat && <text x="218" y="104"><tspan>2回目以降の</tspan><tspan x="218" dy="23">延べ購入回数は10回</tspan></text>}
    <text x="408" y="236">購入人数は6人</text>
  </SourceSvg>;
}

function BubbleChart({ values }: { values: number[] }) {
  const { rows } = spring2016Pm7Model(values);
  return <SourceSvg width={700} height={475} minWidth={500}>
    <text x="12" y="24">リピート率（%）</text>
    {Array.from({ length: 11 }, (_, i) => <g key={i}>
      <path d={'M83 ' + (409 - 36 * i) + 'h540'} {...stroke} />
      <text x="75" y={414 - 36 * i} textAnchor="end">{(i * 10).toFixed(1)}</text>
    </g>)}
    {Array.from({ length: 7 }, (_, i) => <g key={i}>
      <path d={'M' + (83 + 90 * i) + ' 49v360'} {...stroke} />
      <text x={83 + 90 * i} y="432" textAnchor="middle">{(1000 * i).toLocaleString('ja-JP')}</text>
    </g>)}
    <text x="683" y="455" textAnchor="end">購入人数（人）</text>
    {rows.map(row => {
      const x = 83 + row.customers * .09, y = 409 - row.rate * 3.6;
      return <g key={row.customers}>
        <circle cx={x} cy={y} r={Math.sqrt(row.sales) * .61} {...outline} />
        {row.label && <><rect x={x - 21} y={y - 12} width="42" height="23" {...outline} />
          <text x={x} y={y + 4} textAnchor="middle">{row.label}</text></>}
      </g>;
    })}
  </SourceSvg>;
}

function MemoScreen({ values }: { values: number[] }) {
  const { added } = spring2016Pm8Model(values);
  return <SourceSvg width={350} height={195} minWidth={270}>
    <rect x="31" y="5" width="285" height="178" {...outline} />
    <path d="M31 31h285m-36 0V5" {...stroke} /><text x="139" y="23">簡易メモ帳</text><text x="291" y="23">×</text>
    {added.map((text, i) => <g key={i}><path d={'M31 ' + (54 + 23 * i) + 'h285'} {...stroke} />
      <text x="40" y={49 + 23 * i}>▷　{text}</text></g>)}
    {['追加', '削除', '変更', '移動'].map((label, i) => <g key={label}>
      <rect x={54 + i * 62} y="145" width="55" height="26" {...outline} />
      <text x={81 + i * 62} y="164" textAnchor="middle">{label}</text>
    </g>)}
  </SourceSvg>;
}

function MemoLength() {
  return <SourceSvg width={400} height={45} minWidth={240}>
    {['6', 'H', 'e', 'l', 'l', 'o', '!'].map((char, i) => <g key={i}>
      <rect x={53 * i + 8} y="4" width="53" height="35" {...outline} />
      <text x={53 * i + 34} y="28" textAnchor="middle" textDecoration={i === 0 ? 'underline' : undefined}>{char}</text>
    </g>)}
  </SourceSvg>;
}

function MemoArrays({ snapshot }: { snapshot: Spring2016Pm8Snapshot }) {
  const id = useId().replace(/:/g, '');
  const cells = spring2016Pm8Cells(snapshot);
  return <SourceSvg width={830} height={157} minWidth={690}>
    <defs><pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0v5" {...stroke} strokeWidth=".65" /></pattern></defs>
    <text x="8" y="51">Memo[]：</text><text x="8" y="134">Data[]：</text>
    {Array.from({ length: 5 }, (_, i) => <g key={i}>
      <text x={116 + i * 45} y="24" textAnchor="middle">{i}</text>
      <rect x={94 + i * 45} y="29" width="45" height="31" stroke={ink} fill={i < snapshot.pointers.length ? surface : shaded} />
      <text x={116 + i * 45} y="51" textAnchor="middle">{snapshot.pointers[i]}</text>
    </g>)}
    <text x="380" y="23">MemoMax：5</text><text x="380" y="52">MemoCnt：{snapshot.pointers.length}</text>
    <text x="555" y="23">DataMax：25</text><text x="555" y="52">DataLen：{snapshot.dataLen}</text>
    {snapshot.pointers.map((target, i) => <g key={i}>
      <path d={'M' + (116 + 45 * i) + ' 60L' + (108 + 28 * target) + ' 94'} {...stroke} strokeDasharray="3 3" />
      <circle cx={108 + 28 * target} cy="94" r="2.6" fill={ink} />
    </g>)}
    {Array.from({ length: 25 }, (_, i) => {
      const cell = cells[i], x = 94 + i * 28;
      return <g key={i} data-memo-cell={i} data-cell-state={cell ? (cell.live ? 'live' : 'garbage') : 'empty'}>
        <text x={x + 14} y="110" textAnchor="middle" fontSize="13">{i}</text>
        <rect x={x} y="114" width="28" height="31" stroke={ink} fill={cell ? surface : shaded} />
        {cell && !cell.live && <rect x={x} y="114" width="28" height="31" fill={'url(#' + id + ')'} />}
        <text x={x + 14} y="135" textAnchor="middle" textDecoration={cell?.header ? 'underline' : undefined}>{cell?.value}</text>
      </g>;
    })}
  </SourceSvg>;
}

const components: Record<string, (props: BookletFigureProps) => ReactNode> = {
  '5-store-record': () => <RecordLayout fields={spring2016Pm5StoreFields} />,
  '5-favorite-record': ({ values }) => <RecordLayout fields={[...spring2016Pm5Model(values).lookup, 'お気に入り数']} />,
  '5-web-sequence': ({ values }) => <Sequence app={false} refresh={spring2016Pm5Model(values).refresh} />,
  '5-app-sequence': ({ values }) => <Sequence app refresh={spring2016Pm5Model(values).refresh} />,
  '7-purchases': () => <PurchaseExample repeat={false} />,
  '7-repeat-purchases': () => <PurchaseExample repeat />,
  '7-bubble-chart': ({ values }) => <BubbleChart values={values} />,
  '8-memo-screen': ({ values }) => <MemoScreen values={values} />,
  '8-memo-length-example': () => <MemoLength />,
  ...Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['8-memo-state-' + i,
    ({ values }: BookletFigureProps) => <MemoArrays snapshot={spring2016Pm8Model(values).snapshots[i]} />])),
};

export const legacy2016SpringPm0508FigureRenderers: BookletFigureRenderer[] = legacy2016SpringPm0508Figures.map(({ profile, alt }) => {
  const Component = components[profile.slice('legacy-2016-spring-pm-'.length)];
  if (!Component) throw new Error('FIGURE_PROFILE');
  return { profile, component: ({ values, caption }) =>
    <figure className="managed-diagram source-figure">
      <div className="diagram-scroll" tabIndex={0} aria-label={caption}>
        <div role="img" aria-label={alt(values)}><Component values={values} caption={caption} /></div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure> };
});
