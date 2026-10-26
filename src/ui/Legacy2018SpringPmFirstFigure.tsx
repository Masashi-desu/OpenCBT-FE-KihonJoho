import {useId} from 'react';
import type {Block} from '../core/types';
import {spring2018FirstProfile,type Spring2018FirstMajor} from '../core/generators/legacy-2018-spring-pm1-4-model';
import {Legacy2018PasswordFigure} from './Legacy2018PasswordFigures';
import {Legacy2018LogicFigure} from './Legacy2018LogicFigures';
import {Legacy2018MembersFigure} from './Legacy2018MembersFigures';
import {Legacy2018CloudFigure} from './Legacy2018CloudFigures';
const names=['AND','OR','NAND','NOR'],translations=['論理積','論理和','否定論理積','否定論理和'];
export function Legacy2018SpringPmFirstFigure({number,profile,values,caption}:{number:Spring2018FirstMajor;profile:string;values:number[];caption:string}){
 const id=useId().replace(/:/g,''),data=spring2018FirstProfile(number,profile,values);if(caption!==data.caption)throw Error('SPRING2018_CAPTION');
 if(data.kind==='legacy')return <div data-spring2018-native-major={number} data-spring2018-native-kind="source-figure">{number===1?<Legacy2018PasswordFigure profile={data.legacy} values={data.values} caption={caption}/>:number===2?<Legacy2018LogicFigure profile={data.legacy} values={data.values} caption={caption}/>:number===3?<Legacy2018MembersFigure profile={data.legacy} values={data.values} caption={caption}/>:<Legacy2018CloudFigure profile={data.legacy} values={data.values} caption={caption}/>}</div>;
 let body;
 if(data.kind==='table')body=<table className="spring2018-first-table" data-spring2018-pm2-table={data.index}><thead>{data.index===0?<><tr><th colSpan={2} rowSpan={2}>入力</th><th colSpan={4}>出力</th></tr><tr>{names.map((name,i)=><th key={name}>{name}<br/>（{translations[i]}）</th>)}</tr></>:data.index===1?<tr><th colSpan={2}>入力</th><th>出力</th></tr>:<><tr><th colSpan={2}>入力</th><th rowSpan={2}>Wx×X＋Wy×Y</th><th rowSpan={2}>T</th><th>出力</th></tr><tr><th>X</th><th>Y</th><th>Z</th></tr></>}</thead><tbody>{data.block.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} data-source-row={i} data-source-column={j}>{cell}</td>)}</tr>)}</tbody></table>;
 else {const columns=number===1?(data.bank===0?5:1):number===2?(data.bank===0?4:data.bank===1?5:2):number===3?1:data.bank<2?4:data.bank===2?2:1;body=<div className="spring2018-first-bank" data-spring2018-bank={data.bank} data-columns={columns}>{data.blocks.map((blocks,i)=><div className="spring2018-first-bank-row" key={i} data-spring2018-option={i}><span className="spring2018-first-label">{'アイウエオカキク'[i]}</span><div>{blocks.map((b:Block,j)=>b.type==='code'?<code key={j}>{b.text}</code>:b.type==='paragraph'?<span key={j}>{b.text}</span>:(()=>{throw Error('SPRING2018_BANK_BLOCK');})())}</div></div>)}</div>;}
 return <figure className={'managed-diagram source-figure spring2018-first-figure profile-'+profile} data-spring2018-native-major={number} data-spring2018-native-kind={data.kind}><figcaption>{caption}</figcaption><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'} aria-describedby={id+'-description'}><span className="sr-only" id={id+'-description'}>{data.alt}</span><div className="spring2018-first-canvas">{body}</div></div></figure>;
}
