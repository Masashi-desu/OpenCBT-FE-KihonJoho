import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { Legacy2017SystemsFigure } from './Legacy2017SystemsFigures';
import { legacy2017SystemsProfiles } from '../core/generators/legacy-2017-systems-models';
import {
  legacy2015SpringAm2753Profiles as profiles, pipelineModes, pipelineAlt, encryptionModes, encryptionAlt,
  curveModes, curveAlt, coverageModes, coverageAlt,
} from '../core/generators/legacy-2015-spring-am-27-53-figures';

function Drawing({ caption, description, width, height, children }: {
  caption: string; description: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId(), marker = id + '-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`,
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{description}</desc>
        <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fontSize="16" textAnchor="middle" fill="none" stroke="currentColor" strokeWidth="1.35">
          {children(`url(#${marker})`)}
        </g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function Pipeline({ values, caption }: BookletFigureProps) {
  const start = pipelineModes[values[0]].start;
  return <Drawing caption={caption} description={pipelineAlt(values)} width={615} height={75}>{arrow => <>
    {[['①', 187], ['②', 290], ['③', 393], ['実行', 496]].map(([label, x]) =>
      <g key={label} data-pipeline-node={label}>
        <rect x={x} y="17" width="66" height="42"/>
        <text x={Number(x) + 33} y="44" fill="currentColor" stroke="none">{label}</text>
      </g>)}
    <text x="16" y="44" textAnchor="start" fill="currentColor" stroke="none" data-pipeline-start={start}>{start}</text>
    <path d="M166 38h20" markerEnd={arrow}/>
    {[253, 356, 459].map(x => <path key={x} d={`M${x} 38h36`} markerEnd={arrow}/>)}
  </>}</Drawing>;
}

function Encryption({ values, caption }: BookletFigureProps) {
  const { sender, receiver, text, ciphertext } = encryptionModes[values[0]];
  return <Drawing caption={caption} description={encryptionAlt(values)} width={655} height={268}>{arrow => <>
    {[40, 408].map(x => <g key={x}>
      <path d={`M${x + 28} 10h205l-28 53h-205Z`}/>
      <path d={`M${x + 28} 204h205l-28 53h-205Z`}/>
      <text x={x + 116} y="43" fill="currentColor" stroke="none">“{text}”</text>
      <text x={x + 116} y="237" fill="currentColor" stroke="none">“{ciphertext}”</text>
    </g>)}
    {['M157 63v49', 'M157 151v52', 'M523 204v-53', 'M523 111V64',
      'M260 230h15', 'M385 230h35'].map(d => <path key={d} d={d} markerEnd={arrow}/>)}
    <rect x="62" y="113" width="190" height="38"/>
    <rect x="428" y="110" width="190" height="43"/>
    <ellipse cx="330" cy="230" rx="55" ry="22"/>
    <g fill="currentColor" stroke="none">
      <text x="33" y="137">{sender}さん</text>
      <text x="399" y="137">{receiver}さん</text>
      <text x="157" y="137">鍵Kによって暗号化</text>
      <text x="523" y="129" data-decryption-key={receiver + 'さんの秘密鍵'}>{receiver}さんの秘密鍵</text>
      <text x="523" y="147">によって復号</text>
      <text x="330" y="235">ネットワーク</text>
    </g>
  </>}</Drawing>;
}

function BugCurve({ values, caption }: BookletFigureProps) {
  const { control1, control2 } = curveModes[values[0]];
  const y = (percent: number) => 219 - percent * 1.8;
  return <Drawing caption={caption} description={curveAlt(values)} width={535} height={268}>{arrow => <>
    <path d="M177 219V14" markerEnd={arrow}/><path d="M177 219h322" markerEnd={arrow}/>
    <path d="M177 39h322M477 29v190" strokeDasharray="5 4"/>
    <path data-bug-curve="true" d={`M177 ${y(0)}C277 ${y(control1)} 377 ${y(control2)} 477 ${y(100)}`}/>
    <g fill="currentColor" stroke="none">
      <text x="169" y="45" textAnchor="end">バグ累積件数の目標値</text>
      <text x="157" y="80" style={{ writingMode: 'vertical-rl' }} textAnchor="start">バグ累積件数</text>
      <text x="329" y="246">テスト項目消化件数</text>
      <text x="477" y="243">X</text>
    </g>
  </>}</Drawing>;
}

function Coverage({ values, caption }: BookletFigureProps) {
  const { predicate, action } = coverageModes[values[0]];
  return <Drawing caption={caption} description={coverageAlt(values)} width={433} height={215}>{arrow => <>
    <path d="M145 13V43M145 43L37 81L145 119L253 81Z"/>
    <path data-branch="true" d="M253 81h83v30M336 148v28H145" markerEnd={arrow}/>
    <path data-branch="false" d="M145 119v83" markerEnd={arrow}/>
    <rect x="274" y="111" width="124" height="37"/>
    <g fill="currentColor" stroke="none">
      <text x="145" y="86" data-coverage-predicate={predicate}>{predicate}</text>
      <text x="270" y="73">真</text>
      <text x="127" y="137">偽</text>
      <text x="336" y="135">{action}</text>
    </g>
  </>}</Drawing>;
}

export const legacy2015SpringAm2753Renderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.ledger, component: props => <Legacy2017SystemsFigure profile={legacy2017SystemsProfiles.ledger} {...props}/> },
  { profile: profiles.pipeline, component: Pipeline },
  { profile: profiles.encryption, component: Encryption },
  { profile: profiles.curve, component: BugCurve },
  { profile: profiles.coverage, component: Coverage },
];
