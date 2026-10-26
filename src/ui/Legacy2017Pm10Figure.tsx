import {legacy2017Pm10Figure as inspect,legacy2017Pm10Program} from '../core/generators/legacy-2017-pm10-data';
const framed=(text:string)=>text.split(/(\[[a-g]\]|［[a-g]］)/).map((s,i)=>/^\[[a-g]\]$|^［[a-g]］$/.test(s)?<span className="pm10-blank" key={i} aria-label={'空欄'+s.slice(1,-1)}>{s.slice(1,-1)}</span>:s);
export function Legacy2017Pm10Figure({profile,values}:{profile:string;values:number[]}){
 const f=inspect(profile,values),m=f.model;
 if(f.bank)return<section className="legacy-pm10-bank" aria-label={f.caption} data-pm10-bank={values[1]} data-legacy-pm10-profile={profile}><p>{f.caption}</p><div>{f.bank.items.map((text,i)=><p key={i} data-pm10-choice={values[1]+':'+i}><span>{'アイウエオ'[i]}　</span><code>{text}</code></p>)}</div></section>;
 if(profile==='legacy-2017-pm10-program')return<section className="legacy-pm10-program" data-legacy-pm10-profile={profile}><p>〔プログラム〕</p><div className="pm10-scroll" tabIndex={0} role="region" aria-label="COBOLプログラム全54行"><p>（行番号）</p>{legacy2017Pm10Program.map((text,i)=><div className="pm10-code-line" key={i} data-pm10-line={i+1}><span>{i+1}</span><code>{framed(text)}</code></div>)}</div></section>;
 return <figure className="legacy-pm10-figure" aria-label={f.caption} data-legacy-pm10-profile={profile}><div className="pm10-scroll" tabIndex={0}>
 {profile==='legacy-2017-pm10-slip-record'&&<table><tbody><tr>{['支店番号\n2桁','伝票番号\n6桁','売上日\n8桁','売上金額\n6桁'].map(s=><td key={s}>{s}</td>)}</tr></tbody></table>}
 {profile==='legacy-2017-pm10-master-record'&&<table><tbody><tr><td rowSpan={2}>売上年月<br/>6桁</td><td rowSpan={2}>売上金額合計<br/>10桁</td><td colSpan={4}>支店別売上金額</td></tr><tr><td>支店1<br/>9桁</td><td>支店2<br/>9桁</td><td>…</td><td>支店8<br/>9桁</td></tr></tbody></table>}
 {profile==='legacy-2017-pm10-output'&&<pre>{['ST','ND','RD','TH'].map((s,i)=>`${i+1}${s} QUARTER: ${m.totals[i].toLocaleString('en-US').padStart(14)}`).join('\n')}</pre>}
 {profile==='legacy-2017-pm10-changes'&&<table><caption>{f.caption}</caption><thead><tr><th>処置</th><th>変更内容</th></tr></thead><tbody>
 <tr><td>行番号17と18の間<br/>に追加</td><td><pre>{framed('88 QUART-MONTH VALUES [f].')}</pre></td></tr>
 <tr><td>行番号24と25の間<br/>に追加</td><td><pre>{framed(`77 QUART-AMOUNT   PIC 9(11) VALUE ZERO.
77 QUART-AMOUNT-D PIC ZZ,ZZZ,ZZZ,ZZ9.
77 CR-QUART       PIC 9(1) VALUE 1.
01 QUART-STR      PIC X(8) VALUE "STNDRDTH".
01 QUART-TBL REDEFINES QUART-STR.
   02 QUART-NO    PIC X(2) OCCURS 4.`)}</pre></td></tr>
 <tr><td>{framed('[e]')}<br/>に追加</td><td><pre>{framed(`ADD MST-AMOUNT TO QUART-AMOUNT
IF QUART-MONTH THEN
    MOVE QUART-AMOUNT TO QUART-AMOUNT-D
    DISPLAY CR-QUART QUART-NO(CR-QUART)
            " QUARTER: " QUART-AMOUNT-D
    MOVE ZERO TO QUART-AMOUNT
    [g]
END-IF`)}</pre></td></tr>
 </tbody></table>}
 </div>{profile!=='legacy-2017-pm10-changes'&&<figcaption>{f.caption}</figcaption>}</figure>;
}
