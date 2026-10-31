import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
import facts from './legacy-2017-autumn-network-facts.json';
const plain=(b:GeneratedBody['choices'][number])=>{assert.equal(b.length,1);const block=b[0];assert(block.type==='paragraph');return block.text;};
const gcd=(a:bigint,b:bigint):bigint=>b?gcd(b,a%b):a;
const quotient=(a:bigint,b:bigint)=>{assert(b>0n);const d=gcd(a,b);return{n:a/d,d:b/d};};
const cache=new Map<string,ReturnType<typeof calculateAudio>>();
/** Independent rational divisions plus an integer-time conservation model.
 * No production input table, numeric function, choice or answer is imported. */
function calculateAudio(stem:string){
 const m=stem.match(/^符号化速度が(\d{3})kビット／秒の音声データ(\d\.\d)Mバイトを、通信速度が(\d{3})kビット／秒のネットワークを用いてダウンロードしながら途切れることなく再生するためには、再生開始前のデータのバッファリング時間として最低何秒間が必要か。$/);assert(m);
 const tenths=BigInt(m[2].replace('.','')),size=tenths*800000n,play=BigInt(m[1])*1000n,network=BigInt(m[3])*1000n;assert(play>network&&network>0n);
 const qPlay=quotient(size,play),qDownload=quotient(size,network);assert.equal(qPlay.d,1n);assert.equal(qDownload.d,1n);
 const playSeconds=Number(qPlay.n),downloadSeconds=Number(qDownload.n);
 // Data is counted in one-thousandth bit units to test a start 1ms earlier
 // exactly. A linear segment reaches its minimum at an event endpoint.
 const feasible=(delayMs:number)=>{const finishMs=playSeconds*1000,downloadEnd=downloadSeconds*1000-delayMs,events=new Set([0,finishMs]);if(downloadEnd>=0&&downloadEnd<=finishMs)events.add(downloadEnd);for(let t=0;t<=finishMs;t+=1000)events.add(t);return [...events].every(t=>{const delivered=network*BigInt(delayMs+t);const available=delivered<size*1000n?delivered:size*1000n;return available-play*BigInt(t)>=0n;});};
 let first=-1;for(let seconds=0;seconds<=downloadSeconds;seconds++)if(feasible(seconds*1000)){first=seconds;break;}
 assert(first>=0);assert.equal(first,downloadSeconds-playSeconds);assert(feasible(first*1000));assert(!feasible(first*1000-1));
 const options=[first,playSeconds,downloadSeconds,playSeconds+downloadSeconds];assert.equal(new Set(options).size,4);assert.deepEqual(options,[...options].sort((a,b)=>a-b));
 return{playKbit:Number(m[1]),networkKbit:Number(m[3]),megabytes:m[2],sizeBits:Number(size),playSeconds,downloadSeconds,minimumBufferSeconds:first,options,adjacentGaps:options.slice(1).map((n,i)=>n-options[i]),nearestCorrectGap:Math.min(...options.slice(1).map(n=>n-first)),feasible};
}
export function autumnNetworkAudioReference(stem:string){if(!cache.has(stem))cache.set(stem,calculateAudio(stem));return cache.get(stem)!;}
/** These operational classifications were fixed from source/primary review,
 * independently of the producer records and their correct indices. */
const roles:Record<number,readonly string[]>={30:['snapshot','backup','redo_after_image','undo_before_image'],32:['IP_configuration','L2_MAC_selection','all_port_repetition','IP_layer_processing'],33:['HTTP_cache','intrusion_detection','packet_filter','IP_address_translation'],36:['bot_command','certificate_issue','web_content_management','defensive_blocking'],37:['reconnaissance','false_DNS_cache','DNS_service_overload','zone_information_read']};
const target:Record<number,string>={30:'undo_before_image',32:'L2_MAC_selection',33:'IP_address_translation',36:'bot_command',37:'false_DNS_cache'};
const protocols:Record<string,{layer:string;orderedReliable:boolean;minimalDatagram:boolean}>={HTTP:{layer:'application',orderedReliable:false,minimalDatagram:false},IP:{layer:'internet',orderedReliable:false,minimalDatagram:false},TCP:{layer:'transport',orderedReliable:true,minimalDatagram:false},UDP:{layer:'transport',orderedReliable:false,minimalDatagram:true}};
export function legacy2017AutumnNetworkOracle(source:string,body:GeneratedBody,values:number[]){
 const condition=facts.conditions.find(r=>r.source===source&&r.variant===values[0]),plan=facts.designInputs.find(r=>r.source===source);assert(condition&&plan);assert.equal(values.length,1);assert(Number.isInteger(values[0])&&values[0]>=0&&values[0]<plan.capacity);assert.equal(body.prompt.length,1);assert.equal(body.choices.length,4);
 const p=body.prompt[0];assert(p.type==='paragraph');assert.equal(p.text,condition.fullStem);const choices=body.choices.map(plain);assert.deepEqual(choices,condition.fullChoices);assert.equal(body.explanation,condition.explanation);
 let truth:boolean[];
 if(plan.number===31){const r=autumnNetworkAudioReference(p.text);assert.deepEqual(choices,r.options.map(String));truth=choices.map(n=>Number(n)===r.minimumBufferSeconds);assert(Math.min(...r.adjacentGaps)>=50);assert(r.nearestCorrectGap/r.minimumBufferSeconds>=1);}
 else if(plan.number===34){truth=choices.map(c=>{const f=protocols[c];assert(f);return f.layer==='transport'&&(values[0]===0?f.minimalDatagram:f.orderedReliable);});}
 else{assert(roles[plan.number]&&target[plan.number]);truth=roles[plan.number].map(r=>r===target[plan.number]);}
 assert.deepEqual(truth,condition.slots.map(s=>s.trueForQuestion));assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));return truth;
}
