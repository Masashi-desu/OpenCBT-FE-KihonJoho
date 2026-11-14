import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawingAlt, figureNames, profile, type FigureName } from '../core/generators/legacy-2008-spring-pm-06-09-figures';
import { kettleEmpty, kettleHasWater, surveyCases, surveyChanges, tokenCases,
  tokenExample } from '../core/generators/legacy-2008-spring-pm-06-09-model';

type Props = BookletFigureProps & { name: FigureName };
const scaled: CSSProperties = { width: 'max-content', fontSize: 'calc(1em * var(--image-scale, 1))', marginInline: 'auto' };
const monospace: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', whiteSpace: 'pre',
  margin: 0, color: 'var(--diagram-ink)', lineHeight: 1.5 };
const panel: CSSProperties = { ...monospace, border: '1px solid currentColor', margin: 0, padding: '.45em .65em' };
const tableStyle: CSSProperties = { ...scaled, borderCollapse: 'collapse', color: 'var(--diagram-ink)' };
const cell: CSSProperties = { border: '1px solid currentColor', padding: '.3em .55em', textAlign: 'center' };

function Frame({ name, caption, values, children }: Props & { children: ReactNode }) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption}
    aria-description={drawingAlt(name, values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function SurveyRecord(props: Props) {
  const { events, codes } = surveyCases[props.values[0]];
  return <Frame {...props}>
    <table style={tableStyle} aria-label={props.caption}>
      <thead><tr>
        <th rowSpan={2} scope="col" style={cell}>従業員番号<br />6けた</th>
        <th colSpan={events.length} scope="colgroup" style={cell}>イベント</th>
      </tr><tr>
        {events.map((event, index) => <th key={event} scope="col" style={cell}>{event}<br />（{codes[index]}）<br />1けた</th>)}
      </tr></thead>
    </table>
  </Frame>;
}

function SurveyChanges(props: Props) {
  return <Frame {...props}><table style={tableStyle} aria-label={props.caption}>
    <thead><tr><th scope="col" style={cell}>処置</th><th scope="col" style={cell}>変更内容</th></tr></thead>
    <tbody>{surveyChanges(props.values[0]).map(([location, change]) =>
      <tr key={location}><th scope="row" style={{ ...cell, textAlign: 'left' }}>{location}</th>
        <td style={{ ...cell, textAlign: 'left' }}><pre style={monospace}><code>{change}</code></pre></td>
      </tr>)}</tbody>
  </table></Frame>;
}

function KettleState(props: Props) {
  const id = useId();
  const index = props.values[0];
  return <Frame {...props}><div style={scaled}>
    <svg viewBox="0 0 530 280" width={530} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
      style={{ width: '33.125em', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
      <title id={id + '-title'}>{props.caption}</title><desc id={id + '-desc'}>{drawingAlt(props.name, index)}</desc>
      <defs><marker id={id + '-tip'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6"
        orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
      <g stroke="currentColor" strokeWidth="1.65" fill="none" markerEnd={'url(#' + id + '-tip)'}>
        <path d="M285 17 V58" />
        <path d="M240 89 C171 125 170 36 240 66" />
        <path d="M285 101 V217" />
        <path d="M330 238 C417 236 443 108 331 80" />
      </g>
      <g stroke="currentColor" strokeWidth="1.65" fill="none">
        <rect x="240" y="58" width="91" height="43" rx="7" /><rect x="240" y="217" width="91" height="43" rx="7" />
      </g>
      <g fill="currentColor" fontSize="16">
        <text x="285" y="85" textAnchor="middle">休止</text><text x="285" y="244" textAnchor="middle">加熱中</text>
        <text x="164" y="66" textAnchor="end">沸騰ボタン押下</text>
        <text x="164" y="88" textAnchor="end">（{kettleEmpty(index)}）</text>
        <text x="272" y="145" textAnchor="end">沸騰ボタン押下</text>
        <text x="272" y="167" textAnchor="end">（{kettleHasWater(index)}）</text>
        <text x="426" y="166">沸点に到達</text>
      </g>
    </svg>
  </div></Frame>;
}

function TokenExample(props: Props) {
  const index = props.values[0];
  const { characters, result } = tokenExample(index);
  return <Frame {...props}><div style={scaled}>
    <p style={{ margin: '.3em 0' }}>（文字列）</p>
    <table style={tableStyle} aria-label="GR1が指す文字列"><tbody>
      <tr><th scope="row" style={{ paddingRight: '.4em' }}>(GR1)→</th>
        {characters.map((value, position) => <td key={position} style={cell}>{value}</td>)}
      </tr>
    </tbody></table>
    <p style={{ margin: '.5em 0 .3em' }}>（単語管理テーブル）</p>
    <table style={tableStyle} aria-label="GR2が指す単語管理テーブル"><tbody>
      <tr><th scope="row" style={{ paddingRight: '.4em' }}>(GR2)→</th>
        {result.map((value, position) => <td key={position} style={cell}>{value === '空欄' ? '' : value}</td>)}
      </tr><tr><td colSpan={result.length} /><td style={{ textAlign: 'center' }}>↑ 終了マーク</td></tr>
    </tbody></table>
    <p style={{ margin: '.5em 0 0' }}>注　文字列の先頭アドレスを{tokenCases[index].address}番地とし，数字は10進表記である。</p>
    <p style={{ margin: 0 }}>　　△は空白文字を示す。</p>
  </div></Frame>;
}

function Output(props: Props) {
  return <Frame {...props}><pre style={{ ...panel, ...scaled }}><code>{drawingAlt(props.name, props.values[0])}</code></pre></Frame>;
}

const components = {
  '7-record': SurveyRecord, '7-output': Output, '7-changes': SurveyChanges,
  '8-state': KettleState, '8-result': Output, '9-execution': TokenExample,
};

export const legacy2008SpringPm0609FigureRenderers: readonly BookletFigureRenderer[] = figureNames.map(name => {
  const Component = components[name];
  return { profile: profile(name), component: props => <Component {...props} name={name} /> };
});
