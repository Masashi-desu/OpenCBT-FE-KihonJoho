import React from 'react';
import {pendingAmFigureModel,pendingAmProfiles} from '../core/generators/legacy-2018-pending-am';
/** Two reviewed source-local forms. Shared host owns pan/zoom/scrollbars. */
export function Legacy2018PendingAmFigures({profile,values}:{profile:string;values:number[]}){
 const model=pendingAmFigureModel(profile,values);
 if(profile===pendingAmProfiles.flow){
  const labels=model.boxes as string[],descriptions=model.descriptions as string[];
  return <div className="pending-am-flow" data-pending-profile={profile}><ol>{labels.map((label,i)=><li key={label} data-pending-step={label}><div className="pending-am-flow-node">{label}</div><p data-pending-description={label}>{descriptions[i]}</p>{i<3&&<svg className="pending-am-flow-arrow" aria-hidden="true" viewBox="0 0 12 100" preserveAspectRatio="none" data-pending-edge={label+'-'+labels[i+1]}><path d="M6 0V96M2 85L6 97L10 85"/></svg>}</li>)}</ol></div>;
 }
 const pop=model.population as number[],rates=model.rateNumerators as number[][],existing=model.newExisting as number[],fresh=model.newCustomers as number[];
 return <div className="pending-am-migration" data-pending-profile={profile}><table><thead><tr><td className="pending-am-open-corner" aria-hidden="true"/>{['人数','P','Q','R','S'].map(label=><th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{pop.map((value,i)=><tr key={i} data-pending-row={'ABC'[i]}><th scope="row">{'ABC'[i]}</th><td data-pending-population="">{value.toLocaleString('ja-JP')}</td>{rates[i].map((rate,j)=><td key={j} data-pending-rate="">{(rate/10).toFixed(1)}</td>)}</tr>)}</tbody><tfoot>{[['既存顧客数',existing],['新規顧客数',fresh]].map(([label,values])=><tr key={String(label)} data-pending-row={String(label)}><th colSpan={2} scope="row">{String(label)}</th>{(values as number[]).map((n,i)=><td key={i}>{n.toLocaleString('ja-JP')}</td>)}</tr>)}</tfoot></table></div>;
}
