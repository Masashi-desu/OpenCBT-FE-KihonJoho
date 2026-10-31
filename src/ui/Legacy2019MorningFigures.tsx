import {useId,type ReactNode} from 'react';
import {legacy2019FigureAlt,legacy2019Tree} from '../core/generators/legacy-2019-algorithms';
const domains={"legacy-2019-two-input-box":[[0,0]],"legacy-2019-data-feedback":[[0,3]],"legacy-2019-database-diagnosis":[[0,3]],"legacy-2019-bst":[[0,3],[0,3],[0,3]],"legacy-2019-gcd-flow":[[0,0]]};
/** AM only: no annual wrapper or afternoon dependency. Geometry is preserved. */
export function Legacy2019MorningFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const domain=domains[profile as keyof typeof domains];if(!domain||values.length!==domain.length||values.some((v,i)=>!Number.isInteger(v)||v<domain[i][0]||v>domain[i][1]))throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),nodes:ReactNode[]=[];let key=0;
  if(profile==="legacy-2019-two-input-box")return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="二入力一出力の回路図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 360 160" style={{width:"min(calc(560px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))",marginInline:"auto"}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>長方形の論理回路に左から入力Aと入力Bが入り、右へ出力Xが出る。内部の回路は示されていない。</desc><g aria-hidden="true"><rect data-logic-box="true" x={110} y={20} width={130} height={120} fill="var(--surface)"/><line data-logic-role="input-A" x1={70} y1={55} x2={110} y2={55}/><line data-logic-role="input-B" x1={70} y1={105} x2={110} y2={105}/><line data-logic-role="output-X" x1={240} y1={80} x2={280} y2={80}/><text data-logic-label="A" x={40} y={55} textAnchor="middle">A</text><text data-logic-label="B" x={40} y={105} textAnchor="middle">B</text><text data-logic-label="X" x={304} y={80} textAnchor="middle">X</text></g></svg></div><figcaption>{caption}</figcaption></figure>;
  if(profile==="legacy-2019-data-feedback")return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="分析結果の分類表。幅が足りない場合は左右にスクロールできます。"><table data-feedback-table="2019h31h-am64" style={{minWidth:"min(640px, max(100%, 27em))"}}><caption className="sr-only">{caption}</caption><thead><tr><td colSpan={2} rowSpan={2} style={{border:"none"}}/><th scope="colgroup" colSpan={2}>分析結果の反映タイミング</th></tr><tr><th scope="col">一定期間ごと</th><th scope="col">即時</th></tr></thead><tbody>{["顧客全体","顧客個々"].map((label,row)=><tr key={label}>{row===0?<th scope="rowgroup" rowSpan={2}>分析結果の<br/>フィードバック先</th>:null}<th scope="row">{label}</th>{[0,1].map(col=>{const i=row*2+col;return <td key={col} data-feedback-cell={"abcd"[i]} aria-label={i===values[0]?`${"abcd"[i]}、問うセル、太枠`:undefined} data-questioned={i===values[0]?"true":undefined} style={{textAlign:"center",whiteSpace:"nowrap",...(i===values[0]?{border:"3px solid var(--text-primary)"}:{})}}>{"abcd"[i]}</td>;})}</tr>)}</tbody></table></div></figure>;
  if(profile==="legacy-2019-database-diagnosis")return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="原因の表。幅が足りない場合は左右にスクロールできます。"><table data-diagnosis-table="2019h31h-am15" style={{minWidth:"min(640px, max(100%, 25em))"}}><caption>{caption}</caption><thead><tr><th scope="col">想定原因</th><th scope="col">調査項目</th></tr></thead><tbody>{[
    ["同一サーバに他のシステムを共存させたことによる負荷の増加","接続クライアント数の増加による通信量の増加"],
    ["非定型検索による膨大な処理時間を要するSQL文の実行"],
    ["フラグメンテーションによるディスクI/Oの増加"],
    ["データベースバッファの容量の不足"],
  ].map((causes,i)=><tr key={i} data-investigation={"abcd"[i]}><td><ul style={{paddingLeft:"1.2em",margin:0}}>{causes.map(c=><li key={c}>{c}</li>)}</ul></td><td data-questioned={values[0]===i?"true":undefined} style={{whiteSpace:"nowrap",...(values[0]===i?{border:"2px solid var(--line)"}:{})}}>{"abcd"[i]}</td></tr>)}</tbody></table></div></figure>;
  const text = (x: number,y: number,label: string | number) => nodes.push(<text key={key++} x={x} y={y} textAnchor="middle">{label}</text>);
  const line = (x1: number,y1: number,x2: number,y2: number,arrow = false) => nodes.push(<line key={key++} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={arrow ? `url(#${id}-arrow)` : undefined}/>);
  const polyline = (points: string,arrow = false) => nodes.push(<polyline key={key++} points={points} fill="none" markerEnd={arrow ? `url(#${id}-arrow)` : undefined}/>);
  const box = (x: number,y: number,w: number,h: number,label: string,round = false) => { nodes.push(<rect key={key++} x={x} y={y} width={w} height={h} rx={round ? h/2 : 0} fill="var(--surface)"/>); text(x+w/2,y+h/2,label); };
  let height: number,viewWidth=1000;
  if (profile === "legacy-2019-bst") {
    height = 620; const tree = legacy2019Tree(values[0],values[1],values[2]);
    const points = [[500,65],[260,220],[740,220],[140,365],[380,365],[620,365],[860,365],[0,520],[0,520]];
    points[7][0] = points[tree.parent][0] - 65; points[8][0] = points[tree.parent][0] + 65;
    for (const [a,b] of tree.edges) line(points[a][0],points[a][1],points[b][0],points[b][1]);
    for (let i = 0; i < points.length; i++) {
      nodes.push(<circle key={key++} cx={points[i][0]} cy={points[i][1]} r={31} fill="var(--surface)"/>); text(points[i][0],points[i][1],tree.values[i]);
    }
  } else if (profile === "legacy-2019-gcd-flow") {
    height = 730; box(370,15,260,60,"開始",true); line(500,75,500,110,true);
    box(370,110,260,85,""); text(500,135,"L ← A"); text(500,170,"S ← B"); line(500,195,500,300,true);
    nodes.push(<polygon key={key++} points="500,300 620,375 500,450 380,375" fill="var(--surface)"/>); text(500,375,"L : S");
    line(380,375,220,375); polyline("220,375 220,315",true); box(65,245,310,70,"L ← (L − S)");
    polyline("220,245 220,225 500,225 500,300",true); text(325,350,">");
    line(620,375,780,375); polyline("780,375 780,315",true); box(625,245,310,70,"S ← (S − L)");
    polyline("780,245 780,225 500,225 500,300",true); text(675,350,"<");
    line(500,450,500,505,true); text(540,475,"="); box(335,505,330,85,""); text(500,530,"A, B, L"); text(500,568,"の出力");
    line(500,590,500,635,true); box(370,635,260,60,"終了",true);
  } else throw Error("UNKNOWN_LEGACY_2019_MORNING_FIGURE");
  const alt=legacy2019FigureAlt(profile,values);
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 ${viewWidth} ${height}`}  role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{alt}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="currentColor" strokeWidth="1.8"/></marker></defs><g aria-hidden="true">{nodes}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
