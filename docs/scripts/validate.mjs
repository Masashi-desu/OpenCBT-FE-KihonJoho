// ドキュメント用サンプルの構造・参照・配布境界だけを検証する。
// CBTの出題、採点、セッション保存を実行しない。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = path.join(root, 'public/data');
const schemaDir = path.join(root, 'public/schemas');
const sha = raw => crypto.createHash('sha256').update(raw).digest('hex');
// 内容を比較するための正規化。生成器や図描画器は実装しない。
const sortedJson = value => Array.isArray(value) ? value.map(sortedJson) : value && typeof value==='object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,sortedJson(value[key])])) : value;
const contentHash = value => sha(Buffer.from(JSON.stringify(sortedJson(value)), 'utf8'));
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, multipleOfPrecision: 8 });
addFormats(ajv);
const schemas = fs.readdirSync(schemaDir).filter(f => f.endsWith('.schema.json')).map(f => read(path.join(schemaDir, f)));
schemas.forEach(s => ajv.addSchema(s));
const validateByKind = Object.fromEntries(['source','rights','asset','question','set','exam','session','result','catalog','template','instance','diagram','formula'].map(k => [k, ajv.getSchema(`https://opencbt-fe-kihonjoho.example/schemas/3.0.0/${k}.schema.json`)]));
const mathSchema = schemas.find(s => s.title === '数式ブロック');
const mathCommands = new Set(mathSchema.$defs.allowedLatexCommand.enum);
const mathEnvironments = new Set(mathSchema.$defs.allowedLatexEnvironment.enum);
// JSONの小数0.1刻みをJSの二進浮動小数点誤差で拒否しない。
const percentage = ajv.compile(schemas.find(s=>s.title==='学習結果').properties.learningAccuracyPercent);
if(!percentage(33.3)||percentage(33.33))throw Error('学習割合の小数精度の検証に失敗');
const kindOf = { sources:'source', rights:'rights', assets:'asset', questions:'question', sets:'set', exams:'exam', templates:'template' };
const rawCatalog = fs.readFileSync(path.join(base, 'catalog.json'));
const catalog = JSON.parse(rawCatalog);
if (!validateByKind.catalog(catalog)) throw Error(`catalog schema: ${ajv.errorsText(validateByKind.catalog.errors)}`);
const records = [{ kind:'catalog', path:'catalog.json', data:catalog, rawHash:sha(rawCatalog) }];
for (const [collection, files] of Object.entries(catalog.files)) {
  for (const file of files) {
    if (!file.path.startsWith(`${collection}/`)) throw Error('カタログの種類とパスが不一致');
    const raw = fs.readFileSync(path.join(base, file.path));
    records.push({ kind:kindOf[collection], path:file.path, rawHash:sha(raw), data:JSON.parse(raw) });
  }
}
for (const [directory,kind] of [['sessions','session'],['results','result'],['instances','instance'],['diagrams','diagram'],['formulas','formula']]) {
  for (const file of fs.readdirSync(path.join(base,directory)).filter(f => f.endsWith('.json'))) {
    const raw = fs.readFileSync(path.join(base,directory,file));
    records.push({ kind, path:`${directory}/${file}`, rawHash:sha(raw), data:JSON.parse(raw) });
  }
}

function validateBundle(input) {
  const errors = [];
  const err = (code,where,detail) => errors.push({ code, where, detail });
  const valid = [];
  for (const r of input) {
    if (!validateByKind[r.kind](r.data)) err('SCHEMA',r.path,ajv.errorsText(validateByKind[r.kind].errors));
    else valid.push(r);
  }
  const cat = valid.find(r => r.kind === 'catalog')?.data;
  if (!cat) return errors;
  const byKind = {};
  const recordPaths = new Map();
  for (const r of valid) {
    recordPaths.set(r.path,r);
    const m = byKind[r.kind] ||= new Map();
    const key = ['question','set','exam','template'].includes(r.kind) ? `${r.data.id}@${r.data.revision}` : r.kind==='formula' ? r.path : r.data.id;
    if (m.has(key)) err('DUPLICATE_ID',r.path,key);
    else m.set(key,r.data);
  }
  const actors = new Map();
  for (const actor of cat.actors) {
    if (actors.has(actor.id)) err('DUPLICATE_ID','catalog.actors',actor.id);
    actors.set(actor.id,actor);
  }
  const get = (kind,id,where,code='REFERENCE') => {
    const found = byKind[kind]?.get(id);
    if (!found) err(code,where,`${kind}:${id}`);
    return found;
  };
  const sourceRefs = (refs,where,official=false) => {
    for (const r of refs) {
      const source = get('source',r.sourceId,where,'SOURCE_REF');
      if (official && source && source.availability !== 'officially_published') err('OFFICIAL_PUBLICATION',where,r.sourceId);
    }
  };
  const actorRefs = (ids,where) => ids.forEach(id => { if (!actors.has(id)) err('ACTOR_REF',where,id); });
  const rightsRefs = (ids,where,adapted=false,trail=new Set()) => {
    for (const id of ids) {
      if (trail.has(id)) { err('RIGHTS_CYCLE',where,id); continue; }
      const right = get('rights',id,where,'RIGHTS_REF');
      if (!right) continue;
      if (right.uses.repositoryRedistribution !== 'allowed' || right.uses.browserDisplay !== 'allowed' || (adapted && right.uses.adaptation !== 'allowed')) err('RIGHTS_USE',where,id);
      if (right.thirdParty.status === 'unresolved') err('THIRD_PARTY',where,id);
      rightsRefs(right.thirdParty.rightsRefs,where,adapted,new Set([...trail,id]));
    }
  };
  const attribution = (a,where) => {
    sourceRefs(a.sourceRefs,where,a.origin !== 'original');
    rightsRefs(a.rightsRefs,where,a.origin === 'adapted');
    actorRefs(a.creatorIds,where);
    if (a.origin !== 'original' && !a.sourceRefs.length) err('SOURCE_REQUIRED',where,a.origin);
  };
  // 文書サンプルの静的な入力制限だけを検査する。KaTeX組版・数値評価は実装しない。
  const formula = (b,where) => {
    if(b.format !== 'latex') return;
    if(/[$%#@"'`]/.test(b.text)) err('MATH_SYNTAX',where,'区切り・コメント等の禁止文字');
    let depth=0, environment;
    for(let i=0;i<b.text.length;i++) {
      const char=b.text[i];
      if(char==='\\') {
        const commandStart=i;
        const match=/^[A-Za-z]+/.exec(b.text.slice(i+1));
        const command=match ? match[0] : b.text[i+1];
        if(!mathCommands.has(command))err('MATH_COMMAND',where,`未許可命令: ${command || '末尾バックスラッシュ'}`);
        i+=command?.length || 0;
        if(command==='begin'||command==='end') {
          const env=/^\{([A-Za-z]+)\}/.exec(b.text.slice(i+1));
          if(!env||!mathEnvironments.has(env[1])){err('MATH_STRUCTURE',where,'未許可環境');continue;}
          i+=env[0].length;
          if(command==='begin') {
            if(environment)err('MATH_STRUCTURE',where,'環境の入れ子');
            else environment={name:env[1],start:i+1,depth};
          } else if(!environment||environment.name!==env[1]||environment.depth!==depth) {
            err('MATH_STRUCTURE',where,'環境の対応が不一致');
          } else {
            const body=b.text.slice(environment.start,commandStart);
            const rows=body.split('\\\\');
            if(rows.length>8||rows.some(row=>row.split('&').length>8))err('MATH_STRUCTURE',where,'8行・8セルの上限');
            environment=undefined;
          }
        } else if(command==='\\'&&!environment)err('MATH_STRUCTURE',where,'環境外の改行命令');
      } else if(char==='{') {
        depth++;if(depth>16)err('MATH_STRUCTURE',where,'波括弧の深さ上限');
      } else if(char==='}') {
        depth--;if(depth<0)err('MATH_STRUCTURE',where,'対応する開き括弧がない');
      } else if(char==='&'&&!environment)err('MATH_STRUCTURE',where,'環境外のセル区切り');
    }
    if(depth!==0||environment)err('MATH_STRUCTURE',where,'括弧又は環境が閉じられていない');
  };
  const figureDomains=JSON.parse(fs.readFileSync(new URL('../../src/core/source-figure-domains.json',import.meta.url),'utf8'));
  const diagram = (b,where) => {
    attribution(b.attribution,where);
    if(!['renderer-diagram-basic','renderer-activity-network','renderer-source-figures'].includes(b.rendererRef.id)||b.rendererRef.version!=='1.0.0')err('RENDERER_REF',where,'未登録の描画モジュール');
    const scene=b.scene;
    if(scene.kind==='source_figure') {
      const domain=figureDomains[scene.profile];
      if(b.rendererRef.id!=='renderer-source-figures'||!domain||scene.values.length!==domain.length||scene.values.some((v,i)=>!Number.isInteger(v)||v<domain[i][0]||v>domain[i][1]))err('FIGURE_PROFILE',where,'登録図の入力契約と不一致');
      return;
    }
    if(b.rendererRef.id==='renderer-source-figures')err('FIGURE_PROFILE',where,'専用図以外の構造');
    if(b.rendererRef.id==='renderer-activity-network') {
      if(scene.kind!=='graph'||scene.nodes.length!==7||scene.edges.length!==10)err('ACTIVITY_NETWORK',where,'登録されたアローダイアグラムと不一致');
      const pairs=[[0,1],[1,2],[1,3],[1,4],[2,5],[3,5],[4,5],[5,6]];
      for(let i=0;i<7;i++)if(!scene.nodes.some(n=>n.id===`node-${i}`&&n.role==='vertex'))err('ACTIVITY_NETWORK',where,'節点が不足');
      for(let i=0;i<8;i++) {
        const e=scene.edges.find(e=>e.id===`edge-${i}`), label=/^([A-H]) ([1-9][0-9]?)日$/.exec(e?.label??'');
        if(!e||!e.directed||e.from!==`node-${pairs[i][0]}`||e.to!==`node-${pairs[i][1]}`||!label||label[1]!=='ABCDEFGH'[i]||Number(label[2])>60)err('ACTIVITY_NETWORK',where,'作業が不一致');
      }
      for(let i=0;i<2;i++) {
        const e=scene.edges.find(e=>e.id===`edge-dummy-${i+1}`);
        if(!e||!e.directed||e.from!==`node-${i+2}`||e.to!==`node-${i+3}`||e.label!=='ダミー 0日')err('ACTIVITY_NETWORK',where,'ダミー接続が不一致');
      }
    }
    if(scene.kind==='array') {
      unique(scene.cells.map(c=>c.id),where,'DIAGRAM_ID');
      if(scene.cells.some((c,i)=>c.index!==i+1))err('DIAGRAM_INDEX',where,'添字と順序が不一致');
    } else {
      unique(scene.nodes.map(n=>n.id),where,'DIAGRAM_ID');unique(scene.edges.map(e=>e.id),where,'DIAGRAM_ID');
      const nodes=new Set(scene.nodes.map(n=>n.id));
      for(const e of scene.edges)if(!nodes.has(e.from)||!nodes.has(e.to)||e.from===e.to)err('GRAPH_REF',where,'辺の端点が存在しない又は自己接続');
      if(scene.kind==='flowchart') {
        if(scene.nodes.filter(n=>n.role==='start').length!==1||scene.nodes.filter(n=>n.role==='end').length!==1||scene.edges.some(e=>!e.directed))err('FLOW_SHAPE',where,'開始・終了・有向辺の条件が不足');
        for(const node of scene.nodes){
          const outgoing=scene.edges.filter(e=>e.from===node.id), incoming=scene.edges.filter(e=>e.to===node.id);
          if(node.role==='start'&&(incoming.length||outgoing.length!==1)||node.role==='end'&&outgoing.length||node.role==='process'&&outgoing.length!==1||node.role==='decision'&&(outgoing.length!==2||outgoing.some(e=>!e.label)||new Set(outgoing.map(e=>e.label)).size!==2))err('FLOW_SHAPE',where,node.id);
        }
      }
    }
  };
  const content = (c,where,assetsUsed) => {
    attribution(c.attribution,where);
    for (const b of c.blocks) {
      if (b.type === 'table' && b.rows.some(row => row.length !== b.columns.length)) err('TABLE_SHAPE',where,b.caption);
      if (b.type === 'image') { get('asset',b.assetId,where,'ASSET_REF'); assetsUsed.add(b.assetId); }
      if (b.type === 'diagram') diagram(b,where);
      if (b.type === 'formula') formula(b,where);
    }
  };
  const unique = (values,where,code='DUPLICATE_ID') => { if (new Set(values).size !== values.length) err(code,where,'重複'); };
  valid.filter(r=>r.kind==='formula').forEach(r=>formula(r.data,r.path));
  const qkey = r => `${r.questionId}@${r.revision}`;
  const ekey = r => `${r.id}@${r.revision}`;
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  // 生成済みJSONも問題Schema・共通の出典検証に通す。問題生成は行わない。
  for(const instance of byKind.instance?.values()||[]) {
    const key=qkey({questionId:instance.question.id,revision:instance.question.revision});
    if(byKind.question?.has(key))err('DUPLICATE_ID',instance.id,key);
    else (byKind.question ||= new Map()).set(key,instance.question);
  }
  for(const b of byKind.diagram?.values()||[])diagram(b,b.id);
  unique(cat.withdrawals.map(w=>qkey(w.questionRef)),'catalog.withdrawals');
  for(const withdrawal of cat.withdrawals) {
    if(withdrawal.replacement)get('question',qkey(withdrawal.replacement),'catalog.withdrawals','WITHDRAWAL_REF');
  }
  for (const [collection,files] of Object.entries(cat.files)) for (const file of files) {
    const r=recordPaths.get(file.path);
    if (!r) err('CATALOG_FILE',file.path,'ファイル参照切れ');
    else if (r.rawHash !== file.sha256) err('FILE_HASH',file.path,'カタログとファイルのハッシュが不一致');
    if (!file.path.startsWith(`${collection}/`)) err('CATALOG_FILE',file.path,'種類不一致');
  }
  for (const s of byKind.source?.values() || []) {
    const u = new URL(s.url);
    if (u.username || u.password || !u.hostname) err('UNSAFE_URL',s.id,s.url);
  }
  for (const r of byKind.rights?.values() || []) {
    sourceRefs(r.evidence,r.id);
    for (const id of r.thirdParty.rightsRefs) get('rights',id,r.id,'RIGHTS_REF');
  }
  for (const a of byKind.asset?.values() || []) {
    attribution(a.attribution,a.id);
    const file = path.join(base,a.path);
    if (!fs.existsSync(file)) { err('ASSET_FILE',a.id,a.path); continue; }
    const raw=fs.readFileSync(file);
    if (sha(raw)!==a.sha256 || raw.length!==a.byteLength) err('ASSET_HASH',a.id,'画像のサイズ又はハッシュ不一致');
    const ext=path.extname(a.path);
    const signature = ext==='.png' ? raw.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : ext==='.jpg' ? raw[0]===255 && raw[1]===216 && raw[2]===255 : raw.toString('ascii',0,4)==='RIFF' && raw.toString('ascii',8,12)==='WEBP';
    if (!signature || !{'.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[ext] || a.mediaType!=={'.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[ext]) err('ASSET_TYPE',a.id,'MIME又はファイル署名の不一致');
    if(ext==='.png' && (raw.readUInt32BE(16)!==a.width || raw.readUInt32BE(20)!==a.height)) err('ASSET_DIMENSIONS',a.id,'寸法不一致');
  }
  // 派生系列の循環検出と祖先集合。問題の採点・生成処理は行わない。
  const lineage=(key,trail=new Set()) => {
    if (trail.has(key)) {err('DERIVATION_CYCLE',key,'派生参照の循環');return new Set([key]);}
    const q = byKind.question?.get(key);
    const result=new Set([key.split('@')[0]]);
    if(q) for(const parent of q.origin.derivedFrom) {
      const pk=qkey(parent);
      get('question',pk,key,'DERIVATION_REF');
      for(const id of lineage(pk,new Set([...trail,key]))) result.add(id);
    }
    return result;
  };
  for (const q of byKind.question?.values() || []) {
    const where=`${q.id}@${q.revision}`;
    const used=new Set();
    sourceRefs(q.origin.sourceRefs,where,q.origin.kind!=='original');
    if(q.origin.kind!=='original'&&!q.origin.sourceRefs.some(r=>['official_problem','official_sample'].includes(byKind.source?.get(r.sourceId)?.type)))err('OFFICIAL_SOURCE_KIND',where,'公式問題資料を特定できない');
    actorRefs(q.contributors.map(x=>x.actorId),where);actorRefs(q.review.reviewerIds,where);
    q.origin.changes.forEach(c=>actorRefs([c.actorId],where));
    unique(q.choices.map(c=>c.id),where);
    if (!q.choices.some(c=>c.id===q.correctAnswer.choiceId)) err('ANSWER_CHOICE',where,q.correctAnswer.choiceId);
    unique(q.contexts.map(c=>c.id),where);
    q.contextRefs.forEach(id=>{if(!q.contexts.some(c=>c.id===id))err('CONTEXT_REF',where,id);});
    if(q.contexts.length!==q.contextRefs.length)err('CONTEXT_REF',where,'未使用の共通本文');
    [...q.contexts.map(c=>c.content),q.prompt,...q.choices.map(c=>c.content),q.explanation].forEach(c=>content(c,where,used));
    attribution(q.correctAnswer.attribution,where);
    q.assetRefs.forEach(id=>get('asset',id,where,'ASSET_REF'));
    if(!same([...used].sort(),[...q.assetRefs].sort()))err('ASSET_LIST',where,'本文参照とassetRefsの不一致');
    if(q.subject==='B'&&!['algorithm','security'].includes(q.learning.area) || q.subject==='A'&&q.learning.area==='algorithm')err('LEARNING_AREA',where,q.learning.area);
    // 改変有無は作成者の宣言。内容・履歴・分類・hashから推定しない。
    if(q.origin.modificationBasis==='official_source'&&!q.origin.sourceRefs.length)err('MODIFICATION_REF',where,'比較対象の原資料参照がない');
    if(q.origin.modificationBasis==='base_question'&&!q.origin.derivedFrom.length)err('MODIFICATION_REF',where,'比較対象の基準問題参照がない');
    const blocks=[...q.contexts.flatMap(c=>c.content.blocks),...q.prompt.blocks,...q.choices.flatMap(c=>c.content.blocks),...q.explanation.blocks];
    unique(blocks.filter(b=>b.type==='diagram').map(b=>b.id),where,'DIAGRAM_ID');
    if(q.origin.kind==='original'&&[q.prompt,...q.choices.map(c=>c.content),q.correctAnswer].some(c=>c.attribution.origin!=='original'))err('ORIGIN_KIND',where,'公式依存部品を独自問題へ分類');
    if(q.origin.kind!=='original'&&[q.prompt,...q.choices.map(c=>c.content)].some(c=>c.attribution.origin==='original'))err('ORIGIN_KIND',where,'公式依存本文の出典を除去');
    if(q.distribution==='included') {
      if(q.lifecycle!=='active'||Object.values(q.review.checks).includes('fail'))err('RELEASE_GATE',where,'有効性又は工程条件が不足');
      if(q.origin.kind!=='original'&&q.review.checks.publication!=='pass')err('RELEASE_GATE',where,'公式公開未確認');
      if(['terms','thirdParty','answer','explanation'].some(k=>q.review.checks[k]!=='pass'))err('RELEASE_GATE',where,'必須工程未確認');
      if(q.origin.kind!=='original'&&q.review.checks.transcription!=='pass')err('RELEASE_GATE',where,'照合未完了');
    }
    if(cat.scope==='docs_fixture'&&q.distribution==='included')err('RELEASE_GATE',where,'文書用カタログの問題を配布対象へ昇格しない');
    if(cat.scope==='distribution'&&q.distribution!=='included')err('RELEASE_GATE',where,'配布カタログへ文書用／除外データが混入');
    lineage(where);
  }
  const generatorKnown = r => r.id==='generator-array-sum'&&r.version==='1.0.0';
  const parameterDomain = (p,t,where) => {
    const d=t.parameterDomain.values;
    if(p.values.length!==d.length||p.values.some(v=>v<d.minimum||v>d.maximum))err('PARAMETER_DOMAIN',where,'テンプレートの入力域を外れる');
  };
  for(const t of byKind.template?.values()||[]) {
    const b=get('question',qkey(t.baseQuestionRef),t.id,'TEMPLATE_BASE');
    attribution(t.attribution,t.id);actorRefs(t.editorIds,t.id);
    if(!generatorKnown(t.generatorRef))err('GENERATOR_REF',t.id,'未登録の生成モジュール');
    const d=t.parameterDomain.values;
    if(d.length!==3||d.minimum<1||d.maximum>9||d.minimum>d.maximum)err('PARAMETER_DOMAIN',t.id,'初期array-sum契約の域ではない');
    parameterDomain(t.referenceParameters,t,t.id);
    if(b) {
      if(t.originalContentSha256!==contentHash(b))err('TEMPLATE_ORIGINAL_HASH',t.id,'バインド前の元データが固定した内容と一致しない');
      if(t.bindingBasis==='official_source'&&!b.origin.sourceRefs.length)err('MODIFICATION_REF',t.id,'バインド後の原資料参照がない');
      if(b.origin.kind==='official_reprint'||b.subject!=='B'||b.learning.area!=='algorithm')err('TEMPLATE_BASE',t.id,'基準問題の出自・科目・契約が不一致');
      if(t.attribution.origin!==(b.origin.kind==='original'?'original':'adapted')||!same(t.attribution.sourceRefs,b.origin.sourceRefs))err('GENERATION_LINEAGE',t.id,'基準問題の出典・出自を継承していない');
      const array=b.prompt.blocks.find(x=>x.type==='diagram'&&x.scene.kind==='array');
      if(!array||!same(array.scene.cells.map(c=>c.value),t.referenceParameters.values))err('TEMPLATE_BASE',t.id,'基準値と基準問題の図が一致しない');
      if(t.distribution==='included'&&(t.lifecycle!=='active'||b.distribution!=='included'))err('RELEASE_GATE',t.id,'生成元が配布不可');
    }
    if(cat.scope==='docs_fixture'&&t.distribution==='included'||cat.scope==='distribution'&&t.distribution!=='included')err('RELEASE_GATE',t.id,'テンプレートの配布境界');
  }
  for(const i of byKind.instance?.values()||[]) {
    const t=get('template',ekey(i.templateRef),i.id,'TEMPLATE_REF');
    const b=get('question',qkey(i.baseQuestionRef),i.id,'TEMPLATE_BASE');
    if(i.contentSha256!==contentHash(i.question))err('INSTANCE_HASH',i.id,'生成済み内容のハッシュ不一致');
    if(i.parameterSelection==='explicit'&&cat.scope!=='docs_fixture')err('RELEASE_GATE',i.id,'手入力例を本体の生成結果へ混入');
    if(!generatorKnown(i.generatorRef))err('GENERATOR_REF',i.id,'未登録の生成モジュール');
    if(t) {
      parameterDomain(i.parameters,t,i.id);
      if(!same(i.generatorRef,t.generatorRef)||!same(i.baseQuestionRef,t.baseQuestionRef))err('GENERATION_LINEAGE',i.id,'テンプレートの版・派生元が不一致');
      if(i.question.origin.isModified!==true||i.question.origin.modificationBasis!==t.bindingBasis)err('BINDING_MODIFICATION',i.id,'バインド実施の改変表示又は比較対象が不一致');
      if(t.lifecycle!=='active')err('GENERATION_LINEAGE',i.id,'撤回されたテンプレート');
    }
    if(b) {
      if(!i.question.origin.derivedFrom.some(r=>same(r,i.baseQuestionRef))||!same(i.question.origin.sourceRefs,b.origin.sourceRefs)||i.question.subject!==b.subject||i.question.learning.area!==b.learning.area||i.question.origin.kind!==b.origin.kind||i.question.distribution!==b.distribution)err('GENERATION_LINEAGE',i.id,'元問題の対応・出典・分類を継承していない');
      const rightsOf=q=>[q.prompt,...q.contexts.map(c=>c.content),...q.choices.map(c=>c.content),q.explanation,q.correctAnswer].flatMap(c=>c.attribution.rightsRefs);
      if(rightsOf(b).some(id=>!rightsOf(i.question).includes(id)))err('GENERATION_LINEAGE',i.id,'元問題の権利条件を除去');
      if(b.origin.changes.some(change=>!i.question.origin.changes.some(c=>same(c,change))))err('GENERATION_LINEAGE',i.id,'元問題の改変履歴を除去');
      const unchangedAttribution=(before,after)=>same(before?.attribution,after?.attribution);
      if(!unchangedAttribution(b.prompt,i.question.prompt)||!unchangedAttribution(b.explanation,i.question.explanation)||!unchangedAttribution(b.correctAnswer,i.question.correctAnswer)||b.choices.some(c=>!unchangedAttribution(c.content,i.question.choices.find(v=>v.id===c.id)?.content))||b.contexts.some(c=>!unchangedAttribution(c.content,i.question.contexts.find(v=>v.id===c.id)?.content)))err('GENERATION_LINEAGE',i.id,'部品単位の出典・条件を除去又は移動');
      const beforeDiagrams=b.prompt.blocks.filter(x=>x.type==='diagram');
      if(beforeDiagrams.some(d=>!unchangedAttribution(d,i.question.prompt.blocks.find(x=>x.type==='diagram'&&x.id===d.id))))err('GENERATION_LINEAGE',i.id,'図素材の条件を継承していない');
    }
    if(i.question.id!==`question-${i.id}`||i.question.revision!==1)err('GENERATION_LINEAGE',i.id,'生成済み問題IDとinstance IDが不一致');
    const a=i.question.prompt.blocks.find(x=>x.type==='diagram'&&x.scene.kind==='array');
    const table=i.question.prompt.blocks.find(x=>x.type==='table');
    if(!a||!same(a.scene.cells.map(c=>c.value),i.parameters.values)||!table||!same(table.rows.map(row=>row[1]),i.parameters.values.map(String)))err('INSTANCE_CONTENT',i.id,'入力・表・図が不一致');
    const s=get('session',i.sessionId,i.id,'INSTANCE_BINDING');
    if(s&&(s.entries[i.entryIndex]?.generatedInstanceId!==i.id||!same(s.entries[i.entryIndex]?.questionRef,i.baseQuestionRef)||Date.parse(i.createdAt)<Date.parse(s.createdAt)||Date.parse(i.createdAt)>Date.parse(s.updatedAt)))err('INSTANCE_BINDING',i.id,'所有者・位置・生成時刻が不一致');
  }
  for (const set of byKind.set?.values() || []) {
    const where=`${set.id}@${set.revision}`;
    unique(set.questionRefs.map(qkey),where);
    unique(set.generationBindings.map(b=>qkey(b.questionRef)),where,'GENERATION_BINDING');
    for(const binding of set.generationBindings){
      const t=get('template',ekey(binding.templateRef),where,'TEMPLATE_REF');
      if(!set.questionRefs.some(r=>same(r,binding.questionRef))||t&&!same(t.baseQuestionRef,binding.questionRef))err('GENERATION_BINDING',where,'生成枠と基準問題が不一致');
      if(set.distribution==='included'&&t?.distribution!=='included')err('RELEASE_GATE',where,'配布セットに配布不可テンプレート');
    }
    for(const r of set.questionRefs){const q=get('question',qkey(r),where,'SET_REF');if(q&&set.subject!=='mixed'&&q.subject!==set.subject)err('SET_SUBJECT',where,q.id);if(set.distribution==='included'&&q?.distribution!=='included')err('RELEASE_GATE',where,'配布セットに配布不可問題');}
    if(set.subject==='mixed'&&new Set(set.questionRefs.map(r=>byKind.question?.get(qkey(r))?.subject).filter(Boolean)).size!==2)err('SET_SUBJECT',where,'mixedは科目A・Bを含む問題群');
    if(cat.scope==='distribution'&&set.distribution!=='included')err('RELEASE_GATE',where,'配布カタログへ除外セット');
    for(const r of set.examConfigRefs){
      const e=get('exam',ekey(r),where,'EXAM_REF');
      if(!e)continue;
      if(e.subject!==set.subject)err('SET_SUBJECT',where,e.id);
      const seen=new Set();const available=[];
      for(const ref of set.questionRefs){const q=byKind.question?.get(qkey(ref));if(!q||q.lifecycle!=='active')continue;if(['instance_unique','cycle_unique','random_reuse'].includes(e.duplicatePolicy)){available.push(q);continue;}const family=lineage(qkey(ref));if([...family].some(id=>seen.has(id)))continue;available.push(q);family.forEach(id=>seen.add(id));}
      if(['instance_unique','cycle_unique','random_reuse'].includes(e.duplicatePolicy)) {
        const generated=available.filter(q=>set.generationBindings.some(b=>same(b.questionRef,{questionId:q.id,revision:q.revision})));
        if(!generated.length||generated.length!==available.length)err('SET_CAPACITY',where,'全候補に登録済み生成枠が必要');
        if(e.quotas)for(const [area,count]of Object.entries(e.quotas))if(count>0&&!generated.some(q=>q.learning.area===area))err('SET_CAPACITY',where,area+'の生成枠がない');
      } else {
        if(e.questionCount!==undefined&&(available.length<e.questionCount || e.mode==='study'&&set.questionRefs.length!==e.questionCount) || e.mode==='study'&&available.length!==set.questionRefs.length)err('SET_CAPACITY',where,'設定に必要な独立系列の問題数がない');
        if(e.quotas)for(const [area,count]of Object.entries(e.quotas))if(available.filter(q=>q.learning.area===area).length<count)err('SET_CAPACITY',where,area+'の問題数が不足');
      }
    }
  }
  if(cat.generationCoverage==='complete') {
    const questions=[...(byKind.question?.values()||[])],templates=[...(byKind.template?.values()||[])],sets=[...(byKind.set?.values()||[])];
    for(const original of questions.filter(q=>q.origin.kind==='official_reprint')) {
      const bases=questions.filter(q=>q.origin.derivedFrom.some(r=>r.questionId===original.id&&r.revision===original.revision));
      const ts=templates.filter(t=>t.lifecycle==='active'&&t.distribution==='included'&&bases.some(q=>q.id===t.baseQuestionRef.questionId&&q.revision===t.baseQuestionRef.revision));
      const linked=ts.filter(t=>sets.some(s=>s.id===`set-mix-${original.subject.toLowerCase()}`&&s.generationBindings.some(g=>same(g.templateRef,{id:t.id,revision:t.revision})&&same(g.questionRef,t.baseQuestionRef))));
      if(ts.length!==1||linked.length!==1)err('GENERATION_COVERAGE',original.id,'公式問題とテンプレート・ミックス枠の一対一対応がない');
    }
  }
  for (const s of byKind.session?.values() || []) {
    const set=get('set',ekey(s.setRef),s.id,'SET_REF');
    const exam=get('exam',ekey(s.examConfigRef),s.id,'EXAM_REF');
    if(s.snapshot.catalogId!==cat.id||s.snapshot.catalogRevision!==cat.revision||s.snapshot.catalogSha256!==input.find(r=>r.kind==='catalog').rawHash)err('CATALOG_HASH',s.id,'開始時カタログが一致しない');
    if(set&&!set.examConfigRefs.some(r=>same(r,s.examConfigRef)))err('EXAM_REF',s.id,'セットにない設定');
    if(exam?.questionCount!==undefined&&s.entries.length!==exam.questionCount)err('SESSION_COUNT',s.id,'出題数不一致');
    if(s.bindingMode==='generated_values'&&!set?.generationBindings.length)err('BINDING_RECORD',s.id,'生成対象のないセットで値の生成を選択');
    if(s.currentIndex>=s.entries.length)err('SESSION_POSITION',s.id,'現在位置が範囲外');
    if(!['instance_unique','cycle_unique','random_reuse'].includes(exam?.duplicatePolicy))unique(s.entries.map(e=>e.questionRef.questionId),s.id,'SESSION_DUPLICATE');
    const seen=new Set();
    for(const entry of s.entries) {
      if(exam?.duplicatePolicy==='cycle_unique'&&set&&s.entries.indexOf(entry)%set.questionRefs.length===0)seen.clear();
      const baseQuestion=get('question',qkey(entry.questionRef),s.id,'SESSION_QUESTION');
      const binding=set?.generationBindings.find(b=>same(b.questionRef,entry.questionRef));
      const shouldBind=Boolean(binding)&&s.bindingMode==='generated_values';
      const instance=entry.generatedInstanceId ? get('instance',entry.generatedInstanceId,s.id,'INSTANCE_BINDING') : undefined;
      if(shouldBind!==Boolean(entry.generatedInstanceId)||instance&&(instance.sessionId!==s.id||instance.entryIndex!==s.entries.indexOf(entry)||!same(instance.templateRef,binding?.templateRef)))err('INSTANCE_BINDING',s.id,'出題方式・生成枠と保存instanceが不一致');
      if(entry.issuedContent.bindingPerformed!==shouldBind)err('BINDING_RECORD',s.id,'値の生成・バインドの実施記録が出題経路と一致しない');
      const q=instance?.question||baseQuestion;
      if(set&&!set.questionRefs.some(r=>same(r,entry.questionRef)))err('SESSION_QUESTION',s.id,'セット外の問題');
      if(!q)continue;
      if(entry.issuedContent.isModified!==q.origin.isModified||entry.issuedContent.originKind!==q.origin.kind||entry.issuedContent.contentSha256!==contentHash(q))err('ISSUED_CONTENT',s.id,'出題時の改変・出自・内容が不一致');
      if(cat.withdrawals.some(w=>same(w.questionRef,entry.questionRef))&&!['invalidated','abandoned'].includes(s.status))err('SESSION_WITHDRAWN',s.id,'撤回通知のある問題');
      if(q.lifecycle!=='active'&&!['invalidated','abandoned'].includes(s.status))err('SESSION_WITHDRAWN',s.id,q.id);
      const ids=q.choices.map(c=>c.id);
      if(!same([...entry.choiceOrder].sort(),[...ids].sort()))err('SESSION_CHOICE_ORDER',s.id,q.id);
      if(entry.selectedChoiceId&&!ids.includes(entry.selectedChoiceId))err('SESSION_ANSWER',s.id,entry.selectedChoiceId);
      if(exam?.choiceOrder==='fixed'&&!same(entry.choiceOrder,ids))err('SESSION_CHOICE_ORDER',s.id,'固定順の不一致');
      if(exam?.choiceOrder==='shuffle'&&!q.choiceShuffleAllowed)err('SESSION_CHOICE_ORDER',s.id,'シャッフル禁止問題');
      if(['instance_unique','cycle_unique','random_reuse'].includes(exam?.duplicatePolicy)) {
        if(!shouldBind||!instance)err('BINDING_RECORD',s.id,'生成ミックスに未生成枠');
        if(instance){const key=exam?.duplicatePolicy==='cycle_unique'?qkey(entry.questionRef):exam?.duplicatePolicy==='random_reuse'?instance.id:ekey(instance.templateRef)+':'+JSON.stringify(instance.parameters.values);if(seen.has(key))err('SESSION_DUPLICATE',s.id,'同テンプレートの同じ入力');seen.add(key);}
      } else {
        const family=lineage(qkey(entry.questionRef));
        if([...family].some(id=>seen.has(id)))err('SESSION_DUPLICATE',s.id,'派生系列の重複');
        family.forEach(id=>seen.add(id));
      }
      if(exam?.mode==='practice'&&entry.revealed)err('SESSION_REVEAL',s.id,'形式練習で解説を表示');
      if(s.status==='ready'&&(entry.selectedChoiceId||entry.reviewFlag||entry.revealed))err('SESSION_READY',s.id,'開始前の解答');
    }
    if(exam?.questionOrder==='set'&&exam.questionCount!==undefined&&set){const keys=set.questionRefs.map(qkey).filter(key=>s.entries.some(e=>qkey(e.questionRef)===key));if(!same(keys,s.entries.map(e=>qkey(e.questionRef))))err('SESSION_ORDER',s.id,'セット順の不一致');}
    if(exam?.mode==='study'&&s.deadlineAt || exam?.mode==='practice'&&s.status!=='ready'&&!s.deadlineAt || exam?.mode==='practice'&&s.status==='paused')err('SESSION_TIMING',s.id,'モードと時刻・一時停止の不一致');
    const time=x=>Date.parse(x);
    if(time(s.updatedAt)<time(s.createdAt)||s.startedAt&&time(s.startedAt)<time(s.createdAt)||s.endedAt&&time(s.endedAt)<time(s.startedAt)||s.endedAt&&time(s.updatedAt)<time(s.endedAt)||s.pausedAt&&time(s.pausedAt)>time(s.updatedAt))err('SESSION_TIMING',s.id,'時刻の逆転');
    if(exam?.mode==='practice'&&s.deadlineAt&&time(s.deadlineAt)-time(s.startedAt)!==exam.timeLimitSeconds*1000)err('SESSION_TIMING',s.id,'開始時刻と制限時間の不一致');
    if(s.status==='expired'&&(!s.deadlineAt||s.endedAt!==s.deadlineAt))err('SESSION_TIMING',s.id,'時間切れの終了時刻');
    if(time(s.expiresAt)-time(s.updatedAt)!==180*86400000)err('SESSION_RETENTION',s.id,'保存期限は180日');
    if(exam?.quotas){const qs=s.entries.map(e=>byKind.question?.get(qkey(e.questionRef)));for(const [area,count] of Object.entries(exam.quotas))if(qs.filter(q=>q?.learning.area===area).length!==count)err('SESSION_QUOTA',s.id,area);}
  }
  for(const r of byKind.result?.values() || []) {
    const s=get('session',r.sessionId,r.id,'RESULT_REF');
    if(s){if(!['completed','expired','invalidated'].includes(s.status)||s.revision!==r.sessionRevision)err('RESULT_STATE',r.id,'未完了又は保存版の不一致');if(s.status==='invalidated'&&r.validity!=='invalidated')err('RESULT_STATE',r.id,'無効セッションの結果を有効として表示');if(!same(r.entries.map(e=>[e.questionRef,e.generatedInstanceId||'']),s.entries.map(e=>[e.questionRef,e.generatedInstanceId||''])))err('RESULT_REF',r.id,'当時の問題・生成結果の参照不一致');if(r.revealedCount!==s.entries.filter(e=>e.revealed).length)err('RESULT_TOTAL',r.id,'正答表示履歴数不一致');}
    if(r.total!==r.entries.length||r.correct+r.incorrect+r.unanswered!==r.total)err('RESULT_TOTAL',r.id,'件数合計の不一致');
    for(const [key,outcome] of [['correct','correct'],['incorrect','incorrect'],['unanswered','unanswered']])if(r[key]!==r.entries.filter(e=>e.outcome===outcome).length)err('RESULT_TOTAL',r.id,'内訳不一致');
    // 正答選択肢との比較や採点計算はしない。記録済み内訳の算術整合のみ。
    if(Math.abs(r.learningAccuracyPercent-Math.round(1000*r.correct/r.total)/10)>0.00001)err('RESULT_TOTAL',r.id,'表示割合の算術不一致');
  }
  return errors;
}

const errors=validateBundle(records);
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exit(1);}
console.log(`有効サンプル: ${records.length}件、JSON Schema ${schemas.length}件と参照・数式入力・図・出題経路と改変表示の保存・生成記録・状態・配布境界の検証に成功`);
// メモリ内だけの候補で、内容や履歴から宣言値を推定しないことを確認する。
// 配布用問題を作成せず、この確認を原本照合や生成器の動作検証と扱わない。
function refreezeCandidate(candidate) {
  const cat=candidate.find(r=>r.kind==='catalog');
  for(const r of candidate)if(Object.keys(kindOf).some(dir=>r.path.startsWith(`${dir}/`)))r.rawHash=sha(JSON.stringify(r.data));
  for(const files of Object.values(cat.data.files))for(const file of files)file.sha256=candidate.find(r=>r.path===file.path).rawHash;
  cat.rawHash=sha(JSON.stringify(cat.data));
  for(const r of candidate.filter(r=>r.kind==='instance'))r.data.contentSha256=contentHash(r.data.question);
  for(const {data:s}of candidate.filter(r=>r.kind==='session')) {
    s.snapshot.catalogSha256=cat.rawHash;
    for(const entry of s.entries) {
      const q=entry.generatedInstanceId
        ? candidate.find(r=>r.kind==='instance'&&r.data.id===entry.generatedInstanceId).data.question
        : candidate.find(r=>r.kind==='question'&&r.data.id===entry.questionRef.questionId&&r.data.revision===entry.questionRef.revision).data;
      entry.issuedContent={bindingPerformed:Boolean(entry.generatedInstanceId),isModified:q.origin.isModified,originKind:q.origin.kind,contentSha256:contentHash(q)};
    }
  }
}
for(const [name,edit]of [
  ['履歴種別から改変有無を逆算しない',candidate=>{
    const q=candidate.find(r=>r.path==='questions/adapted.json').data;
    q.origin.changes.forEach(c=>{c.kind='layout';});
  }],
  ['基準値と同じバインドでも出題経路から改変ありを保持',candidate=>{
    const i=candidate.find(r=>r.kind==='instance').data;
    const base=candidate.find(r=>r.kind==='question'&&r.data.id===i.baseQuestionRef.questionId).data;
    const t=candidate.find(r=>r.kind==='template'&&r.data.id===i.templateRef.id).data;
    const id=i.question.id;
    i.parameters=structuredClone(t.referenceParameters);
    i.question=structuredClone(base);i.question.id=id;
    i.question.origin.derivedFrom=[structuredClone(i.baseQuestionRef)];
    Object.assign(i.question.origin,{isModified:true,modificationBasis:t.bindingBasis});
    i.question.origin.changes.push({at:i.createdAt,actorId:t.editorIds[0],kind:'numbers',summary:'テンプレートへ基準値をバインド',details:'基準配列[3,5,2]をバインドした経路を記録し、改変ありとして保持する検証用候補。生成器は実行していない。',affectsAnswer:false});
  }]
]) {
  const candidate=structuredClone(records);edit(candidate);refreezeCandidate(candidate);
  const errors=validateBundle(candidate);
  if(errors.length)throw Error(`${name}: ${JSON.stringify(errors)}`);
  console.log(`改変表示: ${name}`);
}
// 既存の固定JSONを手入力の交換例として組み合わせる。生成器は実行しない。
// 一つの基準問題から異なる入力の二枠を保存する場合の参照規則を確認する。
{
  const candidate=structuredClone(records),cat=candidate.find(r=>r.kind==='catalog').data;
  const session=candidate.find(r=>r.path==='sessions/generated-study.json').data;
  const set=candidate.find(r=>r.kind==='set'&&r.data.id===session.setRef.id).data;
  const examRecord=structuredClone(candidate.find(r=>r.kind==='exam'&&r.data.id===session.examConfigRef.id));
  examRecord.path='exams/mix-validation-example.json';
  Object.assign(examRecord.data,{id:'exam-mix-validation-example',questionCount:2,questionOrder:'shuffle',duplicatePolicy:'instance_unique'});
  candidate.push(examRecord);cat.files.exams.push({path:examRecord.path,sha256:'0'.repeat(64)});
  session.examConfigRef={id:examRecord.data.id,revision:examRecord.data.revision};set.examConfigRefs.push(structuredClone(session.examConfigRef));
  const first=candidate.find(r=>r.kind==='instance'&&r.data.sessionId===session.id);
  const second=structuredClone(first),t=candidate.find(r=>r.kind==='template'&&r.data.id===first.data.templateRef.id).data;
  const base=candidate.find(r=>r.kind==='question'&&r.data.id===first.data.baseQuestionRef.questionId).data;
  second.path='instances/mix-validation-example.json';
  Object.assign(second.data,{id:'instance-mix-validation-example',entryIndex:1,parameters:structuredClone(t.referenceParameters),question:structuredClone(base)});
  second.data.question.id=`question-${second.data.id}`;
  Object.assign(second.data.question.origin,{isModified:true,modificationBasis:t.bindingBasis,derivedFrom:[structuredClone(second.data.baseQuestionRef)]});
  second.data.question.origin.changes.push({at:second.data.createdAt,actorId:t.editorIds[0],kind:'numbers',summary:'基準入力をバインドした交換例',details:'元の固定例を手入力で組み合わせた二枠目。生成器は実行していない。',affectsAnswer:false});
  candidate.push(second);
  const entry=structuredClone(session.entries[0]);entry.generatedInstanceId=second.data.id;session.entries.push(entry);
  const result=candidate.find(r=>r.kind==='result'&&r.data.sessionId===session.id)?.data;
  if(result){result.total=2;result.correct=2;result.learningAccuracyPercent=100;result.entries.push({...structuredClone(result.entries[0]),generatedInstanceId:second.data.id,questionRef:structuredClone(entry.questionRef)});}
  refreezeCandidate(candidate);
  const errors=validateBundle(candidate);if(errors.length)throw Error(`異なる入力の生成二枠: ${JSON.stringify(errors)}`);
  const duplicate=structuredClone(candidate);
  duplicate.find(r=>r.path===second.path).data.parameters=structuredClone(first.data.parameters);
  refreezeCandidate(duplicate);
  if(!validateBundle(duplicate).some(e=>e.code==='SESSION_DUPLICATE'))throw Error('同じ入力の生成二枠を拒否できない');
  const missing=structuredClone(candidate);
  delete missing.find(r=>r.kind==='session'&&r.data.id===session.id).data.entries[1].generatedInstanceId;
  refreezeCandidate(missing);
  if(!validateBundle(missing).some(e=>e.code==='BINDING_RECORD'))throw Error('生成ミックスの未生成枠を拒否できない');
  console.log('生成枠: 同系列の別入力を受理し、同じ入力の重複・未生成枠を拒否');
}
const cases=read(path.join(base,'invalid/cases.json'));
for(const test of cases) {
  const candidate=structuredClone(records);
  const target=candidate.find(r=>r.path===test.target);
  if(!target)throw Error(`不正例の対象なし: ${test.target}`);
  for(const op of test.operations) {
    if(op.op==='duplicate'){candidate.push(structuredClone(target));continue;}
    const parts=op.path.split('/').slice(1).map(p=>p.replaceAll('~1','/').replaceAll('~0','~'));
    let object=target.data;
    for(const part of parts.slice(0,-1))object=object[part];
    const key=parts.at(-1);
    if(op.op==='remove'){if(Array.isArray(object))object.splice(Number(key),1);else delete object[key];}
    else if(op.op==='replace')object[key]=op.value;
    else throw Error(`未知の不正例操作: ${op.op}`);
  }
  const actual=validateBundle(candidate);
  if(!actual.some(e=>e.code===test.expectedCode))throw Error(`${test.id}: 期待 ${test.expectedCode}、実際 ${JSON.stringify(actual)}`);
  console.log(`拒否: ${test.id} → ${test.expectedCode}`);
}
console.log(`不正例: ${cases.length}件すべてを意図した規則で拒否（適法性・内容の正しさの保証ではありません）`);
