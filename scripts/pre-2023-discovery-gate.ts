import { createHash } from 'node:crypto';

export class DiscoveryGateError extends Error {
  constructor(public readonly code: string, detail: string) { super(detail); this.name = 'DiscoveryGateError'; }
}
function fail(detail: string): never { throw new DiscoveryGateError('DISCOVERY_SCOPE', detail); }
function assert(ok: unknown, detail: string): asserts ok { if (!ok) fail(detail); }
function snapshot(value: unknown, parents = new Set<object>()): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return value;
  assert(value && typeof value === 'object' && !parents.has(value), 'lossless JSON data required');
  const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
  assert(proto === (array ? Array.prototype : Object.prototype) || proto === null, 'plain data required');
  parents.add(value);
  const out: Record<string, unknown> | unknown[] = array ? [] : {};
  const names = Reflect.ownKeys(value), length = array ? Object.getOwnPropertyDescriptor(value, 'length')!.value as number : 0;
  if (array) assert(names.length === length + 1 && Array.from({ length }, (_, i) => Object.hasOwn(value, i)).every(Boolean), 'dense array required');
  for (const name of names) {
    if (array && name === 'length') continue;
    const d = Object.getOwnPropertyDescriptor(value, name)!;
    assert(typeof name === 'string' && d.enumerable && 'value' in d, 'enumerable data properties required');
    assert(!array || /^(0|[1-9]\d*)$/.test(name), 'array properties not allowed');
    Object.defineProperty(out, name, { value: snapshot(d.value, parents), enumerable: true, writable: true, configurable: true });
  }
  parents.delete(value); return out;
}
function object(value: unknown, names: readonly string[]): Record<string, unknown> {
  assert(value && typeof value === 'object' && !Array.isArray(value), 'object required');
  const keys = Object.keys(value).sort();
  assert(JSON.stringify(keys) === JSON.stringify([...names].sort()), `exact keys required: ${names.join(',')}`);
  return value as Record<string, unknown>;
}
function list(value: unknown): unknown[] { assert(Array.isArray(value), 'array required'); return value; }
function text(value: unknown): string { assert(typeof value === 'string' && value.length > 0, 'nonempty string required'); return value; }
function strings(value: unknown): string[] { return list(value).map(text); }
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const known = Array.from({ length: 5 }, (_, i) => 2004 + i).flatMap(year => ['h','a'].flatMap(period => ['am','pm'].map(slot => `${year}h${year-1988}${period}-fe-${slot}`))).sort();
const remaining = ['full_pdf_identity_and_count', 'official_answers', 'individual_material_rights', 'inventory_scope'];
const requiredBoundaries = ['fe-before-2004', 'predecessor-systems'];
type ListedIdentity = { id: string; listedAt: string; questionHref: string; answerHref: string };
export type DiscoveryGateReport = {
  status: 'pending_source_scope_review'; ready: boolean;
  listedCollections: number; listedQuestionAndAnswerLinks: number; confirmedQuestionUnits: null;
  pendingCollections: string[]; pendingBoundaries: string[]; identitySha256: string;
  note: string;
};
/** Offline evidence validation, not PDF acquisition, material permission or
 * registration. This initial gate intentionally admits no resolved/excluded
 * state: all newly listed originals still require a source-scope review. */
export function auditPre2023Discovery(input: unknown): DiscoveryGateReport {
  const d = object(snapshot(input), ['checkedOn','status','distribution','discovery','archiveInstitutionRecord','originalPublisher','officialArchiveHost','listedYears','listedQuestionCollections','listedQuestionAndAnswerLinks','fullPDFCountOrKeysInspected','questionUnitsConfirmed','newQuestionsRegistered','yearListings','parentProofs','ownerDiscovery','rightsBoundary','openWork','readinessGateImplementation','limits','scopeDiscovery']);
  const date = text(d.checkedOn);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date+'T00:00:00Z')) && new Date(date+'T00:00:00Z').toISOString().startsWith(date), 'checkedOn date');
  assert(d.status === 'pending_source_scope_review_not_import_or_release_approval' && d.distribution === 'excluded', 'discovery is pending research, not an exclusion from requested scope');
  assert(d.fullPDFCountOrKeysInspected === 0 && d.questionUnitsConfirmed === null && d.newQuestionsRegistered === 0, 'listing discovery cannot claim inspected PDFs, zero unknown units or registrations');
  assert(d.readinessGateImplementation === 'implemented_fail_closed_pending_source_scope_review', 'gate implementation state');
  text(d.discovery); text(d.originalPublisher);
  assert(d.archiveInstitutionRecord === 'https://warp.ndl.go.jp/waid/10252' && d.officialArchiveHost === 'www.jitec.ipa.go.jp', 'reviewed preservation identity');
  assert(strings(d.openWork).length > 0 && strings(d.limits).length > 0, 'research limits required');
  const yearSet = new Set<number>(), identities: ListedIdentity[] = [];
  for (const value of list(d.yearListings)) {
    const year = object(value, ['year','title','archivedOfficialYearPage','links']), n = year.year;
    assert(typeof n === 'number' && Number.isSafeInteger(n) && n >= 1989 && n < 2023 && !yearSet.has(n), 'unique FE listing year required');
    yearSet.add(n); text(year.title);
    const listedAt = text(year.archivedOfficialYearPage);
    assert(new RegExp(`^https://warp\\.ndl\\.go\\.jp/\\d{8}/\\d{14}/http://www\\.jitec\\.ipa\\.go\\.jp/1_04hanni_sukiru/mondai_kaitou_${n}h${n-1988}\\.html$`).test(listedAt), 'reviewed archived official year page required');
    const papers = new Map<string, { qs?: string; ans?: string }>();
    for (const item of list(year.links)) {
      const link = object(item, ['href','label']), href = text(link.href);
      const match = /^mondai_kaitou_(\d{4})h(\d+)_(1|2)\/(\d{4})h(\d+)(h|a)_fe_(am|pm)_(qs|ans)\.pdf$/.exec(href);
      assert(match && Number(match[1]) === n && Number(match[4]) === n && Number(match[2]) === n-1988 && Number(match[5]) === n-1988 && match[3] === (match[6] === 'h' ? '1' : '2'), 'question/answer year, period, exam and slot identity');
      const id = `${n}h${n-1988}${match[6]}-fe-${match[7]}`, kind = match[8] as 'qs'|'ans';
      assert(link.label === (kind === 'qs' ? '問題' : '解答'), 'question/answer label role');
      const pair = papers.get(id) ?? {};
      assert(!pair[kind], 'duplicate question/answer link'); pair[kind] = href; papers.set(id, pair);
    }
    assert(papers.size > 0, 'each listed year requires explicit question/answer investigations');
    for (const [id, pair] of papers) { assert(pair.qs && pair.ans, 'paired question and official answer links required'); identities.push({ id, listedAt, questionHref: pair.qs, answerHref: pair.ans }); }
  }
  identities.sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const ids = identities.map(r => r.id);
  assert(new Set(ids).size === ids.length && known.every(id => ids.includes(id)), 'all twenty independently confirmed booklet identities must remain');
  assert(same(d.listedYears, [...yearSet].sort((a,b)=>a-b)), 'listed years must match actual listings');
  assert(d.listedQuestionCollections === ids.length && d.listedQuestionAndAnswerLinks === ids.length*2, 'listing counts must match links, not inferred question units');
  const scope = object(d.scopeDiscovery, ['schemaVersion','status','identitySha256','booklets','boundaries','requiresSourceAndMaterialReview']);
  assert(scope.schemaVersion === 1 && scope.status === 'pending' && scope.requiresSourceAndMaterialReview === true, 'source/material investigation remains pending');
  const digest = createHash('sha256').update(JSON.stringify(identities), 'utf8').digest('hex');
  assert(scope.identitySha256 === digest, 'stale or changed listing identity digest');
  const states = list(scope.booklets).map(value => {
    const row = object(value, ['id','status','questionUnitsConfirmed','remaining']);
    assert(row.status === 'pending' && row.questionUnitsConfirmed === null && same(row.remaining, remaining), 'booklet content/answers/materials/scope are unreviewed'); return text(row.id);
  });
  assert(same(states, ids), 'one explicit pending investigation per listing, in canonical identity order');
  const boundaries = list(scope.boundaries).map(value => {
    const row = object(value, ['id','status','finding']); assert(row.status === 'pending', 'earlier/predecessor publication is not declared nonexistent'); text(row.finding); return text(row.id);
  });
  assert(new Set(boundaries).size === boundaries.length && requiredBoundaries.every(id => boundaries.includes(id)), 'earlier/predecessor investigation boundaries required');
  // These provenance data do not grant a promotion to a material/content pass.
  const proofs=list(d.parentProofs);assert(proofs.length>=2,'discovery provenance required');
  for (const value of proofs) { const p=object(value,['path','sha256']);text(p.path);assert(/^[a-f0-9]{64}$/.test(text(p.sha256)), 'parent proof digest'); }
  const owner=object(d.ownerDiscovery,['path','sha256','pins','representativePDFPrefixesOnly','fullPDFHashClaimed']);text(owner.path);assert(/^[a-f0-9]{64}$/.test(text(owner.sha256))&&owner.fullPDFHashClaimed===false&&typeof owner.pins==='number'&&Number.isSafeInteger(owner.pins)&&owner.pins>0&&typeof owner.representativePDFPrefixesOnly==='number'&&Number.isSafeInteger(owner.representativePDFPrefixesOnly)&&owner.representativePDFPrefixesOnly>=0,'bounded listing provenance without full PDF hash claim');
  const rights=object(d.rightsBoundary,['IPAFAQ','NDLHelp','finding']);text(rights.IPAFAQ);text(rights.NDLHelp);text(rights.finding);
  return { status:'pending_source_scope_review',ready:false,listedCollections:ids.length,listedQuestionAndAnswerLinks:ids.length*2,confirmedQuestionUnits:null,pendingCollections:[...ids],pendingBoundaries:[...boundaries],identitySha256:digest,
    note:'リンク確認は全文・問数・正答・素材・配布の承認ではない。現在列挙分へ未知の問数を足さず、追加の調査が未完了の間は配布判定を完了しない。' };
}
/** The expansion can pass only when both enumerated per-question review and
 * independent scope discovery are complete. A future toy scope-ready flag is
 * not a replacement for actual question/material readiness. */
export function finalizePre2023Readiness(enumeratedReady: boolean, capacityOK: boolean, discovery: Pick<DiscoveryGateReport,'ready'>): 'ready'|'not_ready' {
  return enumeratedReady && capacityOK && discovery.ready ? 'ready' : 'not_ready';
}
