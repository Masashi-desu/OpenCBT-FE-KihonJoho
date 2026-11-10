import { LegacyCommonGateSymbol } from './Legacy2017AutumnAmCommonRules';
import { legacy2017AutumnAmCommonHeading, legacy2017AutumnAmCommonNote, legacy2017AutumnAmCommonPremise,
  legacy2017AutumnAmCommonRows } from '../core/generators/legacy-2017-autumn-am-common';
import { spring2012CircuitRows } from '../core/generators/legacy-2012-spring-am-common';

const circuitPaths = {
  resistor: 'M8 24H28L32 15L39 33L46 15L53 33L60 15L67 33L74 15L78 24H102',
  ground: 'M55 4V21M32 21H76M41 21L33 39M54 21L46 39M67 21L59 39',
} as const;

export function Legacy2012SpringAmCommonRules({ values, caption }: { values: readonly number[]; caption: string }) {
  if (values.length !== 1 || values[0] !== 0) throw Error('AM_COMMON_PROFILE');
  return <section className="legacy2017-autumn-am-common" data-common-reference="2012h24h-fe-am-p2">
    <h3>{legacy2017AutumnAmCommonHeading}</h3>
    <p>{legacy2017AutumnAmCommonPremise}</p>
    <h4>Ⅰ．論理回路</h4>
    <div className="table-scroll"><table aria-label={caption ?? '図記号と説明'}>
      <thead><tr><th scope="col">図記号</th><th scope="col">説明</th></tr></thead>
      <tbody>{legacy2017AutumnAmCommonRows.map(row => <tr key={row.id}>
        <td><LegacyCommonGateSymbol kind={row.id} label={row.label}/></td><td>{row.label}</td>
      </tr>)}</tbody>
    </table></div>
    <p>{legacy2017AutumnAmCommonNote}</p>
    <h4>Ⅱ．回路記号</h4>
    <div className="table-scroll"><table aria-label="回路記号の図記号と説明">
      <thead><tr><th scope="col">図記号</th><th scope="col">説明</th></tr></thead>
      <tbody>{spring2012CircuitRows.map(row => <tr key={row.id}>
        <td><svg viewBox="0 0 110 48" role="img" aria-label={row.label} data-common-circuit={row.id}>
          <path d={circuitPaths[row.id]} fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg></td><td>{row.label}</td>
      </tr>)}</tbody>
    </table></div>
  </section>;
}
