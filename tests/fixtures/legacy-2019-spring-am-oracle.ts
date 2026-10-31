import assert from 'node:assert/strict';
import type{GeneratedBody}from'../../src/core/generators/definition';
import{assertLegacy2019Quantitative,text}from'./legacy-2019-quantitative-oracle';
import{legacy2019QuantitativeReview}from'./legacy-2019-quantitative-review';
import{assertLegacy2019Algorithms}from'./legacy-2019-algorithms-oracle';
import{legacy2019AlgorithmReview}from'./legacy-2019-algorithms-review';
import{legacy2019AliasReview}from'./legacy-2019-alias-review';
import{decAGeneratorOracle}from'./dec-a-generator-oracle';
import{assertLegacy2019Knowledge}from'./legacy-2019-knowledge-oracle';
import{legacy2019KnowledgeReview}from'./legacy-2019-knowledge-review';
import{assertLegacy2019DataQueries}from'./legacy-2019-data-queries-oracle';
import{legacy2019DataQueryReview}from'./legacy-2019-data-queries-review';
import{assertLegacy2019Management}from'./legacy-2019-management-oracle';
import{legacy2019ManagementReview}from'./legacy-2019-management-review';
import{assertLegacy2019Platform}from'./legacy-2019-platform-oracle';
import{legacy2019PlatformReview}from'./legacy-2019-platform-review';
import{assertLegacy2019Security}from'./legacy-2019-security-oracle';
import{legacy2019SecurityReview}from'./legacy-2019-security-review';
import{assertLegacy2019Strategy}from'./legacy-2019-strategy-oracle';
import{legacy2019StrategyReview}from'./legacy-2019-strategy-review';
import{assertLegacy2019InformationAlias}from'./legacy-2019-information-alias-review';
import{dcCorrect,dcWrongReview,dcExplanationClauses,fishboneMeansReview}from'./legacy-2019-spring-am-completion-review';
const m=(s:string,r:RegExp)=>{const x=s.match(r);assert(x,'displayed input '+r);return x;};
const paragraph=(b:GeneratedBody)=>b.choices.map(c=>{assert.equal(c.length,1);assert(c[0].type==='paragraph');return c[0].text;});
/** Recompute numeric explanatory claims from the displayed source inputs.
 * Existing quantitative answer oracle separately solves every choice. */
export function assertSpringQuantitativeExplanation(source:string,b:GeneratedBody){const n=Number(source.split('-').at(-1)),prompt=text(b.prompt),e=b.explanation,choices=paragraph(b);let clauses:string[]=[];
 if(n===1){const[,ns,ds]=m(prompt,/(\d+)÷(\d+)/),numerator=+ns,denominator=+ds;let power=0,t=denominator;while(t>1){assert.equal(t%2,0);t/=2;power++;}const bits=choices.find(x=>[...x.slice(2)].reduce((a,c,i)=>a+Number(c)/2**(i+1),0)===numerator/denominator)!;clauses=[`${numerator}÷${denominator}=${numerator}/${denominator}`,`2の${power}乗`,`小数点を${power}桁左へ移すと ${bits} になる`];}
 else if(n===2){const kept=+m(prompt,/下位(\d+)ビットだけ/)[1],mask=Array.from({length:8},(_,i)=>i<kept?2**i:0).reduce((a,v)=>a+v,0).toString(16).toUpperCase().padStart(2,'0');clauses=[`下位${kept}ビットだけが1である${mask}とのAND`,`上位を0にして下位の値を保持`,`ORは必要なビットも1にし、XORはビットを反転する`];}
 else if(n===6){const initial=m(prompt,/初期状態も\[([^\]]+)\]/)[1].split(',').map(x=>+x.trim()),A=[...initial],C=[...initial],frames:number[]=[];while(A.length){C.push(A.pop()!);frames.push(1);}const added:number[]=[];while(frames.length){frames.pop();added.push(C.pop()!);}clauses=['再帰から戻るときにもう一度逆順になる',`Bへ追加される順序は${added.join(', ')}であり`,`Bの元の内容${initial.join(', ')}に続く`];}
 else if(n===11){const[,dpi,points]=m(prompt,/(\d+)dpi.+?(\d+)ポイント/),dots=Number(dpi)*Number(points)/72;clauses=[`${points}/72インチ`,`${dpi}×${points}/72=${dots}ドット`,'1インチ当たりのドット数'];}
 else if(n===25){const rate=+m(prompt,/1秒間に([\d,]+)回/)[1].replaceAll(',',''),capacity=+m(prompt,/(\d+)×10⁶バイト/)[1]*1000000,perMinute=rate*60,minutes=Math.floor(capacity/perMinute);assert(minutes*perMinute<=capacity&&(minutes+1)*perMinute>capacity);clauses=['8ビットは1バイト',`1秒当たり${rate}バイト`,`1分当たり${perMinute}バイト`,`整数部分は${minutes}`,`${minutes+1}分では容量を超える`,`最大${minutes}分`];}
 else if(n===49){const items=b.prompt.find(x=>x.type==='list');assert(items?.type==='list');const size=+m(items.items[0],/：(\d+)k/)[1],defect=+m(items.items[1],/：([\d.]+)件/)[1],discover=+m(items.items[2],/：(\d+)%/)[1]/100,major=+m(items.items[3],/大(\d+)%/)[1]/100,cost=+m(items.items[4],/大(\d+)万円/)[1],found=size*Math.round(defect*100)*Math.round(discover*100)/10000,expected=found*Math.round(major*100)*cost/100;clauses=[`初年度に発見する不良は${size}×${defect.toFixed(2)}×${discover}=${found}件`,`影響度大だけを修正する`,`期待費用は${found}×${major}×${cost}=${expected}万円`,`影響度小の修正費用は加えない`];}
 else if(n===54){const table=b.prompt.find(x=>x.type==='table');assert(table?.type==='table');const coding=table.rows.reduce((total,row)=>total+Number(row[1])*Number(row[2]),0),days=+m(prompt,/システムを(\d+)日間/)[1],factor=+m(prompt,/工数の(\d+)倍/)[1],total=coding+coding*factor;let people=0;while(people*days<total)people++;clauses=[`=${coding}人日`,`総工数は${coding}×(1+${factor})=${total}人日`,`${people-1}人では${(people-1)*days}人日で足りず`,`${people}人なら${people*days}人日を確保できる`];}
 else if(n===78){const table=b.prompt.find(x=>x.type==='table');assert(table?.type==='table');const losses=new Map(table.rows.map(row=>[row[0],Math.max(0,Number(row[2])-Number(row[3]))*Number(row[1])]));const sum=[...losses.values()].reduce((a,v)=>a+v,0);clauses=[`Aは${losses.get('A')}千円`,`Dは${losses.get('D')}千円`,`Eは${losses.get('E')}千円`,`合計${sum}千円`,'B・Cの仕入超過を販売機会の損失として相殺しない'];}
 else throw Error('Unreviewed quantitative explanation');for(const clause of clauses)assert(e.includes(clause),`${source} explanatory claim ${clause}`);
}
export function assertSpringCompletion(source:string,b:GeneratedBody,v:number[]){assert.deepEqual(v.length,1);const condition=v[0];assert(Number.isInteger(condition)&&condition>=0&&condition<3);assert.equal(b.correctIndex,0);assert.equal(b.contexts,undefined);assert.equal(b.answerParts,undefined);const actual=paragraph(b);assert.equal(actual.length,4);
 if(source==='2019h31h-fe-am-23'){assert.deepEqual(b.prompt,[{type:'paragraph',text:'データセンタなどで採用されているサーバ、ネットワーク機器に対する直流給電の利点として、適切なものはどれか。'}]);assert.deepEqual(actual,[dcCorrect,...dcWrongReview[condition].map(x=>x.text)]);assert.deepEqual([true,...dcWrongReview[condition].map(x=>x.truth)],[true,false,false,false]);for(const c of ['交流と直流の相互変換を減らす','変換で生じる電力損失を低減できる',...dcExplanationClauses[condition],'Central Processing Unit','Large Scale Integration'])assert(b.explanation.includes(c),'explanation '+c);}
 else{assert.equal(source,'2019h31h-fe-am-77');assert.equal(b.prompt.length,2);assert.deepEqual(b.prompt[0],{type:'paragraph',text:'図は特性要因図の一部を表したものである。a、bの関係はどれか。'});assert(b.prompt[1].type==='diagram');assert.deepEqual(b.prompt[1].scene,{kind:'source_figure',profile:'legacy-2019-spring-cause-effect',values:[0]});assert.equal(b.prompt[1].alt,'右端の枠aへ向かう水平の主幹に、下左の枠bからの斜めの矢印が接続する。');assert.deepEqual(actual,['bはaの原因である。',fishboneMeansReview[condition].text,'bはaの属性である。','bはaの目的である。']);for(const c of ['主幹の先のaが特性','枝側のbがその原因（要因）','bはaの原因である',fishboneMeansReview[condition].reason,'bはa自体が持つ属性でも、aの目指す目的でもない','Quality Control'])assert(b.explanation.includes(c),'explanation '+c);}
 if(condition>0){const lengths=actual.map(x=>x.length),correct=lengths[0];assert(lengths.slice(1).some(n=>n<=correct)&&lengths.slice(1).some(n=>n>=correct),'no unique shortest/longest answer cue');}
}
export function assertStage1SpringMeaning(source:string,b:GeneratedBody,v:number[]){const n=Number(source.split('-').at(-1));assert(source.startsWith('2019h31h-fe-am-'));
 if([23,77].includes(n))return assertSpringCompletion(source,b,v);
 if(n===31)return assertLegacy2019InformationAlias(b,v[0]);
 if(legacy2019QuantitativeReview.some(r=>r.source===source)){assertLegacy2019Quantitative(source,b);return assertSpringQuantitativeExplanation(source,b);}
 if(legacy2019AlgorithmReview.some(r=>r.source===source))return assertLegacy2019Algorithms(source,b,v);
 const alias=legacy2019AliasReview.find(r=>r.source===source);if(alias)return decAGeneratorOracle(alias.canonicalNumber,b,v);
 if(legacy2019KnowledgeReview.some(r=>r.number===n))return assertLegacy2019Knowledge(source,b,v);
 if(legacy2019DataQueryReview.some(r=>r.source===source))return assertLegacy2019DataQueries(source,b,v);
 if(legacy2019ManagementReview.some(r=>r.number===n))return assertLegacy2019Management(source,b,v);
 if(legacy2019PlatformReview.some(r=>r.source===source))return assertLegacy2019Platform(source,b,v);
 if(legacy2019SecurityReview.some(r=>r.number===n))return assertLegacy2019Security(source,b,v);
 if(legacy2019StrategyReview.some(r=>r.number===n))return assertLegacy2019Strategy(source,b,v);
 throw Error('Missing independent source oracle '+source);
}
