import {useId} from 'react';
import {legacy2017AutumnPm3Model} from '../core/generators/legacy-2017-autumn-pm3-model';
import {legacy2017AutumnPm3Profiles,legacy2017AutumnPm3Captions,legacy2017AutumnPm3Alts} from '../core/generators/legacy-2017-autumn-pm3-source';
type NativeTable={name:string;columns:string[];keys?:number[];rows?:string[][]};
function DatabaseTable({spec}:{spec:NativeTable}){return <table data-autumn-pm3-table={spec.name}><caption>{spec.name}</caption><thead><tr>{spec.columns.map((c,i)=><th key={c} scope="col">{spec.keys?.includes(i)?<u data-primary-key="true">{c}</u>:c}</th>)}</tr></thead>{spec.rows&&<tbody>{spec.rows.map((row,i)=><tr key={i}>{row.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody>}</table>}
/** Source-shaped native tables. Only managed columns/rows can reach this component. */
export function Legacy2017AutumnPm3Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const id=useId().replace(/:/g,''),i=legacy2017AutumnPm3Profiles.indexOf(profile as typeof legacy2017AutumnPm3Profiles[number]),m=legacy2017AutumnPm3Model(values);
 if(i<0)throw Error('AUTUMN_PM3_PROFILE');if(caption!==legacy2017AutumnPm3Captions[i])throw Error('AUTUMN_PM3_CAPTION');
 const detail={name:'販売明細表',columns:['伝票番号','商品番号','個数'],keys:[0,1]};
 const specs:NativeTable[][]=[[
 {name:'会員表',columns:['会員番号','氏名','生年','電話番号','郵便番号','住所'],keys:[0],rows:[['K20001','山田太郎','1960','03-3811-XXXX','112-0003','東京都文京区…'],['K20002','中村二郎','1953','03-3235-YYYY','160-0022','東京都新宿区…'],Array(6).fill('⋮')]},
 {name:'販売表',columns:['伝票番号','販売日','会員番号','販売額'],keys:[0],rows:[['D0000001',m.year+'-10-02','K20002','4200'],['D0000002',m.year+'-10-02','K40027','2000'],['D0000003',m.year+'-10-02','K20004','12700'],Array(4).fill('⋮')]},
 {...detail,rows:[['D0000001','S1000001','30'],['D0000001','S1000002','10'],['D0000002','S3000001','1'],Array(3).fill('⋮')]},
 {name:'商品表',columns:['商品番号','分類','商品名','単価'],keys:[0],rows:[['S1000001','コーヒー','ブラックコーヒー 200mL','100'],['S1000002','コーヒー','エスプレッソ 200mL','120'],['S3000001','ジュース','リンゴジュース 1L 12本','2000'],Array(4).fill('⋮')]}],
 [{...detail,columns:[...detail.columns,'販売時単価']}],
 [{name:'入荷表',columns:['入荷番号','商品番号','入荷日','入荷数'],keys:[0,1]},{name:'ビュー入荷集計表',columns:['商品番号','入荷総数'],keys:[0]}],
 [{name:'ビュー販売集計表',columns:['商品番号','販売総数'],keys:[0]},{name:'ビュー在庫表',columns:['商品番号','在庫数'],keys:[0]}]];
 return <figure className={'managed-diagram source-figure legacy-autumn-pm3 profile-'+profile} data-autumn-pm3-kind={i}><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'} aria-describedby={id+'-description'}><span className="sr-only" id={id+'-description'}>{legacy2017AutumnPm3Alts[i]}</span><div className={'autumn-pm3-tables autumn-pm3-layout-'+i}>{specs[i].map(spec=><DatabaseTable key={spec.name} spec={spec}/>)}</div></div><figcaption>{caption}</figcaption></figure>;
}
