import {Fragment} from 'react';
import type {Block} from '../core/types';
import {spring2018NativeFragment,spring2018RequiredNotice,spring2018SelectionNotice,type Spring2018Major} from '../core/generators/legacy-2018-spring-pm5-8-native';
/** The caller must first match the exact source identity/attribution. This
 * guard then matches complete known paragraphs, never ordinary array syntax. */
export function Legacy2018SpringPmNativeText({major,text}:{major:Spring2018Major;text:string}){
 const {known,bank}=spring2018NativeFragment(major,text);if(!known)throw Error('SPRING_2018_NATIVE_TEXT');
 if(bank){return <section className="legacy-2018-spring-native-bank" data-source-bank={bank.key} data-major={major} aria-label={bank.title}>
  <p className="legacy-2018-spring-source-bank-heading">{bank.title}</p>
  <div className="diagram-scroll" tabIndex={0} aria-label={`${bank.title}。幅が足りない場合は左右にスクロールできます。`}>
  {bank.cells?<table className="legacy-2018-spring-source-bank-table"><thead><tr><td className="legacy-2018-spring-source-bank-corner" aria-hidden="true"></td>{['e1','e2','e3'].map(s=><th key={s} scope="col">{s}</th>)}</tr></thead><tbody>{bank.cells.map((cells,i)=><tr key={i}><th scope="row">{bank.items[i].symbol}</th>{cells.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table>:<div className="legacy-2018-spring-source-bank-rows" style={{gridTemplateColumns:`repeat(${bank.rows[0].length}, max-content)`}}>{bank.rows.map((row,i)=><div className="legacy-2018-spring-source-bank-row" key={i}>{row.map(index=><p key={index} data-bank-index={index}><span className="legacy-2018-spring-source-bank-symbol">{bank.items[index].symbol}</span><span>{bank.items[index].text}</span></p>)}</div>)}</div>}
  </div>
 </section>;}
 const pieces=text.split(/(［(?:　|[a-g][123]?|選)］)/g),notice=text===spring2018RequiredNotice||text===spring2018SelectionNotice;
 return <p className={`legacy-2018-spring-source-paragraph${notice?' legacy-2018-spring-source-notice':''}`} data-native-major={major}>{pieces.map((s,i)=>/^［(?:　|[a-g][123]?|選)］$/.test(s)?<span className={s==='［選］'?'legacy-2018-spring-source-circle':'legacy-2018-spring-source-blank'} data-source-blank={s.slice(1,-1)==='　'?'anonymous':s.slice(1,-1)} key={i}>{s.slice(1,-1)}</span>:<Fragment key={i}>{s}</Fragment>)}</p>;
}
/** Table5's two-level headers are meaningful source structure. The caller
 * matches the full PM6 source/table contract before selecting this renderer. */
export function Legacy2018SpringPm6ForecastTable({block}:{block:Extract<Block,{type:'table'}>}){
 if(block.caption!=='表5 外部設計工程のサブシステムごとのEVM指標値（単位 人月）'||block.rows.length!==3||block.rows.some(r=>r.length!==5)||block.columns.length!==5)throw Error('SPRING_2018_EVM_TABLE');
 return <figure className="legacy-2018-spring-source-table"><figcaption>{block.caption.replace('（単位 人月）','')}</figcaption><p className="legacy-2018-spring-source-unit">単位　人月</p><div className="diagram-scroll" tabIndex={0} aria-label="表5。幅が足りない場合は左右にスクロールできます。"><table><thead><tr><th rowSpan={2} scope="col">サブシステム</th><th scope="colgroup">外部設計終了時点</th><th colSpan={3} scope="colgroup">外部設計を開始してから1.75か月が経過した時点</th></tr><tr><th scope="col">PV<br/>（出来高計画値）</th><th scope="col">PV<br/>（出来高計画値）</th><th scope="col">EV<br/>（出来高実績値）</th><th scope="col">AC<br/>（コスト実績値）</th></tr></thead><tbody>{block.rows.map((r,i)=><tr key={i}>{r.map((s,j)=>j===0?<th scope="row" key={j}>{s}</th>:<td key={j}>{s}</td>)}</tr>)}</tbody></table></div></figure>;
}
export function Legacy2018SpringPm6SourceTable({block}:{block:Extract<Block,{type:'table'}>}){
 if(block.caption.startsWith('表5'))return <Legacy2018SpringPm6ForecastTable block={block}/>;
 if(!['表1 各開発工程の生産性（単位 KLOC／人月）','表2 新営業システムの開発規模（単位 KLOC）','表4 EVM指標のN社での意味'].includes(block.caption))throw Error('SPRING_2018_EVM_TABLE');
 const unit=block.caption.match(/（単位 ([^）]+)）$/)?.[1],caption=block.caption.replace(/（単位 [^）]+）$/,'');
 return <figure className="legacy-2018-spring-source-table"><figcaption>{caption}</figcaption>{unit&&<p className="legacy-2018-spring-source-unit">単位　{unit}</p>}<div className="diagram-scroll" tabIndex={0} aria-label={`${caption}。幅が足りない場合は左右にスクロールできます。`}><table><thead><tr>{block.columns.map((s,i)=><th scope="col" key={i}>{s}</th>)}</tr></thead><tbody>{block.rows.map((r,i)=><tr key={i}>{r.map((s,j)=>j===0?<th key={j} scope="row">{s}</th>:<td key={j}>{s}</td>)}</tr>)}</tbody></table></div></figure>;
}
