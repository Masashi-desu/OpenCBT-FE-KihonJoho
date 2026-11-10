import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { colorAlt, colorBitsAlt, databaseAlt, pagingAlt, profiles, securityAlt, securityPolicyAlt, userInfoAlt, vramAlt } from '../core/generators/legacy-2013-spring-pm-01-04-figures';
import { colorBitRows, colorCases, databaseTables, pageCases, securityRules, userInfoExtra, userInfoRows } from '../core/generators/legacy-2013-spring-pm-01-04-models';

type SvgProps = {
  caption: string; alt: string; width: number; height: number; children: (arrow: string) => ReactNode;
};

function Drawing({ caption, alt, width, height, children }: SvgProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" fontSize="15">
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Text({ x, y, children, left = false }: { x: number; y: number; children: ReactNode; left?: boolean }) {
  return <text x={x} y={y} textAnchor={left ? 'start' : 'middle'} stroke="none" fill="currentColor">{children}</text>;
}

function Color({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} alt={colorAlt()} width={296} height={265}>{() => <>
    <rect x="16" y="12" width="264" height="242"/>
    <circle cx="148" cy="99" r="67"/><circle cx="108" cy="165" r="67"/><circle cx="188" cy="165" r="67"/>
    <Text x={148} y={79}>R</Text><Text x={83} y={181}>G</Text><Text x={213} y={181}>B</Text>
    <Text x={116} y={126}>Y</Text><Text x={180} y={126}>M</Text><Text x={148} y={181}>C</Text>
    <Text x={148} y={146}>W</Text><Text x={253} y={42}>K</Text>
  </>}</Drawing>;
}

function ColorBits({ caption, values }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={colorBitsAlt(values)}>
    <div className="table-scroll" tabIndex={0}>
      <table aria-label={caption}>
        <thead><tr><th scope="col">色</th><th scope="col">ビットパターン</th></tr></thead>
        <tbody>{colorBitRows(values[0]).map(([name, bits]) => <tr key={name}>
          <th scope="row">{name}</th><td aria-label={bits ? undefined : '網掛け'}
            style={bits ? undefined : { background: 'var(--selected-surface)' }}>
            {bits === '［a］' ? <span style={{ border: '1px solid var(--diagram-border)', paddingInline: '2em' }}>a</span> : bits}
          </td>
        </tr>)}</tbody>
      </table>
    </div>
    <p>注記　網掛けの部分は表示していない。</p><figcaption>{caption}</figcaption>
  </figure>;
}

function Vram({ caption, values }: BookletFigureProps) {
  return <Drawing caption={caption} alt={vramAlt(values)} width={350} height={194}>{arrow => <>
    <Text x={162} y={24}>先頭ビット</Text><path d="M162 31V53" markerEnd={arrow}/>
    {colorCases[values[0]].bytes.map((byte, row) => {
      const y = 58 + 43 * row;
      return <g key={row}>
        <Text x={10} y={y + 23} left>プレーン{row + 1}（{['赤', '緑', '青'][row]}）</Text>
        <path d={`M278 ${y}H157v35h121M197 ${y}v35M237 ${y}v35`}/>
        <Text x={177} y={y + 23}>{byte}</Text><Text x={217} y={y + 23}>…</Text><Text x={257} y={y + 23}>…</Text>
      </g>;
    })}
  </>}</Drawing>;
}

function Paging({ caption, values }: BookletFigureProps) {
  const frames = pageCases[values[0]].physical;
  const virtual = [1, 2, 3, 4, 5, '⋮', 'm'];
  return <Drawing caption={caption} alt={pagingAlt(values)} width={704} height={471}>{arrow => <>
    <Text x={114} y={26}>仮想アドレス空間</Text><Text x={613} y={26}>物理アドレス空間</Text>
    <Text x={118} y={61}>仮想記憶</Text><Text x={340} y={61}>ページテーブル</Text><Text x={612} y={61}>主記憶</Text>
    {virtual.map((page, row) => {
      const y = 72 + row * 29;
      const slot = frames.findIndex(candidate => candidate === page);
      if (page === '⋮') return <g key={page}>
        <path d={`M86 ${y}v29m63 -29v29M295 ${y}v29m43 -29v29m43 -29v29`} strokeDasharray="3 3"/>
        <Text x={76} y={y + 20}>{page}</Text><Text x={273} y={y + 20}>{page}</Text>
      </g>;
      return <g key={page}>
        <rect x={86} y={y} width={63} height={29}/><Text x={76} y={y + 20}>{page}</Text>
        <Text x={118} y={y + 20}>{typeof page === 'number' && 'a' + page}</Text>
        <path d={`M155 ${y + 12}H259`} markerEnd={arrow}/><Text x={273} y={y + 20}>{page}</Text>
        <rect x={295} y={y} width={86} height={29}/><path d={`M338 ${y}v29`}/>
        <Text x={317} y={y + 20}>{Number(slot >= 0)}</Text><Text x={359} y={y + 20}>{slot >= 0 && slot + 1}</Text>
        {slot >= 0 && <path d={`M387 ${y + 12}L555 ${86 + slot * 29}`} markerEnd={arrow}/>}
      </g>;
    })}
    {[1, 2, 3, '⋮', 'n'].map((page, row) => {
      const y = 72 + row * 29;
      return <g key={page}>
        <Text x={572} y={y + 20}>{page}</Text>
        {page === '⋮' ? <path d={`M581 ${y}v29m63 -29v29`} strokeDasharray="3 3"/> : <rect x={581} y={y} width={63} height={29}/>}
        {row < 2 && <Text x={613} y={y + 20}>a{frames[row]}</Text>}
      </g>;
    })}
    {['M68 295l13 -19', 'M250 295l14 -19', 'M317 299v-18', 'M414 299l-49 -18', 'M529 237l31 -24'].map(path =>
      <path key={path} d={path} markerEnd={arrow}/>) }
    <Text x={62} y={316}>仮想ページ番号</Text><Text x={214} y={316}>仮想ページ番号</Text>
    <Text x={323} y={316}>存在ビット</Text><Text x={444} y={316}>物理ページ番号</Text>
    <Text x={493} y={254}>物理ページ番号</Text>
    <Text x={216} y={350}>補助記憶装置</Text>
    <path d="M58 381V439a158 20 0 0 0 316 0V381"/><ellipse cx="216" cy="381" rx="158" ry="22"/>
    <Text x={216} y={417}>プログラムA</Text>
    {[1, 2, 3, 4, 5].map((page, row) => <g key={page}>
      <rect x={64 + 61 * row} y="424" width="61" height="23"/><Text x={94 + 61 * row} y={440}>a{page}</Text>
    </g>)}
    <path d="M613 421H380" markerEnd={arrow}/><path d="M613 421V223" markerEnd={arrow}/>
  </>}</Drawing>;
}

function Database({ caption, values }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={databaseAlt(values)}>
    {databaseTables(values[0], values[1]).map(item => <div className="table-scroll" tabIndex={0} key={item.title}>
      <table aria-label={item.title || caption}>
        {item.title && <caption>{item.title}</caption>}
        <thead><tr>{item.columns.map((name, index) => <th key={name} scope="col" style={{ whiteSpace: 'nowrap' }}>
          {item.keys.includes(index) ? <u data-primary-key="true">{name}</u> : name}
        </th>)}</tr></thead>
        <tbody>{item.rows.map((row, index) => <tr key={index}>{row.map((text, column) =>
          <td key={column} style={{ whiteSpace: 'nowrap' }}>{text}</td>
        )}</tr>)}</tbody>
      </table>
    </div>)}
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Policy({ caption, values }: BookletFigureProps) {
  const rules = securityRules(values[0]);
  const underlined = '①耐タンパ性をもつもの';
  const [before, after] = rules[1].split(underlined);
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={securityPolicyAlt(values)}>
    <p style={{ textAlign: 'left' }}>〔{caption}〕</p>
    <ol style={{ textAlign: 'left' }}>{rules.map((text, index) => <li key={index}>{
      index === 1 ? <>{before}<u>{underlined}</u>{after}</> : index === 2 ? <u>{text}</u> : text
    }</li>)}</ol>
  </figure>;
}

function UserInfo({ caption, values }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={userInfoAlt(values)}>
    <div className="table-scroll" tabIndex={0}>
      <table aria-label={caption}>
        <thead><tr><th scope="col">利用者情報</th><th scope="col">説明</th></tr></thead>
        <tbody>{userInfoRows(values[0]).map(([name, text]) => <tr key={name}>
          <th scope="row" style={{ whiteSpace: 'nowrap' }}>{name}</th>
          <td><span className="table-cell-prose">{text}</span></td>
        </tr>)}
          <tr><td colSpan={2}>{userInfoExtra[0]}<br/>{userInfoExtra[1]}</td></tr>
        </tbody>
      </table>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const nodes = [
  { number: '①', x: 172, y: 52, lines: ['仮パスワード', '', 'なし'] },
  { number: '②', x: 464, y: 52, lines: ['有効', '執務室だけ許可', '執務室'] },
  { number: '③', x: 782, y: 52, lines: ['返却', '', 'なし'] },
  { number: '④', x: 172, y: 264, lines: ['一時利用停止', '', 'なし'] },
  { number: '⑤', x: 464, y: 197, lines: ['有効', '開発室許可', '執務室と開発室'] },
];

function State({ x, y, lines, number }: { x: number; y: number; lines: string[]; number?: string }) {
  return <g data-card-state={number}>
    {number && <Text x={x - 14} y={y + 12}>{number}</Text>}
    <rect x={x} y={y} width="156" height="81" rx="5" fill="var(--diagram-surface)"/>
    {!lines[1] && <rect x={x} y={y + 27} width="156" height="27" stroke="none" fill="var(--selected-surface)"/>}
    <path d={`M${x} ${y + 27}h156m-156 27h156`}/>
    {lines.map((text, index) => <Text key={index} x={x + 78} y={y + 19 + 27 * index}>{text}</Text>)}
  </g>;
}

function Security({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} alt={securityAlt()} width={952} height={475}>{arrow => <>
    <path d="M246 11h8v25h8l-12 16-12-16h8zM882 133h8v29h8l-12 16-12-16h8z" fill="currentColor" stroke="none"/>
    {['M329 92H462', 'M416 92V236h46', 'M250 134V262', 'M171 305H130V92h40',
      'M498 134V195', 'M586 196V135', 'M621 92H780', 'M621 236L860 134', 'M621 124h44v182H330'].map(path =>
      <path key={path} d={path} markerEnd={arrow}/>)}
    <path d="M542 279v27"/>
    {nodes.map(node => <State key={node.number} {...node}/>)}
    <Text x={369} y={67}>パスワード</Text><Text x={369} y={84}>変更</Text>
    <Text x={480} y={172}>α</Text><Text x={570} y={172}>β</Text>
    <Text x={701} y={82}>γ</Text><Text x={751} y={205}>δ</Text>
    <rect x="178" y="182" width="61" height="33" strokeWidth="2"/><Text x={209} y={204}>a</Text>
    {['セキュリティ', '管理者による', 'パスワード', '初期化'].map((text, row) =>
      <Text key={text} x={14} y={177 + 20 * row} left>{text}</Text>)}
    <Text x={16} y={371} left>注記　網掛けの部分は表示していない。</Text>
    <Text x={16} y={394} left>（凡例）</Text>
    <circle cx="59" cy="427" r="22"/><Text x={59} y={426}>状態</Text><Text x={59} y={443}>番号</Text>
    <State x={93} y={391} lines={['ICカードの状態', '入室許可の状態', '入室可能な部屋']}/>
  </>}</Drawing>;
}

export const legacy2013SpringPm0104FigureRenderers: BookletFigureRenderer[] = [
  { profile: profiles.color, component: Color }, { profile: profiles.colorBits, component: ColorBits },
  { profile: profiles.vram, component: Vram }, { profile: profiles.paging, component: Paging },
  { profile: profiles.database, component: Database }, { profile: profiles.securityPolicy, component: Policy },
  { profile: profiles.userInfo, component: UserInfo }, { profile: profiles.security, component: Security },
];
