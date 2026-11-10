import { legacy2017AutumnAmCommonNote, legacy2017AutumnAmCommonRows } from '../core/generators/legacy-2017-autumn-am-common';
import { LegacyCommonGateSymbol } from './Legacy2017AutumnAmCommonRules';

export function Legacy2013AutumnAmCommonGates({ caption }: { caption?: string }) {
  return <section className="legacy2017-autumn-am-common" data-common-reference="2013h25a-fe-am-p3">
    <h3>2. 論理回路</h3>
    <div className="table-scroll"><table aria-label={caption}>
      <thead><tr><th scope="col">図記号</th><th scope="col">説明</th></tr></thead>
      <tbody>{legacy2017AutumnAmCommonRows.map(row => <tr key={row.id}>
        <td><LegacyCommonGateSymbol kind={row.id} label={row.label} /></td><td>{row.label}</td>
      </tr>)}</tbody>
    </table></div>
    <p>{legacy2017AutumnAmCommonNote}</p>
  </section>;
}
