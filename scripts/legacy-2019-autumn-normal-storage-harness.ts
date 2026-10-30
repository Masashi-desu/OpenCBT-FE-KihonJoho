import { loadCatalog, loadAsset } from "../src/core/catalog";
import { refOf } from "../src/core/types";
import { contentHash, sha256 } from "../src/core/hash";
import { prepareRun, startRun, finishRun, validateRun, resultFor } from "../src/core/session";
import * as storage from "../src/core/storage";
import { makeBookmark } from "../src/core/bookmarks";
import { contract, originalId, selection, major, answerOriginal, answerGeneratedWorkflow } from "../tests/helpers/legacy-2019-autumn-app";

const check=(ok:unknown,message:string)=>{if(!ok)throw Error(message);};
const same=(actual:unknown,expected:unknown,message:string)=>check(JSON.stringify(actual)===JSON.stringify(expected),message);

/** Invoke only in a new headless browser context on its own loopback server.
 * Uses real IndexedDB through normal storage APIs. It does not drive the UI or
 * prove release/live acceptance. It never clears a database or existing rows. */
export async function verifyAutumnNativeStorage(options:{isolatedContext:true}) {
  check(options?.isolatedContext===true,"Dedicated ephemeral context required");
  check(location.hostname==="127.0.0.1"||location.hostname==="localhost","Dedicated loopback origin required");
  check((await storage.history()).length===0,"Existing sessions: refuse to touch this context");
  check((await storage.listBookmarks()).length===0,"Existing bookmarks: refuse to touch this context");
  const bundle=await loadCatalog(),at=Date.now(),owned:string[]=[],bookmarkIds:string[]=[];
  const originals=Array.from({length:13},(_,i)=>bundle.questions.find(q=>q.id===originalId(i+1))!);
  check(originals.every(Boolean),"All13 actual distributed originals required");
  const ids=[...new Set(originals.flatMap(q=>q.assetRefs))];check(ids.length===76,"Expected76 reviewed original/common assets");
  const assets=Object.fromEntries(await Promise.all(ids.map(async id=>{
    const asset=bundle.assets.find(a=>a.id===id)!;return [id,await loadAsset(asset)] as const;
  })));
  const rows:unknown[]=[],nativeRows:unknown[]=[];
  try {
    for(const kind of["annual","mix"]as const)for(const mode of["study","practice"]as const) {
      const chosen=mode==="practice"?[1,2,3,4,5,8,12]:undefined;
      let run=await prepareRun(bundle,selection(bundle,kind,mode,chosen),assets,at,async(id,b,a)=>{
        owned.push(id);await storage.storeOriginalSnapshot(id,b,a);
      });
      run=startRun(run,at);await storage.saveRun(run);
      const running=await storage.loadRun(run.session.id);await validateRun(running);
      same(running.session,run.session,"Running session roundtrip");same(running.issued,run.issued,"Running issued roundtrip");
      same([...running.instances].sort((a,b)=>a.entryIndex-b.entryIndex),run.instances,"Running instance roundtrip");
      check(running.session.status==="running","Expected running native session");
      for(let i=0;i<run.issued.length;i++)run=kind==="annual"?answerOriginal(run,i,at+1000):answerGeneratedWorkflow(run,i,at+1000);
      run=finishRun(run,"completed",at+2000);await storage.saveRun(run);
      const restored=await storage.loadRun(run.session.id);await validateRun(restored);
      same(restored.session,run.session,"Completed session/answers roundtrip");same(restored.result,run.result,"Completed result roundtrip");same(restored.issued,run.issued,"Completed issued roundtrip");
      same([...restored.instances].sort((a,b)=>a.entryIndex-b.entryIndex),run.instances,"Completed instances roundtrip");
      check(await contentHash(restored.bundle)===await contentHash(bundle),"Full unbound bundle changed in storage");
      check(restored.result?.partSummary?.unscored===(kind==="annual"?1:0),"Q12f scored denominator changed in storage");
      check(restored.result?.partSummary?.unanswered===0,"Scored answers lost in storage");
      for(const id of ids)check(await sha256(await restored.assets[id].arrayBuffer())===bundle.assets.find(a=>a.id===id)!.sha256,`Saved asset hash ${id}`);
      const saved=(await storage.history()).find(s=>s.id===run.session.id);check(saved,"Native session missing from history");
      const instances=(await storage.recentGeneration()).filter(i=>i.sessionId===run.session.id).sort((a,b)=>a.entryIndex-b.entryIndex);
      same(instances,run.instances,"IndexedDB generatedInstances rows differ");
      check(instances.length===(kind==="annual"?0:run.issued.length),"Native instance count");
      nativeRows.push({kind,mode,saved,instances});
      rows.push({kind,mode,sessionId:run.session.id,majorNumbers:run.issued.map(major),questionCount:run.issued.length,
        timeLimitSeconds:run.exam.timeLimitSeconds??null,instances:instances.length,assetCount:ids.length,
        catalogSHA256:restored.bundle.catalogHash,bundleContentSHA256:await contentHash(restored.bundle),
        issuedContentSHA256:await contentHash(restored.issued),result:resultFor(restored,at+2000),
        sourceCollectionId:restored.selection.sourceCollectionId??null,mixProfileCollectionId:restored.selection.mixProfileCollectionId??null,
        checks:{runningAndCompletedReload:true,answerAndResultIdentity:true,fullUnboundBundle:true,nativeInstanceIdentity:true,all76AssetHashes:true}});
    }
    for(const original of originals) {const bookmark=makeBookmark(bundle,refOf(original),at);await storage.saveBookmark(bookmark);bookmarkIds.push(bookmark.id);}
    const bookmarks=await storage.listBookmarks();check(bookmarks.length===13,"Native13 bookmarks");
    for(const original of originals)check(bookmarks.some(b=>b.questionRef.questionId===original.id&&b.questionRef.revision===original.revision),"Native bookmark source ref");
    const sessionIds=(await storage.history()).map(s=>s.id);check(sessionIds.length===4,"Native history rows");
    return {schema:"stage2-normal-native-storage-observation/v1",status:"pass",collectionId:contract.collectionId,
      catalogSHA256:bundle.catalogHash,observedAt:new Date().toISOString(),rows,nativeRows,bookmarks,
      isolation:{freshContext:true,loopbackOrigin:location.origin,preexistingSessions:0,preexistingBookmarks:0,normalUserBrowserTouched:false},
      scope:"Normal storage APIs in real IndexedDB; menu, displayed UI, release CI and live site acceptance are separate"};
  } finally {
    await storage.deleteRuns(owned);
    for(const id of bookmarkIds)await storage.deleteBookmark(id);
    check((await storage.history()).length===0,"Owned session cleanup");check((await storage.listBookmarks()).length===0,"Owned bookmark cleanup");
  }
}
