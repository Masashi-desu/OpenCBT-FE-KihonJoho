import {
  legacy2017AutumnAmCommonHeading, legacy2017AutumnAmCommonNote,
  legacy2017AutumnAmCommonPremise, legacy2017AutumnAmCommonRows,
} from '../core/generators/legacy-2017-autumn-am-common';
import { LegacyCommonGateSymbol } from './Legacy2017AutumnAmCommonRules';

export function Legacy2011AutumnAmCommonGates({ caption }: { caption?: string }) {
  return <section className="legacy2017-autumn-am-common" data-common-reference="2011h23a-fe-am-p2">
    <h3>{legacy2017AutumnAmCommonHeading}</h3>
    <p>{legacy2017AutumnAmCommonPremise}</p>
    <div className="table-scroll"><table aria-label={caption}>
      <thead><tr><th scope="col">図記号</th><th scope="col">説明</th></tr></thead>
      <tbody>{legacy2017AutumnAmCommonRows.map(row => <tr key={row.id}>
        <td><LegacyCommonGateSymbol kind={row.id} label={row.label} /></td><td>{row.label}</td>
      </tr>)}</tbody>
    </table></div>
    <p>{legacy2017AutumnAmCommonNote}</p>
  </section>;
}
