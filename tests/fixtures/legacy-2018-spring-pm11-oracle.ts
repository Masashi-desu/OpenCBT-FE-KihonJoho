/** Independently reviewed source-bank facts. No producer/model imports. */
export const pm11ReviewedAccess=[
 {text:'下位クラスを実装するクラスだけで使える',fitsForeignSubclassApi:true,scope:'Context is a library consumer in a different package; same-package access still exists.'},
 {text:'上位クラスの実装が下位クラスで改変されない',fitsForeignSubclassApi:false,scope:'protected does not prohibit overriding; final is a different restriction.'},
 {text:'通常のアプリケーションがどのパッケージからでも呼び出せる',fitsForeignSubclassApi:false,scope:'protected is not public access from unrelated foreign-package clients.'},
 {text:'パッケージcom.example.expr内の下位クラスだけで使える',fitsForeignSubclassApi:false,scope:'A subclass in com.example.test may invoke the protected constructor and methods.'}
];
export function pm11IndependentReference(values:readonly number[]) {
 if(values.length!==3||values.some((v,i)=>!Number.isInteger(v)||v<0||v>[3,4,1][i]))throw Error('ORACLE_DOMAIN');
 const p=values[0]+1,q=values[1]+5,k=values[2]===0?6:9,words=['zero','one','two','three','four','five','six','seven','eight','nine'];
 const pn=words[p],qn=words[q];return {p,q,k,pn,qn,first:`(${p} + ${q}) = ${p+q}`,nested:`((${p} + ${q}) - (${p} - ${q}))`,banks:[
 ['com.example.expr','com.example.test','static com.example.expr','static com.example.test'],
 [`${p}, ${q}`,`${q}, ${p}`,qn,`${qn}, ${pn}`,pn,`${pn}, ${qn}`],
 ['add','add.evaluate()',qn,`${qn}.evaluate()`,pn,`${pn} + ${qn}`,`${pn}.evaluate()`],
 pm11ReviewedAccess.map(x=>x.text),
 [`((${p} + ${q}) - (${p} - ${q}))`,`((${p+q}) - (${p-q}))`,`(${p} + ${q} - ${p} - ${q})`,`(${p} + ${q}) - (${p} - ${q})`,'0',String(q*2)],
 [`new Constant(${k}) == new Constant(${k})`,`new Constant(${k}).equals(new Constant(${k}))`,`new Constant(${k}).evaluate() == new Constant(${k}).evaluate()`,`new Constant(${k}).evaluate().equals(new Constant(${k}).evaluate())`]
 ]};
}
export const pm11IndependentKeys=[0,5,0,1,0,0,1];
export const pm11IndependentFieldSizes=[4,6,7,7,4,6,4];
export const pm11IndependentOffsets=[0,4,10,10,17,21,27];
