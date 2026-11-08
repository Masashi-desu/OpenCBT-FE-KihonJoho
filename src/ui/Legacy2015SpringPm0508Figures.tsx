import { Fragment, useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { ContentBlank, ContentParagraph } from './ContentText';
import { legacy2015SpringPm0508Figures } from '../core/generators/legacy-2015-spring-pm-05-08-figures';
import { spring2015Pm0508BlankPattern } from '../core/generators/legacy-2015-spring-pm-05-08-shared';
import { spring2015Pm0508Banks as banks, spring2015Pm0508Source as source } from '../core/generators/legacy-2015-spring-pm-05-08-source';
import { spring2015Pm5Model } from '../core/generators/legacy-2015-spring-pm-5';
import { spring2015Pm6Model } from '../core/generators/legacy-2015-spring-pm-6';
import {
  spring2015Pm7Display, spring2015Pm7DisplayFlows, spring2015Pm7FlowLabels,
  spring2015Pm7Outline, spring2015Pm7YearLabels,
} from '../core/generators/legacy-2015-spring-pm-7';

const ink = 'var(--diagram-ink)';
const stroke = { stroke: ink, fill: 'none' };
const box = { stroke: ink, fill: 'var(--surface)' };
function Svg({ width, height, minimum = width, children }: { width: number; height: number; minimum?: number; children: ReactNode }) {
  return <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} fill={ink}
    style={{ display: 'block', marginInline: 'auto', width: `calc(min(100%, ${width}px) * var(--image-scale, 1))`,
      minWidth: `calc(${minimum}px * var(--image-scale, 1))`, height: 'auto', fontSize: 15 }}>{children}</svg>;
}
const heads = (columns: readonly string[]) => columns.map(column => <th key={column} scope="col">{column}</th>);
const segments = (text: string) => text.split(spring2015Pm0508BlankPattern).map((value, i) =>
  i % 2 === 0 ? value : { blank: value === '空欄' ? '' : value });
const blankCell = (text: string) => /^［[a-g]］$/.test(text) ? <ContentBlank blank={text[1]} /> : text;

function CustomerExample() {
  const model = source['q5-customer-example'];
  return <><table><caption>{model.caption}</caption><thead><tr>{heads(model.headers)}</tr></thead>
    <tbody>{model.rows.map((row, i) => <tr key={row[0]}>{row.map((value, j) =>
      <td key={j}>{model.underlinedCells.some(([r, c]) => r === i && c === j) ? <u>{value}</u> : value}</td>)}</tr>)}</tbody>
  </table><p>{model.note}</p></>;
}

const erPositions = [
  [22, 24, 160], [227, 24, 251], [524, 24, 177], [22, 254, 169],
  [274, 212, 144], [495, 249, 242], [226, 431, 242], [33, 470, 160],
] as const;
const erPaths = [
  'M182 76H227', 'M348 212V140', 'M612 221V249', 'M418 296H495', 'M191 309H274', 'M348 382V431', 'M226 543H193',
];
function EntityRelationships() {
  const marker = useId();
  const er = source['q5-er'];
  return <Svg width={757} height={700} minimum={700}>
    <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M1 1L9 5L1 9" {...stroke}/>
    </marker></defs>
    {er.edges.map(([from, to], i) => <path key={from + to} d={erPaths[i]} {...stroke} markerEnd={`url(#${marker})`} data-er-edge={from + '→' + to} />)}
    {er.entities.map(([name, fields, keys], i) => {
      const [x, y, width] = erPositions[i];
      const rowCount = fields.length + (name === '関係顧客' ? 1 : 0);
      return <g key={name} data-er-entity={name}>
        <rect x={x} y={y} width={width} height={35 + rowCount * 27} {...box} />
        <path d={`M${x} ${y + 35}h${width}`} {...stroke} /><text x={x + 8} y={y + 23}>{name}</text>
        {fields.map((field, j) => {
          const height = y + 35 + (j + 1) * 27 - 7;
          const label = field.startsWith('契約に対する関係（') ? '契約に対する関係' : field;
          const key = (keys as readonly string[]).includes(label);
          return /^［[a-d]］$/.test(label) ? <g key={label} data-blank={label[1]}>
            <rect x={x + 8} y={height - 16} width="92" height="19" {...box}/>
            <text x={x + 54} y={height - 1} textAnchor="middle">{label[1]}</text>
            {key && <path d={`M${x + 8} ${height + 5}h92`} {...stroke}/>}
          </g> : <g key={label}>
            <text x={x + 8} y={height} textDecoration={key ? 'underline' : undefined}>{label}</text>
            {label !== field && <text x={x + 15} y={height + 25}>{field.slice(label.length)}</text>}
          </g>;
        })}
      </g>;
    })}
    <text x="23" y="656">凡例　枠の上段はエンティティ名，下段は属性名。属性名の実線の下線は主キー。</text>
    <path d="M23 676h58" {...stroke} markerEnd={`url(#${marker})`}/><text x="89" y="681">1対多</text>
  </Svg>;
}

function FunctionTree() {
  const tree = source['q5-tree'], parentRows = [41, 163, 285];
  const leafRows = [[62, 93, 124], [184, 215, 246], [306, 337]];
  return <Svg width={790} height={361} minimum={700}>
    <rect x="19" y="21" width="170" height="30" {...box} /><text x="104" y="41" textAnchor="middle">{tree.root}</text>
    <path d="M189 36h26v249" {...stroke} />
    {tree.branches.map(([branch, children], i) => {
      const parentY = parentRows[i], ys = leafRows[i];
      return <g key={branch}>
        <path d={`M215 ${parentY}h37M467 ${parentY}h29V${ys.at(-1)}`} {...stroke} />
        <rect x="252" y={parentY - 15} width="215" height="30" {...box} />
        <text x="259" y={parentY + 5}>{branch}</text>
        {children.map((child, j) => <g key={child}>
          <path d={`M496 ${ys[j]}h25`} {...stroke} />
          <rect x="521" y={ys[j] - 13} width="246" height="26" {...box} /><text x="531" y={ys[j] + 5}>{child}</text>
        </g>)}
      </g>;
    })}
  </Svg>;
}

function CrudTable({ values }: BookletFigureProps) {
  const { rows, columns } = spring2015Pm5Model(values), model = source['q5-crud'];
  return <><table><caption>{model.caption}</caption>
    <thead><tr><th scope="col" className="diagonal-heading" aria-label="エンティティと機能" />{heads(columns)}</tr></thead>
    <tbody>{rows.map(([entity, operations]) => <tr key={entity}><th scope="row">{entity}</th>
      {operations.map((operation, i) => <td key={i} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{blankCell(operation)}</td>)}
    </tr>)}</tbody>
  </table><p>{model.notes}</p></>;
}

function Organization() {
  const org = source['q6-org'];
  return <Svg width={484} height={141} minimum={418}>
    <rect x="114" y="12" width="256" height="30" {...box} />
    <text x="242" y="32" textAnchor="middle">{org.root}</text>
    <path d="M242 42v54M82 96V70h320v26" {...stroke}/>
    {org.children.map((team, i) => <g key={team}>
      <rect x={32 + i * 160} y="96" width="100" height="30" {...box}/>
      <text x={82 + i * 160} y="116" textAnchor="middle">{team}</text>
    </g>)}
  </Svg>;
}

function CommunicationPlan({ values, caption }: BookletFigureProps) {
  const { subtables } = spring2015Pm6Model(values);
  return <div style={{ border: '1px solid var(--line)', padding: '.6em', textAlign: 'start' }} aria-label={caption}>
    <p>2. 計画</p>
    {subtables.map(t => <Fragment key={t.heading}>
      <table><caption>{t.heading}</caption><thead><tr>{heads(t.columns)}</tr></thead><tbody>
        {t.rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}
      </tbody></table>
      {'note' in t && <p>注記　{t.note}</p>}
    </Fragment>)}
  </div>;
}

function Relations() {
  const graph = source['q6-edges'];
  const locations = { A: [49, 91], B: [140, 68], C: [140, 114], D: [239, 44], E: [239, 91] };
  return <Svg width={548} height={149} minimum={455}>
    {graph.graphs.map(({ label, edges }, i) => {
      const nodes = [...new Set(edges.flat())];
      const x = i ? 273 : 30;
      const point = (name: keyof typeof locations) =>
        i ? locations[name] : name === 'A' ? [49, 76] : [139, 76];
      return <g key={label} transform={`translate(${x} 0)`}>
        <text x="12" y="20">{label}</text>
        {edges.map(([from, to]) => {
          const [x1, y1] = point(from), [x2, y2] = point(to);
          return <line key={from + to} x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} data-communication-edge={from + '-' + to}/>;
        })}
        {nodes.map(name => {
          const [cx, cy] = point(name);
          return <g key={name}><circle cx={cx} cy={cy} r="17" {...box}/><text x={cx} y={cy + 5} textAnchor="middle">{name}</text></g>;
        })}
      </g>;
    })}
  </Svg>;
}

const gw = source['q6-gw'];
function PermissionHead({ numbered }: { numbered: boolean }) {
  return <thead><tr>
    {numbered && <><th scope="col" rowSpan={2}>項番</th><th scope="col" rowSpan={2}>文書名</th></>}
    <th scope="col" rowSpan={2}>PM</th>
    {gw.columnGroups.map(([team, span]) => <th key={team} scope="colgroup" colSpan={span}>{team}</th>)}
  </tr><tr>{gw.columnGroups.flatMap(([team]) =>
    ['TL', '担当者'].map(role => <th key={team + role} scope="col">{role}</th>))}</tr></thead>;
}
const permissionCell = (mark: string, i: number) => <td key={i} className={mark === 'masked' ? 'omitted-cell' : undefined}
  style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{mark === 'masked' ? <span className="sr-only">原資料で非表示の部分</span> : mark}</td>;

function Groupware() {
  return <><table><caption>{gw.caption}</caption><PermissionHead numbered />
    <tbody>{gw.rows.map(([number, title, marks]) => <tr key={number}>
      <td>{number}</td><th scope="row">{title}</th>
      {'blank' in marks ? <td colSpan={marks.colspan} style={{ textAlign: 'center' }}><ContentBlank blank={marks.blank} /></td>
        : marks.map(permissionCell)}
    </tr>)}</tbody>
  </table><p>注記　{gw.legend.masked}</p>
  {(['●', '○', '×'] as const).map(mark => <p key={mark}>{mark}：プロジェクト管理文書の{gw.legend[mark]}</p>)}</>;
}

function PermissionChoice({ values }: BookletFigureProps) {
  return <table aria-label="議事録の登録と参照に関する権限"><PermissionHead numbered={false} />
    <tbody><tr>{banks[6].g[values[1]].map(permissionCell)}</tr></tbody>
  </table>;
}

function InvestmentOutline({ values, caption }: BookletFigureProps) {
  const rows = spring2015Pm7Outline(values);
  return <table><caption>{caption}（単位：万円）</caption><thead>
    <tr><th scope="col" colSpan={2} aria-label="内訳" /><th scope="col">A案</th><th scope="col">B案</th></tr>
  </thead><tbody>{rows.map(([group, label, a, b], i) => <tr key={label}>
    {(i === 0 || i === 3) && <th scope="rowgroup" rowSpan={i === 0 ? 3 : 1}>{group}</th>}
    <th scope="row">{label}</th>
    {[a, b].map((text, j) => <td key={j}>{text.split('\n').map(line => <div key={line}>{line}</div>)}</td>)}
  </tr>)}</tbody></table>;
}

function InvestmentFlows({ values, caption, includePresent }: BookletFigureProps & { includePresent: boolean }) {
  const plans = spring2015Pm7DisplayFlows(values, includePresent);
  return <><table><caption>{caption}（単位：万円）</caption><thead>
    <tr><th scope="col" colSpan={2} aria-label="内訳" />{heads(spring2015Pm7YearLabels)}</tr>
  </thead>{plans.map((rows, i) => <tbody key={i}>
    {rows.map((row, j) => <tr key={j}>
      {j === 0 && <th scope="rowgroup" rowSpan={rows.length}>{i === 0 ? 'A案' : 'B案'}</th>}
      <th scope="row">{spring2015Pm7FlowLabels[j]}</th>
      {row.map((raw, k) => <td key={k} className={raw === '網掛け' ? 'omitted-cell' : undefined}
        style={{ textAlign: 'end', whiteSpace: 'nowrap' }}>
        {raw === '網掛け' ? <span className="sr-only">原資料で非表示の部分</span> : spring2015Pm7Display(raw)}
      </td>)}
    </tr>)}
  </tbody>)}</table>{includePresent && <p>注記　網掛けは表示していない。</p>}</>;
}

function SelectProgram() {
  const model = source['q8-program'];
  return <div style={{ display: 'grid', gridTemplateColumns: '3em max-content 8em', width: 'max-content', textAlign: 'start',
    lineHeight: 1.5, fontFamily: 'monospace', fontSize: 'calc(1em * var(--image-scale, 1))' }}>
    {model.lines.map(([line, depth, kind, text, comment]) => {
      const glyph = kind === 'if' ? '▲' : kind === 'ifEnd' ? '▼' :
        kind === 'while' || kind === 'loopEnd' ? '■' : kind === 'statement' ? '・' : '';
      return <Fragment key={line}>
        <span style={{ gridColumn: 1, gridRow: line }}>{line}</span>
        <code style={{ display: 'flex', alignItems: 'center', gridColumn: 2, gridRow: line, whiteSpace: 'nowrap' }}>
          {Array.from({ length: depth }, (_, i) => <span key={i} aria-hidden="true"
            style={{ display: 'inline-block', width: '1.1em', alignSelf: 'stretch', borderInlineStart: `1px solid ${ink}` }}/>)}
          <span>{glyph}{text}{comment && '　 /* ' + comment + ' */'}</span>
        </code>
      </Fragment>;
    })}
    {Object.entries(model.markers).map(([marker, lines]) =>
      <div key={marker} data-code-marker={marker} style={{ display: 'flex', alignItems: 'center', paddingInline: '.5em',
        gridColumn: 3, gridRow: `${lines[0]} / ${lines.at(-1)! + 1}`,
        borderInlineStart: lines.length > 1 ? `1px solid ${ink}` : undefined }}>
        <span aria-hidden="true">◀</span>
        <span aria-hidden="true" style={{ flex: 1, borderBlockStart: `2px solid ${ink}` }}/>
        <span>{marker}</span>
      </div>)}
  </div>;
}

type RenderItem = { native?: boolean; caption?: boolean; Component: (props: BookletFigureProps) => ReactNode };
const components: Record<string, RenderItem> = {
  '5-customer-example': { native: true, caption: false, Component: CustomerExample },
  '5-er': { Component: EntityRelationships },
  '5-tree': { Component: FunctionTree },
  '5-crud': { native: true, caption: false, Component: CrudTable },
  '6-org': { Component: Organization },
  '6-plan': { native: true, Component: CommunicationPlan },
  '6-edges': { Component: Relations },
  '6-gw': { native: true, caption: false, Component: Groupware },
  '6-permissions-choice': { native: true, caption: false, Component: PermissionChoice },
  '7-outline': { native: true, caption: false, Component: InvestmentOutline },
  '7-flow': { native: true, caption: false, Component: props => <InvestmentFlows {...props} includePresent={false} /> },
  '7-pv': { native: true, caption: false, Component: props => <InvestmentFlows {...props} includePresent /> },
  '8-program': { caption: true, Component: SelectProgram },
};

export const legacy2015SpringPm0508FigureRenderers: BookletFigureRenderer[] = legacy2015SpringPm0508Figures.map(({ profile, alt }) => {
  const kind = profile.slice('legacy-2015-spring-pm-'.length);
  if (/^[5-8]-text-/.test(kind)) return { profile, component: ({ values }) => {
    const text = alt(values);
    return <ContentParagraph text={text} segments={segments(text)} />;
  } };
  const item = components[kind];
  if (!item) throw new Error('FIGURE_PROFILE');
  const { Component } = item;
  return { profile, component: props => <figure className="managed-diagram source-figure" data-source-profile={kind}>
    {kind === '8-program' && <figcaption>{props.caption}</figcaption>}
    <div className={item.native ? 'table-scroll' : 'diagram-scroll'} tabIndex={0} aria-label={props.caption}>
      {item.native ? <Component {...props} /> : <div role="img" aria-label={alt(props.values)}><Component {...props} /></div>}
    </div>
    {item.caption !== false && kind !== '8-program' && <figcaption>{props.caption}</figcaption>}
  </figure> };
});
