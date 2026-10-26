import {legacy2017Pm9Figure as inspect, legacy2017Pm9Bits as bits} from "../core/generators/legacy-2017-pm9-model";
const letters = "abcdefg";
function Marks({count, selected}: {count: number; selected: number[]}) {
  return <span className="legacy-pm9-marks">{Array.from({length: count}, (_, i) => <span key={i} aria-label={`${letters[i]} ${selected.includes(i) ? "マークあり" : "マークなし"}`} className={selected.includes(i) ? "legacy-pm9-mark legacy-pm9-mark-selected" : "legacy-pm9-mark"}>{selected.includes(i)?'':letters[i]}</span>)}</span>;
}
function BitLayout(){return <svg className="legacy-pm9-bit-layout" viewBox="0 0 1040 245" role="group" aria-label="正答及び受験者の解答のマーク列から格納ビットへの対応図">
 {[{key:'C',title:'正答',selected:[1,4],bits:'01001000'},{key:'E',title:'受験者の解答',selected:[1,3],bits:'01010000'}].map((panel,j)=><g key={panel.key} transform={`translate(${j*520} 0)`} data-pm9-bit-panel={panel.key}>
  <text x={150} y={28}>{panel.title}</text><text x={29} y={77}>問12:</text>
  <rect x={130} y={46} width={350} height={48} className="legacy-pm9-bit-box"/>
  {Array.from({length:5},(_,i)=><g key={i} data-pm9-mark-letter={letters[i]} data-pm9-selected={panel.selected.includes(i)?'true':'false'}><ellipse cx={160+i*50} cy={70} rx={13} ry={10} className={panel.selected.includes(i)?'legacy-pm9-bit-mark-selected':'legacy-pm9-bit-mark'}/>{!panel.selected.includes(i)&&<text x={160+i*50} y={77} textAnchor="middle">{letters[i]}</text>}<line x1={160+i*50} y1={94} x2={147+i*24} y2={176} className="legacy-pm9-bit-connection" data-pm9-bit-link={`${panel.key}:${letters[i]}:${i}`}/></g>)}
  <text x={9} y={208}>ans{panel.key}[11]</text><rect x={130} y={176} width={350} height={47} className="legacy-pm9-bit-box"/>
  {panel.bits.split('').map((bit,i)=><text key={i} x={147+i*24} y={208} textAnchor="middle" data-pm9-bit-index={i} data-pm9-bit-value={bit}>{bit}</text>)}<text x={359} y={208} data-pm9-bit-tail="8zeros">0…0</text>
 </g>)}
 </svg>;}
function MarkingTrace({correct,submitted}:{correct:number[];submitted:number[]}){return <svg className="legacy-pm9-trace" viewBox="0 0 1240 230" role="group" aria-label="関数markingに渡された3行分の配列及び採点結果の空欄f">
 <text x={95} y={29} textAnchor="middle">解答形式</text><text x={395} y={29} textAnchor="middle">正答</text><text x={785} y={29} textAnchor="middle">受験者の解答</text><text x={1095} y={29} textAnchor="middle">採点結果</text>
 {[{kind:'type',x:124,width:54},{kind:'ansC',x:330,width:245},{kind:'ansE',x:715,width:245}].map(group=><g key={group.kind} data-pm9-trace-array={group.kind}><rect x={group.x} y={62} width={group.width} height={123} className="legacy-pm9-bit-box"/>{[103,144].map(y=><line key={y} x1={group.x} x2={group.x+group.width} y1={y} y2={y} className="legacy-pm9-trace-divider"/>)}</g>)}
 {[0,1,2].map(i=><g key={i} data-pm9-trace-row={20+i}>
  <text x={8} y={91+41*i}>type[{20+i}]</text><text x={151} y={91+41*i} textAnchor="middle" data-pm9-trace-value={`type:${20+i}`}>{11+i}</text>
  <text x={216} y={91+41*i}>ansC[{20+i}]</text><text x={344} y={91+41*i} data-pm9-trace-value={`ansC:${20+i}`}>{bits(correct[i])}</text>
  <text x={600} y={91+41*i}>ansE[{20+i}]</text><text x={729} y={91+41*i} data-pm9-trace-value={`ansE:${20+i}`}>{bits(submitted[i])}</text><text x={985} y={91+41*i}>mark[{20+i}]</text>
 </g>)}<rect x={1145} y={62} width={48} height={123} className="legacy-pm9-f-rect" data-pm9-trace-blank="f"/><text x={1169} y={132} textAnchor="middle">f</text>
 </svg>;}
export function Legacy2017Pm9Figure({profile, values}: {profile: string; values: number[]}) {
  const f = inspect(profile, values), m = f.model;
  const heading=profile.endsWith('-bank')||profile.endsWith('-result-options');
  return <div className="legacy-pm9-figure" role="group" aria-label={f.caption} data-legacy-pm9-profile={profile}>
    {heading&&<p className="legacy-pm9-source-heading" data-pm9-caption="top">{f.caption}</p>}
    {f.bank && <div className={profile.endsWith('-e-bank') ? 'legacy-pm9-bank legacy-pm9-bank-prose' : 'legacy-pm9-bank'}>{f.bank.map((s, i) => <div key={i} data-pm9-option={i}><span>{'アイウエオカキク'[i]}</span><span>{s}</span></div>)}</div>}
    {profile === "legacy-2017-pm9-mark-sheet" && <table><thead><tr><th>問題</th><th>受験者の解答</th></tr></thead><tbody>
      <tr><td>問11 次の三つの面積のうち、最も大きいのはどれか。<br/>a 2000mm²　b 30cm²　c 0.004m²</td><td>問11：<Marks count={3} selected={[2]}/></td></tr>
      <tr><td>問12 二次方程式 x²−x−2＝0 の解を二つ選べ。<br/>a −2　b −1　c 0　d 1　e 2</td><td>問12：<Marks count={5} selected={[1, 3]}/></td></tr>
    </tbody></table>}
    {profile === "legacy-2017-pm9-bit-layout" && <BitLayout/>}
    {profile === "legacy-2017-pm9-unordered-example" && <table><tbody>
      <tr><th colSpan={2}>問題</th></tr><tr><td colSpan={2}>問21〜23 次の府県のうち、海に面していないのは［問21］、［問22］及び［問23］である。<br/>a 大阪　b 岐阜　c 京都　d 滋賀　e 奈良　f 兵庫　g 三重</td></tr>
      <tr><th>正答</th><th>受験者の解答</th></tr>
      {[0, 1, 2].map(i => <tr key={i}><td>問{21 + i}：<Marks count={7} selected={[[1], [3], [4]][i]}/></td><td>問{21 + i}：<Marks count={7} selected={[[4], [1], [3]][i]}/></td></tr>)}
    </tbody></table>}
    {profile === "legacy-2017-pm9-marking-trace" && <MarkingTrace correct={m.correct} submitted={m.submitted}/>}
    {profile === "legacy-2017-pm9-result-options" && <div className="legacy-pm9-result-options">{m.f.map((row, i) => <div key={i}><span>{"アイウエオカ"[i]}</span><table aria-label={`選択肢${"アイウエオカ"[i]}`}><tbody>{row.map((n, j) => <tr key={j}><td>{n}</td></tr>)}</tbody></table></div>)}</div>}
    {!heading&&<p className="legacy-pm9-source-caption" data-pm9-caption="bottom">{f.caption}</p>}
  </div>;
}
