/** Source-specific test interpreter. It consumes actual displayed Q13 expressions,
 * assignments and control rows. No producer formula or macro implementation is
 * used as the expected result. Only this question's documented language is in scope. */
type Scalar=number|string|boolean|null;
type Expr={kind:string;name?:string;value?:Scalar;args?:Expr[];left?:Expr;right?:Expr};
type Ref={ref:true;sheet:string;cell:string;end?:string};
const normalize=(s:string)=>s.replaceAll('，',',').replaceAll('：',':').replaceAll('＋','+').replaceAll('−','-').replaceAll('＊','*').replaceAll('／','/').replaceAll('＝','=').replaceAll('＜','<').replaceAll('＞','>').replaceAll('≦','<=').replaceAll('≧','>=').replaceAll('$','');
export function parseSheetExpression(source:string):Expr{
 const text=normalize(source),tokens:string[]=[];let at=0;
 while(at<text.length){if(/\s/.test(text[at])){at++;continue;}const match=text.slice(at).match(/^(?:\d+(?:\.\d+)?|[A-Za-z_\u3040-\u30ff\u3400-\u9fff][A-Za-z0-9_\u3040-\u30ff\u3400-\u9fff]*|<=|>=|<>|[!,:()\[\]+*/=<>-])/);if(!match)throw Error('SHEET_TOKEN:'+text.slice(at));tokens.push(match[0]);at+=match[0].length;}
 let pos=0;const take=(value:string)=>{if(tokens[pos++]!==value)throw Error('SHEET_EXPECTED:'+value);};
 const precedence:Record<string,number>={'=':1,'<>':1,'<':1,'>':1,'<=':1,'>=':1,'+':2,'-':2,'*':3,'/':3};
 function expression(min=0):Expr{let left=primary();for(;;){const op=tokens[pos],priority=precedence[op];if(priority===undefined||priority<min)break;pos++;left={kind:'binary',name:op,left,right:expression(priority+1)};}return left;}
 function primary():Expr{const token=tokens[pos++];if(token===undefined)throw Error('SHEET_MISSING_EXPRESSION');if(token==='-')return{kind:'negate',left:primary()};if(token==='('){const n=expression();take(')');return n;}if(/^\d/.test(token))return{kind:'literal',value:Number(token)};if(token==='null')return{kind:'literal',value:null};
  if(tokens[pos]==='('){pos++;const args:Expr[]=[];if(tokens[pos]!==')')for(;;){args.push(expression());if(tokens[pos]!==',')break;pos++;}take(')');return{kind:'call',name:token,args};}
  if(tokens[pos]==='['){pos++;const args=[expression()];while(tokens[pos]===','){pos++;args.push(expression());}take(']');return{kind:'array',name:token,args};}
  let sheet='',cell=token;if(tokens[pos]==='!'){pos++;sheet=token;cell=tokens[pos++];}
  if(/^[A-Z]+\d+$/.test(cell)){let end='';if(tokens[pos]===':'){pos++;end=tokens[pos++];if(!/^[A-Z]+\d+$/.test(end))throw Error('SHEET_RANGE_END');}return{kind:'ref',name:sheet,value:cell,args:end?[{kind:'literal',value:end}]:[]};}
  if(sheet)throw Error('SHEET_BAD_CELL');return{kind:'variable',name:token};
 }
 const result=expression();if(pos!==tokens.length)throw Error('SHEET_TRAILING:'+tokens.slice(pos));return result;
}
const address=(cell:string)=>{const m=cell.match(/^([A-Z]+)(\d+)$/);if(!m)throw Error('BAD_SHEET_CELL:'+cell);let col=0;for(const ch of m[1])col=col*26+ch.charCodeAt(0)-64;return{row:Number(m[2]),col};};
const cellName=(row:number,col:number)=>{if(row<1||col<1||!Number.isInteger(row)||!Number.isInteger(col))throw Error('SHEET_CELL_BOUNDS');let c='';for(let n=col;n>0;n=Math.floor((n-1)/26))c=String.fromCharCode((n-1)%26+65)+c;return c+row;};
export class Spring2019SheetMachine{
 cells=new Map<string,Scalar>();env:Record<string,Scalar>={};arrays=new Map<string,Scalar>();steps=0;unassignedReads=0;assignmentCache=new Map<string,[Expr,Expr]>();sheetVersions=new Map<string,number>();rangeCache=new Map<string,{version:number;values:Scalar[]}>();
 constructor(public sheet='会員管理',public poison:number|'reject'=0,public logicalEvaluation:'short'|'eager'='short'){}
 set(sheet:string,cell:string,value:Scalar){this.cells.set(sheet+'!'+cell,value);this.sheetVersions.set(sheet,(this.sheetVersions.get(sheet)??0)+1);}
 get(sheet:string,cell:string):Scalar{return this.cells.get(sheet+'!'+cell)??null;}
 ref(e:Expr):Ref{if(e.kind!=='ref')throw Error('EXPECTED_CELL_REFERENCE');return{ref:true,sheet:e.name||this.sheet,cell:String(e.value),end:e.args?.[0]?String(e.args[0].value):undefined};}
 scalar(value:Scalar|Ref):Scalar{if(typeof value==='object'&&value!==null&&'ref'in value){if(value.end)throw Error('RANGE_IS_NOT_SCALAR');return this.get(value.sheet,value.cell);}return value as Scalar;}
 numeric(value:Scalar|Ref):number{const v=this.scalar(value);if(v===null)return 0;if(typeof v!=='number')throw Error('SHEET_EXPECTED_NUMBER:'+v);return v;}
 range(value:Scalar|Ref):Scalar[]{if(!value||typeof value!=='object'||!('ref'in value))throw Error('EXPECTED_RANGE');const key=value.sheet+'!'+value.cell+':'+value.end,version=this.sheetVersions.get(value.sheet)??0,cached=this.rangeCache.get(key);if(cached?.version===version)return cached.values;const first=address(value.cell),last=address(value.end??value.cell),result:Scalar[]=[];if(first.row!==last.row&&first.col!==last.col)throw Error('EXPECTED_VECTOR');for(let row=first.row;row<=last.row;row++)for(let col=first.col;col<=last.col;col++)result.push(this.get(value.sheet,cellName(row,col)));this.rangeCache.set(key,{version,values:result});return result;}
 array(indices:number[]):Scalar{if(indices.length!==2||indices.some((n,i)=>!Number.isInteger(n)||n<0||n>=[9001,3][i]))throw Error('SHEET_ARRAY_BOUNDS');const key=indices.join(',');if(this.arrays.has(key))return this.arrays.get(key)!;this.unassignedReads++;if(this.poison==='reject')throw Error('UNASSIGNED_ARRAY_READ:'+key);return this.poison===0?0:((indices[0]*7919+indices[1]*104729+this.poison*31337)%100000)-50000;}
 eval(e:Expr):Scalar|Ref{
  if(e.kind==='literal')return e.value!;
  if(e.kind==='ref')return this.ref(e);
  if(e.kind==='variable'){if(!(e.name!in this.env))throw Error('UNASSIGNED_VARIABLE:'+e.name);return this.env[e.name!];}
  if(e.kind==='array'){if(e.name!=='sumTab')throw Error('UNKNOWN_ARRAY');return this.array(e.args!.map(a=>this.numeric(this.eval(a))));}
  if(e.kind==='negate')return-this.numeric(this.eval(e.left!));
  if(e.kind==='binary'){const a=this.scalar(this.eval(e.left!)),b=this.scalar(this.eval(e.right!));switch(e.name){case'=':return a===b;case'<>':return a!==b;case'<':return(a as number)<(b as number);case'>':return(a as number)>(b as number);case'<=':return(a as number)<=(b as number);case'>=':return(a as number)>=(b as number);case'+':return this.numeric(a)+this.numeric(b);case'-':return this.numeric(a)-this.numeric(b);case'*':return this.numeric(a)*this.numeric(b);case'/':return this.numeric(a)/this.numeric(b);}throw Error('UNKNOWN_OPERATOR');}
  if(e.kind!=='call')throw Error('UNKNOWN_EXPRESSION');
  const args=e.args!,name=e.name;
  if(name==='IF')return this.eval(args[this.scalar(this.eval(args[0]))?1:2]);
  if(name==='論理積')return this.logicalEvaluation==='eager'?args.map(a=>Boolean(this.scalar(this.eval(a)))).every(Boolean):args.every(a=>Boolean(this.scalar(this.eval(a))));
  if(name==='論理和')return this.logicalEvaluation==='eager'?args.map(a=>Boolean(this.scalar(this.eval(a)))).some(Boolean):args.some(a=>Boolean(this.scalar(this.eval(a))));
  if(name==='相対'){const base=this.eval(args[0]);if(!base||typeof base!=='object'||!('ref'in base)||base.end)throw Error('RELATIVE_BASE');const at=address(base.cell);return{ref:true,sheet:base.sheet,cell:cellName(at.row+this.numeric(this.eval(args[1])),at.col+this.numeric(this.eval(args[2])))};}
  if(name==='切捨て'){const value=this.numeric(this.eval(args[0])),digits=this.numeric(this.eval(args[1])),scale=10**digits;return Math.trunc(value*scale)/scale;}
  if(name==='照合検索'){const key=this.scalar(this.eval(args[0])),values=this.range(this.eval(args[1])),result=this.range(this.eval(args[2]));if(values.length!==result.length)throw Error('LOOKUP_SHAPE');const i=values.findIndex(v=>v===key);if(i<0)throw Error('LOOKUP_NOT_FOUND');return result[i];}
  if(name==='照合一致'){const key=this.scalar(this.eval(args[0])),values=this.range(this.eval(args[1])),mode=this.numeric(this.eval(args[2]));let found=-1;if(mode===0)found=values.findIndex(v=>v===key);else if(mode===1){let best=-Infinity;values.forEach((v,i)=>{if(typeof v==='number'&&typeof key==='number'&&v<=key&&v>best){best=v;found=i;}});}else throw Error('UNSUPPORTED_MATCH_MODE');if(found<0)throw Error('MATCH_NOT_FOUND');return found+1;}
  if(name==='表引き'){const range=this.eval(args[0]);if(!range||typeof range!=='object'||!('ref'in range)||!range.end)throw Error('TABLE_RANGE');const start=address(range.cell),end=address(range.end),row=this.numeric(this.eval(args[1])),col=this.numeric(this.eval(args[2]));if(row<1||col<1||start.row+row-1>end.row||start.col+col-1>end.col)throw Error('TABLE_INDEX');return this.get(range.sheet,cellName(start.row+row-1,start.col+col-1));}
  throw Error('UNKNOWN_SHEET_FUNCTION:'+name);
 }
 value(source:string):Scalar{return this.scalar(this.eval(parseSheetExpression(source)));}
 assign(source:string){let ast=this.assignmentCache.get(source);if(!ast){const at=source.indexOf('←');if(at<0)throw Error('EXPECTED_ASSIGNMENT');ast=[parseSheetExpression(source.slice(0,at)),parseSheetExpression(source.slice(at+1))];this.assignmentCache.set(source,ast);}const[lhs,expression]=ast,rhs=this.scalar(this.eval(expression));if(lhs.kind==='variable'){this.env[lhs.name!]=rhs;return;}if(lhs.kind==='array'){const indices=lhs.args!.map(a=>this.numeric(this.eval(a)));this.arrayBounds(indices);this.arrays.set(indices.join(','),rhs);return;}const target=this.eval(lhs);if(!target||typeof target!=='object'||!('ref'in target)||target.end)throw Error('BAD_ASSIGNMENT_TARGET');this.set(target.sheet,target.cell,rhs);}
 arrayBounds(indices:number[]){if(indices.length!==2||indices.some((n,i)=>!Number.isInteger(n)||n<0||n>=[9001,3][i]))throw Error('SHEET_ARRAY_BOUNDS');}
 run(rows:{level:number;control:string;text:string}[]){
  type Stmt={kind:string;text:string;body?:Stmt[];variable?:string;start?:string;condition?:string;increment?:string};
  let pos=0;const parse=(closing=''):Stmt[]=>{const result:Stmt[]=[];while(pos<rows.length){const row=rows[pos++];if(row.control==='○')continue;if(row.control==='・'){result.push({kind:'assign',text:row.text});continue;}if((row.control==='■'&&row.text==='')||row.control==='▼'){if(row.control!==closing)throw Error('MACRO_WRONG_CLOSE');return result;}if(row.control==='▲'){result.push({kind:'if',text:row.text,body:parse('▼')});continue;}if(row.control==='■'){const range=normalize(row.text).match(/^([A-Za-z]+):([^,]+),([^,]+),([^,]+)$/);if(range)result.push({kind:'for',text:row.text,variable:range[1],start:range[2],condition:range[3],increment:range[4],body:parse('■')});else result.push({kind:'while',text:row.text,body:parse('■')});continue;}throw Error('UNKNOWN_MACRO_CONTROL');}if(closing)throw Error('UNCLOSED_MACRO');return result;};
  const tree=parse(),exprCache=new Map<string,Expr>(),expression=(s:string)=>{let e=exprCache.get(s);if(!e){e=parseSheetExpression(s);exprCache.set(s,e);}return this.scalar(this.eval(e));};
  const execute=(list:Stmt[])=>{for(const stmt of list){if(++this.steps>15000000)throw Error('MACRO_STEPS');if(stmt.kind==='assign'){this.assign(stmt.text);continue;}if(stmt.kind==='if'){if(expression(stmt.text))execute(stmt.body!);continue;}if(stmt.kind==='while'){while(expression(stmt.text)){if(++this.steps>15000000)throw Error('MACRO_STEPS');execute(stmt.body!);}continue;}this.env[stmt.variable!]=expression(stmt.start!);while(expression(stmt.condition!)){execute(stmt.body!);this.env[stmt.variable!]=Number(this.env[stmt.variable!])+Number(expression(stmt.increment!));}}};
  execute(tree);return{steps:this.steps,unassignedReads:this.unassignedReads};
 }
}
