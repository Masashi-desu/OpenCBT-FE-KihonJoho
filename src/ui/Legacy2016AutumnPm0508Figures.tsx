import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2016Pm0508FigureAlt, autumn2016Pm0508NativeFragment, autumn2016Pm0508NativeProfiles, legacy2016AutumnPm0508Figures } from '../core/generators/legacy-2016-autumn-pm-figures-05-08';
import { autumn2016Pm7Model } from '../core/generators/legacy-2016-autumn-pm-7';
import { autumn2016Pm8ProgramLines, autumn2016Pm8DetailLines } from '../core/generators/legacy-2016-autumn-pm-8';

const ink = 'var(--diagram-ink)', surface = 'var(--surface)';
const stroke = { stroke: ink, strokeWidth: 1.6, fill: 'none' };
function InlineBlanks({ text }: { text: string }) {
  return <>{text.split(/(［(?:[a-f][1-3]?|空欄)］)/g).map((part, index) => {
    if (!part.startsWith('［') || !part.endsWith('］')) return part;
    const name = part.slice(1, -1), generic = name === '空欄';
    return <span key={index} role="img" aria-label={generic ? '解答空欄' : '空欄' + name} data-pm2016-blank={generic ? '' : name} style={{ display: 'inline-block', minWidth: '4em', padding: '0 .5em', marginInline: '.15em', border: '1.5px solid var(--diagram-ink)', lineHeight: 1.25, textAlign: 'center', verticalAlign: 'baseline', whiteSpace: 'nowrap', color: ink }}>{generic ? '\u00a0' : name}</span>;
  })}</>;
}
function SvgBlanks({ text, x, y, size = 20, center = false, blankWidth = 96 }: { text: string; x: number; y: number; size?: number; center?: boolean; blankWidth?: number }) {
  const parts = text.split(/(［(?:[a-f][1-3]?|空欄)］)/g), measure = (part: string) => part.startsWith('［') ? blankWidth : [...part].reduce((sum, char) => sum + (char.codePointAt(0)! > 255 ? size : size * .56), 0);
  let at = x - (center ? parts.reduce((sum, part) => sum + measure(part), 0) / 2 : 0);
  return <g>{parts.map((part, index) => { const left = at; at += measure(part); if (part.startsWith('［')) { const name = part.slice(1, -1); return <g key={index} data-pm2016-blank={name === '空欄' ? '' : name} role="img" aria-label={name === '空欄' ? '解答空欄' : '空欄' + name}><rect x={left + 3} y={y - size} width={blankWidth - 6} height={size + 7} fill={surface} stroke={ink} strokeWidth="1.6" /><text x={left + blankWidth / 2} y={y} textAnchor="middle">{name === '空欄' ? '' : name}</text></g>; } return <text key={index} x={left} y={y}>{part}</text>; })}</g>;
}
function NativeFragment({ profile, values }: BookletFigureProps & { profile: string }) {
  const { number, block } = autumn2016Pm0508NativeFragment(profile, values);
  if (block.type === 'paragraph') return <p data-native-source-text><InlineBlanks text={block.text} /></p>;
  if (block.type !== 'table') throw Error('PARAMETER_CONSTRAINT');
  const cell: CSSProperties = { border: '1px solid var(--diagram-ink)', padding: '.5em .7em', verticalAlign: 'middle' };
  const editResults = number === 8 && block.caption.startsWith('表3'), editStates = number === 8 && block.caption.startsWith('表2');
  if (number === 8 && block.caption.startsWith('表1')) return <figure className="managed-diagram source-figure"><div className="diagram-scroll" style={{ position: 'relative' }} tabIndex={0} aria-label={block.caption}><table style={{ borderCollapse: 'collapse', color: ink, fontSize: 'calc(1em * var(--image-scale, 1))' }}><caption>{block.caption}</caption><thead><tr><th colSpan={2} rowSpan={3} aria-hidden="true" style={{ border: 0 }} /><th colSpan={3} scope="colgroup" style={cell}>編集パターン</th></tr><tr>{['例1', '例2', '例3'].map(t => <th key={t} style={cell}>{t}</th>)}</tr><tr>{['␣□□,□□□', '*□□,□□□', '␣□□□.□□'].map(t => <td key={t} style={{ ...cell, whiteSpace: 'nowrap' }}>“{t}”</td>)}</tr></thead><tbody>{block.rows.map((row, i) => <tr key={i}>{i === 0 && <th rowSpan={3} scope="rowgroup" style={{ ...cell, writingMode: 'vertical-rl' }}>数値</th>}{row.map((text, j) => <td key={j} style={{ ...cell, whiteSpace: 'nowrap' }}>{j === 0 ? text : '“' + text + '”'}</td>)}</tr>)}</tbody></table></div></figure>;
  const columns = editResults ? ['Pattern[]', 'Value[]', 'Pattern[]'] : editStates ? ['ケース', 'Pattern[p]', 'signif', 'Value[v]', 'Value[v＋1]', 'Pattern[p]', 'signif'] : number === 6 && block.caption.startsWith('表2') ? ['', ...block.columns.slice(1)] : block.columns;
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" style={{ position: 'relative' }} tabIndex={0} aria-label={block.caption + '。幅が足りない場合は左右にスクロールできます。'}><table style={{ borderCollapse: 'collapse', color: ink, fontSize: 'calc(1em * var(--image-scale, 1))' }}><caption>{block.caption}</caption>{number !== 7 && <thead>{editResults && <tr><th colSpan={2} scope="colgroup" style={cell}>実行前の内容</th><th style={cell}>実行後の内容</th></tr>}{editStates && <tr><th aria-hidden="true" style={{ border: 0 }} /><th colSpan={4} scope="colgroup" style={cell}>現在の変数・配列要素の内容</th><th colSpan={2} scope="colgroup" style={cell}>更新処理</th></tr>}<tr>{columns.map((text, index) => <th key={index} scope="col" style={cell}>{text}</th>)}</tr></thead>}<tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((text, column) => { const omitted = text.startsWith('網掛け'), mergedOmission = editStates && column === 3 && omitted && row[4].startsWith('網掛け'); if (editStates && column === 4 && omitted && row[3].startsWith('網掛け')) return null; return <td key={column} colSpan={mergedOmission ? 2 : undefined} style={{ ...cell, ...(omitted ? { background: 'var(--selected-surface)' } : {}), whiteSpace: number === 8 ? 'nowrap' : undefined }}>{omitted ? <span className="sr-only">原資料で非表示の部分</span> : <InlineBlanks text={text} />}</td>; })}</tr>)}</tbody></table></div></figure>;
}
function ClassBox({ x, y, width = 170, name, attrs }: { x: number; y: number; width?: number; name: string; attrs: string[] }) {
  return <g data-uml-class={name}>
    <rect x={x} y={y} width={width} height={34 + attrs.length * 27} fill={surface} stroke={ink} strokeWidth="1.6" />
    <path d={`M${x} ${y + 32}h${width}`} {...stroke} />
    <text x={x + width / 2} y={y + 24} textAnchor="middle">{name}</text>
    {attrs.map((text, i) => <SvgBlanks key={i} text={text} x={x + 8} y={y + 57 + i * 27} size={19} />)}
  </g>;
}
function Classes() {
  return <g fontSize="19" fill={ink}>
    <g {...stroke}><path d="M180 85H290M450 85H560M725 85H850M935 123V235M810 280H720M935 343V380M755 380H1095M755 380V420M925 380V420M1095 380V420" />
      <path d="M450 85l13 -8 13 8 -13 8Z" fill={ink} /><path d="M923 343l12 -20 12 20Z" fill={surface} />
    </g>
    <ClassBox x={10} y={35} name="会員情報" attrs={['会員ID', '氏名', '住所', '生年月日', '電話番号', '最終来店年月日', '累計支払額', '貸出中延滞数', '登録年月日']} />
    <ClassBox x={290} y={35} width={160} name="貸出" attrs={['伝票番号', '貸出年月日', '［a］', '返却予定年月日']} />
    <ClassBox x={560} y={35} width={165} name="貸出明細" attrs={['貸出明細番号', '貸出料金', '返却年月日', '延滞料金']} />
    <ClassBox x={850} y={35} width={170} name="レンタル商品" attrs={['資産管理番号', '貸出可否状態']} />
    <ClassBox x={810} y={235} width={250} name="商品情報" attrs={['商品コード', '商品名']} />
    <ClassBox x={510} y={235} width={210} name="貸出料金" attrs={['貸出期間', '単価', '1日分の延滞料金']} />
    <ClassBox x={675} y={420} width={160} name="CD" attrs={['編曲者', '再生時間']} />
    <ClassBox x={845} y={420} width={160} name="DVD" attrs={['監督', '主演', '再生時間']} />
    <ClassBox x={1015} y={420} width={160} name="書籍" attrs={['著者名', 'ページ数', 'ISBN']} />
    {[['1', 195, 76], ['0..*', 240, 76], ['1', 480, 76], ['1..10', 500, 76], ['［b1］', 729, 76], ['［b2］', 788, 76], ['1..*', 945, 175], ['1', 945, 226], ['1..3', 725, 270], ['0..*', 765, 270]].map(([text, x, y], i) => <SvgBlanks key={i} text={String(text)} x={Number(x)} y={Number(y)} size={19} blankWidth={56} />)}
    <text x="25" y="410">（凡例）</text><ClassBox x={30} y={440} width={125} name="クラスA" attrs={['属性名']} /><ClassBox x={250} y={440} width={125} name="クラスB" attrs={['属性名']} />
    <ClassBox x={30} y={555} width={125} name="クラスC" attrs={['属性名']} /><ClassBox x={250} y={555} width={125} name="クラスD" attrs={['属性名']} />
    <g {...stroke}><path d="M92 555V521M80 521l12 -20 12 20ZM312 501V555M155 602H250" /><path d="M155 602l13 -8 13 8 -13 8Z" fill={ink} /></g>
    <text x="183" y="592">1</text><text x="213" y="592">1..*</text>
  </g>;
}
function Sequence({ arrow }: { arrow: string }) {
  const xs = [40, 170, 405, 555, 695, 870, 1120, 1320], names = ['担当者', '画面', ':貸出処理', ':貸出', ':貸出明細', ':レンタル商品', ':商品情報', ':貸出料金'];
  const messages = [
    [0, 1, 115, '入力操作', false], [1, 2, 165, '貸出情報を取得する（資産管理番号，貸出期間，本日日付）', false],
    [2, 5, 330, '商品情報を取得する', false], [5, 2, 380, '商品情報', true], [2, 6, 450, '商品概要を取得する', false],
    [6, 2, 500, '商品概要', true], [2, 6, 565, '貸出料金を取得する（［d］）', false],
    [6, 7, 610, '省略', false], [7, 6, 660, '省略', true], [6, 2, 710, '貸出料金', true], [2, 1, 760, '省略', true], [1, 0, 850, '', true],
  ] as const;
  return <g fill={ink} fontSize="20">
    {xs.map((x, i) => <g key={i} data-lifeline={names[i]}>{i === 0 ? <g data-uml-actor="担当者"><circle cx={x} cy={12} r={9} {...stroke} /><path d={`M${x} 21V48M${x - 17} 31H${x + 17}M${x} 48l-17 14M${x} 48l17 14`} {...stroke} /><text x={x} y={85} textAnchor="middle">{names[i]}</text></g> : <><rect data-participant-header={names[i]} x={x - 68} y={12} width={136} height={48} fill={surface} stroke={ink} /><text x={x} y="44" textAnchor="middle" textDecoration={i > 1 ? 'underline' : undefined}>{names[i]}</text></>}<path d={`M${x} ${i === 0 ? 95 : 65}V885`} {...stroke} strokeDasharray="7 6" />{[0, 1, 2, 5, 7].includes(i) && <rect data-activation={names[i]} x={x - 7} y={i === 0 ? 100 : i === 1 ? 115 : i === 2 ? 165 : i === 5 ? 325 : 605} width="14" height={i === 0 ? 775 : i === 1 ? 725 : i === 2 ? 595 : 55} fill={surface} stroke={ink} />}{i === 6 && <>{[445, 565].map((top, j) => <rect key={top} data-activation={names[i]} x={x - 7} y={top} width="14" height={j === 0 ? 55 : 145} fill={surface} stroke={ink} />)}</>}</g>)}
    <rect data-nested-activation="self-date" x={405} y={212} width={14} height={40} fill={surface} stroke={ink} /><rect data-nested-activation="self-rental" x={405} y={272} width={14} height={40} fill={surface} stroke={ink} /><rect data-nested-activation="screen-display" x={177} y={788} width={14} height={42} fill={surface} stroke={ink} />
    {messages.map(([from, to, y, text, dashed], i) => <g key={i} data-message={i}><path d={`M${xs[from]} ${y}H${xs[to]}`} {...stroke} markerEnd={arrow} strokeDasharray={dashed ? '7 6' : undefined} /><SvgBlanks text={text} x={i === 1 ? 180 : (xs[from] + xs[to]) / 2} y={y - 12} center={i !== 1} /></g>)}
    <path d="M412 220h34v30h-34M412 280h34v30h-34M177 795h35v30h-35" {...stroke} markerEnd={arrow} />
    <SvgBlanks x={455} y={230} text="返却予定年月日を計算する（［c］）" /><text x="455" y="290">レンタル商品を取得する（資産管理番号）</text><text x="225" y="810">画面を表示する</text>
    <path d="M1270 442H1175" {...stroke} markerEnd={arrow} /><text x="1283" y="450" fontSize="26">α</text>
  </g>;
}
function Quality() {
  return <g fontSize="21" fill={ink}>
    <path d="M180 40V440H820" {...stroke} />
    <rect x="190" y="48" width="620" height="75" rx="12" fill="var(--soft-surface)" stroke={ink} /><rect x="190" y="132" width="165" height="298" rx="12" fill="var(--soft-surface)" stroke={ink} />
    <rect x="365" y="132" width="445" height="195" rx="12" fill="var(--soft-surface)" stroke={ink} /><rect x="365" y="337" width="445" height="93" rx="12" fill="var(--soft-surface)" stroke={ink} />
    <text x="500" y="96" textAnchor="middle">Ⅰ</text><text x="270" y="285" textAnchor="middle">Ⅱ</text><text x="585" y="240" textAnchor="middle">Ⅲ</text><text x="585" y="392" textAnchor="middle">Ⅳ</text>
    {[['6', 140, 136], ['5', 140, 232], ['4', 140, 337], ['80', 343, 475], ['100', 540, 475]].map(([t, x, y], i) => <text key={i} x={x} y={y}>{t}</text>)}
    <path d="M170 130H180M170 228H180M170 332H180M360 440V450M555 440V450" {...stroke} />
    <text x="505" y="522" textAnchor="middle">テスト密度（件/kステップ）</text><text x="25" y="220">バグ摘出率</text><text x="25" y="252">（件/kステップ）</text>
    <text x="490" y="560" textAnchor="middle">テスト密度の基準範囲の下限：80</text><text x="485" y="30" textAnchor="middle">バグ摘出率の基準範囲の上限：6</text><text x="485" y="597" textAnchor="middle">バグ摘出率の基準範囲の下限：4</text>
  </g>;
}
function Program({ detail }: { detail: boolean }) {
  const main = autumn2016Pm8ProgramLines;
  // The explanation inside the dashed frame occupies three lines on PDF p.37.
  const summary = (main[9] + main[10]).replace('どれに', '\nどれに').replace('Pattern[p]', '\nPattern[p]');
  const rows = detail ? autumn2016Pm8DetailLines : [...main.slice(0, 9), ...summary.split('\n'), ...main.slice(11)];
  const y = (i: number) => 30 + i * 42;
  const branch = (x: number, start: number, end: number, divider?: number, square = false) => <g {...stroke}>
    <path d={`M${x} ${start}V${end}${divider === undefined ? '' : `M${x} ${divider}h36`}`} />
    {square ? <><rect x={x - 6} y={start - 6} width="12" height="12" fill={ink} /><rect x={x - 6} y={end - 6} width="12" height="12" fill={ink} /></> : <><path d={`M${x - 7} ${start + 7}l7 -14 7 14Z`} fill={ink} /><path d={`M${x - 7} ${end - 7}l7 14 7 -14Z`} fill={ink} /></>}
  </g>;
  return <g fontSize="21" fill={ink} data-pseudocode={detail ? 'detail' : 'main'}>
    {rows.map((row, i) => {
      const leading = detail ? [50, 100, 135, 0, 140, 175, 100, 135, 0, 135, 0, 100, 135, 100][i] :
        i < 8 ? 50 : i === 8 ? 90 : i === 13 ? 680 : 130;
      return <g key={i} data-program-row={i}><SvgBlanks x={leading} y={y(i)} size={21} blankWidth={200} text={row.replace(/^▲ /, '').replace(/^■ /, '')} /></g>;
    })}
    {detail ? <>
      {branch(25, y(0) - 8, y(13) + 28, y(10))}{branch(75, y(1) - 8, y(5) + 10, y(3))}{branch(115, y(4) - 8, y(5) + 10)}{branch(75, y(6) - 8, y(9) + 25, y(8))}{branch(75, y(11) - 8, y(12) + 25)}
    </> : <>
      {branch(25, y(7) - 8, y(15) + 36, undefined, true)}{branch(65, y(8) - 8, y(15) + 12, y(13) - 15)}{branch(105, y(14) - 8, y(15) + 12)}
      <rect x="115" y={y(9) - 26} width="725" height="119" {...stroke} strokeDasharray="7 6" />
    </>}
  </g>;
}
function Forecast({ values, caption }: BookletFigureProps) {
  const m = autumn2016Pm7Model(values), cell: CSSProperties = { border: '1px solid var(--diagram-ink)', padding: '.45em .7em', whiteSpace: 'nowrap' };
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" style={{ position: 'relative' }} tabIndex={0} aria-label="FCFの予測表。幅が足りない場合は左右にスクロールできます。">
    <table style={{ borderCollapse: 'collapse', color: ink, fontSize: 'calc(1em * var(--image-scale, 1))' }}><caption>{caption}</caption><thead><tr>{['年度', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '…'].map(t => <th key={t} scope="col" style={cell}>{t}</th>)}</tr></thead>
      <tbody><tr><th scope="row" style={cell}>FCF</th>{m.flows.map((value, i) => <td key={i} style={{ ...cell, background: [0, 2, 3].includes(i) ? 'var(--selected-surface)' : 'var(--surface)' }} aria-label={[0, 2, 3].includes(i) ? '網掛け・非表示' : undefined}>{[0, 2, 3].includes(i) ? '' : i === 1 ? <InlineBlanks text="［d］" /> : value.toFixed(2)}</td>)}<td style={cell}>…</td></tr></tbody>
    </table>
  </div></figure>;
}
function Assets({ caption }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" style={{ position: 'relative' }} tabIndex={0} aria-label="資産管理番号と商品コードの例。幅が足りない場合は左右にスクロールできます。"><div style={{ display: 'flex', gap: '1em', minWidth: 'calc(1010px * var(--image-scale, 1))', color: ink, fontSize: 'calc(1em * var(--image-scale, 1))' }}>
    {[1, 2, 3].map(number => <div key={number} style={{ border: '1px solid var(--diagram-ink)', padding: '.5em', minWidth: 'calc(320px * var(--image-scale, 1))' }}><div>商品コード：<u>商品コード{number === 3 ? 2 : 1}</u></div><div>商品名：オブジェクト指向設計</div><div>著者名：{number === 3 ? '情報花子' : '試験太郎'}</div><div>資産管理番号：<u>資産管理番号{number}</u></div></div>)}
  </div></div><figcaption>{caption}</figcaption></figure>;
}
function DiagramFigure({ profile, values, caption }: BookletFigureProps & { profile: string }) {
  const id = useId().replace(/:/g, ''), alt = autumn2016Pm0508FigureAlt(profile, values), arrow = `url(#${id}-arrow)`;
  const kind = profile.split('-').slice(5).join('-');
  let width = 1220, height = 660, content: ReactNode;
  if (profile.endsWith('-classes')) content = <Classes />;
  else if (profile.endsWith('-sequence')) { width = 1440; height = 920; content = <Sequence arrow={arrow} />; }
  else if (profile.endsWith('-quality-graph')) { width = 880; height = 625; content = <Quality />; }
  else { width = profile.endsWith('-detail-program') ? 760 : 1450; height = profile.endsWith('-detail-program') ? 640 : 732; content = <Program detail={profile.endsWith('-detail-program')} />; }
  return <figure className={'managed-diagram source-figure profile-' + profile} data-figure-kind={kind}><div className="diagram-scroll" style={{ position: 'relative' }} tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。">
    <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none', height: 'auto', color: ink }}>
      <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc><defs><marker id={id + '-arrow'} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke={ink} strokeWidth="1.6" /></marker></defs>{content}
    </svg>
  </div><figcaption>{profile.endsWith('-detail-program') ? <>〔プログラム中の<span role="img" aria-label="破線で囲んだ" style={{ display: 'inline-block', border: '1px dashed var(--diagram-ink)', minWidth: '6em', minHeight: '1em', verticalAlign: 'middle' }} />部分の処理〕</> : caption}</figcaption></figure>;
}
export const legacy2016AutumnPm0508FigureRenderers: BookletFigureRenderer[] = legacy2016AutumnPm0508Figures.map(({ profile }) => ({ profile,
  component: autumn2016Pm0508NativeProfiles.includes(profile) ? props => <NativeFragment {...props} profile={profile} /> : profile.endsWith('-forecast') ? Forecast : profile.endsWith('-assets') ? Assets : props => <DiagramFigure {...props} profile={profile} />,
}));
