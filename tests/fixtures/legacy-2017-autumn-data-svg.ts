import assert from 'node:assert/strict';
const attributes=(s:string)=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const tags=(svg:string,name:string)=>[...svg.matchAll(new RegExp(`<${name}\\b[^>]*>`,'g'))].map(m=>attributes(m[0]));
const texts=(svg:string)=>[...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(m=>({a:attributes(m[1]),text:m[2]}));
export const autumnDataFormulaAlt=[
 ['X＝A・B＋（A・B全体の否定）。','X＝A・B＋（Aの否定）・（Bの否定）。','X＝A・（Bの否定）＋（Aの否定）・B。','X＝（Aの否定＋B）・（A＋Bの否定）。'],
 ['X＝A・B＋（A・B全体の否定）。','X＝A・B＋（Aの否定）・（Bの否定）。','X＝A・（Bの否定）＋（Aの否定）・B。','X＝（A＋B）・（Aの否定＋Bの否定）。'],
].map(row=>row.map(s=>s+'＋は論理和、・は論理積。'));
function accessible(svg:string,viewBox:string,caption:string){
 const a=attributes(svg.match(/<svg\b[^>]*>/)![0]),title=svg.match(/<title id="([^"]+)">([^<]*)<\/title>/)!,desc=svg.match(/<desc id="([^"]+)">([^<]*)<\/desc>/)!;
 assert(title&&desc);assert.equal(a.viewBox,viewBox);assert.equal(a.role,'img');assert.equal(a['aria-labelledby'],title[1]);assert.equal(a['aria-describedby'],desc[1]);assert.equal(title[2],caption);return desc[2];
}
const gatePaths={
 middle:'M 390 115 Q 410 145 390 175 Q 445 175 465 145 Q 445 115 390 115 Z',
 top:'M 570 20 L 610 20 Q 650 20 650 60 Q 650 100 610 100 L 570 100 Z',
 bottom:'M 570 190 L 610 190 Q 650 190 650 230 Q 650 270 610 270 L 570 270 Z',
 final:'M 740 115 Q 760 145 740 175 Q 795 175 815 145 Q 795 115 740 115 Z',
};
export function readAutumnDataLogicSvg(svg:string,v:number){
 assert(v===0||v===1);const desc=accessible(svg,'0 0 900 300','ディジタル回路');
 assert.equal(desc,`ディジタル回路。入力Aは上側ANDと上側NOTへ、入力Bは下側ANDと下側NOTへ分岐する。二つのNOTの出力は中央ORの二入力に接続し、中央ORの出力は上下のANDの残る入力へ分岐する。上下のANDの出力を最後の${v===0?'OR':'出力に否定の小円を付けたOR'}へ接続し、その出力がXになる。黒丸はA、B、中央ORの出力の三つの分岐点。`);
 const wires=tags(svg,'polyline');assert.equal(wires.length,11);
 const expected={
  'A-not':'80,85 250,85','B-not':'80,205 250,205','notA-middle':'311,85 355,85 355,125 397,125','notB-middle':'311,205 355,205 355,165 397,165',
  'A-top':'130,85 130,40 570,40','B-bottom':'130,205 130,250 570,250','middle-top':'465,145 515,145 515,80 570,80','middle-bottom':'515,145 515,210 570,210',
  'top-final':'650,60 695,60 695,125 747,125','bottom-final':'650,230 695,230 695,165 747,165','final-X':`${v===0?815:831},145 860,145`,
 };
 assert.deepEqual(Object.fromEntries(wires.map(w=>[w['data-wire'],w.points])),expected);
 const paths=tags(svg,'path');assert.equal(paths.length,4);assert.deepEqual(Object.fromEntries(paths.map(p=>[p['data-gate'],p.d])),gatePaths);
 const polygons=tags(svg,'polygon');assert.equal(polygons.length,2);assert.deepEqual(polygons.map(p=>[p['data-gate'],p.points]),[['notA','250,60 250,110 295,85'],['notB','250,180 250,230 295,205']]);
 const circles=tags(svg,'circle'),inversions=circles.filter(c=>c['data-inversion']);assert.equal(inversions.length,v===0?2:3);
 assert.deepEqual(inversions.map(c=>[c['data-inversion'],c.cx,c.cy,c.r]),v===0?[['notA','303','85','8'],['notB','303','205','8']]:[['notA','303','85','8'],['notB','303','205','8'],['final','823','145','8']]);
 assert.deepEqual(circles.filter(c=>c['data-junction']!==undefined).map(c=>[c['data-junction'],c.cx,c.cy,c.r]),[['0','130','85','4'],['1','130','205','4'],['2','515','145','4']]);
 assert.deepEqual(texts(svg).map(t=>[t.a['data-label'],t.a.x,t.a.y,t.text]),[['A','50','85','A'],['B','50','205','B'],['X','880','145','X']]);
 // Only after the drawn gate shapes, bubbles and all vertices are established,
 // evaluate the connected devices. No production gate model or answer is read.
 return (A:boolean,B:boolean)=>{const firstNot=!A,secondNot=!B,middle=firstNot||secondNot,top=A&&middle,bottom=B&&middle,out=top||bottom;return inversions.some(c=>c['data-inversion']==='final')?!out:out;};
}
export function readAutumnDataFormulaSvg(svg:string,v:number,part:number){
 assert([0,1].includes(v)&&part>=1&&part<=4);const desc=accessible(svg,'0 0 400 110','論理式');assert.equal(desc,autumnDataFormulaAlt[v][part-1]);
 const t=texts(svg),isProduct=part===4;
 assert.deepEqual(t.map(x=>x.text),isProduct?['X','=','(','A','+','B',')','・','(','A','+','B',')']:['X','=','A','・','B','+','A','・','B']);
 const xs=isProduct?[20,55,95,115,145,175,195,215,235,255,285,315,335]:[20,55,95,120,140,175,210,235,255];
 assert.deepEqual(t.map(x=>[Number(x.a.x),Number(x.a.y),x.a['data-label']]),xs.map((x,i)=>[x,58,`symbol-${i}`]));
 const bars=tags(svg,'line');assert(bars.every(b=>b['data-negation-bar']!==undefined&&b.y1==='34'&&b.y2==='34'));
 assert.equal(tags(svg,'path').length+tags(svg,'polygon').length+tags(svg,'circle').length,0);
 const ranges=bars.map(b=>[Number(b.x1),Number(b.x2)]),expected=part===1?[[199,266]]:part===2?[[199,221],[244,266]]:part===3?[[129,151],[199,221]]:v===0?[[104,126],[304,326]]:[[244,266],[304,326]];
 assert.deepEqual(ranges,expected);
 // Recover which actual glyphs each drawn bar covers. A bar over a product is
 // one group, not two separately negated variables; multiplication precedes +.
 const terms=t.slice(2).map(x=>({symbol:x.text,x:Number(x.a.x)}));
 const covered=ranges.map(([lo,hi])=>terms.map((x,i)=>x.x>=lo&&x.x<=hi?i:-1).filter(i=>i>=0));
 const tokens=terms.map(x=>x.symbol);
 for(const indexes of covered){assert(indexes.length>0);const lo=indexes[0],hi=indexes.at(-1)!;tokens[lo]='!('+tokens[lo];tokens[hi]+=')';}
 const expression=tokens.join('').replaceAll('・','&').replaceAll('+','|');
 return (A:boolean,B:boolean)=>evaluateBooleanExpression(expression,A,B);
}
/** Recursive-descent evaluator: no eval/producer truth table. */
export function evaluateBooleanExpression(expression:string,A:boolean,B:boolean){
 let i=0;const atom=():boolean=>{const t=expression[i++];if(t==='!')return !atom();if(t==='('){const v=or();assert.equal(expression[i++],')');return v;}assert(t==='A'||t==='B');return t==='A'?A:B;};
 const and=():boolean=>{let v=atom();while(expression[i]==='&'){i++;const right=atom();v=v&&right;}return v;};
 const or=():boolean=>{let v=and();while(expression[i]==='|'){i++;const right=and();v=v||right;}return v;};
 const value=or();assert.equal(i,expression.length);return value;
}
export function readAutumnDataUmlSvg(svg:string,v:number){
 assert([0,1,2].includes(v));const desc=accessible(svg,'0 0 720 390','データモデル'),employees=v===2?'0..*':'1..*',manager=v===1?'1':'0..1';
 assert.equal(desc,`データモデル。上に部門と社員、下に事業部の三クラス。事業部から部門へ中空三角が向く汎化。部門と社員の関連「所属する」は黒三角が左を向き、部門端1、社員端${employees}。部門と事業部の関連「管理する」は黒三角が上を向き、部門端1..*、事業部端${manager}。黒三角は関連名の読み順。`);
 assert.deepEqual(tags(svg,'rect').map(r=>[r.x,r.y,r.width,r.height]),[['180','50','150','65'],['520','50','150','65'],['180','280','150','65']]);
 assert.deepEqual(tags(svg,'line').map(l=>[l['data-uml-edge'],l.x1,l.y1,l.x2,l.y2]),[['membership','330','82.5','520','82.5'],['generalization','255','140','255','280']]);
 assert.deepEqual(tags(svg,'polyline').map(p=>[p['data-uml-edge'],p.points]),[['management','330,100 435,100 435,312.5 330,312.5']]);
 const p=tags(svg,'polygon');assert.equal(p.length,3);assert.deepEqual(p.map(p=>[p['data-uml-generalization']??p['data-uml-reading'],p.points]),[['部門','255,115 244,140 266,140'],['membership','377,30 365,38 377,46'],['management','477,180 469,194 485,194']]);assert(p.slice(1).every(p=>p.style==='fill:currentColor'));
 const actual=texts(svg);assert.deepEqual(actual.map(t=>[t.a['data-label'],t.a.x,t.a.y,t.text]),[['class-部門','255','82.5','部門'],['class-社員','595','82.5','社員'],['class-事業部','255','312.5','事業部'],['membership-name','435','38','所属する'],['management-name','495','225','管理する'],['membership-department','350','65','1'],['membership-employee','490','65',employees],['management-department','365','130','1..*'],['management-division','365','340',manager]]);
 // Return the actually rendered endpoint values after verifying their positions.
 return {employeeMinimum:Number(actual.find(t=>t.a['data-label']==='membership-employee')!.text[0]),managerMinimum:Number(actual.find(t=>t.a['data-label']==='management-division')!.text[0])};
}
