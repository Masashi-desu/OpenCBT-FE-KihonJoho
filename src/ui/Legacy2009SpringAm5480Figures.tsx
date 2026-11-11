import React, { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { improvementFlow, improvementSteps } from '../core/generators/legacy-2009-spring-am-54-80-figures';

function ImprovementFlow({ caption, values }: BookletFigureProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" data-figure-profile={improvementFlow.profile} tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox="0 0 314 336" role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(314px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-description'}>{improvementFlow.alt(values)}</desc>
        <g aria-hidden="true" fontSize="16" textAnchor="middle">
          {improvementSteps.map((step, index) =>
            <g key={step} transform={`translate(0 ${6 + index * 55})`}>
              <text x="55" y="22" fill="currentColor">ステップ{index + 1}</text>
              <rect x="109" y="0" width="194" height="33" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <text x="206" y="22" fill="currentColor">{step}</text>
              {index + 1 < improvementSteps.length &&
                <path d="M206 33V54m-5-7 5 7 5-7" fill="none" stroke="currentColor" strokeWidth="1.5" />}
            </g>)}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2009SpringAm5480FigureRenderers: BookletFigureRenderer[] = [
  { profile: improvementFlow.profile, component: ImprovementFlow },
];
