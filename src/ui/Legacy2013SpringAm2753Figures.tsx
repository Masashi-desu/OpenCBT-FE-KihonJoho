import { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { spring2013Am2753Profiles, spring2013FtthAlt } from '../core/generators/legacy-2013-spring-am-27-53-figures';

function FtthNetwork({ caption }: BookletFigureProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox="0 0 636 154" role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', marginInline: 'auto', width: 'calc(636px * var(--image-scale, 1))',
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{spring2013FtthAlt()}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="14" y="31" width="390" height="109"/>
          <rect x="32" y="42" width="63" height="26"/>
          <rect x="32" y="105" width="63" height="26"/>
          <rect x="128" y="74" width="62" height="26"/>
          <rect x="218" y="74" width="68" height="26"/>
          <rect x="316" y="74" width="65" height="26"/>
          <path d="M95 55L128 74M95 118L128 100M190 87H218M286 87H316M381 87H622"/>
          <g fill="currentColor" stroke="none" textAnchor="middle" fontSize="16">
            <text x="362" y="24">利用者宅内</text>
            <text x="64" y="61">PC</text>
            <text x="64" y="94">⋮</text>
            <text x="64" y="124">PC</text>
            <text x="159" y="93">ハブ</text>
            <text x="252" y="93">装置A</text>
            <text x="348" y="93">ONU</text>
            <text x="526" y="77">光ファイバケーブル（FTTH）</text>
          </g>
        </g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

export const legacy2013SpringAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: spring2013Am2753Profiles.ftth, component: FtthNetwork },
];
