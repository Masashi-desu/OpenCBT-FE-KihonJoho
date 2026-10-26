import {DataError} from '../errors';
export const legacy2017AutumnPm8Pages=[38,39,40,41,42,43,44,45] as const;
export const legacy2017AutumnPm8CommonPages=[4,5] as const;
export const legacy2017AutumnPm8Alphabet=' .,?abcdefghijklmnopqrstuvwxyz';
export const legacy2017AutumnPm8Visible=(s:string)=>s.replaceAll(' ','␣');
const sourceRows=[['ipa  ','tests','make ','it.  '],['api  ','build','data ','ok?  '],['net  ','route','code ','go.  '],['ram  ','debug','file ','up,  ']];
export function legacy2017AutumnPm8Variant(values:number[]){if(!Array.isArray(values)||Object.getOwnPropertyNames(values).sort().join(',')!=='0,length'||Object.getOwnPropertySymbols(values).length)throw new DataError('GENERATION_PARAMETERS','秋午後問8の条件は整数1個です');const d=Object.getOwnPropertyDescriptor(values,'0');if(!d||!Object.hasOwn(d,'value')||!Number.isSafeInteger(d.value)||d.value<0||d.value>3)throw new DataError('GENERATION_PARAMETERS','秋午後問8の条件は0〜3です');return d.value as number;}
export function legacy2017AutumnPm8Check(input:string){if(!input.length)throw Error('EMPTY_INPUT');let sum=0;for(let j=input.length-1,even=false;j>=0;j--,even=!even){const n=legacy2017AutumnPm8Alphabet.indexOf(input[j]);if(n<0)throw Error('CHARACTER_DOMAIN');sum+=even?n:Math.floor(n*2/30)+(n*2)%30;}return legacy2017AutumnPm8Alphabet[(30-sum%30)%30];}
export function legacy2017AutumnPm8Valid(input:string){if(input.length<2)throw Error('VALIDATE_LENGTH');let sum=0;for(let j=input.length-1,odd=true;j>=0;j--,odd=!odd){const n=legacy2017AutumnPm8Alphabet.indexOf(input[j]);if(n<0)throw Error('CHARACTER_DOMAIN');sum+=odd?n:Math.floor(n*2/30)+(n*2)%30;}return sum%30===0;}
export function legacy2017AutumnPm8Model(values:number[]){const v=legacy2017AutumnPm8Variant(values),rows=[...sourceRows[v]],payload=rows[0],check=legacy2017AutumnPm8Check(payload),a=[...payload],one=[...a];one[2]=legacy2017AutumnPm8Alphabet[legacy2017AutumnPm8Alphabet.indexOf(one[2])+1];const swap13=[...a];[swap13[0],swap13[2]]=[swap13[2],swap13[0]];const swap12=[...a];[swap12[0],swap12[1]]=[swap12[1],swap12[0]];const cases=[one.join(''),swap13.join(''),swap12.join(''),[...a].reverse().join('')].map(s=>s+check);
 const grid=rows.map(s=>[...s,legacy2017AutumnPm8Check(s)]),bottom=Array.from({length:5},(_,c)=>legacy2017AutumnPm8Check(rows.map(r=>r[c]).join('')));grid.push([...bottom,'']);const e=bottom[4],eValue=legacy2017AutumnPm8Alphabet.indexOf(e),eChoices=Array.from({length:4},(_,i)=>legacy2017AutumnPm8Alphabet[eValue-2+i]);if(eChoices.some(s=>!s||s<'a'||s>'z'))throw new DataError('PARAMETER_CONSTRAINT','原と同じ文字候補の範囲を満たしません');return {v,rows,payload,check,cases,grid,e,eChoices};}
export function legacy2017AutumnPm8Banks(values:number[]){const m=legacy2017AutumnPm8Model(values),sets=['1と2と3と4である','2である','2と3である','2と3と4である','2と4である','ない'];return {a:[['false','false'],['false','true'],['true','false'],['true','true']],b:['N − sum % N','sum % N','(N − sum % N) % N','(sum − N) % N'],c:['sum ÷ N ＝ 0','sum ÷ N ≠ 0','sum % N ＝ 0','sum % N ≠ 0'],d:[...sets],e:m.eChoices,f:[...sets]};}
export const legacy2017AutumnPm8Program=[
 {text:'○文字型関数： calcCheckCharacter(文字型： input[], 整数型： len)',indent:0},
 {text:'○整数型： N, sum, i, value, check_value',indent:0},
 {text:'○論理型： is_even',indent:0},
 {text:'・N ← 30',indent:0},{text:'・sum ← 0',indent:0},{text:'・is_even ← false',indent:0},
 {text:'i: len, i ＞ 0, −1',indent:0},{text:'・value ← getValue(input[i])',indent:1},
 {text:'is_even ＝ ［a1］',indent:1},{text:'・sum ← sum ＋ value',indent:2},
 {text:'・sum ← sum ＋ (value × 2) ÷ N ＋ (value × 2) % N',indent:2},{text:'',indent:1},
 {text:'・is_even ← not is_even',indent:1},{text:'',indent:0},
 {text:'・check_value ← ［b］',indent:0},{text:'・return getChar(check_value)',indent:0},
 {text:'',indent:0},
 {text:'○論理型関数： validateCheckCharacter(文字型： input[], 整数型： len)',indent:0},
 {text:'○整数型： N, sum, i, value',indent:0},{text:'○論理型： is_odd, ret_value',indent:0},
 {text:'・N ← 30',indent:0},{text:'・sum ← 0',indent:0},{text:'・is_odd ← true',indent:0},{text:'・ret_value ← true',indent:0},
 {text:'i: len, i ＞ 0, −1',indent:0},{text:'・value ← getValue(input[i])',indent:1},
 {text:'is_odd ＝ ［a2］',indent:1},{text:'・sum ← sum ＋ value',indent:2},
 {text:'・sum ← sum ＋ (value × 2) ÷ N ＋ (value × 2) % N',indent:2},{text:'',indent:1},
 {text:'・is_odd ← not is_odd',indent:1},{text:'',indent:0},
 {text:'［c］',indent:0},{text:'・ret_value ← false',indent:1},{text:'',indent:0},{text:'・return ret_value',indent:0},
] as const;
export function legacy2017AutumnPm8Units(values:number[]){const m=legacy2017AutumnPm8Model(values),show=legacy2017AutumnPm8Visible;return {
 required:'次の問8は必須問題です。必ず解答してください。',
 instruction1:'設問1　プログラム中の［ ］に入れる正しい答えを，解答群の中から選べ。ここで，a1とa2に入れる答えは，aに関する解答群の中から組合せとして正しいものを選ぶものとする。',
 instruction2:'設問2　次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。',
 cases:`本プログラムでは，検査文字付文字列の誤りが1文字であれば，誤りを検出できる。しかし，複数の文字に誤りがある場合には，誤りがないと判定されることがある。例えば，関数validateCheckCharacterで表4に示す検査文字付文字列を検証した場合，誤りがないと判定されるケースは［d］。ここで，文字列${show(m.payload)}に対し生成される検査文字は${show(m.check)}である。`,
 instruction3:'設問3　次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。',
 create:`例えば，文字列長が5である4個の文字列${m.rows.map(show).join('，')}を，図1の太枠内のように，各文字列の先頭の位置を最左列に揃え，各文字列を上の行から順に格納して，表を作成する。この表の太枠内の各行各列をそれぞれ文字列とみなして検査文字を生成し，最右列と最下行に格納する。この手順で作成した検査文字付表を図2に示す。作成した検査文字付表の5行5列目（網掛け部分）の検査文字は［e］である。`,
 instruction4:'設問4　次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。',
 replacement:'図2の1行目の検査文字付文字列を取り除いた，図3の検査文字付表について考える。表4のケース1〜4の検査文字付文字列を順に，図3の1行目に格納して検証した場合，検査文字付表に誤りがないと判定されるケースは［f］。',
 };}
export const legacy2017AutumnPm8Profiles=[
 'legacy-2017-autumn-pm8-required','legacy-2017-autumn-pm8-characters','legacy-2017-autumn-pm8-arguments-calc','legacy-2017-autumn-pm8-arguments-validate','legacy-2017-autumn-pm8-instruction1','legacy-2017-autumn-pm8-program','legacy-2017-autumn-pm8-bank-a','legacy-2017-autumn-pm8-bank-b','legacy-2017-autumn-pm8-bank-c','legacy-2017-autumn-pm8-instruction2','legacy-2017-autumn-pm8-cases','legacy-2017-autumn-pm8-cases-table','legacy-2017-autumn-pm8-bank-d','legacy-2017-autumn-pm8-instruction3','legacy-2017-autumn-pm8-grid-initial','legacy-2017-autumn-pm8-create','legacy-2017-autumn-pm8-grid-complete','legacy-2017-autumn-pm8-bank-e','legacy-2017-autumn-pm8-instruction4','legacy-2017-autumn-pm8-replacement','legacy-2017-autumn-pm8-grid-removed','legacy-2017-autumn-pm8-bank-f',
] as const;
export const legacy2017AutumnPm8CalcArguments=[['input[]','文字型','入力','文字列が格納されている1次元配列'],['len','整数型','入力','文字列の文字列長（1以上）'],['返却値','文字型','出力','生成した検査文字を返す。']];
export const legacy2017AutumnPm8ValidateArguments=[['input[]','文字型','入力','検査文字付文字列が格納されている1次元配列'],['len','整数型','入力','検査文字付文字列の文字列長（2以上）'],['返却値','論理型','出力','検査文字付文字列に誤りがないと判定した場合はtrue，誤りがあると判定した場合はfalseを返す。']];
export function legacy2017AutumnPm8Figure(profile:string,values:number[]){const model=legacy2017AutumnPm8Model(values);if(!(legacy2017AutumnPm8Profiles as readonly string[]).includes(profile))throw new DataError('SOURCE_FIGURE','秋午後問8の未登録描画です');const kind=profile.slice('legacy-2017-autumn-pm8-'.length),units=legacy2017AutumnPm8Units(values),banks=legacy2017AutumnPm8Banks(values),captions:Record<string,string>={characters:'表1　文字，及び文字に割り当てた数値','arguments-calc':'表2　関数calcCheckCharacterの引数及び返却値の仕様','arguments-validate':'表3　関数validateCheckCharacterの引数及び返却値の仕様',program:'〔プログラム〕','cases-table':'表4　検査文字付文字列','grid-initial':'図1　作成中の検査文字付表','grid-complete':'図2　完成した検査文字付表','grid-removed':'図3　1行目を取り除いた検査文字付表'};
 const caption=captions[kind]??(kind.startsWith('bank-')?kind.slice(5)+'に関する解答群':units[kind as keyof typeof units]);let alt=caption;
 if(kind==='characters')alt+='。'+[...legacy2017AutumnPm8Alphabet].map((c,i)=>legacy2017AutumnPm8Visible(c)+'='+i).join('，');
 if(kind.startsWith('arguments-'))alt+='。'+(kind==='arguments-calc'?legacy2017AutumnPm8CalcArguments:legacy2017AutumnPm8ValidateArguments).map(r=>r.join('：')).join('。');
 if(kind==='program')alt+='。'+legacy2017AutumnPm8Program.map(r=>r.text).join('\n')+'。両関数に回数指定繰返し■，条件▲/▼とelse枝。検証末尾に条件cの▲/▼。';
 if(kind==='cases-table')alt+='。'+model.cases.map((c,i)=>(i+1)+' '+legacy2017AutumnPm8Visible(c)).join('。');
 if(kind.startsWith('grid-')){const data=legacy2017AutumnPm8Grid(kind,values);alt+='。5行6列。1〜4行1〜5列の境界は太線。'+data.map((r,i)=>(i+1)+'行 '+r.map((c,j)=>i===4&&j===4&&kind!=='grid-initial'?'網掛けで非表示':c===''?'未記入':legacy2017AutumnPm8Visible(c)).join('，')).join('。')+(kind==='grid-removed'?'。注記 5行5列目（網掛け部分）には，設問3の正しい答えが入っているものとする。':'');}
 if(kind.startsWith('bank-')){const key=kind.slice(5) as keyof typeof banks;alt+='。'+banks[key].map((x,i)=>'アイウエオカ'[i]+' '+(Array.isArray(x)?x.join('，'):x)).join('。');}
 return {kind,caption,alt,model,banks,units};}
export function legacy2017AutumnPm8Grid(kind:string,values:number[]){const m=legacy2017AutumnPm8Model(values);if(kind==='grid-initial')return [...m.rows.map(r=>[...r,'']),Array.from({length:6},()=>'' as string)];if(kind==='grid-complete')return m.grid.map(r=>[...r]);if(kind==='grid-removed')return [Array.from({length:6},()=>'' as string),...m.grid.slice(1).map(r=>[...r])];throw new DataError('SOURCE_FIGURE','未登録検査表です');}
