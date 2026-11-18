import { Fragment, useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { description, formatCells, names, profile, stockCells, stockConditions, surveyConditions } from '../core/generators/legacy-2005-spring-pm-06-09-figures';
import { selectCase } from '../core/generators/legacy-2016-autumn-pm-09-13-support';

function SurveyForm({ caption, values, styleName }: BookletFigureProps & { styleName: '7-age-form' | '7-purpose-form' }) {
  const condition = selectCase(values, 4);
  const { ages, jobs, purposes, firstRow } = surveyConditions[condition];
  const age = styleName === '7-age-form';
  const titleLine = firstRow >= 6 ? 2 : 1;
  const headerLine = firstRow - 2;
  const rows = age ? ages.map(item => item.label) : jobs;
  const columns = [...(age ? jobs : purposes), '合計'];
  const rowSpanWidth = columns.length + 1;
  const showMargin = (line: number) => line + ' →';
  return <figure className="source-figure" data-cohort-figure={styleName}>
    <div className="table-scroll" role="region" aria-label={caption + 'の表示'} tabIndex={0}>
      <table aria-label={caption}>
        <thead>
          {Array.from({ length: headerLine - 1 }, (_, i) => {
            const line = i + 1;
            return <tr key={line} data-print-line={age ? line : undefined}>{age && <th scope="row">{showMargin(line)}</th>}
              <td colSpan={rowSpanWidth}>{line === titleLine ? caption : '\u00a0'}</td></tr>;
          })}
          <tr data-print-line={age ? headerLine : undefined}>
            {age && <th scope="col" aria-label="行番号">{showMargin(headerLine)}</th>}
            <th scope="col">{age ? '年代' : '職業'}</th>
            {columns.map(column => <th key={column} scope="col">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr data-print-line={age ? firstRow - 1 : undefined}>
            {age && <th scope="row">{showMargin(firstRow - 1)}</th>}<td colSpan={rowSpanWidth}>&nbsp;</td>
          </tr>
          {rows.map((row, i) => {
            const line = firstRow + i * 2;
            return <Fragment key={row}>
              <tr data-print-line={age ? line : undefined}>
                {age && <th scope="row">{showMargin(line)}</th>}
                <th scope="row">{row}</th>
                {columns.map(column => <td key={column}>{age ? 'zzz,zz9' : '\u00a0'}</td>)}
              </tr>
              {i + 1 < rows.length && <tr data-print-line={age ? line + 1 : undefined}>
                {age && <th scope="row">{showMargin(line + 1)}</th>}<td colSpan={rowSpanWidth}>&nbsp;</td></tr>}
            </Fragment>;
          })}
        </tbody>
      </table>
    </div>
  </figure>;
}

function WordRow({ cells, widths, start, y }: { cells: readonly (number | string)[]; widths: readonly number[]; start: number; y: number }) {
  return <g>{cells.map((cell, i) => {
    const x = start + widths.slice(0, i).reduce((sum, width) => sum + width, 0);
    const width = widths[i];
    return <g key={i}>
      <rect x={x} y={y} width={width} height={29} fill="none" stroke="currentColor" />
      <text x={x + width / 2} y={y + 19} textAnchor="middle">{cell}</text>
    </g>;
  })}</g>;
}

function Inventory({ caption, values, styleName }: BookletFigureProps & { styleName: '9-format' | '9-stock-example' }) {
  const condition = selectCase(values, 4);
  const example = styleName === '9-stock-example';
  const titleId = useId();
  const descriptionId = useId();
  const cells = example ? stockCells(condition) : formatCells;
  const widths = example ? cells.map(() => 35) : [36, 96, 82, 96, 82, 36, 96, 82];
  const width = 665;
  const height = example ? 143 : 58;
  return <figure className="managed-diagram source-figure" data-cohort-figure={styleName}>
    <div className="diagram-scroll" role="region" aria-label={caption + 'の表示'} tabIndex={0}>
      <svg role="img" aria-labelledby={titleId} aria-describedby={descriptionId}
        viewBox={'0 0 ' + width + ' ' + height} fontSize={14} fontFamily="inherit" fill="currentColor"
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          maxWidth: 'none', height: 'auto', marginInline: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={titleId}>{caption}</title>
        <desc id={descriptionId}>{description(styleName, condition)}</desc>
        {example && <g>
          <text x={76} y={38}>GR1</text>
          <rect x={116} y={20} width={80} height={28} fill="none" stroke="currentColor" />
          <text x={180} y={38} textAnchor="end">{stockConditions[condition].key}</text>
          <path d="M42.5 113 V101 m-4 5 4 -5 4 5" stroke="currentColor" fill="none" />
          <text x={42.5} y={131} textAnchor="middle">（GR2）</text>
        </g>}
        <WordRow cells={cells} widths={widths} start={25} y={example ? 69 : 12} />
      </svg>
    </div>
    {!example && <figcaption>{caption}</figcaption>}
  </figure>;
}

export const legacy2005SpringPm0609FigureRenderers: readonly BookletFigureRenderer[] = names.map(name => ({
  profile: profile(name),
  component: (props: BookletFigureProps) => name === '7-age-form' || name === '7-purpose-form'
    ? <SurveyForm {...props} styleName={name} /> : <Inventory {...props} styleName={name} />,
}));
