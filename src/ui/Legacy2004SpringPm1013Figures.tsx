import { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { iteratorOutput } from '../core/generators/legacy-2004-spring-pm-12';

function IteratorResult({ caption, values }: BookletFigureProps) {
  const id = useId();
  const { lines, alt } = iteratorOutput.panel(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'} viewBox="0 0 205 82"
        style={{ display: 'block', width: 'calc(205px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <rect x="9" y="9" width="187" height="64" stroke="currentColor" fill="none"/>
        {lines.map((text, index) => <text x="22" y={34 + 22 * index} fill="currentColor"
          fontSize="17" fontFamily="monospace" key={index}>{text}</text>)}
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2004SpringPm1013FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: iteratorOutput.profile, component: IteratorResult },
];
