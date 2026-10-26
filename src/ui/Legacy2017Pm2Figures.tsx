import{useId}from'react';import{legacy2017Pm2Profile,legacy2017Pm2Model,legacy2017Pm2FigureAlt}from'../core/generators/legacy-2017-pm2-model';import{legacy2017Pm2Source as source}from'../core/generators/legacy-2017-pm2-source';
const wires=[[[610,344],[650,344],[650,310],[850,310],[850,370]],[[610,372],[680,372],[680,328],[970,328],[970,425],[910,425]],[[610,400],[710,400],[710,346],[1000,346],[1000,535],[910,535]],[[610,428],[650,428],[650,635],[850,635],[850,590]],[[610,456],[680,456],[680,535],[790,535]],[[610,484],[650,484],[650,425],[790,425]],[[610,512],[720,512],[720,480],[850,480]],[[610,540],[630,540],[630,660],[940,660],[940,590]]];
const polygons:Record<number,string>={7:'800,370 810,360 890,360 900,370 890,380 810,380',6:'910,390 920,400 920,450 910,460 900,450 900,400',5:'910,500 920,510 920,560 910,570 900,560 900,510',4:'800,590 810,580 890,580 900,590 890,600 810,600',3:'790,500 800,510 800,560 790,570 780,560 780,510',2:'790,390 800,400 800,450 790,460 780,450 780,400',1:'800,480 810,470 890,470 900,480 890,490 810,490'};
const sourceRows=source.pages[2].blocks.find(b=>b.id==='table2');if(!sourceRows||!('rows'in sourceRows))throw Error('SOURCE_TABLE');const rows=sourceRows.rows;
/** Annual-only managed source format. No shared renderer registration. */
export function Legacy2017Pm2Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!==legacy2017Pm2Profile)throw Error('FIGURE_PROFILE');if(values.length!==2||!Number.isInteger(values[0])||values[0]<0||values[0]>2||!Number.isInteger(values[1])||values[1]<0||values[1]>4)throw Error('FIGURE_DOMAIN');const[v,part]=values,m=legacy2017Pm2Model(v),id=useId().replace(/:/g,''),dims=[[1100,190],[1100,860],[230,310],[1220,640],[850,1080]][part];
 const text=(x:number,y:number,t:string,key?:string)=> <text key={key??t} x={x} y={y}>{t}</text>;
 const led=(bits:readonly number[])=> <g data-led="segments"><rect data-led-frame="1" x="765" y="345" width="190" height="275" fill="none"/>{Object.entries(polygons).map(([b,points])=><polygon key={b} data-led-bit={b} points={points} style={{fill:bits.includes(Number(b))?'currentColor':'var(--surface)'}}/>)}<circle data-led-bit="0" cx="940" cy="590" r="10" style={{fill:'var(--surface)'}}/></g>;
 const operationLines=[['番号1のI/Oポートに形状データを書き込むと，','出力ポートの各ビットに値が設定され，','LEDの各セグメントの点灯と消灯が行われる。'],['番号2のI/Oポートに値1を書き込むと，','A/D変換が開始される。'],['番号2のI/Oポートから読み込んだ値が0ならば，','変換中を示す。'],['番号2のI/Oポートから読み込んだ値が0以外ならば，','A/D変換が完了して出力値が確定していることを示す。'],['A/D変換完了後に番号3のI/Oポートから読み込むと，','A/D変換器の出力値（0～7）が得られる。']];operationLines.forEach((lines,i)=>{if(lines.join('')!==rows[i][2])throw Error('SOURCE_OPERATION');});
 return <figure className={'managed-diagram source-figure profile-'+profile} style={{maxWidth:`calc(${dims[0]}px * var(--image-scale, 1))`}} data-pm2-part={part}>
 <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}><svg className="source-figure-svg" style={{width:`max(calc(${dims[0]}px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))`}} viewBox={`0 0 ${dims[0]} ${dims[1]}`} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}><title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{legacy2017Pm2FigureAlt(v,part)}</desc><g aria-hidden="true">
 {part===0&&<><rect data-notice-frame="1" x="10" y="10" width="1080" height="170" fill="none"/>{text(30,45,'次の問2から問7までの6問については，この中から4問を選択し，選択した問題につ')}{text(30,85,'いては，答案用紙の選択欄の')}<circle data-selection-circle="選" cx="380" cy="85" r="18" fill="none"/>{text(367,85,'選')}{text(405,85,'をマークして解答してください。')}{text(30,135,'なお，5問以上マークした場合には，はじめの4問について採点します。')}</>}
 {part===1&&<>
 {[['CPU',35,80,150,70],['タイマ',35,220,210,100],['温度検出器',35,420,170,70],['A/D変換器',35,555,170,70]].map(([name,x,y,w,h])=><g key={String(name)}><rect data-device={name} x={x} y={y} width={w} height={h} fill="none"/><text x={Number(x)+15} y={Number(y)+35}>{name}</text>{name==='タイマ'&&<><text x="45" y="282">（一定間隔で</text><text x="55" y="310">割込み）</text></>}</g>)}
 <line data-bus="main" x1="300" y1="50" x2="300" y2="675"/>{[115,270,530,590].map((y,i)=><g key={y}><line data-bus-link={i} x1={i===0?185:i===1?245:i===2?300:205} y1={y} x2={i===2?450:300} y2={y}/><circle data-bus-dot={i} cx="300" cy={y} r="4" style={{fill:'currentColor'}}/></g>)}{text(275,710,'バス')}
 <defs><marker id={id+'-sensor'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="currentColor"/></marker></defs><line data-sensor-arrow="1" x1="120" y1="490" x2="120" y2="555" markerEnd={`url(#${id}-sensor)`}/>
 <rect data-port="1" x="450" y="85" width="160" height="590" fill="none"/>{text(450,50,'出力ポート')}{Array.from({length:16},(_,i)=>15-i).map((b,i)=><text key={b} data-port-bit={b} x="590" textAnchor="end" y={120+i*28}>{b===15?'ビット 15':String(b)}</text>)}
 {wires.map((points,i)=><polyline key={i} data-wire-bit={7-i} points={points.map(p=>p.join(',')).join(' ')} fill="none"/>)}{text(830,270,'LED')}{led([7,6,4,3,1])}
 <text data-legend-heading="1" x="780" y="710">凡例</text>
 <polygon data-legend="on" points="780,755 790,745 825,745 835,755 825,765 790,765" style={{fill:'currentColor'}}/><circle data-legend-dot="on" cx="850" cy="755" r="7" style={{fill:'currentColor'}}/><text x="880" y="755">点灯状態</text><polygon data-legend="off" points="780,790 790,780 825,780 835,790 825,800 790,800" style={{fill:'var(--surface)'}}/><circle data-legend-dot="off" cx="850" cy="790" r="7" style={{fill:'var(--surface)'}}/><text x="880" y="790">消灯状態</text>
 </>}
 {part===2&&<g transform="translate(-750 -335)">{led(m.bits)}</g>}
 {part===3&&<>
 <rect data-table-outline="1" x="10" y="10" width="1200" height="600" fill="none"/>{[170,300].map(x=><line key={x} data-table-column={x} x1={x} y1="10" x2={x} y2="610"/>)}<line x1="10" y1="90" x2="1210" y2="90" data-table-header="1"/>{[194,298,402,506].map((y,i)=><line key={y} data-table-row={i} x1={i===0?10:i===3?170:300} y1={y} x2="1210" y2={y}/>)}
 <text data-table-heading="0" x="35" y="50">機器</text><text data-table-heading="1"><tspan x="180" y="36">I/Oポート</tspan><tspan x="210" y="66">番号</tspan></text><text data-table-heading="2" x="320" y="50">動作概要</text>
 <text data-table-device="LED" x="30" y="120">LED</text><text data-table-device="AD" x="25" y="402">A/D変換器</text><text data-table-port="LED" x="220" y="120">1</text><text data-table-port="AD2" x="220" y="350">2</text><text data-table-port="AD3" x="220" y="558">3</text>
 {operationLines.map((lines,i)=>lines.map((line,j)=><text key={i+'-'+j} data-operation-row={i} x="320" y={120+i*104+j*30}>{line}</text>))}
 </>}
 {part===4&&<>
 <defs><marker id={id+'-return'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path data-return-head="1" d="M1 1 L9 5 L1 9" fill="none" stroke="currentColor"/></marker></defs>
 {[[70,140],[190,250],[300,350],[400,440],[520,580],[630,690],[740,790],[840,890],[940,990]].map(([a,b],i)=><line data-flow-main={i} key={i} x1="300" y1={a} x2="300" y2={b}/>)}
 <rect data-flow-node="start" x="210" y="20" width="180" height="50" rx="25" fill="none"/>{text(267,45,'開始')}
 {([['gr1',140,'GR←1'],['out2',250,'OUTPUT 2'],['in2',350,'INPUT 2'],['in3',580,'INPUT 3'],['convert',690,'変換処理'],['gra',790,'GR←α'],['e',890,'']]as const).map(([name,y,t])=><g key={name}><rect data-flow-node={name} x="210" y={y} width="180" height="50" fill="none"/>{t&&text(235,y+25,t)}</g>)}
 <polygon data-flow-node="d" points="300,440 390,480 300,520 210,480" style={{fill:'var(--surface)'}}/>
 <rect data-blank="d" x="267" y="461" width="66" height="37" fill="none"/>{text(291,480,'d')}<rect data-blank="e" x="245" y="898" width="110" height="34" fill="none"/>{text(292,915,'e')}
 <polyline data-flow-return="1" points="210,480 90,480 90,325 300,325" fill="none" markerEnd={`url(#${id}-return)`}/>{text(130,458,'Yes')}{text(320,550,'No')}
 <rect data-flow-node="end" x="210" y="990" width="180" height="50" rx="25" fill="none"/>{text(267,1015,'終了')}
 <line data-comment-link="start" x1="390" y1="275" x2="435" y2="275" strokeDasharray="7 5"/><path data-comment-bracket="start" d="M450 250 H435 V300 H450" fill="none"/>{text(455,275,'A/D変換開始')}
 <line data-comment-link="convert" x1="390" y1="715" x2="435" y2="715" strokeDasharray="7 5"/><path data-comment-bracket="convert" d="M450 685 H435 V745 H450" fill="none"/>{text(455,705,'A/D変換器の出力値を')}{text(455,735,'形状データαに変換')}
 </>}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
