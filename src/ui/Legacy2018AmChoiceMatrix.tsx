import {useId,type MouseEvent} from 'react';
import type {AnswerChoices} from './AnswerChoices';
import {ContentParagraph} from './ContentText';
import {labels} from '../core/types';

type Props=Parameters<typeof AnswerChoices>[0];
/** One shared-header matrix for source-reviewed ordinary choices. Dispatch is
 * limited to the particular question/lineage reviewed by the calling UI. */
export function Legacy2018AmChoiceMatrix({question:q,entry,disabled,revealed,showResponse=false,onAnswer}:Props){
 const prefix=useId().replace(/:/g,'');
 if(q.answerParts||q.correctAnswer.parts||q.choices.length!==4||entry.choiceOrder.length!==4||new Set(entry.choiceOrder).size!==4||entry.choiceOrder.some(id=>!q.choices.some(c=>c.id===id)))throw Error('SOURCE_MATRIX_FORMAT');
 const tables=q.choices.map(c=>{const b=c.content.blocks[0];if(c.content.blocks.length!==1||b.type!=='table'||b.rows.length!==1||![2,3].includes(b.columns.length)||b.rows[0].length!==b.columns.length)throw Error('SOURCE_MATRIX_FORMAT');return b;});
 const columns=tables[0].columns;
 if(tables.some(t=>JSON.stringify(t.columns)!==JSON.stringify(columns)))throw Error('SOURCE_MATRIX_HEADERS');
 // Ordinary AnswerChoices has no compound response summary. Keep the prop in
 // this contract without revealing any answer when revealed is false.
 void showResponse;
 return <fieldset className="legacy-am-matrix" disabled={disabled}>
  <legend className="sr-only">解答を選択</legend>
  <div className="legacy-am-matrix-viewport" tabIndex={0} role="region" aria-label="選択肢の表">
   <table className={`legacy-am-matrix-table columns-${columns.length}`}>
    <caption className="sr-only">解答の選択肢</caption>
    <colgroup><col className="matrix-label-column"/>{columns.map((_,i)=><col key={i}/>)}</colgroup>
    <thead><tr><td className="matrix-open-corner" aria-hidden="true"/>{columns.map((column,i)=><th key={i} scope="col" id={`${prefix}-header-${i}`}><ContentParagraph text={column}/></th>)}</tr></thead>
    <tbody>{entry.choiceOrder.map((id,index)=>{
     const at=q.choices.findIndex(c=>c.id===id),cells=tables[at].rows[0],selected=entry.selectedChoiceId===id,correct=revealed&&q.correctAnswer.choiceId===id,label=labels[index],inputId=`${prefix}-${at}`;
     const name=`${label} `+columns.map((column,i)=>`${column} ${cells[i]}`).join('。')+(correct?' 正答':'');
     const chooseLabel=(event:MouseEvent<HTMLLabelElement>)=>{
      event.preventDefault();if(disabled)return;
      event.currentTarget.closest('tr')?.querySelector<HTMLInputElement>('input')?.focus({preventScroll:true});
      onAnswer?.(selected?undefined:id);
     };
     return <tr key={id} className={`${selected?'selected ':''}${correct?'correct':''}`} onClick={event=>{
      if(disabled||(event.target instanceof Element&&event.target.closest('label,input')))return;
      event.currentTarget.querySelector<HTMLInputElement>('input')?.focus({preventScroll:true});
      onAnswer?.(selected?undefined:id);
     }}>
      <th scope="row" className="matrix-row-label"><label htmlFor={inputId} onClick={chooseLabel}>{label}</label>
       <input id={inputId} type="radio" className="sr-only" name={`${prefix}-answer`} value={id} checked={selected} aria-label={name}
        onChange={()=>onAnswer?.(id)} onClick={()=>{if(selected)onAnswer?.(undefined);}}
        onKeyDown={e=>{if(e.key===' '){e.preventDefault();if(!e.repeat)onAnswer?.(selected?undefined:id);}}}/>
      </th>
      {cells.map((cell,i)=><td key={i} headers={`${prefix}-header-${i}`}><label className="matrix-cell-label" htmlFor={inputId} onClick={chooseLabel}><ContentParagraph text={cell}/></label></td>)}
     </tr>;
    })}</tbody>
   </table>
  </div>
 </fieldset>;
}
