import assert from 'node:assert/strict';
import {readBookletFigure,type BookletFigureDefinition} from '../src/core/booklet-figure-extension-contract';

/** Complete, bounded values-to-drawing reference; unexpected errors fail. */
export function bookletFigureReferenceRows(figures:readonly BookletFigureDefinition[]){
 const seen=new Set<string>();
 return figures.map(figure=>{
  assert(!seen.has(figure.profile),'duplicate source-owned figure reference');seen.add(figure.profile);
  let capacity=1;assert(figure.domain.length>0);
  for(const [lo,hi]of figure.domain){assert(Number.isSafeInteger(lo)&&Number.isSafeInteger(hi)&&lo<=hi);capacity*=hi-lo+1;assert(Number.isSafeInteger(capacity)&&capacity<=4096,'finite figure reference exceeds reviewed4096-tuple limit');}
  const candidates=figure.domain.reduce<number[][]>((rows,[lo,hi])=>rows.flatMap(values=>Array.from({length:hi-lo+1},(_,i)=>[...values,lo+i])),[[]]);
  const tuples=candidates.flatMap(values=>{
   try{figure.validate([...values]);}catch(error){if((error as {code?:string}).code==='FIGURE_PROFILE')return[];throw error;}
   // A permitted state with a broken/empty description is an error, not an
   // invalid tuple that may be silently omitted from a complete reference.
   return[{values,alt:readBookletFigure(figure,values)}];
  });
  assert(tuples.length>0,'no valid source-owned figure reference tuple');return{profile:figure.profile,domain:figure.domain,tuples};
 });
}
