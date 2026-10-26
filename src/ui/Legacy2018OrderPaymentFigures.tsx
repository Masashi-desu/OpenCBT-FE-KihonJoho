import{useId}from'react';
import{legacy2018OrderPaymentFigureAllowed,legacy2018OrderPaymentFigureAlt,legacy2018OrderPaymentRecordFigures as records,legacy2018OrderPaymentProfiles as profiles}from'../core/generators/legacy-2018-pm-order-payment';
/** Source record boxes, literal print mask, and original two-column change table. */
export function Legacy2018OrderPaymentFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(!legacy2018OrderPaymentFigureAllowed(profile,values))throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),record=profile===profiles[0],print=profile===profiles[1],width=record?680:print?1020:1220,height=record?135:print?170:440;
 const label=(s:string,x:number,y:number,key:string,mono=false)=><text key={key} data-op-text={key} x={x} y={y} textAnchor={mono?'start':'middle'} xmlSpace="preserve" style={{fontSize:mono?20:24,fontFamily:mono?'monospace':undefined}}>{s}</text>;
 const box=(key:string,x:number,y:number,w:number,h:number)=><rect key={key} data-op-box={key} x={x} y={y} width={w} height={h} fill="var(--surface)"/>;
 const line=(key:string,x1:number,y1:number,x2:number,y2:number)=><line key={key} data-op-line={key} x1={x1} y1={y1} x2={x2} y2={y2}/>;
 const picture=record?records[values[0]-1]:records[3];
 return <figure className={`managed-diagram source-figure profile-${profile}`}>{profile===profiles[2]&&<figcaption>{caption}</figcaption>}<div className="diagram-scroll" tabIndex={0} aria-label={`${caption}。左右にスクロールできます。`}><svg className="source-figure-svg" viewBox={`0 0 ${width} ${height}`} style={{width:`max(calc(${width}px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))`}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018OrderPaymentFigureAlt(profile,values)}</desc><g aria-hidden="true">
 {record&&'fields'in picture?<>{box('record',20,20,640,85)}{[1,2,3].map(n=>line('field-'+n,20+160*n,20,20+160*n,105))}{picture.fields.map((f,n)=><g key={n}>{label(f[0],100+160*n,46,'field-name-'+n)}{label(f[1]+'桁',100+160*n,81,'field-width-'+n)}</g>)}</>:print&&'headers'in picture?<>{box('print',20,15,980,130)}{picture.headers.map((s,i)=>label(s,[95,255,450,670,890][i],40,'print-header-'+i))}{picture.rows.map((r,j)=>r.map((s,i)=>label(s,[35,235,375,595,815][i],79+j*37,'print-'+j+'-'+i,true)))}</>:<>
 {box('change-table',15,15,1190,365)}{line('column',250,15,250,380)}{[58,160,220].map((n,i)=>line('row-'+i,15,n,1205,n))}
 {label('処理',132,36,'change-left-head')}{label('変更内容',728,36,'change-right-head')}
 {label('行番号36と37の間',132,85,'site36')}{label('に追加',65,117,'site36-add')}
 {label('01 CR-DATE-X.',275,82,'declare1',true)}{label('   02 CR-DATE    PIC 9(8).',275,112,'declare2',true)}{label('77 W-CNT         PIC 9(3).',275,142,'declare3',true)}
 {label('行番号38と39の間',132,185,'site38')}{label('に追加',65,211,'site38-add')}{label('MOVE FUNCTION CURRENT-DATE TO CR-DATE-X. 1)',275,188,'current-date',true)}
 {box('blank-e',30,238,200,30)}{label('e',130,253,'blank-e')}{label('に追加',65,286,'site-e-add')}
 {label('COMPUTE W-CNT = FUNCTION INTEGER-OF-DATE(CR-DATE)',275,245,'compute1',true)}{label('              - FUNCTION INTEGER-OF-DATE(ORD-DATE)',275,275,'compute2',true)}
 {label('IF',275,311,'if',true)}{box('blank-f',320,295,230,32)}{label('f',435,311,'blank-f')}{label('THEN',570,311,'then',true)}{label('    DISPLAY ORD-NO',275,342,'display',true)}{label('END-IF',275,371,'endif',true)}
 </>}
 </g></svg></div>{profile!==profiles[2]&&<figcaption>{caption}</figcaption>}</figure>;
}
