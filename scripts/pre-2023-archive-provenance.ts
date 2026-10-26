/** Public archive routing is provenance, never a licence or readiness state. */
export type ReviewedArchivePaper={collectionId:string;year:number;period:string;slot:string;role:string;originalUrl:string;listedYearPage:string;listedHref:string;selectedArchiveUrl:string;sha256:string;byteLength:number;pageCount:number};
export class ArchiveProvenanceError extends Error { constructor(detail:string){super(`IMPORT_ADMISSION_URL: ${detail}`);this.name='ArchiveProvenanceError';} }
function check(ok:unknown,detail:string):asserts ok {if(!ok)throw new ArchiveProvenanceError(detail);}
function safeData(value:unknown,parents=new Set<object>()):void {
 if(value===null||typeof value==='string'||typeof value==='boolean')return;
 if(typeof value==='number'){check(Number.isFinite(value)&&!Object.is(value,-0),'lossless number');return;}
 check(value&&typeof value==='object'&&!parents.has(value),'plain JSON tuple');const array=Array.isArray(value),proto=Object.getPrototypeOf(value);check(proto===(array?Array.prototype:Object.prototype)||proto===null,'plain tuple prototype');parents.add(value);
 const keys=Reflect.ownKeys(value),length=array?Object.getOwnPropertyDescriptor(value,'length')!.value as number:0;
 if(array)check(keys.length===length+1&&Array.from({length},(_,i)=>Object.hasOwn(value,i)).every(Boolean),'dense tuple array');
 for(const k of keys){if(array&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(value,k)!;check(typeof k==='string'&&d.enumerable&&'value'in d,'tuple data descriptor');safeData(d.value,parents);}parents.delete(value);
}
function calendar(d:string,timestamp=false){
 const y=+d.slice(0,4),m=+d.slice(4,6),day=+d.slice(6,8),h=timestamp?+d.slice(8,10):0,min=timestamp?+d.slice(10,12):0,s=timestamp?+d.slice(12,14):0;
 const date=new Date(Date.UTC(y,m-1,day,h,min,s));check(date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===day&&date.getUTCHours()===h&&date.getUTCMinutes()===min&&date.getUTCSeconds()===s,'capture calendar');
}
function rawURL(v:unknown):string {check(typeof v==='string'&&!/[\s\\%?#\u0000-\u001f\u007f]/u.test(v)&&!/(?:^|\/)\.{1,2}(?:\/|$)/.test(v),'literal reviewed URL');return v;}
/** Expected tuples come from the caller's code-reviewed root. This pure parser
 * has no authority to approve arbitrary archives and performs no I/O. */
export function parseReviewedArchivePaper(input:unknown,expected:ReviewedArchivePaper){
 safeData(input);check(input&&typeof input==='object'&&!Array.isArray(input),'paper object');const p=input as Record<string,unknown>;
 const selected=rawURL(p.selectedArchiveUrl),original=rawURL(p.originalUrl),listed=rawURL(p.listedYearPage),href=rawURL(p.listedHref);
 const route=/^https:\/\/warp\.ndl\.go\.jp\/(\d{8})\/(\d{14})\/(http:\/{1,2})(www\.jitec\.ipa\.go\.jp)(\/1_04hanni_sukiru\/[^:]+\.pdf)$/.exec(selected);
 check(route,'reviewed public replay URL');calendar(route[1]);calendar(route[2],true);
 const path=route[5],file=/^\/1_04hanni_sukiru\/mondai_kaitou_(\d{4})h(\d+)_(1|2)\/(\d{4})h(\d+)(h|a)_fe_(am|pm)_(qs|ans)\.pdf$/.exec(path);check(file,'official FE original path');
 const year=+file[1],era=+file[2],period=file[6],slot=file[7],role=file[8];
 check(year===+file[4]&&era===year-1988&&era===+file[5]&&file[3]===(period==='h'?'1':'2'),'paired year/era/period');
 check(expected.collectionId===`${year}h${era}${period}-fe-${slot}`&&year===expected.year&&period===expected.period&&slot===expected.slot&&role===expected.role&&p.role===role,'reviewed booklet and paper role');
 check(original==='http://'+route[4]+path,'original normalization');
 const yearPage=/^https:\/\/warp\.ndl\.go\.jp\/(\d{8})\/(\d{14})\/http:\/\/www\.jitec\.ipa\.go\.jp\/1_04hanni_sukiru\/mondai_kaitou_(\d{4})h(\d+)\.html$/.exec(listed);check(yearPage&&+yearPage[3]===year&&+yearPage[4]===era,'listed year page');calendar(yearPage[1]);calendar(yearPage[2],true);
 check(href===path.slice('/1_04hanni_sukiru/'.length),'literal listed relative href');
 for(const field of ['originalUrl','selectedArchiveUrl','listedYearPage','listedHref','sha256','byteLength','pageCount'] as const)check(p[field]===expected[field],`reviewed tuple ${field}`);
 check(typeof p.sha256==='string'&&/^[a-f0-9]{64}$/.test(p.sha256)&&Number.isSafeInteger(p.byteLength)&&Number(p.byteLength)>=5&&Number.isSafeInteger(p.pageCount)&&Number(p.pageCount)>0,'full PDF observation');
 return Object.freeze({outerHost:'warp.ndl.go.jp',collectionRouteDate:route[1],selectedRouteTimestamp:route[2],rawInnerSchemeForm:route[3],originalHost:route[4],originalPath:path,year,eraYear:era,period,directorySeason:file[3],slot,role});
}
