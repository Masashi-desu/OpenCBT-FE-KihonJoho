import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { directoryFigure, notationFigure, overlayFigure } from '../core/generators/legacy-2004-spring-am-27-53-figures';

type SceneProps = {
  caption: string;
  alt: string;
  width: number;
  height: number;
  children: ReactNode;
  arrowId?: string;
};
function Scene({ caption, alt, width, height, children, arrowId }: SceneProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'} viewBox={'0 0 ' + width + ' ' + height}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        {arrowId && <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 2 1 L 10 5 L 2 9" fill="none" stroke="currentColor"/>
        </marker></defs>}
        <g fill="currentColor" fontSize="15">{children}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

type Position = readonly [number, number];

function Directory({ caption, values }: BookletFigureProps) {
  const { paths, alt } = directoryFigure.panel(values);
  const positions: Record<string, Position> = {
    '': [244, 28], A: [150, 92], B: [340, 92], 'A¥A': [95, 154], 'A¥B': [204, 154], 'B¥A': [287, 154],
    'B¥B': [394, 154], 'A¥A¥A': [48, 218], 'A¥B¥A': [162, 218], 'A¥B¥B': [241, 218],
  };
  return <Scene caption={caption} alt={alt} width={442} height={239}>
    <text x={244} y={25} textAnchor="middle">ルート</text>
    {paths.map(path => {
      const [x, y] = positions[path];
      const [px, py] = positions[path.includes('¥') ? path.slice(0, path.lastIndexOf('¥')) : ''];
      return <g key={path}>
        <path data-directory={path} d={'M ' + px + ' ' + (py + 8) + ' L ' + x + ' ' + (y - 18)} fill="none" stroke="currentColor"/>
        <text x={x} y={y} textAnchor="middle">{path.slice(-1)}</text>
      </g>;
    })}
  </Scene>;
}

function Overlay({ caption, values }: BookletFigureProps) {
  const { members, alt } = overlayFigure.panel(values);
  const placements = [[277, 28, 47], [199, 75, 47], [365, 75, 84], [143, 122, 84], [255, 122, 41], [197, 206, 50], [356, 206, 43]];
  return <Scene caption={caption} alt={alt} width={447} height={276}>
    <path d="M 96 28 V 257 l -5 -7 m 5 7 5 -7 M 199 75 H 365 M 143 122 H 255" fill="none" stroke="currentColor"/>
    <path d="M 122 206 H 405" fill="none" stroke="currentColor" strokeDasharray="3 3"/>
    <text x={20} y={104}>主記憶の</text><text x={20} y={125}>領域</text>
    {[...members, 'F', 'G'].map((module, index) => {
      const [x, y, height] = placements[index];
      return <g key={module} data-module={module}>
        <rect x={x - 4} y={y} width="8" height={height}/>
        <text x={x + 13} y={y + 27}>{module}</text>
      </g>;
    })}
  </Scene>;
}

function Notation({ caption, values }: BookletFigureProps) {
  const arrowId = useId();
  const { kind, alt } = notationFigure.panel(values);
  const edge = (d: string) => <path d={d} fill="none" stroke="currentColor" markerEnd={'url(#' + arrowId + ')'}/>;
  const label = (x: number, y: number, text: string) => <text x={x} y={y} textAnchor="middle">{text}</text>;
  const oval = (x: number, y: number, text: string) => <g>
    <rect x={x - 49} y={y - 18} width="98" height="36" rx="18" fill="none" stroke="currentColor"/>
    {label(x, y + 5, text)}
  </g>;

  if (kind === 'data') return <Scene caption={caption} alt={alt} width={600} height={303} arrowId={arrowId}>
    <rect x="21" y="35" width="104" height="34" fill="none" stroke="currentColor"/>
    {label(73, 57, '顧客')}
    {[[249, '顧客マスタ'], [492, '商品マスタ']].map(([x, text]) => <g key={text}>
      <path d={'M ' + (Number(x) - 61) + ' 35 h 122 M ' + (Number(x) - 61) + ' 69 h 122'} stroke="currentColor"/>
      {label(Number(x), 57, String(text))}
    </g>)}
    {[[149, 133, '受注'], [453, 133, '在庫確認'], [149, 239, '出荷指示'], [453, 239, '売上計上']].map(([x, y, text]) =>
      <g key={text}>
        <circle cx={x} cy={y} r="36" fill="none" stroke="currentColor"/>
        {label(Number(x), Number(y) + 5, String(text))}
      </g>)}
    {edge('M 73 69 L 125 106')}{label(81, 101, '注文')}
    {edge('M 246 69 L 180 113')}
    {edge('M 482 69 L 464 98')}
    {edge('M 185 133 H 417')}{label(305, 122, '受注伝票')}
    {edge('M 418 145 L 183 226')}{label(305, 163, '出荷指示書')}
    {edge('M 453 169 V 202')}{label(528, 196, 'チェック済受注伝票')}
    {edge('M 185 239 H 417')}{label(305, 229, '出荷済報告書')}
  </Scene>;

  if (kind === 'state') return <Scene caption={caption} alt={alt} width={610} height={171} arrowId={arrowId}>
    <circle cx="25" cy="86" r="6"/>
    {edge('M 32 86 H 65')}
    {oval(116, 86, '待機')}{oval(322, 86, '計測中')}{oval(524, 86, '一時停止')}
    {edge('M 166 77 Q 218 27 273 77')}{label(219, 43, '開始')}
    {edge('M 272 95 Q 220 145 165 95')}{label(219, 145, '終了')}
    {edge('M 372 77 Q 424 27 475 77')}{label(425, 43, '中断')}
    {edge('M 475 95 Q 424 145 371 95')}{label(425, 145, '再開')}
  </Scene>;

  if (kind === 'flow') return <Scene caption={caption} alt={alt} width={419} height={353} arrowId={arrowId}>
    {oval(174, 31, '開始')}{oval(174, 317, '終了')}
    <rect x={111} y={72} width={126} height={38} fill="none" stroke="currentColor"/>
    {label(174, 96, '数量を読む')}
    <path d="M 174 130 L 245 165 L 174 200 L 103 165 Z" fill="none" stroke="currentColor"/>
    {label(174, 170, '数量＞0？')}
    <rect x={111} y={239} width={126} height={38} fill="none" stroke="currentColor"/>
    {label(174, 263, '合計へ加算')}
    {edge('M 174 49 V 71')}{edge('M 174 110 V 129')}{edge('M 174 200 V 238')}
    {edge('M 174 277 V 298')}{edge('M 246 165 H 347 V 317 H 224')}
    {label(150, 222, 'はい')}{label(294, 154, 'いいえ')}
  </Scene>;

  return <Scene caption={caption} alt={alt} width={455} height={216} arrowId={arrowId}>
    {[[110, 58, '部品A'], [110, 151, '部品B'], [365, 104, '完成']].map(([x, y, text]) =>
      <g key={text}>
        <circle cx={x} cy={y} r="25" fill="none" stroke="currentColor"/>
        {Number(x) < 200 && <circle cx={x} cy={y} r="4"/>}
        {label(Number(x), Number(y) + 50, String(text))}
      </g>)}
    <rect x="225" y="71" width="9" height="67"/>
    {edge('M 135 58 L 224 88')}{edge('M 135 151 L 224 119')}{edge('M 234 104 H 339')}
  </Scene>;
}

export const legacy2004SpringAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: directoryFigure.definition.profile, component: Directory },
  { profile: overlayFigure.definition.profile, component: Overlay },
  { profile: notationFigure.definition.profile, component: Notation },
];
