import {legacy2017Pm12AddProgram as add,legacy2017Pm12MulProgram as mul,legacy2017Pm12MulNotes as notes} from '../core/generators/legacy-2017-pm12-data';
const opcodes=new Set(['START','RPUSH','RPOP','LD','LAD','ADDL','SUBL','ST','JOV','JUMP','JZE','JMI','JNZ','JPL','CPL','AND','SRL','CALL','RET','END','DS']);
function tokens(text:string){
 const words=text.split(';')[0].trim().split(/\s+/),first=words.shift()!,label=opcodes.has(first)||first.startsWith('[')?'':first,op=label?words.shift()!:first;
 return{label,op,operands:words.join(' ')};
}
function rightBrace(x:number,y0:number,y1:number){const middle=(y0+y1)/2;return`M ${x} ${y0} Q ${x+11} ${y0} ${x+11} ${y0+13} L ${x+11} ${middle-11} Q ${x+11} ${middle} ${x+23} ${middle} Q ${x+11} ${middle} ${x+11} ${middle+11} L ${x+11} ${y1-13} Q ${x+11} ${y1} ${x} ${y1}`;}
/** Fixed source program geometry; no code is executed by this renderer. */
export function Legacy2017Pm12Program({kind}:{kind:'add64'|'mul32'}){
 const numbered=kind==='add64',lines=numbered?add:mul.split('\n'),lineHeight=30,top=numbered?64:36,opX=numbered?188:162,operandX=numbered?290:260;
 return <svg className="legacy-pm12-program" viewBox={`0 0 ${numbered?750:1130} ${top+lineHeight*lines.length+10}`} role="group" aria-label={numbered?'プログラム1 ADD64 全24行':'プログラム2 MUL32 全41行'} data-pm12-program={kind}>
  {numbered&&<text x={20} y={25} data-pm12-line-number-heading="true">（行番号）</text>}
  {lines.map((line,index)=>{const row=index+1,{label,op,operands}=tokens(line),hole=/^\[([a-f])\]$/.exec(op),y=top+index*lineHeight;
   return <g key={row} data-pm12-code-line={row} transform={`translate(0 ${y})`}>
    {numbered&&<text x={30} data-pm12-line-number={row}>{row}</text>}
    {label&&<text x={numbered?76:18} data-pm12-source="label">{label}</text>}
    {hole?<><rect x={opX} y={-22} width={numbered?242:298} height={28} className="legacy-pm12-program-hole" data-pm12-hole={hole[1]}/><text x={opX+(numbered?121:149)} textAnchor="middle" data-pm12-source="hole" aria-label={'空欄'+hole[1]}>{hole[1]}</text></>:<><text x={opX} data-pm12-source="op">{op}</text>{operands&&<text x={operandX} data-pm12-source="operands">{operands}</text>}</>}
    {!numbered&&notes.some(note=>row>=note.start&&row<=note.end)&&<text x={510} data-pm12-comment-marker=";">;</text>}
   </g>;
  })}
  {!numbered&&notes.map((note,index)=>{
   const y0=top+(note.start-1)*lineHeight-21,y1=top+(note.end-1)*lineHeight+6,startY=note.start===11?top+((note.start+note.end)/2-1)*lineHeight:top+(note.start-1)*lineHeight;
   return <g key={index} data-pm12-note-range={`${note.start}:${note.end}`}>
    {note.end>note.start&&<path d={rightBrace(529,y0,y1)} className="legacy-pm12-note-brace" data-pm12-brace-range={`${note.start}:${note.end}`}/>}
    {note.lines.map((s,i)=><text key={i} x={note.end>note.start?565:540} y={startY+i*lineHeight} data-pm12-note-line={i+1}>{s}</text>)}
   </g>;
  })}
 </svg>;
}
