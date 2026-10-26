import {useLayoutEffect,useMemo,useRef,useState} from "react";
export type ContentTextPart={text:string;atomic:boolean};
// Long URLs retain normal wrapping. Tokens never alter the stored characters;
// this helper adds only layout spans, and never parses markup or runs content.
const number="[+＋\\-−－]?[0-9０-９]+(?:,[0-9０-９]{3})*(?:[.．][0-9０-９]+)?(?:[eE][+\\-]?[0-9]+)?(?:[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?(?:[／/][0-9]+(?:\\.[0-9]+)?)?";
const unit="(?:[kKMGTmunμµ]?(?:Hz|bps|bit|B|s|m|g)(?:[²³])?|(?:[kKMGT])?(?:バイト|ビット)(?:[／/]秒)?|件(?:[／/]秒)?|千円|万円|億円|円|年度|時間|ポイント|インチ|ドット|画素|命令|ページ|℃|°C|[％%]|年|月|日|分|秒|回|台|人|倍|個|問|桁|冊|cm|mm|km|kg|L)";
// Only these reviewed algorithm names are indivisible. Other hyphenated/dotted
// ASCII identifiers are consumed as ordinary text so their suffixes are not
// mistaken for signed numbers. URLs still take precedence over every token.
const cryptoNames=new Set(["KCipher-2","SHA-256"]);
// Only these seven source-reviewed WebAPI identifiers are atomic; no general
// camelCase matching. Longest-first prevents a shorter reviewed API prefix match.
const apiNames=new Set(["getOffererInfo","listOffererInfo","getProductInfo","listProductInfo","getResultInfo","getResultInfoForProduct","listResultInfo"]);
// Meanings protect only the reviewed procedure and the nine complete names
// used in 2018 spring PM10 prose/meanings. Keep this subset explicit: numeric,
// API, crypto and other paragraph tokens retain normal wrapping in meanings.
const studyTermCobolNames=new Set(["PRT-PROC","CR-DATE-X","ORD-CODE","ORD-DATA","ORD-EOF","PRT-NO","PRT-REC","RCP-EOF","W-CNT","WAT-REC"]);
export function isStudyTermCobolIdentifier(text:string){return studyTermCobolNames.has(text);}
// Existing15 paragraph names plus eight newly attested names make23. Shared
// names have one authority above; code-only names remain ordinary text.
const cobolNames=new Set(["ALL-CR-TOTAL","ALL-ORD-NO","ALL-RANK","BLD-AVG","BLD-CR-TOTAL","BLD-INF","BLD-ORD-NO","BLD-RANK","BLD-TOTAL","SRT-BLD","SRT-NO","SRT-REC","SRT-TOTAL",...studyTermCobolNames]);
const apiIdentifier=[...apiNames].sort((a,b)=>b.length-a.length).join("|");
const identifier="[A-Za-z][A-Za-z0-9_]*(?:[-.][A-Za-z0-9_]+)+";
const pattern=new RegExp(`(?:https?:\\/\\/|www\\.)[^\\s<>「」]+|${identifier}|(?:${apiIdentifier})|(?:[0-9]{1,3}\\.){3}[0-9]{1,3}(?:\\/[0-9]{1,2})?(?::[0-9]{1,5})?|[0-9]{4}-[0-9]{2}-[0-9]{2}|${number}(?:[ \\u00a0]?${unit})?`,"gu");
/** Protect numeric values, their sign and units, and complete IPv4 addresses.
 * Identifier digits and URL contents remain ordinary text. Table cells and
 * source code use their established renderers instead of this paragraph path. */
export function contentTextParts(text:string):ContentTextPart[]{
  const parts:ContentTextPart[]=[],push=(value:string,atomic:boolean)=>{if(!value)return;const previous=parts.at(-1);if(previous&&previous.atomic===atomic&&!atomic)previous.text+=value;else parts.push({text:value,atomic});};let end=0;
  for(const match of text.matchAll(pattern)){const value=match[0],before=text[match.index-1]??"",after=text[match.index+value.length]??"",url=/^(https?:\/\/|www\.)/.test(value),ip=/^(?:\d{1,3}\.){3}\d{1,3}/.test(value);
    const identifierToken=/^[A-Za-z]/.test(value)&&!url,apiToken=apiNames.has(value),cobolToken=cobolNames.has(value);
    let atomic=!url&&value.length>1&&(!identifierToken||cryptoNames.has(value)||apiToken||cobolToken);
    if(/[A-Za-z0-9_.]/.test(before)&&!/[+＋\-−－]/.test(value[0])||/[A-Za-z0-9_]/.test(after))atomic=false;
    // Do not protect a reviewed name occurring inside a longer ASCII identifier.
    if((apiToken||cobolToken)&&(/[A-Za-z0-9_.$-]/.test(before)||/[A-Za-z0-9_.$-]/.test(after)))atomic=false;
    if(ip){const address=value.split(/[/:]/)[0];if(address.split(".").some(o=>Number(o)>255)||value.includes("/")&&Number(value.split("/")[1].split(":")[0])>32||value.includes(":")&&Number(value.split(":")[1])>65535)atomic=false;}
    push(text.slice(end,match.index),false);push(value,atomic);end=match.index+value.length;
  }push(text.slice(end),false);return parts;
}
export function ContentParagraph({text}:{text:string}){
  const parts=useMemo(()=>contentTextParts(text),[text]),hasAtomic=parts.some(p=>p.atomic),ref=useRef<HTMLParagraphElement>(null),[scrollable,setScrollable]=useState(false);
  useLayoutEffect(()=>{const element=ref.current;if(!element||!hasAtomic){setScrollable(false);return;}const update=()=>setScrollable(element.scrollWidth>element.clientWidth+1),observer=new ResizeObserver(update);observer.observe(element);element.querySelectorAll(".content-text-token").forEach(token=>observer.observe(token));update();return()=>observer.disconnect();},[text,hasAtomic]);
  // A focusable group needs its own name to retain this text in an enclosing radio label.
  return <p ref={ref} className={hasAtomic?"content-text-scroll":undefined} tabIndex={scrollable?0:undefined} role={scrollable?"group":undefined} aria-label={scrollable?text:undefined} aria-description={scrollable?"左右にスクロールできます。":undefined}>{parts.map((part,i)=>part.atomic?<span key={i} className="content-text-token">{part.text}</span>:part.text)}</p>;
}
